/* global ToNumber */
(function () {
	// The longest delay that setTimeout supports, as browsers fire longer ones right away:
	var MAX_DELAY = 2147483647;

	function createTimeoutError() {
		try {
			return new DOMException("signal timed out", "TimeoutError");
		} catch (error) {
			// Browsers that can't construct a DOMException get an Error of the same name:
			var timeoutError = new Error("signal timed out");
			timeoutError.name = "TimeoutError";
			return timeoutError;
		}
	}

	// https://dom.spec.whatwg.org/#dom-abortsignal-timeout
	// Browsers without abort reasons abort the signal without its TimeoutError, and the timer doesn't pause while the document is inactive.
	AbortSignal.timeout = function timeout(milliseconds) {
		// Convert milliseconds to an [EnforceRange] unsigned long long:
		var ms = ToNumber(milliseconds);
		if (ms !== ms || ms === Infinity || ms === -Infinity) {
			throw new TypeError("Failed to execute 'timeout' on 'AbortSignal': Value is not a finite number.");
		}
		ms = ms < 0 ? Math.ceil(ms) : Math.floor(ms);
		if (ms < 0 || ms > 9007199254740991) {
			throw new TypeError("Failed to execute 'timeout' on 'AbortSignal': Value is outside the 'unsigned long long' value range.");
		}
		// 1. Let signal be a new AbortSignal object.
		var controller = new AbortController();
		// 2. Let global be signal's relevant global object.
		// 3. Run steps after a timeout given global, "AbortSignal-timeout", milliseconds, and the following step:
		// a. Queue a global task on the timer task source given global to signal abort given signal and a new "TimeoutError" DOMException.
		(function wait(remaining) {
			var delay = Math.min(remaining, MAX_DELAY);
			setTimeout(function () {
				if (remaining > delay) {
					wait(remaining - delay);
				} else {
					controller.abort(createTimeoutError());
				}
			}, delay);
		})(ms);
		// 4. Return signal.
		return controller.signal;
	};
})();
