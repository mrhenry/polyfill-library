/* global Call, Get, NewPromiseCapability, SameValue, Type */
// 27.5.4.7.1 PromiseResolve ( ctor, resolution )
// eslint-disable-next-line no-unused-vars
function PromiseResolve(ctor, resolution) {
	// 1. If IsPromise(resolution) is true, then
	// a. Let resolutionCtor be ? Get(resolution, "constructor").
	// b. If SameValue(resolutionCtor, ctor) is true, return resolution.
	if (Type(resolution) === "object" && SameValue(Get(resolution, "constructor"), ctor)) {
		return resolution;
	}
	// 2. Let promiseCapability be ? NewPromiseCapability(ctor).
	var promiseCapability = NewPromiseCapability(ctor);
	// 3. Perform ? Call(promiseCapability.[[Resolve]], undefined, « resolution »).
	Call(promiseCapability["[[Resolve]]"], undefined, [resolution]);
	// 4. Return promiseCapability.[[Promise]].
	return promiseCapability["[[Promise]]"];
}
