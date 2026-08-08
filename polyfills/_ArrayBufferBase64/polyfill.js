(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

var callBound = require('call-bound');
var $byteLength = callBound('ArrayBuffer.prototype.byteLength', true);

var isArrayBuffer = require('is-array-buffer');

/** @type {import('.')} */
module.exports = function byteLength(ab) {
	if (!isArrayBuffer(ab)) {
		return NaN;
	}
	return $byteLength ? $byteLength(ab) : ab.byteLength;
}; // in node < 0.11, byteLength is an own nonconfigurable property

},{"call-bound":12,"is-array-buffer":157}],2:[function(require,module,exports){
'use strict';

/** @type {import('.').AsyncFunctionConstructor | false} */
var cached;

/** @type {import('.')} */
module.exports = function getAsyncFunction() {
	if (typeof cached === 'undefined') {
		try {
			// eslint-disable-next-line no-new-func
			cached = Function('return async function () {}')().constructor;
		} catch (e) {
			cached = false;
		}
	}
	return cached;
};


},{}],3:[function(require,module,exports){
(function (global){(function (){
'use strict';

var possibleNames = require('possible-typed-array-names');

var g = typeof globalThis === 'undefined' ? global : globalThis;

/** @type {import('.')} */
module.exports = function availableTypedArrays() {
	var /** @type {ReturnType<typeof availableTypedArrays>} */ out = [];
	for (var i = 0; i < possibleNames.length; i++) {
		if (typeof g[possibleNames[i]] === 'function' || typeof g[possibleNames[i]] === 'object') {
			// @ts-expect-error
			out[out.length] = possibleNames[i];
		}
	}
	return out;
};

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"possible-typed-array-names":190}],4:[function(require,module,exports){

},{}],5:[function(require,module,exports){
'use strict';

var bind = require('function-bind');

var $apply = require('./functionApply');
var $call = require('./functionCall');
var $reflectApply = require('./reflectApply');

/** @type {import('./actualApply')} */
module.exports = $reflectApply || bind.call($call, $apply);

},{"./functionApply":7,"./functionCall":8,"./reflectApply":10,"function-bind":137}],6:[function(require,module,exports){
'use strict';

var bind = require('function-bind');
var $apply = require('./functionApply');
var actualApply = require('./actualApply');

/** @type {import('./applyBind')} */
module.exports = function applyBind() {
	return actualApply(bind, $apply, arguments);
};

},{"./actualApply":5,"./functionApply":7,"function-bind":137}],7:[function(require,module,exports){
'use strict';

/** @type {import('./functionApply')} */
module.exports = Function.prototype.apply;

},{}],8:[function(require,module,exports){
'use strict';

/** @type {import('./functionCall')} */
module.exports = Function.prototype.call;

},{}],9:[function(require,module,exports){
'use strict';

var bind = require('function-bind');
var $TypeError = require('es-errors/type');

var $call = require('./functionCall');
var $actualApply = require('./actualApply');

/** @type {(args: [Function, thisArg?: unknown, ...args: unknown[]]) => Function} TODO FIXME, find a way to use import('.') */
module.exports = function callBindBasic(args) {
	if (args.length < 1 || typeof args[0] !== 'function') {
		throw new $TypeError('a function is required');
	}
	return $actualApply(bind, $call, args);
};

},{"./actualApply":5,"./functionCall":8,"es-errors/type":128,"function-bind":137}],10:[function(require,module,exports){
'use strict';

/** @type {import('./reflectApply')} */
module.exports = typeof Reflect !== 'undefined' && Reflect && Reflect.apply;

},{}],11:[function(require,module,exports){
'use strict';

var setFunctionLength = require('set-function-length');

var $defineProperty = require('es-define-property');

var callBindBasic = require('call-bind-apply-helpers');
var applyBind = require('call-bind-apply-helpers/applyBind');

module.exports = function callBind(originalFunction) {
	var func = callBindBasic(arguments);
	var adjustedLength = originalFunction.length - (arguments.length - 1);
	return setFunctionLength(
		func,
		1 + (adjustedLength > 0 ? adjustedLength : 0),
		true
	);
};

if ($defineProperty) {
	$defineProperty(module.exports, 'apply', { value: applyBind });
} else {
	module.exports.apply = applyBind;
}

},{"call-bind-apply-helpers":9,"call-bind-apply-helpers/applyBind":6,"es-define-property":122,"set-function-length":196}],12:[function(require,module,exports){
'use strict';

var GetIntrinsic = require('get-intrinsic');

var callBindBasic = require('call-bind-apply-helpers');

/** @type {(thisArg: string, searchString: string, position?: number) => number} */
var $indexOf = callBindBasic([GetIntrinsic('%String.prototype.indexOf%')]);

/** @type {import('.')} */
module.exports = function callBoundIntrinsic(name, allowMissing) {
	/* eslint no-extra-parens: 0 */

	var intrinsic = /** @type {(this: unknown, ...args: unknown[]) => unknown} */ (GetIntrinsic(name, !!allowMissing));
	if (typeof intrinsic === 'function' && $indexOf(name, '.prototype.') > -1) {
		return callBindBasic(/** @type {const} */ ([intrinsic]));
	}
	return intrinsic;
};

},{"call-bind-apply-helpers":9,"get-intrinsic":143}],13:[function(require,module,exports){
'use strict';

var $defineProperty = require('es-define-property');

var $SyntaxError = require('es-errors/syntax');
var $TypeError = require('es-errors/type');

var gopd = require('gopd');

/** @type {import('.')} */
module.exports = function defineDataProperty(
	obj,
	property,
	value
) {
	if (!obj || (typeof obj !== 'object' && typeof obj !== 'function')) {
		throw new $TypeError('`obj` must be an object or a function`');
	}
	if (typeof property !== 'string' && typeof property !== 'symbol') {
		throw new $TypeError('`property` must be a string or a symbol`');
	}
	if (arguments.length > 3 && typeof arguments[3] !== 'boolean' && arguments[3] !== null) {
		throw new $TypeError('`nonEnumerable`, if provided, must be a boolean or null');
	}
	if (arguments.length > 4 && typeof arguments[4] !== 'boolean' && arguments[4] !== null) {
		throw new $TypeError('`nonWritable`, if provided, must be a boolean or null');
	}
	if (arguments.length > 5 && typeof arguments[5] !== 'boolean' && arguments[5] !== null) {
		throw new $TypeError('`nonConfigurable`, if provided, must be a boolean or null');
	}
	if (arguments.length > 6 && typeof arguments[6] !== 'boolean') {
		throw new $TypeError('`loose`, if provided, must be a boolean');
	}

	var nonEnumerable = arguments.length > 3 ? arguments[3] : null;
	var nonWritable = arguments.length > 4 ? arguments[4] : null;
	var nonConfigurable = arguments.length > 5 ? arguments[5] : null;
	var loose = arguments.length > 6 ? arguments[6] : false;

	/* @type {false | TypedPropertyDescriptor<unknown>} */
	var desc = !!gopd && gopd(obj, property);

	if ($defineProperty) {
		$defineProperty(obj, property, {
			configurable: nonConfigurable === null && desc ? desc.configurable : !nonConfigurable,
			enumerable: nonEnumerable === null && desc ? desc.enumerable : !nonEnumerable,
			value: value,
			writable: nonWritable === null && desc ? desc.writable : !nonWritable
		});
	} else if (loose || (!nonEnumerable && !nonWritable && !nonConfigurable)) {
		// must fall back to [[Set]], and was not explicitly asked to make non-enumerable, non-writable, or non-configurable
		obj[property] = value; // eslint-disable-line no-param-reassign
	} else {
		throw new $SyntaxError('This environment does not support defining a property as non-configurable, non-writable, or non-enumerable.');
	}
};

},{"es-define-property":122,"es-errors/syntax":127,"es-errors/type":128,"gopd":148}],14:[function(require,module,exports){
'use strict';

var keys = require('object-keys');
var hasSymbols = typeof Symbol === 'function' && typeof Symbol('foo') === 'symbol';

var toStr = Object.prototype.toString;
var concat = Array.prototype.concat;
var defineDataProperty = require('define-data-property');

var isFunction = function (fn) {
	return typeof fn === 'function' && toStr.call(fn) === '[object Function]';
};

var supportsDescriptors = require('has-property-descriptors')();

var defineProperty = function (object, name, value, predicate) {
	if (name in object) {
		if (predicate === true) {
			if (object[name] === value) {
				return;
			}
		} else if (!isFunction(predicate) || !predicate()) {
			return;
		}
	}

	if (supportsDescriptors) {
		defineDataProperty(object, name, value, true);
	} else {
		defineDataProperty(object, name, value);
	}
};

var defineProperties = function (object, map) {
	var predicates = arguments.length > 2 ? arguments[2] : {};
	var props = keys(map);
	if (hasSymbols) {
		props = concat.call(props, Object.getOwnPropertySymbols(map));
	}
	for (var i = 0; i < props.length; i += 1) {
		defineProperty(object, props[i], map[props[i]], predicates[props[i]]);
	}
};

defineProperties.supportsDescriptors = !!supportsDescriptors;

module.exports = defineProperties;

},{"define-data-property":13,"has-property-descriptors":150,"object-keys":16}],15:[function(require,module,exports){
'use strict';

var keysShim;
if (!Object.keys) {
	// modified from https://github.com/es-shims/es5-shim
	var has = Object.prototype.hasOwnProperty;
	var toStr = Object.prototype.toString;
	var isArgs = require('./isArguments'); // eslint-disable-line global-require
	var isEnumerable = Object.prototype.propertyIsEnumerable;
	var hasDontEnumBug = !isEnumerable.call({ toString: null }, 'toString');
	var hasProtoEnumBug = isEnumerable.call(function () {}, 'prototype');
	var dontEnums = [
		'toString',
		'toLocaleString',
		'valueOf',
		'hasOwnProperty',
		'isPrototypeOf',
		'propertyIsEnumerable',
		'constructor'
	];
	var equalsConstructorPrototype = function (o) {
		var ctor = o.constructor;
		return ctor && ctor.prototype === o;
	};
	var excludedKeys = {
		$applicationCache: true,
		$console: true,
		$external: true,
		$frame: true,
		$frameElement: true,
		$frames: true,
		$innerHeight: true,
		$innerWidth: true,
		$onmozfullscreenchange: true,
		$onmozfullscreenerror: true,
		$outerHeight: true,
		$outerWidth: true,
		$pageXOffset: true,
		$pageYOffset: true,
		$parent: true,
		$scrollLeft: true,
		$scrollTop: true,
		$scrollX: true,
		$scrollY: true,
		$self: true,
		$webkitIndexedDB: true,
		$webkitStorageInfo: true,
		$window: true
	};
	var hasAutomationEqualityBug = (function () {
		/* global window */
		if (typeof window === 'undefined') { return false; }
		for (var k in window) {
			try {
				if (!excludedKeys['$' + k] && has.call(window, k) && window[k] !== null && typeof window[k] === 'object') {
					try {
						equalsConstructorPrototype(window[k]);
					} catch (e) {
						return true;
					}
				}
			} catch (e) {
				return true;
			}
		}
		return false;
	}());
	var equalsConstructorPrototypeIfNotBuggy = function (o) {
		/* global window */
		if (typeof window === 'undefined' || !hasAutomationEqualityBug) {
			return equalsConstructorPrototype(o);
		}
		try {
			return equalsConstructorPrototype(o);
		} catch (e) {
			return false;
		}
	};

	keysShim = function keys(object) {
		var isObject = object !== null && typeof object === 'object';
		var isFunction = toStr.call(object) === '[object Function]';
		var isArguments = isArgs(object);
		var isString = isObject && toStr.call(object) === '[object String]';
		var theKeys = [];

		if (!isObject && !isFunction && !isArguments) {
			throw new TypeError('Object.keys called on a non-object');
		}

		var skipProto = hasProtoEnumBug && isFunction;
		if (isString && object.length > 0 && !has.call(object, 0)) {
			for (var i = 0; i < object.length; ++i) {
				theKeys.push(String(i));
			}
		}

		if (isArguments && object.length > 0) {
			for (var j = 0; j < object.length; ++j) {
				theKeys.push(String(j));
			}
		} else {
			for (var name in object) {
				if (!(skipProto && name === 'prototype') && has.call(object, name)) {
					theKeys.push(String(name));
				}
			}
		}

		if (hasDontEnumBug) {
			var skipConstructor = equalsConstructorPrototypeIfNotBuggy(object);

			for (var k = 0; k < dontEnums.length; ++k) {
				if (!(skipConstructor && dontEnums[k] === 'constructor') && has.call(object, dontEnums[k])) {
					theKeys.push(dontEnums[k]);
				}
			}
		}
		return theKeys;
	};
}
module.exports = keysShim;

},{"./isArguments":17}],16:[function(require,module,exports){
'use strict';

var slice = Array.prototype.slice;
var isArgs = require('./isArguments');

var origKeys = Object.keys;
var keysShim = origKeys ? function keys(o) { return origKeys(o); } : require('./implementation');

var originalKeys = Object.keys;

keysShim.shim = function shimObjectKeys() {
	if (Object.keys) {
		var keysWorksWithArguments = (function () {
			// Safari 5.0 bug
			var args = Object.keys(arguments);
			return args && args.length === arguments.length;
		}(1, 2));
		if (!keysWorksWithArguments) {
			Object.keys = function keys(object) { // eslint-disable-line func-name-matching
				if (isArgs(object)) {
					return originalKeys(slice.call(object));
				}
				return originalKeys(object);
			};
		}
	} else {
		Object.keys = keysShim;
	}
	return Object.keys || keysShim;
};

module.exports = keysShim;

},{"./implementation":15,"./isArguments":17}],17:[function(require,module,exports){
'use strict';

var toStr = Object.prototype.toString;

module.exports = function isArguments(value) {
	var str = toStr.call(value);
	var isArgs = str === '[object Arguments]';
	if (!isArgs) {
		isArgs = str !== '[object Array]' &&
			value !== null &&
			typeof value === 'object' &&
			typeof value.length === 'number' &&
			value.length >= 0 &&
			toStr.call(value.callee) === '[object Function]';
	}
	return isArgs;
};

},{}],18:[function(require,module,exports){
'use strict';

var callBind = require('call-bind-apply-helpers');
var gOPD = require('gopd');

var hasProtoAccessor;
try {
	// eslint-disable-next-line no-extra-parens, no-proto
	hasProtoAccessor = /** @type {{ __proto__?: typeof Array.prototype }} */ ([]).__proto__ === Array.prototype;
} catch (e) {
	if (!e || typeof e !== 'object' || !('code' in e) || e.code !== 'ERR_PROTO_ACCESS') {
		throw e;
	}
}

// eslint-disable-next-line no-extra-parens
var desc = !!hasProtoAccessor && gOPD && gOPD(Object.prototype, /** @type {keyof typeof Object.prototype} */ ('__proto__'));

var $Object = Object;
var $getPrototypeOf = $Object.getPrototypeOf;

/** @type {import('./get')} */
module.exports = desc && typeof desc.get === 'function'
	? callBind([desc.get])
	: typeof $getPrototypeOf === 'function'
		? /** @type {import('./get')} */ function getDunder(value) {
			// eslint-disable-next-line eqeqeq
			return $getPrototypeOf(value == null ? value : $Object(value));
		}
		: false;

},{"call-bind-apply-helpers":9,"gopd":148}],19:[function(require,module,exports){
'use strict';

var $TypeError = require('es-errors/type');

// https://262.ecma-international.org/15.0/#sec-arraybufferbytelength

var IsDetachedBuffer = require('./IsDetachedBuffer');

var isArrayBuffer = require('is-array-buffer');
var isSharedArrayBuffer = require('is-shared-array-buffer');
var arrayBufferByteLength = require('array-buffer-byte-length');

var callBound = require('call-bound');
var $sabByteLength = callBound('SharedArrayBuffer.prototype.byteLength', true);

var isGrowable = false; // TODO: support this

module.exports = function ArrayBufferByteLength(arrayBuffer, order) {
	var isSAB = isSharedArrayBuffer(arrayBuffer);
	if (!isArrayBuffer(arrayBuffer) && !isSAB) {
		throw new $TypeError('Assertion failed: `arrayBuffer` must be an ArrayBuffer or a SharedArrayBuffer');
	}
	if (order !== 'SEQ-CST' && order !== 'UNORDERED') {
		throw new $TypeError('Assertion failed: `order` must be ~SEQ-CST~ or ~UNORDERED~');
	}

	// 1. If IsSharedArrayBuffer(arrayBuffer) is true and arrayBuffer has an [[ArrayBufferByteLengthData]] internal slot, then
	// TODO: see if IsFixedLengthArrayBuffer can be used here in the spec instead
	if (isSAB && isGrowable) { // step 1
		// a. Let bufferByteLengthBlock be arrayBuffer.[[ArrayBufferByteLengthData]].
		// b. Let rawLength be GetRawBytesFromSharedBlock(bufferByteLengthBlock, 0, BIGUINT64, true, order).
		// c. Let isLittleEndian be the value of the [[LittleEndian]] field of the surrounding agent's Agent Record.
		// d. Return ℝ(RawBytesToNumeric(BIGUINT64, rawLength, isLittleEndian)).
	}

	if (IsDetachedBuffer(arrayBuffer)) {
		throw new $TypeError('Assertion failed: `arrayBuffer` must not be detached'); // step 2
	}

	return isSAB ? $sabByteLength(arrayBuffer) : arrayBufferByteLength(arrayBuffer);
};

},{"./IsDetachedBuffer":27,"array-buffer-byte-length":1,"call-bound":12,"es-errors/type":128,"is-array-buffer":157,"is-shared-array-buffer":169}],20:[function(require,module,exports){
'use strict';

var GetIntrinsic = require('get-intrinsic');

var $BigInt = GetIntrinsic('%BigInt%', true);
var $RangeError = require('es-errors/range');
var $TypeError = require('es-errors/type');

var zero = $BigInt && $BigInt(0);

// https://262.ecma-international.org/11.0/#sec-numeric-types-bigint-remainder

module.exports = function BigIntRemainder(n, d) {
	if (typeof n !== 'bigint' || typeof d !== 'bigint') {
		throw new $TypeError('Assertion failed: `n` and `d` arguments must be BigInts');
	}

	if (d === zero) {
		throw new $RangeError('Division by zero');
	}

	if (n === zero) {
		return zero;
	}

	// shortcut for the actual spec mechanics
	return n % d;
};

},{"es-errors/range":125,"es-errors/type":128,"get-intrinsic":143}],21:[function(require,module,exports){
'use strict';

var $TypeError = require('es-errors/type');

var inspect = require('object-inspect');

var isPropertyKey = require('../helpers/isPropertyKey');

var isObject = require('es-object-atoms/isObject');

// https://262.ecma-international.org/6.0/#sec-get-o-p

module.exports = function Get(O, P) {
	// 7.3.1.1
	if (!isObject(O)) {
		throw new $TypeError('Assertion failed: Type(O) is not Object');
	}
	// 7.3.1.2
	if (!isPropertyKey(P)) {
		throw new $TypeError('Assertion failed: P is not a Property Key, got ' + inspect(P));
	}
	// 7.3.1.3
	return O[P];
};

},{"../helpers/isPropertyKey":78,"es-errors/type":128,"es-object-atoms/isObject":132,"object-inspect":189}],22:[function(require,module,exports){
'use strict';

var GetIntrinsic = require('get-intrinsic');

var $SyntaxError = require('es-errors/syntax');
var $TypeError = require('es-errors/type');
var callBound = require('call-bound');
var isInteger = require('math-intrinsics/isInteger');
var $Uint8Array = GetIntrinsic('%Uint8Array%', true);

var $slice = callBound('Array.prototype.slice');

var IsDetachedBuffer = require('./IsDetachedBuffer');
var RawBytesToNumeric = require('./RawBytesToNumeric');

var isArrayBuffer = require('is-array-buffer');
var isSharedArrayBuffer = require('is-shared-array-buffer');
var safeConcat = require('safe-array-concat');

var tableTAO = require('./tables/typed-array-objects');

var defaultEndianness = require('../helpers/defaultEndianness');

// https://262.ecma-international.org/15.0/#sec-getvaluefrombuffer

module.exports = function GetValueFromBuffer(arrayBuffer, byteIndex, type, isTypedArray, order) {
	var isSAB = isSharedArrayBuffer(arrayBuffer);
	if (!isArrayBuffer(arrayBuffer) && !isSAB) {
		throw new $TypeError('Assertion failed: `arrayBuffer` must be an ArrayBuffer or a SharedArrayBuffer');
	}

	if (!isInteger(byteIndex)) {
		throw new $TypeError('Assertion failed: `byteIndex` must be an integer');
	}

	if (typeof type !== 'string' || typeof tableTAO.size['$' + type] !== 'number') {
		throw new $TypeError('Assertion failed: `type` must be one of ' + tableTAO.choices);
	}

	if (typeof isTypedArray !== 'boolean') {
		throw new $TypeError('Assertion failed: `isTypedArray` must be a boolean');
	}

	if (order !== 'SEQ-CST' && order !== 'UNORDERED') {
		throw new $TypeError('Assertion failed: `order` must be either `SEQ-CST` or `UNORDERED`');
	}

	if (arguments.length > 5 && typeof arguments[5] !== 'boolean') {
		throw new $TypeError('Assertion failed: `isLittleEndian` must be a boolean, if present');
	}

	if (IsDetachedBuffer(arrayBuffer)) {
		throw new $TypeError('Assertion failed: `arrayBuffer` is detached'); // step 1
	}

	// 2. Assert: There are sufficient bytes in arrayBuffer starting at byteIndex to represent a value of type.

	if (byteIndex < 0) {
		throw new $TypeError('Assertion failed: `byteIndex` must be non-negative'); // step 3
	}

	// 4. Let block be arrayBuffer.[[ArrayBufferData]].

	var elementSize = tableTAO.size['$' + type]; // step 5
	if (!elementSize) {
		throw new $TypeError('Assertion failed: `type` must be one of ' + tableTAO.choices);
	}

	var rawValue;
	if (isSAB) { // step 6
		/*
		a. Let execution be the [[CandidateExecution]] field of the surrounding agent's Agent Record.
		b. Let eventList be the [[EventList]] field of the element in execution.[[EventLists]] whose [[AgentSignifier]] is AgentSignifier().
		c. If isTypedArray is true and type is "Int8", "Uint8", "Int16", "Uint16", "Int32", or "Uint32", let noTear be true; otherwise let noTear be false.
		d. Let rawValue be a List of length elementSize of nondeterministically chosen byte values.
		e. NOTE: In implementations, rawValue is the result of a non-atomic or atomic read instruction on the underlying hardware. The nondeterminism is a semantic prescription of the memory model to describe observable behaviour of hardware with weak consistency.
		f. Let readEvent be ReadSharedMemory{ [[Order]]: order, [[NoTear]]: noTear, [[Block]]: block, [[ByteIndex]]: byteIndex, [[ElementSize]]: elementSize }.
		g. Append readEvent to eventList.
		h. Append Chosen Value Record { [[Event]]: readEvent, [[ChosenValue]]: rawValue } to execution.[[ChosenValues]].
		*/
		throw new $SyntaxError('SharedArrayBuffer is not supported by this implementation');
	} else {
		// 7. Let rawValue be a List of elementSize containing, in order, the elementSize sequence of bytes starting with block[byteIndex].
		rawValue = $slice(new $Uint8Array(arrayBuffer, byteIndex), 0, elementSize); // step 6
	}

	// 8. If isLittleEndian is not present, set isLittleEndian to either true or false. The choice is implementation dependent and should be the alternative that is most efficient for the implementation. An implementation must use the same value each time this step is executed and the same value must be used for the corresponding step in the SetValueInBuffer abstract operation.
	var isLittleEndian = arguments.length > 5 ? arguments[5] : defaultEndianness === 'little'; // step 8

	var bytes = isLittleEndian
		? $slice(safeConcat([0, 0, 0, 0, 0, 0, 0, 0], rawValue), -elementSize)
		: $slice(safeConcat(rawValue, [0, 0, 0, 0, 0, 0, 0, 0]), 0, elementSize);

	return RawBytesToNumeric(type, bytes, isLittleEndian);
};

},{"../helpers/defaultEndianness":68,"./IsDetachedBuffer":27,"./RawBytesToNumeric":35,"./tables/typed-array-objects":61,"call-bound":12,"es-errors/syntax":127,"es-errors/type":128,"get-intrinsic":143,"is-array-buffer":157,"is-shared-array-buffer":169,"math-intrinsics/isInteger":180,"safe-array-concat":193}],23:[function(require,module,exports){
'use strict';

var $TypeError = require('es-errors/type');

var hasOwn = require('hasown');
var isObject = require('es-object-atoms/isObject');

var isPropertyKey = require('../helpers/isPropertyKey');

// https://262.ecma-international.org/6.0/#sec-hasownproperty

module.exports = function HasOwnProperty(O, P) {
	if (!isObject(O)) {
		throw new $TypeError('Assertion failed: `O` must be an Object');
	}
	if (!isPropertyKey(P)) {
		throw new $TypeError('Assertion failed: `P` must be a Property Key');
	}
	return hasOwn(O, P);
};

},{"../helpers/isPropertyKey":78,"es-errors/type":128,"es-object-atoms/isObject":132,"hasown":155}],24:[function(require,module,exports){
'use strict';

// https://262.ecma-international.org/6.0/#sec-isarray
module.exports = require('../helpers/IsArray');

},{"../helpers/IsArray":64}],25:[function(require,module,exports){
'use strict';

// https://262.ecma-international.org/15.0/#sec-isbigintelementtype

module.exports = function IsBigIntElementType(type) {
	return type === 'BIGUINT64' || type === 'BIGINT64';
};

},{}],26:[function(require,module,exports){
'use strict';

// http://262.ecma-international.org/5.1/#sec-9.11

module.exports = require('is-callable');

},{"is-callable":161}],27:[function(require,module,exports){
(function (global){(function (){
'use strict';

var $TypeError = require('es-errors/type');

var $byteLength = require('array-buffer-byte-length');
var availableTypedArrays = require('available-typed-arrays')();
var callBound = require('call-bound');
var isArrayBuffer = require('is-array-buffer');
var isSharedArrayBuffer = require('is-shared-array-buffer');

var $sabByteLength = callBound('SharedArrayBuffer.prototype.byteLength', true);

// https://262.ecma-international.org/8.0/#sec-isdetachedbuffer

module.exports = function IsDetachedBuffer(arrayBuffer) {
	var isSAB = isSharedArrayBuffer(arrayBuffer);
	if (!isArrayBuffer(arrayBuffer) && !isSAB) {
		throw new $TypeError('Assertion failed: `arrayBuffer` must be an Object with an [[ArrayBufferData]] internal slot');
	}
	if ((isSAB ? $sabByteLength : $byteLength)(arrayBuffer) === 0) {
		try {
			new global[availableTypedArrays[0]](arrayBuffer); // eslint-disable-line no-new
		} catch (error) {
			return !!error && error.name === 'TypeError';
		}
	}
	return false;
};

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"array-buffer-byte-length":1,"available-typed-arrays":3,"call-bound":12,"es-errors/type":128,"is-array-buffer":157,"is-shared-array-buffer":169}],28:[function(require,module,exports){
'use strict';

var $TypeError = require('es-errors/type');

var callBound = require('call-bound');

var $arrayBufferResizable = callBound('%ArrayBuffer.prototype.resizable%', true);
var $sharedArrayGrowable = callBound('%SharedArrayBuffer.prototype.growable%', true);

var isArrayBuffer = require('is-array-buffer');
var isSharedArrayBuffer = require('is-shared-array-buffer');

// https://262.ecma-international.org/15.0/#sec-isfixedlengtharraybuffer

module.exports = function IsFixedLengthArrayBuffer(arrayBuffer) {
	var isAB = isArrayBuffer(arrayBuffer);
	var isSAB = isSharedArrayBuffer(arrayBuffer);
	if (!isAB && !isSAB) {
		throw new $TypeError('Assertion failed: `arrayBuffer` must be an ArrayBuffer or SharedArrayBuffer');
	}

	if (isAB && $arrayBufferResizable) {
		return !$arrayBufferResizable(arrayBuffer); // step 1
	}
	if (isSAB && $sharedArrayGrowable) {
		return !$sharedArrayGrowable(arrayBuffer); // step 1
	}
	return true; // step 2
};

},{"call-bound":12,"es-errors/type":128,"is-array-buffer":157,"is-shared-array-buffer":169}],29:[function(require,module,exports){
'use strict';

var $TypeError = require('es-errors/type');

var IsDetachedBuffer = require('./IsDetachedBuffer');
var IsFixedLengthArrayBuffer = require('./IsFixedLengthArrayBuffer');
var TypedArrayElementSize = require('./TypedArrayElementSize');

var isTypedArrayWithBufferWitnessRecord = require('../helpers/records/typed-array-with-buffer-witness-record');

var typedArrayBuffer = require('typed-array-buffer');
var typedArrayByteOffset = require('typed-array-byte-offset');
var typedArrayLength = require('typed-array-length');

// https://262.ecma-international.org/15.0/#sec-istypedarrayoutofbounds

module.exports = function IsTypedArrayOutOfBounds(taRecord) {
	if (!isTypedArrayWithBufferWitnessRecord(taRecord)) {
		throw new $TypeError('Assertion failed: `taRecord` must be a TypedArray With Buffer Witness Record');
	}

	var O = taRecord['[[Object]]']; // step 1

	var bufferByteLength = taRecord['[[CachedBufferByteLength]]']; // step 2

	if (IsDetachedBuffer(typedArrayBuffer(O)) && bufferByteLength !== 'DETACHED') {
		throw new $TypeError('Assertion failed: typed array is detached only if the byte length is ~DETACHED~'); // step 3
	}

	if (bufferByteLength === 'DETACHED') {
		return true; // step 4
	}

	var byteOffsetStart = typedArrayByteOffset(O); // step 5

	var isFixed = IsFixedLengthArrayBuffer(typedArrayBuffer(O));

	var byteOffsetEnd;
	var length = isFixed ? typedArrayLength(O) : 'AUTO';
	// TODO: probably use package for array length
	// seems to apply when TA is backed by a resizable/growable AB
	if (length === 'AUTO') { // step 6
		byteOffsetEnd = bufferByteLength; // step 6.a
	} else {
		var elementSize = TypedArrayElementSize(O); // step 7.a

		byteOffsetEnd = byteOffsetStart + (length * elementSize); // step 7.b
	}

	if (byteOffsetStart > bufferByteLength || byteOffsetEnd > bufferByteLength) {
		return true; // step 8
	}

	// 9. NOTE: 0-length TypedArrays are not considered out-of-bounds.

	return false; // step 10
};

},{"../helpers/records/typed-array-with-buffer-witness-record":81,"./IsDetachedBuffer":27,"./IsFixedLengthArrayBuffer":28,"./TypedArrayElementSize":55,"es-errors/type":128,"typed-array-buffer":205,"typed-array-byte-offset":206,"typed-array-length":207}],30:[function(require,module,exports){
'use strict';

// https://262.ecma-international.org/15.0/#sec-isunsignedelementtype

module.exports = function IsUnsignedElementType(type) {
	return type === 'UINT8'
		|| type === 'UINT8C'
		|| type === 'UINT16'
		|| type === 'UINT32'
		|| type === 'BIGUINT64';
};

},{}],31:[function(require,module,exports){
'use strict';

var $TypeError = require('es-errors/type');

var ArrayBufferByteLength = require('./ArrayBufferByteLength');
var IsDetachedBuffer = require('./IsDetachedBuffer');

var isTypedArray = require('is-typed-array');
var typedArrayBuffer = require('typed-array-buffer');

// https://262.ecma-international.org/15.0/#sec-maketypedarraywithbufferwitnessrecord

module.exports = function MakeTypedArrayWithBufferWitnessRecord(obj, order) {
	if (!isTypedArray(obj)) {
		throw new $TypeError('Assertion failed: `obj` must be a Typed Array');
	}
	if (order !== 'SEQ-CST' && order !== 'UNORDERED') {
		throw new $TypeError('Assertion failed: `order` must be ~SEQ-CST~ or ~UNORDERED~');
	}

	var buffer = typedArrayBuffer(obj); // step 1

	var byteLength = IsDetachedBuffer(buffer) ? 'DETACHED' : ArrayBufferByteLength(buffer, order); // steps 2 - 3

	return { '[[Object]]': obj, '[[CachedBufferByteLength]]': byteLength }; // step 4
};

},{"./ArrayBufferByteLength":19,"./IsDetachedBuffer":27,"es-errors/type":128,"is-typed-array":172,"typed-array-buffer":205}],32:[function(require,module,exports){
'use strict';

var $TypeError = require('es-errors/type');
var callBound = require('call-bound');
var isInteger = require('math-intrinsics/isInteger');

var $numberToString = callBound('Number.prototype.toString');

// https://262.ecma-international.org/14.0/#sec-numeric-types-number-tostring

module.exports = function NumberToString(x, radix) {
	if (typeof x !== 'number') {
		throw new $TypeError('Assertion failed: `x` must be a Number');
	}
	if (!isInteger(radix) || radix < 2 || radix > 36) {
		throw new $TypeError('Assertion failed: `radix` must be an integer >= 2 and <= 36');
	}

	return $numberToString(x, radix); // steps 1 - 12
};

},{"call-bound":12,"es-errors/type":128,"math-intrinsics/isInteger":180}],33:[function(require,module,exports){
'use strict';

var $TypeError = require('es-errors/type');

var hasOwnProperty = require('./HasOwnProperty');
var ToBigInt64 = require('./ToBigInt64');
var ToBigUint64 = require('./ToBigUint64');
var ToInt16 = require('./ToInt16');
var ToInt32 = require('./ToInt32');
var ToInt8 = require('./ToInt8');
var ToUint16 = require('./ToUint16');
var ToUint32 = require('./ToUint32');
var ToUint8 = require('./ToUint8');
var ToUint8Clamp = require('./ToUint8Clamp');

var valueToFloat32Bytes = require('../helpers/valueToFloat32Bytes');
var valueToFloat64Bytes = require('../helpers/valueToFloat64Bytes');
var integerToNBytes = require('../helpers/integerToNBytes');

var tableTAO = require('./tables/typed-array-objects');

// https://262.ecma-international.org/15.0/#table-the-typedarray-constructors
var TypeToAO = {
	__proto__: null,
	$INT8: ToInt8,
	$UINT8: ToUint8,
	$UINT8C: ToUint8Clamp,
	$INT16: ToInt16,
	$UINT16: ToUint16,
	$INT32: ToInt32,
	$UINT32: ToUint32,
	$BIGINT64: ToBigInt64,
	$BIGUINT64: ToBigUint64
};

// https://262.ecma-international.org/15.0/#sec-numerictorawbytes

module.exports = function NumericToRawBytes(type, value, isLittleEndian) {
	if (typeof type !== 'string' || !hasOwnProperty(tableTAO.size, '$' + type)) {
		throw new $TypeError('Assertion failed: `type` must be a TypedArray element type');
	}
	if (typeof value !== 'number' && typeof value !== 'bigint') {
		throw new $TypeError('Assertion failed: `value` must be a Number or a BigInt');
	}
	if (typeof isLittleEndian !== 'boolean') {
		throw new $TypeError('Assertion failed: `isLittleEndian` must be a Boolean');
	}

	if (type === 'FLOAT32') { // step 1
		return valueToFloat32Bytes(value, isLittleEndian);
	} else if (type === 'FLOAT64') { // step 2
		return valueToFloat64Bytes(value, isLittleEndian);
	} // step 3

	var n = tableTAO.size['$' + type]; // step 3.a

	var convOp = TypeToAO['$' + type]; // step 3.b

	var intValue = convOp(value); // step 3.c

	return integerToNBytes(intValue, n, isLittleEndian); // step 3.d, 3.e, 4
};

},{"../helpers/integerToNBytes":73,"../helpers/valueToFloat32Bytes":82,"../helpers/valueToFloat64Bytes":83,"./HasOwnProperty":23,"./ToBigInt64":41,"./ToBigUint64":42,"./ToInt16":44,"./ToInt32":45,"./ToInt8":46,"./ToUint16":50,"./ToUint32":51,"./ToUint8":52,"./ToUint8Clamp":53,"./tables/typed-array-objects":61,"es-errors/type":128}],34:[function(require,module,exports){
'use strict';

var GetIntrinsic = require('get-intrinsic');

var $ObjectCreate = GetIntrinsic('%Object.create%', true);
var $TypeError = require('es-errors/type');
var $SyntaxError = require('es-errors/syntax');
var isObject = require('es-object-atoms/isObject');

var IsArray = require('./IsArray');

var forEach = require('../helpers/forEach');

var SLOT = require('internal-slot');

var hasProto = require('has-proto')();

// https://262.ecma-international.org/11.0/#sec-objectcreate

module.exports = function OrdinaryObjectCreate(proto) {
	if (proto !== null && !isObject(proto)) {
		throw new $TypeError('Assertion failed: `proto` must be null or an object');
	}
	var additionalInternalSlotsList = arguments.length < 2 ? [] : arguments[1];
	if (!IsArray(additionalInternalSlotsList)) {
		throw new $TypeError('Assertion failed: `additionalInternalSlotsList` must be an Array');
	}

	// var internalSlotsList = ['[[Prototype]]', '[[Extensible]]']; // step 1
	// internalSlotsList.push(...additionalInternalSlotsList); // step 2
	// var O = MakeBasicObject(internalSlotsList); // step 3
	// setProto(O, proto); // step 4
	// return O; // step 5

	var O;
	if (hasProto) {
		O = { __proto__: proto };
	} else if ($ObjectCreate) {
		O = $ObjectCreate(proto);
	} else {
		if (proto === null) {
			throw new $SyntaxError('native Object.create support is required to create null objects');
		}
		var T = function T() {};
		T.prototype = proto;
		O = new T();
	}

	if (additionalInternalSlotsList.length > 0) {
		forEach(additionalInternalSlotsList, function (slot) {
			SLOT.set(O, slot, void undefined);
		});
	}

	return O;
};

},{"../helpers/forEach":70,"./IsArray":24,"es-errors/syntax":127,"es-errors/type":128,"es-object-atoms/isObject":132,"get-intrinsic":143,"has-proto":151,"internal-slot":156}],35:[function(require,module,exports){
'use strict';

var GetIntrinsic = require('get-intrinsic');
var callBound = require('call-bound');

var $RangeError = require('es-errors/range');
var $SyntaxError = require('es-errors/syntax');
var $TypeError = require('es-errors/type');
var $BigInt = GetIntrinsic('%BigInt%', true);

var hasOwnProperty = require('./HasOwnProperty');
var IsArray = require('./IsArray');
var IsBigIntElementType = require('./IsBigIntElementType');
var IsUnsignedElementType = require('./IsUnsignedElementType');

var bytesAsFloat32 = require('../helpers/bytesAsFloat32');
var bytesAsFloat64 = require('../helpers/bytesAsFloat64');
var bytesAsInteger = require('../helpers/bytesAsInteger');
var every = require('../helpers/every');
var isByteValue = require('../helpers/isByteValue');

var $reverse = callBound('Array.prototype.reverse');
var $slice = callBound('Array.prototype.slice');

var tableTAO = require('./tables/typed-array-objects');

// https://262.ecma-international.org/15.0/#sec-rawbytestonumeric

module.exports = function RawBytesToNumeric(type, rawBytes, isLittleEndian) {
	if (!hasOwnProperty(tableTAO.size, '$' + type)) {
		throw new $TypeError('Assertion failed: `type` must be a TypedArray element type');
	}
	if (!IsArray(rawBytes) || !every(rawBytes, isByteValue)) {
		throw new $TypeError('Assertion failed: `rawBytes` must be an Array of bytes');
	}
	if (typeof isLittleEndian !== 'boolean') {
		throw new $TypeError('Assertion failed: `isLittleEndian` must be a Boolean');
	}

	var elementSize = tableTAO.size['$' + type]; // step 1

	if (rawBytes.length !== elementSize) {
		// this assertion is not in the spec, but it'd be an editorial error if it were ever violated
		throw new $RangeError('Assertion failed: `rawBytes` must have a length of ' + elementSize + ' for type ' + type);
	}

	var isBigInt = IsBigIntElementType(type);
	if (isBigInt && !$BigInt) {
		throw new $SyntaxError('this environment does not support BigInts');
	}

	// eslint-disable-next-line no-param-reassign
	rawBytes = $slice(rawBytes, 0, elementSize);
	if (!isLittleEndian) {
		$reverse(rawBytes); // step 2
	}

	if (type === 'FLOAT32') { // step 3
		return bytesAsFloat32(rawBytes);
	}

	if (type === 'FLOAT64') { // step 4
		return bytesAsFloat64(rawBytes);
	}

	return bytesAsInteger(rawBytes, elementSize, IsUnsignedElementType(type), isBigInt);
};

},{"../helpers/bytesAsFloat32":65,"../helpers/bytesAsFloat64":66,"../helpers/bytesAsInteger":67,"../helpers/every":69,"../helpers/isByteValue":74,"./HasOwnProperty":23,"./IsArray":24,"./IsBigIntElementType":25,"./IsUnsignedElementType":30,"./tables/typed-array-objects":61,"call-bound":12,"es-errors/range":125,"es-errors/syntax":127,"es-errors/type":128,"get-intrinsic":143}],36:[function(require,module,exports){
'use strict';

var GetIntrinsic = require('get-intrinsic');

var $SyntaxError = require('es-errors/syntax');
var $TypeError = require('es-errors/type');
var isInteger = require('math-intrinsics/isInteger');
var $Uint8Array = GetIntrinsic('%Uint8Array%', true);

var IsBigIntElementType = require('./IsBigIntElementType');
var IsDetachedBuffer = require('./IsDetachedBuffer');
var NumericToRawBytes = require('./NumericToRawBytes');

var isArrayBuffer = require('is-array-buffer');
var isSharedArrayBuffer = require('is-shared-array-buffer');
var hasOwn = require('hasown');

var tableTAO = require('./tables/typed-array-objects');

var defaultEndianness = require('../helpers/defaultEndianness');
var forEach = require('../helpers/forEach');

// https://262.ecma-international.org/15.0/#sec-setvalueinbuffer

/* eslint max-params: 0 */

module.exports = function SetValueInBuffer(arrayBuffer, byteIndex, type, value, isTypedArray, order) {
	var isSAB = isSharedArrayBuffer(arrayBuffer);
	if (!isArrayBuffer(arrayBuffer) && !isSAB) {
		throw new $TypeError('Assertion failed: `arrayBuffer` must be an ArrayBuffer or a SharedArrayBuffer');
	}

	if (!isInteger(byteIndex) || byteIndex < 0) {
		throw new $TypeError('Assertion failed: `byteIndex` must be a non-negative integer');
	}

	if (typeof type !== 'string' || !hasOwn(tableTAO.size, '$' + type)) {
		throw new $TypeError('Assertion failed: `type` must be one of ' + tableTAO.choices);
	}

	if (typeof value !== 'number' && typeof value !== 'bigint') {
		throw new $TypeError('Assertion failed: `value` must be a Number or a BigInt');
	}

	if (typeof isTypedArray !== 'boolean') {
		throw new $TypeError('Assertion failed: `isTypedArray` must be a boolean');
	}
	if (order !== 'SEQ-CST' && order !== 'UNORDERED' && order !== 'INIT') {
		throw new $TypeError('Assertion failed: `order` must be `"SEQ-CST"`, `"UNORDERED"`, or `"INIT"`');
	}

	if (arguments.length > 6 && typeof arguments[6] !== 'boolean') {
		throw new $TypeError('Assertion failed: `isLittleEndian` must be a boolean, if present');
	}

	if (IsDetachedBuffer(arrayBuffer)) {
		throw new $TypeError('Assertion failed: ArrayBuffer is detached'); // step 1
	}

	// 2. Assert: There are sufficient bytes in arrayBuffer starting at byteIndex to represent a value of type.

	if (IsBigIntElementType(type) ? typeof value !== 'bigint' : typeof value !== 'number') { // step 3
		throw new $TypeError('Assertion failed: `value` must be a BigInt if type is ~BIGINT64~ or ~BIGUINT64~, otherwise a Number');
	}

	// 4. Let block be arrayBuffer’s [[ArrayBufferData]] internal slot.

	var elementSize = tableTAO.size['$' + type]; // step 5

	// 6. If isLittleEndian is not present, set isLittleEndian to either true or false. The choice is implementation dependent and should be the alternative that is most efficient for the implementation. An implementation must use the same value each time this step is executed and the same value must be used for the corresponding step in the GetValueFromBuffer abstract operation.
	var isLittleEndian = arguments.length > 6 ? arguments[6] : defaultEndianness === 'little'; // step 6

	var rawBytes = NumericToRawBytes(type, value, isLittleEndian); // step 7

	if (isSAB) { // step 8
		/*
			Let execution be the [[CandidateExecution]] field of the surrounding agent's Agent Record.
			Let eventList be the [[EventList]] field of the element in execution.[[EventsRecords]] whose [[AgentSignifier]] is AgentSignifier().
			If isTypedArray is true and IsNoTearConfiguration(type, order) is true, let noTear be true; otherwise let noTear be false.
			Append WriteSharedMemory { [[Order]]: order, [[NoTear]]: noTear, [[Block]]: block, [[ByteIndex]]: byteIndex, [[ElementSize]]: elementSize, [[Payload]]: rawBytes } to eventList.
		*/
		throw new $SyntaxError('SharedArrayBuffer is not supported by this implementation');
	} else {
		// 9. Store the individual bytes of rawBytes into block, in order, starting at block[byteIndex].
		var arr = new $Uint8Array(arrayBuffer, byteIndex, elementSize);
		forEach(rawBytes, function (rawByte, i) {
			arr[i] = rawByte;
		});
	}

	// 10. Return NormalCompletion(undefined).
};

},{"../helpers/defaultEndianness":68,"../helpers/forEach":70,"./IsBigIntElementType":25,"./IsDetachedBuffer":27,"./NumericToRawBytes":33,"./tables/typed-array-objects":61,"es-errors/syntax":127,"es-errors/type":128,"get-intrinsic":143,"hasown":155,"is-array-buffer":157,"is-shared-array-buffer":169,"math-intrinsics/isInteger":180}],37:[function(require,module,exports){
'use strict';

var $TypeError = require('es-errors/type');
var callBound = require('call-bound');
var isInteger = require('math-intrinsics/isInteger');

var $strSlice = callBound('String.prototype.slice');

// https://262.ecma-international.org/15.0/#sec-stringpad

module.exports = function StringPad(S, maxLength, fillString, placement) {
	if (typeof S !== 'string') {
		throw new $TypeError('Assertion failed: `S` must be a String');
	}
	if (!isInteger(maxLength) || maxLength < 0) {
		throw new $TypeError('Assertion failed: `maxLength` must be a non-negative integer');
	}
	if (typeof fillString !== 'string') {
		throw new $TypeError('Assertion failed: `fillString` must be a String');
	}
	if (placement !== 'start' && placement !== 'end' && placement !== 'START' && placement !== 'END') {
		throw new $TypeError('Assertion failed: `placement` must be ~START~ or ~END~');
	}

	var stringLength = S.length; // step 1

	if (maxLength <= stringLength) { return S; } // step 2

	if (fillString === '') { return S; } // step 3

	var fillLen = maxLength - stringLength; // step 4

	// 5. Let _truncatedStringFiller_ be the String value consisting of repeated concatenations of _fillString_ truncated to length _fillLen_.
	var truncatedStringFiller = '';
	while (truncatedStringFiller.length < fillLen) {
		truncatedStringFiller += fillString;
	}
	truncatedStringFiller = $strSlice(truncatedStringFiller, 0, fillLen);

	if (placement === 'start' || placement === 'START') { return truncatedStringFiller + S; } // step 6

	return S + truncatedStringFiller; // step 7
};

},{"call-bound":12,"es-errors/type":128,"math-intrinsics/isInteger":180}],38:[function(require,module,exports){
'use strict';

var GetIntrinsic = require('get-intrinsic');

var $BigInt = GetIntrinsic('%BigInt%', true);
var $TypeError = require('es-errors/type');
var $SyntaxError = require('es-errors/syntax');

// https://262.ecma-international.org/14.0/#sec-stringtobigint

module.exports = function StringToBigInt(argument) {
	if (typeof argument !== 'string') {
		throw new $TypeError('`argument` must be a string');
	}
	if (!$BigInt) {
		throw new $SyntaxError('BigInts are not supported in this environment');
	}
	try {
		return $BigInt(argument);
	} catch (e) {
		return void undefined;
	}
};

},{"es-errors/syntax":127,"es-errors/type":128,"get-intrinsic":143}],39:[function(require,module,exports){
'use strict';

var GetIntrinsic = require('get-intrinsic');

var $RegExp = GetIntrinsic('%RegExp%');
var $TypeError = require('es-errors/type');
var $parseInteger = GetIntrinsic('%parseInt%');

var callBound = require('call-bound');
var regexTester = require('safe-regex-test');

var $strSlice = callBound('String.prototype.slice');
var isBinary = regexTester(/^0b[01]+$/i);
var isOctal = regexTester(/^0o[0-7]+$/i);
var isInvalidHexLiteral = regexTester(/^[-+]0x[0-9a-f]+$/i);
var nonWS = ['\u0085', '\u200b', '\ufffe'].join('');
var nonWSregex = new $RegExp('[' + nonWS + ']', 'g');
var hasNonWS = regexTester(nonWSregex);

var $trim = require('string.prototype.trim');

// https://262.ecma-international.org/13.0/#sec-stringtonumber

module.exports = function StringToNumber(argument) {
	if (typeof argument !== 'string') {
		throw new $TypeError('Assertion failed: `argument` is not a String');
	}
	if (isBinary(argument)) {
		return +$parseInteger($strSlice(argument, 2), 2);
	}
	if (isOctal(argument)) {
		return +$parseInteger($strSlice(argument, 2), 8);
	}
	if (hasNonWS(argument) || isInvalidHexLiteral(argument)) {
		return NaN;
	}
	var trimmed = $trim(argument);
	if (trimmed !== argument) {
		return StringToNumber(trimmed);
	}
	return +argument;
};

},{"call-bound":12,"es-errors/type":128,"get-intrinsic":143,"safe-regex-test":195,"string.prototype.trim":202}],40:[function(require,module,exports){
'use strict';

var GetIntrinsic = require('get-intrinsic');

var $BigInt = GetIntrinsic('%BigInt%', true);
var $Number = GetIntrinsic('%Number%');
var $TypeError = require('es-errors/type');
var $SyntaxError = require('es-errors/syntax');

var StringToBigInt = require('./StringToBigInt');
var ToPrimitive = require('./ToPrimitive');

// https://262.ecma-international.org/13.0/#sec-tobigint

module.exports = function ToBigInt(argument) {
	if (!$BigInt) {
		throw new $SyntaxError('BigInts are not supported in this environment');
	}

	var prim = ToPrimitive(argument, $Number);

	if (prim == null) {
		throw new $TypeError('Cannot convert null or undefined to a BigInt');
	}

	if (typeof prim === 'boolean') {
		return prim ? $BigInt(1) : $BigInt(0);
	}

	if (typeof prim === 'number') {
		throw new $TypeError('Cannot convert a Number value to a BigInt');
	}

	if (typeof prim === 'string') {
		var n = StringToBigInt(prim);
		if (typeof n === 'undefined') {
			throw new $TypeError('Failed to parse String to BigInt');
		}
		return n;
	}

	if (typeof prim === 'symbol') {
		throw new $TypeError('Cannot convert a Symbol value to a BigInt');
	}

	if (typeof prim !== 'bigint') {
		throw new $SyntaxError('Assertion failed: unknown primitive type');
	}

	return prim;
};

},{"./StringToBigInt":38,"./ToPrimitive":48,"es-errors/syntax":127,"es-errors/type":128,"get-intrinsic":143}],41:[function(require,module,exports){
'use strict';

var GetIntrinsic = require('get-intrinsic');

var $BigInt = GetIntrinsic('%BigInt%', true);
var $pow = require('math-intrinsics/pow');

var ToBigInt = require('./ToBigInt');
var BigIntRemainder = require('./BigInt/remainder');

var modBigInt = require('../helpers/modBigInt');

// BigInt(2**63), but node v10.4-v10.8 have a bug where you can't `BigInt(x)` anything larger than MAX_SAFE_INTEGER
var twoSixtyThree = $BigInt && (BigInt($pow(2, 32)) * BigInt($pow(2, 31)));

// BigInt(2**64), but node v10.4-v10.8 have a bug where you can't `BigInt(x)` anything larger than MAX_SAFE_INTEGER
var twoSixtyFour = $BigInt && (BigInt($pow(2, 32)) * BigInt($pow(2, 32)));

// https://262.ecma-international.org/11.0/#sec-tobigint64

module.exports = function ToBigInt64(argument) {
	var n = ToBigInt(argument);
	var int64bit = modBigInt(BigIntRemainder, n, twoSixtyFour);
	return int64bit >= twoSixtyThree ? int64bit - twoSixtyFour : int64bit;
};

},{"../helpers/modBigInt":80,"./BigInt/remainder":20,"./ToBigInt":40,"get-intrinsic":143,"math-intrinsics/pow":186}],42:[function(require,module,exports){
'use strict';

var GetIntrinsic = require('get-intrinsic');

var $BigInt = GetIntrinsic('%BigInt%', true);

var $pow = require('math-intrinsics/pow');

var ToBigInt = require('./ToBigInt');
var BigIntRemainder = require('./BigInt/remainder');

var modBigInt = require('../helpers/modBigInt');

// BigInt(2**64), but node v10.4-v10.8 have a bug where you can't `BigInt(x)` anything larger than MAX_SAFE_INTEGER
var twoSixtyFour = $BigInt && (BigInt($pow(2, 32)) * BigInt($pow(2, 32)));

// https://262.ecma-international.org/11.0/#sec-tobiguint64

module.exports = function ToBigUint64(argument) {
	var n = ToBigInt(argument);
	var int64bit = modBigInt(BigIntRemainder, n, twoSixtyFour);
	return int64bit;
};

},{"../helpers/modBigInt":80,"./BigInt/remainder":20,"./ToBigInt":40,"get-intrinsic":143,"math-intrinsics/pow":186}],43:[function(require,module,exports){
'use strict';

// http://262.ecma-international.org/5.1/#sec-9.2

module.exports = function ToBoolean(value) { return !!value; };

},{}],44:[function(require,module,exports){
'use strict';

var modulo = require('./modulo');
var ToNumber = require('./ToNumber');
var truncate = require('./truncate');

var isFinite = require('math-intrinsics/isFinite');

// https://262.ecma-international.org/14.0/#sec-toint16

var two16 = 0x10000; // Math.pow(2, 16);

module.exports = function ToInt16(argument) {
	var number = ToNumber(argument);
	if (!isFinite(number) || number === 0) {
		return 0;
	}
	var int = truncate(number);
	var int16bit = modulo(int, two16);
	return int16bit >= 0x8000 ? int16bit - two16 : int16bit;
};

},{"./ToNumber":47,"./modulo":59,"./truncate":62,"math-intrinsics/isFinite":179}],45:[function(require,module,exports){
'use strict';

var modulo = require('./modulo');
var ToNumber = require('./ToNumber');
var truncate = require('./truncate');

var isFinite = require('math-intrinsics/isFinite');

// https://262.ecma-international.org/14.0/#sec-toint32

var two31 = 0x80000000; // Math.pow(2, 31);
var two32 = 0x100000000; // Math.pow(2, 32);

module.exports = function ToInt32(argument) {
	var number = ToNumber(argument);
	if (!isFinite(number) || number === 0) {
		return 0;
	}
	var int = truncate(number);
	var int32bit = modulo(int, two32);
	var result = int32bit >= two31 ? int32bit - two32 : int32bit;
	return result === 0 ? 0 : result; // in the spec, these are math values, so we filter out -0 here
};

},{"./ToNumber":47,"./modulo":59,"./truncate":62,"math-intrinsics/isFinite":179}],46:[function(require,module,exports){
'use strict';

var modulo = require('./modulo');
var ToNumber = require('./ToNumber');
var truncate = require('./truncate');

var isFinite = require('math-intrinsics/isFinite');

// https://262.ecma-international.org/14.0/#sec-toint8

module.exports = function ToInt8(argument) {
	var number = ToNumber(argument);
	if (!isFinite(number) || number === 0) {
		return 0;
	}
	var int = truncate(number);
	var int8bit = modulo(int, 0x100);
	return int8bit >= 0x80 ? int8bit - 0x100 : int8bit;
};

},{"./ToNumber":47,"./modulo":59,"./truncate":62,"math-intrinsics/isFinite":179}],47:[function(require,module,exports){
'use strict';

var GetIntrinsic = require('get-intrinsic');

var $TypeError = require('es-errors/type');
var $Number = GetIntrinsic('%Number%');
var isPrimitive = require('../helpers/isPrimitive');

var ToPrimitive = require('./ToPrimitive');
var StringToNumber = require('./StringToNumber');

// https://262.ecma-international.org/13.0/#sec-tonumber

module.exports = function ToNumber(argument) {
	var value = isPrimitive(argument) ? argument : ToPrimitive(argument, $Number);
	if (typeof value === 'symbol') {
		throw new $TypeError('Cannot convert a Symbol value to a number');
	}
	if (typeof value === 'bigint') {
		throw new $TypeError('Conversion from \'BigInt\' to \'number\' is not allowed.');
	}
	if (typeof value === 'string') {
		return StringToNumber(value);
	}
	return +value;
};

},{"../helpers/isPrimitive":77,"./StringToNumber":39,"./ToPrimitive":48,"es-errors/type":128,"get-intrinsic":143}],48:[function(require,module,exports){
'use strict';

var toPrimitive = require('es-to-primitive/es2015');

// https://262.ecma-international.org/6.0/#sec-toprimitive

module.exports = function ToPrimitive(input) {
	if (arguments.length > 1) {
		return toPrimitive(input, arguments[1]);
	}
	return toPrimitive(input);
};

},{"es-to-primitive/es2015":133}],49:[function(require,module,exports){
'use strict';

var GetIntrinsic = require('get-intrinsic');

var $String = GetIntrinsic('%String%');
var $TypeError = require('es-errors/type');

// https://262.ecma-international.org/6.0/#sec-tostring

module.exports = function ToString(argument) {
	if (typeof argument === 'symbol') {
		throw new $TypeError('Cannot convert a Symbol value to a string');
	}
	return $String(argument);
};

},{"es-errors/type":128,"get-intrinsic":143}],50:[function(require,module,exports){
'use strict';

var modulo = require('./modulo');
var ToNumber = require('./ToNumber');
var truncate = require('./truncate');

var isFinite = require('math-intrinsics/isFinite');

// https://262.ecma-international.org/14.0/#sec-touint16

var two16 = 0x10000; // Math.pow(2, 16)

module.exports = function ToUint16(argument) {
	var number = ToNumber(argument);
	if (!isFinite(number) || number === 0) {
		return 0;
	}
	var int = truncate(number);
	var int16bit = modulo(int, two16);
	return int16bit === 0 ? 0 : int16bit; // in the spec, these are math values, so we filter out -0 here
};

},{"./ToNumber":47,"./modulo":59,"./truncate":62,"math-intrinsics/isFinite":179}],51:[function(require,module,exports){
'use strict';

var modulo = require('./modulo');
var ToNumber = require('./ToNumber');
var truncate = require('./truncate');

var isFinite = require('math-intrinsics/isFinite');

// https://262.ecma-international.org/14.0/#sec-touint32

var two32 = 0x100000000; // Math.pow(2, 32);

module.exports = function ToUint32(argument) {
	var number = ToNumber(argument);
	if (!isFinite(number) || number === 0) {
		return 0;
	}
	var int = truncate(number);
	var int32bit = modulo(int, two32);
	return int32bit === 0 ? 0 : int32bit; // in the spec, these are math values, so we filter out -0 here
};

},{"./ToNumber":47,"./modulo":59,"./truncate":62,"math-intrinsics/isFinite":179}],52:[function(require,module,exports){
'use strict';

var isFinite = require('math-intrinsics/isFinite');

var modulo = require('./modulo');
var ToNumber = require('./ToNumber');
var truncate = require('./truncate');

// https://262.ecma-international.org/14.0/#sec-touint8

module.exports = function ToUint8(argument) {
	var number = ToNumber(argument);
	if (!isFinite(number) || number === 0) {
		return 0;
	}
	var int = truncate(number);
	var int8bit = modulo(int, 0x100);
	return int8bit;
};

},{"./ToNumber":47,"./modulo":59,"./truncate":62,"math-intrinsics/isFinite":179}],53:[function(require,module,exports){
'use strict';

var clamp = require('./clamp');

var ToNumber = require('./ToNumber');
var floor = require('./floor');

var $isNaN = require('math-intrinsics/isNaN');

// https://262.ecma-international.org/15.0/#sec-touint8clamp

module.exports = function ToUint8Clamp(argument) {
	var number = ToNumber(argument); // step 1

	if ($isNaN(number)) { return 0; } // step 2

	var clamped = clamp(number, 0, 255); // step 4

	var f = floor(clamped); // step 5

	if (clamped < (f + 0.5)) { return f; } // step 6

	if (clamped > (f + 0.5)) { return f + 1; } // step 7

	return f % 2 === 0 ? f : f + 1; // step 8
};

},{"./ToNumber":47,"./clamp":57,"./floor":58,"math-intrinsics/isNaN":181}],54:[function(require,module,exports){
'use strict';

var ES5Type = require('../5/Type');

// https://262.ecma-international.org/11.0/#sec-ecmascript-data-types-and-values

module.exports = function Type(x) {
	if (typeof x === 'symbol') {
		return 'Symbol';
	}
	if (typeof x === 'bigint') {
		return 'BigInt';
	}
	return ES5Type(x);
};

},{"../5/Type":63}],55:[function(require,module,exports){
'use strict';

var $SyntaxError = require('es-errors/syntax');
var $TypeError = require('es-errors/type');
var isInteger = require('math-intrinsics/isInteger');
var whichTypedArray = require('which-typed-array');

// https://262.ecma-international.org/13.0/#sec-typedarrayelementsize

var tableTAO = require('./tables/typed-array-objects');

module.exports = function TypedArrayElementSize(O) {
	var type = whichTypedArray(O);
	if (!type) {
		throw new $TypeError('Assertion failed: `O` must be a TypedArray');
	}
	var size = tableTAO.size['$' + tableTAO.name['$' + type]];
	if (!isInteger(size) || size < 0) {
		throw new $SyntaxError('Assertion failed: Unknown TypedArray type `' + type + '`');
	}

	return size;
};

},{"./tables/typed-array-objects":61,"es-errors/syntax":127,"es-errors/type":128,"math-intrinsics/isInteger":180,"which-typed-array":212}],56:[function(require,module,exports){
'use strict';

var $TypeError = require('es-errors/type');

var floor = require('./floor');
var IsFixedLengthArrayBuffer = require('./IsFixedLengthArrayBuffer');
var IsTypedArrayOutOfBounds = require('./IsTypedArrayOutOfBounds');
var TypedArrayElementSize = require('./TypedArrayElementSize');

var isTypedArrayWithBufferWitnessRecord = require('../helpers/records/typed-array-with-buffer-witness-record');

var typedArrayBuffer = require('typed-array-buffer');
var typedArrayByteOffset = require('typed-array-byte-offset');
var typedArrayLength = require('typed-array-length');

// https://www.ecma-international.org/ecma-262/15.0/#sec-typedarraylength

module.exports = function TypedArrayLength(taRecord) {
	if (!isTypedArrayWithBufferWitnessRecord(taRecord)) {
		throw new $TypeError('Assertion failed: `taRecord` must be a TypedArray With Buffer Witness Record');
	}

	if (IsTypedArrayOutOfBounds(taRecord)) {
		throw new $TypeError('Assertion failed: `taRecord` is out of bounds'); // step 1
	}

	var O = taRecord['[[Object]]']; // step 2

	var isFixed = IsFixedLengthArrayBuffer(typedArrayBuffer(O));

	var length = isFixed ? typedArrayLength(O) : 'AUTO';
	if (length !== 'AUTO') {
		return length; // step 3
	}

	if (isFixed) {
		throw new $TypeError('Assertion failed: array buffer is not fixed length'); // step 4
	}

	var byteOffset = typedArrayByteOffset(O); // step 5

	var elementSize = TypedArrayElementSize(O); // step 6

	var byteLength = taRecord['[[CachedBufferByteLength]]']; // step 7

	if (byteLength === 'DETACHED') {
		throw new $TypeError('Assertion failed: typed array is detached'); // step 8
	}

	return floor((byteLength - byteOffset) / elementSize); // step 9
};

},{"../helpers/records/typed-array-with-buffer-witness-record":81,"./IsFixedLengthArrayBuffer":28,"./IsTypedArrayOutOfBounds":29,"./TypedArrayElementSize":55,"./floor":58,"es-errors/type":128,"typed-array-buffer":205,"typed-array-byte-offset":206,"typed-array-length":207}],57:[function(require,module,exports){
'use strict';

var $TypeError = require('es-errors/type');
var max = require('math-intrinsics/max');
var min = require('math-intrinsics/min');

// https://262.ecma-international.org/12.0/#clamping

module.exports = function clamp(x, lower, upper) {
	if (typeof x !== 'number' || typeof lower !== 'number' || typeof upper !== 'number' || !(lower <= upper)) {
		throw new $TypeError('Assertion failed: all three arguments must be MVs, and `lower` must be `<= upper`');
	}
	return min(max(lower, x), upper);
};

},{"es-errors/type":128,"math-intrinsics/max":183,"math-intrinsics/min":184}],58:[function(require,module,exports){
'use strict';

// var modulo = require('./modulo');
var $floor = require('math-intrinsics/floor');

// http://262.ecma-international.org/11.0/#eqn-floor

module.exports = function floor(x) {
	// return x - modulo(x, 1);
	if (typeof x === 'bigint') {
		return x;
	}
	return $floor(x);
};

},{"math-intrinsics/floor":178}],59:[function(require,module,exports){
'use strict';

var mod = require('../helpers/mod');

// https://262.ecma-international.org/5.1/#sec-5.2

module.exports = function modulo(x, y) {
	return mod(x, y);
};

},{"../helpers/mod":79}],60:[function(require,module,exports){
'use strict';

var $TypeError = require('es-errors/type');
var isInteger = require('math-intrinsics/isInteger');
var callBound = require('call-bound');

var $slice = callBound('String.prototype.slice');

// https://262.ecma-international.org/12.0/#substring
module.exports = function substring(S, inclusiveStart, exclusiveEnd) {
	if (typeof S !== 'string' || !isInteger(inclusiveStart) || (arguments.length > 2 && !isInteger(exclusiveEnd))) {
		throw new $TypeError('`S` must be a String, and `inclusiveStart` and `exclusiveEnd` must be integers');
	}
	return $slice(S, inclusiveStart, arguments.length > 2 ? exclusiveEnd : S.length);
};

},{"call-bound":12,"es-errors/type":128,"math-intrinsics/isInteger":180}],61:[function(require,module,exports){
'use strict';

// https://262.ecma-international.org/15.0/#table-the-typedarray-constructors

module.exports = {
	__proto__: null,
	name: {
		__proto__: null,
		$Int8Array: 'INT8',
		$Uint8Array: 'UINT8',
		$Uint8ClampedArray: 'UINT8C',
		$Int16Array: 'INT16',
		$Uint16Array: 'UINT16',
		$Int32Array: 'INT32',
		$Uint32Array: 'UINT32',
		$BigInt64Array: 'BIGINT64',
		$BigUint64Array: 'BIGUINT64',
		$Float32Array: 'FLOAT32',
		$Float64Array: 'FLOAT64'
	},
	size: {
		__proto__: null,
		$INT8: 1,
		$UINT8: 1,
		$UINT8C: 1,
		$INT16: 2,
		$UINT16: 2,
		$INT32: 4,
		$UINT32: 4,
		$BIGINT64: 8,
		$BIGUINT64: 8,
		$FLOAT32: 4,
		$FLOAT64: 8
	},
	choices: '"INT8", "UINT8", "UINT8C", "INT16", "UINT16", "INT32", "UINT32", "BIGINT64", "BIGUINT64", "FLOAT32", or "FLOAT64"'
};

},{}],62:[function(require,module,exports){
'use strict';

var floor = require('./floor');

var $TypeError = require('es-errors/type');

// https://262.ecma-international.org/14.0/#eqn-truncate

module.exports = function truncate(x) {
	if (typeof x !== 'number' && typeof x !== 'bigint') {
		throw new $TypeError('argument must be a Number or a BigInt');
	}
	var result = x < 0 ? -floor(-x) : floor(x);
	return result === 0 ? 0 : result; // in the spec, these are math values, so we filter out -0 here
};

},{"./floor":58,"es-errors/type":128}],63:[function(require,module,exports){
'use strict';

var isObject = require('es-object-atoms/isObject');

// https://262.ecma-international.org/5.1/#sec-8

module.exports = function Type(x) {
	if (x === null) {
		return 'Null';
	}
	if (typeof x === 'undefined') {
		return 'Undefined';
	}
	if (isObject(x)) {
		return 'Object';
	}
	if (typeof x === 'number') {
		return 'Number';
	}
	if (typeof x === 'boolean') {
		return 'Boolean';
	}
	if (typeof x === 'string') {
		return 'String';
	}
};

},{"es-object-atoms/isObject":132}],64:[function(require,module,exports){
'use strict';

var GetIntrinsic = require('get-intrinsic');

var $Array = GetIntrinsic('%Array%');

// eslint-disable-next-line global-require
var toStr = !$Array.isArray && require('call-bound')('Object.prototype.toString');

module.exports = $Array.isArray || function IsArray(argument) {
	return toStr(argument) === '[object Array]';
};

},{"call-bound":12,"get-intrinsic":143}],65:[function(require,module,exports){
'use strict';

var $pow = require('math-intrinsics/pow');

module.exports = function bytesAsFloat32(rawBytes) {
	// return new $Float32Array(new $Uint8Array(rawBytes).buffer)[0];

	/*
        Let value be the byte elements of rawBytes concatenated and interpreted as a little-endian bit string encoding of an IEEE 754-2008 binary32 value.
If value is an IEEE 754-2008 binary32 NaN value, return the NaN Number value.
Return the Number value that corresponds to value.
        */
	var sign = rawBytes[3] & 0x80 ? -1 : 1; // Check the sign bit
	var exponent = ((rawBytes[3] & 0x7F) << 1)
		| (rawBytes[2] >> 7); // Combine bits for exponent
	var mantissa = ((rawBytes[2] & 0x7F) << 16)
		| (rawBytes[1] << 8)
		| rawBytes[0]; // Combine bits for mantissa

	if (exponent === 0 && mantissa === 0) {
		return sign === 1 ? 0 : -0;
	}
	if (exponent === 0xFF && mantissa === 0) {
		return sign === 1 ? Infinity : -Infinity;
	}
	if (exponent === 0xFF && mantissa !== 0) {
		return NaN;
	}

	exponent -= 127; // subtract the bias

	if (exponent === -127) {
		return sign * mantissa * $pow(2, -126 - 23);
	}
	return sign * (1 + (mantissa * $pow(2, -23))) * $pow(2, exponent);
};

},{"math-intrinsics/pow":186}],66:[function(require,module,exports){
'use strict';

var $pow = require('math-intrinsics/pow');

module.exports = function bytesAsFloat64(rawBytes) {
	// return new $Float64Array(new $Uint8Array(rawBytes).buffer)[0];

	/*
    Let value be the byte elements of rawBytes concatenated and interpreted as a little-endian bit string encoding of an IEEE 754-2008 binary64 value.
If value is an IEEE 754-2008 binary64 NaN value, return the NaN Number value.
Return the Number value that corresponds to value.
    */
	var sign = rawBytes[7] & 0x80 ? -1 : 1; // first bit
	var exponent = ((rawBytes[7] & 0x7F) << 4) // 7 bits from index 7
        | ((rawBytes[6] & 0xF0) >> 4); // 4 bits from index 6
	var mantissa = ((rawBytes[6] & 0x0F) * 0x1000000000000) // 4 bits from index 6
        + (rawBytes[5] * 0x10000000000) // 8 bits from index 5
        + (rawBytes[4] * 0x100000000) // 8 bits from index 4
        + (rawBytes[3] * 0x1000000) // 8 bits from index 3
        + (rawBytes[2] * 0x10000) // 8 bits from index 2
        + (rawBytes[1] * 0x100) // 8 bits from index 1
        + rawBytes[0]; // 8 bits from index 0

	if (exponent === 0 && mantissa === 0) {
		return sign * 0;
	}
	if (exponent === 0x7FF && mantissa !== 0) {
		return NaN;
	}
	if (exponent === 0x7FF && mantissa === 0) {
		return sign * Infinity;
	}

	exponent -= 1023; // subtract the bias

	// Handle subnormal numbers
	if (exponent === -1023) {
		return sign * mantissa * 5e-324; // $pow(2, -1022 - 52)
	}

	return sign * (1 + (mantissa / 0x10000000000000)) * $pow(2, exponent);
};

},{"math-intrinsics/pow":186}],67:[function(require,module,exports){
'use strict';

var GetIntrinsic = require('get-intrinsic');

var $pow = require('math-intrinsics/pow');

var $Number = GetIntrinsic('%Number%');
var $BigInt = GetIntrinsic('%BigInt%', true);

module.exports = function bytesAsInteger(rawBytes, elementSize, isUnsigned, isBigInt) {
	var Z = isBigInt ? $BigInt : $Number;

	// this is common to both branches
	var intValue = Z(0);
	for (var i = 0; i < rawBytes.length; i++) {
		intValue += Z(rawBytes[i] * $pow(2, 8 * i));
	}
	/*
	Let intValue be the byte elements of rawBytes concatenated and interpreted as a bit string encoding of an unsigned little-endian binary number.
	*/

	if (!isUnsigned) { // steps 5-6
		// Let intValue be the byte elements of rawBytes concatenated and interpreted as a bit string encoding of a binary little-endian 2's complement number of bit length elementSize × 8.
		var bitLength = elementSize * 8;

		if (rawBytes[elementSize - 1] & 0x80) {
			intValue -= Z($pow(2, bitLength));
		}
	}

	return intValue; // step 7
};

},{"get-intrinsic":143,"math-intrinsics/pow":186}],68:[function(require,module,exports){
'use strict';

var GetIntrinsic = require('get-intrinsic');

var $Uint8Array = GetIntrinsic('%Uint8Array%', true);
var $Uint32Array = GetIntrinsic('%Uint32Array%', true);

var typedArrayBuffer = require('typed-array-buffer');

var uInt32 = $Uint32Array && new $Uint32Array([0x12345678]);
var uInt8 = uInt32 && new $Uint8Array(typedArrayBuffer(uInt32));

module.exports = uInt8
	? uInt8[0] === 0x78
		? 'little'
		: uInt8[0] === 0x12
			? 'big'
			: uInt8[0] === 0x34
				? 'mixed' // https://developer.mozilla.org/en-US/docs/Glossary/Endianness
				: 'unknown' // ???
	: 'indeterminate'; // no way to know

},{"get-intrinsic":143,"typed-array-buffer":205}],69:[function(require,module,exports){
'use strict';

module.exports = function every(array, predicate) {
	for (var i = 0; i < array.length; i += 1) {
		if (!predicate(array[i], i, array)) {
			return false;
		}
	}
	return true;
};

},{}],70:[function(require,module,exports){
'use strict';

module.exports = function forEach(array, callback) {
	for (var i = 0; i < array.length; i += 1) {
		callback(array[i], i, array); // eslint-disable-line callback-return
	}
};

},{}],71:[function(require,module,exports){
'use strict';

var MAX_ITER = 1075; // 1023+52 (subnormals) => BIAS+NUM_SIGNFICAND_BITS-1
var maxBits = 54; // only 53 bits for fraction

module.exports = function fractionToBitString(x) {
	var str = '';
	if (x === 0) {
		return str;
	}
	var j = MAX_ITER;

	var y;
	// Each time we multiply by 2 and find a ones digit, add a '1'; otherwise, add a '0'..
	for (var i = 0; i < MAX_ITER; i += 1) {
		y = x * 2;
		if (y >= 1) {
			x = y - 1; // eslint-disable-line no-param-reassign
			str += '1';
			if (j === MAX_ITER) {
				j = i; // first 1
			}
		} else {
			x = y; // eslint-disable-line no-param-reassign
			str += '0';
		}
		// Stop when we have no more decimals to process or in the event we found a fraction which cannot be represented in a finite number of bits...
		if (y === 1 || i - j > maxBits) {
			return str;
		}
	}
	return str;
};

},{}],72:[function(require,module,exports){
'use strict';

var $floor = require('math-intrinsics/floor');

// https://runestone.academy/ns/books/published/pythonds/BasicDS/ConvertingDecimalNumberstoBinaryNumbers.html#:~:text=The%20Divide%20by%202%20algorithm,have%20a%20remainder%20of%200

module.exports = function intToBinaryString(x) {
	var str = '';
	var y;

	while (x > 0) {
		y = x / 2;
		x = $floor(y); // eslint-disable-line no-param-reassign
		if (y === x) {
			str = '0' + str;
		} else {
			str = '1' + str;
		}
	}
	return str;
};

},{"math-intrinsics/floor":178}],73:[function(require,module,exports){
'use strict';

var GetIntrinsic = require('get-intrinsic');

var $Number = GetIntrinsic('%Number%');
var $BigInt = GetIntrinsic('%BigInt%', true);

module.exports = function integerToNBytes(intValue, n, isLittleEndian) {
	var Z = typeof intValue === 'bigint' ? $BigInt : $Number;
	/*
	if (intValue >= 0) { // step 3.d
		// Let rawBytes be a List containing the n-byte binary encoding of intValue. If isLittleEndian is false, the bytes are ordered in big endian order. Otherwise, the bytes are ordered in little endian order.
	} else { // step 3.e
		// Let rawBytes be a List containing the n-byte binary 2's complement encoding of intValue. If isLittleEndian is false, the bytes are ordered in big endian order. Otherwise, the bytes are ordered in little endian order.
	}
    */
	if (intValue < 0) {
		intValue >>>= 0; // eslint-disable-line no-param-reassign
	}

	var rawBytes = [];
	for (var i = 0; i < n; i++) {
		rawBytes[isLittleEndian ? i : n - 1 - i] = $Number(intValue & Z(0xFF));
		intValue >>= Z(8); // eslint-disable-line no-param-reassign
	}

	return rawBytes; // step 4
};

},{"get-intrinsic":143}],74:[function(require,module,exports){
'use strict';

module.exports = function isByteValue(value) {
	return typeof value === 'number' && value >= 0 && value <= 255 && (value | 0) === value;
};

},{}],75:[function(require,module,exports){
'use strict';

// TODO, semver-major: delete
module.exports = require('math-intrinsics/isInteger');

},{"math-intrinsics/isInteger":180}],76:[function(require,module,exports){
'use strict';

// TODO: remove, semver-major

module.exports = require('es-object-atoms/isObject');

},{"es-object-atoms/isObject":132}],77:[function(require,module,exports){
'use strict';

module.exports = function isPrimitive(value) {
	return value === null || (typeof value !== 'function' && typeof value !== 'object');
};

},{}],78:[function(require,module,exports){
'use strict';

module.exports = function isPropertyKey(argument) {
	return typeof argument === 'string' || typeof argument === 'symbol';
};

},{}],79:[function(require,module,exports){
'use strict';

// TODO, semver-major: delete
module.exports = require('math-intrinsics/mod');

},{"math-intrinsics/mod":185}],80:[function(require,module,exports){
'use strict';

module.exports = function bigIntMod(BigIntRemainder, bigint, modulo) {
	var remain = BigIntRemainder(bigint, modulo);
	return remain >= 0 ? remain : remain + modulo;
};

},{}],81:[function(require,module,exports){
'use strict';

var hasOwn = require('hasown');
var isTypedArray = require('is-typed-array');

var isInteger = require('../isInteger');

module.exports = function isTypedArrayWithBufferWitnessRecord(value) {
	return !!value
		&& typeof value === 'object'
		&& hasOwn(value, '[[Object]]')
		&& hasOwn(value, '[[CachedBufferByteLength]]')
		&& (
			(isInteger(value['[[CachedBufferByteLength]]']) && value['[[CachedBufferByteLength]]'] >= 0)
			|| value['[[CachedBufferByteLength]]'] === 'DETACHED'
		)
		&& isTypedArray(value['[[Object]]']);
};

},{"../isInteger":75,"hasown":155,"is-typed-array":172}],82:[function(require,module,exports){
'use strict';

var $abs = require('math-intrinsics/abs');
var $floor = require('math-intrinsics/floor');
var $pow = require('math-intrinsics/pow');

var isFinite = require('math-intrinsics/isFinite');
var isNaN = require('math-intrinsics/isNaN');
var isNegativeZero = require('math-intrinsics/isNegativeZero');

var maxFiniteFloat32 = 3.4028234663852886e+38; // roughly 2 ** 128 - 1

module.exports = function valueToFloat32Bytes(value, isLittleEndian) {
	if (isNaN(value)) {
		return isLittleEndian ? [0, 0, 192, 127] : [127, 192, 0, 0]; // hardcoded
	}

	var leastSig;

	if (value === 0) {
		leastSig = isNegativeZero(value) ? 0x80 : 0;
		return isLittleEndian ? [0, 0, 0, leastSig] : [leastSig, 0, 0, 0];
	}

	if ($abs(value) > maxFiniteFloat32 || !isFinite(value)) {
		leastSig = value < 0 ? 255 : 127;
		return isLittleEndian ? [0, 0, 128, leastSig] : [leastSig, 128, 0, 0];
	}

	var sign = value < 0 ? 1 : 0;
	value = $abs(value); // eslint-disable-line no-param-reassign

	var exponent = 0;
	while (value >= 2) {
		exponent += 1;
		value /= 2; // eslint-disable-line no-param-reassign
	}

	while (value < 1) {
		exponent -= 1;
		value *= 2; // eslint-disable-line no-param-reassign
	}

	var mantissa = value - 1;
	mantissa *= $pow(2, 23) + 0.5;
	mantissa = $floor(mantissa);

	exponent += 127;
	exponent <<= 23;

	var result = (sign << 31)
        | exponent
        | mantissa;

	var byte0 = result & 255;
	result >>= 8;
	var byte1 = result & 255;
	result >>= 8;
	var byte2 = result & 255;
	result >>= 8;
	var byte3 = result & 255;

	if (isLittleEndian) {
		return [byte0, byte1, byte2, byte3];
	}
	return [byte3, byte2, byte1, byte0];
};

},{"math-intrinsics/abs":176,"math-intrinsics/floor":178,"math-intrinsics/isFinite":179,"math-intrinsics/isNaN":181,"math-intrinsics/isNegativeZero":182,"math-intrinsics/pow":186}],83:[function(require,module,exports){
'use strict';

var GetIntrinsic = require('get-intrinsic');

var $parseInt = GetIntrinsic('%parseInt%');
var $abs = require('math-intrinsics/abs');
var $floor = require('math-intrinsics/floor');
var isNegativeZero = require('math-intrinsics/isNegativeZero');

var callBound = require('call-bound');

var $strIndexOf = callBound('String.prototype.indexOf');
var $strSlice = callBound('String.prototype.slice');

var fractionToBitString = require('../helpers/fractionToBinaryString');
var intToBinString = require('../helpers/intToBinaryString');

var float64bias = 1023;

var elevenOnes = '11111111111';
var elevenZeroes = '00000000000';
var fiftyOneZeroes = elevenZeroes + elevenZeroes + elevenZeroes + elevenZeroes + '0000000';

// IEEE 754-1985
module.exports = function valueToFloat64Bytes(value, isLittleEndian) {
	var signBit = value < 0 || isNegativeZero(value) ? '1' : '0';
	var exponentBits;
	var significandBits;

	if (isNaN(value)) {
		exponentBits = elevenOnes;
		significandBits = '1' + fiftyOneZeroes;
	} else if (!isFinite(value)) {
		exponentBits = elevenOnes;
		significandBits = '0' + fiftyOneZeroes;
	} else if (value === 0) {
		exponentBits = elevenZeroes;
		significandBits = '0' + fiftyOneZeroes;
	} else {
		value = $abs(value); // eslint-disable-line no-param-reassign

		// Isolate the integer part (digits before the decimal):
		var integerPart = $floor(value);

		var intBinString = intToBinString(integerPart); // bit string for integer part
		var fracBinString = fractionToBitString(value - integerPart); // bit string for fractional part

		var numberOfBits;
		// find exponent needed to normalize integer+fractional parts
		if (intBinString) {
			exponentBits = intBinString.length - 1; // move the decimal to the left
		} else {
			var first1 = $strIndexOf(fracBinString, '1');
			if (first1 > -1) {
				numberOfBits = first1 + 1;
			}
			exponentBits = -numberOfBits; // move the decimal to the right
		}

		significandBits = intBinString + fracBinString;
		if (exponentBits < 0) {
			// subnormals
			if (exponentBits <= -float64bias) {
				numberOfBits = float64bias - 1; // limit number of removed bits
			}
			significandBits = $strSlice(significandBits, numberOfBits); // remove all leading 0s and the first 1 for normal values; for subnormals, remove up to `float64bias - 1` leading bits
		} else {
			significandBits = $strSlice(significandBits, 1); // remove the leading '1' (implicit/hidden bit)
		}
		exponentBits = $strSlice(elevenZeroes + intToBinString(exponentBits + float64bias), -11); // Convert the exponent to a bit string

		significandBits = $strSlice(significandBits + fiftyOneZeroes + '0', 0, 52); // fill in any trailing zeros and ensure we have only 52 fraction bits
	}

	var bits = signBit + exponentBits + significandBits;
	var rawBytes = [];
	for (var i = 0; i < 8; i++) {
		var targetIndex = isLittleEndian ? 8 - i - 1 : i;
		rawBytes[targetIndex] = $parseInt($strSlice(bits, i * 8, (i + 1) * 8), 2);
	}

	return rawBytes;
};

},{"../helpers/fractionToBinaryString":71,"../helpers/intToBinaryString":72,"call-bound":12,"get-intrinsic":143,"math-intrinsics/abs":176,"math-intrinsics/floor":178,"math-intrinsics/isNegativeZero":182}],84:[function(require,module,exports){
'use strict';

var GetIntrinsic = require('get-intrinsic');

var $SyntaxError = require('es-errors/syntax');
var $TypeError = require('es-errors/type');
var $Uint8Array = GetIntrinsic('%Uint8Array%', true);

var FromBase64 = require('../aos/FromBase64');
var Get = require('es-abstract/2024/Get');
var GetOptionsObject = require('../aos/GetOptionsObject');

module.exports = function fromBase64(string) {
	if (!$Uint8Array) {
		throw new $SyntaxError('This environment does not support Uint8Array');
	}

	if (typeof string !== 'string') {
		throw new $TypeError('`string` is not a string: ' + typeof string); // step 1
	}

	var opts = GetOptionsObject(arguments.length > 1 ? arguments[1] : void undefined); // step 2

	var alphabet = Get(opts, 'alphabet'); // step 3

	if (typeof alphabet === 'undefined') {
		alphabet = 'base64'; // step 4
	}

	if (alphabet !== 'base64' && alphabet !== 'base64url') {
		throw new $TypeError('Assertion failed: `alphabet` is not `\'base64\'` or `\'base64url\'`: ' + (typeof alphabet === 'string' ? alphabet : typeof alphabet)); // step 5
	}

	var lastChunkHandling = Get(opts, 'lastChunkHandling'); // step 6

	if (typeof lastChunkHandling === 'undefined') {
		lastChunkHandling = 'loose'; // step 7
	}

	if (lastChunkHandling !== 'loose' && lastChunkHandling !== 'strict' && lastChunkHandling !== 'stop-before-partial') {
		throw new $TypeError('`lastChunkHandling` must be `\'loose\'`, `\'strict\'`, or `\'stop-before-partial\'`'); // step 8
	}

	var result = FromBase64(string, alphabet, lastChunkHandling); // step 9

	if (result['[[Error]]']) { // step 10
		throw result['[[Error]]']; // step 10.a
	}

	// var resultLength = result['[[Bytes]]']; // step 11

	// 12. Let ta be ? AllocateTypedArray("Uint8Array", %Uint8Array%, "%Uint8Array.prototype%", resultLength).

	// 13. Set the value at each index of ta.[[ViewedArrayBuffer]].[[ArrayBufferData]] to the value at the corresponding index of result.[[Bytes]].

	// 14. Return ta.

	return new $Uint8Array(result['[[Bytes]]']); // step 11 - 14
};

},{"../aos/FromBase64":110,"../aos/GetOptionsObject":112,"es-abstract/2024/Get":21,"es-errors/syntax":127,"es-errors/type":128,"get-intrinsic":143}],85:[function(require,module,exports){
'use strict';

var callBind = require('call-bind');
var define = require('define-properties');

var implementation = require('./implementation');
var getPolyfill = require('./polyfill');
var shim = require('./shim');

var bound = callBind(getPolyfill(), null);

define(bound, {
	getPolyfill: getPolyfill,
	implementation: implementation,
	shim: shim
});

module.exports = bound;

},{"./implementation":84,"./polyfill":86,"./shim":87,"call-bind":11,"define-properties":14}],86:[function(require,module,exports){
'use strict';

var implementation = require('./implementation');

module.exports = function getPolyfill() {
	return typeof Uint8Array === 'function' && typeof Uint8Array.fromBase64 === 'function' ? Uint8Array.fromBase64 : implementation;
};

},{"./implementation":84}],87:[function(require,module,exports){
'use strict';

var getPolyfill = require('./polyfill');
var define = require('define-properties');

module.exports = function shimUint8ArrayFromBase64() {
	var polyfill = getPolyfill();

	if (typeof Uint8Array === 'function') {
		define(
			Uint8Array,
			{ fromBase64: polyfill },
			{ fromBase64: function () { return Uint8Array.fromBase64 !== polyfill; } }
		);
	}

	return polyfill;
};

},{"./polyfill":86,"define-properties":14}],88:[function(require,module,exports){
'use strict';

var GetIntrinsic = require('get-intrinsic');

var $SyntaxError = require('es-errors/syntax');
var $TypeError = require('es-errors/type');
var $Uint8Array = GetIntrinsic('%Uint8Array%', true);

var FromHex = require('../aos/FromHex');

module.exports = function fromHex(string) {
	if (!$Uint8Array) {
		throw new $SyntaxError('This environment does not support Uint8Array'); // step 1
	}

	if (typeof string !== 'string') {
		throw new $TypeError('`string` is not a string: ' + typeof string); // step 1
	}

	var result = FromHex(string); // step 2

	if (result['[[Error]]']) { // step 3
		throw result['[[Error]]']; // step 3.a
	}

	// var resultLength = result['[[Bytes]]']; // step 4

	// 5. Let ta be ? AllocateTypedArray("Uint8Array", %Uint8Array%, "%Uint8Array.prototype%", resultLength).

	// 6. Set the value at each index of ta.[[ViewedArrayBuffer]].[[ArrayBufferData]] to the value at the corresponding index of result.[[Bytes]].

	// 7. Return ta.

	return new $Uint8Array(result['[[Bytes]]']); // steps 4 - 7
};

},{"../aos/FromHex":111,"es-errors/syntax":127,"es-errors/type":128,"get-intrinsic":143}],89:[function(require,module,exports){
arguments[4][85][0].apply(exports,arguments)
},{"./implementation":88,"./polyfill":90,"./shim":91,"call-bind":11,"define-properties":14,"dup":85}],90:[function(require,module,exports){
'use strict';

var implementation = require('./implementation');

module.exports = function getPolyfill() {
	return typeof Uint8Array === 'function' && typeof Uint8Array.fromHex === 'function' ? Uint8Array.fromHex : implementation;
};

},{"./implementation":88}],91:[function(require,module,exports){
'use strict';

var getPolyfill = require('./polyfill');
var define = require('define-properties');

module.exports = function shimUint8ArrayFromHex() {
	var polyfill = getPolyfill();

	if (typeof Uint8Array === 'function') {
		define(
			Uint8Array,
			{ fromHex: polyfill },
			{ fromHex: function () { return Uint8Array.fromHex !== polyfill; } }
		);
	}

	return polyfill;
};

},{"./polyfill":90,"define-properties":14}],92:[function(require,module,exports){
'use strict';

var GetIntrinsic = require('get-intrinsic');

var $SyntaxError = require('es-errors/syntax');
var $TypeError = require('es-errors/type');
var $Uint8Array = GetIntrinsic('%Uint8Array%', true);

var FromBase64 = require('../aos/FromBase64');
var Get = require('es-abstract/2024/Get');
var GetOptionsObject = require('../aos/GetOptionsObject');
var IsTypedArrayOutOfBounds = require('es-abstract/2024/IsTypedArrayOutOfBounds');
var MakeTypedArrayWithBufferWitnessRecord = require('es-abstract/2024/MakeTypedArrayWithBufferWitnessRecord');
var SetUint8ArrayBytes = require('../aos/SetUint8ArrayBytes');
var SetValueInBuffer = require('es-abstract/2024/SetValueInBuffer');
var TypedArrayLength = require('es-abstract/2024/TypedArrayLength');
var ValidateUint8Array = require('../aos/ValidateUint8Array');

var typedArrayByteOffset = require('typed-array-byte-offset');
var typedArrayBuffer = require('typed-array-buffer');

module.exports = function setFromBase64(string) {
	if (!$Uint8Array) {
		throw new $SyntaxError('This environment does not support Uint8Array');
	}

	var into = this; // step 1

	ValidateUint8Array(into); // step 2

	if (typeof string !== 'string') {
		throw new $TypeError('`string` is not a string: ' + typeof string); // step 3
	}

	var opts = GetOptionsObject(arguments.length > 1 ? arguments[1] : void undefined); // step 4

	var alphabet = Get(opts, 'alphabet'); // step 5

	if (typeof alphabet === 'undefined') {
		alphabet = 'base64'; // step 6
	}

	if (alphabet !== 'base64' && alphabet !== 'base64url') {
		throw new $TypeError('Assertion failed: `alphabet` is not `\'base64\'` or `\'base64url\'`: ' + (typeof alphabet === 'string' ? alphabet : typeof alphabet)); // step 7
	}

	var lastChunkHandling = Get(opts, 'lastChunkHandling'); // step 8

	if (typeof lastChunkHandling === 'undefined') {
		lastChunkHandling = 'loose'; // step 9
	}

	if (lastChunkHandling !== 'loose' && lastChunkHandling !== 'strict' && lastChunkHandling !== 'stop-before-partial') {
		throw new $TypeError('`lastChunkHandling` must be `\'loose\'`, `\'strict\'`, or `\'stop-before-partial\'`'); // step 10
	}

	var taRecord = MakeTypedArrayWithBufferWitnessRecord(into, 'SEQ-CST'); // step 11

	if (IsTypedArrayOutOfBounds(taRecord)) {
		throw new $TypeError('typed array is out of bounds'); // step 12
	}

	var byteLength = TypedArrayLength(taRecord); // step 13

	var result = FromBase64(string, alphabet, lastChunkHandling, byteLength); // step 14

	var bytes = result['[[Bytes]]']; // step 15

	var written = bytes.length; // step 16

	// 17. NOTE: FromBase64 does not invoke any user code, so the ArrayBuffer backing into cannot have been detached or shrunk.

	if (written > byteLength) {
		throw new $TypeError('Assertion failed: written is not <= byteLength'); // step 19
	}

	SetUint8ArrayBytes(into, bytes); // step 19

	if (result['[[Error]]']) { // step 20
		throw result['[[Error]]']; // step 20.a
	}

	var offset = typedArrayByteOffset(into); // step 21

	var index = 0; // step 22

	var intoBuffer = typedArrayBuffer(into);

	while (index < written) { // step 23
		var byte = bytes[index]; // step 23.a

		var byteIndexInBuffer = index + offset; // step 23.b

		SetValueInBuffer(intoBuffer, byteIndexInBuffer, 'UINT8', byte, true, 'UNORDERED'); // step 23.c

		index += 1; // step 23.d
	}

	// 24. Let resultObject be OrdinaryObjectCreate(%Object.prototype%).
	// 25. Perform ! CreateDataPropertyOrThrow(resultObject, "read", 𝔽(result.[[Read]])).
	// 26. Perform ! CreateDataPropertyOrThrow(resultObject, "written", 𝔽(written)).
	// 27. Return resultObject.

	return { // steps 24 - 27
		read: result['[[Read]]'],
		written: written
	};
};

},{"../aos/FromBase64":110,"../aos/GetOptionsObject":112,"../aos/SetUint8ArrayBytes":117,"../aos/ValidateUint8Array":120,"es-abstract/2024/Get":21,"es-abstract/2024/IsTypedArrayOutOfBounds":29,"es-abstract/2024/MakeTypedArrayWithBufferWitnessRecord":31,"es-abstract/2024/SetValueInBuffer":36,"es-abstract/2024/TypedArrayLength":56,"es-errors/syntax":127,"es-errors/type":128,"get-intrinsic":143,"typed-array-buffer":205,"typed-array-byte-offset":206}],93:[function(require,module,exports){
'use strict';

var callBind = require('call-bind');
var define = require('define-properties');

var implementation = require('./implementation');
var getPolyfill = require('./polyfill');
var shim = require('./shim');

var bound = callBind(getPolyfill());

define(bound, {
	getPolyfill: getPolyfill,
	implementation: implementation,
	shim: shim
});

module.exports = bound;

},{"./implementation":92,"./polyfill":94,"./shim":95,"call-bind":11,"define-properties":14}],94:[function(require,module,exports){
'use strict';

var implementation = require('./implementation');

module.exports = function getPolyfill() {
	return typeof Uint8Array === 'function' && typeof Uint8Array.prototype.setFromBase64 === 'function' ? Uint8Array.prototype.setFromBase64 : implementation;
};

},{"./implementation":92}],95:[function(require,module,exports){
'use strict';

var getPolyfill = require('./polyfill');
var define = require('define-properties');

module.exports = function shimUint8ArraySetFromBase64() {
	var polyfill = getPolyfill();

	if (typeof Uint8Array === 'function') {
		define(
			Uint8Array.prototype,
			{ setFromBase64: polyfill },
			{ setFromBase64: function () { return Uint8Array.prototype.setFromBase64 !== polyfill; } }
		);
	}

	return polyfill;
};

},{"./polyfill":94,"define-properties":14}],96:[function(require,module,exports){
'use strict';

var GetIntrinsic = require('get-intrinsic');

var $SyntaxError = require('es-errors/syntax');
var $TypeError = require('es-errors/type');
var $Uint8Array = GetIntrinsic('%Uint8Array%', true);

var FromHex = require('../aos/FromHex');
var IsTypedArrayOutOfBounds = require('es-abstract/2024/IsTypedArrayOutOfBounds');
var MakeTypedArrayWithBufferWitnessRecord = require('es-abstract/2024/MakeTypedArrayWithBufferWitnessRecord');
var TypedArrayLength = require('es-abstract/2024/TypedArrayLength');
var ValidateUint8Array = require('../aos/ValidateUint8Array');
var SetUint8ArrayBytes = require('../aos/SetUint8ArrayBytes');

module.exports = function setFromHex(string) {
	if (!$Uint8Array) {
		throw new $SyntaxError('This environment does not support Uint8Array'); // step 1
	}

	var into = this; // step 1

	ValidateUint8Array(into); // step 2

	if (typeof string !== 'string') {
		throw new $TypeError('`string` is not a string: ' + typeof string); // step 3
	}

	var taRecord = MakeTypedArrayWithBufferWitnessRecord(into, 'SEQ-CST'); // step 4

	if (IsTypedArrayOutOfBounds(taRecord)) {
		throw new $TypeError('fromHexInto called on Typed Array backed by detached buffer'); // step 5
	}

	var byteLength = TypedArrayLength(taRecord); // step 6

	var result = FromHex(string, byteLength); // step 7

	var bytes = result['[[Bytes]]']; // step 8

	var written = bytes.length; // step 9

	// 10. NOTE: FromHex does not invoke any user code, so the ArrayBuffer backing into cannot have been detached or shrunk.

	if (written > byteLength) {
		throw new $TypeError('Assertion failed: written is not <= byteLength'); // step 11
	}

	SetUint8ArrayBytes(into, bytes); // step 12

	if (result['[[Error]]']) { // step 13
		throw result['[[Error]]']; // step 13.a
	}

	// var resultObject = {}; // step 14 // OrdinaryObjectCreate(%Object.prototype%)
	// CreateDataPropertyOrThrow(resultObject, 'read', result['[[Read]]']); // step 15
	// CreateDataPropertyOrThrow(resultObject, 'written', written); // step 16
	// return resultObject; // step 17

	return { // steps 14 - 17
		read: result['[[Read]]'],
		written: written
	};
};

},{"../aos/FromHex":111,"../aos/SetUint8ArrayBytes":117,"../aos/ValidateUint8Array":120,"es-abstract/2024/IsTypedArrayOutOfBounds":29,"es-abstract/2024/MakeTypedArrayWithBufferWitnessRecord":31,"es-abstract/2024/TypedArrayLength":56,"es-errors/syntax":127,"es-errors/type":128,"get-intrinsic":143}],97:[function(require,module,exports){
arguments[4][93][0].apply(exports,arguments)
},{"./implementation":96,"./polyfill":98,"./shim":99,"call-bind":11,"define-properties":14,"dup":93}],98:[function(require,module,exports){
'use strict';

var implementation = require('./implementation');

module.exports = function getPolyfill() {
	return typeof Uint8Array === 'function' && typeof Uint8Array.prototype.setFromHex === 'function' ? Uint8Array.prototype.setFromHex : implementation;
};

},{"./implementation":96}],99:[function(require,module,exports){
'use strict';

var getPolyfill = require('./polyfill');
var define = require('define-properties');

module.exports = function shimUint8ArraySetFromHex() {
	var polyfill = getPolyfill();

	if (typeof Uint8Array === 'function') {
		define(
			Uint8Array.prototype,
			{ setFromHex: polyfill },
			{ setFromHex: function () { return Uint8Array.prototype.setFromHex !== polyfill; } }
		);
	}

	return polyfill;
};

},{"./polyfill":98,"define-properties":14}],100:[function(require,module,exports){
'use strict';

var $TypeError = require('es-errors/type');

var Get = require('es-abstract/2024/Get');
var GetOptionsObject = require('../aos/GetOptionsObject');
var GetUint8ArrayBytes = require('../aos/GetUint8ArrayBytes');
var ValidateUint8Array = require('../aos/ValidateUint8Array');
var ToBoolean = require('es-abstract/2024/ToBoolean');

var alphabetFromIdentifier = require('../aos/helpers/alphabetFromIdentifier');

var callBound = require('call-bound');

var $charAt = callBound('String.prototype.charAt');

module.exports = function toBase64() {
	var O = this; // step 1

	ValidateUint8Array(O); // step 2

	var options = arguments.length > 0 ? arguments[0] : void undefined;
	var opts = GetOptionsObject(options); // step 3

	var alphabet = Get(opts, 'alphabet'); // step 4

	if (typeof alphabet === 'undefined') {
		alphabet = 'base64'; // step 5
	}

	if (alphabet !== 'base64' && alphabet !== 'base64url') {
		throw new $TypeError('Assertion failed: `alphabet` is not `\'base64\'` or `\'base64url\'`: ' + (typeof alphabet === 'string' ? alphabet : typeof alphabet)); // step 6
	}

	var omitPadding = ToBoolean(Get(opts, 'omitPadding')); // step 7

	// eslint-disable-next-line no-unused-vars
	var toEncode = GetUint8ArrayBytes(O); // step 8

	// if (alphabet === 'base64') { // step 9
	// 		a. Let outAscii be the sequence of code points which results from encoding toEncode according to the base64 encoding specified in section 4 of RFC 4648.
	// } else { // step 10
	// 		a. Assert: alphabet is "base64url".
	// 		b. Let outAscii be the sequence of code points which results from encoding toEncode according to the base64url encoding specified in section 5 of RFC 4648.
	// }

	// return CodePointsToString(outAscii); // step 11

	// code adapted from https://github.com/tc39/proposal-arraybuffer-base64/blob/22228812214d5a1c2966cd626f43be3576e79290/playground/polyfill-core.mjs
	var lookup = alphabetFromIdentifier(alphabet);
	var result = '';

	var i = 0;
	var triplet;
	for (; i + 2 < O.length; i += 3) {
		triplet = (O[i] << 16) + (O[i + 1] << 8) + O[i + 2];
		result += $charAt(lookup, (triplet >> 18) & 63)
			+ $charAt(lookup, (triplet >> 12) & 63)
			+ $charAt(lookup, (triplet >> 6) & 63)
			+ $charAt(lookup, triplet & 63);
	}
	if (i + 2 === O.length) {
		triplet = (O[i] << 16) + (O[i + 1] << 8);
		result += $charAt(lookup, (triplet >> 18) & 63)
			+ $charAt(lookup, (triplet >> 12) & 63)
			+ $charAt(lookup, (triplet >> 6) & 63)
			+ (omitPadding ? '' : '=');
	} else if (i + 1 === O.length) {
		triplet = O[i] << 16;
		result += $charAt(lookup, (triplet >> 18) & 63)
			+ $charAt(lookup, (triplet >> 12) & 63)
			+ (omitPadding ? '' : '==');
	}
	return result;
};

},{"../aos/GetOptionsObject":112,"../aos/GetUint8ArrayBytes":113,"../aos/ValidateUint8Array":120,"../aos/helpers/alphabetFromIdentifier":121,"call-bound":12,"es-abstract/2024/Get":21,"es-abstract/2024/ToBoolean":43,"es-errors/type":128}],101:[function(require,module,exports){
'use strict';

var define = require('define-properties');
var callBind = require('call-bind');

var implementation = require('./implementation');
var getPolyfill = require('./polyfill');
var shim = require('./shim');

var polyfill = callBind(getPolyfill());

define(polyfill, {
	getPolyfill: getPolyfill,
	implementation: implementation,
	shim: shim
});

module.exports = polyfill;

},{"./implementation":100,"./polyfill":102,"./shim":103,"call-bind":11,"define-properties":14}],102:[function(require,module,exports){
'use strict';

var implementation = require('./implementation');

module.exports = function getPolyfill() {
	return typeof Uint8Array === 'function' && typeof Uint8Array.prototype.toBase64 === 'function' ? Uint8Array.prototype.toBase64 : implementation;
};

},{"./implementation":100}],103:[function(require,module,exports){
'use strict';

var getPolyfill = require('./polyfill');
var define = require('define-properties');

module.exports = function shimUint8ArrayPrototypeToBase64() {
	var polyfill = getPolyfill();

	if (typeof Uint8Array === 'function') {
		define(
			Uint8Array.prototype,
			{ toBase64: polyfill },
			{ toBase64: function () { return Uint8Array.prototype.toBase64 !== polyfill; } }
		);
	}

	return polyfill;
};

},{"./polyfill":102,"define-properties":14}],104:[function(require,module,exports){
'use strict';

var GetUint8ArrayBytes = require('../aos/GetUint8ArrayBytes');
var NumberToString = require('es-abstract/2024/Number/toString');
var StringPad = require('es-abstract/2024/StringPad');
var ValidateUint8Array = require('../aos/ValidateUint8Array');

var forEach = require('es-abstract/helpers/forEach');

module.exports = function toHex() {
	var O = this; // step 1

	ValidateUint8Array(O); // step 2

	var toEncode = GetUint8ArrayBytes(O); // step 3

	var out = ''; // step 4

	forEach(toEncode, function (byte) { // step 5
		var hex = NumberToString(byte, 16); // step 5.a

		hex = StringPad(hex, 2, '0', 'start'); // step 5.b

		out += hex; // step 5.c
	});

	return out; // step 6
};

},{"../aos/GetUint8ArrayBytes":113,"../aos/ValidateUint8Array":120,"es-abstract/2024/Number/toString":32,"es-abstract/2024/StringPad":37,"es-abstract/helpers/forEach":70}],105:[function(require,module,exports){
arguments[4][101][0].apply(exports,arguments)
},{"./implementation":104,"./polyfill":106,"./shim":107,"call-bind":11,"define-properties":14,"dup":101}],106:[function(require,module,exports){
'use strict';

var implementation = require('./implementation');

module.exports = function getPolyfill() {
	return typeof Uint8Array === 'function' && typeof Uint8Array.prototype.toHex === 'function' ? Uint8Array.prototype.toHex : implementation;
};

},{"./implementation":104}],107:[function(require,module,exports){
'use strict';

var getPolyfill = require('./polyfill');
var define = require('define-properties');

module.exports = function shimUint8ArrayPrototypeToHex() {
	var polyfill = getPolyfill();

	if (typeof Uint8Array === 'function') {
		define(
			Uint8Array.prototype,
			{ toHex: polyfill },
			{ toHex: function () { return Uint8Array.prototype.toHex !== polyfill; } }
		);
	}

	return polyfill;
};

},{"./polyfill":106,"define-properties":14}],108:[function(require,module,exports){
'use strict';

var $TypeError = require('es-errors/type');

// https://tc39.es/ecma262/#sec-arraybufferbytelength

var IsDetachedBuffer = require('es-abstract/2024/IsDetachedBuffer');

var isArrayBuffer = require('is-array-buffer');
var isSharedArrayBuffer = require('is-shared-array-buffer');
var arrayBufferByteLength = require('array-buffer-byte-length');

var isGrowable = false; // TODO: support this

module.exports = function ArrayBufferByteLength(arrayBuffer, order) {
	var isSAB = isSharedArrayBuffer(arrayBuffer);
	if (!isArrayBuffer(arrayBuffer) && !isSAB) {
		throw new $TypeError('Assertion failed: `arrayBuffer` must be an ArrayBuffer or a SharedArrayBuffer');
	}
	if (order !== 'SEQ-CST' && order !== 'UNORDERED') {
		throw new $TypeError('Assertion failed: `order` must be ~SEQ-CST~ or ~UNORDERED~');
	}

	// 1. If IsSharedArrayBuffer(arrayBuffer) is true and arrayBuffer has an [[ArrayBufferByteLengthData]] internal slot, then
	// TODO: see if IsFixedLengthArrayBuffer can be used here in the spec instead
	if (isSAB && isGrowable) { // step 1
		// a. Let bufferByteLengthBlock be arrayBuffer.[[ArrayBufferByteLengthData]].
		// b. Let rawLength be GetRawBytesFromSharedBlock(bufferByteLengthBlock, 0, BIGUINT64, true, order).
		// c. Let isLittleEndian be the value of the [[LittleEndian]] field of the surrounding agent's Agent Record.
		// d. Return ℝ(RawBytesToNumeric(BIGUINT64, rawLength, isLittleEndian)).
	}

	if (IsDetachedBuffer(arrayBuffer)) {
		throw new $TypeError('Assertion failed: `arrayBuffer` must not be detached'); // step 2
	}

	return arrayBufferByteLength(arrayBuffer);
};

},{"array-buffer-byte-length":1,"es-abstract/2024/IsDetachedBuffer":27,"es-errors/type":128,"is-array-buffer":157,"is-shared-array-buffer":169}],109:[function(require,module,exports){
'use strict';

var $SyntaxError = require('es-errors/syntax');
var $TypeError = require('es-errors/type');

var base64Map = {
	__proto__: null,
	0: 52,
	1: 53,
	2: 54,
	3: 55,
	4: 56,
	5: 57,
	6: 58,
	7: 59,
	8: 60,
	9: 61,
	'+': 62,
	'/': 63
};
var getBase64Index = function (c) {
	if (c in base64Map) {
		return base64Map[c];
	}
	var code = c.charCodeAt(0);
	return code < 97 ? code - 65 : code - 71;
};

// https://tc39.es/proposal-arraybuffer-base64/spec/#sec-decodebase64chunk

module.exports = function DecodeBase64Chunk(chunk) {
	if (typeof chunk !== 'string') {
		throw new $TypeError('Assertion failed: `chunk` must be a string');
	}

	var throwOnExtraBits = arguments.length > 1 ? !!arguments[1] : false;

	if (arguments.length > 1 && typeof throwOnExtraBits !== 'boolean') {
		throw new $TypeError('Assertion failed: `throwOnExtraBits`, if provided, must be a boolean');
	}

	var chunkLength = chunk.length; // step 1

	if (chunkLength === 2) { // step 2
		chunk += 'AA';
	} else if (chunkLength === 3) { // step 3
		chunk += 'A';
	} else { // step 4
		if (chunkLength !== 4) { // eslint-disable-line no-lonely-if
			throw new $TypeError('Assertion failed: `chunk` must be 2, 3, or 4 characters long (got ' + chunk + ')'); // step 4.a
		}
	}

	// 5. Let byteSequence be the unique sequence of 3 bytes resulting from decoding chunk as base64 (such that applying the base64 encoding specified in section 4 of RFC 4648 to byteSequence would produce chunk).
	// 6. Let bytes be a List whose elements are the elements of byteSequence, in order.

	var c1 = chunk[0];
	var c2 = chunk[1];
	var c3 = chunk[2];
	var c4 = chunk[3];

	var triplet = (getBase64Index(c1) << 18)
        + (getBase64Index(c2) << 12)
        + (getBase64Index(c3) << 6)
        + getBase64Index(c4);

	var bytes = [
		(triplet >> 16) & 255,
		(triplet >> 8) & 255,
		triplet & 255
	];

	if (chunkLength === 2) { // step 7
		if (arguments.length < 2) {
			throw new $TypeError('Assertion failed: `throwOnExtraBits` must be provided if `chunk` is 2 characters long'); // step 7.a
		}
		if (throwOnExtraBits && bytes[1] !== 0) { // step 7.b
			throw new $SyntaxError('extra bits'); // step 7.b.i
		}
		return [bytes[0]]; // step 7.c
	} else if (chunkLength === 3) { // step 8
		if (arguments.length < 2) {
			throw new $TypeError('Assertion failed: `throwOnExtraBits` must be provided if `chunk` is 3 characters long'); // step 8.a
		}
		if (throwOnExtraBits && bytes[2] !== 0) { // step 8.b
			throw new $SyntaxError('extra bits'); // step 8.b.i
		}

		return [bytes[0], bytes[1]]; // step 8.c
	} // step 9
	return bytes; // step 9.a

};

},{"es-errors/syntax":127,"es-errors/type":128}],110:[function(require,module,exports){
'use strict';

var $SyntaxError = require('es-errors/syntax');
var $TypeError = require('es-errors/type');

var callBound = require('call-bound');

var DecodeBase64Chunk = require('../aos/DecodeBase64Chunk');
var SkipAsciiWhitespace = require('../aos/SkipAsciiWhitespace');
var substring = require('es-abstract/2024/substring');

var isInteger = require('math-intrinsics/isInteger');
var maxSafeInteger = require('math-intrinsics/constants/maxSafeInteger');

var alphabetFromIdentifier = require('./helpers/alphabetFromIdentifier');

var safeArrayConcat = require('safe-array-concat');

var $strIndexOf = callBound('String.prototype.indexOf');

/* eslint no-redeclare: 0 */

// https://tc39.es/proposal-arraybuffer-base64/spec/#sec-frombase64

module.exports = function FromBase64(string, alphabet, lastChunkHandling) {
	if (typeof string !== 'string') {
		throw new $TypeError('Assertion failed: `string` is not a string: ' + string);
	}
	if (alphabet !== 'base64' && alphabet !== 'base64url') {
		throw new $TypeError('Assertion failed: `alphabet` is not `\'base64\'` or `\'base64url\'`: ' + alphabet);
	}
	if (lastChunkHandling !== 'loose' && lastChunkHandling !== 'strict' && lastChunkHandling !== 'stop-before-partial') {
		throw new $TypeError('Assertion failed: `lastChunkHandling` must be `\'loose\'`, `\'strict\'`, or `\'stop-before-partial\'`');
	}

	var maxLength = arguments.length > 3 ? arguments[3] : maxSafeInteger; // step 1.a
	if (
		arguments.length > 3
        && (!isInteger(maxLength) || maxLength < 0)
	) {
		throw new $TypeError('Assertion failed: `maxLength` is not a non-negative integer: ' + maxLength);
	}

	// 2. NOTE: The order of validation and decoding in the algorithm below is not observable. Implementations are encouraged to perform them in whatever order is most efficient, possibly interleaving validation with decoding, as long as the behaviour is observably equivalent.

	if (maxLength === 0) { // step 3
		return {
			'[[Read]]': 0,
			'[[Bytes]]': [],
			'[[Error]]': null
		}; // step 3.a
	}

	var read = 0; // step 4

	var bytes = []; // step 5

	var chunk = ''; // step 6

	var chunkLength = 0; // step 7

	var index = 0; // step 8

	var length = string.length; // step 9

	// eslint-disable-next-line no-constant-condition
	while (true) { // step 10
		index = SkipAsciiWhitespace(string, index); // step 10.a

		if (index === length) { // step 10.b
			if (chunkLength > 0) { // step 10.b.i
				if (lastChunkHandling === 'stop-before-partial') { // step 10.b.i.1
					return {
						'[[Read]]': read,
						'[[Bytes]]': bytes,
						'[[Error]]': null
					}; // step 10.b.i.1.a
				} else if (lastChunkHandling === 'loose') { // step 10.b.i.2
					if (chunkLength === 1) { // step 10.b.i.2.a
						var error = new $SyntaxError('malformed padding: exactly one additional character'); // step 10.b.i.2.a.i
						return {
							'[[Read]]': read,
							'[[Bytes]]': bytes,
							'[[Error]]': error
						}; // step 10.b.i.2.a.ii
					}

					try {
						bytes = safeArrayConcat(bytes, DecodeBase64Chunk(chunk, false)); // step 10.b.i.2.b
					} catch (e) {
						return {
							'[[Read]]': read,
							'[[Bytes]]': bytes,
							'[[Error]]': e
						}; // step 10.b.i.2.c ?
					}
				} else { // step 10.b.i.3
					// Assert: lastChunkHandling is "strict".
					var error = new $SyntaxError('missing padding'); // step 10.b.i.3.b
					return {
						'[[Read]]': read,
						'[[Bytes]]': bytes,
						'[[Error]]': error
					}; // step 10.b.i.3.c
				}
			}
			return {
				'[[Read]]': length,
				'[[Bytes]]': bytes,
				'[[Error]]': null
			}; // step 10.b.ii
		}
		var char = substring(string, index, index + 1); // step 10.c

		index += 1; // step 10.d

		if (char === '=') { // step 10.e
			if (chunkLength < 2) { // step 10.e.i
				var error = new $SyntaxError('padding is too early'); // step 10.e.i.1
				return {
					'[[Read]]': read,
					'[[Bytes]]': bytes,
					'[[Error]]': error
				}; // step 10.e.i.2
			}

			index = SkipAsciiWhitespace(string, index); // step 10.e.ii

			if (chunkLength === 2) { // step 10.e.iii
				if (index === length) { // step 10.e.iii.1
					if (lastChunkHandling === 'stop-before-partial') { // step 10.e.iii.1.a
						return {
							'[[Read]]': read,
							'[[Bytes]]': bytes,
							'[[Error]]': null
						}; // step 10.e.iii.1.a.i
					}
					var error = new $SyntaxError('malformed padding - only one ='); // step 10.e.iii.1.b
					return {
						'[[Read]]': read,
						'[[Bytes]]': bytes,
						'[[Error]]': error
					}; // step 10.e.iii.1.c
				}

				char = substring(string, index, index + 1); // step 10.e.iii.2

				if (char === '=') { // step 10.e.iii.3
					index = SkipAsciiWhitespace(string, index + 1); // step 10.e.iii.3.a
				}
			}

			if (index < length) { // step 10.e.iv
				var error = new $SyntaxError('unexpected character after padding'); // step 10.e.iv.1
				return {
					'[[Read]]': read,
					'[[Bytes]]': bytes,
					'[[Error]]': error
				}; // step 10.e.iv.2
			}

			var throwOnExtraBits = lastChunkHandling === 'strict'; // step 10.e.v - vi

			bytes = safeArrayConcat(bytes, DecodeBase64Chunk(chunk, throwOnExtraBits)); // step 10.e.vii

			return {
				'[[Read]]': length,
				'[[Bytes]]': bytes,
				'[[Error]]': null
			}; // step 10.e.viii
		}

		if (alphabet === 'base64url') { // step 10.f
			if (char === '+' || char === '/') { // step 10.f.i
				var error = new $SyntaxError('unexpected character ' + char); // step 10.f.i.1
				return {
					'[[Read]]': read,
					'[[Bytes]]': bytes,
					'[[Error]]': error
				}; // step 10.f.i.2
			} else if (char === '-') {
				char = '+'; // step 10.f.ii
			} else if (char === '_') {
				char = '/'; // step 10.f.iii
			}
		}

		// g. If char is not an element of the standard base64 alphabet, throw a SyntaxError exception.
		if ($strIndexOf(alphabetFromIdentifier('base64'), char) < 0) { // step 10.g
			var error = new $SyntaxError('unexpected character ' + char); // step 10.g.i
			return {
				'[[Read]]': read,
				'[[Bytes]]': bytes,
				'[[Error]]': error
			}; // step 10.g.ii
		}

		var remaining = maxLength - bytes.length; // step 10.h

		if (
			(remaining === 1 && chunkLength === 2)
            || (remaining === 2 && chunkLength === 3)
		) { // step 10.i
			return {
				'[[Read]]': read,
				'[[Bytes]]': bytes,
				'[[Error]]': null
			}; // step 10.i.1
		}

		chunk += char; // step 10.j

		chunkLength = chunk.length; // step 10.k

		if (chunkLength === 4) { // step 10.l
			bytes = safeArrayConcat(bytes, DecodeBase64Chunk(chunk)); // step 10.l.i

			chunk = ''; // step 10.l.ii

			chunkLength = 0; // step 10.l.iii

			read = index; // step 10.l.iv

			if (bytes.length >= maxLength) { // step 10.l.v
				return {
					'[[Read]]': read,
					'[[Bytes]]': bytes,
					'[[Error]]': null
				}; // step 10.l.v.1
			}
		}
	}
};

},{"../aos/DecodeBase64Chunk":109,"../aos/SkipAsciiWhitespace":118,"./helpers/alphabetFromIdentifier":121,"call-bound":12,"es-abstract/2024/substring":60,"es-errors/syntax":127,"es-errors/type":128,"math-intrinsics/constants/maxSafeInteger":177,"math-intrinsics/isInteger":180,"safe-array-concat":193}],111:[function(require,module,exports){
'use strict';

var GetIntrinsic = require('get-intrinsic');

var $parseInt = GetIntrinsic('%parseInt%');
var $SyntaxError = require('es-errors/syntax');
var $TypeError = require('es-errors/type');

var modulo = require('es-abstract/2024/modulo');
var substring = require('es-abstract/2024/substring');

var isInteger = require('math-intrinsics/isInteger');
var MAX_SAFE_INTEGER = require('math-intrinsics/constants/maxSafeInteger');

var callBound = require('call-bound');
var safeRegexTest = require('safe-regex-test');

var isHexDigit = safeRegexTest(/^[0-9a-fA-F]+$/);
var $push = callBound('Array.prototype.push');

// https://tc39.es/proposal-arraybuffer-base64/spec/#sec-fromhex

module.exports = function FromHex(string) {
	if (typeof string !== 'string') {
		throw new $TypeError('Assertion failed: `string` must be a string');
	}
	var maxLength = arguments.length > 1 ? arguments[1] : MAX_SAFE_INTEGER; // step 1
	if (arguments.length > 1 && (!isInteger(maxLength) || maxLength < 0)) {
		throw new $TypeError('Assertion failed: `maxLength` must be a non-negative integer: ' + maxLength);
	}

	var length = string.length; // step 2

	var bytes = []; // step 3

	var read = 0; // step 4

	if (modulo(length, 2) !== 0) { // step 5
		return {
			'[[Read]]': read,
			'[[Bytes]]': bytes,
			'[[Error]]': new $SyntaxError('string should be an even number of characters')
		};
	}

	while (read < length && bytes.length < maxLength) { // step 6
		var hexits = substring(string, read, read + 2); // step 6.a

		if (!isHexDigit(hexits)) { // step 6.b
			return {
				'[[Read]]': read,
				'[[Bytes]]': bytes,
				'[[Error]]': new $SyntaxError('string should only contain hex characters')
			};
		}

		read += 2; // step 6.c

		var byte = $parseInt(hexits, 16); // step 6.d

		$push(bytes, byte); // step 6.e
	}
	return {
		'[[Read]]': read,
		'[[Bytes]]': bytes,
		'[[Error]]': null
	}; // step 7
};

},{"call-bound":12,"es-abstract/2024/modulo":59,"es-abstract/2024/substring":60,"es-errors/syntax":127,"es-errors/type":128,"get-intrinsic":143,"math-intrinsics/constants/maxSafeInteger":177,"math-intrinsics/isInteger":180,"safe-regex-test":195}],112:[function(require,module,exports){
'use strict';

var $TypeError = require('es-errors/type');

var OrdinaryObjectCreate = require('es-abstract/2024/OrdinaryObjectCreate');
var Type = require('es-abstract/2024/Type');

module.exports = function GetOptionsObject(options) {
	if (typeof options === 'undefined') { // step 1
		return OrdinaryObjectCreate(null); // step 1.a
	}
	if (Type(options) === 'Object') { // step 2
		return options; // step 2.a
	}

	throw new $TypeError('Invalid options object'); // step 3
};

},{"es-abstract/2024/OrdinaryObjectCreate":34,"es-abstract/2024/Type":54,"es-errors/type":128}],113:[function(require,module,exports){
'use strict';

var $TypeError = require('es-errors/type');

var callBound = require('call-bound');

var GetValueFromBuffer = require('es-abstract/2024/GetValueFromBuffer');
var IsTypedArrayOutOfBounds = require('./IsTypedArrayOutOfBounds');
var MakeTypedArrayWithBufferWitnessRecord = require('./MakeTypedArrayWithBufferWitnessRecord');
var TypedArrayLength = require('./TypedArrayLength');

var typedArrayBuffer = require('typed-array-buffer');
var whichTypedArray = require('which-typed-array');
var typedArrayByteOffset = require('typed-array-byte-offset');

var $push = callBound('Array.prototype.push');

module.exports = function GetUint8ArrayBytes(ta) {
	if (whichTypedArray(ta) !== 'Uint8Array') {
		throw new $TypeError('Assertion failed: `ta` must be a Uint8Array');
	}

	var buffer = typedArrayBuffer(ta); // step 1

	var taRecord = MakeTypedArrayWithBufferWitnessRecord(ta, 'SEQ-CST'); // step 2

	if (IsTypedArrayOutOfBounds(taRecord)) {
		throw new $TypeError('typed array is out of bounds'); // step 3
	}

	var len = TypedArrayLength(taRecord); // step 4

	var byteOffset = typedArrayByteOffset(ta); // step 5

	var bytes = []; // step 6

	var index = 0; // step 7

	while (index < len) { // step 8
		var byteIndex = byteOffset + index; // step 8.a

		var byte = GetValueFromBuffer(buffer, byteIndex, 'UINT8', true, 'UNORDERED'); // step 8.b

		$push(bytes, byte); // step 8.c

		index += 1; // step 8.d
	}

	return bytes;
};

},{"./IsTypedArrayOutOfBounds":115,"./MakeTypedArrayWithBufferWitnessRecord":116,"./TypedArrayLength":119,"call-bound":12,"es-abstract/2024/GetValueFromBuffer":22,"es-errors/type":128,"typed-array-buffer":205,"typed-array-byte-offset":206,"which-typed-array":212}],114:[function(require,module,exports){
arguments[4][28][0].apply(exports,arguments)
},{"call-bound":12,"dup":28,"es-errors/type":128,"is-array-buffer":157,"is-shared-array-buffer":169}],115:[function(require,module,exports){
'use strict';

var $TypeError = require('es-errors/type');

var IsDetachedBuffer = require('es-abstract/2024/IsDetachedBuffer');
var TypedArrayElementSize = require('es-abstract/2024/TypedArrayElementSize');

// var isTypedArrayWithBufferWitnessRecord = require('es-abstract/helpers/records/typed-array-with-buffer-witness-record');

var typedArrayBuffer = require('typed-array-buffer');
var typedArrayByteOffset = require('typed-array-byte-offset');
var typedArrayLength = require('typed-array-length');

// https://tc39.es/ecma262/#sec-istypedarrayoutofbounds

module.exports = function IsTypedArrayOutOfBounds(taRecord) {
	// if (!isTypedArrayWithBufferWitnessRecord(taRecord)) {
	// 	throw new $TypeError('Assertion failed: `taRecord` is not a TypedArray With Buffer Witness Record');
	// }

	var O = taRecord['[[Object]]']; // step 1

	var bufferByteLength = taRecord['[[CachedBufferByteLength]]']; // step 2

	if (IsDetachedBuffer(typedArrayBuffer(O)) && bufferByteLength !== 'DETACHEd') {
		throw new $TypeError('Assertion failed: typed array is detached only if the byte length is ~DETACHED~'); // step 3
	}

	if (bufferByteLength === 'DETACHED') {
		return true; // step 4
	}

	var byteOffsetStart = typedArrayByteOffset(O); // step 5

	var byteOffsetEnd;
	var length = typedArrayLength(O);
	// TODO: probably use package for array length
	// seems to apply when TA is backed by a resizable/growable AB
	if (length === 'AUTO') { // step 6
		byteOffsetEnd = bufferByteLength; // step 6.a
	} else {
		var elementSize = TypedArrayElementSize(O); // step 7.a

		byteOffsetEnd = byteOffsetStart + (length * elementSize); // step 7.b
	}

	if (byteOffsetStart > bufferByteLength || byteOffsetEnd > bufferByteLength) {
		return true; // step 8
	}

	// 9. NOTE: 0-length TypedArrays are not considered out-of-bounds.

	return false; // step 10
};

},{"es-abstract/2024/IsDetachedBuffer":27,"es-abstract/2024/TypedArrayElementSize":55,"es-errors/type":128,"typed-array-buffer":205,"typed-array-byte-offset":206,"typed-array-length":207}],116:[function(require,module,exports){
'use strict';

var $TypeError = require('es-errors/type');

var ArrayBufferByteLength = require('./ArrayBufferByteLength');
var IsDetachedBuffer = require('es-abstract/2024/IsDetachedBuffer');

var isTypedArray = require('is-typed-array');
var typedArrayBuffer = require('typed-array-buffer');

// https://tc39.es/ecma262/#sec-maketypedarraywithbufferwitnessrecord

module.exports = function MakeTypedArrayWithBufferWitnessRecord(obj, order) {
	if (!isTypedArray(obj)) {
		throw new $TypeError('Assertion failed: `obj` must be a Typed Array');
	}
	if (order !== 'SEQ-CST' && order !== 'UNORDERED') {
		throw new $TypeError('Assertion failed: `order` must be ~SEQ-CST~ or ~UNORDERED~');
	}

	var buffer = typedArrayBuffer(obj); // step 1

	var byteLength = IsDetachedBuffer(buffer) ? 'DETACHED' : ArrayBufferByteLength(buffer, order); // steps 2 - 3

	return { '[[Object]]': obj, '[[CachedBufferByteLength]]': byteLength }; // step 4
};

},{"./ArrayBufferByteLength":108,"es-abstract/2024/IsDetachedBuffer":27,"es-errors/type":128,"is-typed-array":172,"typed-array-buffer":205}],117:[function(require,module,exports){
'use strict';

var SetValueInBuffer = require('es-abstract/2024/SetValueInBuffer');
var ValidateUint8Array = require('./ValidateUint8Array');

var typedArrayBuffer = require('typed-array-buffer');
var typedArrayByteOffset = require('typed-array-byte-offset');

// https://tc39.es/proposal-arraybuffer-base64/spec/#sec-writeuint8arraybytes

module.exports = function SetUint8ArrayBytes(into, bytes) {
	ValidateUint8Array(into);

	var offset = typedArrayByteOffset(into); // step 1

	var len = bytes.length; // step 2

	var index = 0; // step 3

	while (index < len) { // step 4
		var byte = bytes[index]; // step 4.a
		var byteIndexInBuffer = index + offset; // step 4.b
		SetValueInBuffer(typedArrayBuffer(into), byteIndexInBuffer, 'UINT8', byte, true, 'UNORDERED'); // step 4.c
		index += 1; // step 4.d
	}
};

},{"./ValidateUint8Array":120,"es-abstract/2024/SetValueInBuffer":36,"typed-array-buffer":205,"typed-array-byte-offset":206}],118:[function(require,module,exports){
'use strict';

var $TypeError = require('es-errors/type');
var isInteger = require('math-intrinsics/isInteger');
var callBound = require('call-bound');

var $charCodeAt = callBound('String.prototype.charCodeAt');

// https://tc39.es/proposal-arraybuffer-base64/spec/#sec-skipasciiwhitespace

module.exports = function SkipAsciiWhitespace(string, index) {
	if (typeof string !== 'string') {
		throw new $TypeError('Assertion failed: `string` must be a string');
	}
	if (!isInteger(index) || index < 0) {
		throw new $TypeError('Assertion failed: `index` must be a non-negative integer');
	}

	var length = string.length; // step 1

	while (index < length) { // step 2
		var char = $charCodeAt(string, index); // step 2.a

		if (char !== 0x0009 && char !== 0x000A && char !== 0x000C && char !== 0x000D && char !== 0x0020) { // step 2.b
			return index; // step 2.b.i
		}

		// eslint-disable-next-line no-param-reassign
		index += 1; // step 2.c
	}
	return index; // step 3
};

},{"call-bound":12,"es-errors/type":128,"math-intrinsics/isInteger":180}],119:[function(require,module,exports){
'use strict';

var $TypeError = require('es-errors/type');

var floor = require('es-abstract/2024/floor');
var IsFixedLengthArrayBuffer = require('./IsFixedLengthArrayBuffer');
var IsTypedArrayOutOfBounds = require('./IsTypedArrayOutOfBounds');
var TypedArrayElementSize = require('es-abstract/2024/TypedArrayElementSize');

var typedArrayBuffer = require('typed-array-buffer');
var typedArrayByteOffset = require('typed-array-byte-offset');
var typedArrayLength = require('typed-array-length');

module.exports = function TypedArrayLength(taRecord) {
	if (IsTypedArrayOutOfBounds(taRecord)) {
		throw new $TypeError('Assertion failed: `taRecord` is out of bounds'); // step 1
	}

	var O = taRecord['[[Object]]']; // step 2

	var length = typedArrayLength(O);
	if (length !== 'AUTO') {
		return length; // step 3
	}

	if (IsFixedLengthArrayBuffer(typedArrayBuffer(O))) {
		throw new $TypeError('Assertion failed: array buffer is not fixed length'); // step 4
	}

	var byteOffset = typedArrayByteOffset(O); // step 5

	var elementSize = TypedArrayElementSize(O); // step 6

	var byteLength = taRecord['[[CachedBufferByteLength]]']; // step 7

	if (byteLength === 'DETACHED') {
		throw new $TypeError('Assertion failed: typed array is detached'); // step 8
	}

	return floor((byteLength - byteOffset) / elementSize); // step 9
};

},{"./IsFixedLengthArrayBuffer":114,"./IsTypedArrayOutOfBounds":115,"es-abstract/2024/TypedArrayElementSize":55,"es-abstract/2024/floor":58,"es-errors/type":128,"typed-array-buffer":205,"typed-array-byte-offset":206,"typed-array-length":207}],120:[function(require,module,exports){
'use strict';

var $TypeError = require('es-errors/type');

var whichTypedArray = require('which-typed-array');

module.exports = function ValidateUint8Array(ta) {
	if (whichTypedArray(ta) !== 'Uint8Array') {
		throw new $TypeError('`this` value must be a Uint8Array'); // steps 1 - 2
	}
};

},{"es-errors/type":128,"which-typed-array":212}],121:[function(require,module,exports){
'use strict';

var base64Characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
var base64UrlCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

var $TypeError = require('es-errors/type');

module.exports = function alphabetFromIdentifier(alphabet) {
	if (alphabet === 'base64') {
		return base64Characters;
	}

	if (alphabet === 'base64url') {
		return base64UrlCharacters;
	}

	throw new $TypeError('expected alphabet to be either "base64" or "base64url"');
};

},{"es-errors/type":128}],122:[function(require,module,exports){
'use strict';

/** @type {import('.')} */
var $defineProperty = Object.defineProperty || false;
if ($defineProperty) {
	try {
		$defineProperty({}, 'a', { value: 1 });
	} catch (e) {
		// IE 8 has a broken defineProperty
		$defineProperty = false;
	}
}

module.exports = $defineProperty;

},{}],123:[function(require,module,exports){
'use strict';

/** @type {import('./eval')} */
module.exports = EvalError;

},{}],124:[function(require,module,exports){
'use strict';

/** @type {import('.')} */
module.exports = Error;

},{}],125:[function(require,module,exports){
'use strict';

/** @type {import('./range')} */
module.exports = RangeError;

},{}],126:[function(require,module,exports){
'use strict';

/** @type {import('./ref')} */
module.exports = ReferenceError;

},{}],127:[function(require,module,exports){
'use strict';

/** @type {import('./syntax')} */
module.exports = SyntaxError;

},{}],128:[function(require,module,exports){
'use strict';

/** @type {import('./type')} */
module.exports = TypeError;

},{}],129:[function(require,module,exports){
'use strict';

/** @type {import('./uri')} */
module.exports = URIError;

},{}],130:[function(require,module,exports){
'use strict';

var $TypeError = require('es-errors/type');

/** @type {import('./RequireObjectCoercible')} */
module.exports = function RequireObjectCoercible(value) {
	if (value == null) {
		throw new $TypeError((arguments.length > 0 && arguments[1]) || ('Cannot call method on ' + value));
	}
	return value;
};

},{"es-errors/type":128}],131:[function(require,module,exports){
'use strict';

/** @type {import('.')} */
module.exports = Object;

},{}],132:[function(require,module,exports){
'use strict';

/** @type {import('./isObject')} */
module.exports = function isObject(x) {
	return !!x && (typeof x === 'function' || typeof x === 'object');
};

},{}],133:[function(require,module,exports){
'use strict';

var hasSymbols = typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol';

var isPrimitive = require('./helpers/isPrimitive');
var isCallable = require('is-callable');
var isDate = require('is-date-object');
var isSymbol = require('is-symbol');

/** @type {(O: { valueOf?: () => unknown, toString?: () => unknown }, hint: 'number' | 'string' | 'default') => null | undefined | string | symbol | number | boolean | bigint} */
var ordinaryToPrimitive = function OrdinaryToPrimitive(O, hint) {
	if (typeof O === 'undefined' || O === null) {
		throw new TypeError('Cannot call method on ' + O);
	}
	if (typeof hint !== 'string' || (hint !== 'number' && hint !== 'string')) {
		throw new TypeError('hint must be "string" or "number"');
	}
	/** @type {('toString' | 'valueOf')[]} */
	var methodNames = hint === 'string' ? ['toString', 'valueOf'] : ['valueOf', 'toString'];
	var method, result, i;
	for (i = 0; i < methodNames.length; ++i) {
		method = O[methodNames[i]];
		if (isCallable(method)) {
			result = method.call(O);
			if (isPrimitive(result)) {
				return result;
			}
		}
	}
	throw new TypeError('No default value');
};

/** @type {<K extends PropertyKey>(O: Record<K, unknown>, P: K) => Function | undefined} */
var GetMethod = function GetMethod(O, P) {
	var func = O[P];
	if (func !== null && typeof func !== 'undefined') {
		if (!isCallable(func)) {
			throw new TypeError(func + ' returned for property ' + String(P) + ' of object ' + O + ' is not a function');
		}
		return func;
	}
	return void 0;
};

/** @type {import('./es2015')} */
// http://www.ecma-international.org/ecma-262/6.0/#sec-toprimitive
module.exports = function ToPrimitive(input) {
	if (isPrimitive(input)) {
		return input;
	}
	/** @type {'default' | 'string' | 'number'} */
	var hint = 'default';
	if (arguments.length > 1) {
		if (arguments[1] === String) {
			hint = 'string';
		} else if (arguments[1] === Number) {
			hint = 'number';
		}
	}

	var exoticToPrim;
	if (hasSymbols) {
		if (Symbol.toPrimitive) {
			// eslint-disable-next-line no-extra-parens
			exoticToPrim = GetMethod(/** @type {Record<PropertyKey, unknown>} */ (input), Symbol.toPrimitive);
		} else if (isSymbol(input)) {
			exoticToPrim = Symbol.prototype.valueOf;
		}
	}
	if (typeof exoticToPrim !== 'undefined') {
		var result = exoticToPrim.call(input, hint);
		if (isPrimitive(result)) {
			return result;
		}
		throw new TypeError('unable to convert exotic object to primitive');
	}
	if (hint === 'default' && (isDate(input) || isSymbol(input))) {
		hint = 'string';
	}
	// eslint-disable-next-line no-extra-parens
	return ordinaryToPrimitive(/** @type {object} */ (input), hint === 'default' ? 'number' : hint);
};

},{"./helpers/isPrimitive":134,"is-callable":161,"is-date-object":162,"is-symbol":171}],134:[function(require,module,exports){
'use strict';

/** @type {(value: unknown) => value is null | undefined | string | symbol | number | boolean | bigint} */
module.exports = function isPrimitive(value) {
	return value === null || (typeof value !== 'function' && typeof value !== 'object');
};

},{}],135:[function(require,module,exports){
'use strict';

var isCallable = require('is-callable');

var toStr = Object.prototype.toString;
var hasOwnProperty = Object.prototype.hasOwnProperty;

/** @type {<This, A extends readonly unknown[]>(arr: A, iterator: (this: This | void, value: A[number], index: number, arr: A) => void, receiver: This | undefined) => void} */
var forEachArray = function forEachArray(array, iterator, receiver) {
    for (var i = 0, len = array.length; i < len; i++) {
        if (hasOwnProperty.call(array, i)) {
            if (receiver == null) {
                iterator(array[i], i, array);
            } else {
                iterator.call(receiver, array[i], i, array);
            }
        }
    }
};

/** @type {<This, S extends string>(string: S, iterator: (this: This | void, value: S[number], index: number, string: S) => void, receiver: This | undefined) => void} */
var forEachString = function forEachString(string, iterator, receiver) {
    for (var i = 0, len = string.length; i < len; i++) {
        // no such thing as a sparse string.
        if (receiver == null) {
            iterator(string.charAt(i), i, string);
        } else {
            iterator.call(receiver, string.charAt(i), i, string);
        }
    }
};

/** @type {<This, O>(obj: O, iterator: (this: This | void, value: O[keyof O], index: keyof O, obj: O) => void, receiver: This | undefined) => void} */
var forEachObject = function forEachObject(object, iterator, receiver) {
    for (var k in object) {
        if (hasOwnProperty.call(object, k)) {
            if (receiver == null) {
                iterator(object[k], k, object);
            } else {
                iterator.call(receiver, object[k], k, object);
            }
        }
    }
};

/** @type {(x: unknown) => x is readonly unknown[]} */
function isArray(x) {
    return toStr.call(x) === '[object Array]';
}

/** @type {import('.')._internal} */
module.exports = function forEach(list, iterator, thisArg) {
    if (!isCallable(iterator)) {
        throw new TypeError('iterator must be a function');
    }

    var receiver;
    if (arguments.length >= 3) {
        receiver = thisArg;
    }

    if (isArray(list)) {
        forEachArray(list, iterator, receiver);
    } else if (typeof list === 'string') {
        forEachString(list, iterator, receiver);
    } else {
        forEachObject(list, iterator, receiver);
    }
};

},{"is-callable":161}],136:[function(require,module,exports){
'use strict';

/* eslint no-invalid-this: 1 */

var ERROR_MESSAGE = 'Function.prototype.bind called on incompatible ';
var toStr = Object.prototype.toString;
var max = Math.max;
var funcType = '[object Function]';

var concatty = function concatty(a, b) {
    var arr = [];

    for (var i = 0; i < a.length; i += 1) {
        arr[i] = a[i];
    }
    for (var j = 0; j < b.length; j += 1) {
        arr[j + a.length] = b[j];
    }

    return arr;
};

var slicy = function slicy(arrLike, offset) {
    var arr = [];
    for (var i = offset || 0, j = 0; i < arrLike.length; i += 1, j += 1) {
        arr[j] = arrLike[i];
    }
    return arr;
};

var joiny = function (arr, joiner) {
    var str = '';
    for (var i = 0; i < arr.length; i += 1) {
        str += arr[i];
        if (i + 1 < arr.length) {
            str += joiner;
        }
    }
    return str;
};

module.exports = function bind(that) {
    var target = this;
    if (typeof target !== 'function' || toStr.apply(target) !== funcType) {
        throw new TypeError(ERROR_MESSAGE + target);
    }
    var args = slicy(arguments, 1);

    var bound;
    var binder = function () {
        if (this instanceof bound) {
            var result = target.apply(
                this,
                concatty(args, arguments)
            );
            if (Object(result) === result) {
                return result;
            }
            return this;
        }
        return target.apply(
            that,
            concatty(args, arguments)
        );

    };

    var boundLength = max(0, target.length - args.length);
    var boundArgs = [];
    for (var i = 0; i < boundLength; i++) {
        boundArgs[i] = '$' + i;
    }

    bound = Function('binder', 'return function (' + joiny(boundArgs, ',') + '){ return binder.apply(this,arguments); }')(binder);

    if (target.prototype) {
        var Empty = function Empty() {};
        Empty.prototype = target.prototype;
        bound.prototype = new Empty();
        Empty.prototype = null;
    }

    return bound;
};

},{}],137:[function(require,module,exports){
'use strict';

var implementation = require('./implementation');

module.exports = Function.prototype.bind || implementation;

},{"./implementation":136}],138:[function(require,module,exports){
'use strict';

var IsCallable = require('is-callable');
var hasOwn = require('hasown');
var functionsHaveNames = require('functions-have-names')();
var callBound = require('call-bound');
var $functionToString = callBound('Function.prototype.toString');
var $stringMatch = callBound('String.prototype.match');
var toStr = callBound('Object.prototype.toString');

var classRegex = /^class /;

var isClass = function isClassConstructor(fn) {
	if (IsCallable(fn)) {
		return false;
	}
	if (typeof fn !== 'function') {
		return false;
	}
	try {
		var match = $stringMatch($functionToString(fn), classRegex);
		return !!match;
	} catch (e) {}
	return false;
};

var regex = /\s*function\s+([^(\s]*)\s*/;

var isIE68 = !(0 in [,]); // eslint-disable-line no-sparse-arrays, comma-spacing

var objectClass = '[object Object]';
var ddaClass = '[object HTMLAllCollection]';

var functionProto = Function.prototype;

var isDDA = function isDocumentDotAll() {
	return false;
};
if (typeof document === 'object') {
	// Firefox 3 canonicalizes DDA to undefined when it's not accessed directly
	var all = document.all;
	if (toStr(all) === toStr(document.all)) {
		isDDA = function isDocumentDotAll(value) {
			/* globals document: false */
			// in IE 6-8, typeof document.all is "object" and it's truthy
			if ((isIE68 || !value) && (typeof value === 'undefined' || typeof value === 'object')) {
				try {
					var str = toStr(value);
					// IE 6-8 uses `objectClass`
					return (str === ddaClass || str === objectClass) && value('') == null; // eslint-disable-line eqeqeq
				} catch (e) { /**/ }
			}
			return false;
		};
	}
}

module.exports = function getName() {
	if (isDDA(this) || (!isClass(this) && !IsCallable(this))) {
		throw new TypeError('Function.prototype.name sham getter called on non-function');
	}
	if (functionsHaveNames && hasOwn(this, 'name')) {
		return this.name;
	}
	if (this === functionProto) {
		return '';
	}
	var str = $functionToString(this);
	var match = $stringMatch(str, regex);
	var name = match && match[1];
	return name;
};

},{"call-bound":12,"functions-have-names":142,"hasown":155,"is-callable":161}],139:[function(require,module,exports){
'use strict';

var define = require('define-properties');
var callBind = require('call-bind');

var implementation = require('./implementation');
var getPolyfill = require('./polyfill');
var shim = require('./shim');

var bound = callBind(implementation);

define(bound, {
	getPolyfill: getPolyfill,
	implementation: implementation,
	shim: shim
});

module.exports = bound;

},{"./implementation":138,"./polyfill":140,"./shim":141,"call-bind":11,"define-properties":14}],140:[function(require,module,exports){
'use strict';

var implementation = require('./implementation');

module.exports = function getPolyfill() {
	return implementation;
};

},{"./implementation":138}],141:[function(require,module,exports){
'use strict';

var supportsDescriptors = require('define-properties').supportsDescriptors;
var functionsHaveNames = require('functions-have-names')();
var getPolyfill = require('./polyfill');
var defineProperty = Object.defineProperty;
var TypeErr = TypeError;

module.exports = function shimName() {
	var polyfill = getPolyfill();
	if (functionsHaveNames) {
		return polyfill;
	}
	if (!supportsDescriptors) {
		throw new TypeErr('Shimming Function.prototype.name support requires ES5 property descriptor support.');
	}
	var functionProto = Function.prototype;
	defineProperty(functionProto, 'name', {
		configurable: true,
		enumerable: false,
		get: function () {
			var name = polyfill.call(this);
			if (this !== functionProto) {
				defineProperty(this, 'name', {
					configurable: true,
					enumerable: false,
					value: name,
					writable: false
				});
			}
			return name;
		}
	});
	return polyfill;
};

},{"./polyfill":140,"define-properties":14,"functions-have-names":142}],142:[function(require,module,exports){
'use strict';

var functionsHaveNames = function functionsHaveNames() {
	return typeof function f() {}.name === 'string';
};

var gOPD = Object.getOwnPropertyDescriptor;
if (gOPD) {
	try {
		gOPD([], 'length');
	} catch (e) {
		// IE 8 has a broken gOPD
		gOPD = null;
	}
}

functionsHaveNames.functionsHaveConfigurableNames = function functionsHaveConfigurableNames() {
	if (!functionsHaveNames() || !gOPD) {
		return false;
	}
	var desc = gOPD(function () {}, 'name');
	return !!desc && !!desc.configurable;
};

var $bind = Function.prototype.bind;

functionsHaveNames.boundFunctionsHaveNames = function boundFunctionsHaveNames() {
	return functionsHaveNames() && typeof $bind === 'function' && function f() {}.bind().name !== '';
};

module.exports = functionsHaveNames;

},{}],143:[function(require,module,exports){
'use strict';

var undefined;

var $Object = require('es-object-atoms');

var $Error = require('es-errors');
var $EvalError = require('es-errors/eval');
var $RangeError = require('es-errors/range');
var $ReferenceError = require('es-errors/ref');
var $SyntaxError = require('es-errors/syntax');
var $TypeError = require('es-errors/type');
var $URIError = require('es-errors/uri');

var abs = require('math-intrinsics/abs');
var floor = require('math-intrinsics/floor');
var max = require('math-intrinsics/max');
var min = require('math-intrinsics/min');
var pow = require('math-intrinsics/pow');
var round = require('math-intrinsics/round');
var sign = require('math-intrinsics/sign');

var $Function = Function;

// eslint-disable-next-line consistent-return
var getEvalledConstructor = function (expressionSyntax) {
	try {
		return $Function('"use strict"; return (' + expressionSyntax + ').constructor;')();
	} catch (e) {}
};

var $gOPD = require('gopd');
var $defineProperty = require('es-define-property');

var throwTypeError = function () {
	throw new $TypeError();
};
var ThrowTypeError = $gOPD
	? (function () {
		try {
			// eslint-disable-next-line no-unused-expressions, no-caller, no-restricted-properties
			arguments.callee; // IE 8 does not throw here
			return throwTypeError;
		} catch (calleeThrows) {
			try {
				// IE 8 throws on Object.getOwnPropertyDescriptor(arguments, '')
				return $gOPD(arguments, 'callee').get;
			} catch (gOPDthrows) {
				return throwTypeError;
			}
		}
	}())
	: throwTypeError;

var hasSymbols = require('has-symbols')();

var getProto = require('get-proto');
var $ObjectGPO = require('get-proto/Object.getPrototypeOf');
var $ReflectGPO = require('get-proto/Reflect.getPrototypeOf');

var $apply = require('call-bind-apply-helpers/functionApply');
var $call = require('call-bind-apply-helpers/functionCall');

var needsEval = {};

var TypedArray = typeof Uint8Array === 'undefined' || !getProto ? undefined : getProto(Uint8Array);

var INTRINSICS = {
	__proto__: null,
	'%AggregateError%': typeof AggregateError === 'undefined' ? undefined : AggregateError,
	'%Array%': Array,
	'%ArrayBuffer%': typeof ArrayBuffer === 'undefined' ? undefined : ArrayBuffer,
	'%ArrayIteratorPrototype%': hasSymbols && getProto ? getProto([][Symbol.iterator]()) : undefined,
	'%AsyncFromSyncIteratorPrototype%': undefined,
	'%AsyncFunction%': needsEval,
	'%AsyncGenerator%': needsEval,
	'%AsyncGeneratorFunction%': needsEval,
	'%AsyncIteratorPrototype%': needsEval,
	'%Atomics%': typeof Atomics === 'undefined' ? undefined : Atomics,
	'%BigInt%': typeof BigInt === 'undefined' ? undefined : BigInt,
	'%BigInt64Array%': typeof BigInt64Array === 'undefined' ? undefined : BigInt64Array,
	'%BigUint64Array%': typeof BigUint64Array === 'undefined' ? undefined : BigUint64Array,
	'%Boolean%': Boolean,
	'%DataView%': typeof DataView === 'undefined' ? undefined : DataView,
	'%Date%': Date,
	'%decodeURI%': decodeURI,
	'%decodeURIComponent%': decodeURIComponent,
	'%encodeURI%': encodeURI,
	'%encodeURIComponent%': encodeURIComponent,
	'%Error%': $Error,
	'%eval%': eval, // eslint-disable-line no-eval
	'%EvalError%': $EvalError,
	'%Float16Array%': typeof Float16Array === 'undefined' ? undefined : Float16Array,
	'%Float32Array%': typeof Float32Array === 'undefined' ? undefined : Float32Array,
	'%Float64Array%': typeof Float64Array === 'undefined' ? undefined : Float64Array,
	'%FinalizationRegistry%': typeof FinalizationRegistry === 'undefined' ? undefined : FinalizationRegistry,
	'%Function%': $Function,
	'%GeneratorFunction%': needsEval,
	'%Int8Array%': typeof Int8Array === 'undefined' ? undefined : Int8Array,
	'%Int16Array%': typeof Int16Array === 'undefined' ? undefined : Int16Array,
	'%Int32Array%': typeof Int32Array === 'undefined' ? undefined : Int32Array,
	'%isFinite%': isFinite,
	'%isNaN%': isNaN,
	'%IteratorPrototype%': hasSymbols && getProto ? getProto(getProto([][Symbol.iterator]())) : undefined,
	'%JSON%': typeof JSON === 'object' ? JSON : undefined,
	'%Map%': typeof Map === 'undefined' ? undefined : Map,
	'%MapIteratorPrototype%': typeof Map === 'undefined' || !hasSymbols || !getProto ? undefined : getProto(new Map()[Symbol.iterator]()),
	'%Math%': Math,
	'%Number%': Number,
	'%Object%': $Object,
	'%Object.getOwnPropertyDescriptor%': $gOPD,
	'%parseFloat%': parseFloat,
	'%parseInt%': parseInt,
	'%Promise%': typeof Promise === 'undefined' ? undefined : Promise,
	'%Proxy%': typeof Proxy === 'undefined' ? undefined : Proxy,
	'%RangeError%': $RangeError,
	'%ReferenceError%': $ReferenceError,
	'%Reflect%': typeof Reflect === 'undefined' ? undefined : Reflect,
	'%RegExp%': RegExp,
	'%Set%': typeof Set === 'undefined' ? undefined : Set,
	'%SetIteratorPrototype%': typeof Set === 'undefined' || !hasSymbols || !getProto ? undefined : getProto(new Set()[Symbol.iterator]()),
	'%SharedArrayBuffer%': typeof SharedArrayBuffer === 'undefined' ? undefined : SharedArrayBuffer,
	'%String%': String,
	'%StringIteratorPrototype%': hasSymbols && getProto ? getProto(''[Symbol.iterator]()) : undefined,
	'%Symbol%': hasSymbols ? Symbol : undefined,
	'%SyntaxError%': $SyntaxError,
	'%ThrowTypeError%': ThrowTypeError,
	'%TypedArray%': TypedArray,
	'%TypeError%': $TypeError,
	'%Uint8Array%': typeof Uint8Array === 'undefined' ? undefined : Uint8Array,
	'%Uint8ClampedArray%': typeof Uint8ClampedArray === 'undefined' ? undefined : Uint8ClampedArray,
	'%Uint16Array%': typeof Uint16Array === 'undefined' ? undefined : Uint16Array,
	'%Uint32Array%': typeof Uint32Array === 'undefined' ? undefined : Uint32Array,
	'%URIError%': $URIError,
	'%WeakMap%': typeof WeakMap === 'undefined' ? undefined : WeakMap,
	'%WeakRef%': typeof WeakRef === 'undefined' ? undefined : WeakRef,
	'%WeakSet%': typeof WeakSet === 'undefined' ? undefined : WeakSet,

	'%Function.prototype.call%': $call,
	'%Function.prototype.apply%': $apply,
	'%Object.defineProperty%': $defineProperty,
	'%Object.getPrototypeOf%': $ObjectGPO,
	'%Math.abs%': abs,
	'%Math.floor%': floor,
	'%Math.max%': max,
	'%Math.min%': min,
	'%Math.pow%': pow,
	'%Math.round%': round,
	'%Math.sign%': sign,
	'%Reflect.getPrototypeOf%': $ReflectGPO
};

if (getProto) {
	try {
		null.error; // eslint-disable-line no-unused-expressions
	} catch (e) {
		// https://github.com/tc39/proposal-shadowrealm/pull/384#issuecomment-1364264229
		var errorProto = getProto(getProto(e));
		INTRINSICS['%Error.prototype%'] = errorProto;
	}
}

var doEval = function doEval(name) {
	var value;
	if (name === '%AsyncFunction%') {
		value = getEvalledConstructor('async function () {}');
	} else if (name === '%GeneratorFunction%') {
		value = getEvalledConstructor('function* () {}');
	} else if (name === '%AsyncGeneratorFunction%') {
		value = getEvalledConstructor('async function* () {}');
	} else if (name === '%AsyncGenerator%') {
		var fn = doEval('%AsyncGeneratorFunction%');
		if (fn) {
			value = fn.prototype;
		}
	} else if (name === '%AsyncIteratorPrototype%') {
		var gen = doEval('%AsyncGenerator%');
		if (gen && getProto) {
			value = getProto(gen.prototype);
		}
	}

	INTRINSICS[name] = value;

	return value;
};

var LEGACY_ALIASES = {
	__proto__: null,
	'%ArrayBufferPrototype%': ['ArrayBuffer', 'prototype'],
	'%ArrayPrototype%': ['Array', 'prototype'],
	'%ArrayProto_entries%': ['Array', 'prototype', 'entries'],
	'%ArrayProto_forEach%': ['Array', 'prototype', 'forEach'],
	'%ArrayProto_keys%': ['Array', 'prototype', 'keys'],
	'%ArrayProto_values%': ['Array', 'prototype', 'values'],
	'%AsyncFunctionPrototype%': ['AsyncFunction', 'prototype'],
	'%AsyncGenerator%': ['AsyncGeneratorFunction', 'prototype'],
	'%AsyncGeneratorPrototype%': ['AsyncGeneratorFunction', 'prototype', 'prototype'],
	'%BooleanPrototype%': ['Boolean', 'prototype'],
	'%DataViewPrototype%': ['DataView', 'prototype'],
	'%DatePrototype%': ['Date', 'prototype'],
	'%ErrorPrototype%': ['Error', 'prototype'],
	'%EvalErrorPrototype%': ['EvalError', 'prototype'],
	'%Float32ArrayPrototype%': ['Float32Array', 'prototype'],
	'%Float64ArrayPrototype%': ['Float64Array', 'prototype'],
	'%FunctionPrototype%': ['Function', 'prototype'],
	'%Generator%': ['GeneratorFunction', 'prototype'],
	'%GeneratorPrototype%': ['GeneratorFunction', 'prototype', 'prototype'],
	'%Int8ArrayPrototype%': ['Int8Array', 'prototype'],
	'%Int16ArrayPrototype%': ['Int16Array', 'prototype'],
	'%Int32ArrayPrototype%': ['Int32Array', 'prototype'],
	'%JSONParse%': ['JSON', 'parse'],
	'%JSONStringify%': ['JSON', 'stringify'],
	'%MapPrototype%': ['Map', 'prototype'],
	'%NumberPrototype%': ['Number', 'prototype'],
	'%ObjectPrototype%': ['Object', 'prototype'],
	'%ObjProto_toString%': ['Object', 'prototype', 'toString'],
	'%ObjProto_valueOf%': ['Object', 'prototype', 'valueOf'],
	'%PromisePrototype%': ['Promise', 'prototype'],
	'%PromiseProto_then%': ['Promise', 'prototype', 'then'],
	'%Promise_all%': ['Promise', 'all'],
	'%Promise_reject%': ['Promise', 'reject'],
	'%Promise_resolve%': ['Promise', 'resolve'],
	'%RangeErrorPrototype%': ['RangeError', 'prototype'],
	'%ReferenceErrorPrototype%': ['ReferenceError', 'prototype'],
	'%RegExpPrototype%': ['RegExp', 'prototype'],
	'%SetPrototype%': ['Set', 'prototype'],
	'%SharedArrayBufferPrototype%': ['SharedArrayBuffer', 'prototype'],
	'%StringPrototype%': ['String', 'prototype'],
	'%SymbolPrototype%': ['Symbol', 'prototype'],
	'%SyntaxErrorPrototype%': ['SyntaxError', 'prototype'],
	'%TypedArrayPrototype%': ['TypedArray', 'prototype'],
	'%TypeErrorPrototype%': ['TypeError', 'prototype'],
	'%Uint8ArrayPrototype%': ['Uint8Array', 'prototype'],
	'%Uint8ClampedArrayPrototype%': ['Uint8ClampedArray', 'prototype'],
	'%Uint16ArrayPrototype%': ['Uint16Array', 'prototype'],
	'%Uint32ArrayPrototype%': ['Uint32Array', 'prototype'],
	'%URIErrorPrototype%': ['URIError', 'prototype'],
	'%WeakMapPrototype%': ['WeakMap', 'prototype'],
	'%WeakSetPrototype%': ['WeakSet', 'prototype']
};

var bind = require('function-bind');
var hasOwn = require('hasown');
var $concat = bind.call($call, Array.prototype.concat);
var $spliceApply = bind.call($apply, Array.prototype.splice);
var $replace = bind.call($call, String.prototype.replace);
var $strSlice = bind.call($call, String.prototype.slice);
var $exec = bind.call($call, RegExp.prototype.exec);

/* adapted from https://github.com/lodash/lodash/blob/4.17.15/dist/lodash.js#L6735-L6744 */
var rePropName = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g;
var reEscapeChar = /\\(\\)?/g; /** Used to match backslashes in property paths. */
var stringToPath = function stringToPath(string) {
	var first = $strSlice(string, 0, 1);
	var last = $strSlice(string, -1);
	if (first === '%' && last !== '%') {
		throw new $SyntaxError('invalid intrinsic syntax, expected closing `%`');
	} else if (last === '%' && first !== '%') {
		throw new $SyntaxError('invalid intrinsic syntax, expected opening `%`');
	}
	var result = [];
	$replace(string, rePropName, function (match, number, quote, subString) {
		result[result.length] = quote ? $replace(subString, reEscapeChar, '$1') : number || match;
	});
	return result;
};
/* end adaptation */

var getBaseIntrinsic = function getBaseIntrinsic(name, allowMissing) {
	var intrinsicName = name;
	var alias;
	if (hasOwn(LEGACY_ALIASES, intrinsicName)) {
		alias = LEGACY_ALIASES[intrinsicName];
		intrinsicName = '%' + alias[0] + '%';
	}

	if (hasOwn(INTRINSICS, intrinsicName)) {
		var value = INTRINSICS[intrinsicName];
		if (value === needsEval) {
			value = doEval(intrinsicName);
		}
		if (typeof value === 'undefined' && !allowMissing) {
			throw new $TypeError('intrinsic ' + name + ' exists, but is not available. Please file an issue!');
		}

		return {
			alias: alias,
			name: intrinsicName,
			value: value
		};
	}

	throw new $SyntaxError('intrinsic ' + name + ' does not exist!');
};

module.exports = function GetIntrinsic(name, allowMissing) {
	if (typeof name !== 'string' || name.length === 0) {
		throw new $TypeError('intrinsic name must be a non-empty string');
	}
	if (arguments.length > 1 && typeof allowMissing !== 'boolean') {
		throw new $TypeError('"allowMissing" argument must be a boolean');
	}

	if ($exec(/^%?[^%]*%?$/, name) === null) {
		throw new $SyntaxError('`%` may not be present anywhere but at the beginning and end of the intrinsic name');
	}
	var parts = stringToPath(name);
	var intrinsicBaseName = parts.length > 0 ? parts[0] : '';

	var intrinsic = getBaseIntrinsic('%' + intrinsicBaseName + '%', allowMissing);
	var intrinsicRealName = intrinsic.name;
	var value = intrinsic.value;
	var skipFurtherCaching = false;

	var alias = intrinsic.alias;
	if (alias) {
		intrinsicBaseName = alias[0];
		$spliceApply(parts, $concat([0, 1], alias));
	}

	for (var i = 1, isOwn = true; i < parts.length; i += 1) {
		var part = parts[i];
		var first = $strSlice(part, 0, 1);
		var last = $strSlice(part, -1);
		if (
			(
				(first === '"' || first === "'" || first === '`')
				|| (last === '"' || last === "'" || last === '`')
			)
			&& first !== last
		) {
			throw new $SyntaxError('property names with quotes must have matching quotes');
		}
		if (part === 'constructor' || !isOwn) {
			skipFurtherCaching = true;
		}

		intrinsicBaseName += '.' + part;
		intrinsicRealName = '%' + intrinsicBaseName + '%';

		if (hasOwn(INTRINSICS, intrinsicRealName)) {
			value = INTRINSICS[intrinsicRealName];
		} else if (value != null) {
			if (!(part in value)) {
				if (!allowMissing) {
					throw new $TypeError('base intrinsic for ' + name + ' exists, but the property is not available.');
				}
				return void undefined;
			}
			if ($gOPD && (i + 1) >= parts.length) {
				var desc = $gOPD(value, part);
				isOwn = !!desc;

				// By convention, when a data property is converted to an accessor
				// property to emulate a data property that does not suffer from
				// the override mistake, that accessor's getter is marked with
				// an `originalValue` property. Here, when we detect this, we
				// uphold the illusion by pretending to see that original data
				// property, i.e., returning the value rather than the getter
				// itself.
				if (isOwn && 'get' in desc && !('originalValue' in desc.get)) {
					value = desc.get;
				} else {
					value = value[part];
				}
			} else {
				isOwn = hasOwn(value, part);
				value = value[part];
			}

			if (isOwn && !skipFurtherCaching) {
				INTRINSICS[intrinsicRealName] = value;
			}
		}
	}
	return value;
};

},{"call-bind-apply-helpers/functionApply":7,"call-bind-apply-helpers/functionCall":8,"es-define-property":122,"es-errors":124,"es-errors/eval":123,"es-errors/range":125,"es-errors/ref":126,"es-errors/syntax":127,"es-errors/type":128,"es-errors/uri":129,"es-object-atoms":131,"function-bind":137,"get-proto":146,"get-proto/Object.getPrototypeOf":144,"get-proto/Reflect.getPrototypeOf":145,"gopd":148,"has-symbols":152,"hasown":155,"math-intrinsics/abs":176,"math-intrinsics/floor":178,"math-intrinsics/max":183,"math-intrinsics/min":184,"math-intrinsics/pow":186,"math-intrinsics/round":187,"math-intrinsics/sign":188}],144:[function(require,module,exports){
'use strict';

var $Object = require('es-object-atoms');

/** @type {import('./Object.getPrototypeOf')} */
module.exports = $Object.getPrototypeOf || null;

},{"es-object-atoms":131}],145:[function(require,module,exports){
'use strict';

/** @type {import('./Reflect.getPrototypeOf')} */
module.exports = (typeof Reflect !== 'undefined' && Reflect.getPrototypeOf) || null;

},{}],146:[function(require,module,exports){
'use strict';

var reflectGetProto = require('./Reflect.getPrototypeOf');
var originalGetProto = require('./Object.getPrototypeOf');

var getDunderProto = require('dunder-proto/get');

/** @type {import('.')} */
module.exports = reflectGetProto
	? function getProto(O) {
		// @ts-expect-error TS can't narrow inside a closure, for some reason
		return reflectGetProto(O);
	}
	: originalGetProto
		? function getProto(O) {
			if (!O || (typeof O !== 'object' && typeof O !== 'function')) {
				throw new TypeError('getProto: not an object');
			}
			// @ts-expect-error TS can't narrow inside a closure, for some reason
			return originalGetProto(O);
		}
		: getDunderProto
			? function getProto(O) {
				// @ts-expect-error TS can't narrow inside a closure, for some reason
				return getDunderProto(O);
			}
			: null;

},{"./Object.getPrototypeOf":144,"./Reflect.getPrototypeOf":145,"dunder-proto/get":18}],147:[function(require,module,exports){
'use strict';

/** @type {import('./gOPD')} */
module.exports = Object.getOwnPropertyDescriptor;

},{}],148:[function(require,module,exports){
'use strict';

/** @type {import('.')} */
var $gOPD = require('./gOPD');

if ($gOPD) {
	try {
		$gOPD([], 'length');
	} catch (e) {
		// IE 8 has a broken gOPD
		$gOPD = null;
	}
}

module.exports = $gOPD;

},{"./gOPD":147}],149:[function(require,module,exports){
'use strict';

var $BigInt = typeof BigInt !== 'undefined' && BigInt;

module.exports = function hasNativeBigInts() {
	return typeof $BigInt === 'function'
		&& typeof BigInt === 'function'
		&& typeof $BigInt(42) === 'bigint' // eslint-disable-line no-magic-numbers
		&& typeof BigInt(42) === 'bigint'; // eslint-disable-line no-magic-numbers
};

},{}],150:[function(require,module,exports){
'use strict';

var $defineProperty = require('es-define-property');

var hasPropertyDescriptors = function hasPropertyDescriptors() {
	return !!$defineProperty;
};

hasPropertyDescriptors.hasArrayLengthDefineBug = function hasArrayLengthDefineBug() {
	// node v0.6 has a bug where array lengths can be Set but not Defined
	if (!$defineProperty) {
		return null;
	}
	try {
		return $defineProperty([], 'length', { value: 1 }).length !== 1;
	} catch (e) {
		// In Firefox 4-22, defining length on an array throws an exception.
		return true;
	}
};

module.exports = hasPropertyDescriptors;

},{"es-define-property":122}],151:[function(require,module,exports){
'use strict';

var test = {
	__proto__: null,
	foo: {}
};

// @ts-expect-error: TS errors on an inherited property for some reason
var result = { __proto__: test }.foo === test.foo
	&& !(test instanceof Object);

/** @type {import('.')} */
module.exports = function hasProto() {
	return result;
};

},{}],152:[function(require,module,exports){
'use strict';

var origSymbol = typeof Symbol !== 'undefined' && Symbol;
var hasSymbolSham = require('./shams');

/** @type {import('.')} */
module.exports = function hasNativeSymbols() {
	if (typeof origSymbol !== 'function') { return false; }
	if (typeof Symbol !== 'function') { return false; }
	if (typeof origSymbol('foo') !== 'symbol') { return false; }
	if (typeof Symbol('bar') !== 'symbol') { return false; }

	return hasSymbolSham();
};

},{"./shams":153}],153:[function(require,module,exports){
'use strict';

/** @type {import('./shams')} */
/* eslint complexity: [2, 18], max-statements: [2, 33] */
module.exports = function hasSymbols() {
	if (typeof Symbol !== 'function' || typeof Object.getOwnPropertySymbols !== 'function') { return false; }
	if (typeof Symbol.iterator === 'symbol') { return true; }

	/** @type {{ [k in symbol]?: unknown }} */
	var obj = {};
	var sym = Symbol('test');
	var symObj = Object(sym);
	if (typeof sym === 'string') { return false; }

	if (Object.prototype.toString.call(sym) !== '[object Symbol]') { return false; }
	if (Object.prototype.toString.call(symObj) !== '[object Symbol]') { return false; }

	// temp disabled per https://github.com/ljharb/object.assign/issues/17
	// if (sym instanceof Symbol) { return false; }
	// temp disabled per https://github.com/WebReflection/get-own-property-symbols/issues/4
	// if (!(symObj instanceof Symbol)) { return false; }

	// if (typeof Symbol.prototype.toString !== 'function') { return false; }
	// if (String(sym) !== Symbol.prototype.toString.call(sym)) { return false; }

	var symVal = 42;
	obj[sym] = symVal;
	for (var _ in obj) { return false; } // eslint-disable-line no-restricted-syntax, no-unreachable-loop
	if (typeof Object.keys === 'function' && Object.keys(obj).length !== 0) { return false; }

	if (typeof Object.getOwnPropertyNames === 'function' && Object.getOwnPropertyNames(obj).length !== 0) { return false; }

	var syms = Object.getOwnPropertySymbols(obj);
	if (syms.length !== 1 || syms[0] !== sym) { return false; }

	if (!Object.prototype.propertyIsEnumerable.call(obj, sym)) { return false; }

	if (typeof Object.getOwnPropertyDescriptor === 'function') {
		// eslint-disable-next-line no-extra-parens
		var descriptor = /** @type {PropertyDescriptor} */ (Object.getOwnPropertyDescriptor(obj, sym));
		if (descriptor.value !== symVal || descriptor.enumerable !== true) { return false; }
	}

	return true;
};

},{}],154:[function(require,module,exports){
'use strict';

var hasSymbols = require('has-symbols/shams');

/** @type {import('.')} */
module.exports = function hasToStringTagShams() {
	return hasSymbols() && !!Symbol.toStringTag;
};

},{"has-symbols/shams":153}],155:[function(require,module,exports){
'use strict';

var call = Function.prototype.call;
var $hasOwn = Object.prototype.hasOwnProperty;
var bind = require('function-bind');

/** @type {import('.')} */
module.exports = bind.call(call, $hasOwn);

},{"function-bind":137}],156:[function(require,module,exports){
'use strict';

/** @typedef {`$${import('.').InternalSlot}`} SaltedInternalSlot */
/** @typedef {{ [k in SaltedInternalSlot]?: unknown }} SlotsObject */

var hasOwn = require('hasown');
/** @type {import('side-channel').Channel<object, SlotsObject>} */
var channel = require('side-channel')();

var $TypeError = require('es-errors/type');

/** @type {import('.')} */
var SLOT = {
	assert: function (O, slot) {
		if (!O || (typeof O !== 'object' && typeof O !== 'function')) {
			throw new $TypeError('`O` is not an object');
		}
		if (typeof slot !== 'string') {
			throw new $TypeError('`slot` must be a string');
		}
		channel.assert(O);
		if (!SLOT.has(O, slot)) {
			throw new $TypeError('`' + slot + '` is not present on `O`');
		}
	},
	get: function (O, slot) {
		if (!O || (typeof O !== 'object' && typeof O !== 'function')) {
			throw new $TypeError('`O` is not an object');
		}
		if (typeof slot !== 'string') {
			throw new $TypeError('`slot` must be a string');
		}
		var slots = channel.get(O);
		// eslint-disable-next-line no-extra-parens
		return slots && slots[/** @type {SaltedInternalSlot} */ ('$' + slot)];
	},
	has: function (O, slot) {
		if (!O || (typeof O !== 'object' && typeof O !== 'function')) {
			throw new $TypeError('`O` is not an object');
		}
		if (typeof slot !== 'string') {
			throw new $TypeError('`slot` must be a string');
		}
		var slots = channel.get(O);
		// eslint-disable-next-line no-extra-parens
		return !!slots && hasOwn(slots, /** @type {SaltedInternalSlot} */ ('$' + slot));
	},
	set: function (O, slot, V) {
		if (!O || (typeof O !== 'object' && typeof O !== 'function')) {
			throw new $TypeError('`O` is not an object');
		}
		if (typeof slot !== 'string') {
			throw new $TypeError('`slot` must be a string');
		}
		var slots = channel.get(O);
		if (!slots) {
			slots = {};
			channel.set(O, slots);
		}
		// eslint-disable-next-line no-extra-parens
		slots[/** @type {SaltedInternalSlot} */ ('$' + slot)] = V;
	}
};

if (Object.freeze) {
	Object.freeze(SLOT);
}

module.exports = SLOT;

},{"es-errors/type":128,"hasown":155,"side-channel":200}],157:[function(require,module,exports){
'use strict';

var callBind = require('call-bind');
var callBound = require('call-bound');
var GetIntrinsic = require('get-intrinsic');

var $ArrayBuffer = GetIntrinsic('%ArrayBuffer%', true);
/** @type {undefined | ((receiver: ArrayBuffer) => number) | ((receiver: unknown) => never)} */
var $byteLength = callBound('ArrayBuffer.prototype.byteLength', true);
var $toString = callBound('Object.prototype.toString');

// in node 0.10, ArrayBuffers have no prototype methods, but have an own slot-checking `slice` method
var abSlice = !!$ArrayBuffer && !$byteLength && (new $ArrayBuffer(0).slice || new Uint8Array(0).slice);
var $abSlice = !!abSlice && callBind(abSlice);

/** @type {import('.')} */
module.exports = $byteLength || $abSlice
	? function isArrayBuffer(obj) {
		if (!obj || typeof obj !== 'object') {
			return false;
		}
		try {
			if ($byteLength) {
				// @ts-expect-error no idea why TS can't handle the overload
				$byteLength(obj);
			} else {
				// @ts-expect-error TS chooses not to type-narrow inside a closure
				$abSlice(obj, 0);
			}
			return true;
		} catch (e) {
			return false;
		}
	}
	: $ArrayBuffer
		// in node 0.8, ArrayBuffers have no prototype or own methods, but also no Symbol.toStringTag
		? function isArrayBuffer(obj) {
			return $toString(obj) === '[object ArrayBuffer]';
		}
		// @ts-expect-error
		: function isArrayBuffer(obj) { // eslint-disable-line no-unused-vars
			return false;
		};

},{"call-bind":11,"call-bound":12,"get-intrinsic":143}],158:[function(require,module,exports){
'use strict';

var callBound = require('call-bound');
var safeRegexTest = require('safe-regex-test');

var toStr = callBound('Object.prototype.toString');
var fnToStr = callBound('Function.prototype.toString');
var isFnRegex = safeRegexTest(/^\s*async(?:\s+function(?:\s+|\()|\s*\()/);

var hasToStringTag = require('has-tostringtag/shams')();
var getProto = require('get-proto');

var getAsyncFunc = require('async-function');

/** @type {import('.')} */
module.exports = function isAsyncFunction(fn) {
	if (typeof fn !== 'function') {
		return false;
	}
	if (isFnRegex(fnToStr(fn))) {
		return true;
	}
	if (!hasToStringTag) {
		var str = toStr(fn);
		return str === '[object AsyncFunction]';
	}
	if (!getProto) {
		return false;
	}
	var asyncFunc = getAsyncFunc();
	return asyncFunc && asyncFunc.prototype === getProto(fn);
};

},{"async-function":2,"call-bound":12,"get-proto":146,"has-tostringtag/shams":154,"safe-regex-test":195}],159:[function(require,module,exports){
'use strict';

var hasBigInts = require('has-bigints')();

if (hasBigInts) {
	var bigIntValueOf = BigInt.prototype.valueOf;
	/** @type {(value: object) => value is BigInt} */
	var tryBigInt = function tryBigIntObject(value) {
		try {
			bigIntValueOf.call(value);
			return true;
		} catch (e) {
		}
		return false;
	};

	/** @type {import('.')} */
	module.exports = function isBigInt(value) {
		if (
			value === null
			|| typeof value === 'undefined'
			|| typeof value === 'boolean'
			|| typeof value === 'string'
			|| typeof value === 'number'
			|| typeof value === 'symbol'
			|| typeof value === 'function'
		) {
			return false;
		}
		if (typeof value === 'bigint') {
			return true;
		}

		return tryBigInt(value);
	};
} else {
	/** @type {import('.')} */
	module.exports = function isBigInt(value) {
		return false && value;
	};
}

},{"has-bigints":149}],160:[function(require,module,exports){
'use strict';

var callBound = require('call-bound');
var $boolToStr = callBound('Boolean.prototype.toString');
var $toString = callBound('Object.prototype.toString');

/** @type {import('.')} */
var tryBooleanObject = function booleanBrandCheck(value) {
	try {
		$boolToStr(value);
		return true;
	} catch (e) {
		return false;
	}
};
var boolClass = '[object Boolean]';
var hasToStringTag = require('has-tostringtag/shams')();

/** @type {import('.')} */
module.exports = function isBoolean(value) {
	if (typeof value === 'boolean') {
		return true;
	}
	if (value === null || typeof value !== 'object') {
		return false;
	}
	return hasToStringTag ? tryBooleanObject(value) : $toString(value) === boolClass;
};

},{"call-bound":12,"has-tostringtag/shams":154}],161:[function(require,module,exports){
'use strict';

var fnToStr = Function.prototype.toString;
var reflectApply = typeof Reflect === 'object' && Reflect !== null && Reflect.apply;
var badArrayLike;
var isCallableMarker;
if (typeof reflectApply === 'function' && typeof Object.defineProperty === 'function') {
	try {
		badArrayLike = Object.defineProperty({}, 'length', {
			get: function () {
				throw isCallableMarker;
			}
		});
		isCallableMarker = {};
		// eslint-disable-next-line no-throw-literal
		reflectApply(function () { throw 42; }, null, badArrayLike);
	} catch (_) {
		if (_ !== isCallableMarker) {
			reflectApply = null;
		}
	}
} else {
	reflectApply = null;
}

var constructorRegex = /^\s*class\b/;
var isES6ClassFn = function isES6ClassFunction(value) {
	try {
		var fnStr = fnToStr.call(value);
		return constructorRegex.test(fnStr);
	} catch (e) {
		return false; // not a function
	}
};

var tryFunctionObject = function tryFunctionToStr(value) {
	try {
		if (isES6ClassFn(value)) { return false; }
		fnToStr.call(value);
		return true;
	} catch (e) {
		return false;
	}
};
var toStr = Object.prototype.toString;
var objectClass = '[object Object]';
var fnClass = '[object Function]';
var genClass = '[object GeneratorFunction]';
var ddaClass = '[object HTMLAllCollection]'; // IE 11
var ddaClass2 = '[object HTML document.all class]';
var ddaClass3 = '[object HTMLCollection]'; // IE 9-10
var hasToStringTag = typeof Symbol === 'function' && !!Symbol.toStringTag; // better: use `has-tostringtag`

var isIE68 = !(0 in [,]); // eslint-disable-line no-sparse-arrays, comma-spacing

var isDDA = function isDocumentDotAll() { return false; };
if (typeof document === 'object') {
	// Firefox 3 canonicalizes DDA to undefined when it's not accessed directly
	var all = document.all;
	if (toStr.call(all) === toStr.call(document.all)) {
		isDDA = function isDocumentDotAll(value) {
			/* globals document: false */
			// in IE 6-8, typeof document.all is "object" and it's truthy
			if ((isIE68 || !value) && (typeof value === 'undefined' || typeof value === 'object')) {
				try {
					var str = toStr.call(value);
					return (
						str === ddaClass
						|| str === ddaClass2
						|| str === ddaClass3 // opera 12.16
						|| str === objectClass // IE 6-8
					) && value('') == null; // eslint-disable-line eqeqeq
				} catch (e) { /**/ }
			}
			return false;
		};
	}
}

module.exports = reflectApply
	? function isCallable(value) {
		if (isDDA(value)) { return true; }
		if (!value) { return false; }
		if (typeof value !== 'function' && typeof value !== 'object') { return false; }
		try {
			reflectApply(value, null, badArrayLike);
		} catch (e) {
			if (e !== isCallableMarker) { return false; }
		}
		return !isES6ClassFn(value) && tryFunctionObject(value);
	}
	: function isCallable(value) {
		if (isDDA(value)) { return true; }
		if (!value) { return false; }
		if (typeof value !== 'function' && typeof value !== 'object') { return false; }
		if (hasToStringTag) { return tryFunctionObject(value); }
		if (isES6ClassFn(value)) { return false; }
		var strClass = toStr.call(value);
		if (strClass !== fnClass && strClass !== genClass && !(/^\[object HTML/).test(strClass)) { return false; }
		return tryFunctionObject(value);
	};

},{}],162:[function(require,module,exports){
'use strict';

var callBound = require('call-bound');

var getDay = callBound('Date.prototype.getDay');
/** @type {import('.')} */
var tryDateObject = function tryDateGetDayCall(value) {
	try {
		getDay(value);
		return true;
	} catch (e) {
		return false;
	}
};

/** @type {(value: unknown) => string} */
var toStr = callBound('Object.prototype.toString');
var dateClass = '[object Date]';
var hasToStringTag = require('has-tostringtag/shams')();

/** @type {import('.')} */
module.exports = function isDateObject(value) {
	if (typeof value !== 'object' || value === null) {
		return false;
	}
	return hasToStringTag ? tryDateObject(value) : toStr(value) === dateClass;
};

},{"call-bound":12,"has-tostringtag/shams":154}],163:[function(require,module,exports){
'use strict';

var callBound = require('call-bound');

/** @type {undefined | ((value: ThisParameterType<typeof FinalizationRegistry.prototype.register>, ...args: Parameters<typeof FinalizationRegistry.prototype.register>) => ReturnType<typeof FinalizationRegistry.prototype.register>)} */
var $register = callBound('FinalizationRegistry.prototype.register', true);

/** @type {import('.')} */
module.exports = $register
	? function isFinalizationRegistry(value) {
		if (!value || typeof value !== 'object') {
			return false;
		}
		try {
			// @ts-expect-error TS can't figure out that it's always truthy here
			$register(value, {}, null);
			return true;
		} catch (e) {
			return false;
		}
	}
	// @ts-ignore unused var
	: function isFinalizationRegistry(value) { // eslint-disable-line no-unused-vars
		return false;
	};

},{"call-bound":12}],164:[function(require,module,exports){
'use strict';

var toStr = Object.prototype.toString;
var fnToStr = Function.prototype.toString;
var isFnRegex = /^\s*(?:function)?\*/;
var hasToStringTag = require('has-tostringtag/shams')();
var getProto = Object.getPrototypeOf;
var getGeneratorFunc = function () { // eslint-disable-line consistent-return
	if (!hasToStringTag) {
		return false;
	}
	try {
		return Function('return function*() {}')();
	} catch (e) {
	}
};
var GeneratorFunction;

module.exports = function isGeneratorFunction(fn) {
	if (typeof fn !== 'function') {
		return false;
	}
	if (isFnRegex.test(fnToStr.call(fn))) {
		return true;
	}
	if (!hasToStringTag) {
		var str = toStr.call(fn);
		return str === '[object GeneratorFunction]';
	}
	if (!getProto) {
		return false;
	}
	if (typeof GeneratorFunction === 'undefined') {
		var generatorFunc = getGeneratorFunc();
		GeneratorFunction = generatorFunc ? getProto(generatorFunc) : false;
	}
	return getProto(fn) === GeneratorFunction;
};

},{"has-tostringtag/shams":154}],165:[function(require,module,exports){
'use strict';

/** @const */
var $Map = typeof Map === 'function' && Map.prototype ? Map : null;
var $Set = typeof Set === 'function' && Set.prototype ? Set : null;

var exported;

if (!$Map) {
	/** @type {import('.')} */
	// eslint-disable-next-line no-unused-vars
	exported = function isMap(x) {
		// `Map` is not present in this environment.
		return false;
	};
}

var $mapHas = $Map ? Map.prototype.has : null;
var $setHas = $Set ? Set.prototype.has : null;
if (!exported && !$mapHas) {
	/** @type {import('.')} */
	// eslint-disable-next-line no-unused-vars
	exported = function isMap(x) {
		// `Map` does not have a `has` method
		return false;
	};
}

/** @type {import('.')} */
module.exports = exported || function isMap(x) {
	if (!x || typeof x !== 'object') {
		return false;
	}
	try {
		$mapHas.call(x);
		if ($setHas) {
			try {
				$setHas.call(x);
			} catch (e) {
				return true;
			}
		}
		// @ts-expect-error TS can't figure out that $Map is always truthy here
		return x instanceof $Map; // core-js workaround, pre-v2.5.0
	} catch (e) {}
	return false;
};

},{}],166:[function(require,module,exports){
'use strict';

var callBound = require('call-bound');

var $numToStr = callBound('Number.prototype.toString');

/** @type {import('.')} */
var tryNumberObject = function tryNumberObject(value) {
	try {
		$numToStr(value);
		return true;
	} catch (e) {
		return false;
	}
};
var $toString = callBound('Object.prototype.toString');
var numClass = '[object Number]';
var hasToStringTag = require('has-tostringtag/shams')();

/** @type {import('.')} */
module.exports = function isNumberObject(value) {
	if (typeof value === 'number') {
		return true;
	}
	if (!value || typeof value !== 'object') {
		return false;
	}
	return hasToStringTag ? tryNumberObject(value) : $toString(value) === numClass;
};

},{"call-bound":12,"has-tostringtag/shams":154}],167:[function(require,module,exports){
'use strict';

var callBound = require('call-bound');
var hasToStringTag = require('has-tostringtag/shams')();
var hasOwn = require('hasown');
var gOPD = require('gopd');

/** @type {import('.')} */
var fn;

if (hasToStringTag) {
	/** @type {(receiver: ThisParameterType<typeof RegExp.prototype.exec>, ...args: Parameters<typeof RegExp.prototype.exec>) => ReturnType<typeof RegExp.prototype.exec>} */
	var $exec = callBound('RegExp.prototype.exec');
	/** @type {object} */
	var isRegexMarker = {};

	var throwRegexMarker = function () {
		throw isRegexMarker;
	};
	/** @type {{ toString(): never, valueOf(): never, [Symbol.toPrimitive]?(): never }} */
	var badStringifier = {
		toString: throwRegexMarker,
		valueOf: throwRegexMarker
	};

	if (typeof Symbol.toPrimitive === 'symbol') {
		badStringifier[Symbol.toPrimitive] = throwRegexMarker;
	}

	/** @type {import('.')} */
	// @ts-expect-error TS can't figure out that the $exec call always throws
	// eslint-disable-next-line consistent-return
	fn = function isRegex(value) {
		if (!value || typeof value !== 'object') {
			return false;
		}

		// eslint-disable-next-line no-extra-parens
		var descriptor = /** @type {NonNullable<typeof gOPD>} */ (gOPD)(/** @type {{ lastIndex?: unknown }} */ (value), 'lastIndex');
		var hasLastIndexDataProperty = descriptor && hasOwn(descriptor, 'value');
		if (!hasLastIndexDataProperty) {
			return false;
		}

		try {
			// eslint-disable-next-line no-extra-parens
			$exec(value, /** @type {string} */ (/** @type {unknown} */ (badStringifier)));
		} catch (e) {
			return e === isRegexMarker;
		}
	};
} else {
	/** @type {(receiver: ThisParameterType<typeof Object.prototype.toString>, ...args: Parameters<typeof Object.prototype.toString>) => ReturnType<typeof Object.prototype.toString>} */
	var $toString = callBound('Object.prototype.toString');
	/** @const @type {'[object RegExp]'} */
	var regexClass = '[object RegExp]';

	/** @type {import('.')} */
	fn = function isRegex(value) {
		// In older browsers, typeof regex incorrectly returns 'function'
		if (!value || (typeof value !== 'object' && typeof value !== 'function')) {
			return false;
		}

		return $toString(value) === regexClass;
	};
}

module.exports = fn;

},{"call-bound":12,"gopd":148,"has-tostringtag/shams":154,"hasown":155}],168:[function(require,module,exports){
'use strict';

var $Map = typeof Map === 'function' && Map.prototype ? Map : null;
var $Set = typeof Set === 'function' && Set.prototype ? Set : null;

var exported;

if (!$Set) {
	/** @type {import('.')} */
	// eslint-disable-next-line no-unused-vars
	exported = function isSet(x) {
		// `Set` is not present in this environment.
		return false;
	};
}

var $mapHas = $Map ? Map.prototype.has : null;
var $setHas = $Set ? Set.prototype.has : null;
if (!exported && !$setHas) {
	/** @type {import('.')} */
	// eslint-disable-next-line no-unused-vars
	exported = function isSet(x) {
		// `Set` does not have a `has` method
		return false;
	};
}

/** @type {import('.')} */
module.exports = exported || function isSet(x) {
	if (!x || typeof x !== 'object') {
		return false;
	}
	try {
		$setHas.call(x);
		if ($mapHas) {
			try {
				$mapHas.call(x);
			} catch (e) {
				return true;
			}
		}
		// @ts-expect-error TS can't figure out that $Set is always truthy here
		return x instanceof $Set; // core-js workaround, pre-v2.5.0
	} catch (e) {}
	return false;
};

},{}],169:[function(require,module,exports){
'use strict';

var callBound = require('call-bound');

/** @type {undefined | ((thisArg: SharedArrayBuffer) => number)} */
var $byteLength = callBound('SharedArrayBuffer.prototype.byteLength', true);

/** @type {import('.')} */
module.exports = $byteLength
	? function isSharedArrayBuffer(obj) {
		if (!obj || typeof obj !== 'object') {
			return false;
		}
		try {
			// @ts-expect-error TS can't figure out this closed-over variable is non-nullable, and it's fine that `obj` might not be a SAB
			$byteLength(obj);
			return true;
		} catch (e) {
			return false;
		}
	}
	: function isSharedArrayBuffer(_obj) { // eslint-disable-line no-unused-vars
		return false;
	};

},{"call-bound":12}],170:[function(require,module,exports){
'use strict';

var callBound = require('call-bound');

/** @type {(receiver: ThisParameterType<typeof String.prototype.valueOf>, ...args: Parameters<typeof String.prototype.valueOf>) => ReturnType<typeof String.prototype.valueOf>} */
var $strValueOf = callBound('String.prototype.valueOf');

/** @type {import('.')} */
var tryStringObject = function tryStringObject(value) {
	try {
		$strValueOf(value);
		return true;
	} catch (e) {
		return false;
	}
};
/** @type {(receiver: ThisParameterType<typeof Object.prototype.toString>, ...args: Parameters<typeof Object.prototype.toString>) => ReturnType<typeof Object.prototype.toString>} */
var $toString = callBound('Object.prototype.toString');
var strClass = '[object String]';
var hasToStringTag = require('has-tostringtag/shams')();

/** @type {import('.')} */
module.exports = function isString(value) {
	if (typeof value === 'string') {
		return true;
	}
	if (!value || typeof value !== 'object') {
		return false;
	}
	return hasToStringTag ? tryStringObject(value) : $toString(value) === strClass;
};

},{"call-bound":12,"has-tostringtag/shams":154}],171:[function(require,module,exports){
'use strict';

var callBound = require('call-bound');
var $toString = callBound('Object.prototype.toString');
var hasSymbols = require('has-symbols')();
var safeRegexTest = require('safe-regex-test');

if (hasSymbols) {
	var $symToStr = callBound('Symbol.prototype.toString');
	var isSymString = safeRegexTest(/^Symbol\(.*\)$/);

	/** @type {(value: object) => value is Symbol} */
	var isSymbolObject = function isRealSymbolObject(value) {
		if (typeof value.valueOf() !== 'symbol') {
			return false;
		}
		return isSymString($symToStr(value));
	};

	/** @type {import('.')} */
	module.exports = function isSymbol(value) {
		if (typeof value === 'symbol') {
			return true;
		}
		if (!value || typeof value !== 'object' || $toString(value) !== '[object Symbol]') {
			return false;
		}
		try {
			return isSymbolObject(value);
		} catch (e) {
			return false;
		}
	};
} else {
	/** @type {import('.')} */
	module.exports = function isSymbol(value) {
		// this environment does not support Symbols.
		return false && value;
	};
}

},{"call-bound":12,"has-symbols":152,"safe-regex-test":195}],172:[function(require,module,exports){
'use strict';

var whichTypedArray = require('which-typed-array');

/** @type {import('.')} */
module.exports = function isTypedArray(value) {
	return !!whichTypedArray(value);
};

},{"which-typed-array":212}],173:[function(require,module,exports){
'use strict';

var $WeakMap = typeof WeakMap === 'function' && WeakMap.prototype ? WeakMap : null;
var $WeakSet = typeof WeakSet === 'function' && WeakSet.prototype ? WeakSet : null;

var exported;

if (!$WeakMap) {
	/** @type {import('.')} */
	// eslint-disable-next-line no-unused-vars
	exported = function isWeakMap(x) {
		// `WeakMap` is not present in this environment.
		return false;
	};
}

var $mapHas = $WeakMap ? $WeakMap.prototype.has : null;
var $setHas = $WeakSet ? $WeakSet.prototype.has : null;
if (!exported && !$mapHas) {
	/** @type {import('.')} */
	// eslint-disable-next-line no-unused-vars
	exported = function isWeakMap(x) {
		// `WeakMap` does not have a `has` method
		return false;
	};
}

/** @type {import('.')} */
module.exports = exported || function isWeakMap(x) {
	if (!x || typeof x !== 'object') {
		return false;
	}
	try {
		$mapHas.call(x, $mapHas);
		if ($setHas) {
			try {
				$setHas.call(x, $setHas);
			} catch (e) {
				return true;
			}
		}
		// @ts-expect-error TS can't figure out that $WeakMap is always truthy here
		return x instanceof $WeakMap; // core-js workaround, pre-v3
	} catch (e) {}
	return false;
};

},{}],174:[function(require,module,exports){
'use strict';

var callBound = require('call-bound');

// eslint-disable-next-line no-extra-parens
var $deref = /** @type {<T extends WeakKey>(thisArg: WeakRef<T>) => T | undefined} */ (callBound('WeakRef.prototype.deref', true));

/** @type {import('.')} */
module.exports = typeof WeakRef === 'undefined'
	? function isWeakRef(_value) { // eslint-disable-line no-unused-vars
		return false;
	}
	: function isWeakRef(value) {
		if (!value || typeof value !== 'object') {
			return false;
		}
		try {
			// @ts-expect-error
			$deref(value);
			return true;
		} catch (e) {
			return false;
		}
	};

},{"call-bound":12}],175:[function(require,module,exports){
'use strict';

var GetIntrinsic = require('get-intrinsic');
var callBound = require('call-bound');

var $WeakSet = GetIntrinsic('%WeakSet%', true);

/** @type {undefined | (<V>(thisArg: Set<V>, value: V) => boolean)} */
var $setHas = callBound('WeakSet.prototype.has', true);

if ($setHas) {
	/** @type {undefined | (<K extends object, V>(thisArg: WeakMap<K, V>, key: K) => boolean)} */
	var $mapHas = callBound('WeakMap.prototype.has', true);

	/** @type {import('.')} */
	module.exports = function isWeakSet(x) {
		if (!x || typeof x !== 'object') {
			return false;
		}
		try {
			// @ts-expect-error TS can't figure out that $setHas is always truthy here
			$setHas(x, $setHas);
			if ($mapHas) {
				try {
					// @ts-expect-error this indeed might not be a weak collection
					$mapHas(x, $mapHas);
				} catch (e) {
					return true;
				}
			}
			// @ts-expect-error TS can't figure out that $WeakSet is always truthy here
			return x instanceof $WeakSet; // core-js workaround, pre-v3
		} catch (e) {}
		return false;
	};
} else {
	/** @type {import('.')} */
	// @ts-expect-error
	module.exports = function isWeakSet(x) { // eslint-disable-line no-unused-vars
		// `WeakSet` does not exist, or does not have a `has` method
		return false;
	};
}

},{"call-bound":12,"get-intrinsic":143}],176:[function(require,module,exports){
'use strict';

/** @type {import('./abs')} */
module.exports = Math.abs;

},{}],177:[function(require,module,exports){
'use strict';

/** @type {import('./maxSafeInteger')} */
// eslint-disable-next-line no-extra-parens
module.exports = /** @type {import('./maxSafeInteger')} */ (Number.MAX_SAFE_INTEGER) || 9007199254740991; // Math.pow(2, 53) - 1;

},{}],178:[function(require,module,exports){
'use strict';

/** @type {import('./floor')} */
module.exports = Math.floor;

},{}],179:[function(require,module,exports){
'use strict';

var $isNaN = require('./isNaN');

/** @type {import('./isFinite')} */
module.exports = function isFinite(x) {
	return (typeof x === 'number' || typeof x === 'bigint')
        && !$isNaN(x)
        && x !== Infinity
        && x !== -Infinity;
};


},{"./isNaN":181}],180:[function(require,module,exports){
'use strict';

var $abs = require('./abs');
var $floor = require('./floor');

var $isNaN = require('./isNaN');
var $isFinite = require('./isFinite');

/** @type {import('./isInteger')} */
module.exports = function isInteger(argument) {
	if (typeof argument !== 'number' || $isNaN(argument) || !$isFinite(argument)) {
		return false;
	}
	var absValue = $abs(argument);
	return $floor(absValue) === absValue;
};

},{"./abs":176,"./floor":178,"./isFinite":179,"./isNaN":181}],181:[function(require,module,exports){
'use strict';

/** @type {import('./isNaN')} */
module.exports = Number.isNaN || function isNaN(a) {
	return a !== a;
};

},{}],182:[function(require,module,exports){
'use strict';

/** @type {import('./isNegativeZero')} */
module.exports = function isNegativeZero(x) {
	return x === 0 && 1 / x === 1 / -0;
};

},{}],183:[function(require,module,exports){
'use strict';

/** @type {import('./max')} */
module.exports = Math.max;

},{}],184:[function(require,module,exports){
'use strict';

/** @type {import('./min')} */
module.exports = Math.min;

},{}],185:[function(require,module,exports){
'use strict';

var $floor = require('./floor');

/** @type {import('./mod')} */
module.exports = function mod(number, modulo) {
	var remain = number % modulo;
	return $floor(remain >= 0 ? remain : remain + modulo);
};

},{"./floor":178}],186:[function(require,module,exports){
'use strict';

/** @type {import('./pow')} */
module.exports = Math.pow;

},{}],187:[function(require,module,exports){
'use strict';

/** @type {import('./round')} */
module.exports = Math.round;

},{}],188:[function(require,module,exports){
'use strict';

var $isNaN = require('./isNaN');

/** @type {import('./sign')} */
module.exports = function sign(number) {
	if ($isNaN(number) || number === 0) {
		return number;
	}
	return number < 0 ? -1 : +1;
};

},{"./isNaN":181}],189:[function(require,module,exports){
(function (global){(function (){
var hasMap = typeof Map === 'function' && Map.prototype;
var mapSizeDescriptor = Object.getOwnPropertyDescriptor && hasMap ? Object.getOwnPropertyDescriptor(Map.prototype, 'size') : null;
var mapSize = hasMap && mapSizeDescriptor && typeof mapSizeDescriptor.get === 'function' ? mapSizeDescriptor.get : null;
var mapForEach = hasMap && Map.prototype.forEach;
var hasSet = typeof Set === 'function' && Set.prototype;
var setSizeDescriptor = Object.getOwnPropertyDescriptor && hasSet ? Object.getOwnPropertyDescriptor(Set.prototype, 'size') : null;
var setSize = hasSet && setSizeDescriptor && typeof setSizeDescriptor.get === 'function' ? setSizeDescriptor.get : null;
var setForEach = hasSet && Set.prototype.forEach;
var hasWeakMap = typeof WeakMap === 'function' && WeakMap.prototype;
var weakMapHas = hasWeakMap ? WeakMap.prototype.has : null;
var hasWeakSet = typeof WeakSet === 'function' && WeakSet.prototype;
var weakSetHas = hasWeakSet ? WeakSet.prototype.has : null;
var hasWeakRef = typeof WeakRef === 'function' && WeakRef.prototype;
var weakRefDeref = hasWeakRef ? WeakRef.prototype.deref : null;
var booleanValueOf = Boolean.prototype.valueOf;
var objectToString = Object.prototype.toString;
var functionToString = Function.prototype.toString;
var $match = String.prototype.match;
var $slice = String.prototype.slice;
var $replace = String.prototype.replace;
var $toUpperCase = String.prototype.toUpperCase;
var $toLowerCase = String.prototype.toLowerCase;
var $test = RegExp.prototype.test;
var $concat = Array.prototype.concat;
var $join = Array.prototype.join;
var $arrSlice = Array.prototype.slice;
var $floor = Math.floor;
var bigIntValueOf = typeof BigInt === 'function' ? BigInt.prototype.valueOf : null;
var gOPS = Object.getOwnPropertySymbols;
var symToString = typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol' ? Symbol.prototype.toString : null;
var hasShammedSymbols = typeof Symbol === 'function' && typeof Symbol.iterator === 'object';
// ie, `has-tostringtag/shams
var toStringTag = typeof Symbol === 'function' && Symbol.toStringTag && (typeof Symbol.toStringTag === hasShammedSymbols ? 'object' : 'symbol')
    ? Symbol.toStringTag
    : null;
var isEnumerable = Object.prototype.propertyIsEnumerable;

var gPO = (typeof Reflect === 'function' ? Reflect.getPrototypeOf : Object.getPrototypeOf) || (
    [].__proto__ === Array.prototype // eslint-disable-line no-proto
        ? function (O) {
            return O.__proto__; // eslint-disable-line no-proto
        }
        : null
);

function addNumericSeparator(num, str) {
    if (
        num === Infinity
        || num === -Infinity
        || num !== num
        || (num && num > -1000 && num < 1000)
        || $test.call(/e/, str)
    ) {
        return str;
    }
    var sepRegex = /[0-9](?=(?:[0-9]{3})+(?![0-9]))/g;
    if (typeof num === 'number') {
        var int = num < 0 ? -$floor(-num) : $floor(num); // trunc(num)
        if (int !== num) {
            var intStr = String(int);
            var dec = $slice.call(str, intStr.length + 1);
            return $replace.call(intStr, sepRegex, '$&_') + '.' + $replace.call($replace.call(dec, /([0-9]{3})/g, '$&_'), /_$/, '');
        }
    }
    return $replace.call(str, sepRegex, '$&_');
}

var utilInspect = require('./util.inspect');
var inspectCustom = utilInspect.custom;
var inspectSymbol = isSymbol(inspectCustom) ? inspectCustom : null;

var quotes = {
    __proto__: null,
    'double': '"',
    single: "'"
};
var quoteREs = {
    __proto__: null,
    'double': /(["\\])/g,
    single: /(['\\])/g
};

module.exports = function inspect_(obj, options, depth, seen) {
    var opts = options || {};

    if (has(opts, 'quoteStyle') && !has(quotes, opts.quoteStyle)) {
        throw new TypeError('option "quoteStyle" must be "single" or "double"');
    }
    if (
        has(opts, 'maxStringLength') && (typeof opts.maxStringLength === 'number'
            ? opts.maxStringLength < 0 && opts.maxStringLength !== Infinity
            : opts.maxStringLength !== null
        )
    ) {
        throw new TypeError('option "maxStringLength", if provided, must be a positive integer, Infinity, or `null`');
    }
    var customInspect = has(opts, 'customInspect') ? opts.customInspect : true;
    if (typeof customInspect !== 'boolean' && customInspect !== 'symbol') {
        throw new TypeError('option "customInspect", if provided, must be `true`, `false`, or `\'symbol\'`');
    }

    if (
        has(opts, 'indent')
        && opts.indent !== null
        && opts.indent !== '\t'
        && !(parseInt(opts.indent, 10) === opts.indent && opts.indent > 0)
    ) {
        throw new TypeError('option "indent" must be "\\t", an integer > 0, or `null`');
    }
    if (has(opts, 'numericSeparator') && typeof opts.numericSeparator !== 'boolean') {
        throw new TypeError('option "numericSeparator", if provided, must be `true` or `false`');
    }
    var numericSeparator = opts.numericSeparator;

    if (typeof obj === 'undefined') {
        return 'undefined';
    }
    if (obj === null) {
        return 'null';
    }
    if (typeof obj === 'boolean') {
        return obj ? 'true' : 'false';
    }

    if (typeof obj === 'string') {
        return inspectString(obj, opts);
    }
    if (typeof obj === 'number') {
        if (obj === 0) {
            return Infinity / obj > 0 ? '0' : '-0';
        }
        var str = String(obj);
        return numericSeparator ? addNumericSeparator(obj, str) : str;
    }
    if (typeof obj === 'bigint') {
        var bigIntStr = String(obj) + 'n';
        return numericSeparator ? addNumericSeparator(obj, bigIntStr) : bigIntStr;
    }

    var maxDepth = typeof opts.depth === 'undefined' ? 5 : opts.depth;
    if (typeof depth === 'undefined') { depth = 0; }
    if (depth >= maxDepth && maxDepth > 0 && typeof obj === 'object') {
        return isArray(obj) ? '[Array]' : '[Object]';
    }

    var indent = getIndent(opts, depth);

    if (typeof seen === 'undefined') {
        seen = [];
    } else if (indexOf(seen, obj) >= 0) {
        return '[Circular]';
    }

    function inspect(value, from, noIndent) {
        if (from) {
            seen = $arrSlice.call(seen);
            seen.push(from);
        }
        if (noIndent) {
            var newOpts = {
                depth: opts.depth
            };
            if (has(opts, 'quoteStyle')) {
                newOpts.quoteStyle = opts.quoteStyle;
            }
            return inspect_(value, newOpts, depth + 1, seen);
        }
        return inspect_(value, opts, depth + 1, seen);
    }

    if (typeof obj === 'function' && !isRegExp(obj)) { // in older engines, regexes are callable
        var name = nameOf(obj);
        var keys = arrObjKeys(obj, inspect);
        return '[Function' + (name ? ': ' + name : ' (anonymous)') + ']' + (keys.length > 0 ? ' { ' + $join.call(keys, ', ') + ' }' : '');
    }
    if (isSymbol(obj)) {
        var symString = hasShammedSymbols ? $replace.call(String(obj), /^(Symbol\(.*\))_[^)]*$/, '$1') : symToString.call(obj);
        return typeof obj === 'object' && !hasShammedSymbols ? markBoxed(symString) : symString;
    }
    if (isElement(obj)) {
        var s = '<' + $toLowerCase.call(String(obj.nodeName));
        var attrs = obj.attributes || [];
        for (var i = 0; i < attrs.length; i++) {
            s += ' ' + attrs[i].name + '=' + wrapQuotes(quote(attrs[i].value), 'double', opts);
        }
        s += '>';
        if (obj.childNodes && obj.childNodes.length) { s += '...'; }
        s += '</' + $toLowerCase.call(String(obj.nodeName)) + '>';
        return s;
    }
    if (isArray(obj)) {
        if (obj.length === 0) { return '[]'; }
        var xs = arrObjKeys(obj, inspect);
        if (indent && !singleLineValues(xs)) {
            return '[' + indentedJoin(xs, indent) + ']';
        }
        return '[ ' + $join.call(xs, ', ') + ' ]';
    }
    if (isError(obj)) {
        var parts = arrObjKeys(obj, inspect);
        if (!('cause' in Error.prototype) && 'cause' in obj && !isEnumerable.call(obj, 'cause')) {
            return '{ [' + String(obj) + '] ' + $join.call($concat.call('[cause]: ' + inspect(obj.cause), parts), ', ') + ' }';
        }
        if (parts.length === 0) { return '[' + String(obj) + ']'; }
        return '{ [' + String(obj) + '] ' + $join.call(parts, ', ') + ' }';
    }
    if (typeof obj === 'object' && customInspect) {
        if (inspectSymbol && typeof obj[inspectSymbol] === 'function' && utilInspect) {
            return utilInspect(obj, { depth: maxDepth - depth });
        } else if (customInspect !== 'symbol' && typeof obj.inspect === 'function') {
            return obj.inspect();
        }
    }
    if (isMap(obj)) {
        var mapParts = [];
        if (mapForEach) {
            mapForEach.call(obj, function (value, key) {
                mapParts.push(inspect(key, obj, true) + ' => ' + inspect(value, obj));
            });
        }
        return collectionOf('Map', mapSize.call(obj), mapParts, indent);
    }
    if (isSet(obj)) {
        var setParts = [];
        if (setForEach) {
            setForEach.call(obj, function (value) {
                setParts.push(inspect(value, obj));
            });
        }
        return collectionOf('Set', setSize.call(obj), setParts, indent);
    }
    if (isWeakMap(obj)) {
        return weakCollectionOf('WeakMap');
    }
    if (isWeakSet(obj)) {
        return weakCollectionOf('WeakSet');
    }
    if (isWeakRef(obj)) {
        return weakCollectionOf('WeakRef');
    }
    if (isNumber(obj)) {
        return markBoxed(inspect(Number(obj)));
    }
    if (isBigInt(obj)) {
        return markBoxed(inspect(bigIntValueOf.call(obj)));
    }
    if (isBoolean(obj)) {
        return markBoxed(booleanValueOf.call(obj));
    }
    if (isString(obj)) {
        return markBoxed(inspect(String(obj)));
    }
    // note: in IE 8, sometimes `global !== window` but both are the prototypes of each other
    /* eslint-env browser */
    if (typeof window !== 'undefined' && obj === window) {
        return '{ [object Window] }';
    }
    if (
        (typeof globalThis !== 'undefined' && obj === globalThis)
        || (typeof global !== 'undefined' && obj === global)
    ) {
        return '{ [object globalThis] }';
    }
    if (!isDate(obj) && !isRegExp(obj)) {
        var ys = arrObjKeys(obj, inspect);
        var isPlainObject = gPO ? gPO(obj) === Object.prototype : obj instanceof Object || obj.constructor === Object;
        var protoTag = obj instanceof Object ? '' : 'null prototype';
        var stringTag = !isPlainObject && toStringTag && Object(obj) === obj && toStringTag in obj ? $slice.call(toStr(obj), 8, -1) : protoTag ? 'Object' : '';
        var constructorTag = isPlainObject || typeof obj.constructor !== 'function' ? '' : obj.constructor.name ? obj.constructor.name + ' ' : '';
        var tag = constructorTag + (stringTag || protoTag ? '[' + $join.call($concat.call([], stringTag || [], protoTag || []), ': ') + '] ' : '');
        if (ys.length === 0) { return tag + '{}'; }
        if (indent) {
            return tag + '{' + indentedJoin(ys, indent) + '}';
        }
        return tag + '{ ' + $join.call(ys, ', ') + ' }';
    }
    return String(obj);
};

function wrapQuotes(s, defaultStyle, opts) {
    var style = opts.quoteStyle || defaultStyle;
    var quoteChar = quotes[style];
    return quoteChar + s + quoteChar;
}

function quote(s) {
    return $replace.call(String(s), /"/g, '&quot;');
}

function canTrustToString(obj) {
    return !toStringTag || !(typeof obj === 'object' && (toStringTag in obj || typeof obj[toStringTag] !== 'undefined'));
}
function isArray(obj) { return toStr(obj) === '[object Array]' && canTrustToString(obj); }
function isDate(obj) { return toStr(obj) === '[object Date]' && canTrustToString(obj); }
function isRegExp(obj) { return toStr(obj) === '[object RegExp]' && canTrustToString(obj); }
function isError(obj) { return toStr(obj) === '[object Error]' && canTrustToString(obj); }
function isString(obj) { return toStr(obj) === '[object String]' && canTrustToString(obj); }
function isNumber(obj) { return toStr(obj) === '[object Number]' && canTrustToString(obj); }
function isBoolean(obj) { return toStr(obj) === '[object Boolean]' && canTrustToString(obj); }

// Symbol and BigInt do have Symbol.toStringTag by spec, so that can't be used to eliminate false positives
function isSymbol(obj) {
    if (hasShammedSymbols) {
        return obj && typeof obj === 'object' && obj instanceof Symbol;
    }
    if (typeof obj === 'symbol') {
        return true;
    }
    if (!obj || typeof obj !== 'object' || !symToString) {
        return false;
    }
    try {
        symToString.call(obj);
        return true;
    } catch (e) {}
    return false;
}

function isBigInt(obj) {
    if (!obj || typeof obj !== 'object' || !bigIntValueOf) {
        return false;
    }
    try {
        bigIntValueOf.call(obj);
        return true;
    } catch (e) {}
    return false;
}

var hasOwn = Object.prototype.hasOwnProperty || function (key) { return key in this; };
function has(obj, key) {
    return hasOwn.call(obj, key);
}

function toStr(obj) {
    return objectToString.call(obj);
}

function nameOf(f) {
    if (f.name) { return f.name; }
    var m = $match.call(functionToString.call(f), /^function\s*([\w$]+)/);
    if (m) { return m[1]; }
    return null;
}

function indexOf(xs, x) {
    if (xs.indexOf) { return xs.indexOf(x); }
    for (var i = 0, l = xs.length; i < l; i++) {
        if (xs[i] === x) { return i; }
    }
    return -1;
}

function isMap(x) {
    if (!mapSize || !x || typeof x !== 'object') {
        return false;
    }
    try {
        mapSize.call(x);
        try {
            setSize.call(x);
        } catch (s) {
            return true;
        }
        return x instanceof Map; // core-js workaround, pre-v2.5.0
    } catch (e) {}
    return false;
}

function isWeakMap(x) {
    if (!weakMapHas || !x || typeof x !== 'object') {
        return false;
    }
    try {
        weakMapHas.call(x, weakMapHas);
        try {
            weakSetHas.call(x, weakSetHas);
        } catch (s) {
            return true;
        }
        return x instanceof WeakMap; // core-js workaround, pre-v2.5.0
    } catch (e) {}
    return false;
}

function isWeakRef(x) {
    if (!weakRefDeref || !x || typeof x !== 'object') {
        return false;
    }
    try {
        weakRefDeref.call(x);
        return true;
    } catch (e) {}
    return false;
}

function isSet(x) {
    if (!setSize || !x || typeof x !== 'object') {
        return false;
    }
    try {
        setSize.call(x);
        try {
            mapSize.call(x);
        } catch (m) {
            return true;
        }
        return x instanceof Set; // core-js workaround, pre-v2.5.0
    } catch (e) {}
    return false;
}

function isWeakSet(x) {
    if (!weakSetHas || !x || typeof x !== 'object') {
        return false;
    }
    try {
        weakSetHas.call(x, weakSetHas);
        try {
            weakMapHas.call(x, weakMapHas);
        } catch (s) {
            return true;
        }
        return x instanceof WeakSet; // core-js workaround, pre-v2.5.0
    } catch (e) {}
    return false;
}

function isElement(x) {
    if (!x || typeof x !== 'object') { return false; }
    if (typeof HTMLElement !== 'undefined' && x instanceof HTMLElement) {
        return true;
    }
    return typeof x.nodeName === 'string' && typeof x.getAttribute === 'function';
}

function inspectString(str, opts) {
    if (str.length > opts.maxStringLength) {
        var remaining = str.length - opts.maxStringLength;
        var trailer = '... ' + remaining + ' more character' + (remaining > 1 ? 's' : '');
        return inspectString($slice.call(str, 0, opts.maxStringLength), opts) + trailer;
    }
    var quoteRE = quoteREs[opts.quoteStyle || 'single'];
    quoteRE.lastIndex = 0;
    // eslint-disable-next-line no-control-regex
    var s = $replace.call($replace.call(str, quoteRE, '\\$1'), /[\x00-\x1f]/g, lowbyte);
    return wrapQuotes(s, 'single', opts);
}

function lowbyte(c) {
    var n = c.charCodeAt(0);
    var x = {
        8: 'b',
        9: 't',
        10: 'n',
        12: 'f',
        13: 'r'
    }[n];
    if (x) { return '\\' + x; }
    return '\\x' + (n < 0x10 ? '0' : '') + $toUpperCase.call(n.toString(16));
}

function markBoxed(str) {
    return 'Object(' + str + ')';
}

function weakCollectionOf(type) {
    return type + ' { ? }';
}

function collectionOf(type, size, entries, indent) {
    var joinedEntries = indent ? indentedJoin(entries, indent) : $join.call(entries, ', ');
    return type + ' (' + size + ') {' + joinedEntries + '}';
}

function singleLineValues(xs) {
    for (var i = 0; i < xs.length; i++) {
        if (indexOf(xs[i], '\n') >= 0) {
            return false;
        }
    }
    return true;
}

function getIndent(opts, depth) {
    var baseIndent;
    if (opts.indent === '\t') {
        baseIndent = '\t';
    } else if (typeof opts.indent === 'number' && opts.indent > 0) {
        baseIndent = $join.call(Array(opts.indent + 1), ' ');
    } else {
        return null;
    }
    return {
        base: baseIndent,
        prev: $join.call(Array(depth + 1), baseIndent)
    };
}

function indentedJoin(xs, indent) {
    if (xs.length === 0) { return ''; }
    var lineJoiner = '\n' + indent.prev + indent.base;
    return lineJoiner + $join.call(xs, ',' + lineJoiner) + '\n' + indent.prev;
}

function arrObjKeys(obj, inspect) {
    var isArr = isArray(obj);
    var xs = [];
    if (isArr) {
        xs.length = obj.length;
        for (var i = 0; i < obj.length; i++) {
            xs[i] = has(obj, i) ? inspect(obj[i], obj) : '';
        }
    }
    var syms = typeof gOPS === 'function' ? gOPS(obj) : [];
    var symMap;
    if (hasShammedSymbols) {
        symMap = {};
        for (var k = 0; k < syms.length; k++) {
            symMap['$' + syms[k]] = syms[k];
        }
    }

    for (var key in obj) { // eslint-disable-line no-restricted-syntax
        if (!has(obj, key)) { continue; } // eslint-disable-line no-restricted-syntax, no-continue
        if (isArr && String(Number(key)) === key && key < obj.length) { continue; } // eslint-disable-line no-restricted-syntax, no-continue
        if (hasShammedSymbols && symMap['$' + key] instanceof Symbol) {
            // this is to prevent shammed Symbols, which are stored as strings, from being included in the string key section
            continue; // eslint-disable-line no-restricted-syntax, no-continue
        } else if ($test.call(/[^\w$]/, key)) {
            xs.push(inspect(key, obj) + ': ' + inspect(obj[key], obj));
        } else {
            xs.push(key + ': ' + inspect(obj[key], obj));
        }
    }
    if (typeof gOPS === 'function') {
        for (var j = 0; j < syms.length; j++) {
            if (isEnumerable.call(obj, syms[j])) {
                xs.push('[' + inspect(syms[j]) + ']: ' + inspect(obj[syms[j]], obj));
            }
        }
    }
    return xs;
}

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./util.inspect":4}],190:[function(require,module,exports){
'use strict';

/** @type {import('.')} */
module.exports = [
	'Float32Array',
	'Float64Array',
	'Int8Array',
	'Int16Array',
	'Int32Array',
	'Uint8Array',
	'Uint8ClampedArray',
	'Uint16Array',
	'Uint32Array',
	'BigInt64Array',
	'BigUint64Array'
];

},{}],191:[function(require,module,exports){
'use strict';

var GetIntrinsic = require('get-intrinsic');
var IsCallable = require('es-abstract/2024/IsCallable');
var isObject = require('es-abstract/helpers/isObject');
var whichBuiltinType = require('which-builtin-type');
var $TypeError = require('es-errors/type');

var gPO = require('get-proto');
var $Object = require('es-object-atoms');

module.exports = function getPrototypeOf(O) {
	if (!isObject(O)) {
		throw new $TypeError('Reflect.getPrototypeOf called on non-object');
	}

	if (gPO) {
		return gPO(O);
	}

	var type = whichBuiltinType(O);
	if (type) {
		var intrinsic = GetIntrinsic('%' + type + '.prototype%', true);
		if (intrinsic) {
			return intrinsic;
		}
	}
	if (IsCallable(O.constructor)) {
		return O.constructor.prototype;
	}
	if (O instanceof Object) {
		return $Object.prototype;
	}

	/*
	 * Correctly return null for Objects created with `Object.create(null)` (shammed or native) or `{ __proto__: null}`.  Also returns null for
	 * cross-realm objects on browsers that lack `__proto__` support (like IE <11), but that's the best we can do.
	 */
	return null;
};

},{"es-abstract/2024/IsCallable":26,"es-abstract/helpers/isObject":76,"es-errors/type":128,"es-object-atoms":131,"get-intrinsic":143,"get-proto":146,"which-builtin-type":209}],192:[function(require,module,exports){
'use strict';

var implementation = require('./implementation');

var getProto = require('get-proto');

module.exports = function getPolyfill() {
	if (typeof Reflect === 'object' && Reflect && Reflect.getPrototypeOf) {
		return Reflect.getPrototypeOf;
	}
	return getProto
		? function getPrototypeOf(O) { return getProto(O); }
		: implementation;
};

},{"./implementation":191,"get-proto":146}],193:[function(require,module,exports){
'use strict';

var GetIntrinsic = require('get-intrinsic');
var $concat = GetIntrinsic('%Array.prototype.concat%');

var callBind = require('call-bind');

var callBound = require('call-bound');
var $slice = callBound('Array.prototype.slice');

var hasSymbols = require('has-symbols/shams')();
var isConcatSpreadable = hasSymbols && Symbol.isConcatSpreadable;

/** @type {never[]} */ var empty = [];
var $concatApply = isConcatSpreadable ? callBind.apply($concat, empty) : null;

// eslint-disable-next-line no-extra-parens
var isArray = isConcatSpreadable ? /** @type {(value: unknown) => value is unknown[]} */ (require('isarray')) : null;

/** @type {import('.')} */
module.exports = isConcatSpreadable
	// eslint-disable-next-line no-unused-vars
	? function safeArrayConcat(item) {
		for (var i = 0; i < arguments.length; i += 1) {
			/** @type {typeof item} */ var arg = arguments[i];
			// @ts-expect-error ts(2538) see https://github.com/microsoft/TypeScript/issues/9998#issuecomment-1890787975; works if `const`
			if (arg && typeof arg === 'object' && typeof arg[isConcatSpreadable] === 'boolean') {
				// @ts-expect-error ts(7015) TS doesn't yet support Symbol indexing
				if (!empty[isConcatSpreadable]) {
					// @ts-expect-error ts(7015) TS doesn't yet support Symbol indexing
					empty[isConcatSpreadable] = true;
				}
				// @ts-expect-error ts(2721) ts(18047) not sure why TS can't figure out this can't be null
				var arr = isArray(arg) ? $slice(arg) : [arg];
				// @ts-expect-error ts(7015) TS can't handle expandos on an array
				arr[isConcatSpreadable] = true; // shadow the property. TODO: use [[Define]]
				arguments[i] = arr;
			}
		}
		// @ts-expect-error ts(2345) https://github.com/microsoft/TypeScript/issues/57164 TS doesn't understand that apply can take an arguments object
		return $concatApply(arguments);
	}
	: callBind($concat, empty);

},{"call-bind":11,"call-bound":12,"get-intrinsic":143,"has-symbols/shams":153,"isarray":194}],194:[function(require,module,exports){
var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};

},{}],195:[function(require,module,exports){
'use strict';

var callBound = require('call-bound');
var isRegex = require('is-regex');

var $exec = callBound('RegExp.prototype.exec');
var $TypeError = require('es-errors/type');

/** @type {import('.')} */
module.exports = function regexTester(regex) {
	if (!isRegex(regex)) {
		throw new $TypeError('`regex` must be a RegExp');
	}
	return function test(s) {
		return $exec(regex, s) !== null;
	};
};

},{"call-bound":12,"es-errors/type":128,"is-regex":167}],196:[function(require,module,exports){
'use strict';

var GetIntrinsic = require('get-intrinsic');
var define = require('define-data-property');
var hasDescriptors = require('has-property-descriptors')();
var gOPD = require('gopd');

var $TypeError = require('es-errors/type');
var $floor = GetIntrinsic('%Math.floor%');

/** @type {import('.')} */
module.exports = function setFunctionLength(fn, length) {
	if (typeof fn !== 'function') {
		throw new $TypeError('`fn` is not a function');
	}
	if (typeof length !== 'number' || length < 0 || length > 0xFFFFFFFF || $floor(length) !== length) {
		throw new $TypeError('`length` must be a positive 32-bit integer');
	}

	var loose = arguments.length > 2 && !!arguments[2];

	var functionLengthIsConfigurable = true;
	var functionLengthIsWritable = true;
	if ('length' in fn && gOPD) {
		var desc = gOPD(fn, 'length');
		if (desc && !desc.configurable) {
			functionLengthIsConfigurable = false;
		}
		if (desc && !desc.writable) {
			functionLengthIsWritable = false;
		}
	}

	if (functionLengthIsConfigurable || functionLengthIsWritable || !loose) {
		if (hasDescriptors) {
			define(/** @type {Parameters<define>[0]} */ (fn), 'length', length, true, true);
		} else {
			define(/** @type {Parameters<define>[0]} */ (fn), 'length', length);
		}
	}
	return fn;
};

},{"define-data-property":13,"es-errors/type":128,"get-intrinsic":143,"gopd":148,"has-property-descriptors":150}],197:[function(require,module,exports){
'use strict';

var inspect = require('object-inspect');

var $TypeError = require('es-errors/type');

/*
* This function traverses the list returning the node corresponding to the given key.
*
* That node is also moved to the head of the list, so that if it's accessed again we don't need to traverse the whole list.
* By doing so, all the recently used nodes can be accessed relatively quickly.
*/
/** @type {import('./list.d.ts').listGetNode} */
// eslint-disable-next-line consistent-return
var listGetNode = function (list, key, isDelete) {
	/** @type {typeof list | NonNullable<(typeof list)['next']>} */
	var prev = list;
	/** @type {(typeof list)['next']} */
	var curr;
	// eslint-disable-next-line eqeqeq
	for (; (curr = prev.next) != null; prev = curr) {
		if (curr.key === key) {
			prev.next = curr.next;
			if (!isDelete) {
				// eslint-disable-next-line no-extra-parens
				curr.next = /** @type {NonNullable<typeof list.next>} */ (list.next);
				list.next = curr; // eslint-disable-line no-param-reassign
			}
			return curr;
		}
	}
};

/** @type {import('./list.d.ts').listGet} */
var listGet = function (objects, key) {
	if (!objects) {
		return void undefined;
	}
	var node = listGetNode(objects, key);
	return node && node.value;
};
/** @type {import('./list.d.ts').listSet} */
var listSet = function (objects, key, value) {
	var node = listGetNode(objects, key);
	if (node) {
		node.value = value;
	} else {
		// Prepend the new node to the beginning of the list
		objects.next = /** @type {import('./list.d.ts').ListNode<typeof value, typeof key>} */ ({ // eslint-disable-line no-param-reassign, no-extra-parens
			key: key,
			next: objects.next,
			value: value
		});
	}
};
/** @type {import('./list.d.ts').listHas} */
var listHas = function (objects, key) {
	if (!objects) {
		return false;
	}
	return !!listGetNode(objects, key);
};
/** @type {import('./list.d.ts').listDelete} */
// eslint-disable-next-line consistent-return
var listDelete = function (objects, key) {
	if (objects) {
		return listGetNode(objects, key, true);
	}
};

/** @type {import('.')} */
module.exports = function getSideChannelList() {
	/** @typedef {ReturnType<typeof getSideChannelList>} Channel */
	/** @typedef {Parameters<Channel['get']>[0]} K */
	/** @typedef {Parameters<Channel['set']>[1]} V */

	/** @type {import('./list.d.ts').RootNode<V, K> | undefined} */ var $o;

	/** @type {Channel} */
	var channel = {
		assert: function (key) {
			if (!channel.has(key)) {
				throw new $TypeError('Side channel does not contain ' + inspect(key));
			}
		},
		'delete': function (key) {
			var root = $o && $o.next;
			var deletedNode = listDelete($o, key);
			if (deletedNode && root && root === deletedNode) {
				$o = void undefined;
			}
			return !!deletedNode;
		},
		get: function (key) {
			return listGet($o, key);
		},
		has: function (key) {
			return listHas($o, key);
		},
		set: function (key, value) {
			if (!$o) {
				// Initialize the linked list as an empty node, so that we don't have to special-case handling of the first node: we can always refer to it as (previous node).next, instead of something like (list).head
				$o = {
					next: void undefined
				};
			}
			// eslint-disable-next-line no-extra-parens
			listSet(/** @type {NonNullable<typeof $o>} */ ($o), key, value);
		}
	};
	// @ts-expect-error TODO: figure out why this is erroring
	return channel;
};

},{"es-errors/type":128,"object-inspect":189}],198:[function(require,module,exports){
'use strict';

var GetIntrinsic = require('get-intrinsic');
var callBound = require('call-bound');
var inspect = require('object-inspect');

var $TypeError = require('es-errors/type');
var $Map = GetIntrinsic('%Map%', true);

/** @type {<K, V>(thisArg: Map<K, V>, key: K) => V} */
var $mapGet = callBound('Map.prototype.get', true);
/** @type {<K, V>(thisArg: Map<K, V>, key: K, value: V) => void} */
var $mapSet = callBound('Map.prototype.set', true);
/** @type {<K, V>(thisArg: Map<K, V>, key: K) => boolean} */
var $mapHas = callBound('Map.prototype.has', true);
/** @type {<K, V>(thisArg: Map<K, V>, key: K) => boolean} */
var $mapDelete = callBound('Map.prototype.delete', true);
/** @type {<K, V>(thisArg: Map<K, V>) => number} */
var $mapSize = callBound('Map.prototype.size', true);

/** @type {import('.')} */
module.exports = !!$Map && /** @type {Exclude<import('.'), false>} */ function getSideChannelMap() {
	/** @typedef {ReturnType<typeof getSideChannelMap>} Channel */
	/** @typedef {Parameters<Channel['get']>[0]} K */
	/** @typedef {Parameters<Channel['set']>[1]} V */

	/** @type {Map<K, V> | undefined} */ var $m;

	/** @type {Channel} */
	var channel = {
		assert: function (key) {
			if (!channel.has(key)) {
				throw new $TypeError('Side channel does not contain ' + inspect(key));
			}
		},
		'delete': function (key) {
			if ($m) {
				var result = $mapDelete($m, key);
				if ($mapSize($m) === 0) {
					$m = void undefined;
				}
				return result;
			}
			return false;
		},
		get: function (key) { // eslint-disable-line consistent-return
			if ($m) {
				return $mapGet($m, key);
			}
		},
		has: function (key) {
			if ($m) {
				return $mapHas($m, key);
			}
			return false;
		},
		set: function (key, value) {
			if (!$m) {
				// @ts-expect-error TS can't handle narrowing a variable inside a closure
				$m = new $Map();
			}
			$mapSet($m, key, value);
		}
	};

	// @ts-expect-error TODO: figure out why TS is erroring here
	return channel;
};

},{"call-bound":12,"es-errors/type":128,"get-intrinsic":143,"object-inspect":189}],199:[function(require,module,exports){
'use strict';

var GetIntrinsic = require('get-intrinsic');
var callBound = require('call-bound');
var inspect = require('object-inspect');
var getSideChannelMap = require('side-channel-map');

var $TypeError = require('es-errors/type');
var $WeakMap = GetIntrinsic('%WeakMap%', true);

/** @type {<K extends object, V>(thisArg: WeakMap<K, V>, key: K) => V} */
var $weakMapGet = callBound('WeakMap.prototype.get', true);
/** @type {<K extends object, V>(thisArg: WeakMap<K, V>, key: K, value: V) => void} */
var $weakMapSet = callBound('WeakMap.prototype.set', true);
/** @type {<K extends object, V>(thisArg: WeakMap<K, V>, key: K) => boolean} */
var $weakMapHas = callBound('WeakMap.prototype.has', true);
/** @type {<K extends object, V>(thisArg: WeakMap<K, V>, key: K) => boolean} */
var $weakMapDelete = callBound('WeakMap.prototype.delete', true);

/** @type {import('.')} */
module.exports = $WeakMap
	? /** @type {Exclude<import('.'), false>} */ function getSideChannelWeakMap() {
		/** @typedef {ReturnType<typeof getSideChannelWeakMap>} Channel */
		/** @typedef {Parameters<Channel['get']>[0]} K */
		/** @typedef {Parameters<Channel['set']>[1]} V */

		/** @type {WeakMap<K & object, V> | undefined} */ var $wm;
		/** @type {Channel | undefined} */ var $m;

		/** @type {Channel} */
		var channel = {
			assert: function (key) {
				if (!channel.has(key)) {
					throw new $TypeError('Side channel does not contain ' + inspect(key));
				}
			},
			'delete': function (key) {
				if ($WeakMap && key && (typeof key === 'object' || typeof key === 'function')) {
					if ($wm) {
						return $weakMapDelete($wm, key);
					}
				} else if (getSideChannelMap) {
					if ($m) {
						return $m['delete'](key);
					}
				}
				return false;
			},
			get: function (key) {
				if ($WeakMap && key && (typeof key === 'object' || typeof key === 'function')) {
					if ($wm) {
						return $weakMapGet($wm, key);
					}
				}
				return $m && $m.get(key);
			},
			has: function (key) {
				if ($WeakMap && key && (typeof key === 'object' || typeof key === 'function')) {
					if ($wm) {
						return $weakMapHas($wm, key);
					}
				}
				return !!$m && $m.has(key);
			},
			set: function (key, value) {
				if ($WeakMap && key && (typeof key === 'object' || typeof key === 'function')) {
					if (!$wm) {
						$wm = new $WeakMap();
					}
					$weakMapSet($wm, key, value);
				} else if (getSideChannelMap) {
					if (!$m) {
						$m = getSideChannelMap();
					}
					// eslint-disable-next-line no-extra-parens
					/** @type {NonNullable<typeof $m>} */ ($m).set(key, value);
				}
			}
		};

		// @ts-expect-error TODO: figure out why this is erroring
		return channel;
	}
	: getSideChannelMap;

},{"call-bound":12,"es-errors/type":128,"get-intrinsic":143,"object-inspect":189,"side-channel-map":198}],200:[function(require,module,exports){
'use strict';

var $TypeError = require('es-errors/type');
var inspect = require('object-inspect');
var getSideChannelList = require('side-channel-list');
var getSideChannelMap = require('side-channel-map');
var getSideChannelWeakMap = require('side-channel-weakmap');

var makeChannel = getSideChannelWeakMap || getSideChannelMap || getSideChannelList;

/** @type {import('.')} */
module.exports = function getSideChannel() {
	/** @typedef {ReturnType<typeof getSideChannel>} Channel */

	/** @type {Channel | undefined} */ var $channelData;

	/** @type {Channel} */
	var channel = {
		assert: function (key) {
			if (!channel.has(key)) {
				throw new $TypeError('Side channel does not contain ' + inspect(key));
			}
		},
		'delete': function (key) {
			return !!$channelData && $channelData['delete'](key);
		},
		get: function (key) {
			return $channelData && $channelData.get(key);
		},
		has: function (key) {
			return !!$channelData && $channelData.has(key);
		},
		set: function (key, value) {
			if (!$channelData) {
				$channelData = makeChannel();
			}

			$channelData.set(key, value);
		}
	};
	// @ts-expect-error TODO: figure out why this is erroring
	return channel;
};

},{"es-errors/type":128,"object-inspect":189,"side-channel-list":197,"side-channel-map":198,"side-channel-weakmap":199}],201:[function(require,module,exports){
'use strict';

var RequireObjectCoercible = require('es-object-atoms/RequireObjectCoercible');
var ToString = require('es-abstract/2024/ToString');
var callBound = require('call-bound');
var $replace = callBound('String.prototype.replace');

var mvsIsWS = (/^\s$/).test('\u180E');
/* eslint-disable no-control-regex */
var leftWhitespace = mvsIsWS
	? /^[\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF]+/
	: /^[\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF]+/;
var rightWhitespace = mvsIsWS
	? /[\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF]+$/
	: /[\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF]+$/;
/* eslint-enable no-control-regex */

module.exports = function trim() {
	var S = ToString(RequireObjectCoercible(this));
	return $replace($replace(S, leftWhitespace, ''), rightWhitespace, '');
};

},{"call-bound":12,"es-abstract/2024/ToString":49,"es-object-atoms/RequireObjectCoercible":130}],202:[function(require,module,exports){
'use strict';

var callBind = require('call-bind');
var define = require('define-properties');
var RequireObjectCoercible = require('es-object-atoms/RequireObjectCoercible');

var implementation = require('./implementation');
var getPolyfill = require('./polyfill');
var shim = require('./shim');

var bound = callBind(getPolyfill());
var boundMethod = function trim(receiver) {
	RequireObjectCoercible(receiver);
	return bound(receiver);
};

define(boundMethod, {
	getPolyfill: getPolyfill,
	implementation: implementation,
	shim: shim
});

module.exports = boundMethod;

},{"./implementation":201,"./polyfill":203,"./shim":204,"call-bind":11,"define-properties":14,"es-object-atoms/RequireObjectCoercible":130}],203:[function(require,module,exports){
'use strict';

var implementation = require('./implementation');

var zeroWidthSpace = '\u200b';
var mongolianVowelSeparator = '\u180E';

module.exports = function getPolyfill() {
	if (
		String.prototype.trim
		&& zeroWidthSpace.trim() === zeroWidthSpace
		&& mongolianVowelSeparator.trim() === mongolianVowelSeparator
		&& ('_' + mongolianVowelSeparator).trim() === ('_' + mongolianVowelSeparator)
		&& (mongolianVowelSeparator + '_').trim() === (mongolianVowelSeparator + '_')
	) {
		return String.prototype.trim;
	}
	return implementation;
};

},{"./implementation":201}],204:[function(require,module,exports){
'use strict';

var supportsDescriptors = require('has-property-descriptors')();
var defineDataProperty = require('define-data-property');

var getPolyfill = require('./polyfill');

module.exports = function shimStringTrim() {
	var polyfill = getPolyfill();

	if (String.prototype.trim !== polyfill) {
		if (supportsDescriptors) {
			defineDataProperty(String.prototype, 'trim', polyfill, true);
		} else {
			defineDataProperty(String.prototype, 'trim', polyfill);
		}
	}

	return polyfill;
};

},{"./polyfill":203,"define-data-property":13,"has-property-descriptors":150}],205:[function(require,module,exports){
'use strict';

var $TypeError = require('es-errors/type');

var callBound = require('call-bound');

/** @type {undefined | ((thisArg: import('.').TypedArray) => Buffer<ArrayBufferLike>)} */
var $typedArrayBuffer = callBound('TypedArray.prototype.buffer', true);

var isTypedArray = require('is-typed-array');

/** @type {import('.')} */
// node <= 0.10, < 0.11.4 has a nonconfigurable own property instead of a prototype getter
module.exports = $typedArrayBuffer || function typedArrayBuffer(x) {
	if (!isTypedArray(x)) {
		throw new $TypeError('Not a Typed Array');
	}
	return x.buffer;
};

},{"call-bound":12,"es-errors/type":128,"is-typed-array":172}],206:[function(require,module,exports){
(function (global){(function (){
'use strict';

var forEach = require('for-each');
var callBind = require('call-bind');
var gPO = require('reflect.getprototypeof/polyfill')();

var typedArrays = require('available-typed-arrays')();

/** @typedef {(x: import('.').TypedArray) => number} ByteOffsetGetter */

/** @type {Record<import('.').TypedArrayName, ByteOffsetGetter>} */
var getters = {
	// @ts-expect-error TS can't handle __proto__ or `satisfies` in jsdoc
	__proto__: null
};

var gOPD = require('gopd');
var oDP = Object.defineProperty;
if (gOPD) {
	/** @type {ByteOffsetGetter} */
	var getByteOffset = function (x) {
		return x.byteOffset;
	};
	forEach(typedArrays, function (typedArray) {
		// In Safari 7, Typed Array constructors are typeof object
		if (typeof global[typedArray] === 'function' || typeof global[typedArray] === 'object') {
			var Proto = global[typedArray].prototype;
			// @ts-expect-error TS can't guarantee the callback is invoked sync
			var descriptor = gOPD(Proto, 'byteOffset');
			if (!descriptor) {
				var superProto = gPO(Proto);
				// @ts-expect-error TS can't guarantee the callback is invoked sync
				descriptor = gOPD(superProto, 'byteOffset');
			}
			// Opera 12.16 has a magic byteOffset data property on instances AND on Proto
			if (descriptor && descriptor.get) {
				getters[typedArray] = callBind(descriptor.get);
			} else if (oDP) {
				// this is likely an engine where instances have a magic byteOffset data property
				var arr = new global[typedArray](2);
				// @ts-expect-error TS can't guarantee the callback is invoked sync
				descriptor = gOPD(arr, 'byteOffset');
				if (descriptor && descriptor.configurable) {
					// oDP(arr, 'length', { value: 3 });
				}
				if (arr.length === 2) {
					getters[typedArray] = getByteOffset;
				}
			}
		}
	});
}

/** @type {ByteOffsetGetter} */
var tryTypedArrays = function tryAllTypedArrays(value) {
	/** @type {number} */ var foundOffset;
	forEach(getters, /** @type {(getter: ByteOffsetGetter) => void} */ function (getter) {
		if (typeof foundOffset !== 'number') {
			try {
				var offset = getter(value);
				if (typeof offset === 'number') {
					foundOffset = offset;
				}
			} catch (e) {}
		}
	});
	// @ts-expect-error TS can't guarantee the callback is invoked sync
	return foundOffset;
};

var isTypedArray = require('is-typed-array');

/** @type {import('.')} */
module.exports = function typedArrayByteOffset(value) {
	if (!isTypedArray(value)) {
		return false;
	}
	return tryTypedArrays(value);
};

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"available-typed-arrays":3,"call-bind":11,"for-each":135,"gopd":148,"is-typed-array":172,"reflect.getprototypeof/polyfill":192}],207:[function(require,module,exports){
(function (global){(function (){
'use strict';

// / <reference types="node" />

var callBind = require('call-bind');
var forEach = require('for-each');
var gOPD = require('gopd');
var isTypedArray = require('is-typed-array');
var typedArrays = require('possible-typed-array-names');
var gPO = require('reflect.getprototypeof/polyfill')();

/** @typedef {(value: import('.').TypedArray) => number} TypedArrayLengthGetter */
/** @typedef {{ [k in `$${import('.').TypedArrayName}` | '__proto__']: k extends '__proto__' ? null : TypedArrayLengthGetter }} Cache */

/** @type {Cache} */
// @ts-expect-error TS doesn't seem to have a "will eventually satisfy" type
var getters = { __proto__: null };
var oDP = Object.defineProperty;
if (gOPD) {
	var getLength = /** @type {TypedArrayLengthGetter} */ function (x) {
		return x.length;
	};
	forEach(typedArrays, /** @type {(typedArray: import('.').TypedArrayName) => void} */ function (typedArray) {
		var TA = global[typedArray];
		// In Safari 7, Typed Array constructors are typeof object
		if (typeof TA === 'function' || typeof TA === 'object') {
			var Proto = TA.prototype;
			// @ts-expect-error TS doesn't narrow types inside callbacks, which is weird
			var descriptor = gOPD(Proto, 'length');
			if (!descriptor) {
				var superProto = gPO(Proto);
				// @ts-expect-error TS doesn't narrow types inside callbacks, which is weird
				descriptor = gOPD(superProto, 'length');
			}
			// Opera 12.16 has a magic length data property on instances AND on Proto
			if (descriptor && descriptor.get) {
				// eslint-disable-next-line no-extra-parens
				getters[/** @type {`$${import('.').TypedArrayName}`} */ ('$' + typedArray)] = callBind(descriptor.get);
			} else if (oDP) {
				// this is likely an engine where instances have a magic length data property
				var arr = new global[typedArray](2);
				// @ts-expect-error TS doesn't narrow types inside callbacks, which is weird
				descriptor = gOPD(arr, 'length');
				if (descriptor && descriptor.configurable) {
					// oDP(arr, 'length', { value: 3 });
				}
				if (arr.length === 2) {
				// eslint-disable-next-line no-extra-parens
					getters[/** @type {`$${import('.').TypedArrayName}`} */ ('$' + typedArray)] = getLength;
				}
			}
		}
	});
}

/** @type {TypedArrayLengthGetter} */
var tryTypedArrays = function tryAllTypedArrays(value) {
	/** @type {number} */ var foundLength;
	// @ts-expect-error not sure why this won't work
	forEach(getters, /** @type {(getter: TypedArrayLengthGetter) => void} */ function (getter) {
		if (typeof foundLength !== 'number') {
			try {
				var length = getter(value);
				if (typeof length === 'number') {
					foundLength = length;
				}
			} catch (e) {}
		}
	});
	// @ts-expect-error TS can't guarantee the above callback is invoked sync
	return foundLength;
};

/** @type {import('.')} */
module.exports = function typedArrayLength(value) {
	if (!isTypedArray(value)) {
		return false;
	}
	return tryTypedArrays(value);
};

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"call-bind":11,"for-each":135,"gopd":148,"is-typed-array":172,"possible-typed-array-names":190,"reflect.getprototypeof/polyfill":192}],208:[function(require,module,exports){
'use strict';

var isString = require('is-string');
var isNumber = require('is-number-object');
var isBoolean = require('is-boolean-object');
var isSymbol = require('is-symbol');
var isBigInt = require('is-bigint');

/** @type {import('.')} */
// eslint-disable-next-line consistent-return
module.exports = function whichBoxedPrimitive(value) {
	// eslint-disable-next-line eqeqeq
	if (value == null || (typeof value !== 'object' && typeof value !== 'function')) {
		return null;
	}
	if (isString(value)) {
		return 'String';
	}
	if (isNumber(value)) {
		return 'Number';
	}
	if (isBoolean(value)) {
		return 'Boolean';
	}
	if (isSymbol(value)) {
		return 'Symbol';
	}
	if (isBigInt(value)) {
		return 'BigInt';
	}
};

},{"is-bigint":159,"is-boolean-object":160,"is-number-object":166,"is-string":170,"is-symbol":171}],209:[function(require,module,exports){
'use strict';

var whichBoxedPrimitive = require('which-boxed-primitive');
var whichCollection = require('which-collection');
var whichTypedArray = require('which-typed-array');
var isArray = require('isarray');
var isDate = require('is-date-object');
var isRegex = require('is-regex');
var isWeakRef = require('is-weakref');
var isFinalizationRegistry = require('is-finalizationregistry');
var name = require('function.prototype.name');
var isGeneratorFunction = require('is-generator-function');
var isAsyncFunction = require('is-async-function');
var callBound = require('call-bound');
var hasToStringTag = require('has-tostringtag/shams')();
var toStringTag = hasToStringTag && Symbol.toStringTag;

var $Object = Object;

/** @type {undefined | ((value: ThisParameterType<typeof Promise.prototype.then>, ...args: Parameters<typeof Promise.prototype.then>) => ReturnType<typeof Promise.prototype.then>)} */
var promiseThen = callBound('Promise.prototype.then', true);
/** @type {<T = unknown>(value: unknown) => value is Promise<T>} */
var isPromise = function isPromise(value) {
	if (!value || typeof value !== 'object' || !promiseThen) {
		return false;
	}
	try {
		promiseThen(value, null, function () {});
		return true;
	} catch (e) {}
	return false;
};

/** @type {(builtinName: unknown) => boolean} */
var isKnownBuiltin = function isKnownBuiltin(builtinName) {
	return !!builtinName
		// primitives
		&& builtinName !== 'BigInt'
		&& builtinName !== 'Boolean'
		&& builtinName !== 'Null'
		&& builtinName !== 'Number'
		&& builtinName !== 'String'
		&& builtinName !== 'Symbol'
		&& builtinName !== 'Undefined'
		// namespaces
		&& builtinName !== 'Math'
		&& builtinName !== 'JSON'
		&& builtinName !== 'Reflect'
		&& builtinName !== 'Atomics'
		// collections
		&& builtinName !== 'Map'
		&& builtinName !== 'Set'
		&& builtinName !== 'WeakMap'
		&& builtinName !== 'WeakSet'
		// typed arrays
		&& builtinName !== 'BigInt64Array'
		&& builtinName !== 'BigUint64Array'
		&& builtinName !== 'Float32Array'
		&& builtinName !== 'Float64Array'
		&& builtinName !== 'Int16Array'
		&& builtinName !== 'Int32Array'
		&& builtinName !== 'Int8Array'
		&& builtinName !== 'Uint16Array'
		&& builtinName !== 'Uint32Array'
		&& builtinName !== 'Uint8Array'
		&& builtinName !== 'Uint8ClampedArray'
		// checked explicitly
		&& builtinName !== 'Array'
		&& builtinName !== 'Date'
		&& builtinName !== 'FinalizationRegistry'
		&& builtinName !== 'Promise'
		&& builtinName !== 'RegExp'
		&& builtinName !== 'WeakRef'
		// functions
		&& builtinName !== 'Function'
		&& builtinName !== 'GeneratorFunction'
		&& builtinName !== 'AsyncFunction';
};

/** @type {import('.')} */
module.exports = function whichBuiltinType(value) {
	if (value == null) {
		return value;
	}
	// covers: primitives, {,Weak}Map/Set, typed arrays
	var which = whichBoxedPrimitive($Object(value)) || whichCollection(value) || whichTypedArray(value);
	if (which) {
		return which;
	}
	if (isArray(value)) {
		return 'Array';
	}
	if (isDate(value)) {
		return 'Date';
	}
	if (isRegex(value)) {
		return 'RegExp';
	}
	if (isWeakRef(value)) {
		return 'WeakRef';
	}
	if (isFinalizationRegistry(value)) {
		return 'FinalizationRegistry';
	}
	if (typeof value === 'function') {
		if (isGeneratorFunction(value)) {
			return 'GeneratorFunction';
		}
		if (isAsyncFunction(value)) {
			return 'AsyncFunction';
		}
		return 'Function';
	}
	if (isPromise(value)) {
		return 'Promise';
	}
	// @ts-expect-error TS can't figure out that `value` is an `object` after the `which` check above
	if (toStringTag && toStringTag in value) {
		var tag = value[toStringTag];
		if (isKnownBuiltin(tag)) {
			return tag;
		}
	}
	if (typeof value.constructor === 'function') {
		// eslint-disable-next-line no-extra-parens
		var constructorName = name(/** @type {Parameters<name>[0]} */ (value.constructor));
		if (isKnownBuiltin(constructorName)) {
			return constructorName;
		}
	}
	return 'Object';
};

},{"call-bound":12,"function.prototype.name":139,"has-tostringtag/shams":154,"is-async-function":158,"is-date-object":162,"is-finalizationregistry":163,"is-generator-function":164,"is-regex":167,"is-weakref":174,"isarray":210,"which-boxed-primitive":208,"which-collection":211,"which-typed-array":212}],210:[function(require,module,exports){
arguments[4][194][0].apply(exports,arguments)
},{"dup":194}],211:[function(require,module,exports){
'use strict';

var isMap = require('is-map');
var isSet = require('is-set');
var isWeakMap = require('is-weakmap');
var isWeakSet = require('is-weakset');

/** @type {import('.')} */
module.exports = function whichCollection(/** @type {unknown} */ value) {
	if (value && typeof value === 'object') {
		if (isMap(value)) {
			return 'Map';
		}
		if (isSet(value)) {
			return 'Set';
		}
		if (isWeakMap(value)) {
			return 'WeakMap';
		}
		if (isWeakSet(value)) {
			return 'WeakSet';
		}
	}
	return false;
};

},{"is-map":165,"is-set":168,"is-weakmap":173,"is-weakset":175}],212:[function(require,module,exports){
(function (global){(function (){
'use strict';

var forEach = require('for-each');
var availableTypedArrays = require('available-typed-arrays');
var callBind = require('call-bind');
var callBound = require('call-bound');
var gOPD = require('gopd');
var getProto = require('get-proto');

var $toString = callBound('Object.prototype.toString');
var hasToStringTag = require('has-tostringtag/shams')();

var g = typeof globalThis === 'undefined' ? global : globalThis;
var typedArrays = availableTypedArrays();

var $slice = callBound('String.prototype.slice');

/** @type {<T = unknown>(array: readonly T[], value: unknown) => number} */
var $indexOf = callBound('Array.prototype.indexOf', true) || function indexOf(array, value) {
	for (var i = 0; i < array.length; i += 1) {
		if (array[i] === value) {
			return i;
		}
	}
	return -1;
};

/** @typedef {import('./types').Getter} Getter */
/** @type {import('./types').Cache} */
var cache = { __proto__: null };
if (hasToStringTag && gOPD && getProto) {
	forEach(typedArrays, function (typedArray) {
		var arr = new g[typedArray]();
		if (Symbol.toStringTag in arr && getProto) {
			var proto = getProto(arr);
			// @ts-expect-error TS won't narrow inside a closure
			var descriptor = gOPD(proto, Symbol.toStringTag);
			if (!descriptor && proto) {
				var superProto = getProto(proto);
				// @ts-expect-error TS won't narrow inside a closure
				descriptor = gOPD(superProto, Symbol.toStringTag);
			}
			// @ts-expect-error TODO: fix
			if (descriptor) cache['$' + typedArray] = callBind(descriptor.get);
		}
	});
} else {
	forEach(typedArrays, function (typedArray) {
		var arr = new g[typedArray]();
		var fn = arr.slice || arr.set;
		if (fn) {
			cache[
				/** @type {`$${import('.').TypedArrayName}`} */ ('$' + typedArray)
			] = /** @type {import('./types').BoundSlice | import('./types').BoundSet} */ (
				// @ts-expect-error TODO FIXME
				callBind(fn)
			);
		}
	});
}

/** @type {(value: object) => false | import('.').TypedArrayName} */
var tryTypedArrays = function tryAllTypedArrays(value) {
	/** @type {ReturnType<typeof tryAllTypedArrays>} */ var found = false;
	forEach(
		/** @type {Record<`\$${import('.').TypedArrayName}`, Getter>} */ (cache),
		/** @type {(getter: Getter, name: `\$${import('.').TypedArrayName}`) => void} */
		function (getter, typedArray) {
			if (!found) {
				try {
					// @ts-expect-error a throw is fine here
					if ('$' + getter(value) === typedArray) {
						found = /** @type {import('.').TypedArrayName} */ ($slice(typedArray, 1));
					}
				} catch (e) { /**/ }
			}
		}
	);
	return found;
};

/** @type {(value: object) => false | import('.').TypedArrayName} */
var trySlices = function tryAllSlices(value) {
	/** @type {ReturnType<typeof tryAllSlices>} */ var found = false;
	forEach(
		/** @type {Record<`\$${import('.').TypedArrayName}`, Getter>} */(cache),
		/** @type {(getter: Getter, name: `\$${import('.').TypedArrayName}`) => void} */ function (getter, name) {
			if (!found) {
				try {
					// @ts-expect-error a throw is fine here
					getter(value);
					found = /** @type {import('.').TypedArrayName} */ ($slice(name, 1));
				} catch (e) { /**/ }
			}
		}
	);
	return found;
};

/** @type {import('.')} */
module.exports = function whichTypedArray(value) {
	if (!value || typeof value !== 'object') { return false; }
	if (!hasToStringTag) {
		/** @type {string} */
		var tag = $slice($toString(value), 8, -1);
		if ($indexOf(typedArrays, tag) > -1) {
			return tag;
		}
		if (tag !== 'Object') {
			return false;
		}
		// node < 0.6 hits here on real Typed Arrays
		return trySlices(value);
	}
	if (!gOPD) { return null; } // unknown engine
	return tryTypedArrays(value);
};

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"available-typed-arrays":3,"call-bind":11,"call-bound":12,"for-each":135,"get-proto":146,"gopd":148,"has-tostringtag/shams":154}],213:[function(require,module,exports){

self._ArrayBufferBase64Utils = {
  uint8ArrayPrototype: {
	  setFromBase64: require("es-arraybuffer-base64/Uint8Array.prototype.setFromBase64"),
	  setFromHex: require("es-arraybuffer-base64/Uint8Array.prototype.setFromHex"),
	  toBase64: require("es-arraybuffer-base64/Uint8Array.prototype.toBase64"),
	  toHex: require("es-arraybuffer-base64/Uint8Array.prototype.toHex")
	},
	uint8Array: {
	  fromBase64: require("es-arraybuffer-base64/Uint8Array.fromBase64"),
	  fromHex: require("es-arraybuffer-base64/Uint8Array.fromHex")
	}
}

},{"es-arraybuffer-base64/Uint8Array.fromBase64":85,"es-arraybuffer-base64/Uint8Array.fromHex":89,"es-arraybuffer-base64/Uint8Array.prototype.setFromBase64":93,"es-arraybuffer-base64/Uint8Array.prototype.setFromHex":97,"es-arraybuffer-base64/Uint8Array.prototype.toBase64":101,"es-arraybuffer-base64/Uint8Array.prototype.toHex":105}]},{},[213]);


var ArrayBufferBase64Utils = self._ArrayBufferBase64Utils;
delete self._ArrayBufferBase64Utils;
