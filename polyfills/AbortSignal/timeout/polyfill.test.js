it("is a function", function () {
	proclaim.isFunction(AbortSignal.timeout);
});

it("has correct arity", function () {
	proclaim.arity(AbortSignal.timeout, 1);
});

it("has correct name", function () {
	proclaim.hasName(AbortSignal.timeout, "timeout");
});

it("is enumerable", function () {
	proclaim.isEnumerable(AbortSignal, "timeout");
});

describe("timeout", function () {
	it("returns a signal that is not aborted yet", function () {
		var signal = AbortSignal.timeout(1000);
		proclaim.isInstanceOf(signal, AbortSignal);
		proclaim.isFalse(signal.aborted);
	});

	it("aborts the signal after the timeout, with a TimeoutError where abort reasons exist", function (done) {
		var signal = AbortSignal.timeout(10);
		var hasReasons = "reason" in signal;
		signal.addEventListener("abort", function () {
			try {
				proclaim.isTrue(signal.aborted);
				if (hasReasons) {
					proclaim.strictEqual(signal.reason.name, "TimeoutError");
				}
				done();
			} catch (error) {
				done(error);
			}
		});
	});

	it("aborts after a timeout of 0", function (done) {
		var signal = AbortSignal.timeout(0);
		signal.addEventListener("abort", function () {
			done();
		});
	});

	it("converts and truncates its argument", function () {
		proclaim.isFalse(AbortSignal.timeout("1000").aborted);
		proclaim.isFalse(AbortSignal.timeout(1000.9).aborted);
		proclaim.isFalse(AbortSignal.timeout(-0.5).aborted);
	});

	it("throws a TypeError for arguments outside the range of an unsigned long long", function () {
		var invalid = [NaN, Infinity, -Infinity, -1, 9007199254740992, undefined, "abc"];
		for (var i = 0; i < invalid.length; i++) {
			proclaim.throws(function () {
				AbortSignal.timeout(invalid[i]);
			}, TypeError);
		}
	});
});
