/* global Promise */
var supportsDefiningFunctionName = (function () {
	var fn = function () {};
	try {
		Object.defineProperty(fn, "name", {
			value: "test"
		});
		return true;
	} catch (ignore) {
		return false;
	}
})();

it("is a function", function () {
	proclaim.isFunction(Promise.try);
});

it("has correct arity", function () {
	proclaim.arity(Promise.try, 1);
});

it("has correct name", function () {
	if (supportsDefiningFunctionName) {
		proclaim.hasName(Promise.try, "try");
	} else {
		proclaim.hasName(Promise.try, "Try");
	}
});

it("is not enumerable", function () {
	proclaim.isNotEnumerable(Promise, "try");
});

describe("try", function () {
	it("returns a Promise that resolves for a callback function that returns a value", function () {
		var promise = Promise.try(function () {
			return "ok";
		});
		return promise.then(function (value) {
			proclaim.equal(value, "ok");
		});
	});

	it("returns a Promise that rejects for a callback function that throws synchronously", function () {
		var promise = Promise.try(function () {
			throw "not ok";
		});
		return promise.then(
			function () {
				proclaim.fail("promise did not reject");
			},
			function (error) {
				proclaim.equal(error, "not ok");
			}
		);
	});

	it("returns a Promise that resolves for a callback function that returns a Promise that resolves", function () {
		var promise = Promise.try(function () {
			return Promise.resolve("ok");
		});
		return promise.then(function (value) {
			proclaim.equal(value, "ok");
		});
	});

	it("returns a Promise that rejects for a callback function that returns a Promise that rejects", function () {
		var promise = Promise.try(function () {
			return Promise.reject("not ok");
		});
		return promise.then(
			function () {
				proclaim.fail("promise did not reject");
			},
			function (error) {
				proclaim.equal(error, "not ok");
			}
		);
	});

	it("calls the callback function with variadic arguments", function () {
		var promise = Promise.try(
			function (a, b) {
				return a + b;
			},
			1,
			2
		);
		return promise.then(function (value) {
			proclaim.equal(value, 3);
		});
	});

	it("throws a TypeError for non-constructor `this`", function () {
		proclaim.throws(function () {
			Promise.try.call({});
		}, TypeError);
	});

	it("supports `this` as a Promise subclass", function () {
		function _Promise(executor) {
			return new Promise(executor);
		}
		_Promise.prototype = Promise.prototype;

		var _promise = Promise.try.call(_Promise, function () {});

		proclaim.ok(_promise instanceof _Promise);
	});
});
