/* global Call, CreateMethodProperty, NewPromiseCapability, NormalCompletion, Promise, ThrowCompletion, Type */
// 27.2.4.8 Promise.try ( callback, ...args )
CreateMethodProperty(Promise, "try", function Try(callback /* , ...args */) {
	var args =
		arguments.length > 1 ? Array.prototype.slice.call(arguments, 1) : [];
	// 1. Let C be the this value.
	var C = this;
	// 2. If C is not an Object, throw a TypeError exception.
	if (Type(C) !== "object") {
		throw new TypeError("`this` value must be an object");
	}
	// 3. Let promiseCapability be ? NewPromiseCapability(C).
	var promiseCapability = NewPromiseCapability(C);
	// 4. Let status be Completion(Call(callback, undefined, args)).
	var status;
	try {
		status = NormalCompletion(Call(callback, undefined, args));
	} catch (error) {
		status = ThrowCompletion(error);
	}
	// 5. If status is an abrupt completion, then
	if (status["[[Type]]"] === "throw") {
		// a. Perform ? Call(promiseCapability.[[Reject]], undefined, « status.[[Value]] »).
		Call(promiseCapability["[[Reject]]"], undefined, [status["[[Value]]"]]);
	}
	// 6. Else,
	else {
		// a. Perform ? Call(promiseCapability.[[Resolve]], undefined, « status.[[Value]] »).
		Call(promiseCapability["[[Resolve]]"], undefined, [status["[[Value]]"]]);
	}
	// 7. Return promiseCapability.[[Promise]].
	return promiseCapability["[[Promise]]"];
});

(function () {
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

	if (supportsDefiningFunctionName) {
		Object.defineProperty(Promise.try, "name", {
			value: "try",
			writable: false,
			enumerable: false,
			configurable: true
		});
	}
})();
