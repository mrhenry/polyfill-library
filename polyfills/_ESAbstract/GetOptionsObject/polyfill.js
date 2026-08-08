/* global Type */
// 7.3.36 GetOptionsObject ( options )
function GetOptionsObject(options) { // eslint-disable-line no-unused-vars
	// 1. If options is undefined, then
	if (options === undefined) {
		// a. Return OrdinaryObjectCreate(null).
		return Object.create(null);
	}
	// 2. If options is an Object, then
	if (Type(options) === "object") {
		// a. Return options.
		return options;
	}
	// 3. Throw a TypeError exception.
	throw new TypeError("options must be an object");
}
