/* global CreateMethodProperty, Reflect, Type, ToPropertyKey, ToPropertyDescriptor */
// 26.1.3 Reflect.defineProperty ( target, propertyKey, attributes )
CreateMethodProperty(Reflect, 'defineProperty', function defineProperty(target, propertyKey, attributes ) {
	// 1. If Type(target) is not Object, throw a TypeError exception.
	if (Type(target) !== "object") {
		throw new TypeError(Object.prototype.toString.call(target) + ' is not an Object');
	}
	// 2. Let key be ? ToPropertyKey(propertyKey).
	var key = ToPropertyKey(propertyKey);
	// 3. Let desc be ? ToPropertyDescriptor(attributes).
	var desc = ToPropertyDescriptor(attributes);
	// 4. Return ? target.[[DefineOwnProperty]](key, desc).
	try {
		var newDesc = {};
		var props = [
			["[[Value]]", "value"],
			["[[Get]]", "get"],
			["[[Set]]", "set"],
			["[[Writable]]", "writable"],
			["[[Enumerable]]", "enumerable"],
			["[[Configurable]]", "configurable"]
		];
		for (var i = 0; i < props.length; i++) {
			var prop = props[i];
			if (prop[0] in desc) {
				newDesc[prop[1]] = desc[prop[0]];
			}
		}
		Object.defineProperty(target, key, newDesc);
		return true;
	} catch (e) {
		return false;
	}
});
