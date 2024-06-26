/* global CreateDataPropertyOrThrow, CreateMethodProperty, NewPromiseCapability, Promise */
(function () {
	// 27.2.4.8 Promise.withResolvers ( )
	CreateMethodProperty(Promise, "withResolvers", function withResolvers() {
		// 1. Let C be the this value.
		var C = this;
		// 2. Let promiseCapability be ? NewPromiseCapability(C).
		var promiseCapability = NewPromiseCapability(C);
		// 3. Let obj be OrdinaryObjectCreate(%Object.prototype%).
		var obj = {};
		// 4. Perform ! CreateDataPropertyOrThrow(obj, "promise", promiseCapability.[[Promise]]).
		CreateDataPropertyOrThrow(obj, "promise", promiseCapability["[[Promise]]"]);
		// 5. Perform ! CreateDataPropertyOrThrow(obj, "resolve", promiseCapability.[[Resolve]]).
		CreateDataPropertyOrThrow(obj, "resolve", promiseCapability["[[Resolve]]"]);
		// 6. Perform ! CreateDataPropertyOrThrow(obj, "reject", promiseCapability.[[Reject]]).
		CreateDataPropertyOrThrow(obj, "reject", promiseCapability["[[Reject]]"]);
		// 7. Return obj.
		return obj;
	});
})();
