/* global Symbol */

it("is a function", function () {
	proclaim.isFunction(AbortSignal.any);
});

it("has correct arity", function () {
	proclaim.arity(AbortSignal.any, 1);
});

it("has correct name", function () {
	proclaim.hasName(AbortSignal.any, "any");
});

it("is enumerable", function () {
	proclaim.isEnumerable(AbortSignal, "any");
});

describe("any", function () {
	it("returns a signal that is not aborted for sources that are not", function () {
		var signal = AbortSignal.any([new AbortController().signal, new AbortController().signal]);
		proclaim.isInstanceOf(signal, AbortSignal);
		proclaim.isFalse(signal.aborted);
	});

	it("returns a signal that never aborts for no sources", function () {
		proclaim.isFalse(AbortSignal.any([]).aborted);
	});

	it("returns an aborted signal for a source that is already aborted, with its reason", function () {
		var controller = new AbortController();
		var reason = new Error("aborted");
		controller.abort(reason);
		var signal = AbortSignal.any([new AbortController().signal, controller.signal]);
		proclaim.isTrue(signal.aborted);
		if ("reason" in signal) {
			proclaim.strictEqual(signal.reason, reason);
		}
	});

	it("aborts once, with the reason of the first source to abort", function () {
		var first = new AbortController();
		var second = new AbortController();
		var signal = AbortSignal.any([first.signal, second.signal]);
		var events = 0;
		signal.addEventListener("abort", function () {
			events++;
		});
		var reason = new Error("first");
		second.abort(reason);
		first.abort(new Error("second"));
		proclaim.isTrue(signal.aborted);
		proclaim.strictEqual(events, 1);
		if ("reason" in signal) {
			proclaim.strictEqual(signal.reason, reason);
		}
	});

	it("accepts any iterable of signals", function () {
		var controller = new AbortController();
		var signals = {};
		signals[Symbol.iterator] = function () {
			var done = false;
			return {
				next: function () {
					var result = { value: controller.signal, done: done };
					done = true;
					return result;
				}
			};
		};
		var signal = AbortSignal.any(signals);
		controller.abort();
		proclaim.isTrue(signal.aborted);
	});

	it("throws a TypeError for values that are not iterable", function () {
		proclaim.throws(function () {
			AbortSignal.any();
		}, TypeError);
		proclaim.throws(function () {
			AbortSignal.any({});
		}, TypeError);
	});

	it("throws a TypeError for values that are not signals", function () {
		proclaim.throws(function () {
			AbortSignal.any([new AbortController().signal, {}]);
		}, TypeError);
	});
});
