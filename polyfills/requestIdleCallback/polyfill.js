(function (global) {

    // The requestIdleCallback polyfill builds on ReactScheduler, which
    // calculates the browser's framerate and seperates the idle call into a
    // seperate tick:
    // "It works by scheduling a requestAnimationFrame, storing the time for the
    // start of the frame, then scheduling a postMessage which gets scheduled
    // after paint. Within the postMessage handler do as much work as possible
    // until time + frame rate. By separating the idle call into a separate
    // event tick we ensure that layout, paint and other browser work is counted
    // against the available time. The frame rate is dynamically adjusted."
    // https://github.com/facebook/react/blob/43a137d9c13064b530d95ba51138ec1607de2c99/packages/react-scheduler/src/ReactScheduler.js

    // MIT License
    //
    // Copyright (c) 2013-present, Facebook, Inc.
    //
    // Permission is hereby granted, free of charge, to any person obtaining a copy
    // of this software and associated documentation files (the "Software"), to deal
    // in the Software without restriction, including without limitation the rights
    // to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    // copies of the Software, and to permit persons to whom the Software is
    // furnished to do so, subject to the following conditions:
    //
    // The above copyright notice and this permission notice shall be included in all
    // copies or substantial portions of the Software.
    //
    // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    // IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    // FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    // AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    // LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    // OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    // SOFTWARE.

    var idleCallbackIdentifier = 0;
    var scheduledCallbacks = [];
    var nestedCallbacks = [];

    var isIdleScheduled = false;
    var isCallbackRunning = false;
    var isAnimationFrameScheduled = false;

    var frameDeadline = 0;

    var messageKey = 'polyfillIdleCallback' + Math.random().toString(36).slice(2);

    // We start out assuming that we run at 33fps but then the heuristic
    // tracking will adjust this value to a faster fps if we get more frequent
    // animation frames.
    var previousFrameTime = 33;
    var activeFrameTime = 33;

    function timeRemaining() {
        return frameDeadline - performance.now();
    };

    function getDeadline(callbackObject) {
        var timeout = callbackObject.options.timeout;
        var added = callbackObject.added;
        return {
            timeRemaining: timeRemaining,
            didTimeout: timeout ? added + timeout < performance.now() : false
        };
    };

    function runCallback(callbackObject) {
        var deadline = getDeadline(callbackObject);
        var callback = callbackObject.callback;
        callback(deadline);
    };

    function scheduleAnimationFrame() {
        if (!isAnimationFrameScheduled) {
            isAnimationFrameScheduled = true;
            // Schedule a frame.
            // TODO: If this rAF doesn't materialize because the browser throttles, we
            // might want to still have setTimeout trigger rIC as a backup to ensure
            // that we keep performing work.
            requestAnimationFrame(function (rafTime) {
                isAnimationFrameScheduled = false;
                var nextFrameTime = rafTime - frameDeadline + activeFrameTime;
                if (nextFrameTime < activeFrameTime && previousFrameTime < activeFrameTime) {
                    if (nextFrameTime < 8) {
                        // Defensive coding. We don't support higher frame rates than 120hz.
                        // If we get lower than that, it is probably a bug.
                        nextFrameTime = 8;
                    }
                    // If one frame goes long, then the next one can be short to catch up.
                    // If two frames are short in a row, then that's an indication that we
                    // actually have a higher frame rate than what we're currently optimizing.
                    // We adjust our heuristic dynamically accordingly. For example, if we're
                    // running on 120hz display or 90hz VR display.
                    // Take the max of the two in case one of them was an anomaly due to
                    // missed frame deadlines.
                    activeFrameTime = Math.max(previousFrameTime, nextFrameTime);
                } else {
                    previousFrameTime = nextFrameTime;
                }
                frameDeadline = rafTime + activeFrameTime;
                if (!isIdleScheduled) {
                    isIdleScheduled = true;
                    window.postMessage(messageKey, '*');
                }
            });
        }
    }

    // We use the postMessage trick to defer idle work until after the repaint.
    window.addEventListener('message', function (event) {
        if (event.source !== window || event.data !== messageKey) {
            return;
        }

        isIdleScheduled = false;
        isCallbackRunning = true;

        // Find timed-out callbacks from the scheduled callbacks array.
        var timedOutCallbacks = [];
        for (var index = 0; index < scheduledCallbacks.length; index++) {
            var callbackObject = scheduledCallbacks[index];
            var deadline = getDeadline(callbackObject);
            if (deadline.didTimeout) {
                timedOutCallbacks.push(callbackObject);
            }
        }

        // Of the timed-out callbacks, order by those with the lowest timeout.
        timedOutCallbacks.sort(function (a, b) {
            return a.options.timeout - b.options.timeout;
        });

        // Remove timed-out callbacks from the scheduled callbacks array.
        for (var index = 0; index < timedOutCallbacks.length; index++) {
            var callbackObject = timedOutCallbacks[index];
            var scheduledCallbackIndex = scheduledCallbacks.indexOf(callbackObject);
            if (scheduledCallbackIndex > -1) {
                scheduledCallbacks.splice(scheduledCallbackIndex, 1);
            }
        }

        // Run all timed-out callbacks, regardless of the deadline time
        // remaining.
        while (timedOutCallbacks.length > 0) {
            var callbackObject = timedOutCallbacks.shift();
            runCallback(callbackObject);
        }

        // While there is deadline time remaining, run remaining scheduled
        // callbacks.
        while (scheduledCallbacks.length > 0 && timeRemaining() > 0) {
            var callbackObject = scheduledCallbacks.shift();
            runCallback(callbackObject);
        }

        // Schedule callbacks added during this idle period to run in the next
        // idle period  (nested callbacks).
        if (nestedCallbacks.length > 0) {
            scheduledCallbacks = scheduledCallbacks.concat(nestedCallbacks);
            nestedCallbacks = [];
        }

        // Schedule any remaining callbacks for a future idle period.
        if (scheduledCallbacks.length > 0) {
            scheduleAnimationFrame();
        }

        isCallbackRunning = false;
    }, false);


    /**
     * @param {function} callback
     * @return {number}
     */
    global.requestIdleCallback = function requestIdleCallback(callback, options) {
        // Create an object to store the callback, its options, and the time it
        // was added.
        var callbackObject = {
            callback: callback,
            options: options || {},
            added: performance.now()
        };

        // If an idle callback is running already this is a nested idle callback
        // and should be scheduled for a different period. If no idle callback
        // is running schedule immediately.
        if (isCallbackRunning) {
            nestedCallbacks.push(callbackObject);
        } else {
            scheduledCallbacks.push(callbackObject);
        }

        // Run scheduled idle callbacks after the next animation frame.
        scheduleAnimationFrame();

        // Return the callbacks identifier.
        return ++idleCallbackIdentifier;
    };

}(this));
