/* global Call, CreateMethodProperty, NewPromiseCapability, NormalCompletion, Promise, PromiseResolve, ThrowCompletion, Type */
// 27.2.4.8 Promise.try ( callback, ...args )
CreateMethodProperty(Promise, "try", function Try(callback /* , ...args */) {
	var args =
		arguments.length > 1 ? Array.prototype.slice.call(arguments, 1) : [];
	// 1. Let ctor be the this value.
	var ctor = this;
	// 2. If ctor is not an Object, throw a TypeError exception.
	if (Type(ctor) !== "object") {
		throw new TypeError("`this` value must be an object");
	}
	// 3. Let status be Completion(Call(callback, undefined, args)).
	var status;
	try {
		status = NormalCompletion(Call(callback, undefined, args));
	} catch (error) {
		status = ThrowCompletion(error);
	}
	// 4. If status is an abrupt completion, then
	if (status["[[Type]]"] === "throw") {
		// a. Let promiseCapability be ? NewPromiseCapability(ctor).
		var promiseCapability = NewPromiseCapability(ctor);
		// b. Perform ? Call(promiseCapability.[[Reject]], undefined, « status.[[Value]] »).
		Call(promiseCapability["[[Reject]]"], undefined, [status["[[Value]]"]]);
		// c. Return promiseCapability.[[Promise]].
		return promiseCapability["[[Promise]]"];
	}
	// 5. Else,
	else {
		// a. Return ? PromiseResolve(ctor, ! status).
		return PromiseResolve(ctor, status["[[Value]]"]);
	}
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
