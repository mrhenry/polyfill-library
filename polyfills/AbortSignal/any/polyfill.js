/* global GetIterator, IteratorStepValue, Type */
(function () {
	// The getter of `aborted` doubles as the brand check for AbortSignal objects, as it throws a TypeError for others.
	var getAborted = Object.getOwnPropertyDescriptor(AbortSignal.prototype, "aborted").get;

	// https://dom.spec.whatwg.org/#dom-abortsignal-any
	// Browsers without abort reasons abort the signal without its reason. Unlike in the spec, the dependent signal aborts from within the abort event of its source, and the sources keep it alive, as there are no weak references.
	AbortSignal.any = function any(signals) {
		// Convert signals to a sequence<AbortSignal>:
		if (Type(signals) !== "object") {
			throw new TypeError("Failed to execute 'any' on 'AbortSignal': The provided value cannot be converted to a sequence.");
		}
		var iteratorRecord = GetIterator(signals);
		var sources = [];
		var next;
		while ((next = IteratorStepValue(iteratorRecord)) !== IteratorStepValue.DONE) {
			try {
				getAborted.call(next);
			} catch (error) {
				throw new TypeError("Failed to execute 'any' on 'AbortSignal': Failed to convert value to 'AbortSignal'.");
			}
			sources.push(next);
		}
		// https://dom.spec.whatwg.org/#create-a-dependent-abort-signal
		// 1. Let resultSignal be a new object implementing signalInterface using realm.
		var controller = new AbortController();
		// 2. For each signal of signals: if signal is aborted, then set resultSignal's abort reason to signal's abort reason and return resultSignal.
		for (var i = 0; i < sources.length; i++) {
			if (sources[i].aborted) {
				controller.abort(sources[i].reason);
				return controller.signal;
			}
		}
		// 3. Set resultSignal's dependent to true.
		// 4. For each signal of signals: append signal to resultSignal's source signals, and resultSignal to signal's dependent signals.
		// When any of them aborts, abort resultSignal with its reason, once:
		function onAbort() {
			for (var i = 0; i < sources.length; i++) {
				sources[i].removeEventListener("abort", onAbort);
			}
			if (!controller.signal.aborted) {
				controller.abort(this.reason);
			}
		}
		for (var j = 0; j < sources.length; j++) {
			sources[j].addEventListener("abort", onAbort);
		}
		// 5. Return resultSignal.
		return controller.signal;
	};
})();
