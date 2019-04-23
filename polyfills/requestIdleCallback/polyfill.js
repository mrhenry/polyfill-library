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

    var scheduledAnimationFrameId;
    var scheduledAnimationFrameTimeout;

    // We start out assuming that we run at 30fps (1 frame per 33.3ms) but then
    // the heuristic tracking will adjust this value to a faster fps if we get
    // more frequent animation frames.
    var previousFrameTime = 33;
    var activeFrameTime = 33;

    var frameDeadline = 0;

    var port; // The object to `postMessage` on.
    var messageKey;
    var messageChannelSupport = typeof MessageChannel === 'object';

    // We use the postMessage trick to defer idle work until after the repaint.
    if (messageChannelSupport) {
        // Use MessageChannel if supported.
        var messageChannel = new MessageChannel();
        port = messageChannel.port2;
        messageChannel.port1.onmessage = processIdleCallbacks;
    } else {
        // TODO add `MessageChannel` polyfill to polyfill.io.
        // Otherwise fallback to document messaging. It is less efficient as
        // all message event listeners within a project will be called each
        // frame whilst idle callbacks remain.
        messageKey = 'polyfillIdleCallback' + Math.random().toString(36).slice(2);
        port = window;
        window.addEventListener('message', function (event) {
            // IE8 returns true when a strict comparison with `window` is made.
            if (event.source != window || event.data !== messageKey) {
                return;
            }
            processIdleCallbacks();
        });
    }

    function timeRemaining() {
        return frameDeadline - performance.now();
    };

    function getDeadline(callbackObject) {
        var timeout = callbackObject.options.timeout;
        var added = callbackObject.added;
        var deadline = new global.IdleDeadline();
        Object.defineProperty(deadline, 'didTimeout', {
            value: timeout ? added + timeout < performance.now() : false
        });
        Object.defineProperty(deadline, 'timeRemaining', {
            value: timeRemaining
        });
        return deadline;
    };

    function runCallback(callbackObject) {
        var deadline = getDeadline(callbackObject);
        var callback = callbackObject.callback;
        callback(deadline);
    };

    function scheduleIdleWork() {
        if (!isIdleScheduled) {
            isIdleScheduled = true;
            port.postMessage(messageKey, '*');
        }
    }

    function scheduleAnimationFrame() {
        // Schedule animation frame to calculate the browsers framerate.
        if (!scheduledAnimationFrameId) {
            // Request the animation frame.
            scheduledAnimationFrameId = requestAnimationFrame(function (rafTime) {
                // Remove timeout fallback, as the animation frame run successfully.
                scheduledAnimationFrameId = undefined;
                clearTimeout(scheduledAnimationFrameTimeout);
                // Safari 9 gives a `rafTime` far into the future.
                // It appears to be (now + (frame rate) * 2).
                var futureRafTime = rafTime - activeFrameTime > performance.now();
                // Calculate the frame rate.
                var nextFrameTime = futureRafTime ?
                    rafTime - frameDeadline - activeFrameTime :
                    rafTime - frameDeadline + activeFrameTime;
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
                // Update the deadline we have to run idle callbacks.
                frameDeadline = futureRafTime ? rafTime - activeFrameTime : rafTime + activeFrameTime;
                // Schedule idle callback work.
                scheduleIdleWork();
            });

            // If the animation frame is not called, for example if the tab is in the
            // background, schedule work should still be run. So set a timeout as a
            // fallback.
            scheduledAnimationFrameTimeout = setTimeout(function () {
                // Cancel the animation frame which failed to run timely.
                cancelAnimationFrame(scheduledAnimationFrameId);
                scheduledAnimationFrameId = undefined;
                // Update the deadline we have to run idle callbacks.
                frameDeadline = performance.now() + 50;
                // Run callbacks.
                scheduleIdleWork();
            }, 100);
        }
    }

    function processIdleCallbacks () {
        isIdleScheduled = false;
        isCallbackRunning = true;

        // Move timed-out callbacks from the scheduled array.
        var timedOutCallbacks = scheduledCallbacks.reduce(function (timedOutCallbacks, callbackObject, index) {
            var deadline = getDeadline(callbackObject);
            if (deadline.didTimeout) {
                scheduledCallbacks.splice(index, 1); // Remove from scheduled array.
                timedOutCallbacks.push(callbackObject); // Add to timed-out array.
            }
            return timedOutCallbacks;
        }, []);

        // Of the timed-out callbacks, order by those with the lowest timeout.
        timedOutCallbacks.sort(function (a, b) {
            return a.options.timeout - b.options.timeout;
        });

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
    };

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

    global.IdleDeadline = function IdleDeadline() {
        // TODO: how to polyfill illegal constructor?
        // throw new TypeError('Illegal constructor');
    };

    Object.defineProperty(global.IdleDeadline.prototype, 'timeRemaining', {
        value: function() {
            throw new TypeError('Illegal invocation');
        }
    });

    Object.defineProperty(global.IdleDeadline.prototype, 'didTimeout', {
        value: undefined
    });

}(this));
