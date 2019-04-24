/* eslint-env mocha, browser */
/* global proclaim */

describe('IdleDeadline', function () {

    it('is defined as a function', function () {
        proclaim.isTypeOf(IdleDeadline, 'function');
    });

    it('throws a type type error when used as a constructor', function () {
        proclaim.throws(function () {
            new IdleDeadline();
        }, TypeError);
    });

    // the prototype didTimeout method should be a getter which throws a type
    // error, except where getters aren't supported return undefined.
    it('has a didTimeout prototype property which throws a type error when getters are supported or undefined otherwise', function () {
        if (Object.prototype.hasOwnProperty('__defineGetter__')) {
            proclaim.throws(function () {
                return IdleDeadline.prototype.didTimeout;
            }, TypeError);
        } else {
            proclaim.equal(IdleDeadline.prototype.didTimeout, undefined);
        }
    });

    it('has a timeRemaining prototype function which throws a type error', function () {
        proclaim.isTypeOf(IdleDeadline.prototype.timeRemaining, 'function');
        proclaim.throws(IdleDeadline.prototype.timeRemaining, TypeError);
    });

});

describe('requestIdleCallback', function () {

    function sleep(busyFor) {
        busyFor = busyFor + Math.random(); // Prevent Safari while loop optimisation.
        var start = performance.now();
        while (performance.now() - start < busyFor) {
        }
    }

    it('is defined', function () {
        proclaim.isTypeOf(window.requestIdleCallback, 'function');
    });

    it('should return a callback identifier number of "1"', function () {
        var callbackIdentifier = requestIdleCallback(function () { });
        proclaim.isTypeOf(callbackIdentifier, 'number');
        proclaim.equal(callbackIdentifier, 1);
    });

    it('should increment the callback identifier', function () {
        var firstCallbackIdentifier = requestIdleCallback(function () { });
        proclaim.equal(
            requestIdleCallback(function () { }),
            firstCallbackIdentifier + 1
        );
    });

    it('schedules a callback with one IdleDeadline argument passed to the callback', function (done) {
        requestIdleCallback(function (deadline) {
            proclaim.equal(
                arguments.length,
                1,
                'Expected the callback to receive one argument.'
            );

            proclaim.isTrue(deadline instanceof IdleDeadline);

            proclaim.isTypeOf(
                deadline.timeRemaining,
                'function',
                'Expected the callback argument to have a "timeRemaining" function.'
            );
            var timeRemaining = deadline.timeRemaining();
            proclaim.isTypeOf(
                timeRemaining,
                'number',
                'Expected the "timeRemaining" function to return a number (the remaining frame time in milliseconds).'
            );
            proclaim.lessThanOrEqual(
                Math.floor(timeRemaining),
                50,
                'Expected the "timeRemaining" to be less than or equal to 50 but found "' + timeRemaining + '".'
            );
            proclaim.isTypeOf(
                deadline.didTimeout,
                'boolean',
                'Expected the callback argument to have a  boolean "didTimeout" property.'
            );
            done();
        });
    });

    it('schedules multiple callbacks', function (done) {
        var a = 0;
        var testTimeout = setTimeout(function () {
            done(new Error('Expected two "requestIdleCallback" callbacks to have run.'));
        }, 500);
        var incrementA = function () {
            a = a + 1;
            // Expect "incrementA" to be called twice.
            if (a === 2) {
                clearTimeout(testTimeout);
                done();
            }
        };
        requestIdleCallback(incrementA);
        requestIdleCallback(incrementA);
    });

    it('schedules callbacks when requestAnimationFrame is suspended', function (done) {
        // Remove `requestAnimationFrame` so it cannot be relied on
        // to schedule idle callbacks. For example, if the browser is minimised
        // `requestAnimationFrame` might not be called.
        var requestAnimationFrameBackup = window.requestAnimationFrame;
        window.requestAnimationFrame = function(){};

        var testTimeout = setTimeout(function () {
            window.requestAnimationFrame = requestAnimationFrameBackup;
            done(new Error('Expected "requestIdleCallback" callback to have run.'));
        }, 500);

        requestIdleCallback(function () {
            window.requestAnimationFrame = requestAnimationFrameBackup;
            clearTimeout(testTimeout);
            done();
        });
    });

    it('scheduled callbacks are called in order', function (done) {
        var a = 0;
        var end = 10;
        var assertIncrement = function (i) {
            proclaim.equal(a, i);
            a = a + 1;
            if(end == i) {
                done();
            }
        };

        var createIdleCallback = function (i) {
            requestIdleCallback(function () {
                assertIncrement(i);
            });
        };

        for (var i = 0; i <= end; i++) {
            createIdleCallback(i);
        }
    });

    it('schedules callbacks with an expired timeout first regardless of order', function (done) {
        var a = 0;
        var busyFor = 40;
        var timeout = 20;

        requestIdleCallback(function () {
            a = 1;
        });

        // Although scheduled second, this should run first due to its timeout.
        requestIdleCallback(function () {
            proclaim.equal(a, 0);
            done();
        }, { timeout: timeout });

        requestIdleCallback(function () {
            a = 2;
        });

        // Keep the event loop busy.
        sleep(busyFor);
    });

    it('schedules callbacks with an expired timeout in order of their timeout', function (done) {
        var a = 0;
        var busyFor = 40;
        var timeout = 20;

        // Should run first, as its timeout expires first.
        requestIdleCallback(function () {
            a++;
        }, { timeout: timeout + 1 });

        // Should run last, as its timeout expires last.
        requestIdleCallback(function () {
            a++;
            proclaim.equal(a, 3);
            done();
        }, { timeout: timeout + 3 });

        // Should run second, as its timeout expires second.
        requestIdleCallback(function () {
            a++;
        }, { timeout: timeout + 2 });

        // Keep the event loop busy.
        sleep(busyFor);
    });

    it('schedules nested callbacks to run in different idle periods', function (done) {
        requestIdleCallback(function () {
            var firstRafTime;
            requestAnimationFrame(function (rafTime) {
                firstRafTime = rafTime;
            });
            requestIdleCallback(function () {
                requestAnimationFrame(function (rafTime) {
                    proclaim.isTypeOf(firstRafTime, 'number');
                    proclaim.greaterThan(rafTime, firstRafTime);
                    done();
                });
            });
        });
    });

    it('schedules a callback for the next idle period when the event loop is busy', function (done) {
        var idleCallbackRun = false;

        // First idle callback, takes >= 40ms.
        requestIdleCallback(function () {
            // This callback will take more than one frame, so assert the
            // second idle callback is not run within the same idle period.
            requestAnimationFrame(function () {
                if (idleCallbackRun) {
                    done(new Error('The second idle callback was run in a long running frame.'));
                } else {
                    done();
                }
            });
            // Keep the even loop busy, missing an animation frame or two.
            sleep(40);
        });

        // Second callback.
        requestIdleCallback(function () {
            idleCallbackRun = true;
        });
    });

    it('schedules a callback for the same idle period when the event loop is busy but the callbacks\'s timeout has expired', function (done) {
        var idleCallbackRun = false;
        var timeout = 50;

        // First idle callback.
        requestIdleCallback(function () {
            // The second callback's timeout is expired by now, so assert it is
            // run within the same idle period (regardless of performance due to
            // overrunning the frame deadline).
            requestAnimationFrame(function () {
                if (idleCallbackRun) {
                    done();
                } else {
                    done(new Error('The second idle callback was not run, even though its timeout had expired.'));
                }
            });
        });

        // Second callback.
        requestIdleCallback(function () {
            idleCallbackRun = true;
        }, { timeout: timeout });

        // Keep the even loop busy, missing an animation frame or two.
        // The second idle callback's timeout will expire.
        sleep(100);
    });

    it('sets the callback\'s deadline "didTimeout" property to true when the callback\'s timeout is exceeded', function (done) {
        var timeout = 25;
        var busyFor = 50;

        requestIdleCallback(function (deadline) {
            proclaim.isTrue(deadline.didTimeout);
            done();
        }, { timeout: timeout });

        // Keep the even loop busy so the idle callback's timeout expires.
        sleep(busyFor);
    });

    it('sets the callback\'s deadline "didTimeout" property to false when the callback\'s timeout is not exceeded or set', function (done) {
        var timeout = 300;
        var busyFor = 50;

        requestIdleCallback(function (deadline) {
            proclaim.isFalse(deadline.didTimeout);
        }, { timeout: timeout });

        requestIdleCallback(function (deadline) {
            proclaim.isFalse(deadline.didTimeout);
            done();
        });

        // Keep the even loop busy but not longer than the timeout.
        sleep(busyFor);
    });
});

describe.skip('cancelIdleCallback', function () {
    it.skip('is defined"', function () {
        proclaim.isTypeOf(window.cancelIdleCallback, 'function');
    });

    it.skip('should return undefined', function () {
        proclaim.equal(cancelIdleCallback(), undefined);
    });

    it.skip('cancels an idle callback', function (done) {
        var callback = requestIdleCallback(function () {
            done(new Error('The canceled idle callback should not be called.'));
        });
        cancelIdleCallback(callback);
        setTimeout(function () {
            done();
        }, 200);
    });

    it.skip('does nothing if there is no idle callback to cancel', function () {
        // Try to cancel with a random number that doesn't match a idle callback id.
        cancelIdleCallback(Math.round(Math.random() * 100000));
    });

    it.skip('does nothing if the idle callback to cancel is executing', function (done) {
        var handle = requestIdleCallback(function () {
            cancelIdleCallback(handle);
            done(); //Should reach this point. The test will timeout if not.
        });
    });
});
