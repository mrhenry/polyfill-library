(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
//
// Main
//
Object.defineProperty(exports, "__esModule", { value: true });
exports.strategies = void 0;
exports.memoize = memoize;
function memoize(fn, options) {
    var cache = options && options.cache ? options.cache : cacheDefault;
    var serializer = options && options.serializer ? options.serializer : serializerDefault;
    var strategy = options && options.strategy ? options.strategy : strategyDefault;
    return strategy(fn, {
        cache: cache,
        serializer: serializer,
    });
}
//
// Strategy
//
function isPrimitive(value) {
    return (value == null || typeof value === 'number' || typeof value === 'boolean'); // || typeof value === "string" 'unsafe' primitive for our needs
}
function monadic(fn, cache, serializer, arg) {
    var cacheKey = isPrimitive(arg) ? arg : serializer(arg);
    var computedValue = cache.get(cacheKey);
    if (typeof computedValue === 'undefined') {
        computedValue = fn.call(this, arg);
        cache.set(cacheKey, computedValue);
    }
    return computedValue;
}
function variadic(fn, cache, serializer) {
    var args = Array.prototype.slice.call(arguments, 3);
    var cacheKey = serializer(args);
    var computedValue = cache.get(cacheKey);
    if (typeof computedValue === 'undefined') {
        computedValue = fn.apply(this, args);
        cache.set(cacheKey, computedValue);
    }
    return computedValue;
}
function assemble(fn, context, strategy, cache, serialize) {
    return strategy.bind(context, fn, cache, serialize);
}
function strategyDefault(fn, options) {
    var strategy = fn.length === 1 ? monadic : variadic;
    return assemble(fn, this, strategy, options.cache.create(), options.serializer);
}
function strategyVariadic(fn, options) {
    return assemble(fn, this, variadic, options.cache.create(), options.serializer);
}
function strategyMonadic(fn, options) {
    return assemble(fn, this, monadic, options.cache.create(), options.serializer);
}
//
// Serializer
//
var serializerDefault = function () {
    return JSON.stringify(arguments);
};
//
// Cache
//
function ObjectWithoutPrototypeCache() {
    this.cache = Object.create(null);
}
ObjectWithoutPrototypeCache.prototype.get = function (key) {
    return this.cache[key];
};
ObjectWithoutPrototypeCache.prototype.set = function (key, value) {
    this.cache[key] = value;
};
var cacheDefault = {
    create: function create() {
        // @ts-ignore
        return new ObjectWithoutPrototypeCache();
    },
};
exports.strategies = {
    variadic: strategyVariadic,
    monadic: strategyMonadic,
};

},{}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
tslib_1.__exportStar(require("./src/core"), exports);

},{"./src/core":70,"tslib":74}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToString = ToString;
exports.ToNumber = ToNumber;
exports.TimeClip = TimeClip;
exports.ToObject = ToObject;
exports.SameValue = SameValue;
exports.ArrayCreate = ArrayCreate;
exports.HasOwnProperty = HasOwnProperty;
exports.Type = Type;
exports.Day = Day;
exports.WeekDay = WeekDay;
exports.DayFromYear = DayFromYear;
exports.TimeFromYear = TimeFromYear;
exports.YearFromTime = YearFromTime;
exports.DaysInYear = DaysInYear;
exports.DayWithinYear = DayWithinYear;
exports.InLeapYear = InLeapYear;
exports.MonthFromTime = MonthFromTime;
exports.DateFromTime = DateFromTime;
exports.HourFromTime = HourFromTime;
exports.MinFromTime = MinFromTime;
exports.SecFromTime = SecFromTime;
exports.OrdinaryHasInstance = OrdinaryHasInstance;
exports.msFromTime = msFromTime;
/**
 * https://tc39.es/ecma262/#sec-tostring
 */
function ToString(o) {
    // Only symbol is irregular...
    if (typeof o === 'symbol') {
        throw TypeError('Cannot convert a Symbol value to a string');
    }
    return String(o);
}
/**
 * https://tc39.es/ecma262/#sec-tonumber
 * @param val
 */
function ToNumber(val) {
    if (val === undefined) {
        return NaN;
    }
    if (val === null) {
        return +0;
    }
    if (typeof val === 'boolean') {
        return val ? 1 : +0;
    }
    if (typeof val === 'number') {
        return val;
    }
    if (typeof val === 'symbol' || typeof val === 'bigint') {
        throw new TypeError('Cannot convert symbol/bigint to number');
    }
    return Number(val);
}
/**
 * https://tc39.es/ecma262/#sec-tointeger
 * @param n
 */
function ToInteger(n) {
    var number = ToNumber(n);
    if (isNaN(number) || SameValue(number, -0)) {
        return 0;
    }
    if (isFinite(number)) {
        return number;
    }
    var integer = Math.floor(Math.abs(number));
    if (number < 0) {
        integer = -integer;
    }
    if (SameValue(integer, -0)) {
        return 0;
    }
    return integer;
}
/**
 * https://tc39.es/ecma262/#sec-timeclip
 * @param time
 */
function TimeClip(time) {
    if (!isFinite(time)) {
        return NaN;
    }
    if (Math.abs(time) > 8.64 * 1e15) {
        return NaN;
    }
    return ToInteger(time);
}
/**
 * https://tc39.es/ecma262/#sec-toobject
 * @param arg
 */
function ToObject(arg) {
    if (arg == null) {
        throw new TypeError('undefined/null cannot be converted to object');
    }
    return Object(arg);
}
/**
 * https://www.ecma-international.org/ecma-262/11.0/index.html#sec-samevalue
 * @param x
 * @param y
 */
function SameValue(x, y) {
    if (Object.is) {
        return Object.is(x, y);
    }
    // SameValue algorithm
    if (x === y) {
        // Steps 1-5, 7-10
        // Steps 6.b-6.e: +0 != -0
        return x !== 0 || 1 / x === 1 / y;
    }
    // Step 6.a: NaN == NaN
    return x !== x && y !== y;
}
/**
 * https://www.ecma-international.org/ecma-262/11.0/index.html#sec-arraycreate
 * @param len
 */
function ArrayCreate(len) {
    return new Array(len);
}
/**
 * https://www.ecma-international.org/ecma-262/11.0/index.html#sec-hasownproperty
 * @param o
 * @param prop
 */
function HasOwnProperty(o, prop) {
    return Object.prototype.hasOwnProperty.call(o, prop);
}
/**
 * https://www.ecma-international.org/ecma-262/11.0/index.html#sec-type
 * @param x
 */
function Type(x) {
    if (x === null) {
        return 'Null';
    }
    if (typeof x === 'undefined') {
        return 'Undefined';
    }
    if (typeof x === 'function' || typeof x === 'object') {
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
    if (typeof x === 'symbol') {
        return 'Symbol';
    }
    if (typeof x === 'bigint') {
        return 'BigInt';
    }
}
var MS_PER_DAY = 86400000;
/**
 * https://www.ecma-international.org/ecma-262/11.0/index.html#eqn-modulo
 * @param x
 * @param y
 * @return k of the same sign as y
 */
function mod(x, y) {
    return x - Math.floor(x / y) * y;
}
/**
 * https://tc39.es/ecma262/#eqn-Day
 * @param t
 */
function Day(t) {
    return Math.floor(t / MS_PER_DAY);
}
/**
 * https://tc39.es/ecma262/#sec-week-day
 * @param t
 */
function WeekDay(t) {
    return mod(Day(t) + 4, 7);
}
/**
 * https://tc39.es/ecma262/#sec-year-number
 * @param y
 */
function DayFromYear(y) {
    return Date.UTC(y, 0) / MS_PER_DAY;
}
/**
 * https://tc39.es/ecma262/#sec-year-number
 * @param y
 */
function TimeFromYear(y) {
    return Date.UTC(y, 0);
}
/**
 * https://tc39.es/ecma262/#sec-year-number
 * @param t
 */
function YearFromTime(t) {
    return new Date(t).getUTCFullYear();
}
function DaysInYear(y) {
    if (y % 4 !== 0) {
        return 365;
    }
    if (y % 100 !== 0) {
        return 366;
    }
    if (y % 400 !== 0) {
        return 365;
    }
    return 366;
}
function DayWithinYear(t) {
    return Day(t) - DayFromYear(YearFromTime(t));
}
function InLeapYear(t) {
    return DaysInYear(YearFromTime(t)) === 365 ? 0 : 1;
}
/**
 * https://tc39.es/ecma262/#sec-month-number
 * @param t
 */
function MonthFromTime(t) {
    var dwy = DayWithinYear(t);
    var leap = InLeapYear(t);
    if (dwy >= 0 && dwy < 31) {
        return 0;
    }
    if (dwy < 59 + leap) {
        return 1;
    }
    if (dwy < 90 + leap) {
        return 2;
    }
    if (dwy < 120 + leap) {
        return 3;
    }
    if (dwy < 151 + leap) {
        return 4;
    }
    if (dwy < 181 + leap) {
        return 5;
    }
    if (dwy < 212 + leap) {
        return 6;
    }
    if (dwy < 243 + leap) {
        return 7;
    }
    if (dwy < 273 + leap) {
        return 8;
    }
    if (dwy < 304 + leap) {
        return 9;
    }
    if (dwy < 334 + leap) {
        return 10;
    }
    if (dwy < 365 + leap) {
        return 11;
    }
    throw new Error('Invalid time');
}
function DateFromTime(t) {
    var dwy = DayWithinYear(t);
    var mft = MonthFromTime(t);
    var leap = InLeapYear(t);
    if (mft === 0) {
        return dwy + 1;
    }
    if (mft === 1) {
        return dwy - 30;
    }
    if (mft === 2) {
        return dwy - 58 - leap;
    }
    if (mft === 3) {
        return dwy - 89 - leap;
    }
    if (mft === 4) {
        return dwy - 119 - leap;
    }
    if (mft === 5) {
        return dwy - 150 - leap;
    }
    if (mft === 6) {
        return dwy - 180 - leap;
    }
    if (mft === 7) {
        return dwy - 211 - leap;
    }
    if (mft === 8) {
        return dwy - 242 - leap;
    }
    if (mft === 9) {
        return dwy - 272 - leap;
    }
    if (mft === 10) {
        return dwy - 303 - leap;
    }
    if (mft === 11) {
        return dwy - 333 - leap;
    }
    throw new Error('Invalid time');
}
var HOURS_PER_DAY = 24;
var MINUTES_PER_HOUR = 60;
var SECONDS_PER_MINUTE = 60;
var MS_PER_SECOND = 1e3;
var MS_PER_MINUTE = MS_PER_SECOND * SECONDS_PER_MINUTE;
var MS_PER_HOUR = MS_PER_MINUTE * MINUTES_PER_HOUR;
function HourFromTime(t) {
    return mod(Math.floor(t / MS_PER_HOUR), HOURS_PER_DAY);
}
function MinFromTime(t) {
    return mod(Math.floor(t / MS_PER_MINUTE), MINUTES_PER_HOUR);
}
function SecFromTime(t) {
    return mod(Math.floor(t / MS_PER_SECOND), SECONDS_PER_MINUTE);
}
function IsCallable(fn) {
    return typeof fn === 'function';
}
/**
 * The abstract operation OrdinaryHasInstance implements
 * the default algorithm for determining if an object O
 * inherits from the instance object inheritance path
 * provided by constructor C.
 * @param C class
 * @param O object
 * @param internalSlots internalSlots
 */
function OrdinaryHasInstance(C, O, internalSlots) {
    if (!IsCallable(C)) {
        return false;
    }
    if (internalSlots === null || internalSlots === void 0 ? void 0 : internalSlots.boundTargetFunction) {
        var BC = internalSlots === null || internalSlots === void 0 ? void 0 : internalSlots.boundTargetFunction;
        return O instanceof BC;
    }
    if (typeof O !== 'object') {
        return false;
    }
    var P = C.prototype;
    if (typeof P !== 'object') {
        throw new TypeError('OrdinaryHasInstance called on an object with an invalid prototype property.');
    }
    return Object.prototype.isPrototypeOf.call(P, O);
}
function msFromTime(t) {
    return mod(t, MS_PER_SECOND);
}

},{}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanonicalizeLocaleList = CanonicalizeLocaleList;
/**
 * http://ecma-international.org/ecma-402/7.0/index.html#sec-canonicalizelocalelist
 * @param locales
 */
function CanonicalizeLocaleList(locales) {
    // TODO
    return Intl.getCanonicalLocales(locales);
}

},{}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanonicalizeTimeZoneName = CanonicalizeTimeZoneName;
/**
 * https://tc39.es/ecma402/#sec-canonicalizetimezonename
 * @param tz
 */
function CanonicalizeTimeZoneName(tz, _a) {
    var zoneNames = _a.zoneNames, uppercaseLinks = _a.uppercaseLinks;
    var uppercasedTz = tz.toUpperCase();
    var uppercasedZones = zoneNames.reduce(function (all, z) {
        all[z.toUpperCase()] = z;
        return all;
    }, {});
    var ianaTimeZone = uppercaseLinks[uppercasedTz] || uppercasedZones[uppercasedTz];
    if (ianaTimeZone === 'Etc/UTC' || ianaTimeZone === 'Etc/GMT') {
        return 'UTC';
    }
    return ianaTimeZone;
}

},{}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoerceOptionsToObject = CoerceOptionsToObject;
var _262_1 = require("./262");
/**
 * https://tc39.es/ecma402/#sec-coerceoptionstoobject
 * @param options
 * @returns
 */
function CoerceOptionsToObject(options) {
    if (typeof options === 'undefined') {
        return Object.create(null);
    }
    return (0, _262_1.ToObject)(options);
}

},{"./262":3}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultNumberOption = DefaultNumberOption;
/**
 * https://tc39.es/ecma402/#sec-defaultnumberoption
 * @param val
 * @param min
 * @param max
 * @param fallback
 */
function DefaultNumberOption(inputVal, min, max, fallback) {
    if (inputVal === undefined) {
        // @ts-expect-error
        return fallback;
    }
    var val = Number(inputVal);
    if (isNaN(val) || val < min || val > max) {
        throw new RangeError("".concat(val, " is outside of range [").concat(min, ", ").concat(max, "]"));
    }
    return Math.floor(val);
}

},{}],8:[function(require,module,exports){
"use strict";
/**
 * https://tc39.es/ecma402/#sec-getnumberoption
 * @param options
 * @param property
 * @param min
 * @param max
 * @param fallback
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetNumberOption = GetNumberOption;
var DefaultNumberOption_1 = require("./DefaultNumberOption");
function GetNumberOption(options, property, minimum, maximum, fallback) {
    var val = options[property];
    return (0, DefaultNumberOption_1.DefaultNumberOption)(val, minimum, maximum, fallback);
}

},{"./DefaultNumberOption":7}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetOption = GetOption;
var _262_1 = require("./262");
/**
 * https://tc39.es/ecma402/#sec-getoption
 * @param opts
 * @param prop
 * @param type
 * @param values
 * @param fallback
 */
function GetOption(opts, prop, type, values, fallback) {
    if (typeof opts !== 'object') {
        throw new TypeError('Options must be an object');
    }
    var value = opts[prop];
    if (value !== undefined) {
        if (type !== 'boolean' && type !== 'string') {
            throw new TypeError('invalid type');
        }
        if (type === 'boolean') {
            value = Boolean(value);
        }
        if (type === 'string') {
            value = (0, _262_1.ToString)(value);
        }
        if (values !== undefined && !values.filter(function (val) { return val == value; }).length) {
            throw new RangeError("".concat(value, " is not within ").concat(values.join(', ')));
        }
        return value;
    }
    return fallback;
}

},{"./262":3}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetOptionsObject = GetOptionsObject;
/**
 * https://tc39.es/ecma402/#sec-getoptionsobject
 * @param options
 * @returns
 */
function GetOptionsObject(options) {
    if (typeof options === 'undefined') {
        return Object.create(null);
    }
    if (typeof options === 'object') {
        return options;
    }
    throw new TypeError('Options must be an object');
}

},{}],11:[function(require,module,exports){
"use strict";
/**
 * https://tc39.es/ecma402/#sec-getstringorbooleanoption
 * @param opts
 * @param prop
 * @param values
 * @param trueValue
 * @param falsyValue
 * @param fallback
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetStringOrBooleanOption = GetStringOrBooleanOption;
var _262_1 = require("./262");
function GetStringOrBooleanOption(opts, prop, values, trueValue, falsyValue, fallback) {
    var value = opts[prop];
    if (value === undefined) {
        return fallback;
    }
    if (value === true) {
        return trueValue;
    }
    var valueBoolean = Boolean(value);
    if (valueBoolean === false) {
        return falsyValue;
    }
    value = (0, _262_1.ToString)(value);
    if (value === 'true' || value === 'false') {
        return fallback;
    }
    if ((values || []).indexOf(value) === -1) {
        throw new RangeError("Invalid value ".concat(value));
    }
    return value;
}

},{"./262":3}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SIMPLE_UNITS = exports.SANCTIONED_UNITS = void 0;
exports.removeUnitNamespace = removeUnitNamespace;
exports.IsSanctionedSimpleUnitIdentifier = IsSanctionedSimpleUnitIdentifier;
/**
 * https://tc39.es/ecma402/#table-sanctioned-simple-unit-identifiers
 */
exports.SANCTIONED_UNITS = [
    'angle-degree',
    'area-acre',
    'area-hectare',
    'concentr-percent',
    'digital-bit',
    'digital-byte',
    'digital-gigabit',
    'digital-gigabyte',
    'digital-kilobit',
    'digital-kilobyte',
    'digital-megabit',
    'digital-megabyte',
    'digital-petabyte',
    'digital-terabit',
    'digital-terabyte',
    'duration-day',
    'duration-hour',
    'duration-millisecond',
    'duration-minute',
    'duration-month',
    'duration-second',
    'duration-week',
    'duration-year',
    'length-centimeter',
    'length-foot',
    'length-inch',
    'length-kilometer',
    'length-meter',
    'length-mile-scandinavian',
    'length-mile',
    'length-millimeter',
    'length-yard',
    'mass-gram',
    'mass-kilogram',
    'mass-ounce',
    'mass-pound',
    'mass-stone',
    'temperature-celsius',
    'temperature-fahrenheit',
    'volume-fluid-ounce',
    'volume-gallon',
    'volume-liter',
    'volume-milliliter',
];
// In CLDR, the unit name always follows the form `namespace-unit` pattern.
// For example: `digital-bit` instead of `bit`. This function removes the namespace prefix.
function removeUnitNamespace(unit) {
    return unit.slice(unit.indexOf('-') + 1);
}
/**
 * https://tc39.es/ecma402/#table-sanctioned-simple-unit-identifiers
 */
exports.SIMPLE_UNITS = exports.SANCTIONED_UNITS.map(removeUnitNamespace);
/**
 * https://tc39.es/ecma402/#sec-issanctionedsimpleunitidentifier
 */
function IsSanctionedSimpleUnitIdentifier(unitIdentifier) {
    return exports.SIMPLE_UNITS.indexOf(unitIdentifier) > -1;
}

},{}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsValidTimeZoneName = IsValidTimeZoneName;
/**
 * https://tc39.es/ecma402/#sec-isvalidtimezonename
 * @param tz
 * @param implDetails implementation details
 */
function IsValidTimeZoneName(tz, _a) {
    var zoneNamesFromData = _a.zoneNamesFromData, uppercaseLinks = _a.uppercaseLinks;
    var uppercasedTz = tz.toUpperCase();
    var zoneNames = new Set();
    var linkNames = new Set();
    zoneNamesFromData.map(function (z) { return z.toUpperCase(); }).forEach(function (z) { return zoneNames.add(z); });
    Object.keys(uppercaseLinks).forEach(function (linkName) {
        linkNames.add(linkName.toUpperCase());
        zoneNames.add(uppercaseLinks[linkName].toUpperCase());
    });
    return zoneNames.has(uppercasedTz) || linkNames.has(uppercasedTz);
}

},{}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsWellFormedCurrencyCode = IsWellFormedCurrencyCode;
/**
 * This follows https://tc39.es/ecma402/#sec-case-sensitivity-and-case-mapping
 * @param str string to convert
 */
function toUpperCase(str) {
    return str.replace(/([a-z])/g, function (_, c) { return c.toUpperCase(); });
}
var NOT_A_Z_REGEX = /[^A-Z]/;
/**
 * https://tc39.es/ecma402/#sec-iswellformedcurrencycode
 */
function IsWellFormedCurrencyCode(currency) {
    currency = toUpperCase(currency);
    if (currency.length !== 3) {
        return false;
    }
    if (NOT_A_Z_REGEX.test(currency)) {
        return false;
    }
    return true;
}

},{}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsWellFormedUnitIdentifier = IsWellFormedUnitIdentifier;
var IsSanctionedSimpleUnitIdentifier_1 = require("./IsSanctionedSimpleUnitIdentifier");
/**
 * This follows https://tc39.es/ecma402/#sec-case-sensitivity-and-case-mapping
 * @param str string to convert
 */
function toLowerCase(str) {
    return str.replace(/([A-Z])/g, function (_, c) { return c.toLowerCase(); });
}
/**
 * https://tc39.es/ecma402/#sec-iswellformedunitidentifier
 * @param unit
 */
function IsWellFormedUnitIdentifier(unit) {
    unit = toLowerCase(unit);
    if ((0, IsSanctionedSimpleUnitIdentifier_1.IsSanctionedSimpleUnitIdentifier)(unit)) {
        return true;
    }
    var units = unit.split('-per-');
    if (units.length !== 2) {
        return false;
    }
    var numerator = units[0], denominator = units[1];
    if (!(0, IsSanctionedSimpleUnitIdentifier_1.IsSanctionedSimpleUnitIdentifier)(numerator) ||
        !(0, IsSanctionedSimpleUnitIdentifier_1.IsSanctionedSimpleUnitIdentifier)(denominator)) {
        return false;
    }
    return true;
}

},{"./IsSanctionedSimpleUnitIdentifier":12}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplyUnsignedRoundingMode = ApplyUnsignedRoundingMode;
function ApplyUnsignedRoundingMode(x, r1, r2, unsignedRoundingMode) {
    if (x === r1)
        return r1;
    if (unsignedRoundingMode === undefined) {
        throw new Error('unsignedRoundingMode is mandatory');
    }
    if (unsignedRoundingMode === 'zero') {
        return r1;
    }
    if (unsignedRoundingMode === 'infinity') {
        return r2;
    }
    var d1 = x - r1;
    var d2 = r2 - x;
    if (d1 < d2) {
        return r1;
    }
    if (d2 < d1) {
        return r2;
    }
    if (d1 !== d2) {
        throw new Error('Unexpected error');
    }
    if (unsignedRoundingMode === 'half-zero') {
        return r1;
    }
    if (unsignedRoundingMode === 'half-infinity') {
        return r2;
    }
    if (unsignedRoundingMode !== 'half-even') {
        throw new Error("Unexpected value for unsignedRoundingMode: ".concat(unsignedRoundingMode));
    }
    var cardinality = (r1 / (r2 - r1)) % 2;
    if (cardinality === 0) {
        return r1;
    }
    return r2;
}

},{}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollapseNumberRange = CollapseNumberRange;
var PART_TYPES_TO_COLLAPSE = new Set([
    'unit',
    'exponentMinusSign',
    'minusSign',
    'plusSign',
    'percentSign',
    'exponentSeparator',
    'percent',
    'percentSign',
    'currency',
    'literal',
]);
/**
 * https://tc39.es/ecma402/#sec-collapsenumberrange
 * LDML: https://unicode-org.github.io/cldr/ldml/tr35-numbers.html#collapsing-number-ranges
 */
function CollapseNumberRange(numberFormat, result, _a) {
    var getInternalSlots = _a.getInternalSlots;
    var internalSlots = getInternalSlots(numberFormat);
    var symbols = internalSlots.dataLocaleData.numbers.symbols[internalSlots.numberingSystem];
    var rangeSignRegex = new RegExp("s?[".concat(symbols.rangeSign, "]s?"));
    var rangeSignIndex = result.findIndex(function (r) { return r.type === 'literal' && rangeSignRegex.test(r.value); });
    var prefixSignParts = [];
    for (var i = rangeSignIndex - 1; i >= 0; i--) {
        if (!PART_TYPES_TO_COLLAPSE.has(result[i].type)) {
            break;
        }
        prefixSignParts.unshift(result[i]);
    }
    // Don't collapse if it's a single code point
    if (Array.from(prefixSignParts.map(function (p) { return p.value; }).join('')).length > 1) {
        var newResult = Array.from(result);
        newResult.splice(rangeSignIndex - prefixSignParts.length, prefixSignParts.length);
        return newResult;
    }
    var suffixSignParts = [];
    for (var i = rangeSignIndex + 1; i < result.length; i++) {
        if (!PART_TYPES_TO_COLLAPSE.has(result[i].type)) {
            break;
        }
        suffixSignParts.push(result[i]);
    }
    // Don't collapse if it's a single code point
    if (Array.from(suffixSignParts.map(function (p) { return p.value; }).join('')).length > 1) {
        var newResult = Array.from(result);
        newResult.splice(rangeSignIndex + 1, suffixSignParts.length);
        return newResult;
    }
    return result;
}

},{}],18:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComputeExponent = ComputeExponent;
var utils_1 = require("../utils");
var ComputeExponentForMagnitude_1 = require("./ComputeExponentForMagnitude");
var FormatNumericToString_1 = require("./FormatNumericToString");
/**
 * The abstract operation ComputeExponent computes an exponent (power of ten) by which to scale x
 * according to the number formatting settings. It handles cases such as 999 rounding up to 1000,
 * requiring a different exponent.
 *
 * NOT IN SPEC: it returns [exponent, magnitude].
 */
function ComputeExponent(numberFormat, x, _a) {
    var getInternalSlots = _a.getInternalSlots;
    if (x === 0) {
        return [0, 0];
    }
    if (x < 0) {
        x = -x;
    }
    var magnitude = (0, utils_1.getMagnitude)(x);
    var exponent = (0, ComputeExponentForMagnitude_1.ComputeExponentForMagnitude)(numberFormat, magnitude, {
        getInternalSlots: getInternalSlots,
    });
    // Preserve more precision by doing multiplication when exponent is negative.
    x = exponent < 0 ? x * Math.pow(10, -exponent) : x / Math.pow(10, exponent);
    var formatNumberResult = (0, FormatNumericToString_1.FormatNumericToString)(getInternalSlots(numberFormat), x);
    if (formatNumberResult.roundedNumber === 0) {
        return [exponent, magnitude];
    }
    var newMagnitude = (0, utils_1.getMagnitude)(formatNumberResult.roundedNumber);
    if (newMagnitude === magnitude - exponent) {
        return [exponent, magnitude];
    }
    return [
        (0, ComputeExponentForMagnitude_1.ComputeExponentForMagnitude)(numberFormat, magnitude + 1, {
            getInternalSlots: getInternalSlots,
        }),
        magnitude + 1,
    ];
}

},{"../utils":47,"./ComputeExponentForMagnitude":19,"./FormatNumericToString":25}],19:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComputeExponentForMagnitude = ComputeExponentForMagnitude;
/**
 * The abstract operation ComputeExponentForMagnitude computes an exponent by which to scale a
 * number of the given magnitude (power of ten of the most significant digit) according to the
 * locale and the desired notation (scientific, engineering, or compact).
 */
function ComputeExponentForMagnitude(numberFormat, magnitude, _a) {
    var getInternalSlots = _a.getInternalSlots;
    var internalSlots = getInternalSlots(numberFormat);
    var notation = internalSlots.notation, dataLocaleData = internalSlots.dataLocaleData, numberingSystem = internalSlots.numberingSystem;
    switch (notation) {
        case 'standard':
            return 0;
        case 'scientific':
            return magnitude;
        case 'engineering':
            return Math.floor(magnitude / 3) * 3;
        default: {
            // Let exponent be an implementation- and locale-dependent (ILD) integer by which to scale a
            // number of the given magnitude in compact notation for the current locale.
            var compactDisplay = internalSlots.compactDisplay, style = internalSlots.style, currencyDisplay = internalSlots.currencyDisplay;
            var thresholdMap = void 0;
            if (style === 'currency' && currencyDisplay !== 'name') {
                var currency = dataLocaleData.numbers.currency[numberingSystem] ||
                    dataLocaleData.numbers.currency[dataLocaleData.numbers.nu[0]];
                thresholdMap = currency.short;
            }
            else {
                var decimal = dataLocaleData.numbers.decimal[numberingSystem] ||
                    dataLocaleData.numbers.decimal[dataLocaleData.numbers.nu[0]];
                thresholdMap = compactDisplay === 'long' ? decimal.long : decimal.short;
            }
            if (!thresholdMap) {
                return 0;
            }
            var num = String(Math.pow(10, magnitude));
            var thresholds = Object.keys(thresholdMap); // TODO: this can be pre-processed
            if (num < thresholds[0]) {
                return 0;
            }
            if (num > thresholds[thresholds.length - 1]) {
                return thresholds[thresholds.length - 1].length - 1;
            }
            var i = thresholds.indexOf(num);
            if (i === -1) {
                return 0;
            }
            // See https://unicode.org/reports/tr35/tr35-numbers.html#Compact_Number_Formats
            // Special handling if the pattern is precisely `0`.
            var magnitudeKey = thresholds[i];
            // TODO: do we need to handle plural here?
            var compactPattern = thresholdMap[magnitudeKey].other;
            if (compactPattern === '0') {
                return 0;
            }
            // Example: in zh-TW, `10000000` maps to `0000萬`. So we need to return 8 - 4 = 4 here.
            return (magnitudeKey.length -
                thresholdMap[magnitudeKey].other.match(/0+/)[0].length);
        }
    }
}

},{}],20:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrencyDigits = CurrencyDigits;
var _262_1 = require("../262");
/**
 * https://tc39.es/ecma402/#sec-currencydigits
 */
function CurrencyDigits(c, _a) {
    var currencyDigitsData = _a.currencyDigitsData;
    return (0, _262_1.HasOwnProperty)(currencyDigitsData, c)
        ? currencyDigitsData[c]
        : 2;
}

},{"../262":3}],21:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormatApproximately = FormatApproximately;
/**
 * https://tc39.es/ecma402/#sec-formatapproximately
 */
function FormatApproximately(numberFormat, result, _a) {
    var getInternalSlots = _a.getInternalSlots;
    var internalSlots = getInternalSlots(numberFormat);
    var symbols = internalSlots.dataLocaleData.numbers.symbols[internalSlots.numberingSystem];
    var approximatelySign = symbols.approximatelySign;
    result.push({ type: 'approximatelySign', value: approximatelySign });
    return result;
}

},{}],22:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormatNumericRange = FormatNumericRange;
var PartitionNumberRangePattern_1 = require("./PartitionNumberRangePattern");
/**
 * https://tc39.es/ecma402/#sec-formatnumericrange
 */
function FormatNumericRange(numberFormat, x, y, _a) {
    var getInternalSlots = _a.getInternalSlots;
    var parts = (0, PartitionNumberRangePattern_1.PartitionNumberRangePattern)(numberFormat, x, y, {
        getInternalSlots: getInternalSlots,
    });
    return parts.map(function (part) { return part.value; }).join('');
}

},{"./PartitionNumberRangePattern":29}],23:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormatNumericRangeToParts = FormatNumericRangeToParts;
var PartitionNumberRangePattern_1 = require("./PartitionNumberRangePattern");
/**
 * https://tc39.es/ecma402/#sec-formatnumericrangetoparts
 */
function FormatNumericRangeToParts(numberFormat, x, y, _a) {
    var getInternalSlots = _a.getInternalSlots;
    var parts = (0, PartitionNumberRangePattern_1.PartitionNumberRangePattern)(numberFormat, x, y, {
        getInternalSlots: getInternalSlots,
    });
    return parts.map(function (part, index) { return ({
        type: part.type,
        value: part.value,
        source: part.source,
        result: index.toString(),
    }); });
}

},{"./PartitionNumberRangePattern":29}],24:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormatNumericToParts = FormatNumericToParts;
var PartitionNumberPattern_1 = require("./PartitionNumberPattern");
var _262_1 = require("../262");
function FormatNumericToParts(nf, x, implDetails) {
    var parts = (0, PartitionNumberPattern_1.PartitionNumberPattern)(nf, x, implDetails);
    var result = (0, _262_1.ArrayCreate)(0);
    for (var _i = 0, parts_1 = parts; _i < parts_1.length; _i++) {
        var part = parts_1[_i];
        result.push({
            type: part.type,
            value: part.value,
        });
    }
    return result;
}

},{"../262":3,"./PartitionNumberPattern":28}],25:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormatNumericToString = FormatNumericToString;
var _262_1 = require("../262");
var ToRawPrecision_1 = require("./ToRawPrecision");
var utils_1 = require("../utils");
var ToRawFixed_1 = require("./ToRawFixed");
/**
 * https://tc39.es/ecma402/#sec-formatnumberstring
 */
function FormatNumericToString(intlObject, x) {
    var isNegative = x < 0 || (0, _262_1.SameValue)(x, -0);
    if (isNegative) {
        x = -x;
    }
    var result;
    var rourndingType = intlObject.roundingType;
    switch (rourndingType) {
        case 'significantDigits':
            result = (0, ToRawPrecision_1.ToRawPrecision)(x, intlObject.minimumSignificantDigits, intlObject.maximumSignificantDigits);
            break;
        case 'fractionDigits':
            result = (0, ToRawFixed_1.ToRawFixed)(x, intlObject.minimumFractionDigits, intlObject.maximumFractionDigits);
            break;
        default:
            result = (0, ToRawPrecision_1.ToRawPrecision)(x, 1, 2);
            if (result.integerDigitsCount > 1) {
                result = (0, ToRawFixed_1.ToRawFixed)(x, 0, 0);
            }
            break;
    }
    x = result.roundedNumber;
    var string = result.formattedString;
    var int = result.integerDigitsCount;
    var minInteger = intlObject.minimumIntegerDigits;
    if (int < minInteger) {
        var forwardZeros = (0, utils_1.repeat)('0', minInteger - int);
        string = forwardZeros + string;
    }
    if (isNegative) {
        x = -x;
    }
    return { roundedNumber: x, formattedString: string };
}

},{"../262":3,"../utils":47,"./ToRawFixed":32,"./ToRawPrecision":33}],26:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUnsignedRoundingMode = GetUnsignedRoundingMode;
var negativeMapping = {
    ceil: 'zero',
    floor: 'infinity',
    expand: 'infinity',
    trunc: 'zero',
    halfCeil: 'half-zero',
    halfFloor: 'half-infinity',
    halfExpand: 'half-infinity',
    halfTrunc: 'half-zero',
    halfEven: 'half-even',
};
var positiveMapping = {
    ceil: 'infinity',
    floor: 'zero',
    expand: 'infinity',
    trunc: 'zero',
    halfCeil: 'half-infinity',
    halfFloor: 'half-zero',
    halfExpand: 'half-infinity',
    halfTrunc: 'half-zero',
    halfEven: 'half-even',
};
function GetUnsignedRoundingMode(roundingMode, isNegative) {
    if (isNegative) {
        return negativeMapping[roundingMode];
    }
    return positiveMapping[roundingMode];
}

},{}],27:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitializeNumberFormat = InitializeNumberFormat;
var intl_localematcher_1 = require("@formatjs/intl-localematcher");
var CanonicalizeLocaleList_1 = require("../CanonicalizeLocaleList");
var CoerceOptionsToObject_1 = require("../CoerceOptionsToObject");
var GetNumberOption_1 = require("../GetNumberOption");
var GetOption_1 = require("../GetOption");
var GetStringOrBooleanOption_1 = require("../GetStringOrBooleanOption");
var utils_1 = require("../utils");
var CurrencyDigits_1 = require("./CurrencyDigits");
var SetNumberFormatDigitOptions_1 = require("./SetNumberFormatDigitOptions");
var SetNumberFormatUnitOptions_1 = require("./SetNumberFormatUnitOptions");
var VALID_ROUND_INCREMENT_VALUES = [
    1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000,
];
/**
 * https://tc39.es/ecma402/#sec-initializenumberformat
 */
function InitializeNumberFormat(nf, locales, opts, _a) {
    var getInternalSlots = _a.getInternalSlots, localeData = _a.localeData, availableLocales = _a.availableLocales, numberingSystemNames = _a.numberingSystemNames, getDefaultLocale = _a.getDefaultLocale, currencyDigitsData = _a.currencyDigitsData;
    // @ts-ignore
    var requestedLocales = (0, CanonicalizeLocaleList_1.CanonicalizeLocaleList)(locales);
    var options = (0, CoerceOptionsToObject_1.CoerceOptionsToObject)(opts);
    var opt = Object.create(null);
    var matcher = (0, GetOption_1.GetOption)(options, 'localeMatcher', 'string', ['lookup', 'best fit'], 'best fit');
    opt.localeMatcher = matcher;
    var numberingSystem = (0, GetOption_1.GetOption)(options, 'numberingSystem', 'string', undefined, undefined);
    if (numberingSystem !== undefined &&
        numberingSystemNames.indexOf(numberingSystem) < 0) {
        // 8.a. If numberingSystem does not match the Unicode Locale Identifier type nonterminal,
        // throw a RangeError exception.
        throw RangeError("Invalid numberingSystems: ".concat(numberingSystem));
    }
    opt.nu = numberingSystem;
    var r = (0, intl_localematcher_1.ResolveLocale)(Array.from(availableLocales), requestedLocales, opt, 
    // [[RelevantExtensionKeys]] slot, which is a constant
    ['nu'], localeData, getDefaultLocale);
    var dataLocaleData = localeData[r.dataLocale];
    (0, utils_1.invariant)(!!dataLocaleData, "Missing locale data for ".concat(r.dataLocale));
    var internalSlots = getInternalSlots(nf);
    internalSlots.locale = r.locale;
    internalSlots.dataLocale = r.dataLocale;
    internalSlots.numberingSystem = r.nu;
    internalSlots.dataLocaleData = dataLocaleData;
    (0, SetNumberFormatUnitOptions_1.SetNumberFormatUnitOptions)(nf, options, { getInternalSlots: getInternalSlots });
    var style = internalSlots.style;
    var mnfdDefault;
    var mxfdDefault;
    if (style === 'currency') {
        var currency = internalSlots.currency;
        var cDigits = (0, CurrencyDigits_1.CurrencyDigits)(currency, { currencyDigitsData: currencyDigitsData });
        mnfdDefault = cDigits;
        mxfdDefault = cDigits;
    }
    else {
        mnfdDefault = 0;
        mxfdDefault = style === 'percent' ? 0 : 3;
    }
    var notation = (0, GetOption_1.GetOption)(options, 'notation', 'string', ['standard', 'scientific', 'engineering', 'compact'], 'standard');
    internalSlots.notation = notation;
    (0, SetNumberFormatDigitOptions_1.SetNumberFormatDigitOptions)(internalSlots, options, mnfdDefault, mxfdDefault, notation);
    var roundingIncrement = (0, GetNumberOption_1.GetNumberOption)(options, 'roundingIncrement', 1, 5000, 1);
    if (VALID_ROUND_INCREMENT_VALUES.indexOf(roundingIncrement) === -1) {
        throw new RangeError("Invalid rounding increment value: ".concat(roundingIncrement, ".\nValid values are ").concat(VALID_ROUND_INCREMENT_VALUES, "."));
    }
    if (roundingIncrement !== 1 &&
        internalSlots.roundingType !== 'fractionDigits') {
        throw new TypeError("For roundingIncrement > 1 only fractionDigits is a valid roundingType");
    }
    if (roundingIncrement !== 1 &&
        internalSlots.maximumFractionDigits !== internalSlots.minimumFractionDigits) {
        throw new RangeError('With roundingIncrement > 1, maximumFractionDigits and minimumFractionDigits must be equal.');
    }
    internalSlots.roundingIncrement = roundingIncrement;
    var trailingZeroDisplay = (0, GetOption_1.GetOption)(options, 'trailingZeroDisplay', 'string', ['auto', 'stripIfInteger'], 'auto');
    internalSlots.trailingZeroDisplay = trailingZeroDisplay;
    var compactDisplay = (0, GetOption_1.GetOption)(options, 'compactDisplay', 'string', ['short', 'long'], 'short');
    var defaultUseGrouping = 'auto';
    if (notation === 'compact') {
        internalSlots.compactDisplay = compactDisplay;
        defaultUseGrouping = 'min2';
    }
    internalSlots.useGrouping = (0, GetStringOrBooleanOption_1.GetStringOrBooleanOption)(options, 'useGrouping', ['min2', 'auto', 'always'], 'always', false, defaultUseGrouping);
    internalSlots.signDisplay = (0, GetOption_1.GetOption)(options, 'signDisplay', 'string', ['auto', 'never', 'always', 'exceptZero', 'negative'], 'auto');
    internalSlots.roundingMode = (0, GetOption_1.GetOption)(options, 'roundingMode', 'string', [
        'ceil',
        'floor',
        'expand',
        'trunc',
        'halfCeil',
        'halfFloor',
        'halfExpand',
        'halfTrunc',
        'halfEven',
    ], 'halfExpand');
    return nf;
}

},{"../CanonicalizeLocaleList":4,"../CoerceOptionsToObject":6,"../GetNumberOption":8,"../GetOption":9,"../GetStringOrBooleanOption":11,"../utils":47,"./CurrencyDigits":20,"./SetNumberFormatDigitOptions":30,"./SetNumberFormatUnitOptions":31,"@formatjs/intl-localematcher":61}],28:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartitionNumberPattern = PartitionNumberPattern;
var tslib_1 = require("tslib");
var FormatNumericToString_1 = require("./FormatNumericToString");
var _262_1 = require("../262");
var ComputeExponent_1 = require("./ComputeExponent");
var format_to_parts_1 = tslib_1.__importDefault(require("./format_to_parts"));
/**
 * https://tc39.es/ecma402/#sec-formatnumberstring
 */
function PartitionNumberPattern(numberFormat, x, _a) {
    var _b;
    var getInternalSlots = _a.getInternalSlots;
    var internalSlots = getInternalSlots(numberFormat);
    var pl = internalSlots.pl, dataLocaleData = internalSlots.dataLocaleData, numberingSystem = internalSlots.numberingSystem;
    var symbols = dataLocaleData.numbers.symbols[numberingSystem] ||
        dataLocaleData.numbers.symbols[dataLocaleData.numbers.nu[0]];
    var magnitude = 0;
    var exponent = 0;
    var n;
    if (isNaN(x)) {
        n = symbols.nan;
    }
    else if (x == Number.POSITIVE_INFINITY || x == Number.NEGATIVE_INFINITY) {
        n = symbols.infinity;
    }
    else {
        if (!(0, _262_1.SameValue)(x, -0)) {
            if (!isFinite(x)) {
                throw new Error('Input must be a mathematical value');
            }
            if (internalSlots.style == 'percent') {
                x *= 100;
            }
            ;
            _b = (0, ComputeExponent_1.ComputeExponent)(numberFormat, x, {
                getInternalSlots: getInternalSlots,
            }), exponent = _b[0], magnitude = _b[1];
            // Preserve more precision by doing multiplication when exponent is negative.
            x = exponent < 0 ? x * Math.pow(10, -exponent) : x / Math.pow(10, exponent);
        }
        var formatNumberResult = (0, FormatNumericToString_1.FormatNumericToString)(internalSlots, x);
        n = formatNumberResult.formattedString;
        x = formatNumberResult.roundedNumber;
    }
    // Based on https://tc39.es/ecma402/#sec-getnumberformatpattern
    // We need to do this before `x` is rounded.
    var sign;
    var signDisplay = internalSlots.signDisplay;
    switch (signDisplay) {
        case 'never':
            sign = 0;
            break;
        case 'auto':
            if ((0, _262_1.SameValue)(x, 0) || x > 0 || isNaN(x)) {
                sign = 0;
            }
            else {
                sign = -1;
            }
            break;
        case 'always':
            if ((0, _262_1.SameValue)(x, 0) || x > 0 || isNaN(x)) {
                sign = 1;
            }
            else {
                sign = -1;
            }
            break;
        default:
            // x === 0 -> x is 0 or x is -0
            if (x === 0 || isNaN(x)) {
                sign = 0;
            }
            else if (x > 0) {
                sign = 1;
            }
            else {
                sign = -1;
            }
    }
    return (0, format_to_parts_1.default)({ roundedNumber: x, formattedString: n, exponent: exponent, magnitude: magnitude, sign: sign }, internalSlots.dataLocaleData, pl, internalSlots);
}

},{"../262":3,"./ComputeExponent":18,"./FormatNumericToString":25,"./format_to_parts":35,"tslib":74}],29:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartitionNumberRangePattern = PartitionNumberRangePattern;
var CollapseNumberRange_1 = require("./CollapseNumberRange");
var FormatApproximately_1 = require("./FormatApproximately");
var PartitionNumberPattern_1 = require("./PartitionNumberPattern");
/**
 * https://tc39.es/ecma402/#sec-partitionnumberrangepattern
 */
function PartitionNumberRangePattern(numberFormat, x, y, _a) {
    var getInternalSlots = _a.getInternalSlots;
    if (isNaN(x) || isNaN(y)) {
        throw new RangeError('Input must be a number');
    }
    var result = [];
    var xResult = (0, PartitionNumberPattern_1.PartitionNumberPattern)(numberFormat, x, { getInternalSlots: getInternalSlots });
    var yResult = (0, PartitionNumberPattern_1.PartitionNumberPattern)(numberFormat, y, { getInternalSlots: getInternalSlots });
    if (xResult === yResult) {
        return (0, FormatApproximately_1.FormatApproximately)(numberFormat, xResult, { getInternalSlots: getInternalSlots });
    }
    for (var _i = 0, xResult_1 = xResult; _i < xResult_1.length; _i++) {
        var r = xResult_1[_i];
        r.source = 'startRange';
    }
    result = result.concat(xResult);
    var internalSlots = getInternalSlots(numberFormat);
    var symbols = internalSlots.dataLocaleData.numbers.symbols[internalSlots.numberingSystem];
    result.push({ type: 'literal', value: symbols.rangeSign, source: 'shared' });
    for (var _b = 0, yResult_1 = yResult; _b < yResult_1.length; _b++) {
        var r = yResult_1[_b];
        r.source = 'endRange';
    }
    result = result.concat(yResult);
    return (0, CollapseNumberRange_1.CollapseNumberRange)(numberFormat, result, { getInternalSlots: getInternalSlots });
    // TODO: Needs to implement Range Pattern Processing https://unicode-org.github.io/cldr/ldml/tr35-numbers.html#range-pattern-processing
}

},{"./CollapseNumberRange":17,"./FormatApproximately":21,"./PartitionNumberPattern":28}],30:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetNumberFormatDigitOptions = SetNumberFormatDigitOptions;
var DefaultNumberOption_1 = require("../DefaultNumberOption");
var GetNumberOption_1 = require("../GetNumberOption");
var GetOption_1 = require("../GetOption");
/**
 * https://tc39.es/ecma402/#sec-setnfdigitoptions
 */
function SetNumberFormatDigitOptions(internalSlots, opts, mnfdDefault, mxfdDefault, notation) {
    var mnid = (0, GetNumberOption_1.GetNumberOption)(opts, 'minimumIntegerDigits', 1, 21, 1);
    var mnfd = opts.minimumFractionDigits;
    var mxfd = opts.maximumFractionDigits;
    var mnsd = opts.minimumSignificantDigits;
    var mxsd = opts.maximumSignificantDigits;
    internalSlots.minimumIntegerDigits = mnid;
    var roundingPriority = (0, GetOption_1.GetOption)(opts, 'roundingPriority', 'string', ['auto', 'morePrecision', 'lessPrecision'], 'auto');
    var hasSd = mnsd !== undefined || mxsd !== undefined;
    var hasFd = mnfd !== undefined || mxfd !== undefined;
    var needSd = true;
    var needFd = true;
    if (roundingPriority === 'auto') {
        needSd = hasSd;
        if (hasSd || (!hasFd && notation === 'compact')) {
            needFd = false;
        }
    }
    if (needSd) {
        if (hasSd) {
            mnsd = (0, DefaultNumberOption_1.DefaultNumberOption)(mnsd, 1, 21, 1);
            mxsd = (0, DefaultNumberOption_1.DefaultNumberOption)(mxsd, mnsd, 21, 21);
            internalSlots.minimumSignificantDigits = mnsd;
            internalSlots.maximumSignificantDigits = mxsd;
        }
        else {
            internalSlots.minimumSignificantDigits = 1;
            internalSlots.maximumSignificantDigits = 21;
        }
    }
    if (needFd) {
        if (hasFd) {
            mnfd = (0, DefaultNumberOption_1.DefaultNumberOption)(mnfd, 0, 20, undefined);
            mxfd = (0, DefaultNumberOption_1.DefaultNumberOption)(mxfd, 0, 20, undefined);
            if (mnfd === undefined) {
                // @ts-expect-error
                mnfd = Math.min(mnfdDefault, mxfd);
            }
            else if (mxfd === undefined) {
                mxfd = Math.max(mxfdDefault, mnfd);
            }
            else if (mnfd > mxfd) {
                throw new RangeError("Invalid range, ".concat(mnfd, " > ").concat(mxfd));
            }
            internalSlots.minimumFractionDigits = mnfd;
            internalSlots.maximumFractionDigits = mxfd;
        }
        else {
            internalSlots.minimumFractionDigits = mnfdDefault;
            internalSlots.maximumFractionDigits = mxfdDefault;
        }
    }
    if (needSd || needFd) {
        if (roundingPriority === 'morePrecision') {
            internalSlots.roundingType = 'morePrecision';
        }
        else if (roundingPriority === 'lessPrecision') {
            internalSlots.roundingType = 'lessPrecision';
        }
        else if (hasSd) {
            internalSlots.roundingType = 'significantDigits';
        }
        else {
            internalSlots.roundingType = 'fractionDigits';
        }
    }
    else {
        internalSlots.roundingType = 'morePrecision';
        internalSlots.minimumFractionDigits = 0;
        internalSlots.maximumFractionDigits = 0;
        internalSlots.minimumSignificantDigits = 1;
        internalSlots.maximumSignificantDigits = 2;
    }
}

},{"../DefaultNumberOption":7,"../GetNumberOption":8,"../GetOption":9}],31:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetNumberFormatUnitOptions = SetNumberFormatUnitOptions;
var GetOption_1 = require("../GetOption");
var IsWellFormedCurrencyCode_1 = require("../IsWellFormedCurrencyCode");
var IsWellFormedUnitIdentifier_1 = require("../IsWellFormedUnitIdentifier");
/**
 * https://tc39.es/ecma402/#sec-setnumberformatunitoptions
 */
function SetNumberFormatUnitOptions(nf, options, _a) {
    if (options === void 0) { options = Object.create(null); }
    var getInternalSlots = _a.getInternalSlots;
    var internalSlots = getInternalSlots(nf);
    var style = (0, GetOption_1.GetOption)(options, 'style', 'string', ['decimal', 'percent', 'currency', 'unit'], 'decimal');
    internalSlots.style = style;
    var currency = (0, GetOption_1.GetOption)(options, 'currency', 'string', undefined, undefined);
    if (currency !== undefined && !(0, IsWellFormedCurrencyCode_1.IsWellFormedCurrencyCode)(currency)) {
        throw RangeError('Malformed currency code');
    }
    if (style === 'currency' && currency === undefined) {
        throw TypeError('currency cannot be undefined');
    }
    var currencyDisplay = (0, GetOption_1.GetOption)(options, 'currencyDisplay', 'string', ['code', 'symbol', 'narrowSymbol', 'name'], 'symbol');
    var currencySign = (0, GetOption_1.GetOption)(options, 'currencySign', 'string', ['standard', 'accounting'], 'standard');
    var unit = (0, GetOption_1.GetOption)(options, 'unit', 'string', undefined, undefined);
    if (unit !== undefined && !(0, IsWellFormedUnitIdentifier_1.IsWellFormedUnitIdentifier)(unit)) {
        throw RangeError('Invalid unit argument for Intl.NumberFormat()');
    }
    if (style === 'unit' && unit === undefined) {
        throw TypeError('unit cannot be undefined');
    }
    var unitDisplay = (0, GetOption_1.GetOption)(options, 'unitDisplay', 'string', ['short', 'narrow', 'long'], 'short');
    if (style === 'currency') {
        internalSlots.currency = currency.toUpperCase();
        internalSlots.currencyDisplay = currencyDisplay;
        internalSlots.currencySign = currencySign;
    }
    if (style === 'unit') {
        internalSlots.unit = unit;
        internalSlots.unitDisplay = unitDisplay;
    }
}

},{"../GetOption":9,"../IsWellFormedCurrencyCode":14,"../IsWellFormedUnitIdentifier":15}],32:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToRawFixed = ToRawFixed;
var utils_1 = require("../utils");
/**
 * TODO: dedup with intl-pluralrules and support BigInt
 * https://tc39.es/ecma402/#sec-torawfixed
 * @param x a finite non-negative Number or BigInt
 * @param minFraction and integer between 0 and 20
 * @param maxFraction and integer between 0 and 20
 */
function ToRawFixed(x, minFraction, maxFraction) {
    var f = maxFraction;
    var n = Math.round(x * Math.pow(10, f));
    var xFinal = n / Math.pow(10, f);
    // n is a positive integer, but it is possible to be greater than 1e21.
    // In such case we will go the slow path.
    // See also: https://tc39.es/ecma262/#sec-numeric-types-number-tostring
    var m;
    if (n < 1e21) {
        m = n.toString();
    }
    else {
        m = n.toString();
        var _a = m.split('e'), mantissa = _a[0], exponent = _a[1];
        m = mantissa.replace('.', '');
        m = m + (0, utils_1.repeat)('0', Math.max(+exponent - m.length + 1, 0));
    }
    var int;
    if (f !== 0) {
        var k = m.length;
        if (k <= f) {
            var z = (0, utils_1.repeat)('0', f + 1 - k);
            m = z + m;
            k = f + 1;
        }
        var a = m.slice(0, k - f);
        var b = m.slice(k - f);
        m = "".concat(a, ".").concat(b);
        int = a.length;
    }
    else {
        int = m.length;
    }
    var cut = maxFraction - minFraction;
    while (cut > 0 && m[m.length - 1] === '0') {
        m = m.slice(0, -1);
        cut--;
    }
    if (m[m.length - 1] === '.') {
        m = m.slice(0, -1);
    }
    return { formattedString: m, roundedNumber: xFinal, integerDigitsCount: int };
}

},{"../utils":47}],33:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToRawPrecision = ToRawPrecision;
var utils_1 = require("../utils");
function ToRawPrecision(x, minPrecision, maxPrecision) {
    var p = maxPrecision;
    var m;
    var e;
    var xFinal;
    if (x === 0) {
        m = (0, utils_1.repeat)('0', p);
        e = 0;
        xFinal = 0;
    }
    else {
        var xToString = x.toString();
        // If xToString is formatted as scientific notation, the number is either very small or very
        // large. If the precision of the formatted string is lower that requested max precision, we
        // should still infer them from the formatted string, otherwise the formatted result might have
        // precision loss (e.g. 1e41 will not have 0 in every trailing digits).
        var xToStringExponentIndex = xToString.indexOf('e');
        var _a = xToString.split('e'), xToStringMantissa = _a[0], xToStringExponent = _a[1];
        var xToStringMantissaWithoutDecimalPoint = xToStringMantissa.replace('.', '');
        if (xToStringExponentIndex >= 0 &&
            xToStringMantissaWithoutDecimalPoint.length <= p) {
            e = +xToStringExponent;
            m =
                xToStringMantissaWithoutDecimalPoint +
                    (0, utils_1.repeat)('0', p - xToStringMantissaWithoutDecimalPoint.length);
            xFinal = x;
        }
        else {
            e = (0, utils_1.getMagnitude)(x);
            var decimalPlaceOffset = e - p + 1;
            // n is the integer containing the required precision digits. To derive the formatted string,
            // we will adjust its decimal place in the logic below.
            var n = Math.round(adjustDecimalPlace(x, decimalPlaceOffset));
            // The rounding caused the change of magnitude, so we should increment `e` by 1.
            if (adjustDecimalPlace(n, p - 1) >= 10) {
                e = e + 1;
                // Divide n by 10 to swallow one precision.
                n = Math.floor(n / 10);
            }
            m = n.toString();
            // Equivalent of n * 10 ** (e - p + 1)
            xFinal = adjustDecimalPlace(n, p - 1 - e);
        }
    }
    var int;
    if (e >= p - 1) {
        m = m + (0, utils_1.repeat)('0', e - p + 1);
        int = e + 1;
    }
    else if (e >= 0) {
        m = "".concat(m.slice(0, e + 1), ".").concat(m.slice(e + 1));
        int = e + 1;
    }
    else {
        m = "0.".concat((0, utils_1.repeat)('0', -e - 1)).concat(m);
        int = 1;
    }
    if (m.indexOf('.') >= 0 && maxPrecision > minPrecision) {
        var cut = maxPrecision - minPrecision;
        while (cut > 0 && m[m.length - 1] === '0') {
            m = m.slice(0, -1);
            cut--;
        }
        if (m[m.length - 1] === '.') {
            m = m.slice(0, -1);
        }
    }
    return { formattedString: m, roundedNumber: xFinal, integerDigitsCount: int };
    // x / (10 ** magnitude), but try to preserve as much floating point precision as possible.
    function adjustDecimalPlace(x, magnitude) {
        return magnitude < 0 ? x * Math.pow(10, -magnitude) : x / Math.pow(10, magnitude);
    }
}

},{"../utils":47}],34:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.digitMapping = void 0;
exports.digitMapping = {
    "adlm": [
        "𞥐",
        "𞥑",
        "𞥒",
        "𞥓",
        "𞥔",
        "𞥕",
        "𞥖",
        "𞥗",
        "𞥘",
        "𞥙"
    ],
    "ahom": [
        "𑜰",
        "𑜱",
        "𑜲",
        "𑜳",
        "𑜴",
        "𑜵",
        "𑜶",
        "𑜷",
        "𑜸",
        "𑜹"
    ],
    "arab": [
        "٠",
        "١",
        "٢",
        "٣",
        "٤",
        "٥",
        "٦",
        "٧",
        "٨",
        "٩"
    ],
    "arabext": [
        "۰",
        "۱",
        "۲",
        "۳",
        "۴",
        "۵",
        "۶",
        "۷",
        "۸",
        "۹"
    ],
    "bali": [
        "᭐",
        "᭑",
        "᭒",
        "᭓",
        "᭔",
        "᭕",
        "᭖",
        "᭗",
        "᭘",
        "᭙"
    ],
    "beng": [
        "০",
        "১",
        "২",
        "৩",
        "৪",
        "৫",
        "৬",
        "৭",
        "৮",
        "৯"
    ],
    "bhks": [
        "𑱐",
        "𑱑",
        "𑱒",
        "𑱓",
        "𑱔",
        "𑱕",
        "𑱖",
        "𑱗",
        "𑱘",
        "𑱙"
    ],
    "brah": [
        "𑁦",
        "𑁧",
        "𑁨",
        "𑁩",
        "𑁪",
        "𑁫",
        "𑁬",
        "𑁭",
        "𑁮",
        "𑁯"
    ],
    "cakm": [
        "𑄶",
        "𑄷",
        "𑄸",
        "𑄹",
        "𑄺",
        "𑄻",
        "𑄼",
        "𑄽",
        "𑄾",
        "𑄿"
    ],
    "cham": [
        "꩐",
        "꩑",
        "꩒",
        "꩓",
        "꩔",
        "꩕",
        "꩖",
        "꩗",
        "꩘",
        "꩙"
    ],
    "deva": [
        "०",
        "१",
        "२",
        "३",
        "४",
        "५",
        "६",
        "७",
        "८",
        "९"
    ],
    "diak": [
        "𑥐",
        "𑥑",
        "𑥒",
        "𑥓",
        "𑥔",
        "𑥕",
        "𑥖",
        "𑥗",
        "𑥘",
        "𑥙"
    ],
    "fullwide": [
        "０",
        "１",
        "２",
        "３",
        "４",
        "５",
        "６",
        "７",
        "８",
        "９"
    ],
    "gong": [
        "𑶠",
        "𑶡",
        "𑶢",
        "𑶣",
        "𑶤",
        "𑶥",
        "𑶦",
        "𑶧",
        "𑶨",
        "𑶩"
    ],
    "gonm": [
        "𑵐",
        "𑵑",
        "𑵒",
        "𑵓",
        "𑵔",
        "𑵕",
        "𑵖",
        "𑵗",
        "𑵘",
        "𑵙"
    ],
    "gujr": [
        "૦",
        "૧",
        "૨",
        "૩",
        "૪",
        "૫",
        "૬",
        "૭",
        "૮",
        "૯"
    ],
    "guru": [
        "੦",
        "੧",
        "੨",
        "੩",
        "੪",
        "੫",
        "੬",
        "੭",
        "੮",
        "੯"
    ],
    "hanidec": [
        "〇",
        "一",
        "二",
        "三",
        "四",
        "五",
        "六",
        "七",
        "八",
        "九"
    ],
    "hmng": [
        "𖭐",
        "𖭑",
        "𖭒",
        "𖭓",
        "𖭔",
        "𖭕",
        "𖭖",
        "𖭗",
        "𖭘",
        "𖭙"
    ],
    "hmnp": [
        "𞅀",
        "𞅁",
        "𞅂",
        "𞅃",
        "𞅄",
        "𞅅",
        "𞅆",
        "𞅇",
        "𞅈",
        "𞅉"
    ],
    "java": [
        "꧐",
        "꧑",
        "꧒",
        "꧓",
        "꧔",
        "꧕",
        "꧖",
        "꧗",
        "꧘",
        "꧙"
    ],
    "kali": [
        "꤀",
        "꤁",
        "꤂",
        "꤃",
        "꤄",
        "꤅",
        "꤆",
        "꤇",
        "꤈",
        "꤉"
    ],
    "khmr": [
        "០",
        "១",
        "២",
        "៣",
        "៤",
        "៥",
        "៦",
        "៧",
        "៨",
        "៩"
    ],
    "knda": [
        "೦",
        "೧",
        "೨",
        "೩",
        "೪",
        "೫",
        "೬",
        "೭",
        "೮",
        "೯"
    ],
    "lana": [
        "᪀",
        "᪁",
        "᪂",
        "᪃",
        "᪄",
        "᪅",
        "᪆",
        "᪇",
        "᪈",
        "᪉"
    ],
    "lanatham": [
        "᪐",
        "᪑",
        "᪒",
        "᪓",
        "᪔",
        "᪕",
        "᪖",
        "᪗",
        "᪘",
        "᪙"
    ],
    "laoo": [
        "໐",
        "໑",
        "໒",
        "໓",
        "໔",
        "໕",
        "໖",
        "໗",
        "໘",
        "໙"
    ],
    "lepc": [
        "᪐",
        "᪑",
        "᪒",
        "᪓",
        "᪔",
        "᪕",
        "᪖",
        "᪗",
        "᪘",
        "᪙"
    ],
    "limb": [
        "᥆",
        "᥇",
        "᥈",
        "᥉",
        "᥊",
        "᥋",
        "᥌",
        "᥍",
        "᥎",
        "᥏"
    ],
    "mathbold": [
        "𝟎",
        "𝟏",
        "𝟐",
        "𝟑",
        "𝟒",
        "𝟓",
        "𝟔",
        "𝟕",
        "𝟖",
        "𝟗"
    ],
    "mathdbl": [
        "𝟘",
        "𝟙",
        "𝟚",
        "𝟛",
        "𝟜",
        "𝟝",
        "𝟞",
        "𝟟",
        "𝟠",
        "𝟡"
    ],
    "mathmono": [
        "𝟶",
        "𝟷",
        "𝟸",
        "𝟹",
        "𝟺",
        "𝟻",
        "𝟼",
        "𝟽",
        "𝟾",
        "𝟿"
    ],
    "mathsanb": [
        "𝟬",
        "𝟭",
        "𝟮",
        "𝟯",
        "𝟰",
        "𝟱",
        "𝟲",
        "𝟳",
        "𝟴",
        "𝟵"
    ],
    "mathsans": [
        "𝟢",
        "𝟣",
        "𝟤",
        "𝟥",
        "𝟦",
        "𝟧",
        "𝟨",
        "𝟩",
        "𝟪",
        "𝟫"
    ],
    "mlym": [
        "൦",
        "൧",
        "൨",
        "൩",
        "൪",
        "൫",
        "൬",
        "൭",
        "൮",
        "൯"
    ],
    "modi": [
        "𑙐",
        "𑙑",
        "𑙒",
        "𑙓",
        "𑙔",
        "𑙕",
        "𑙖",
        "𑙗",
        "𑙘",
        "𑙙"
    ],
    "mong": [
        "᠐",
        "᠑",
        "᠒",
        "᠓",
        "᠔",
        "᠕",
        "᠖",
        "᠗",
        "᠘",
        "᠙"
    ],
    "mroo": [
        "𖩠",
        "𖩡",
        "𖩢",
        "𖩣",
        "𖩤",
        "𖩥",
        "𖩦",
        "𖩧",
        "𖩨",
        "𖩩"
    ],
    "mtei": [
        "꯰",
        "꯱",
        "꯲",
        "꯳",
        "꯴",
        "꯵",
        "꯶",
        "꯷",
        "꯸",
        "꯹"
    ],
    "mymr": [
        "၀",
        "၁",
        "၂",
        "၃",
        "၄",
        "၅",
        "၆",
        "၇",
        "၈",
        "၉"
    ],
    "mymrshan": [
        "႐",
        "႑",
        "႒",
        "႓",
        "႔",
        "႕",
        "႖",
        "႗",
        "႘",
        "႙"
    ],
    "mymrtlng": [
        "꧰",
        "꧱",
        "꧲",
        "꧳",
        "꧴",
        "꧵",
        "꧶",
        "꧷",
        "꧸",
        "꧹"
    ],
    "newa": [
        "𑑐",
        "𑑑",
        "𑑒",
        "𑑓",
        "𑑔",
        "𑑕",
        "𑑖",
        "𑑗",
        "𑑘",
        "𑑙"
    ],
    "nkoo": [
        "߀",
        "߁",
        "߂",
        "߃",
        "߄",
        "߅",
        "߆",
        "߇",
        "߈",
        "߉"
    ],
    "olck": [
        "᱐",
        "᱑",
        "᱒",
        "᱓",
        "᱔",
        "᱕",
        "᱖",
        "᱗",
        "᱘",
        "᱙"
    ],
    "orya": [
        "୦",
        "୧",
        "୨",
        "୩",
        "୪",
        "୫",
        "୬",
        "୭",
        "୮",
        "୯"
    ],
    "osma": [
        "𐒠",
        "𐒡",
        "𐒢",
        "𐒣",
        "𐒤",
        "𐒥",
        "𐒦",
        "𐒧",
        "𐒨",
        "𐒩"
    ],
    "rohg": [
        "𐴰",
        "𐴱",
        "𐴲",
        "𐴳",
        "𐴴",
        "𐴵",
        "𐴶",
        "𐴷",
        "𐴸",
        "𐴹"
    ],
    "saur": [
        "꣐",
        "꣑",
        "꣒",
        "꣓",
        "꣔",
        "꣕",
        "꣖",
        "꣗",
        "꣘",
        "꣙"
    ],
    "segment": [
        "🯰",
        "🯱",
        "🯲",
        "🯳",
        "🯴",
        "🯵",
        "🯶",
        "🯷",
        "🯸",
        "🯹"
    ],
    "shrd": [
        "𑇐",
        "𑇑",
        "𑇒",
        "𑇓",
        "𑇔",
        "𑇕",
        "𑇖",
        "𑇗",
        "𑇘",
        "𑇙"
    ],
    "sind": [
        "𑋰",
        "𑋱",
        "𑋲",
        "𑋳",
        "𑋴",
        "𑋵",
        "𑋶",
        "𑋷",
        "𑋸",
        "𑋹"
    ],
    "sinh": [
        "෦",
        "෧",
        "෨",
        "෩",
        "෪",
        "෫",
        "෬",
        "෭",
        "෮",
        "෯"
    ],
    "sora": [
        "𑃰",
        "𑃱",
        "𑃲",
        "𑃳",
        "𑃴",
        "𑃵",
        "𑃶",
        "𑃷",
        "𑃸",
        "𑃹"
    ],
    "sund": [
        "᮰",
        "᮱",
        "᮲",
        "᮳",
        "᮴",
        "᮵",
        "᮶",
        "᮷",
        "᮸",
        "᮹"
    ],
    "takr": [
        "𑛀",
        "𑛁",
        "𑛂",
        "𑛃",
        "𑛄",
        "𑛅",
        "𑛆",
        "𑛇",
        "𑛈",
        "𑛉"
    ],
    "talu": [
        "᧐",
        "᧑",
        "᧒",
        "᧓",
        "᧔",
        "᧕",
        "᧖",
        "᧗",
        "᧘",
        "᧙"
    ],
    "tamldec": [
        "௦",
        "௧",
        "௨",
        "௩",
        "௪",
        "௫",
        "௬",
        "௭",
        "௮",
        "௯"
    ],
    "telu": [
        "౦",
        "౧",
        "౨",
        "౩",
        "౪",
        "౫",
        "౬",
        "౭",
        "౮",
        "౯"
    ],
    "thai": [
        "๐",
        "๑",
        "๒",
        "๓",
        "๔",
        "๕",
        "๖",
        "๗",
        "๘",
        "๙"
    ],
    "tibt": [
        "༠",
        "༡",
        "༢",
        "༣",
        "༤",
        "༥",
        "༦",
        "༧",
        "༨",
        "༩"
    ],
    "tirh": [
        "𑓐",
        "𑓑",
        "𑓒",
        "𑓓",
        "𑓔",
        "𑓕",
        "𑓖",
        "𑓗",
        "𑓘",
        "𑓙"
    ],
    "vaii": [
        "ᘠ",
        "ᘡ",
        "ᘢ",
        "ᘣ",
        "ᘤ",
        "ᘥ",
        "ᘦ",
        "ᘧ",
        "ᘨ",
        "ᘩ"
    ],
    "wara": [
        "𑣠",
        "𑣡",
        "𑣢",
        "𑣣",
        "𑣤",
        "𑣥",
        "𑣦",
        "𑣧",
        "𑣨",
        "𑣩"
    ],
    "wcho": [
        "𞋰",
        "𞋱",
        "𞋲",
        "𞋳",
        "𞋴",
        "𞋵",
        "𞋶",
        "𞋷",
        "𞋸",
        "𞋹"
    ]
};

},{}],35:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = formatToParts;
var regex_generated_1 = require("../regex.generated");
var ToRawFixed_1 = require("./ToRawFixed");
var digit_mapping_generated_1 = require("./digit-mapping.generated");
// This is from: unicode-12.1.0/General_Category/Symbol/regex.js
// IE11 does not support unicode flag, otherwise this is just /\p{S}/u.
// /^\p{S}/u
var CARET_S_UNICODE_REGEX = new RegExp("^".concat(regex_generated_1.S_UNICODE_REGEX.source));
// /\p{S}$/u
var S_DOLLAR_UNICODE_REGEX = new RegExp("".concat(regex_generated_1.S_UNICODE_REGEX.source, "$"));
var CLDR_NUMBER_PATTERN = /[#0](?:[\.,][#0]+)*/g;
function formatToParts(numberResult, data, pl, options) {
    var sign = numberResult.sign, exponent = numberResult.exponent, magnitude = numberResult.magnitude;
    var notation = options.notation, style = options.style, numberingSystem = options.numberingSystem;
    var defaultNumberingSystem = data.numbers.nu[0];
    // #region Part 1: partition and interpolate the CLDR number pattern.
    // ----------------------------------------------------------
    var compactNumberPattern = null;
    if (notation === 'compact' && magnitude) {
        compactNumberPattern = getCompactDisplayPattern(numberResult, pl, data, style, options.compactDisplay, options.currencyDisplay, numberingSystem);
    }
    // This is used multiple times
    var nonNameCurrencyPart;
    if (style === 'currency' && options.currencyDisplay !== 'name') {
        var byCurrencyDisplay = data.currencies[options.currency];
        if (byCurrencyDisplay) {
            switch (options.currencyDisplay) {
                case 'code':
                    nonNameCurrencyPart = options.currency;
                    break;
                case 'symbol':
                    nonNameCurrencyPart = byCurrencyDisplay.symbol;
                    break;
                default:
                    nonNameCurrencyPart = byCurrencyDisplay.narrow;
                    break;
            }
        }
        else {
            // Fallback for unknown currency
            nonNameCurrencyPart = options.currency;
        }
    }
    var numberPattern;
    if (!compactNumberPattern) {
        // Note: if the style is unit, or is currency and the currency display is name,
        // its unit parts will be interpolated in part 2. So here we can fallback to decimal.
        if (style === 'decimal' ||
            style === 'unit' ||
            (style === 'currency' && options.currencyDisplay === 'name')) {
            // Shortcut for decimal
            var decimalData = data.numbers.decimal[numberingSystem] ||
                data.numbers.decimal[defaultNumberingSystem];
            numberPattern = getPatternForSign(decimalData.standard, sign);
        }
        else if (style === 'currency') {
            var currencyData = data.numbers.currency[numberingSystem] ||
                data.numbers.currency[defaultNumberingSystem];
            // We replace number pattern part with `0` for easier postprocessing.
            numberPattern = getPatternForSign(currencyData[options.currencySign], sign);
        }
        else {
            // percent
            var percentPattern = data.numbers.percent[numberingSystem] ||
                data.numbers.percent[defaultNumberingSystem];
            numberPattern = getPatternForSign(percentPattern, sign);
        }
    }
    else {
        numberPattern = compactNumberPattern;
    }
    // Extract the decimal number pattern string. It looks like "#,##0,00", which will later be
    // used to infer decimal group sizes.
    var decimalNumberPattern = CLDR_NUMBER_PATTERN.exec(numberPattern)[0];
    // Now we start to substitute patterns
    // 1. replace strings like `0` and `#,##0.00` with `{0}`
    // 2. unquote characters (invariant: the quoted characters does not contain the special tokens)
    numberPattern = numberPattern
        .replace(CLDR_NUMBER_PATTERN, '{0}')
        .replace(/'(.)'/g, '$1');
    // Handle currency spacing (both compact and non-compact).
    if (style === 'currency' && options.currencyDisplay !== 'name') {
        var currencyData = data.numbers.currency[numberingSystem] ||
            data.numbers.currency[defaultNumberingSystem];
        // See `currencySpacing` substitution rule in TR-35.
        // Here we always assume the currencyMatch is "[:^S:]" and surroundingMatch is "[:digit:]".
        //
        // Example 1: for pattern "#,##0.00¤" with symbol "US$", we replace "¤" with the symbol,
        // but insert an extra non-break space before the symbol, because "[:^S:]" matches "U" in
        // "US$" and "[:digit:]" matches the latn numbering system digits.
        //
        // Example 2: for pattern "¤#,##0.00" with symbol "US$", there is no spacing between symbol
        // and number, because `$` does not match "[:^S:]".
        //
        // Implementation note: here we do the best effort to infer the insertion.
        // We also assume that `beforeInsertBetween` and `afterInsertBetween` will never be `;`.
        var afterCurrency = currencyData.currencySpacing.afterInsertBetween;
        if (afterCurrency && !S_DOLLAR_UNICODE_REGEX.test(nonNameCurrencyPart)) {
            numberPattern = numberPattern.replace('¤{0}', "\u00A4".concat(afterCurrency, "{0}"));
        }
        var beforeCurrency = currencyData.currencySpacing.beforeInsertBetween;
        if (beforeCurrency && !CARET_S_UNICODE_REGEX.test(nonNameCurrencyPart)) {
            numberPattern = numberPattern.replace('{0}¤', "{0}".concat(beforeCurrency, "\u00A4"));
        }
    }
    // The following tokens are special: `{0}`, `¤`, `%`, `-`, `+`, `{c:...}.
    var numberPatternParts = numberPattern.split(/({c:[^}]+}|\{0\}|[¤%\-\+])/g);
    var numberParts = [];
    var symbols = data.numbers.symbols[numberingSystem] ||
        data.numbers.symbols[defaultNumberingSystem];
    for (var _i = 0, numberPatternParts_1 = numberPatternParts; _i < numberPatternParts_1.length; _i++) {
        var part = numberPatternParts_1[_i];
        if (!part) {
            continue;
        }
        switch (part) {
            case '{0}': {
                // We only need to handle scientific and engineering notation here.
                numberParts.push.apply(numberParts, paritionNumberIntoParts(symbols, numberResult, notation, exponent, numberingSystem, 
                // If compact number pattern exists, do not insert group separators.
                !compactNumberPattern && Boolean(options.useGrouping), decimalNumberPattern, style));
                break;
            }
            case '-':
                numberParts.push({ type: 'minusSign', value: symbols.minusSign });
                break;
            case '+':
                numberParts.push({ type: 'plusSign', value: symbols.plusSign });
                break;
            case '%':
                numberParts.push({ type: 'percentSign', value: symbols.percentSign });
                break;
            case '¤':
                // Computed above when handling currency spacing.
                numberParts.push({ type: 'currency', value: nonNameCurrencyPart });
                break;
            default:
                if (/^\{c:/.test(part)) {
                    numberParts.push({
                        type: 'compact',
                        value: part.substring(3, part.length - 1),
                    });
                }
                else {
                    // literal
                    numberParts.push({ type: 'literal', value: part });
                }
                break;
        }
    }
    // #endregion
    // #region Part 2: interpolate unit pattern if necessary.
    // ----------------------------------------------
    switch (style) {
        case 'currency': {
            // `currencyDisplay: 'name'` has similar pattern handling as units.
            if (options.currencyDisplay === 'name') {
                var unitPattern = (data.numbers.currency[numberingSystem] ||
                    data.numbers.currency[defaultNumberingSystem]).unitPattern;
                // Select plural
                var unitName = void 0;
                var currencyNameData = data.currencies[options.currency];
                if (currencyNameData) {
                    unitName = selectPlural(pl, numberResult.roundedNumber * Math.pow(10, exponent), currencyNameData.displayName);
                }
                else {
                    // Fallback for unknown currency
                    unitName = options.currency;
                }
                // Do {0} and {1} substitution
                var unitPatternParts = unitPattern.split(/(\{[01]\})/g);
                var result = [];
                for (var _a = 0, unitPatternParts_1 = unitPatternParts; _a < unitPatternParts_1.length; _a++) {
                    var part = unitPatternParts_1[_a];
                    switch (part) {
                        case '{0}':
                            result.push.apply(result, numberParts);
                            break;
                        case '{1}':
                            result.push({ type: 'currency', value: unitName });
                            break;
                        default:
                            if (part) {
                                result.push({ type: 'literal', value: part });
                            }
                            break;
                    }
                }
                return result;
            }
            else {
                return numberParts;
            }
        }
        case 'unit': {
            var unit = options.unit, unitDisplay = options.unitDisplay;
            var unitData = data.units.simple[unit];
            var unitPattern = void 0;
            if (unitData) {
                // Simple unit pattern
                unitPattern = selectPlural(pl, numberResult.roundedNumber * Math.pow(10, exponent), data.units.simple[unit][unitDisplay]);
            }
            else {
                // See: http://unicode.org/reports/tr35/tr35-general.html#perUnitPatterns
                // If cannot find unit in the simple pattern, it must be "per" compound pattern.
                // Implementation note: we are not following TR-35 here because we need to format to parts!
                var _b = unit.split('-per-'), numeratorUnit = _b[0], denominatorUnit = _b[1];
                unitData = data.units.simple[numeratorUnit];
                var numeratorUnitPattern = selectPlural(pl, numberResult.roundedNumber * Math.pow(10, exponent), data.units.simple[numeratorUnit][unitDisplay]);
                var perUnitPattern = data.units.simple[denominatorUnit].perUnit[unitDisplay];
                if (perUnitPattern) {
                    // perUnitPattern exists, combine it with numeratorUnitPattern
                    unitPattern = perUnitPattern.replace('{0}', numeratorUnitPattern);
                }
                else {
                    // get compoundUnit pattern (e.g. "{0} per {1}"), repalce {0} with numerator pattern and {1} with
                    // the denominator pattern in singular form.
                    var perPattern = data.units.compound.per[unitDisplay];
                    var denominatorPattern = selectPlural(pl, 1, data.units.simple[denominatorUnit][unitDisplay]);
                    unitPattern = unitPattern = perPattern
                        .replace('{0}', numeratorUnitPattern)
                        .replace('{1}', denominatorPattern.replace('{0}', ''));
                }
            }
            var result = [];
            // We need spacing around "{0}" because they are not treated as "unit" parts, but "literal".
            for (var _c = 0, _d = unitPattern.split(/(\s*\{0\}\s*)/); _c < _d.length; _c++) {
                var part = _d[_c];
                var interpolateMatch = /^(\s*)\{0\}(\s*)$/.exec(part);
                if (interpolateMatch) {
                    // Space before "{0}"
                    if (interpolateMatch[1]) {
                        result.push({ type: 'literal', value: interpolateMatch[1] });
                    }
                    // "{0}" itself
                    result.push.apply(result, numberParts);
                    // Space after "{0}"
                    if (interpolateMatch[2]) {
                        result.push({ type: 'literal', value: interpolateMatch[2] });
                    }
                }
                else if (part) {
                    result.push({ type: 'unit', value: part });
                }
            }
            return result;
        }
        default:
            return numberParts;
    }
    // #endregion
}
// A subset of https://tc39.es/ecma402/#sec-partitionnotationsubpattern
// Plus the exponent parts handling.
function paritionNumberIntoParts(symbols, numberResult, notation, exponent, numberingSystem, useGrouping, 
/**
 * This is the decimal number pattern without signs or symbols.
 * It is used to infer the group size when `useGrouping` is true.
 *
 * A typical value looks like "#,##0.00" (primary group size is 3).
 * Some locales like Hindi has secondary group size of 2 (e.g. "#,##,##0.00").
 */
decimalNumberPattern, style) {
    var result = [];
    // eslint-disable-next-line prefer-const
    var n = numberResult.formattedString, x = numberResult.roundedNumber;
    if (isNaN(x)) {
        return [{ type: 'nan', value: n }];
    }
    else if (!isFinite(x)) {
        return [{ type: 'infinity', value: n }];
    }
    var digitReplacementTable = digit_mapping_generated_1.digitMapping[numberingSystem];
    if (digitReplacementTable) {
        n = n.replace(/\d/g, function (digit) { return digitReplacementTable[+digit] || digit; });
    }
    // TODO: Else use an implementation dependent algorithm to map n to the appropriate
    // representation of n in the given numbering system.
    var decimalSepIndex = n.indexOf('.');
    var integer;
    var fraction;
    if (decimalSepIndex > 0) {
        integer = n.slice(0, decimalSepIndex);
        fraction = n.slice(decimalSepIndex + 1);
    }
    else {
        integer = n;
    }
    // #region Grouping integer digits
    // The weird compact and x >= 10000 check is to ensure consistency with Node.js and Chrome.
    // Note that `de` does not have compact form for thousands, but Node.js does not insert grouping separator
    // unless the rounded number is greater than 10000:
    //   NumberFormat('de', {notation: 'compact', compactDisplay: 'short'}).format(1234) //=> "1234"
    //   NumberFormat('de').format(1234) //=> "1.234"
    if (useGrouping && (notation !== 'compact' || x >= 10000)) {
        // a. Let groupSepSymbol be the implementation-, locale-, and numbering system-dependent (ILND) String representing the grouping separator.
        // For currency we should use `currencyGroup` instead of generic `group`
        var groupSepSymbol = style === 'currency' && symbols.currencyGroup != null
            ? symbols.currencyGroup
            : symbols.group;
        var groups = [];
        // > There may be two different grouping sizes: The primary grouping size used for the least
        // > significant integer group, and the secondary grouping size used for more significant groups.
        // > If a pattern contains multiple grouping separators, the interval between the last one and the
        // > end of the integer defines the primary grouping size, and the interval between the last two
        // > defines the secondary grouping size. All others are ignored.
        var integerNumberPattern = decimalNumberPattern.split('.')[0];
        var patternGroups = integerNumberPattern.split(',');
        var primaryGroupingSize = 3;
        var secondaryGroupingSize = 3;
        if (patternGroups.length > 1) {
            primaryGroupingSize = patternGroups[patternGroups.length - 1].length;
        }
        if (patternGroups.length > 2) {
            secondaryGroupingSize = patternGroups[patternGroups.length - 2].length;
        }
        var i = integer.length - primaryGroupingSize;
        if (i > 0) {
            // Slice the least significant integer group
            groups.push(integer.slice(i, i + primaryGroupingSize));
            // Then iteratively push the more signicant groups
            // TODO: handle surrogate pairs in some numbering system digits
            for (i -= secondaryGroupingSize; i > 0; i -= secondaryGroupingSize) {
                groups.push(integer.slice(i, i + secondaryGroupingSize));
            }
            groups.push(integer.slice(0, i + secondaryGroupingSize));
        }
        else {
            groups.push(integer);
        }
        while (groups.length > 0) {
            var integerGroup = groups.pop();
            result.push({ type: 'integer', value: integerGroup });
            if (groups.length > 0) {
                result.push({ type: 'group', value: groupSepSymbol });
            }
        }
    }
    else {
        result.push({ type: 'integer', value: integer });
    }
    // #endregion
    if (fraction !== undefined) {
        var decimalSepSymbol = style === 'currency' && symbols.currencyDecimal != null
            ? symbols.currencyDecimal
            : symbols.decimal;
        result.push({ type: 'decimal', value: decimalSepSymbol }, { type: 'fraction', value: fraction });
    }
    if ((notation === 'scientific' || notation === 'engineering') &&
        isFinite(x)) {
        result.push({ type: 'exponentSeparator', value: symbols.exponential });
        if (exponent < 0) {
            result.push({ type: 'exponentMinusSign', value: symbols.minusSign });
            exponent = -exponent;
        }
        var exponentResult = (0, ToRawFixed_1.ToRawFixed)(exponent, 0, 0);
        result.push({
            type: 'exponentInteger',
            value: exponentResult.formattedString,
        });
    }
    return result;
}
function getPatternForSign(pattern, sign) {
    if (pattern.indexOf(';') < 0) {
        pattern = "".concat(pattern, ";-").concat(pattern);
    }
    var _a = pattern.split(';'), zeroPattern = _a[0], negativePattern = _a[1];
    switch (sign) {
        case 0:
            return zeroPattern;
        case -1:
            return negativePattern;
        default:
            return negativePattern.indexOf('-') >= 0
                ? negativePattern.replace(/-/g, '+')
                : "+".concat(zeroPattern);
    }
}
// Find the CLDR pattern for compact notation based on the magnitude of data and style.
//
// Example return value: "¤ {c:laki}000;¤{c:laki} -0" (`sw` locale):
// - Notice the `{c:...}` token that wraps the compact literal.
// - The consecutive zeros are normalized to single zero to match CLDR_NUMBER_PATTERN.
//
// Returning null means the compact display pattern cannot be found.
function getCompactDisplayPattern(numberResult, pl, data, style, compactDisplay, currencyDisplay, numberingSystem) {
    var _a;
    var roundedNumber = numberResult.roundedNumber, sign = numberResult.sign, magnitude = numberResult.magnitude;
    var magnitudeKey = String(Math.pow(10, magnitude));
    var defaultNumberingSystem = data.numbers.nu[0];
    var pattern;
    if (style === 'currency' && currencyDisplay !== 'name') {
        var byNumberingSystem = data.numbers.currency;
        var currencyData = byNumberingSystem[numberingSystem] ||
            byNumberingSystem[defaultNumberingSystem];
        // NOTE: compact notation ignores currencySign!
        var compactPluralRules = (_a = currencyData.short) === null || _a === void 0 ? void 0 : _a[magnitudeKey];
        if (!compactPluralRules) {
            return null;
        }
        pattern = selectPlural(pl, roundedNumber, compactPluralRules);
    }
    else {
        var byNumberingSystem = data.numbers.decimal;
        var byCompactDisplay = byNumberingSystem[numberingSystem] ||
            byNumberingSystem[defaultNumberingSystem];
        var compactPlaralRule = byCompactDisplay[compactDisplay][magnitudeKey];
        if (!compactPlaralRule) {
            return null;
        }
        pattern = selectPlural(pl, roundedNumber, compactPlaralRule);
    }
    // See https://unicode.org/reports/tr35/tr35-numbers.html#Compact_Number_Formats
    // > If the value is precisely “0”, either explicit or defaulted, then the normal number format
    // > pattern for that sort of object is supplied.
    if (pattern === '0') {
        return null;
    }
    pattern = getPatternForSign(pattern, sign)
        // Extract compact literal from the pattern
        .replace(/([^\s;\-\+\d¤]+)/g, '{c:$1}')
        // We replace one or more zeros with a single zero so it matches `CLDR_NUMBER_PATTERN`.
        .replace(/0+/, '0');
    return pattern;
}
function selectPlural(pl, x, rules) {
    return rules[pl.select(x)] || rules.other;
}

},{"../regex.generated":40,"./ToRawFixed":32,"./digit-mapping.generated":34}],36:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartitionPattern = PartitionPattern;
var utils_1 = require("./utils");
/**
 * https://tc39.es/ecma402/#sec-partitionpattern
 * @param pattern
 */
function PartitionPattern(pattern) {
    var result = [];
    var beginIndex = pattern.indexOf('{');
    var endIndex = 0;
    var nextIndex = 0;
    var length = pattern.length;
    while (beginIndex < pattern.length && beginIndex > -1) {
        endIndex = pattern.indexOf('}', beginIndex);
        (0, utils_1.invariant)(endIndex > beginIndex, "Invalid pattern ".concat(pattern));
        if (beginIndex > nextIndex) {
            result.push({
                type: 'literal',
                value: pattern.substring(nextIndex, beginIndex),
            });
        }
        result.push({
            type: pattern.substring(beginIndex + 1, endIndex),
            value: undefined,
        });
        nextIndex = endIndex + 1;
        beginIndex = pattern.indexOf('{', nextIndex);
    }
    if (nextIndex < length) {
        result.push({
            type: 'literal',
            value: pattern.substring(nextIndex, length),
        });
    }
    return result;
}

},{"./utils":47}],37:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupportedLocales = SupportedLocales;
var intl_localematcher_1 = require("@formatjs/intl-localematcher");
var _262_1 = require("./262");
var GetOption_1 = require("./GetOption");
/**
 * https://tc39.es/ecma402/#sec-supportedlocales
 * @param availableLocales
 * @param requestedLocales
 * @param options
 */
function SupportedLocales(availableLocales, requestedLocales, options) {
    var matcher = 'best fit';
    if (options !== undefined) {
        options = (0, _262_1.ToObject)(options);
        matcher = (0, GetOption_1.GetOption)(options, 'localeMatcher', 'string', ['lookup', 'best fit'], 'best fit');
    }
    if (matcher === 'best fit') {
        return (0, intl_localematcher_1.LookupSupportedLocales)(Array.from(availableLocales), requestedLocales);
    }
    return (0, intl_localematcher_1.LookupSupportedLocales)(Array.from(availableLocales), requestedLocales);
}

},{"./262":3,"./GetOption":9,"@formatjs/intl-localematcher":61}],38:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isMissingLocaleDataError = isMissingLocaleDataError;
var tslib_1 = require("tslib");
var MissingLocaleDataError = /** @class */ (function (_super) {
    tslib_1.__extends(MissingLocaleDataError, _super);
    function MissingLocaleDataError() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = 'MISSING_LOCALE_DATA';
        return _this;
    }
    return MissingLocaleDataError;
}(Error));
function isMissingLocaleDataError(e) {
    return e.type === 'MISSING_LOCALE_DATA';
}

},{"tslib":74}],39:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invariant = exports.createMemoizedPluralRules = exports.createMemoizedNumberFormat = exports.createMemoizedLocale = exports.createMemoizedListFormat = exports.createMemoizedDateTimeFormat = exports.isMissingLocaleDataError = exports.setMultiInternalSlots = exports.setInternalSlot = exports.isLiteralPart = exports.getMultiInternalSlots = exports.getMagnitude = exports.getInternalSlot = exports.defineProperty = exports.createDataProperty = exports._formatToParts = void 0;
var tslib_1 = require("tslib");
tslib_1.__exportStar(require("./CanonicalizeLocaleList"), exports);
tslib_1.__exportStar(require("./CanonicalizeTimeZoneName"), exports);
tslib_1.__exportStar(require("./CoerceOptionsToObject"), exports);
tslib_1.__exportStar(require("./GetNumberOption"), exports);
tslib_1.__exportStar(require("./GetOption"), exports);
tslib_1.__exportStar(require("./GetOptionsObject"), exports);
tslib_1.__exportStar(require("./GetStringOrBooleanOption"), exports);
tslib_1.__exportStar(require("./IsSanctionedSimpleUnitIdentifier"), exports);
tslib_1.__exportStar(require("./IsValidTimeZoneName"), exports);
tslib_1.__exportStar(require("./IsWellFormedCurrencyCode"), exports);
tslib_1.__exportStar(require("./IsWellFormedUnitIdentifier"), exports);
tslib_1.__exportStar(require("./NumberFormat/ApplyUnsignedRoundingMode"), exports);
tslib_1.__exportStar(require("./NumberFormat/CollapseNumberRange"), exports);
tslib_1.__exportStar(require("./NumberFormat/ComputeExponent"), exports);
tslib_1.__exportStar(require("./NumberFormat/ComputeExponentForMagnitude"), exports);
tslib_1.__exportStar(require("./NumberFormat/CurrencyDigits"), exports);
var format_to_parts_1 = require("./NumberFormat/format_to_parts");
Object.defineProperty(exports, "_formatToParts", { enumerable: true, get: function () { return tslib_1.__importDefault(format_to_parts_1).default; } });
tslib_1.__exportStar(require("./NumberFormat/FormatApproximately"), exports);
tslib_1.__exportStar(require("./NumberFormat/FormatNumericRange"), exports);
tslib_1.__exportStar(require("./NumberFormat/FormatNumericRangeToParts"), exports);
tslib_1.__exportStar(require("./NumberFormat/FormatNumericToParts"), exports);
tslib_1.__exportStar(require("./NumberFormat/FormatNumericToString"), exports);
tslib_1.__exportStar(require("./NumberFormat/GetUnsignedRoundingMode"), exports);
tslib_1.__exportStar(require("./NumberFormat/InitializeNumberFormat"), exports);
tslib_1.__exportStar(require("./NumberFormat/PartitionNumberPattern"), exports);
tslib_1.__exportStar(require("./NumberFormat/PartitionNumberRangePattern"), exports);
tslib_1.__exportStar(require("./NumberFormat/SetNumberFormatDigitOptions"), exports);
tslib_1.__exportStar(require("./NumberFormat/SetNumberFormatUnitOptions"), exports);
tslib_1.__exportStar(require("./NumberFormat/ToRawFixed"), exports);
tslib_1.__exportStar(require("./NumberFormat/ToRawPrecision"), exports);
tslib_1.__exportStar(require("./PartitionPattern"), exports);
tslib_1.__exportStar(require("./SupportedLocales"), exports);
var utils_1 = require("./utils");
Object.defineProperty(exports, "createDataProperty", { enumerable: true, get: function () { return utils_1.createDataProperty; } });
Object.defineProperty(exports, "defineProperty", { enumerable: true, get: function () { return utils_1.defineProperty; } });
Object.defineProperty(exports, "getInternalSlot", { enumerable: true, get: function () { return utils_1.getInternalSlot; } });
Object.defineProperty(exports, "getMagnitude", { enumerable: true, get: function () { return utils_1.getMagnitude; } });
Object.defineProperty(exports, "getMultiInternalSlots", { enumerable: true, get: function () { return utils_1.getMultiInternalSlots; } });
Object.defineProperty(exports, "isLiteralPart", { enumerable: true, get: function () { return utils_1.isLiteralPart; } });
Object.defineProperty(exports, "setInternalSlot", { enumerable: true, get: function () { return utils_1.setInternalSlot; } });
Object.defineProperty(exports, "setMultiInternalSlots", { enumerable: true, get: function () { return utils_1.setMultiInternalSlots; } });
tslib_1.__exportStar(require("./262"), exports);
var data_1 = require("./data");
Object.defineProperty(exports, "isMissingLocaleDataError", { enumerable: true, get: function () { return data_1.isMissingLocaleDataError; } });
tslib_1.__exportStar(require("./types/date-time"), exports);
tslib_1.__exportStar(require("./types/displaynames"), exports);
tslib_1.__exportStar(require("./types/list"), exports);
tslib_1.__exportStar(require("./types/number"), exports);
tslib_1.__exportStar(require("./types/plural-rules"), exports);
tslib_1.__exportStar(require("./types/relative-time"), exports);
var utils_2 = require("./utils");
Object.defineProperty(exports, "createMemoizedDateTimeFormat", { enumerable: true, get: function () { return utils_2.createMemoizedDateTimeFormat; } });
Object.defineProperty(exports, "createMemoizedListFormat", { enumerable: true, get: function () { return utils_2.createMemoizedListFormat; } });
Object.defineProperty(exports, "createMemoizedLocale", { enumerable: true, get: function () { return utils_2.createMemoizedLocale; } });
Object.defineProperty(exports, "createMemoizedNumberFormat", { enumerable: true, get: function () { return utils_2.createMemoizedNumberFormat; } });
Object.defineProperty(exports, "createMemoizedPluralRules", { enumerable: true, get: function () { return utils_2.createMemoizedPluralRules; } });
Object.defineProperty(exports, "invariant", { enumerable: true, get: function () { return utils_2.invariant; } });

},{"./262":3,"./CanonicalizeLocaleList":4,"./CanonicalizeTimeZoneName":5,"./CoerceOptionsToObject":6,"./GetNumberOption":8,"./GetOption":9,"./GetOptionsObject":10,"./GetStringOrBooleanOption":11,"./IsSanctionedSimpleUnitIdentifier":12,"./IsValidTimeZoneName":13,"./IsWellFormedCurrencyCode":14,"./IsWellFormedUnitIdentifier":15,"./NumberFormat/ApplyUnsignedRoundingMode":16,"./NumberFormat/CollapseNumberRange":17,"./NumberFormat/ComputeExponent":18,"./NumberFormat/ComputeExponentForMagnitude":19,"./NumberFormat/CurrencyDigits":20,"./NumberFormat/FormatApproximately":21,"./NumberFormat/FormatNumericRange":22,"./NumberFormat/FormatNumericRangeToParts":23,"./NumberFormat/FormatNumericToParts":24,"./NumberFormat/FormatNumericToString":25,"./NumberFormat/GetUnsignedRoundingMode":26,"./NumberFormat/InitializeNumberFormat":27,"./NumberFormat/PartitionNumberPattern":28,"./NumberFormat/PartitionNumberRangePattern":29,"./NumberFormat/SetNumberFormatDigitOptions":30,"./NumberFormat/SetNumberFormatUnitOptions":31,"./NumberFormat/ToRawFixed":32,"./NumberFormat/ToRawPrecision":33,"./NumberFormat/format_to_parts":35,"./PartitionPattern":36,"./SupportedLocales":37,"./data":38,"./types/date-time":41,"./types/displaynames":42,"./types/list":43,"./types/number":44,"./types/plural-rules":45,"./types/relative-time":46,"./utils":47,"tslib":74}],40:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.S_UNICODE_REGEX = void 0;
// @generated from regex-gen.ts
exports.S_UNICODE_REGEX = /[\$\+<->\^`\|~\xA2-\xA6\xA8\xA9\xAC\xAE-\xB1\xB4\xB8\xD7\xF7\u02C2-\u02C5\u02D2-\u02DF\u02E5-\u02EB\u02ED\u02EF-\u02FF\u0375\u0384\u0385\u03F6\u0482\u058D-\u058F\u0606-\u0608\u060B\u060E\u060F\u06DE\u06E9\u06FD\u06FE\u07F6\u07FE\u07FF\u09F2\u09F3\u09FA\u09FB\u0AF1\u0B70\u0BF3-\u0BFA\u0C7F\u0D4F\u0D79\u0E3F\u0F01-\u0F03\u0F13\u0F15-\u0F17\u0F1A-\u0F1F\u0F34\u0F36\u0F38\u0FBE-\u0FC5\u0FC7-\u0FCC\u0FCE\u0FCF\u0FD5-\u0FD8\u109E\u109F\u1390-\u1399\u166D\u17DB\u1940\u19DE-\u19FF\u1B61-\u1B6A\u1B74-\u1B7C\u1FBD\u1FBF-\u1FC1\u1FCD-\u1FCF\u1FDD-\u1FDF\u1FED-\u1FEF\u1FFD\u1FFE\u2044\u2052\u207A-\u207C\u208A-\u208C\u20A0-\u20BF\u2100\u2101\u2103-\u2106\u2108\u2109\u2114\u2116-\u2118\u211E-\u2123\u2125\u2127\u2129\u212E\u213A\u213B\u2140-\u2144\u214A-\u214D\u214F\u218A\u218B\u2190-\u2307\u230C-\u2328\u232B-\u2426\u2440-\u244A\u249C-\u24E9\u2500-\u2767\u2794-\u27C4\u27C7-\u27E5\u27F0-\u2982\u2999-\u29D7\u29DC-\u29FB\u29FE-\u2B73\u2B76-\u2B95\u2B97-\u2BFF\u2CE5-\u2CEA\u2E50\u2E51\u2E80-\u2E99\u2E9B-\u2EF3\u2F00-\u2FD5\u2FF0-\u2FFB\u3004\u3012\u3013\u3020\u3036\u3037\u303E\u303F\u309B\u309C\u3190\u3191\u3196-\u319F\u31C0-\u31E3\u3200-\u321E\u322A-\u3247\u3250\u3260-\u327F\u328A-\u32B0\u32C0-\u33FF\u4DC0-\u4DFF\uA490-\uA4C6\uA700-\uA716\uA720\uA721\uA789\uA78A\uA828-\uA82B\uA836-\uA839\uAA77-\uAA79\uAB5B\uAB6A\uAB6B\uFB29\uFBB2-\uFBC1\uFDFC\uFDFD\uFE62\uFE64-\uFE66\uFE69\uFF04\uFF0B\uFF1C-\uFF1E\uFF3E\uFF40\uFF5C\uFF5E\uFFE0-\uFFE6\uFFE8-\uFFEE\uFFFC\uFFFD]|\uD800[\uDD37-\uDD3F\uDD79-\uDD89\uDD8C-\uDD8E\uDD90-\uDD9C\uDDA0\uDDD0-\uDDFC]|\uD802[\uDC77\uDC78\uDEC8]|\uD805\uDF3F|\uD807[\uDFD5-\uDFF1]|\uD81A[\uDF3C-\uDF3F\uDF45]|\uD82F\uDC9C|\uD834[\uDC00-\uDCF5\uDD00-\uDD26\uDD29-\uDD64\uDD6A-\uDD6C\uDD83\uDD84\uDD8C-\uDDA9\uDDAE-\uDDE8\uDE00-\uDE41\uDE45\uDF00-\uDF56]|\uD835[\uDEC1\uDEDB\uDEFB\uDF15\uDF35\uDF4F\uDF6F\uDF89\uDFA9\uDFC3]|\uD836[\uDC00-\uDDFF\uDE37-\uDE3A\uDE6D-\uDE74\uDE76-\uDE83\uDE85\uDE86]|\uD838[\uDD4F\uDEFF]|\uD83B[\uDCAC\uDCB0\uDD2E\uDEF0\uDEF1]|\uD83C[\uDC00-\uDC2B\uDC30-\uDC93\uDCA0-\uDCAE\uDCB1-\uDCBF\uDCC1-\uDCCF\uDCD1-\uDCF5\uDD0D-\uDDAD\uDDE6-\uDE02\uDE10-\uDE3B\uDE40-\uDE48\uDE50\uDE51\uDE60-\uDE65\uDF00-\uDFFF]|\uD83D[\uDC00-\uDED7\uDEE0-\uDEEC\uDEF0-\uDEFC\uDF00-\uDF73\uDF80-\uDFD8\uDFE0-\uDFEB]|\uD83E[\uDC00-\uDC0B\uDC10-\uDC47\uDC50-\uDC59\uDC60-\uDC87\uDC90-\uDCAD\uDCB0\uDCB1\uDD00-\uDD78\uDD7A-\uDDCB\uDDCD-\uDE53\uDE60-\uDE6D\uDE70-\uDE74\uDE78-\uDE7A\uDE80-\uDE86\uDE90-\uDEA8\uDEB0-\uDEB6\uDEC0-\uDEC2\uDED0-\uDED6\uDF00-\uDF92\uDF94-\uDFCA]/;

},{}],41:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RangePatternType = void 0;
var RangePatternType;
(function (RangePatternType) {
    RangePatternType["startRange"] = "startRange";
    RangePatternType["shared"] = "shared";
    RangePatternType["endRange"] = "endRange";
})(RangePatternType || (exports.RangePatternType = RangePatternType = {}));

},{}],42:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],43:[function(require,module,exports){
arguments[4][42][0].apply(exports,arguments)
},{"dup":42}],44:[function(require,module,exports){
arguments[4][42][0].apply(exports,arguments)
},{"dup":42}],45:[function(require,module,exports){
arguments[4][42][0].apply(exports,arguments)
},{"dup":42}],46:[function(require,module,exports){
arguments[4][42][0].apply(exports,arguments)
},{"dup":42}],47:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMemoizedListFormat = exports.createMemoizedLocale = exports.createMemoizedPluralRules = exports.createMemoizedDateTimeFormat = exports.createMemoizedNumberFormat = exports.UNICODE_EXTENSION_SEQUENCE_REGEX = void 0;
exports.getMagnitude = getMagnitude;
exports.repeat = repeat;
exports.setInternalSlot = setInternalSlot;
exports.setMultiInternalSlots = setMultiInternalSlots;
exports.getInternalSlot = getInternalSlot;
exports.getMultiInternalSlots = getMultiInternalSlots;
exports.isLiteralPart = isLiteralPart;
exports.defineProperty = defineProperty;
exports.createDataProperty = createDataProperty;
exports.invariant = invariant;
var tslib_1 = require("tslib");
var fast_memoize_1 = require("@formatjs/fast-memoize");
/**
 * Cannot do Math.log(x) / Math.log(10) bc if IEEE floating point issue
 * @param x number
 */
function getMagnitude(x) {
    // Cannot count string length via Number.toString because it may use scientific notation
    // for very small or very large numbers.
    return Math.floor(Math.log(x) * Math.LOG10E);
}
function repeat(s, times) {
    if (typeof s.repeat === 'function') {
        return s.repeat(times);
    }
    var arr = new Array(times);
    for (var i = 0; i < arr.length; i++) {
        arr[i] = s;
    }
    return arr.join('');
}
function setInternalSlot(map, pl, field, value) {
    if (!map.get(pl)) {
        map.set(pl, Object.create(null));
    }
    var slots = map.get(pl);
    slots[field] = value;
}
function setMultiInternalSlots(map, pl, props) {
    for (var _i = 0, _a = Object.keys(props); _i < _a.length; _i++) {
        var k = _a[_i];
        setInternalSlot(map, pl, k, props[k]);
    }
}
function getInternalSlot(map, pl, field) {
    return getMultiInternalSlots(map, pl, field)[field];
}
function getMultiInternalSlots(map, pl) {
    var fields = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        fields[_i - 2] = arguments[_i];
    }
    var slots = map.get(pl);
    if (!slots) {
        throw new TypeError("".concat(pl, " InternalSlot has not been initialized"));
    }
    return fields.reduce(function (all, f) {
        all[f] = slots[f];
        return all;
    }, Object.create(null));
}
function isLiteralPart(patternPart) {
    return patternPart.type === 'literal';
}
/*
  17 ECMAScript Standard Built-in Objects:
    Every built-in Function object, including constructors, that is not
    identified as an anonymous function has a name property whose value
    is a String.

    Unless otherwise specified, the name property of a built-in Function
    object, if it exists, has the attributes { [[Writable]]: false,
    [[Enumerable]]: false, [[Configurable]]: true }.
*/
function defineProperty(target, name, _a) {
    var value = _a.value;
    Object.defineProperty(target, name, {
        configurable: true,
        enumerable: false,
        writable: true,
        value: value,
    });
}
/**
 * 7.3.5 CreateDataProperty
 * @param target
 * @param name
 * @param value
 */
function createDataProperty(target, name, value) {
    Object.defineProperty(target, name, {
        configurable: true,
        enumerable: true,
        writable: true,
        value: value,
    });
}
exports.UNICODE_EXTENSION_SEQUENCE_REGEX = /-u(?:-[0-9a-z]{2,8})+/gi;
function invariant(condition, message, Err) {
    if (Err === void 0) { Err = Error; }
    if (!condition) {
        throw new Err(message);
    }
}
exports.createMemoizedNumberFormat = (0, fast_memoize_1.memoize)(function () {
    var _a;
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return new ((_a = Intl.NumberFormat).bind.apply(_a, tslib_1.__spreadArray([void 0], args, false)))();
}, {
    strategy: fast_memoize_1.strategies.variadic,
});
exports.createMemoizedDateTimeFormat = (0, fast_memoize_1.memoize)(function () {
    var _a;
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return new ((_a = Intl.DateTimeFormat).bind.apply(_a, tslib_1.__spreadArray([void 0], args, false)))();
}, {
    strategy: fast_memoize_1.strategies.variadic,
});
exports.createMemoizedPluralRules = (0, fast_memoize_1.memoize)(function () {
    var _a;
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return new ((_a = Intl.PluralRules).bind.apply(_a, tslib_1.__spreadArray([void 0], args, false)))();
}, {
    strategy: fast_memoize_1.strategies.variadic,
});
exports.createMemoizedLocale = (0, fast_memoize_1.memoize)(function () {
    var _a;
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return new ((_a = Intl.Locale).bind.apply(_a, tslib_1.__spreadArray([void 0], args, false)))();
}, {
    strategy: fast_memoize_1.strategies.variadic,
});
exports.createMemoizedListFormat = (0, fast_memoize_1.memoize)(function () {
    var _a;
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return new ((_a = Intl.ListFormat).bind.apply(_a, tslib_1.__spreadArray([void 0], args, false)))();
}, {
    strategy: fast_memoize_1.strategies.variadic,
});

},{"@formatjs/fast-memoize":1,"tslib":74}],48:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BestAvailableLocale = BestAvailableLocale;
/**
 * https://tc39.es/ecma402/#sec-bestavailablelocale
 * @param availableLocales
 * @param locale
 */
function BestAvailableLocale(availableLocales, locale) {
    var candidate = locale;
    while (true) {
        if (availableLocales.indexOf(candidate) > -1) {
            return candidate;
        }
        var pos = candidate.lastIndexOf('-');
        if (!~pos) {
            return undefined;
        }
        if (pos >= 2 && candidate[pos - 2] === '-') {
            pos -= 2;
        }
        candidate = candidate.slice(0, pos);
    }
}

},{}],49:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BestFitMatcher = BestFitMatcher;
var utils_1 = require("./utils");
/**
 * https://tc39.es/ecma402/#sec-bestfitmatcher
 * @param availableLocales
 * @param requestedLocales
 * @param getDefaultLocale
 */
function BestFitMatcher(availableLocales, requestedLocales, getDefaultLocale) {
    var foundLocale;
    var extension;
    var noExtensionLocales = [];
    var noExtensionLocaleMap = requestedLocales.reduce(function (all, l) {
        var noExtensionLocale = l.replace(utils_1.UNICODE_EXTENSION_SEQUENCE_REGEX, '');
        noExtensionLocales.push(noExtensionLocale);
        all[noExtensionLocale] = l;
        return all;
    }, {});
    var result = (0, utils_1.findBestMatch)(noExtensionLocales, availableLocales);
    if (result.matchedSupportedLocale && result.matchedDesiredLocale) {
        foundLocale = result.matchedSupportedLocale;
        extension =
            noExtensionLocaleMap[result.matchedDesiredLocale].slice(result.matchedDesiredLocale.length) || undefined;
    }
    if (!foundLocale) {
        return { locale: getDefaultLocale() };
    }
    return {
        locale: foundLocale,
        extension: extension,
    };
}

},{"./utils":60}],50:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanonicalizeLocaleList = CanonicalizeLocaleList;
/**
 * http://ecma-international.org/ecma-402/7.0/index.html#sec-canonicalizelocalelist
 * @param locales
 */
function CanonicalizeLocaleList(locales) {
    return Intl.getCanonicalLocales(locales);
}

},{}],51:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanonicalizeUValue = CanonicalizeUValue;
var utils_1 = require("./utils");
function CanonicalizeUValue(ukey, uvalue) {
    // TODO: Implement algorithm for CanonicalizeUValue per https://tc39.es/ecma402/#sec-canonicalizeuvalue
    var lowerValue = uvalue.toLowerCase();
    (0, utils_1.invariant)(ukey !== undefined, "ukey must be defined");
    var canonicalized = lowerValue;
    return canonicalized;
}

},{"./utils":60}],52:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanonicalizeUnicodeLocaleId = CanonicalizeUnicodeLocaleId;
function CanonicalizeUnicodeLocaleId(locale) {
    return Intl.getCanonicalLocales(locale)[0];
}

},{}],53:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsertUnicodeExtensionAndCanonicalize = InsertUnicodeExtensionAndCanonicalize;
var CanonicalizeUnicodeLocaleId_1 = require("./CanonicalizeUnicodeLocaleId");
var utils_1 = require("./utils");
function InsertUnicodeExtensionAndCanonicalize(locale, attributes, keywords) {
    (0, utils_1.invariant)(locale.indexOf('-u-') === -1, 'Expected locale to not have a Unicode locale extension');
    var extension = '-u';
    for (var _i = 0, attributes_1 = attributes; _i < attributes_1.length; _i++) {
        var attr = attributes_1[_i];
        extension += "-".concat(attr);
    }
    for (var _a = 0, keywords_1 = keywords; _a < keywords_1.length; _a++) {
        var kw = keywords_1[_a];
        var key = kw.key, value = kw.value;
        extension += "-".concat(key);
        if (value !== '') {
            extension += "-".concat(value);
        }
    }
    if (extension === '-u') {
        return (0, CanonicalizeUnicodeLocaleId_1.CanonicalizeUnicodeLocaleId)(locale);
    }
    var privateIndex = locale.indexOf('-x-');
    var newLocale;
    if (privateIndex === -1) {
        newLocale = locale + extension;
    }
    else {
        var preExtension = locale.slice(0, privateIndex);
        var postExtension = locale.slice(privateIndex);
        newLocale = preExtension + extension + postExtension;
    }
    return (0, CanonicalizeUnicodeLocaleId_1.CanonicalizeUnicodeLocaleId)(newLocale);
}

},{"./CanonicalizeUnicodeLocaleId":52,"./utils":60}],54:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LookupMatcher = LookupMatcher;
var BestAvailableLocale_1 = require("./BestAvailableLocale");
var utils_1 = require("./utils");
/**
 * https://tc39.es/ecma402/#sec-lookupmatcher
 * @param availableLocales
 * @param requestedLocales
 * @param getDefaultLocale
 */
function LookupMatcher(availableLocales, requestedLocales, getDefaultLocale) {
    var result = { locale: '' };
    for (var _i = 0, requestedLocales_1 = requestedLocales; _i < requestedLocales_1.length; _i++) {
        var locale = requestedLocales_1[_i];
        var noExtensionLocale = locale.replace(utils_1.UNICODE_EXTENSION_SEQUENCE_REGEX, '');
        var availableLocale = (0, BestAvailableLocale_1.BestAvailableLocale)(availableLocales, noExtensionLocale);
        if (availableLocale) {
            result.locale = availableLocale;
            if (locale !== noExtensionLocale) {
                result.extension = locale.slice(noExtensionLocale.length, locale.length);
            }
            return result;
        }
    }
    result.locale = getDefaultLocale();
    return result;
}

},{"./BestAvailableLocale":48,"./utils":60}],55:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LookupSupportedLocales = LookupSupportedLocales;
var BestAvailableLocale_1 = require("./BestAvailableLocale");
var utils_1 = require("./utils");
/**
 * https://tc39.es/ecma402/#sec-lookupsupportedlocales
 * @param availableLocales
 * @param requestedLocales
 */
function LookupSupportedLocales(availableLocales, requestedLocales) {
    var subset = [];
    for (var _i = 0, requestedLocales_1 = requestedLocales; _i < requestedLocales_1.length; _i++) {
        var locale = requestedLocales_1[_i];
        var noExtensionLocale = locale.replace(utils_1.UNICODE_EXTENSION_SEQUENCE_REGEX, '');
        var availableLocale = (0, BestAvailableLocale_1.BestAvailableLocale)(availableLocales, noExtensionLocale);
        if (availableLocale) {
            subset.push(availableLocale);
        }
    }
    return subset;
}

},{"./BestAvailableLocale":48,"./utils":60}],56:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResolveLocale = ResolveLocale;
var BestFitMatcher_1 = require("./BestFitMatcher");
var CanonicalizeUValue_1 = require("./CanonicalizeUValue");
var InsertUnicodeExtensionAndCanonicalize_1 = require("./InsertUnicodeExtensionAndCanonicalize");
var LookupMatcher_1 = require("./LookupMatcher");
var UnicodeExtensionComponents_1 = require("./UnicodeExtensionComponents");
var utils_1 = require("./utils");
/**
 * https://tc39.es/ecma402/#sec-resolvelocale
 */
function ResolveLocale(availableLocales, requestedLocales, options, relevantExtensionKeys, localeData, getDefaultLocale) {
    var _a;
    var matcher = options.localeMatcher;
    var r;
    if (matcher === 'lookup') {
        r = (0, LookupMatcher_1.LookupMatcher)(Array.from(availableLocales), requestedLocales, getDefaultLocale);
    }
    else {
        r = (0, BestFitMatcher_1.BestFitMatcher)(Array.from(availableLocales), requestedLocales, getDefaultLocale);
    }
    if (r == null) {
        r = {
            locale: getDefaultLocale(),
            extension: '',
        };
    }
    var foundLocale = r.locale;
    var foundLocaleData = localeData[foundLocale];
    // TODO: We can't really guarantee that the locale data is available
    // invariant(
    //   foundLocaleData !== undefined,
    //   `Missing locale data for ${foundLocale}`
    // )
    var result = { locale: 'en', dataLocale: foundLocale };
    var components;
    var keywords;
    if (r.extension) {
        components = (0, UnicodeExtensionComponents_1.UnicodeExtensionComponents)(r.extension);
        keywords = components.keywords;
    }
    else {
        keywords = [];
    }
    var supportedKeywords = [];
    var _loop_1 = function (key) {
        // TODO: Shouldn't default to empty array, see TODO above
        var keyLocaleData = (_a = foundLocaleData === null || foundLocaleData === void 0 ? void 0 : foundLocaleData[key]) !== null && _a !== void 0 ? _a : [];
        (0, utils_1.invariant)(Array.isArray(keyLocaleData), "keyLocaleData for ".concat(key, " must be an array"));
        var value = keyLocaleData[0];
        (0, utils_1.invariant)(value === undefined || typeof value === 'string', "value must be a string or undefined");
        var supportedKeyword = void 0;
        var entry = keywords.find(function (k) { return k.key === key; });
        if (entry) {
            var requestedValue = entry.value;
            if (requestedValue !== '') {
                if (keyLocaleData.indexOf(requestedValue) > -1) {
                    value = requestedValue;
                    supportedKeyword = {
                        key: key,
                        value: value,
                    };
                }
            }
            else if (keyLocaleData.indexOf('true') > -1) {
                value = 'true';
                supportedKeyword = {
                    key: key,
                    value: value,
                };
            }
        }
        var optionsValue = options[key];
        (0, utils_1.invariant)(optionsValue == null || typeof optionsValue === 'string', "optionsValue must be a string or undefined");
        if (typeof optionsValue === 'string') {
            var ukey = key.toLowerCase();
            optionsValue = (0, CanonicalizeUValue_1.CanonicalizeUValue)(ukey, optionsValue);
            if (optionsValue === '') {
                optionsValue = 'true';
            }
        }
        if (optionsValue !== value && keyLocaleData.indexOf(optionsValue) > -1) {
            value = optionsValue;
            supportedKeyword = undefined;
        }
        if (supportedKeyword) {
            supportedKeywords.push(supportedKeyword);
        }
        result[key] = value;
    };
    for (var _i = 0, relevantExtensionKeys_1 = relevantExtensionKeys; _i < relevantExtensionKeys_1.length; _i++) {
        var key = relevantExtensionKeys_1[_i];
        _loop_1(key);
    }
    var supportedAttributes = [];
    if (supportedKeywords.length > 0) {
        supportedAttributes = [];
        foundLocale = (0, InsertUnicodeExtensionAndCanonicalize_1.InsertUnicodeExtensionAndCanonicalize)(foundLocale, supportedAttributes, supportedKeywords);
    }
    result.locale = foundLocale;
    return result;
}

},{"./BestFitMatcher":49,"./CanonicalizeUValue":51,"./InsertUnicodeExtensionAndCanonicalize":53,"./LookupMatcher":54,"./UnicodeExtensionComponents":57,"./utils":60}],57:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnicodeExtensionComponents = UnicodeExtensionComponents;
var utils_1 = require("./utils");
function UnicodeExtensionComponents(extension) {
    (0, utils_1.invariant)(extension === extension.toLowerCase(), 'Expected extension to be lowercase');
    (0, utils_1.invariant)(extension.slice(0, 3) === '-u-', 'Expected extension to be a Unicode locale extension');
    var attributes = [];
    var keywords = [];
    var keyword;
    var size = extension.length;
    var k = 3;
    while (k < size) {
        var e = extension.indexOf('-', k);
        var len = void 0;
        if (e === -1) {
            len = size - k;
        }
        else {
            len = e - k;
        }
        var subtag = extension.slice(k, k + len);
        (0, utils_1.invariant)(len >= 2, 'Expected a subtag to have at least 2 characters');
        if (keyword === undefined && len != 2) {
            if (attributes.indexOf(subtag) === -1) {
                attributes.push(subtag);
            }
        }
        else if (len === 2) {
            keyword = { key: subtag, value: '' };
            if (keywords.find(function (k) { return k.key === (keyword === null || keyword === void 0 ? void 0 : keyword.key); }) === undefined) {
                keywords.push(keyword);
            }
        }
        else if ((keyword === null || keyword === void 0 ? void 0 : keyword.value) === '') {
            keyword.value = subtag;
        }
        else {
            (0, utils_1.invariant)(keyword !== undefined, 'Expected keyword to be defined');
            keyword.value += '-' + subtag;
        }
        k += len + 1;
    }
    return { attributes: attributes, keywords: keywords };
}

},{"./utils":60}],58:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.data = void 0;
exports.data = {
    supplemental: {
        languageMatching: {
            'written-new': [
                {
                    paradigmLocales: {
                        _locales: 'en en_GB es es_419 pt_BR pt_PT',
                    },
                },
                {
                    $enUS: {
                        _value: 'AS+CA+GU+MH+MP+PH+PR+UM+US+VI',
                    },
                },
                {
                    $cnsar: {
                        _value: 'HK+MO',
                    },
                },
                {
                    $americas: {
                        _value: '019',
                    },
                },
                {
                    $maghreb: {
                        _value: 'MA+DZ+TN+LY+MR+EH',
                    },
                },
                {
                    no: {
                        _desired: 'nb',
                        _distance: '1',
                    },
                },
                {
                    bs: {
                        _desired: 'hr',
                        _distance: '4',
                    },
                },
                {
                    bs: {
                        _desired: 'sh',
                        _distance: '4',
                    },
                },
                {
                    hr: {
                        _desired: 'sh',
                        _distance: '4',
                    },
                },
                {
                    sr: {
                        _desired: 'sh',
                        _distance: '4',
                    },
                },
                {
                    aa: {
                        _desired: 'ssy',
                        _distance: '4',
                    },
                },
                {
                    de: {
                        _desired: 'gsw',
                        _distance: '4',
                        _oneway: 'true',
                    },
                },
                {
                    de: {
                        _desired: 'lb',
                        _distance: '4',
                        _oneway: 'true',
                    },
                },
                {
                    no: {
                        _desired: 'da',
                        _distance: '8',
                    },
                },
                {
                    nb: {
                        _desired: 'da',
                        _distance: '8',
                    },
                },
                {
                    ru: {
                        _desired: 'ab',
                        _distance: '30',
                        _oneway: 'true',
                    },
                },
                {
                    en: {
                        _desired: 'ach',
                        _distance: '30',
                        _oneway: 'true',
                    },
                },
                {
                    nl: {
                        _desired: 'af',
                        _distance: '20',
                        _oneway: 'true',
                    },
                },
                {
                    en: {
                        _desired: 'ak',
                        _distance: '30',
                        _oneway: 'true',
                    },
                },
                {
                    en: {
                        _desired: 'am',
                        _distance: '30',
                        _oneway: 'true',
                    },
                },
                {
                    es: {
                        _desired: 'ay',
                        _distance: '20',
                        _oneway: 'true',
                    },
                },
                {
                    ru: {
                        _desired: 'az',
                        _distance: '30',
                        _oneway: 'true',
                    },
                },
                {
                    ur: {
                        _desired: 'bal',
                        _distance: '20',
                        _oneway: 'true',
                    },
                },
                {
                    ru: {
                        _desired: 'be',
                        _distance: '20',
                        _oneway: 'true',
                    },
                },
                {
                    en: {
                        _desired: 'bem',
                        _distance: '30',
                        _oneway: 'true',
                    },
                },
                {
                    hi: {
                        _desired: 'bh',
                        _distance: '30',
                        _oneway: 'true',
                    },
                },
                {
                    en: {
                        _desired: 'bn',
                        _distance: '30',
                        _oneway: 'true',
                    },
                },
                {
                    zh: {
                        _desired: 'bo',
                        _distance: '20',
                        _oneway: 'true',
                    },
                },
                {
                    fr: {
                        _desired: 'br',
                        _distance: '20',
                        _oneway: 'true',
                    },
                },
                {
                    es: {
                        _desired: 'ca',
                        _distance: '20',
                        _oneway: 'true',
                    },
                },
                {
                    fil: {
                        _desired: 'ceb',
                        _distance: '30',
                        _oneway: 'true',
                    },
                },
                {
                    en: {
                        _desired: 'chr',
                        _distance: '20',
                        _oneway: 'true',
                    },
                },
                {
                    ar: {
                        _desired: 'ckb',
                        _distance: '30',
                        _oneway: 'true',
                    },
                },
                {
                    fr: {
                        _desired: 'co',
                        _distance: '20',
                        _oneway: 'true',
                    },
                },
                {
                    fr: {
                        _desired: 'crs',
                        _distance: '20',
                        _oneway: 'true',
                    },
                },
                {
                    sk: {
                        _desired: 'cs',
                        _distance: '20',
                    },
                },
                {
                    en: {
                        _desired: 'cy',
                        _distance: '20',
                        _oneway: 'true',
                    },
                },
                {
                    en: {
                        _desired: 'ee',
                        _distance: '30',
                        _oneway: 'true',
                    },
                },
                {
                    en: {
                        _desired: 'eo',
                        _distance: '30',
                        _oneway: 'true',
                    },
                },
                {
                    es: {
                        _desired: 'eu',
                        _distance: '20',
                        _oneway: 'true',
                    },
                },
                {
                    da: {
                        _desired: 'fo',
                        _distance: '20',
                        _oneway: 'true',
                    },
                },
                {
                    nl: {
                        _desired: 'fy',
                        _distance: '20',
                        _oneway: 'true',
                    },
                },
                {
                    en: {
                        _desired: 'ga',
                        _distance: '20',
                        _oneway: 'true',
                    },
                },
                {
                    en: {
                        _desired: 'gaa',
                        _distance: '30',
                        _oneway: 'true',
                    },
                },
                {
                    en: {
                        _desired: 'gd',
                        _distance: '20',
                        _oneway: 'true',
                    },
                },
                {
                    es: {
                        _desired: 'gl',
                        _distance: '20',
                        _oneway: 'true',
                    },
                },
                {
                    es: {
                        _desired: 'gn',
                        _distance: '20',
                        _oneway: 'true',
                    },
                },
                {
                    hi: {
                        _desired: 'gu',
                        _distance: '30',
                        _oneway: 'true',
                    },
                },
                {
                    en: {
                        _desired: 'ha',
                        _distance: '30',
                        _oneway: 'true',
                    },
                },
                {
                    en: {
                        _desired: 'haw',
                        _distance: '20',
                        _oneway: 'true',
                    },
                },
                {
                    fr: {
                        _desired: 'ht',
                        _distance: '20',
                        _oneway: 'true',
                    },
                },
                {
                    ru: {
                        _desired: 'hy',
                        _distance: '30',
                        _oneway: 'true',
                    },
                },
                {
                    en: {
                        _desired: 'ia',
                        _distance: '30',
                        _oneway: 'true',
                    },
                },
                {
                    en: {
                        _desired: 'ig',
                        _distance: '30',
                        _oneway: 'true',
                    },
                },
                {
                    en: {
                        _desired: 'is',
                        _distance: '20',
                        _oneway: 'true',
                    },
                },
                {
                    id: {
                        _desired: 'jv',
                        _distance: '20',
                        _oneway: 'true',
                    },
                },
                {
                    en: {
                        _desired: 'ka',
                        _distance: '30',
                        _oneway: 'true',
                    },
                },
                {
                    fr: {
                        _desired: 'kg',
                        _distance: '30',
                        _oneway: 'true',
                    },
                },
                {
                    ru: {
                        _desired: 'kk',
                        _distance: '30',
                        _oneway: 'true',
                    },
                },
                {
                    en: {
                        _desired: 'km',
                        _distance: '30',
                        _oneway: 'true',
                    },
                },
                {
                    en: {
                        _desired: 'kn',
                        _distance: '30',
                        _oneway: 'true',
                    },
                },
                {
                    en: {
                        _desired: 'kri',
                        _distance: '30',
                        _oneway: 'true',
                    },
                },
                {
                    tr: {
                        _desired: 'ku',
                        _distance: '30',
                        _oneway: 'true',
                    },
                },
                {
                    ru: {
                        _desired: 'ky',
                        _distance: '30',
                        _oneway: 'true',
                    },
                },
                {
                    it: {
                        _desired: 'la',
                        _distance: '20',
                        _oneway: 'true',
                    },
                },
                {
                    en: {
                        _desired: 'lg',
                        _distance: '30',
                        _oneway: 'true',
                    },
                },
                {
                    fr: {
                        _desired: 'ln',
                        _distance: '30',
                        _oneway: 'true',
                    },
                },
                {
                    en: {
                        _desired: 'lo',
                        _distance: '30',
                        _oneway: 'true',
                    },
                },
                {
                    en: {
                        _desired: 'loz',
                        _distance: '30',
                        _oneway: 'true',
                    },
                },
                {
                    fr: {
                        _desired: 'lua',
                        _distance: '30',
                        _oneway: 'true',
                    },
                },
                {
                    hi: {
                        _desired: 'mai',
                        _distance: '20',
                        _oneway: 'true',
                    },
                },
                {
                    en: {
                        _desired: 'mfe',
                        _distance: '30',
                        _oneway: 'true',
                    },
                },
                {
                    fr: {
                        _desired: 'mg',
                        _distance: '30',
                        _oneway: 'true',
                    },
                },
                {
                    en: {
                        _desired: 'mi',
                        _distance: '20',
                        _oneway: 'true',
                    },
                },
                {
                    en: {
                        _desired: 'ml',
                        _distance: '30',
                        _oneway: 'true',
                    },
                },
                {
                    ru: {
                        _desired: 'mn',
                        _distance: '30',
                        _oneway: 'true',
                    },
                },
                {
                    hi: {
                        _desired: 'mr',
                        _distance: '30',
                        _oneway: 'true',
                    },
                },
                {
                    id: {
                        _desired: 'ms',
                        _distance: '30',
                        _oneway: 'true',
                    },
                },
                {
                    en: {
                        _desired: 'mt',
                        _distance: '30',
                        _oneway: 'true',
                    },
                },
                {
                    en: {
                        _desired: 'my',
                        _distance: '30',
                        _oneway: 'true',
                    },
                },
                {
                    en: {
                        _desired: 'ne',
                        _distance: '30',
                        _oneway: 'true',
                    },
                },
                {
                    nb: {
                        _desired: 'nn',
                        _distance: '20',
                    },
                },
                {
                    no: {
                        _desired: 'nn',
                        _distance: '20',
                    },
                },
                {
                    en: {
                        _desired: 'nso',
                        _distance: '30',
                        _oneway: 'true',
                    },
                },
                {
                    en: {
                        _desired: 'ny',
                        _distance: '30',
                        _oneway: 'true',
                    },
                },
                {
                    en: {
                        _desired: 'nyn',
                        _distance: '30',
                        _oneway: 'true',
                    },
                },
                {
                    fr: {
                        _desired: 'oc',
                        _distance: '20',
                        _oneway: 'true',
                    },
                },
                {
                    en: {
                        _desired: 'om',
                        _distance: '30',
                        _oneway: 'true',
                    },
                },
                {
                    en: {
                        _desired: 'or',
                        _distance: '30',
                        _oneway: 'true',
                    },
                },
                {
                    en: {
                        _desired: 'pa',
                        _distance: '30',
                        _oneway: 'true',
                    },
                },
                {
                    en: {
                        _desired: 'pcm',
                        _distance: '20',
                        _oneway: 'true',
                    },
                },
                {
                    en: {
                        _desired: 'ps',
                        _distance: '30',
                        _oneway: 'true',
                    },
                },
                {
                    es: {
                        _desired: 'qu',
                        _distance: '30',
                        _oneway: 'true',
                    },
                },
                {
                    de: {
                        _desired: 'rm',
                        _distance: '20',
                        _oneway: 'true',
                    },
                },
                {
                    en: {
                        _desired: 'rn',
                        _distance: '30',
                        _oneway: 'true',
                    },
                },
                {
                    fr: {
                        _desired: 'rw',
                        _distance: '30',
                        _oneway: 'true',
                    },
                },
                {
                    hi: {
                        _desired: 'sa',
                        _distance: '30',
                        _oneway: 'true',
                    },
                },
                {
                    en: {
                        _desired: 'sd',
                        _distance: '30',
                        _oneway: 'true',
                    },
                },
                {
                    en: {
                        _desired: 'si',
                        _distance: '30',
                        _oneway: 'true',
                    },
                },
                {
                    en: {
                        _desired: 'sn',
                        _distance: '30',
                        _oneway: 'true',
                    },
                },
                {
                    en: {
                        _desired: 'so',
                        _distance: '30',
                        _oneway: 'true',
                    },
                },
                {
                    en: {
                        _desired: 'sq',
                        _distance: '30',
                        _oneway: 'true',
                    },
                },
                {
                    en: {
                        _desired: 'st',
                        _distance: '30',
                        _oneway: 'true',
                    },
                },
                {
                    id: {
                        _desired: 'su',
                        _distance: '20',
                        _oneway: 'true',
                    },
                },
                {
                    en: {
                        _desired: 'sw',
                        _distance: '30',
                        _oneway: 'true',
                    },
                },
                {
                    en: {
                        _desired: 'ta',
                        _distance: '30',
                        _oneway: 'true',
                    },
                },
                {
                    en: {
                        _desired: 'te',
                        _distance: '30',
                        _oneway: 'true',
                    },
                },
                {
                    ru: {
                        _desired: 'tg',
                        _distance: '30',
                        _oneway: 'true',
                    },
                },
                {
                    en: {
                        _desired: 'ti',
                        _distance: '30',
                        _oneway: 'true',
                    },
                },
                {
                    ru: {
                        _desired: 'tk',
                        _distance: '30',
                        _oneway: 'true',
                    },
                },
                {
                    en: {
                        _desired: 'tlh',
                        _distance: '30',
                        _oneway: 'true',
                    },
                },
                {
                    en: {
                        _desired: 'tn',
                        _distance: '30',
                        _oneway: 'true',
                    },
                },
                {
                    en: {
                        _desired: 'to',
                        _distance: '30',
                        _oneway: 'true',
                    },
                },
                {
                    ru: {
                        _desired: 'tt',
                        _distance: '30',
                        _oneway: 'true',
                    },
                },
                {
                    en: {
                        _desired: 'tum',
                        _distance: '30',
                        _oneway: 'true',
                    },
                },
                {
                    zh: {
                        _desired: 'ug',
                        _distance: '20',
                        _oneway: 'true',
                    },
                },
                {
                    ru: {
                        _desired: 'uk',
                        _distance: '20',
                        _oneway: 'true',
                    },
                },
                {
                    en: {
                        _desired: 'ur',
                        _distance: '30',
                        _oneway: 'true',
                    },
                },
                {
                    ru: {
                        _desired: 'uz',
                        _distance: '30',
                        _oneway: 'true',
                    },
                },
                {
                    fr: {
                        _desired: 'wo',
                        _distance: '30',
                        _oneway: 'true',
                    },
                },
                {
                    en: {
                        _desired: 'xh',
                        _distance: '30',
                        _oneway: 'true',
                    },
                },
                {
                    en: {
                        _desired: 'yi',
                        _distance: '30',
                        _oneway: 'true',
                    },
                },
                {
                    en: {
                        _desired: 'yo',
                        _distance: '30',
                        _oneway: 'true',
                    },
                },
                {
                    zh: {
                        _desired: 'za',
                        _distance: '20',
                        _oneway: 'true',
                    },
                },
                {
                    en: {
                        _desired: 'zu',
                        _distance: '30',
                        _oneway: 'true',
                    },
                },
                {
                    ar: {
                        _desired: 'aao',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    ar: {
                        _desired: 'abh',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    ar: {
                        _desired: 'abv',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    ar: {
                        _desired: 'acm',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    ar: {
                        _desired: 'acq',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    ar: {
                        _desired: 'acw',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    ar: {
                        _desired: 'acx',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    ar: {
                        _desired: 'acy',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    ar: {
                        _desired: 'adf',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    ar: {
                        _desired: 'aeb',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    ar: {
                        _desired: 'aec',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    ar: {
                        _desired: 'afb',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    ar: {
                        _desired: 'ajp',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    ar: {
                        _desired: 'apc',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    ar: {
                        _desired: 'apd',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    ar: {
                        _desired: 'arq',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    ar: {
                        _desired: 'ars',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    ar: {
                        _desired: 'ary',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    ar: {
                        _desired: 'arz',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    ar: {
                        _desired: 'auz',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    ar: {
                        _desired: 'avl',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    ar: {
                        _desired: 'ayh',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    ar: {
                        _desired: 'ayl',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    ar: {
                        _desired: 'ayn',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    ar: {
                        _desired: 'ayp',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    ar: {
                        _desired: 'bbz',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    ar: {
                        _desired: 'pga',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    ar: {
                        _desired: 'shu',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    ar: {
                        _desired: 'ssh',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    az: {
                        _desired: 'azb',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    et: {
                        _desired: 'vro',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    ff: {
                        _desired: 'ffm',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    ff: {
                        _desired: 'fub',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    ff: {
                        _desired: 'fue',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    ff: {
                        _desired: 'fuf',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    ff: {
                        _desired: 'fuh',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    ff: {
                        _desired: 'fui',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    ff: {
                        _desired: 'fuq',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    ff: {
                        _desired: 'fuv',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    gn: {
                        _desired: 'gnw',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    gn: {
                        _desired: 'gui',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    gn: {
                        _desired: 'gun',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    gn: {
                        _desired: 'nhd',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    iu: {
                        _desired: 'ikt',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    kln: {
                        _desired: 'enb',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    kln: {
                        _desired: 'eyo',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    kln: {
                        _desired: 'niq',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    kln: {
                        _desired: 'oki',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    kln: {
                        _desired: 'pko',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    kln: {
                        _desired: 'sgc',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    kln: {
                        _desired: 'tec',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    kln: {
                        _desired: 'tuy',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    kok: {
                        _desired: 'gom',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    kpe: {
                        _desired: 'gkp',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    luy: {
                        _desired: 'ida',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    luy: {
                        _desired: 'lkb',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    luy: {
                        _desired: 'lko',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    luy: {
                        _desired: 'lks',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    luy: {
                        _desired: 'lri',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    luy: {
                        _desired: 'lrm',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    luy: {
                        _desired: 'lsm',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    luy: {
                        _desired: 'lto',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    luy: {
                        _desired: 'lts',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    luy: {
                        _desired: 'lwg',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    luy: {
                        _desired: 'nle',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    luy: {
                        _desired: 'nyd',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    luy: {
                        _desired: 'rag',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    lv: {
                        _desired: 'ltg',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    mg: {
                        _desired: 'bhr',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    mg: {
                        _desired: 'bjq',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    mg: {
                        _desired: 'bmm',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    mg: {
                        _desired: 'bzc',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    mg: {
                        _desired: 'msh',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    mg: {
                        _desired: 'skg',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    mg: {
                        _desired: 'tdx',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    mg: {
                        _desired: 'tkg',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    mg: {
                        _desired: 'txy',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    mg: {
                        _desired: 'xmv',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    mg: {
                        _desired: 'xmw',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    mn: {
                        _desired: 'mvf',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    ms: {
                        _desired: 'bjn',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    ms: {
                        _desired: 'btj',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    ms: {
                        _desired: 'bve',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    ms: {
                        _desired: 'bvu',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    ms: {
                        _desired: 'coa',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    ms: {
                        _desired: 'dup',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    ms: {
                        _desired: 'hji',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    ms: {
                        _desired: 'id',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    ms: {
                        _desired: 'jak',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    ms: {
                        _desired: 'jax',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    ms: {
                        _desired: 'kvb',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    ms: {
                        _desired: 'kvr',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    ms: {
                        _desired: 'kxd',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    ms: {
                        _desired: 'lce',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    ms: {
                        _desired: 'lcf',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    ms: {
                        _desired: 'liw',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    ms: {
                        _desired: 'max',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    ms: {
                        _desired: 'meo',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    ms: {
                        _desired: 'mfa',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    ms: {
                        _desired: 'mfb',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    ms: {
                        _desired: 'min',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    ms: {
                        _desired: 'mqg',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    ms: {
                        _desired: 'msi',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    ms: {
                        _desired: 'mui',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    ms: {
                        _desired: 'orn',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    ms: {
                        _desired: 'ors',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    ms: {
                        _desired: 'pel',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    ms: {
                        _desired: 'pse',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    ms: {
                        _desired: 'tmw',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    ms: {
                        _desired: 'urk',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    ms: {
                        _desired: 'vkk',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    ms: {
                        _desired: 'vkt',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    ms: {
                        _desired: 'xmm',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    ms: {
                        _desired: 'zlm',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    ms: {
                        _desired: 'zmi',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    ne: {
                        _desired: 'dty',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    om: {
                        _desired: 'gax',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    om: {
                        _desired: 'hae',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    om: {
                        _desired: 'orc',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    or: {
                        _desired: 'spv',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    ps: {
                        _desired: 'pbt',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    ps: {
                        _desired: 'pst',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    qu: {
                        _desired: 'qub',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    qu: {
                        _desired: 'qud',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    qu: {
                        _desired: 'quf',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    qu: {
                        _desired: 'qug',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    qu: {
                        _desired: 'quh',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    qu: {
                        _desired: 'quk',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    qu: {
                        _desired: 'qul',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    qu: {
                        _desired: 'qup',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    qu: {
                        _desired: 'qur',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    qu: {
                        _desired: 'qus',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    qu: {
                        _desired: 'quw',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    qu: {
                        _desired: 'qux',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    qu: {
                        _desired: 'quy',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    qu: {
                        _desired: 'qva',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    qu: {
                        _desired: 'qvc',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    qu: {
                        _desired: 'qve',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    qu: {
                        _desired: 'qvh',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    qu: {
                        _desired: 'qvi',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    qu: {
                        _desired: 'qvj',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    qu: {
                        _desired: 'qvl',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    qu: {
                        _desired: 'qvm',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    qu: {
                        _desired: 'qvn',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    qu: {
                        _desired: 'qvo',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    qu: {
                        _desired: 'qvp',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    qu: {
                        _desired: 'qvs',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    qu: {
                        _desired: 'qvw',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    qu: {
                        _desired: 'qvz',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    qu: {
                        _desired: 'qwa',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    qu: {
                        _desired: 'qwc',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    qu: {
                        _desired: 'qwh',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    qu: {
                        _desired: 'qws',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    qu: {
                        _desired: 'qxa',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    qu: {
                        _desired: 'qxc',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    qu: {
                        _desired: 'qxh',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    qu: {
                        _desired: 'qxl',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    qu: {
                        _desired: 'qxn',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    qu: {
                        _desired: 'qxo',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    qu: {
                        _desired: 'qxp',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    qu: {
                        _desired: 'qxr',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    qu: {
                        _desired: 'qxt',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    qu: {
                        _desired: 'qxu',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    qu: {
                        _desired: 'qxw',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    sc: {
                        _desired: 'sdc',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    sc: {
                        _desired: 'sdn',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    sc: {
                        _desired: 'sro',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    sq: {
                        _desired: 'aae',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    sq: {
                        _desired: 'aat',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    sq: {
                        _desired: 'aln',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    syr: {
                        _desired: 'aii',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    uz: {
                        _desired: 'uzs',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    yi: {
                        _desired: 'yih',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    zh: {
                        _desired: 'cdo',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    zh: {
                        _desired: 'cjy',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    zh: {
                        _desired: 'cpx',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    zh: {
                        _desired: 'czh',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    zh: {
                        _desired: 'czo',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    zh: {
                        _desired: 'gan',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    zh: {
                        _desired: 'hak',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    zh: {
                        _desired: 'hsn',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    zh: {
                        _desired: 'lzh',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    zh: {
                        _desired: 'mnp',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    zh: {
                        _desired: 'nan',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    zh: {
                        _desired: 'wuu',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    zh: {
                        _desired: 'yue',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    '*': {
                        _desired: '*',
                        _distance: '80',
                    },
                },
                {
                    'en-Latn': {
                        _desired: 'am-Ethi',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    'ru-Cyrl': {
                        _desired: 'az-Latn',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    'en-Latn': {
                        _desired: 'bn-Beng',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    'zh-Hans': {
                        _desired: 'bo-Tibt',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    'ru-Cyrl': {
                        _desired: 'hy-Armn',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    'en-Latn': {
                        _desired: 'ka-Geor',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    'en-Latn': {
                        _desired: 'km-Khmr',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    'en-Latn': {
                        _desired: 'kn-Knda',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    'en-Latn': {
                        _desired: 'lo-Laoo',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    'en-Latn': {
                        _desired: 'ml-Mlym',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    'en-Latn': {
                        _desired: 'my-Mymr',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    'en-Latn': {
                        _desired: 'ne-Deva',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    'en-Latn': {
                        _desired: 'or-Orya',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    'en-Latn': {
                        _desired: 'pa-Guru',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    'en-Latn': {
                        _desired: 'ps-Arab',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    'en-Latn': {
                        _desired: 'sd-Arab',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    'en-Latn': {
                        _desired: 'si-Sinh',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    'en-Latn': {
                        _desired: 'ta-Taml',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    'en-Latn': {
                        _desired: 'te-Telu',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    'en-Latn': {
                        _desired: 'ti-Ethi',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    'ru-Cyrl': {
                        _desired: 'tk-Latn',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    'en-Latn': {
                        _desired: 'ur-Arab',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    'ru-Cyrl': {
                        _desired: 'uz-Latn',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    'en-Latn': {
                        _desired: 'yi-Hebr',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    'sr-Cyrl': {
                        _desired: 'sr-Latn',
                        _distance: '5',
                    },
                },
                {
                    'zh-Hans': {
                        _desired: 'za-Latn',
                        _distance: '10',
                        _oneway: 'true',
                    },
                },
                {
                    'zh-Hans': {
                        _desired: 'zh-Hani',
                        _distance: '20',
                        _oneway: 'true',
                    },
                },
                {
                    'zh-Hant': {
                        _desired: 'zh-Hani',
                        _distance: '20',
                        _oneway: 'true',
                    },
                },
                {
                    'ar-Arab': {
                        _desired: 'ar-Latn',
                        _distance: '20',
                        _oneway: 'true',
                    },
                },
                {
                    'bn-Beng': {
                        _desired: 'bn-Latn',
                        _distance: '20',
                        _oneway: 'true',
                    },
                },
                {
                    'gu-Gujr': {
                        _desired: 'gu-Latn',
                        _distance: '20',
                        _oneway: 'true',
                    },
                },
                {
                    'hi-Deva': {
                        _desired: 'hi-Latn',
                        _distance: '20',
                        _oneway: 'true',
                    },
                },
                {
                    'kn-Knda': {
                        _desired: 'kn-Latn',
                        _distance: '20',
                        _oneway: 'true',
                    },
                },
                {
                    'ml-Mlym': {
                        _desired: 'ml-Latn',
                        _distance: '20',
                        _oneway: 'true',
                    },
                },
                {
                    'mr-Deva': {
                        _desired: 'mr-Latn',
                        _distance: '20',
                        _oneway: 'true',
                    },
                },
                {
                    'ta-Taml': {
                        _desired: 'ta-Latn',
                        _distance: '20',
                        _oneway: 'true',
                    },
                },
                {
                    'te-Telu': {
                        _desired: 'te-Latn',
                        _distance: '20',
                        _oneway: 'true',
                    },
                },
                {
                    'zh-Hans': {
                        _desired: 'zh-Latn',
                        _distance: '20',
                        _oneway: 'true',
                    },
                },
                {
                    'ja-Jpan': {
                        _desired: 'ja-Latn',
                        _distance: '5',
                        _oneway: 'true',
                    },
                },
                {
                    'ja-Jpan': {
                        _desired: 'ja-Hani',
                        _distance: '5',
                        _oneway: 'true',
                    },
                },
                {
                    'ja-Jpan': {
                        _desired: 'ja-Hira',
                        _distance: '5',
                        _oneway: 'true',
                    },
                },
                {
                    'ja-Jpan': {
                        _desired: 'ja-Kana',
                        _distance: '5',
                        _oneway: 'true',
                    },
                },
                {
                    'ja-Jpan': {
                        _desired: 'ja-Hrkt',
                        _distance: '5',
                        _oneway: 'true',
                    },
                },
                {
                    'ja-Hrkt': {
                        _desired: 'ja-Hira',
                        _distance: '5',
                        _oneway: 'true',
                    },
                },
                {
                    'ja-Hrkt': {
                        _desired: 'ja-Kana',
                        _distance: '5',
                        _oneway: 'true',
                    },
                },
                {
                    'ko-Kore': {
                        _desired: 'ko-Hani',
                        _distance: '5',
                        _oneway: 'true',
                    },
                },
                {
                    'ko-Kore': {
                        _desired: 'ko-Hang',
                        _distance: '5',
                        _oneway: 'true',
                    },
                },
                {
                    'ko-Kore': {
                        _desired: 'ko-Jamo',
                        _distance: '5',
                        _oneway: 'true',
                    },
                },
                {
                    'ko-Hang': {
                        _desired: 'ko-Jamo',
                        _distance: '5',
                        _oneway: 'true',
                    },
                },
                {
                    '*-*': {
                        _desired: '*-*',
                        _distance: '50',
                    },
                },
                {
                    'ar-*-$maghreb': {
                        _desired: 'ar-*-$maghreb',
                        _distance: '4',
                    },
                },
                {
                    'ar-*-$!maghreb': {
                        _desired: 'ar-*-$!maghreb',
                        _distance: '4',
                    },
                },
                {
                    'ar-*-*': {
                        _desired: 'ar-*-*',
                        _distance: '5',
                    },
                },
                {
                    'en-*-$enUS': {
                        _desired: 'en-*-$enUS',
                        _distance: '4',
                    },
                },
                {
                    'en-*-GB': {
                        _desired: 'en-*-$!enUS',
                        _distance: '3',
                    },
                },
                {
                    'en-*-$!enUS': {
                        _desired: 'en-*-$!enUS',
                        _distance: '4',
                    },
                },
                {
                    'en-*-*': {
                        _desired: 'en-*-*',
                        _distance: '5',
                    },
                },
                {
                    'es-*-$americas': {
                        _desired: 'es-*-$americas',
                        _distance: '4',
                    },
                },
                {
                    'es-*-$!americas': {
                        _desired: 'es-*-$!americas',
                        _distance: '4',
                    },
                },
                {
                    'es-*-*': {
                        _desired: 'es-*-*',
                        _distance: '5',
                    },
                },
                {
                    'pt-*-$americas': {
                        _desired: 'pt-*-$americas',
                        _distance: '4',
                    },
                },
                {
                    'pt-*-$!americas': {
                        _desired: 'pt-*-$!americas',
                        _distance: '4',
                    },
                },
                {
                    'pt-*-*': {
                        _desired: 'pt-*-*',
                        _distance: '5',
                    },
                },
                {
                    'zh-Hant-$cnsar': {
                        _desired: 'zh-Hant-$cnsar',
                        _distance: '4',
                    },
                },
                {
                    'zh-Hant-$!cnsar': {
                        _desired: 'zh-Hant-$!cnsar',
                        _distance: '4',
                    },
                },
                {
                    'zh-Hant-*': {
                        _desired: 'zh-Hant-*',
                        _distance: '5',
                    },
                },
                {
                    '*-*-*': {
                        _desired: '*-*-*',
                        _distance: '4',
                    },
                },
            ],
        },
    },
};

},{}],59:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.regions = void 0;
// This file is generated from regions-gen.ts
exports.regions = {
    "001": [
        "001",
        "001-status-grouping",
        "002",
        "005",
        "009",
        "011",
        "013",
        "014",
        "015",
        "017",
        "018",
        "019",
        "021",
        "029",
        "030",
        "034",
        "035",
        "039",
        "053",
        "054",
        "057",
        "061",
        "142",
        "143",
        "145",
        "150",
        "151",
        "154",
        "155",
        "AC",
        "AD",
        "AE",
        "AF",
        "AG",
        "AI",
        "AL",
        "AM",
        "AO",
        "AQ",
        "AR",
        "AS",
        "AT",
        "AU",
        "AW",
        "AX",
        "AZ",
        "BA",
        "BB",
        "BD",
        "BE",
        "BF",
        "BG",
        "BH",
        "BI",
        "BJ",
        "BL",
        "BM",
        "BN",
        "BO",
        "BQ",
        "BR",
        "BS",
        "BT",
        "BV",
        "BW",
        "BY",
        "BZ",
        "CA",
        "CC",
        "CD",
        "CF",
        "CG",
        "CH",
        "CI",
        "CK",
        "CL",
        "CM",
        "CN",
        "CO",
        "CP",
        "CQ",
        "CR",
        "CU",
        "CV",
        "CW",
        "CX",
        "CY",
        "CZ",
        "DE",
        "DG",
        "DJ",
        "DK",
        "DM",
        "DO",
        "DZ",
        "EA",
        "EC",
        "EE",
        "EG",
        "EH",
        "ER",
        "ES",
        "ET",
        "EU",
        "EZ",
        "FI",
        "FJ",
        "FK",
        "FM",
        "FO",
        "FR",
        "GA",
        "GB",
        "GD",
        "GE",
        "GF",
        "GG",
        "GH",
        "GI",
        "GL",
        "GM",
        "GN",
        "GP",
        "GQ",
        "GR",
        "GS",
        "GT",
        "GU",
        "GW",
        "GY",
        "HK",
        "HM",
        "HN",
        "HR",
        "HT",
        "HU",
        "IC",
        "ID",
        "IE",
        "IL",
        "IM",
        "IN",
        "IO",
        "IQ",
        "IR",
        "IS",
        "IT",
        "JE",
        "JM",
        "JO",
        "JP",
        "KE",
        "KG",
        "KH",
        "KI",
        "KM",
        "KN",
        "KP",
        "KR",
        "KW",
        "KY",
        "KZ",
        "LA",
        "LB",
        "LC",
        "LI",
        "LK",
        "LR",
        "LS",
        "LT",
        "LU",
        "LV",
        "LY",
        "MA",
        "MC",
        "MD",
        "ME",
        "MF",
        "MG",
        "MH",
        "MK",
        "ML",
        "MM",
        "MN",
        "MO",
        "MP",
        "MQ",
        "MR",
        "MS",
        "MT",
        "MU",
        "MV",
        "MW",
        "MX",
        "MY",
        "MZ",
        "NA",
        "NC",
        "NE",
        "NF",
        "NG",
        "NI",
        "NL",
        "NO",
        "NP",
        "NR",
        "NU",
        "NZ",
        "OM",
        "PA",
        "PE",
        "PF",
        "PG",
        "PH",
        "PK",
        "PL",
        "PM",
        "PN",
        "PR",
        "PS",
        "PT",
        "PW",
        "PY",
        "QA",
        "QO",
        "RE",
        "RO",
        "RS",
        "RU",
        "RW",
        "SA",
        "SB",
        "SC",
        "SD",
        "SE",
        "SG",
        "SH",
        "SI",
        "SJ",
        "SK",
        "SL",
        "SM",
        "SN",
        "SO",
        "SR",
        "SS",
        "ST",
        "SV",
        "SX",
        "SY",
        "SZ",
        "TA",
        "TC",
        "TD",
        "TF",
        "TG",
        "TH",
        "TJ",
        "TK",
        "TL",
        "TM",
        "TN",
        "TO",
        "TR",
        "TT",
        "TV",
        "TW",
        "TZ",
        "UA",
        "UG",
        "UM",
        "UN",
        "US",
        "UY",
        "UZ",
        "VA",
        "VC",
        "VE",
        "VG",
        "VI",
        "VN",
        "VU",
        "WF",
        "WS",
        "XK",
        "YE",
        "YT",
        "ZA",
        "ZM",
        "ZW"
    ],
    "002": [
        "002",
        "002-status-grouping",
        "011",
        "014",
        "015",
        "017",
        "018",
        "202",
        "AO",
        "BF",
        "BI",
        "BJ",
        "BW",
        "CD",
        "CF",
        "CG",
        "CI",
        "CM",
        "CV",
        "DJ",
        "DZ",
        "EA",
        "EG",
        "EH",
        "ER",
        "ET",
        "GA",
        "GH",
        "GM",
        "GN",
        "GQ",
        "GW",
        "IC",
        "IO",
        "KE",
        "KM",
        "LR",
        "LS",
        "LY",
        "MA",
        "MG",
        "ML",
        "MR",
        "MU",
        "MW",
        "MZ",
        "NA",
        "NE",
        "NG",
        "RE",
        "RW",
        "SC",
        "SD",
        "SH",
        "SL",
        "SN",
        "SO",
        "SS",
        "ST",
        "SZ",
        "TD",
        "TF",
        "TG",
        "TN",
        "TZ",
        "UG",
        "YT",
        "ZA",
        "ZM",
        "ZW"
    ],
    "003": [
        "003",
        "013",
        "021",
        "029",
        "AG",
        "AI",
        "AW",
        "BB",
        "BL",
        "BM",
        "BQ",
        "BS",
        "BZ",
        "CA",
        "CR",
        "CU",
        "CW",
        "DM",
        "DO",
        "GD",
        "GL",
        "GP",
        "GT",
        "HN",
        "HT",
        "JM",
        "KN",
        "KY",
        "LC",
        "MF",
        "MQ",
        "MS",
        "MX",
        "NI",
        "PA",
        "PM",
        "PR",
        "SV",
        "SX",
        "TC",
        "TT",
        "US",
        "VC",
        "VG",
        "VI"
    ],
    "005": [
        "005",
        "AR",
        "BO",
        "BR",
        "BV",
        "CL",
        "CO",
        "EC",
        "FK",
        "GF",
        "GS",
        "GY",
        "PE",
        "PY",
        "SR",
        "UY",
        "VE"
    ],
    "009": [
        "009",
        "053",
        "054",
        "057",
        "061",
        "AC",
        "AQ",
        "AS",
        "AU",
        "CC",
        "CK",
        "CP",
        "CX",
        "DG",
        "FJ",
        "FM",
        "GU",
        "HM",
        "KI",
        "MH",
        "MP",
        "NC",
        "NF",
        "NR",
        "NU",
        "NZ",
        "PF",
        "PG",
        "PN",
        "PW",
        "QO",
        "SB",
        "TA",
        "TK",
        "TO",
        "TV",
        "UM",
        "VU",
        "WF",
        "WS"
    ],
    "011": [
        "011",
        "BF",
        "BJ",
        "CI",
        "CV",
        "GH",
        "GM",
        "GN",
        "GW",
        "LR",
        "ML",
        "MR",
        "NE",
        "NG",
        "SH",
        "SL",
        "SN",
        "TG"
    ],
    "013": [
        "013",
        "BZ",
        "CR",
        "GT",
        "HN",
        "MX",
        "NI",
        "PA",
        "SV"
    ],
    "014": [
        "014",
        "BI",
        "DJ",
        "ER",
        "ET",
        "IO",
        "KE",
        "KM",
        "MG",
        "MU",
        "MW",
        "MZ",
        "RE",
        "RW",
        "SC",
        "SO",
        "SS",
        "TF",
        "TZ",
        "UG",
        "YT",
        "ZM",
        "ZW"
    ],
    "015": [
        "015",
        "DZ",
        "EA",
        "EG",
        "EH",
        "IC",
        "LY",
        "MA",
        "SD",
        "TN"
    ],
    "017": [
        "017",
        "AO",
        "CD",
        "CF",
        "CG",
        "CM",
        "GA",
        "GQ",
        "ST",
        "TD"
    ],
    "018": [
        "018",
        "BW",
        "LS",
        "NA",
        "SZ",
        "ZA"
    ],
    "019": [
        "003",
        "005",
        "013",
        "019",
        "019-status-grouping",
        "021",
        "029",
        "419",
        "AG",
        "AI",
        "AR",
        "AW",
        "BB",
        "BL",
        "BM",
        "BO",
        "BQ",
        "BR",
        "BS",
        "BV",
        "BZ",
        "CA",
        "CL",
        "CO",
        "CR",
        "CU",
        "CW",
        "DM",
        "DO",
        "EC",
        "FK",
        "GD",
        "GF",
        "GL",
        "GP",
        "GS",
        "GT",
        "GY",
        "HN",
        "HT",
        "JM",
        "KN",
        "KY",
        "LC",
        "MF",
        "MQ",
        "MS",
        "MX",
        "NI",
        "PA",
        "PE",
        "PM",
        "PR",
        "PY",
        "SR",
        "SV",
        "SX",
        "TC",
        "TT",
        "US",
        "UY",
        "VC",
        "VE",
        "VG",
        "VI"
    ],
    "021": [
        "021",
        "BM",
        "CA",
        "GL",
        "PM",
        "US"
    ],
    "029": [
        "029",
        "AG",
        "AI",
        "AW",
        "BB",
        "BL",
        "BQ",
        "BS",
        "CU",
        "CW",
        "DM",
        "DO",
        "GD",
        "GP",
        "HT",
        "JM",
        "KN",
        "KY",
        "LC",
        "MF",
        "MQ",
        "MS",
        "PR",
        "SX",
        "TC",
        "TT",
        "VC",
        "VG",
        "VI"
    ],
    "030": [
        "030",
        "CN",
        "HK",
        "JP",
        "KP",
        "KR",
        "MN",
        "MO",
        "TW"
    ],
    "034": [
        "034",
        "AF",
        "BD",
        "BT",
        "IN",
        "IR",
        "LK",
        "MV",
        "NP",
        "PK"
    ],
    "035": [
        "035",
        "BN",
        "ID",
        "KH",
        "LA",
        "MM",
        "MY",
        "PH",
        "SG",
        "TH",
        "TL",
        "VN"
    ],
    "039": [
        "039",
        "AD",
        "AL",
        "BA",
        "ES",
        "GI",
        "GR",
        "HR",
        "IT",
        "ME",
        "MK",
        "MT",
        "PT",
        "RS",
        "SI",
        "SM",
        "VA",
        "XK"
    ],
    "053": [
        "053",
        "AU",
        "CC",
        "CX",
        "HM",
        "NF",
        "NZ"
    ],
    "054": [
        "054",
        "FJ",
        "NC",
        "PG",
        "SB",
        "VU"
    ],
    "057": [
        "057",
        "FM",
        "GU",
        "KI",
        "MH",
        "MP",
        "NR",
        "PW",
        "UM"
    ],
    "061": [
        "061",
        "AS",
        "CK",
        "NU",
        "PF",
        "PN",
        "TK",
        "TO",
        "TV",
        "WF",
        "WS"
    ],
    "142": [
        "030",
        "034",
        "035",
        "142",
        "143",
        "145",
        "AE",
        "AF",
        "AM",
        "AZ",
        "BD",
        "BH",
        "BN",
        "BT",
        "CN",
        "CY",
        "GE",
        "HK",
        "ID",
        "IL",
        "IN",
        "IQ",
        "IR",
        "JO",
        "JP",
        "KG",
        "KH",
        "KP",
        "KR",
        "KW",
        "KZ",
        "LA",
        "LB",
        "LK",
        "MM",
        "MN",
        "MO",
        "MV",
        "MY",
        "NP",
        "OM",
        "PH",
        "PK",
        "PS",
        "QA",
        "SA",
        "SG",
        "SY",
        "TH",
        "TJ",
        "TL",
        "TM",
        "TR",
        "TW",
        "UZ",
        "VN",
        "YE"
    ],
    "143": [
        "143",
        "KG",
        "KZ",
        "TJ",
        "TM",
        "UZ"
    ],
    "145": [
        "145",
        "AE",
        "AM",
        "AZ",
        "BH",
        "CY",
        "GE",
        "IL",
        "IQ",
        "JO",
        "KW",
        "LB",
        "OM",
        "PS",
        "QA",
        "SA",
        "SY",
        "TR",
        "YE"
    ],
    "150": [
        "039",
        "150",
        "151",
        "154",
        "155",
        "AD",
        "AL",
        "AT",
        "AX",
        "BA",
        "BE",
        "BG",
        "BY",
        "CH",
        "CQ",
        "CZ",
        "DE",
        "DK",
        "EE",
        "ES",
        "FI",
        "FO",
        "FR",
        "GB",
        "GG",
        "GI",
        "GR",
        "HR",
        "HU",
        "IE",
        "IM",
        "IS",
        "IT",
        "JE",
        "LI",
        "LT",
        "LU",
        "LV",
        "MC",
        "MD",
        "ME",
        "MK",
        "MT",
        "NL",
        "NO",
        "PL",
        "PT",
        "RO",
        "RS",
        "RU",
        "SE",
        "SI",
        "SJ",
        "SK",
        "SM",
        "UA",
        "VA",
        "XK"
    ],
    "151": [
        "151",
        "BG",
        "BY",
        "CZ",
        "HU",
        "MD",
        "PL",
        "RO",
        "RU",
        "SK",
        "UA"
    ],
    "154": [
        "154",
        "AX",
        "CQ",
        "DK",
        "EE",
        "FI",
        "FO",
        "GB",
        "GG",
        "IE",
        "IM",
        "IS",
        "JE",
        "LT",
        "LV",
        "NO",
        "SE",
        "SJ"
    ],
    "155": [
        "155",
        "AT",
        "BE",
        "CH",
        "DE",
        "FR",
        "LI",
        "LU",
        "MC",
        "NL"
    ],
    "202": [
        "011",
        "014",
        "017",
        "018",
        "202",
        "AO",
        "BF",
        "BI",
        "BJ",
        "BW",
        "CD",
        "CF",
        "CG",
        "CI",
        "CM",
        "CV",
        "DJ",
        "ER",
        "ET",
        "GA",
        "GH",
        "GM",
        "GN",
        "GQ",
        "GW",
        "IO",
        "KE",
        "KM",
        "LR",
        "LS",
        "MG",
        "ML",
        "MR",
        "MU",
        "MW",
        "MZ",
        "NA",
        "NE",
        "NG",
        "RE",
        "RW",
        "SC",
        "SH",
        "SL",
        "SN",
        "SO",
        "SS",
        "ST",
        "SZ",
        "TD",
        "TF",
        "TG",
        "TZ",
        "UG",
        "YT",
        "ZA",
        "ZM",
        "ZW"
    ],
    "419": [
        "005",
        "013",
        "029",
        "419",
        "AG",
        "AI",
        "AR",
        "AW",
        "BB",
        "BL",
        "BO",
        "BQ",
        "BR",
        "BS",
        "BV",
        "BZ",
        "CL",
        "CO",
        "CR",
        "CU",
        "CW",
        "DM",
        "DO",
        "EC",
        "FK",
        "GD",
        "GF",
        "GP",
        "GS",
        "GT",
        "GY",
        "HN",
        "HT",
        "JM",
        "KN",
        "KY",
        "LC",
        "MF",
        "MQ",
        "MS",
        "MX",
        "NI",
        "PA",
        "PE",
        "PR",
        "PY",
        "SR",
        "SV",
        "SX",
        "TC",
        "TT",
        "UY",
        "VC",
        "VE",
        "VG",
        "VI"
    ],
    "EU": [
        "AT",
        "BE",
        "BG",
        "CY",
        "CZ",
        "DE",
        "DK",
        "EE",
        "ES",
        "EU",
        "FI",
        "FR",
        "GR",
        "HR",
        "HU",
        "IE",
        "IT",
        "LT",
        "LU",
        "LV",
        "MT",
        "NL",
        "PL",
        "PT",
        "RO",
        "SE",
        "SI",
        "SK"
    ],
    "EZ": [
        "AT",
        "BE",
        "CY",
        "DE",
        "EE",
        "ES",
        "EZ",
        "FI",
        "FR",
        "GR",
        "IE",
        "IT",
        "LT",
        "LU",
        "LV",
        "MT",
        "NL",
        "PT",
        "SI",
        "SK"
    ],
    "QO": [
        "AC",
        "AQ",
        "CP",
        "DG",
        "QO",
        "TA"
    ],
    "UN": [
        "AD",
        "AE",
        "AF",
        "AG",
        "AL",
        "AM",
        "AO",
        "AR",
        "AT",
        "AU",
        "AZ",
        "BA",
        "BB",
        "BD",
        "BE",
        "BF",
        "BG",
        "BH",
        "BI",
        "BJ",
        "BN",
        "BO",
        "BR",
        "BS",
        "BT",
        "BW",
        "BY",
        "BZ",
        "CA",
        "CD",
        "CF",
        "CG",
        "CH",
        "CI",
        "CL",
        "CM",
        "CN",
        "CO",
        "CR",
        "CU",
        "CV",
        "CY",
        "CZ",
        "DE",
        "DJ",
        "DK",
        "DM",
        "DO",
        "DZ",
        "EC",
        "EE",
        "EG",
        "ER",
        "ES",
        "ET",
        "FI",
        "FJ",
        "FM",
        "FR",
        "GA",
        "GB",
        "GD",
        "GE",
        "GH",
        "GM",
        "GN",
        "GQ",
        "GR",
        "GT",
        "GW",
        "GY",
        "HN",
        "HR",
        "HT",
        "HU",
        "ID",
        "IE",
        "IL",
        "IN",
        "IQ",
        "IR",
        "IS",
        "IT",
        "JM",
        "JO",
        "JP",
        "KE",
        "KG",
        "KH",
        "KI",
        "KM",
        "KN",
        "KP",
        "KR",
        "KW",
        "KZ",
        "LA",
        "LB",
        "LC",
        "LI",
        "LK",
        "LR",
        "LS",
        "LT",
        "LU",
        "LV",
        "LY",
        "MA",
        "MC",
        "MD",
        "ME",
        "MG",
        "MH",
        "MK",
        "ML",
        "MM",
        "MN",
        "MR",
        "MT",
        "MU",
        "MV",
        "MW",
        "MX",
        "MY",
        "MZ",
        "NA",
        "NE",
        "NG",
        "NI",
        "NL",
        "NO",
        "NP",
        "NR",
        "NZ",
        "OM",
        "PA",
        "PE",
        "PG",
        "PH",
        "PK",
        "PL",
        "PT",
        "PW",
        "PY",
        "QA",
        "RO",
        "RS",
        "RU",
        "RW",
        "SA",
        "SB",
        "SC",
        "SD",
        "SE",
        "SG",
        "SI",
        "SK",
        "SL",
        "SM",
        "SN",
        "SO",
        "SR",
        "SS",
        "ST",
        "SV",
        "SY",
        "SZ",
        "TD",
        "TG",
        "TH",
        "TJ",
        "TL",
        "TM",
        "TN",
        "TO",
        "TR",
        "TT",
        "TV",
        "TZ",
        "UA",
        "UG",
        "UN",
        "US",
        "UY",
        "UZ",
        "VC",
        "VE",
        "VN",
        "VU",
        "WS",
        "YE",
        "ZA",
        "ZM",
        "ZW"
    ]
};

},{}],60:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UNICODE_EXTENSION_SEQUENCE_REGEX = void 0;
exports.invariant = invariant;
exports.findMatchingDistance = findMatchingDistance;
exports.findBestMatch = findBestMatch;
var tslib_1 = require("tslib");
var languageMatching_1 = require("./languageMatching");
var regions_generated_1 = require("./regions.generated");
exports.UNICODE_EXTENSION_SEQUENCE_REGEX = /-u(?:-[0-9a-z]{2,8})+/gi;
function invariant(condition, message, Err) {
    if (Err === void 0) { Err = Error; }
    if (!condition) {
        throw new Err(message);
    }
}
// This is effectively 2 languages in 2 different regions in the same cluster
var DEFAULT_MATCHING_THRESHOLD = 838;
var PROCESSED_DATA;
function processData() {
    var _a, _b;
    if (!PROCESSED_DATA) {
        var paradigmLocales = (_b = (_a = languageMatching_1.data.supplemental.languageMatching['written-new'][0]) === null || _a === void 0 ? void 0 : _a.paradigmLocales) === null || _b === void 0 ? void 0 : _b._locales.split(' ');
        var matchVariables = languageMatching_1.data.supplemental.languageMatching['written-new'].slice(1, 5);
        var data = languageMatching_1.data.supplemental.languageMatching['written-new'].slice(5);
        var matches = data.map(function (d) {
            var key = Object.keys(d)[0];
            var value = d[key];
            return {
                supported: key,
                desired: value._desired,
                distance: +value._distance,
                oneway: value.oneway === 'true' ? true : false,
            };
        }, {});
        PROCESSED_DATA = {
            matches: matches,
            matchVariables: matchVariables.reduce(function (all, d) {
                var key = Object.keys(d)[0];
                var value = d[key];
                all[key.slice(1)] = value._value.split('+');
                return all;
            }, {}),
            paradigmLocales: tslib_1.__spreadArray(tslib_1.__spreadArray([], paradigmLocales, true), paradigmLocales.map(function (l) {
                return new Intl.Locale(l.replace(/_/g, '-')).maximize().toString();
            }), true),
        };
    }
    return PROCESSED_DATA;
}
function isMatched(locale, languageMatchInfoLocale, matchVariables) {
    var _a = languageMatchInfoLocale.split('-'), language = _a[0], script = _a[1], region = _a[2];
    var matches = true;
    if (region && region[0] === '$') {
        var shouldInclude = region[1] !== '!';
        var matchRegions = shouldInclude
            ? matchVariables[region.slice(1)]
            : matchVariables[region.slice(2)];
        var expandedMatchedRegions = matchRegions
            .map(function (r) { return regions_generated_1.regions[r] || [r]; })
            .reduce(function (all, list) { return tslib_1.__spreadArray(tslib_1.__spreadArray([], all, true), list, true); }, []);
        matches && (matches = !(expandedMatchedRegions.indexOf(locale.region || '') > 1 !=
            shouldInclude));
    }
    else {
        matches && (matches = locale.region
            ? region === '*' || region === locale.region
            : true);
    }
    matches && (matches = locale.script ? script === '*' || script === locale.script : true);
    matches && (matches = locale.language
        ? language === '*' || language === locale.language
        : true);
    return matches;
}
function serializeLSR(lsr) {
    return [lsr.language, lsr.script, lsr.region].filter(Boolean).join('-');
}
function findMatchingDistanceForLSR(desired, supported, data) {
    for (var _i = 0, _a = data.matches; _i < _a.length; _i++) {
        var d = _a[_i];
        var matches = isMatched(desired, d.desired, data.matchVariables) &&
            isMatched(supported, d.supported, data.matchVariables);
        if (!d.oneway && !matches) {
            matches =
                isMatched(desired, d.supported, data.matchVariables) &&
                    isMatched(supported, d.desired, data.matchVariables);
        }
        if (matches) {
            var distance = d.distance * 10;
            if (data.paradigmLocales.indexOf(serializeLSR(desired)) > -1 !=
                data.paradigmLocales.indexOf(serializeLSR(supported)) > -1) {
                return distance - 1;
            }
            return distance;
        }
    }
    throw new Error('No matching distance found');
}
function findMatchingDistance(desired, supported) {
    var desiredLocale = new Intl.Locale(desired).maximize();
    var supportedLocale = new Intl.Locale(supported).maximize();
    var desiredLSR = {
        language: desiredLocale.language,
        script: desiredLocale.script || '',
        region: desiredLocale.region || '',
    };
    var supportedLSR = {
        language: supportedLocale.language,
        script: supportedLocale.script || '',
        region: supportedLocale.region || '',
    };
    var matchingDistance = 0;
    var data = processData();
    if (desiredLSR.language !== supportedLSR.language) {
        matchingDistance += findMatchingDistanceForLSR({
            language: desiredLocale.language,
            script: '',
            region: '',
        }, {
            language: supportedLocale.language,
            script: '',
            region: '',
        }, data);
    }
    if (desiredLSR.script !== supportedLSR.script) {
        matchingDistance += findMatchingDistanceForLSR({
            language: desiredLocale.language,
            script: desiredLSR.script,
            region: '',
        }, {
            language: supportedLocale.language,
            script: desiredLSR.script,
            region: '',
        }, data);
    }
    if (desiredLSR.region !== supportedLSR.region) {
        matchingDistance += findMatchingDistanceForLSR(desiredLSR, supportedLSR, data);
    }
    return matchingDistance;
}
function findBestMatch(requestedLocales, supportedLocales, threshold) {
    if (threshold === void 0) { threshold = DEFAULT_MATCHING_THRESHOLD; }
    var lowestDistance = Infinity;
    var result = {
        matchedDesiredLocale: '',
        distances: {},
    };
    requestedLocales.forEach(function (desired, i) {
        if (!result.distances[desired]) {
            result.distances[desired] = {};
        }
        supportedLocales.forEach(function (supported) {
            // Add some weight to the distance based on the order of the supported locales
            // Add penalty for the order of the requested locales, which currently is 0 since ECMA-402
            // doesn't really have room for weighted locales like `en; q=0.1`
            var distance = findMatchingDistance(desired, supported) + 0 + i * 40;
            result.distances[desired][supported] = distance;
            if (distance < lowestDistance) {
                lowestDistance = distance;
                result.matchedDesiredLocale = desired;
                result.matchedSupportedLocale = supported;
            }
        });
    });
    if (lowestDistance >= threshold) {
        result.matchedDesiredLocale = undefined;
        result.matchedSupportedLocale = undefined;
    }
    return result;
}

},{"./languageMatching":58,"./regions.generated":59,"tslib":74}],61:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResolveLocale = exports.LookupSupportedLocales = void 0;
exports.match = match;
var CanonicalizeLocaleList_1 = require("./abstract/CanonicalizeLocaleList");
var ResolveLocale_1 = require("./abstract/ResolveLocale");
function match(requestedLocales, availableLocales, defaultLocale, opts) {
    return (0, ResolveLocale_1.ResolveLocale)(availableLocales, (0, CanonicalizeLocaleList_1.CanonicalizeLocaleList)(requestedLocales), {
        localeMatcher: (opts === null || opts === void 0 ? void 0 : opts.algorithm) || 'best fit',
    }, [], {}, function () { return defaultLocale; }).locale;
}
var LookupSupportedLocales_1 = require("./abstract/LookupSupportedLocales");
Object.defineProperty(exports, "LookupSupportedLocales", { enumerable: true, get: function () { return LookupSupportedLocales_1.LookupSupportedLocales; } });
var ResolveLocale_2 = require("./abstract/ResolveLocale");
Object.defineProperty(exports, "ResolveLocale", { enumerable: true, get: function () { return ResolveLocale_2.ResolveLocale; } });

},{"./abstract/CanonicalizeLocaleList":50,"./abstract/LookupSupportedLocales":55,"./abstract/ResolveLocale":56}],62:[function(require,module,exports){
(function (global){(function (){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _1 = require("./");
if (typeof Intl === 'undefined') {
    if (typeof window !== 'undefined') {
        Object.defineProperty(window, 'Intl', {
            value: {},
        });
        // @ts-ignore we don't include @types/node so global isn't a thing
    }
    else if (typeof global !== 'undefined') {
        // @ts-ignore we don't include @types/node so global isn't a thing
        Object.defineProperty(global, 'Intl', {
            value: {},
        });
    }
}
Object.defineProperty(Intl, 'DurationFormat', {
    value: _1.DurationFormat,
});

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./":2}],63:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DurationRecordSign = DurationRecordSign;
var constants_1 = require("../constants");
function DurationRecordSign(record) {
    for (var _i = 0, TABLE_1_1 = constants_1.TABLE_1; _i < TABLE_1_1.length; _i++) {
        var key = TABLE_1_1[_i];
        if (record[key] < 0) {
            return -1;
        }
        if (record[key] > 0) {
            return 1;
        }
    }
    return 0;
}

},{"../constants":69}],64:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetDurationUnitOptions = GetDurationUnitOptions;
var ecma402_abstract_1 = require("@formatjs/ecma402-abstract");
function GetDurationUnitOptions(unit, options, baseStyle, stylesList, digitalBase, prevStyle) {
    var style = (0, ecma402_abstract_1.GetOption)(options, unit, 'string', stylesList, undefined);
    var displayDefault = 'always';
    if (style === undefined) {
        if (baseStyle === 'digital') {
            if (unit !== 'hours' && unit !== 'minutes' && unit !== 'seconds') {
                displayDefault = 'auto';
            }
            style = digitalBase;
        }
        else {
            displayDefault = 'auto';
            if (prevStyle === 'numeric' || prevStyle === '2-digit') {
                style = 'numeric';
            }
            else {
                style = baseStyle;
            }
        }
    }
    var displayField = "".concat(unit, "Display");
    var display = (0, ecma402_abstract_1.GetOption)(options, displayField, 'string', ['always', 'auto'], displayDefault);
    if (prevStyle === 'numeric' || prevStyle === '2-digit') {
        if (style !== 'numeric' && style !== '2-digit') {
            throw new RangeError("Can't mix numeric and non-numeric styles");
        }
        else if (unit === 'minutes' || unit === 'seconds') {
            style = '2-digit';
        }
        if (style === 'numeric' &&
            display === 'always' &&
            (unit === 'milliseconds' ||
                unit === 'microseconds' ||
                unit === 'nanoseconds')) {
            throw new RangeError("Can't display milliseconds, microseconds, or nanoseconds in numeric format");
        }
    }
    return {
        style: style,
        display: display,
    };
}

},{"@formatjs/ecma402-abstract":39}],65:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsValidDurationRecord = IsValidDurationRecord;
var ecma402_abstract_1 = require("@formatjs/ecma402-abstract");
var constants_1 = require("../constants");
var DurationRecordSign_1 = require("./DurationRecordSign");
function IsValidDurationRecord(record) {
    var sign = (0, DurationRecordSign_1.DurationRecordSign)(record);
    for (var _i = 0, TABLE_1_1 = constants_1.TABLE_1; _i < TABLE_1_1.length; _i++) {
        var key = TABLE_1_1[_i];
        var v = record[key];
        (0, ecma402_abstract_1.invariant)(isFinite(Number(v)), "".concat(key, " is not finite"));
        if (v < 0 && sign > 0) {
            return false;
        }
        if (v > 0 && sign < 0) {
            return false;
        }
    }
    return true;
}

},{"../constants":69,"./DurationRecordSign":63,"@formatjs/ecma402-abstract":39}],66:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartitionDurationFormatPattern = PartitionDurationFormatPattern;
var ecma402_abstract_1 = require("@formatjs/ecma402-abstract");
var constants_1 = require("../constants");
var core_1 = require("../core");
var get_internal_slots_1 = require("../get_internal_slots");
function PartitionDurationFormatPattern(df, duration) {
    var result = [];
    var done = false;
    var separated = false;
    var internalSlots = (0, get_internal_slots_1.getInternalSlots)(df);
    var dataLocale = internalSlots.dataLocale;
    var dataLocaleData = core_1.DurationFormat.localeData[dataLocale];
    if (!dataLocaleData) {
        throw new TypeError('Invalid locale');
    }
    var numberingSystem = internalSlots.numberingSystem;
    var separator = dataLocaleData.digitalFormat[numberingSystem];
    var _loop_1 = function (i) {
        var row = constants_1.TABLE_2[i];
        var value = duration[row.valueField];
        var style = internalSlots[row.styleSlot];
        var display = internalSlots[row.displaySlot];
        var unit = row.unit, numberFormatUnit = row.numberFormatUnit;
        var nfOpts = Object.create(null);
        if (unit === 'seconds' ||
            unit === 'milliseconds' ||
            unit === 'microseconds') {
            var nextStyle = void 0;
            if (unit === 'seconds') {
                nextStyle = internalSlots.milliseconds;
            }
            else if (unit === 'milliseconds') {
                nextStyle = internalSlots.microseconds;
            }
            else {
                nextStyle = internalSlots.nanoseconds;
            }
            if (nextStyle === 'numeric') {
                if (unit === 'seconds') {
                    value +=
                        duration.milliseconds / 1e3 +
                            duration.microseconds / 1e6 +
                            duration.nanoseconds / 1e9;
                }
                else if (unit === 'milliseconds') {
                    value += duration.microseconds / 1e3 + duration.nanoseconds / 1e6;
                }
                else {
                    value += duration.nanoseconds / 1e3;
                }
                if (internalSlots.fractionalDigits === undefined) {
                    nfOpts.maximumFractionDigits = 9;
                    nfOpts.minimumFractionDigits = 0;
                }
                else {
                    nfOpts.maximumFractionDigits = internalSlots.fractionalDigits;
                    nfOpts.minimumFractionDigits = internalSlots.fractionalDigits;
                }
                nfOpts.roundingMode = 'trunc';
                done = true;
            }
        }
        if (value !== 0 || display !== 'auto') {
            nfOpts.numberingSystem = internalSlots.numberingSystem;
            if (style === '2-digit') {
                nfOpts.minimumIntegerDigits = 2;
            }
            if (style !== '2-digit' && style !== 'numeric') {
                nfOpts.style = 'unit';
                nfOpts.unit = numberFormatUnit;
                nfOpts.unitDisplay = style;
            }
            var nf = (0, ecma402_abstract_1.createMemoizedNumberFormat)(internalSlots.locale, nfOpts);
            var list_1;
            if (!separated) {
                list_1 = [];
            }
            else {
                list_1 = result[result.length - 1];
                list_1.push({
                    type: 'literal',
                    value: separator,
                });
            }
            var parts = nf.formatToParts(value);
            parts.forEach(function (_a) {
                var type = _a.type, value = _a.value;
                list_1.push({
                    type: type,
                    value: value,
                    unit: numberFormatUnit,
                });
            });
            if (!separated) {
                if (style === '2-digit' || style === 'numeric') {
                    separated = true;
                }
                result.push(list_1);
            }
        }
        else {
            separated = false;
        }
    };
    for (var i = 0; i < constants_1.TABLE_2.length && !done; i++) {
        _loop_1(i);
    }
    var lfOpts = Object.create(null);
    lfOpts.type = 'unit';
    var listStyle = internalSlots.style;
    if (listStyle === 'digital') {
        listStyle = 'short';
    }
    lfOpts.style = listStyle;
    var lf = (0, ecma402_abstract_1.createMemoizedListFormat)(internalSlots.locale, lfOpts);
    var strings = [];
    for (var _i = 0, result_1 = result; _i < result_1.length; _i++) {
        var parts = result_1[_i];
        var string = '';
        for (var _a = 0, parts_1 = parts; _a < parts_1.length; _a++) {
            var value = parts_1[_a].value;
            string += value;
        }
        strings.push(string);
    }
    var formatted = lf.formatToParts(strings);
    var resultIndex = 0;
    var resultLength = result.length;
    var flattened = [];
    for (var _b = 0, formatted_1 = formatted; _b < formatted_1.length; _b++) {
        var _c = formatted_1[_b], type = _c.type, value = _c.value;
        if (type === 'element') {
            (0, ecma402_abstract_1.invariant)(resultIndex < resultLength, 'Index out of bounds');
            var parts = result[resultIndex];
            for (var _d = 0, parts_2 = parts; _d < parts_2.length; _d++) {
                var part = parts_2[_d];
                flattened.push(part);
            }
            resultIndex++;
        }
        else {
            (0, ecma402_abstract_1.invariant)(type === 'literal', 'Type must be literal');
            flattened.push({
                type: 'literal',
                value: value,
            });
        }
    }
    return flattened;
}

},{"../constants":69,"../core":70,"../get_internal_slots":71,"@formatjs/ecma402-abstract":39}],67:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToDurationRecord = ToDurationRecord;
var IsValidDurationRecord_1 = require("./IsValidDurationRecord");
var ToIntegerIfIntegral_1 = require("./ToIntegerIfIntegral");
function ToDurationRecord(input) {
    if (typeof input !== 'object') {
        if (typeof input === 'string') {
            throw new RangeError('Invalid duration format');
        }
        throw new TypeError('Invalid duration');
    }
    var result = {
        years: 0,
        months: 0,
        weeks: 0,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        milliseconds: 0,
        microseconds: 0,
        nanoseconds: 0,
    };
    if (input.days !== undefined) {
        result.days = (0, ToIntegerIfIntegral_1.ToIntegerIfIntegral)(input.days);
    }
    if (input.hours !== undefined) {
        result.hours = (0, ToIntegerIfIntegral_1.ToIntegerIfIntegral)(input.hours);
    }
    if (input.microseconds !== undefined) {
        result.microseconds = (0, ToIntegerIfIntegral_1.ToIntegerIfIntegral)(input.microseconds);
    }
    if (input.milliseconds !== undefined) {
        result.milliseconds = (0, ToIntegerIfIntegral_1.ToIntegerIfIntegral)(input.milliseconds);
    }
    if (input.minutes !== undefined) {
        result.minutes = (0, ToIntegerIfIntegral_1.ToIntegerIfIntegral)(input.minutes);
    }
    if (input.months !== undefined) {
        result.months = (0, ToIntegerIfIntegral_1.ToIntegerIfIntegral)(input.months);
    }
    if (input.nanoseconds !== undefined) {
        result.nanoseconds = (0, ToIntegerIfIntegral_1.ToIntegerIfIntegral)(input.nanoseconds);
    }
    if (input.seconds !== undefined) {
        result.seconds = (0, ToIntegerIfIntegral_1.ToIntegerIfIntegral)(input.seconds);
    }
    if (input.weeks !== undefined) {
        result.weeks = (0, ToIntegerIfIntegral_1.ToIntegerIfIntegral)(input.weeks);
    }
    if (input.years !== undefined) {
        result.years = (0, ToIntegerIfIntegral_1.ToIntegerIfIntegral)(input.years);
    }
    if (input.years === undefined &&
        input.months === undefined &&
        input.weeks === undefined &&
        input.days === undefined &&
        input.hours === undefined &&
        input.minutes === undefined &&
        input.seconds === undefined &&
        input.milliseconds === undefined &&
        input.microseconds === undefined &&
        input.nanoseconds === undefined) {
        throw new TypeError('Invalid duration format');
    }
    if (!(0, IsValidDurationRecord_1.IsValidDurationRecord)(result)) {
        throw new RangeError('Invalid duration format');
    }
    return result;
}

},{"./IsValidDurationRecord":65,"./ToIntegerIfIntegral":68}],68:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToIntegerIfIntegral = ToIntegerIfIntegral;
var ecma402_abstract_1 = require("@formatjs/ecma402-abstract");
function ToIntegerIfIntegral(arg) {
    var number = (0, ecma402_abstract_1.ToNumber)(arg);
    if (!Number.isInteger(number)) {
        throw new RangeError("".concat(arg, " is not an integer"));
    }
    return number;
}

},{"@formatjs/ecma402-abstract":39}],69:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TABLE_2 = exports.TABLE_1 = void 0;
exports.TABLE_1 = [
    'years',
    'months',
    'weeks',
    'days',
    'hours',
    'minutes',
    'seconds',
    'milliseconds',
    'microseconds',
    'nanoseconds',
];
exports.TABLE_2 = [
    {
        valueField: 'years',
        styleSlot: 'years',
        displaySlot: 'yearsDisplay',
        unit: 'years',
        numberFormatUnit: 'year',
    },
    {
        valueField: 'months',
        styleSlot: 'months',
        displaySlot: 'monthsDisplay',
        unit: 'months',
        numberFormatUnit: 'month',
    },
    {
        valueField: 'weeks',
        styleSlot: 'weeks',
        displaySlot: 'weeksDisplay',
        unit: 'weeks',
        numberFormatUnit: 'week',
    },
    {
        valueField: 'days',
        styleSlot: 'days',
        displaySlot: 'daysDisplay',
        unit: 'days',
        numberFormatUnit: 'day',
    },
    {
        valueField: 'hours',
        styleSlot: 'hours',
        displaySlot: 'hoursDisplay',
        unit: 'hours',
        numberFormatUnit: 'hour',
    },
    {
        valueField: 'minutes',
        styleSlot: 'minutes',
        displaySlot: 'minutesDisplay',
        unit: 'minutes',
        numberFormatUnit: 'minute',
    },
    {
        valueField: 'seconds',
        styleSlot: 'seconds',
        displaySlot: 'secondsDisplay',
        unit: 'seconds',
        numberFormatUnit: 'second',
    },
    {
        valueField: 'milliseconds',
        styleSlot: 'milliseconds',
        displaySlot: 'millisecondsDisplay',
        unit: 'milliseconds',
        numberFormatUnit: 'millisecond',
    },
    {
        valueField: 'microseconds',
        styleSlot: 'microseconds',
        displaySlot: 'microsecondsDisplay',
        unit: 'microseconds',
        numberFormatUnit: 'microsecond',
    },
    {
        valueField: 'nanoseconds',
        styleSlot: 'nanoseconds',
        displaySlot: 'nanosecondsDisplay',
        unit: 'nanoseconds',
        numberFormatUnit: 'nanosecond',
    },
];

},{}],70:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DurationFormat = void 0;
var ecma402_abstract_1 = require("@formatjs/ecma402-abstract");
var intl_localematcher_1 = require("@formatjs/intl-localematcher");
var GetDurationUnitOptions_1 = require("./abstract/GetDurationUnitOptions");
var PartitionDurationFormatPattern_1 = require("./abstract/PartitionDurationFormatPattern");
var ToDurationRecord_1 = require("./abstract/ToDurationRecord");
var get_internal_slots_1 = require("./get_internal_slots");
var numbering_systems_generated_1 = require("./numbering-systems.generated");
var time_separators_generated_1 = require("./time-separators.generated");
var RESOLVED_OPTIONS_KEYS = [
    'locale',
    'style',
    'years',
    'yearsDisplay',
    'months',
    'monthsDisplay',
    'weeks',
    'weeksDisplay',
    'days',
    'daysDisplay',
    'hours',
    'hoursDisplay',
    'minutes',
    'minutesDisplay',
    'seconds',
    'secondsDisplay',
    'milliseconds',
    'millisecondsDisplay',
    'microseconds',
    'microsecondsDisplay',
    'nanoseconds',
    'nanosecondsDisplay',
    'numberingSystem',
    'fractionalDigits',
];
var TABLE_3 = [
    {
        styleSlot: 'years',
        displaySlot: 'yearsDisplay',
        unit: 'years',
        values: ['long', 'short', 'narrow'],
        digitalDefault: 'short',
    },
    {
        styleSlot: 'months',
        displaySlot: 'monthsDisplay',
        unit: 'months',
        values: ['long', 'short', 'narrow'],
        digitalDefault: 'short',
    },
    {
        styleSlot: 'weeks',
        displaySlot: 'weeksDisplay',
        unit: 'weeks',
        values: ['long', 'short', 'narrow'],
        digitalDefault: 'short',
    },
    {
        styleSlot: 'days',
        displaySlot: 'daysDisplay',
        unit: 'days',
        values: ['long', 'short', 'narrow'],
        digitalDefault: 'short',
    },
    {
        styleSlot: 'hours',
        displaySlot: 'hoursDisplay',
        unit: 'hours',
        values: ['long', 'short', 'narrow', 'numeric', '2-digit'],
        digitalDefault: 'numeric',
    },
    {
        styleSlot: 'minutes',
        displaySlot: 'minutesDisplay',
        unit: 'minutes',
        values: ['long', 'short', 'narrow', 'numeric', '2-digit'],
        digitalDefault: 'numeric',
    },
    {
        styleSlot: 'seconds',
        displaySlot: 'secondsDisplay',
        unit: 'seconds',
        values: ['long', 'short', 'narrow', 'numeric', '2-digit'],
        digitalDefault: 'numeric',
    },
    {
        styleSlot: 'milliseconds',
        displaySlot: 'millisecondsDisplay',
        unit: 'milliseconds',
        values: ['long', 'short', 'narrow', 'numeric'],
        digitalDefault: 'numeric',
    },
    {
        styleSlot: 'microseconds',
        displaySlot: 'microsecondsDisplay',
        unit: 'microseconds',
        values: ['long', 'short', 'narrow', 'numeric'],
        digitalDefault: 'numeric',
    },
    {
        styleSlot: 'nanoseconds',
        displaySlot: 'nanosecondsDisplay',
        unit: 'nanoseconds',
        values: ['long', 'short', 'narrow', 'numeric'],
        digitalDefault: 'numeric',
    },
];
var DurationFormat = /** @class */ (function () {
    function DurationFormat(locales, options) {
        // test262/test/intl402/ListFormat/constructor/constructor/newtarget-undefined.js
        // Cannot use `new.target` bc of IE11 & TS transpiles it to something else
        var newTarget = this && this instanceof DurationFormat ? this.constructor : void 0;
        if (!newTarget) {
            throw new TypeError("Intl.DurationFormat must be called with 'new'");
        }
        var requestedLocales = (0, ecma402_abstract_1.CanonicalizeLocaleList)(locales);
        var opt = Object.create(null);
        var opts = options === undefined ? Object.create(null) : (0, ecma402_abstract_1.ToObject)(options);
        var matcher = (0, ecma402_abstract_1.GetOption)(opts, 'localeMatcher', 'string', ['best fit', 'lookup'], 'best fit');
        var numberingSystem = (0, ecma402_abstract_1.GetOption)(opts, 'numberingSystem', 'string', undefined, undefined);
        if (numberingSystem !== undefined &&
            numbering_systems_generated_1.numberingSystemNames.indexOf(numberingSystem) < 0) {
            // 8.a. If numberingSystem does not match the Unicode Locale Identifier type nonterminal,
            // throw a RangeError exception.
            throw RangeError("Invalid numberingSystems: ".concat(numberingSystem));
        }
        opt.nu = numberingSystem;
        opt.localeMatcher = matcher;
        var localeData = DurationFormat.localeData, availableLocales = DurationFormat.availableLocales;
        var r = (0, intl_localematcher_1.ResolveLocale)(availableLocales, requestedLocales, opt, 
        // [[RelevantExtensionKeys]] slot, which is a constant
        ['nu'], localeData, DurationFormat.getDefaultLocale);
        var locale = r.locale;
        var internalSlots = (0, get_internal_slots_1.getInternalSlots)(this);
        internalSlots.initializedDurationFormat = true;
        internalSlots.locale = locale;
        internalSlots.numberingSystem = r.nu;
        var style = (0, ecma402_abstract_1.GetOption)(opts, 'style', 'string', ['long', 'short', 'narrow', 'digital'], 'short');
        internalSlots.style = style;
        internalSlots.dataLocale = r.dataLocale;
        var prevStyle = '';
        TABLE_3.forEach(function (row) {
            var styleSlot = row.styleSlot, displaySlot = row.displaySlot, unit = row.unit, valueList = row.values, digitalBase = row.digitalDefault;
            var unitOptions = (0, GetDurationUnitOptions_1.GetDurationUnitOptions)(unit, opts, style, valueList, digitalBase, prevStyle);
            internalSlots[styleSlot] = unitOptions.style;
            internalSlots[displaySlot] = unitOptions.display;
            if (unit === 'hours' ||
                unit === 'minutes' ||
                unit === 'seconds' ||
                unit === 'milliseconds' ||
                unit === 'microseconds') {
                prevStyle = unitOptions.style;
            }
        });
        internalSlots.fractionalDigits = (0, ecma402_abstract_1.GetNumberOption)(opts, 'fractionalDigits', 0, 9, undefined);
    }
    DurationFormat.prototype.resolvedOptions = function () {
        if (typeof this !== 'object' ||
            !(0, ecma402_abstract_1.OrdinaryHasInstance)(DurationFormat, this)) {
            throw TypeError('Method Intl.DurationFormat.prototype.resolvedOptions called on incompatible receiver');
        }
        var internalSlots = (0, get_internal_slots_1.getInternalSlots)(this);
        var ro = {};
        for (var _i = 0, RESOLVED_OPTIONS_KEYS_1 = RESOLVED_OPTIONS_KEYS; _i < RESOLVED_OPTIONS_KEYS_1.length; _i++) {
            var key = RESOLVED_OPTIONS_KEYS_1[_i];
            var v = internalSlots[key];
            if (key === 'fractionalDigits') {
                if (v !== undefined) {
                    v = Number(v);
                }
            }
            else {
                (0, ecma402_abstract_1.invariant)(v !== undefined, "Missing internal slot ".concat(key));
            }
            ro[key] = v;
        }
        return ro;
    };
    DurationFormat.prototype.formatToParts = function (duration) {
        var df = this;
        var locInternalSlots = (0, get_internal_slots_1.getInternalSlots)(this);
        if (locInternalSlots.initializedDurationFormat === undefined) {
            throw new TypeError('Error uninitialized locale');
        }
        var record = (0, ToDurationRecord_1.ToDurationRecord)(duration);
        var parts = (0, PartitionDurationFormatPattern_1.PartitionDurationFormatPattern)(df, record);
        var result = [];
        for (var _i = 0, parts_1 = parts; _i < parts_1.length; _i++) {
            var _a = parts_1[_i], type = _a.type, unit = _a.unit, value = _a.value;
            var obj = { type: type, value: value };
            if (unit) {
                obj.unit = unit;
            }
            result.push(obj);
        }
        return result;
    };
    DurationFormat.prototype.format = function (duration) {
        var df = this;
        var locInternalSlots = (0, get_internal_slots_1.getInternalSlots)(this);
        if (locInternalSlots.initializedDurationFormat === undefined) {
            throw new TypeError('Error uninitialized locale');
        }
        var record = (0, ToDurationRecord_1.ToDurationRecord)(duration);
        var parts = (0, PartitionDurationFormatPattern_1.PartitionDurationFormatPattern)(df, record);
        var result = '';
        for (var _i = 0, parts_2 = parts; _i < parts_2.length; _i++) {
            var value = parts_2[_i].value;
            result += value;
        }
        return result;
    };
    DurationFormat.supportedLocalesOf = function (locales, options) {
        return (0, ecma402_abstract_1.SupportedLocales)(DurationFormat.availableLocales, (0, ecma402_abstract_1.CanonicalizeLocaleList)(locales), options);
    };
    DurationFormat.__defaultLocale = 'en';
    DurationFormat.availableLocales = new Set();
    DurationFormat.localeData = Object.keys(time_separators_generated_1.TIME_SEPARATORS.localeData).reduce(function (all, locale) {
        DurationFormat.availableLocales.add(locale);
        var nu = time_separators_generated_1.TIME_SEPARATORS.localeData[locale].nu;
        all[locale] = {
            nu: nu,
            digitalFormat: time_separators_generated_1.TIME_SEPARATORS.localeData[locale].separator ||
                nu.reduce(function (separators, n) {
                    separators[n] = time_separators_generated_1.TIME_SEPARATORS.default;
                    return separators;
                }, {}),
        };
        return all;
    }, {});
    DurationFormat.getDefaultLocale = function () {
        return DurationFormat.__defaultLocale;
    };
    DurationFormat.polyfilled = true;
    return DurationFormat;
}());
exports.DurationFormat = DurationFormat;

},{"./abstract/GetDurationUnitOptions":64,"./abstract/PartitionDurationFormatPattern":66,"./abstract/ToDurationRecord":67,"./get_internal_slots":71,"./numbering-systems.generated":72,"./time-separators.generated":73,"@formatjs/ecma402-abstract":39,"@formatjs/intl-localematcher":61}],71:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInternalSlots = getInternalSlots;
var internalSlotMap = new WeakMap();
function getInternalSlots(x) {
    var internalSlots = internalSlotMap.get(x);
    if (!internalSlots) {
        internalSlots = Object.create(null);
        internalSlotMap.set(x, internalSlots);
    }
    return internalSlots;
}

},{}],72:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.numberingSystemNames = void 0;
exports.numberingSystemNames = ["adlm", "ahom", "arab", "arabext", "armn", "armnlow", "bali", "beng", "bhks", "brah", "cakm", "cham", "cyrl", "deva", "diak", "ethi", "fullwide", "gara", "geor", "gong", "gonm", "grek", "greklow", "gujr", "gukh", "guru", "hanidays", "hanidec", "hans", "hansfin", "hant", "hantfin", "hebr", "hmng", "hmnp", "java", "jpan", "jpanfin", "jpanyear", "kali", "kawi", "khmr", "knda", "krai", "lana", "lanatham", "laoo", "latn", "lepc", "limb", "mathbold", "mathdbl", "mathmono", "mathsanb", "mathsans", "mlym", "modi", "mong", "mroo", "mtei", "mymr", "mymrepka", "mymrpao", "mymrshan", "mymrtlng", "nagm", "newa", "nkoo", "olck", "onao", "orya", "osma", "outlined", "rohg", "roman", "romanlow", "saur", "segment", "shrd", "sind", "sinh", "sora", "sund", "sunu", "takr", "talu", "taml", "tamldec", "telu", "thai", "tibt", "tirh", "tnsa", "vaii", "wara", "wcho"];

},{}],73:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TIME_SEPARATORS = void 0;
/* @generated */
// prettier-ignore
exports.TIME_SEPARATORS = {
    "default": ":",
    "localeData": {
        "aa": {
            "nu": [
                "latn"
            ]
        },
        "aa-DJ": {
            "nu": [
                "latn"
            ]
        },
        "aa-ER": {
            "nu": [
                "latn"
            ]
        },
        "ab": {
            "nu": [
                "latn"
            ]
        },
        "af": {
            "nu": [
                "latn"
            ]
        },
        "af-NA": {
            "nu": [
                "latn"
            ]
        },
        "agq": {
            "nu": [
                "latn"
            ]
        },
        "ak": {
            "nu": [
                "latn"
            ]
        },
        "am": {
            "nu": [
                "latn"
            ]
        },
        "an": {
            "nu": [
                "latn"
            ]
        },
        "ann": {
            "nu": [
                "latn"
            ]
        },
        "apc": {
            "nu": [
                "latn"
            ]
        },
        "ar": {
            "nu": [
                "latn",
                "latn"
            ]
        },
        "ar-AE": {
            "nu": [
                "latn",
                "latn"
            ]
        },
        "ar-BH": {
            "nu": [
                "arab",
                "latn"
            ]
        },
        "ar-DJ": {
            "nu": [
                "arab",
                "latn"
            ]
        },
        "ar-DZ": {
            "nu": [
                "latn",
                "latn"
            ]
        },
        "ar-EG": {
            "nu": [
                "arab",
                "latn"
            ]
        },
        "ar-EH": {
            "nu": [
                "latn",
                "latn"
            ]
        },
        "ar-ER": {
            "nu": [
                "arab",
                "latn"
            ]
        },
        "ar-IL": {
            "nu": [
                "arab",
                "latn"
            ]
        },
        "ar-IQ": {
            "nu": [
                "arab",
                "latn"
            ]
        },
        "ar-JO": {
            "nu": [
                "arab",
                "latn"
            ]
        },
        "ar-KM": {
            "nu": [
                "arab",
                "latn"
            ]
        },
        "ar-KW": {
            "nu": [
                "arab",
                "latn"
            ]
        },
        "ar-LB": {
            "nu": [
                "arab",
                "latn"
            ]
        },
        "ar-LY": {
            "nu": [
                "latn",
                "latn"
            ]
        },
        "ar-MA": {
            "nu": [
                "latn",
                "latn"
            ]
        },
        "ar-MR": {
            "nu": [
                "arab",
                "latn"
            ]
        },
        "ar-OM": {
            "nu": [
                "arab",
                "latn"
            ]
        },
        "ar-PS": {
            "nu": [
                "arab",
                "latn"
            ]
        },
        "ar-QA": {
            "nu": [
                "arab",
                "latn"
            ]
        },
        "ar-SA": {
            "nu": [
                "arab",
                "latn"
            ]
        },
        "ar-SD": {
            "nu": [
                "arab",
                "latn"
            ]
        },
        "ar-SO": {
            "nu": [
                "arab",
                "latn"
            ]
        },
        "ar-SS": {
            "nu": [
                "arab",
                "latn"
            ]
        },
        "ar-SY": {
            "nu": [
                "arab",
                "latn"
            ]
        },
        "ar-TD": {
            "nu": [
                "arab",
                "latn"
            ]
        },
        "ar-TN": {
            "nu": [
                "latn",
                "latn"
            ]
        },
        "ar-YE": {
            "nu": [
                "arab",
                "latn"
            ]
        },
        "arn": {
            "nu": [
                "latn"
            ]
        },
        "as": {
            "nu": [
                "beng"
            ]
        },
        "asa": {
            "nu": [
                "latn"
            ]
        },
        "ast": {
            "nu": [
                "latn"
            ]
        },
        "az": {
            "nu": [
                "latn"
            ]
        },
        "az-Arab": {
            "nu": [
                "arabext"
            ]
        },
        "az-Arab-IQ": {
            "nu": [
                "arabext"
            ]
        },
        "az-Arab-TR": {
            "nu": [
                "arabext"
            ]
        },
        "az-Cyrl": {
            "nu": [
                "latn"
            ]
        },
        "az-Latn": {
            "nu": [
                "latn"
            ]
        },
        "ba": {
            "nu": [
                "latn"
            ]
        },
        "bal": {
            "nu": [
                "latn"
            ]
        },
        "bal-Arab": {
            "nu": [
                "latn"
            ]
        },
        "bal-Latn": {
            "nu": [
                "latn"
            ]
        },
        "bas": {
            "nu": [
                "latn"
            ]
        },
        "be": {
            "nu": [
                "latn"
            ]
        },
        "be-tarask": {
            "nu": [
                "latn"
            ]
        },
        "bem": {
            "nu": [
                "latn"
            ]
        },
        "bew": {
            "nu": [
                "latn"
            ]
        },
        "bez": {
            "nu": [
                "latn"
            ]
        },
        "bg": {
            "nu": [
                "latn"
            ]
        },
        "bgc": {
            "nu": [
                "deva"
            ]
        },
        "bgn": {
            "nu": [
                "arabext"
            ]
        },
        "bgn-AE": {
            "nu": [
                "arabext"
            ]
        },
        "bgn-AF": {
            "nu": [
                "arabext"
            ]
        },
        "bgn-IR": {
            "nu": [
                "arabext"
            ]
        },
        "bgn-OM": {
            "nu": [
                "arabext"
            ]
        },
        "bho": {
            "nu": [
                "deva"
            ]
        },
        "blo": {
            "nu": [
                "latn"
            ]
        },
        "blt": {
            "nu": [
                "latn"
            ]
        },
        "bm": {
            "nu": [
                "latn"
            ]
        },
        "bm-Nkoo": {
            "nu": [
                "latn"
            ]
        },
        "bn": {
            "nu": [
                "beng"
            ]
        },
        "bn-IN": {
            "nu": [
                "beng"
            ]
        },
        "bo": {
            "nu": [
                "latn"
            ]
        },
        "bo-IN": {
            "nu": [
                "latn"
            ]
        },
        "br": {
            "nu": [
                "latn"
            ]
        },
        "brx": {
            "nu": [
                "latn"
            ]
        },
        "bs": {
            "nu": [
                "latn"
            ]
        },
        "bs-Cyrl": {
            "nu": [
                "latn"
            ]
        },
        "bs-Latn": {
            "nu": [
                "latn"
            ]
        },
        "bss": {
            "nu": [
                "latn"
            ]
        },
        "byn": {
            "nu": [
                "latn"
            ]
        },
        "ca": {
            "nu": [
                "latn"
            ]
        },
        "ca-AD": {
            "nu": [
                "latn"
            ]
        },
        "ca-ES-valencia": {
            "nu": [
                "latn"
            ]
        },
        "ca-FR": {
            "nu": [
                "latn"
            ]
        },
        "ca-IT": {
            "nu": [
                "latn"
            ]
        },
        "cad": {
            "nu": [
                "latn"
            ]
        },
        "cch": {
            "nu": [
                "latn"
            ]
        },
        "ccp": {
            "nu": [
                "cakm"
            ]
        },
        "ccp-IN": {
            "nu": [
                "cakm"
            ]
        },
        "ce": {
            "nu": [
                "latn"
            ]
        },
        "ceb": {
            "nu": [
                "latn"
            ]
        },
        "cgg": {
            "nu": [
                "latn"
            ]
        },
        "cho": {
            "nu": [
                "latn"
            ]
        },
        "chr": {
            "nu": [
                "latn"
            ]
        },
        "cic": {
            "nu": [
                "latn"
            ]
        },
        "ckb": {
            "nu": [
                "arab"
            ]
        },
        "ckb-IR": {
            "nu": [
                "arab"
            ]
        },
        "co": {
            "nu": [
                "latn"
            ]
        },
        "cs": {
            "nu": [
                "latn"
            ]
        },
        "csw": {
            "nu": [
                "latn"
            ]
        },
        "cu": {
            "nu": [
                "latn"
            ]
        },
        "cv": {
            "nu": [
                "latn"
            ]
        },
        "cy": {
            "nu": [
                "latn"
            ]
        },
        "da": {
            "nu": [
                "latn"
            ],
            "separator": {
                "latn": "."
            }
        },
        "da-GL": {
            "nu": [
                "latn"
            ],
            "separator": {
                "latn": "."
            }
        },
        "dav": {
            "nu": [
                "latn"
            ]
        },
        "de": {
            "nu": [
                "latn"
            ]
        },
        "de-AT": {
            "nu": [
                "latn"
            ]
        },
        "de-BE": {
            "nu": [
                "latn"
            ]
        },
        "de-CH": {
            "nu": [
                "latn"
            ]
        },
        "de-IT": {
            "nu": [
                "latn"
            ]
        },
        "de-LI": {
            "nu": [
                "latn"
            ]
        },
        "de-LU": {
            "nu": [
                "latn"
            ]
        },
        "dje": {
            "nu": [
                "latn"
            ]
        },
        "doi": {
            "nu": [
                "latn"
            ]
        },
        "dsb": {
            "nu": [
                "latn"
            ]
        },
        "dua": {
            "nu": [
                "latn"
            ]
        },
        "dv": {
            "nu": [
                "latn"
            ]
        },
        "dyo": {
            "nu": [
                "latn"
            ]
        },
        "dz": {
            "nu": [
                "tibt"
            ]
        },
        "ebu": {
            "nu": [
                "latn"
            ]
        },
        "ee": {
            "nu": [
                "latn"
            ]
        },
        "ee-TG": {
            "nu": [
                "latn"
            ]
        },
        "el": {
            "nu": [
                "latn"
            ]
        },
        "el-CY": {
            "nu": [
                "latn"
            ]
        },
        "el-polyton": {
            "nu": [
                "latn"
            ]
        },
        "en": {
            "nu": [
                "latn"
            ]
        },
        "en-001": {
            "nu": [
                "latn"
            ]
        },
        "en-150": {
            "nu": [
                "latn"
            ]
        },
        "en-AE": {
            "nu": [
                "latn"
            ]
        },
        "en-AG": {
            "nu": [
                "latn"
            ]
        },
        "en-AI": {
            "nu": [
                "latn"
            ]
        },
        "en-AS": {
            "nu": [
                "latn"
            ]
        },
        "en-AT": {
            "nu": [
                "latn"
            ]
        },
        "en-AU": {
            "nu": [
                "latn"
            ]
        },
        "en-BB": {
            "nu": [
                "latn"
            ]
        },
        "en-BE": {
            "nu": [
                "latn"
            ]
        },
        "en-BI": {
            "nu": [
                "latn"
            ]
        },
        "en-BM": {
            "nu": [
                "latn"
            ]
        },
        "en-BS": {
            "nu": [
                "latn"
            ]
        },
        "en-BW": {
            "nu": [
                "latn"
            ]
        },
        "en-BZ": {
            "nu": [
                "latn"
            ]
        },
        "en-CA": {
            "nu": [
                "latn"
            ]
        },
        "en-CC": {
            "nu": [
                "latn"
            ]
        },
        "en-CH": {
            "nu": [
                "latn"
            ]
        },
        "en-CK": {
            "nu": [
                "latn"
            ]
        },
        "en-CM": {
            "nu": [
                "latn"
            ]
        },
        "en-CX": {
            "nu": [
                "latn"
            ]
        },
        "en-CY": {
            "nu": [
                "latn"
            ]
        },
        "en-DE": {
            "nu": [
                "latn"
            ]
        },
        "en-DG": {
            "nu": [
                "latn"
            ]
        },
        "en-DK": {
            "nu": [
                "latn"
            ],
            "separator": {
                "latn": "."
            }
        },
        "en-DM": {
            "nu": [
                "latn"
            ]
        },
        "en-Dsrt": {
            "nu": [
                "latn"
            ]
        },
        "en-ER": {
            "nu": [
                "latn"
            ]
        },
        "en-FI": {
            "nu": [
                "latn"
            ],
            "separator": {
                "latn": "."
            }
        },
        "en-FJ": {
            "nu": [
                "latn"
            ]
        },
        "en-FK": {
            "nu": [
                "latn"
            ]
        },
        "en-FM": {
            "nu": [
                "latn"
            ]
        },
        "en-GB": {
            "nu": [
                "latn"
            ]
        },
        "en-GD": {
            "nu": [
                "latn"
            ]
        },
        "en-GG": {
            "nu": [
                "latn"
            ]
        },
        "en-GH": {
            "nu": [
                "latn"
            ]
        },
        "en-GI": {
            "nu": [
                "latn"
            ]
        },
        "en-GM": {
            "nu": [
                "latn"
            ]
        },
        "en-GU": {
            "nu": [
                "latn"
            ]
        },
        "en-GY": {
            "nu": [
                "latn"
            ]
        },
        "en-HK": {
            "nu": [
                "latn"
            ]
        },
        "en-ID": {
            "nu": [
                "latn"
            ]
        },
        "en-IE": {
            "nu": [
                "latn"
            ]
        },
        "en-IL": {
            "nu": [
                "latn"
            ]
        },
        "en-IM": {
            "nu": [
                "latn"
            ]
        },
        "en-IN": {
            "nu": [
                "latn"
            ]
        },
        "en-IO": {
            "nu": [
                "latn"
            ]
        },
        "en-JE": {
            "nu": [
                "latn"
            ]
        },
        "en-JM": {
            "nu": [
                "latn"
            ]
        },
        "en-KE": {
            "nu": [
                "latn"
            ]
        },
        "en-KI": {
            "nu": [
                "latn"
            ]
        },
        "en-KN": {
            "nu": [
                "latn"
            ]
        },
        "en-KY": {
            "nu": [
                "latn"
            ]
        },
        "en-LC": {
            "nu": [
                "latn"
            ]
        },
        "en-LR": {
            "nu": [
                "latn"
            ]
        },
        "en-LS": {
            "nu": [
                "latn"
            ]
        },
        "en-MG": {
            "nu": [
                "latn"
            ]
        },
        "en-MH": {
            "nu": [
                "latn"
            ]
        },
        "en-MO": {
            "nu": [
                "latn"
            ]
        },
        "en-MP": {
            "nu": [
                "latn"
            ]
        },
        "en-MS": {
            "nu": [
                "latn"
            ]
        },
        "en-MT": {
            "nu": [
                "latn"
            ]
        },
        "en-MU": {
            "nu": [
                "latn"
            ]
        },
        "en-MV": {
            "nu": [
                "latn"
            ]
        },
        "en-MW": {
            "nu": [
                "latn"
            ]
        },
        "en-MY": {
            "nu": [
                "latn"
            ]
        },
        "en-NA": {
            "nu": [
                "latn"
            ]
        },
        "en-NF": {
            "nu": [
                "latn"
            ]
        },
        "en-NG": {
            "nu": [
                "latn"
            ]
        },
        "en-NL": {
            "nu": [
                "latn"
            ]
        },
        "en-NR": {
            "nu": [
                "latn"
            ]
        },
        "en-NU": {
            "nu": [
                "latn"
            ]
        },
        "en-NZ": {
            "nu": [
                "latn"
            ]
        },
        "en-PG": {
            "nu": [
                "latn"
            ]
        },
        "en-PH": {
            "nu": [
                "latn"
            ]
        },
        "en-PK": {
            "nu": [
                "latn"
            ]
        },
        "en-PN": {
            "nu": [
                "latn"
            ]
        },
        "en-PR": {
            "nu": [
                "latn"
            ]
        },
        "en-PW": {
            "nu": [
                "latn"
            ]
        },
        "en-RW": {
            "nu": [
                "latn"
            ]
        },
        "en-SB": {
            "nu": [
                "latn"
            ]
        },
        "en-SC": {
            "nu": [
                "latn"
            ]
        },
        "en-SD": {
            "nu": [
                "latn"
            ]
        },
        "en-SE": {
            "nu": [
                "latn"
            ]
        },
        "en-SG": {
            "nu": [
                "latn"
            ]
        },
        "en-SH": {
            "nu": [
                "latn"
            ]
        },
        "en-SI": {
            "nu": [
                "latn"
            ]
        },
        "en-SL": {
            "nu": [
                "latn"
            ]
        },
        "en-SS": {
            "nu": [
                "latn"
            ]
        },
        "en-SX": {
            "nu": [
                "latn"
            ]
        },
        "en-SZ": {
            "nu": [
                "latn"
            ]
        },
        "en-Shaw": {
            "nu": [
                "latn"
            ]
        },
        "en-TC": {
            "nu": [
                "latn"
            ]
        },
        "en-TK": {
            "nu": [
                "latn"
            ]
        },
        "en-TO": {
            "nu": [
                "latn"
            ]
        },
        "en-TT": {
            "nu": [
                "latn"
            ]
        },
        "en-TV": {
            "nu": [
                "latn"
            ]
        },
        "en-TZ": {
            "nu": [
                "latn"
            ]
        },
        "en-UG": {
            "nu": [
                "latn"
            ]
        },
        "en-UM": {
            "nu": [
                "latn"
            ]
        },
        "en-VC": {
            "nu": [
                "latn"
            ]
        },
        "en-VG": {
            "nu": [
                "latn"
            ]
        },
        "en-VI": {
            "nu": [
                "latn"
            ]
        },
        "en-VU": {
            "nu": [
                "latn"
            ]
        },
        "en-WS": {
            "nu": [
                "latn"
            ]
        },
        "en-ZA": {
            "nu": [
                "latn"
            ]
        },
        "en-ZM": {
            "nu": [
                "latn"
            ]
        },
        "en-ZW": {
            "nu": [
                "latn"
            ]
        },
        "eo": {
            "nu": [
                "latn"
            ]
        },
        "es": {
            "nu": [
                "latn"
            ]
        },
        "es-419": {
            "nu": [
                "latn"
            ]
        },
        "es-AR": {
            "nu": [
                "latn"
            ]
        },
        "es-BO": {
            "nu": [
                "latn"
            ]
        },
        "es-BR": {
            "nu": [
                "latn"
            ]
        },
        "es-BZ": {
            "nu": [
                "latn"
            ]
        },
        "es-CL": {
            "nu": [
                "latn"
            ]
        },
        "es-CO": {
            "nu": [
                "latn"
            ]
        },
        "es-CR": {
            "nu": [
                "latn"
            ]
        },
        "es-CU": {
            "nu": [
                "latn"
            ]
        },
        "es-DO": {
            "nu": [
                "latn"
            ]
        },
        "es-EA": {
            "nu": [
                "latn"
            ]
        },
        "es-EC": {
            "nu": [
                "latn"
            ]
        },
        "es-GQ": {
            "nu": [
                "latn"
            ]
        },
        "es-GT": {
            "nu": [
                "latn"
            ]
        },
        "es-HN": {
            "nu": [
                "latn"
            ]
        },
        "es-IC": {
            "nu": [
                "latn"
            ]
        },
        "es-MX": {
            "nu": [
                "latn"
            ]
        },
        "es-NI": {
            "nu": [
                "latn"
            ]
        },
        "es-PA": {
            "nu": [
                "latn"
            ]
        },
        "es-PE": {
            "nu": [
                "latn"
            ]
        },
        "es-PH": {
            "nu": [
                "latn"
            ]
        },
        "es-PR": {
            "nu": [
                "latn"
            ]
        },
        "es-PY": {
            "nu": [
                "latn"
            ]
        },
        "es-SV": {
            "nu": [
                "latn"
            ]
        },
        "es-US": {
            "nu": [
                "latn"
            ]
        },
        "es-UY": {
            "nu": [
                "latn"
            ]
        },
        "es-VE": {
            "nu": [
                "latn"
            ]
        },
        "et": {
            "nu": [
                "latn"
            ]
        },
        "eu": {
            "nu": [
                "latn"
            ]
        },
        "ewo": {
            "nu": [
                "latn"
            ]
        },
        "fa": {
            "nu": [
                "arabext"
            ]
        },
        "fa-AF": {
            "nu": [
                "arabext"
            ]
        },
        "ff": {
            "nu": [
                "latn"
            ]
        },
        "ff-Adlm": {
            "nu": [
                "adlm"
            ]
        },
        "ff-Adlm-BF": {
            "nu": [
                "adlm"
            ]
        },
        "ff-Adlm-CM": {
            "nu": [
                "adlm"
            ]
        },
        "ff-Adlm-GH": {
            "nu": [
                "adlm"
            ]
        },
        "ff-Adlm-GM": {
            "nu": [
                "adlm"
            ]
        },
        "ff-Adlm-GW": {
            "nu": [
                "adlm"
            ]
        },
        "ff-Adlm-LR": {
            "nu": [
                "adlm"
            ]
        },
        "ff-Adlm-MR": {
            "nu": [
                "adlm"
            ]
        },
        "ff-Adlm-NE": {
            "nu": [
                "adlm"
            ]
        },
        "ff-Adlm-NG": {
            "nu": [
                "adlm"
            ]
        },
        "ff-Adlm-SL": {
            "nu": [
                "adlm"
            ]
        },
        "ff-Adlm-SN": {
            "nu": [
                "adlm"
            ]
        },
        "ff-Latn": {
            "nu": [
                "latn"
            ]
        },
        "ff-Latn-BF": {
            "nu": [
                "latn"
            ]
        },
        "ff-Latn-CM": {
            "nu": [
                "latn"
            ]
        },
        "ff-Latn-GH": {
            "nu": [
                "latn"
            ]
        },
        "ff-Latn-GM": {
            "nu": [
                "latn"
            ]
        },
        "ff-Latn-GN": {
            "nu": [
                "latn"
            ]
        },
        "ff-Latn-GW": {
            "nu": [
                "latn"
            ]
        },
        "ff-Latn-LR": {
            "nu": [
                "latn"
            ]
        },
        "ff-Latn-MR": {
            "nu": [
                "latn"
            ]
        },
        "ff-Latn-NE": {
            "nu": [
                "latn"
            ]
        },
        "ff-Latn-NG": {
            "nu": [
                "latn"
            ]
        },
        "ff-Latn-SL": {
            "nu": [
                "latn"
            ]
        },
        "fi": {
            "nu": [
                "latn"
            ],
            "separator": {
                "latn": "."
            }
        },
        "fil": {
            "nu": [
                "latn"
            ]
        },
        "fo": {
            "nu": [
                "latn"
            ]
        },
        "fo-DK": {
            "nu": [
                "latn"
            ]
        },
        "fr": {
            "nu": [
                "latn"
            ]
        },
        "fr-BE": {
            "nu": [
                "latn"
            ]
        },
        "fr-BF": {
            "nu": [
                "latn"
            ]
        },
        "fr-BI": {
            "nu": [
                "latn"
            ]
        },
        "fr-BJ": {
            "nu": [
                "latn"
            ]
        },
        "fr-BL": {
            "nu": [
                "latn"
            ]
        },
        "fr-CA": {
            "nu": [
                "latn"
            ]
        },
        "fr-CD": {
            "nu": [
                "latn"
            ]
        },
        "fr-CF": {
            "nu": [
                "latn"
            ]
        },
        "fr-CG": {
            "nu": [
                "latn"
            ]
        },
        "fr-CH": {
            "nu": [
                "latn"
            ]
        },
        "fr-CI": {
            "nu": [
                "latn"
            ]
        },
        "fr-CM": {
            "nu": [
                "latn"
            ]
        },
        "fr-DJ": {
            "nu": [
                "latn"
            ]
        },
        "fr-DZ": {
            "nu": [
                "latn"
            ]
        },
        "fr-GA": {
            "nu": [
                "latn"
            ]
        },
        "fr-GF": {
            "nu": [
                "latn"
            ]
        },
        "fr-GN": {
            "nu": [
                "latn"
            ]
        },
        "fr-GP": {
            "nu": [
                "latn"
            ]
        },
        "fr-GQ": {
            "nu": [
                "latn"
            ]
        },
        "fr-HT": {
            "nu": [
                "latn"
            ]
        },
        "fr-KM": {
            "nu": [
                "latn"
            ]
        },
        "fr-LU": {
            "nu": [
                "latn"
            ]
        },
        "fr-MA": {
            "nu": [
                "latn"
            ]
        },
        "fr-MC": {
            "nu": [
                "latn"
            ]
        },
        "fr-MF": {
            "nu": [
                "latn"
            ]
        },
        "fr-MG": {
            "nu": [
                "latn"
            ]
        },
        "fr-ML": {
            "nu": [
                "latn"
            ]
        },
        "fr-MQ": {
            "nu": [
                "latn"
            ]
        },
        "fr-MR": {
            "nu": [
                "latn"
            ]
        },
        "fr-MU": {
            "nu": [
                "latn"
            ]
        },
        "fr-NC": {
            "nu": [
                "latn"
            ]
        },
        "fr-NE": {
            "nu": [
                "latn"
            ]
        },
        "fr-PF": {
            "nu": [
                "latn"
            ]
        },
        "fr-PM": {
            "nu": [
                "latn"
            ]
        },
        "fr-RE": {
            "nu": [
                "latn"
            ]
        },
        "fr-RW": {
            "nu": [
                "latn"
            ]
        },
        "fr-SC": {
            "nu": [
                "latn"
            ]
        },
        "fr-SN": {
            "nu": [
                "latn"
            ]
        },
        "fr-SY": {
            "nu": [
                "latn"
            ]
        },
        "fr-TD": {
            "nu": [
                "latn"
            ]
        },
        "fr-TG": {
            "nu": [
                "latn"
            ]
        },
        "fr-TN": {
            "nu": [
                "latn"
            ]
        },
        "fr-VU": {
            "nu": [
                "latn"
            ]
        },
        "fr-WF": {
            "nu": [
                "latn"
            ]
        },
        "fr-YT": {
            "nu": [
                "latn"
            ]
        },
        "frr": {
            "nu": [
                "latn"
            ]
        },
        "fur": {
            "nu": [
                "latn"
            ]
        },
        "fy": {
            "nu": [
                "latn"
            ]
        },
        "ga": {
            "nu": [
                "latn"
            ]
        },
        "ga-GB": {
            "nu": [
                "latn"
            ]
        },
        "gaa": {
            "nu": [
                "latn"
            ]
        },
        "gd": {
            "nu": [
                "latn"
            ]
        },
        "gez": {
            "nu": [
                "latn"
            ]
        },
        "gez-ER": {
            "nu": [
                "latn"
            ]
        },
        "gl": {
            "nu": [
                "latn"
            ]
        },
        "gn": {
            "nu": [
                "latn"
            ]
        },
        "gsw": {
            "nu": [
                "latn"
            ]
        },
        "gsw-FR": {
            "nu": [
                "latn"
            ]
        },
        "gsw-LI": {
            "nu": [
                "latn"
            ]
        },
        "gu": {
            "nu": [
                "latn"
            ]
        },
        "guz": {
            "nu": [
                "latn"
            ]
        },
        "gv": {
            "nu": [
                "latn"
            ]
        },
        "ha": {
            "nu": [
                "latn"
            ]
        },
        "ha-Arab": {
            "nu": [
                "latn"
            ]
        },
        "ha-Arab-SD": {
            "nu": [
                "latn"
            ]
        },
        "ha-GH": {
            "nu": [
                "latn"
            ]
        },
        "ha-NE": {
            "nu": [
                "latn"
            ]
        },
        "haw": {
            "nu": [
                "latn"
            ]
        },
        "he": {
            "nu": [
                "latn"
            ]
        },
        "hi": {
            "nu": [
                "latn"
            ]
        },
        "hi-Latn": {
            "nu": [
                "latn"
            ]
        },
        "hnj": {
            "nu": [
                "hmnp",
                "latn"
            ]
        },
        "hnj-Hmnp": {
            "nu": [
                "hmnp",
                "latn"
            ]
        },
        "hr": {
            "nu": [
                "latn"
            ]
        },
        "hr-BA": {
            "nu": [
                "latn"
            ]
        },
        "hsb": {
            "nu": [
                "latn"
            ]
        },
        "hu": {
            "nu": [
                "latn"
            ]
        },
        "hy": {
            "nu": [
                "latn"
            ]
        },
        "ia": {
            "nu": [
                "latn"
            ]
        },
        "id": {
            "nu": [
                "latn"
            ],
            "separator": {
                "latn": "."
            }
        },
        "ie": {
            "nu": [
                "latn"
            ]
        },
        "ig": {
            "nu": [
                "latn"
            ]
        },
        "ii": {
            "nu": [
                "latn"
            ]
        },
        "io": {
            "nu": [
                "latn"
            ]
        },
        "is": {
            "nu": [
                "latn"
            ]
        },
        "it": {
            "nu": [
                "latn"
            ]
        },
        "it-CH": {
            "nu": [
                "latn"
            ]
        },
        "it-SM": {
            "nu": [
                "latn"
            ]
        },
        "it-VA": {
            "nu": [
                "latn"
            ]
        },
        "iu": {
            "nu": [
                "latn"
            ]
        },
        "iu-Latn": {
            "nu": [
                "latn"
            ]
        },
        "ja": {
            "nu": [
                "latn"
            ]
        },
        "jbo": {
            "nu": [
                "latn"
            ]
        },
        "jgo": {
            "nu": [
                "latn"
            ]
        },
        "jmc": {
            "nu": [
                "latn"
            ]
        },
        "jv": {
            "nu": [
                "latn"
            ]
        },
        "ka": {
            "nu": [
                "latn"
            ]
        },
        "kaa": {
            "nu": [
                "latn"
            ]
        },
        "kaa-Cyrl": {
            "nu": [
                "latn"
            ]
        },
        "kaa-Latn": {
            "nu": [
                "latn"
            ]
        },
        "kab": {
            "nu": [
                "latn"
            ]
        },
        "kaj": {
            "nu": [
                "latn"
            ]
        },
        "kam": {
            "nu": [
                "latn"
            ]
        },
        "kcg": {
            "nu": [
                "latn"
            ]
        },
        "kde": {
            "nu": [
                "latn"
            ]
        },
        "kea": {
            "nu": [
                "latn"
            ]
        },
        "ken": {
            "nu": [
                "latn"
            ]
        },
        "kgp": {
            "nu": [
                "latn"
            ]
        },
        "khq": {
            "nu": [
                "latn"
            ]
        },
        "ki": {
            "nu": [
                "latn"
            ]
        },
        "kk": {
            "nu": [
                "latn"
            ]
        },
        "kk-Arab": {
            "nu": [
                "latn"
            ]
        },
        "kk-Cyrl": {
            "nu": [
                "latn"
            ]
        },
        "kk-KZ": {
            "nu": [
                "latn"
            ]
        },
        "kkj": {
            "nu": [
                "latn"
            ]
        },
        "kl": {
            "nu": [
                "latn"
            ]
        },
        "kln": {
            "nu": [
                "latn"
            ]
        },
        "km": {
            "nu": [
                "latn"
            ]
        },
        "kn": {
            "nu": [
                "latn"
            ]
        },
        "ko": {
            "nu": [
                "latn"
            ]
        },
        "ko-CN": {
            "nu": [
                "latn"
            ]
        },
        "ko-KP": {
            "nu": [
                "latn"
            ]
        },
        "kok": {
            "nu": [
                "latn"
            ]
        },
        "kok-Deva": {
            "nu": [
                "latn"
            ]
        },
        "kok-Latn": {
            "nu": [
                "latn"
            ]
        },
        "kpe": {
            "nu": [
                "latn"
            ]
        },
        "kpe-GN": {
            "nu": [
                "latn"
            ]
        },
        "ks": {
            "nu": [
                "arabext"
            ]
        },
        "ks-Arab": {
            "nu": [
                "arabext"
            ]
        },
        "ks-Deva": {
            "nu": [
                "latn"
            ]
        },
        "ksb": {
            "nu": [
                "latn"
            ]
        },
        "ksf": {
            "nu": [
                "latn"
            ]
        },
        "ksh": {
            "nu": [
                "latn"
            ]
        },
        "ku": {
            "nu": [
                "latn"
            ]
        },
        "kw": {
            "nu": [
                "latn"
            ]
        },
        "kxv": {
            "nu": [
                "latn"
            ]
        },
        "kxv-Deva": {
            "nu": [
                "latn"
            ]
        },
        "kxv-Latn": {
            "nu": [
                "latn"
            ]
        },
        "kxv-Orya": {
            "nu": [
                "latn"
            ]
        },
        "kxv-Telu": {
            "nu": [
                "latn"
            ]
        },
        "ky": {
            "nu": [
                "latn"
            ]
        },
        "la": {
            "nu": [
                "latn"
            ]
        },
        "lag": {
            "nu": [
                "latn"
            ]
        },
        "lb": {
            "nu": [
                "latn"
            ]
        },
        "lg": {
            "nu": [
                "latn"
            ]
        },
        "lij": {
            "nu": [
                "latn"
            ]
        },
        "lkt": {
            "nu": [
                "latn"
            ]
        },
        "lld": {
            "nu": [
                "latn"
            ]
        },
        "lmo": {
            "nu": [
                "latn"
            ]
        },
        "ln": {
            "nu": [
                "latn"
            ]
        },
        "ln-AO": {
            "nu": [
                "latn"
            ]
        },
        "ln-CF": {
            "nu": [
                "latn"
            ]
        },
        "ln-CG": {
            "nu": [
                "latn"
            ]
        },
        "lo": {
            "nu": [
                "latn"
            ]
        },
        "lrc": {
            "nu": [
                "arabext"
            ]
        },
        "lrc-IQ": {
            "nu": [
                "arabext"
            ]
        },
        "lt": {
            "nu": [
                "latn"
            ]
        },
        "ltg": {
            "nu": [
                "latn"
            ]
        },
        "lu": {
            "nu": [
                "latn"
            ]
        },
        "luo": {
            "nu": [
                "latn"
            ]
        },
        "luy": {
            "nu": [
                "latn"
            ]
        },
        "lv": {
            "nu": [
                "latn"
            ]
        },
        "mai": {
            "nu": [
                "latn"
            ]
        },
        "mas": {
            "nu": [
                "latn"
            ]
        },
        "mas-TZ": {
            "nu": [
                "latn"
            ]
        },
        "mdf": {
            "nu": [
                "latn"
            ]
        },
        "mer": {
            "nu": [
                "latn"
            ]
        },
        "mfe": {
            "nu": [
                "latn"
            ]
        },
        "mg": {
            "nu": [
                "latn"
            ]
        },
        "mgh": {
            "nu": [
                "latn"
            ]
        },
        "mgo": {
            "nu": [
                "latn"
            ]
        },
        "mhn": {
            "nu": [
                "latn"
            ]
        },
        "mi": {
            "nu": [
                "latn"
            ]
        },
        "mic": {
            "nu": [
                "latn"
            ]
        },
        "mk": {
            "nu": [
                "latn"
            ]
        },
        "ml": {
            "nu": [
                "latn"
            ]
        },
        "mn": {
            "nu": [
                "latn"
            ]
        },
        "mn-Mong": {
            "nu": [
                "latn"
            ]
        },
        "mn-Mong-MN": {
            "nu": [
                "latn"
            ]
        },
        "mni": {
            "nu": [
                "beng"
            ]
        },
        "mni-Beng": {
            "nu": [
                "beng"
            ]
        },
        "mni-Mtei": {
            "nu": [
                "mtei"
            ]
        },
        "moh": {
            "nu": [
                "latn"
            ]
        },
        "mr": {
            "nu": [
                "deva"
            ]
        },
        "ms": {
            "nu": [
                "latn"
            ]
        },
        "ms-Arab": {
            "nu": [
                "latn"
            ]
        },
        "ms-Arab-BN": {
            "nu": [
                "latn"
            ]
        },
        "ms-BN": {
            "nu": [
                "latn"
            ]
        },
        "ms-ID": {
            "nu": [
                "latn"
            ],
            "separator": {
                "latn": "."
            }
        },
        "ms-SG": {
            "nu": [
                "latn"
            ]
        },
        "mt": {
            "nu": [
                "latn"
            ]
        },
        "mua": {
            "nu": [
                "latn"
            ]
        },
        "mus": {
            "nu": [
                "latn"
            ]
        },
        "my": {
            "nu": [
                "mymr"
            ]
        },
        "myv": {
            "nu": [
                "latn"
            ]
        },
        "mzn": {
            "nu": [
                "arabext"
            ]
        },
        "naq": {
            "nu": [
                "latn"
            ]
        },
        "nb": {
            "nu": [
                "latn"
            ]
        },
        "nb-SJ": {
            "nu": [
                "latn"
            ]
        },
        "nd": {
            "nu": [
                "latn"
            ]
        },
        "nds": {
            "nu": [
                "latn"
            ]
        },
        "nds-NL": {
            "nu": [
                "latn"
            ]
        },
        "ne": {
            "nu": [
                "deva"
            ]
        },
        "ne-IN": {
            "nu": [
                "deva"
            ]
        },
        "nl": {
            "nu": [
                "latn"
            ]
        },
        "nl-AW": {
            "nu": [
                "latn"
            ]
        },
        "nl-BE": {
            "nu": [
                "latn"
            ]
        },
        "nl-BQ": {
            "nu": [
                "latn"
            ]
        },
        "nl-CW": {
            "nu": [
                "latn"
            ]
        },
        "nl-SR": {
            "nu": [
                "latn"
            ]
        },
        "nl-SX": {
            "nu": [
                "latn"
            ]
        },
        "nmg": {
            "nu": [
                "latn"
            ]
        },
        "nn": {
            "nu": [
                "latn"
            ]
        },
        "nnh": {
            "nu": [
                "latn"
            ]
        },
        "no": {
            "nu": [
                "latn"
            ]
        },
        "nqo": {
            "nu": [
                "nkoo"
            ]
        },
        "nr": {
            "nu": [
                "latn"
            ]
        },
        "nso": {
            "nu": [
                "latn"
            ]
        },
        "nus": {
            "nu": [
                "latn"
            ]
        },
        "nv": {
            "nu": [
                "latn"
            ]
        },
        "ny": {
            "nu": [
                "latn"
            ]
        },
        "nyn": {
            "nu": [
                "latn"
            ]
        },
        "oc": {
            "nu": [
                "latn"
            ]
        },
        "oc-ES": {
            "nu": [
                "latn"
            ]
        },
        "om": {
            "nu": [
                "latn"
            ]
        },
        "om-KE": {
            "nu": [
                "latn"
            ]
        },
        "or": {
            "nu": [
                "latn"
            ]
        },
        "os": {
            "nu": [
                "latn"
            ]
        },
        "os-RU": {
            "nu": [
                "latn"
            ]
        },
        "osa": {
            "nu": [
                "latn"
            ]
        },
        "pa": {
            "nu": [
                "latn"
            ]
        },
        "pa-Arab": {
            "nu": [
                "arabext"
            ]
        },
        "pa-Guru": {
            "nu": [
                "latn"
            ]
        },
        "pap": {
            "nu": [
                "latn"
            ]
        },
        "pap-AW": {
            "nu": [
                "latn"
            ]
        },
        "pcm": {
            "nu": [
                "latn"
            ]
        },
        "pis": {
            "nu": [
                "latn"
            ]
        },
        "pl": {
            "nu": [
                "latn"
            ]
        },
        "prg": {
            "nu": [
                "latn"
            ]
        },
        "ps": {
            "nu": [
                "arabext"
            ]
        },
        "ps-PK": {
            "nu": [
                "arabext"
            ]
        },
        "pt": {
            "nu": [
                "latn"
            ]
        },
        "pt-AO": {
            "nu": [
                "latn"
            ]
        },
        "pt-CH": {
            "nu": [
                "latn"
            ]
        },
        "pt-CV": {
            "nu": [
                "latn"
            ]
        },
        "pt-GQ": {
            "nu": [
                "latn"
            ]
        },
        "pt-GW": {
            "nu": [
                "latn"
            ]
        },
        "pt-LU": {
            "nu": [
                "latn"
            ]
        },
        "pt-MO": {
            "nu": [
                "latn"
            ]
        },
        "pt-MZ": {
            "nu": [
                "latn"
            ]
        },
        "pt-PT": {
            "nu": [
                "latn"
            ]
        },
        "pt-ST": {
            "nu": [
                "latn"
            ]
        },
        "pt-TL": {
            "nu": [
                "latn"
            ]
        },
        "qu": {
            "nu": [
                "latn"
            ]
        },
        "qu-BO": {
            "nu": [
                "latn"
            ]
        },
        "qu-EC": {
            "nu": [
                "latn"
            ]
        },
        "quc": {
            "nu": [
                "latn"
            ]
        },
        "raj": {
            "nu": [
                "deva"
            ]
        },
        "rhg": {
            "nu": [
                "latn"
            ]
        },
        "rhg-Rohg": {
            "nu": [
                "latn"
            ]
        },
        "rhg-Rohg-BD": {
            "nu": [
                "latn"
            ]
        },
        "rif": {
            "nu": [
                "latn"
            ]
        },
        "rm": {
            "nu": [
                "latn"
            ]
        },
        "rn": {
            "nu": [
                "latn"
            ]
        },
        "ro": {
            "nu": [
                "latn"
            ]
        },
        "ro-MD": {
            "nu": [
                "latn"
            ]
        },
        "rof": {
            "nu": [
                "latn"
            ]
        },
        "ru": {
            "nu": [
                "latn"
            ]
        },
        "ru-BY": {
            "nu": [
                "latn"
            ]
        },
        "ru-KG": {
            "nu": [
                "latn"
            ]
        },
        "ru-KZ": {
            "nu": [
                "latn"
            ]
        },
        "ru-MD": {
            "nu": [
                "latn"
            ]
        },
        "ru-UA": {
            "nu": [
                "latn"
            ]
        },
        "rw": {
            "nu": [
                "latn"
            ]
        },
        "rwk": {
            "nu": [
                "latn"
            ]
        },
        "sa": {
            "nu": [
                "deva"
            ]
        },
        "sah": {
            "nu": [
                "latn"
            ]
        },
        "saq": {
            "nu": [
                "latn"
            ]
        },
        "sat": {
            "nu": [
                "olck"
            ]
        },
        "sat-Deva": {
            "nu": [
                "deva"
            ]
        },
        "sat-Olck": {
            "nu": [
                "olck"
            ]
        },
        "sbp": {
            "nu": [
                "latn"
            ]
        },
        "sc": {
            "nu": [
                "latn"
            ]
        },
        "scn": {
            "nu": [
                "latn"
            ]
        },
        "sd": {
            "nu": [
                "arab"
            ]
        },
        "sd-Arab": {
            "nu": [
                "arab"
            ]
        },
        "sd-Deva": {
            "nu": [
                "latn"
            ]
        },
        "sdh": {
            "nu": [
                "arab"
            ]
        },
        "sdh-IQ": {
            "nu": [
                "arab"
            ]
        },
        "se": {
            "nu": [
                "latn"
            ]
        },
        "se-FI": {
            "nu": [
                "latn"
            ]
        },
        "se-SE": {
            "nu": [
                "latn"
            ]
        },
        "seh": {
            "nu": [
                "latn"
            ]
        },
        "ses": {
            "nu": [
                "latn"
            ]
        },
        "sg": {
            "nu": [
                "latn"
            ]
        },
        "shi": {
            "nu": [
                "latn"
            ]
        },
        "shi-Latn": {
            "nu": [
                "latn"
            ]
        },
        "shi-Tfng": {
            "nu": [
                "latn"
            ]
        },
        "shn": {
            "nu": [
                "latn"
            ]
        },
        "shn-TH": {
            "nu": [
                "latn"
            ]
        },
        "si": {
            "nu": [
                "latn"
            ],
            "separator": {
                "latn": "."
            }
        },
        "sid": {
            "nu": [
                "latn"
            ]
        },
        "sk": {
            "nu": [
                "latn"
            ]
        },
        "skr": {
            "nu": [
                "latn"
            ]
        },
        "sl": {
            "nu": [
                "latn"
            ]
        },
        "sma": {
            "nu": [
                "latn"
            ]
        },
        "sma-NO": {
            "nu": [
                "latn"
            ]
        },
        "smj": {
            "nu": [
                "latn"
            ]
        },
        "smj-NO": {
            "nu": [
                "latn"
            ]
        },
        "smn": {
            "nu": [
                "latn"
            ],
            "separator": {
                "latn": "."
            }
        },
        "sms": {
            "nu": [
                "latn"
            ]
        },
        "sn": {
            "nu": [
                "latn"
            ]
        },
        "so": {
            "nu": [
                "latn"
            ]
        },
        "so-DJ": {
            "nu": [
                "latn"
            ]
        },
        "so-ET": {
            "nu": [
                "latn"
            ]
        },
        "so-KE": {
            "nu": [
                "latn"
            ]
        },
        "sq": {
            "nu": [
                "latn"
            ]
        },
        "sq-MK": {
            "nu": [
                "latn"
            ]
        },
        "sq-XK": {
            "nu": [
                "latn"
            ]
        },
        "sr": {
            "nu": [
                "latn"
            ]
        },
        "sr-Cyrl": {
            "nu": [
                "latn"
            ]
        },
        "sr-Cyrl-BA": {
            "nu": [
                "latn"
            ]
        },
        "sr-Cyrl-ME": {
            "nu": [
                "latn"
            ]
        },
        "sr-Cyrl-XK": {
            "nu": [
                "latn"
            ]
        },
        "sr-Latn": {
            "nu": [
                "latn"
            ]
        },
        "sr-Latn-BA": {
            "nu": [
                "latn"
            ]
        },
        "sr-Latn-ME": {
            "nu": [
                "latn"
            ]
        },
        "sr-Latn-XK": {
            "nu": [
                "latn"
            ]
        },
        "ss": {
            "nu": [
                "latn"
            ]
        },
        "ss-SZ": {
            "nu": [
                "latn"
            ]
        },
        "ssy": {
            "nu": [
                "latn"
            ]
        },
        "st": {
            "nu": [
                "latn"
            ]
        },
        "st-LS": {
            "nu": [
                "latn"
            ]
        },
        "su": {
            "nu": [
                "latn"
            ],
            "separator": {
                "latn": "."
            }
        },
        "su-Latn": {
            "nu": [
                "latn"
            ],
            "separator": {
                "latn": "."
            }
        },
        "sv": {
            "nu": [
                "latn"
            ]
        },
        "sv-AX": {
            "nu": [
                "latn"
            ]
        },
        "sv-FI": {
            "nu": [
                "latn"
            ],
            "separator": {
                "latn": "."
            }
        },
        "sw": {
            "nu": [
                "latn"
            ]
        },
        "sw-CD": {
            "nu": [
                "latn"
            ]
        },
        "sw-KE": {
            "nu": [
                "latn"
            ]
        },
        "sw-UG": {
            "nu": [
                "latn"
            ]
        },
        "syr": {
            "nu": [
                "latn"
            ]
        },
        "syr-SY": {
            "nu": [
                "latn"
            ]
        },
        "szl": {
            "nu": [
                "latn"
            ]
        },
        "ta": {
            "nu": [
                "latn"
            ]
        },
        "ta-LK": {
            "nu": [
                "latn"
            ]
        },
        "ta-MY": {
            "nu": [
                "latn"
            ]
        },
        "ta-SG": {
            "nu": [
                "latn"
            ]
        },
        "te": {
            "nu": [
                "latn"
            ]
        },
        "teo": {
            "nu": [
                "latn"
            ]
        },
        "teo-KE": {
            "nu": [
                "latn"
            ]
        },
        "tg": {
            "nu": [
                "latn"
            ]
        },
        "th": {
            "nu": [
                "latn"
            ]
        },
        "ti": {
            "nu": [
                "latn"
            ]
        },
        "ti-ER": {
            "nu": [
                "latn"
            ]
        },
        "tig": {
            "nu": [
                "latn"
            ]
        },
        "tk": {
            "nu": [
                "latn"
            ]
        },
        "tn": {
            "nu": [
                "latn"
            ]
        },
        "tn-BW": {
            "nu": [
                "latn"
            ]
        },
        "to": {
            "nu": [
                "latn"
            ]
        },
        "tok": {
            "nu": [
                "latn"
            ]
        },
        "tpi": {
            "nu": [
                "latn"
            ]
        },
        "tr": {
            "nu": [
                "latn"
            ]
        },
        "tr-CY": {
            "nu": [
                "latn"
            ]
        },
        "trv": {
            "nu": [
                "latn"
            ]
        },
        "trw": {
            "nu": [
                "latn"
            ]
        },
        "ts": {
            "nu": [
                "latn"
            ]
        },
        "tt": {
            "nu": [
                "latn"
            ]
        },
        "twq": {
            "nu": [
                "latn"
            ]
        },
        "tyv": {
            "nu": [
                "latn"
            ]
        },
        "tzm": {
            "nu": [
                "latn"
            ]
        },
        "ug": {
            "nu": [
                "latn"
            ]
        },
        "uk": {
            "nu": [
                "latn"
            ]
        },
        "und": {
            "nu": [
                "latn"
            ]
        },
        "ur": {
            "nu": [
                "latn"
            ]
        },
        "ur-IN": {
            "nu": [
                "arabext"
            ],
            "separator": {
                "arabext": "٫"
            }
        },
        "uz": {
            "nu": [
                "latn"
            ]
        },
        "uz-Arab": {
            "nu": [
                "arabext"
            ]
        },
        "uz-Cyrl": {
            "nu": [
                "latn"
            ]
        },
        "uz-Latn": {
            "nu": [
                "latn"
            ]
        },
        "vai": {
            "nu": [
                "latn"
            ]
        },
        "vai-Latn": {
            "nu": [
                "latn"
            ]
        },
        "vai-Vaii": {
            "nu": [
                "latn"
            ]
        },
        "ve": {
            "nu": [
                "latn"
            ]
        },
        "vec": {
            "nu": [
                "latn"
            ]
        },
        "vi": {
            "nu": [
                "latn"
            ]
        },
        "vmw": {
            "nu": [
                "latn"
            ]
        },
        "vo": {
            "nu": [
                "latn"
            ]
        },
        "vun": {
            "nu": [
                "latn"
            ]
        },
        "wa": {
            "nu": [
                "latn"
            ]
        },
        "wae": {
            "nu": [
                "latn"
            ]
        },
        "wal": {
            "nu": [
                "latn"
            ]
        },
        "wbp": {
            "nu": [
                "latn"
            ]
        },
        "wo": {
            "nu": [
                "latn"
            ]
        },
        "xh": {
            "nu": [
                "latn"
            ]
        },
        "xnr": {
            "nu": [
                "latn"
            ]
        },
        "xog": {
            "nu": [
                "latn"
            ]
        },
        "yav": {
            "nu": [
                "latn"
            ]
        },
        "yi": {
            "nu": [
                "latn"
            ]
        },
        "yo": {
            "nu": [
                "latn"
            ]
        },
        "yo-BJ": {
            "nu": [
                "latn"
            ]
        },
        "yrl": {
            "nu": [
                "latn"
            ]
        },
        "yrl-CO": {
            "nu": [
                "latn"
            ]
        },
        "yrl-VE": {
            "nu": [
                "latn"
            ]
        },
        "yue": {
            "nu": [
                "latn"
            ]
        },
        "yue-Hans": {
            "nu": [
                "latn"
            ]
        },
        "yue-Hant": {
            "nu": [
                "latn"
            ]
        },
        "yue-Hant-CN": {
            "nu": [
                "latn"
            ]
        },
        "za": {
            "nu": [
                "latn"
            ]
        },
        "zgh": {
            "nu": [
                "latn"
            ]
        },
        "zh": {
            "nu": [
                "latn"
            ]
        },
        "zh-Hans": {
            "nu": [
                "latn"
            ]
        },
        "zh-Hans-HK": {
            "nu": [
                "latn"
            ]
        },
        "zh-Hans-MO": {
            "nu": [
                "latn"
            ]
        },
        "zh-Hans-MY": {
            "nu": [
                "latn"
            ]
        },
        "zh-Hans-SG": {
            "nu": [
                "latn"
            ]
        },
        "zh-Hant": {
            "nu": [
                "latn"
            ]
        },
        "zh-Hant-HK": {
            "nu": [
                "latn"
            ]
        },
        "zh-Hant-MO": {
            "nu": [
                "latn"
            ]
        },
        "zh-Hant-MY": {
            "nu": [
                "latn"
            ]
        },
        "zh-Latn": {
            "nu": [
                "latn"
            ]
        },
        "zu": {
            "nu": [
                "latn"
            ]
        }
    }
};

},{}],74:[function(require,module,exports){
(function (global){(function (){
/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global global, define, Symbol, Reflect, Promise, SuppressedError */
var __extends;
var __assign;
var __rest;
var __decorate;
var __param;
var __esDecorate;
var __runInitializers;
var __propKey;
var __setFunctionName;
var __metadata;
var __awaiter;
var __generator;
var __exportStar;
var __values;
var __read;
var __spread;
var __spreadArrays;
var __spreadArray;
var __await;
var __asyncGenerator;
var __asyncDelegator;
var __asyncValues;
var __makeTemplateObject;
var __importStar;
var __importDefault;
var __classPrivateFieldGet;
var __classPrivateFieldSet;
var __classPrivateFieldIn;
var __createBinding;
var __addDisposableResource;
var __disposeResources;
(function (factory) {
    var root = typeof global === "object" ? global : typeof self === "object" ? self : typeof this === "object" ? this : {};
    if (typeof define === "function" && define.amd) {
        define("tslib", ["exports"], function (exports) { factory(createExporter(root, createExporter(exports))); });
    }
    else if (typeof module === "object" && typeof module.exports === "object") {
        factory(createExporter(root, createExporter(module.exports)));
    }
    else {
        factory(createExporter(root));
    }
    function createExporter(exports, previous) {
        if (exports !== root) {
            if (typeof Object.create === "function") {
                Object.defineProperty(exports, "__esModule", { value: true });
            }
            else {
                exports.__esModule = true;
            }
        }
        return function (id, v) { return exports[id] = previous ? previous(id, v) : v; };
    }
})
(function (exporter) {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };

    __extends = function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };

    __assign = Object.assign || function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };

    __rest = function (s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    };

    __decorate = function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };

    __param = function (paramIndex, decorator) {
        return function (target, key) { decorator(target, key, paramIndex); }
    };

    __esDecorate = function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
        function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
        var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
        var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
        var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
        var _, done = false;
        for (var i = decorators.length - 1; i >= 0; i--) {
            var context = {};
            for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
            for (var p in contextIn.access) context.access[p] = contextIn.access[p];
            context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
            var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
            if (kind === "accessor") {
                if (result === void 0) continue;
                if (result === null || typeof result !== "object") throw new TypeError("Object expected");
                if (_ = accept(result.get)) descriptor.get = _;
                if (_ = accept(result.set)) descriptor.set = _;
                if (_ = accept(result.init)) initializers.unshift(_);
            }
            else if (_ = accept(result)) {
                if (kind === "field") initializers.unshift(_);
                else descriptor[key] = _;
            }
        }
        if (target) Object.defineProperty(target, contextIn.name, descriptor);
        done = true;
    };

    __runInitializers = function (thisArg, initializers, value) {
        var useValue = arguments.length > 2;
        for (var i = 0; i < initializers.length; i++) {
            value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
        }
        return useValue ? value : void 0;
    };

    __propKey = function (x) {
        return typeof x === "symbol" ? x : "".concat(x);
    };

    __setFunctionName = function (f, name, prefix) {
        if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
        return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
    };

    __metadata = function (metadataKey, metadataValue) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
    };

    __awaiter = function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };

    __generator = function (thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (g && (g = 0, op[0] && (_ = 0)), _) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    };

    __exportStar = function(m, o) {
        for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p)) __createBinding(o, m, p);
    };

    __createBinding = Object.create ? (function(o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
            desc = { enumerable: true, get: function() { return m[k]; } };
        }
        Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
    });

    __values = function (o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    };

    __read = function (o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    };

    /** @deprecated */
    __spread = function () {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    };

    /** @deprecated */
    __spreadArrays = function () {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    };

    __spreadArray = function (to, from, pack) {
        if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
            if (ar || !(i in from)) {
                if (!ar) ar = Array.prototype.slice.call(from, 0, i);
                ar[i] = from[i];
            }
        }
        return to.concat(ar || Array.prototype.slice.call(from));
    };

    __await = function (v) {
        return this instanceof __await ? (this.v = v, this) : new __await(v);
    };

    __asyncGenerator = function (thisArg, _arguments, generator) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        var g = generator.apply(thisArg, _arguments || []), i, q = [];
        return i = {}, verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function () { return this; }, i;
        function awaitReturn(f) { return function (v) { return Promise.resolve(v).then(f, reject); }; }
        function verb(n, f) { if (g[n]) { i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; if (f) i[n] = f(i[n]); } }
        function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
        function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
        function fulfill(value) { resume("next", value); }
        function reject(value) { resume("throw", value); }
        function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
    };

    __asyncDelegator = function (o) {
        var i, p;
        return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
        function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: false } : f ? f(v) : v; } : f; }
    };

    __asyncValues = function (o) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        var m = o[Symbol.asyncIterator], i;
        return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
        function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
        function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
    };

    __makeTemplateObject = function (cooked, raw) {
        if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
        return cooked;
    };

    var __setModuleDefault = Object.create ? (function(o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
        o["default"] = v;
    };

    __importStar = function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
        __setModuleDefault(result, mod);
        return result;
    };

    __importDefault = function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };

    __classPrivateFieldGet = function (receiver, state, kind, f) {
        if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
        if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
        return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
    };

    __classPrivateFieldSet = function (receiver, state, value, kind, f) {
        if (kind === "m") throw new TypeError("Private method is not writable");
        if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
        if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
        return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
    };

    __classPrivateFieldIn = function (state, receiver) {
        if (receiver === null || (typeof receiver !== "object" && typeof receiver !== "function")) throw new TypeError("Cannot use 'in' operator on non-object");
        return typeof state === "function" ? receiver === state : state.has(receiver);
    };

    __addDisposableResource = function (env, value, async) {
        if (value !== null && value !== void 0) {
            if (typeof value !== "object" && typeof value !== "function") throw new TypeError("Object expected.");
            var dispose, inner;
            if (async) {
                if (!Symbol.asyncDispose) throw new TypeError("Symbol.asyncDispose is not defined.");
                dispose = value[Symbol.asyncDispose];
            }
            if (dispose === void 0) {
                if (!Symbol.dispose) throw new TypeError("Symbol.dispose is not defined.");
                dispose = value[Symbol.dispose];
                if (async) inner = dispose;
            }
            if (typeof dispose !== "function") throw new TypeError("Object not disposable.");
            if (inner) dispose = function() { try { inner.call(this); } catch (e) { return Promise.reject(e); } };
            env.stack.push({ value: value, dispose: dispose, async: async });
        }
        else if (async) {
            env.stack.push({ async: true });
        }
        return value;
    };

    var _SuppressedError = typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
        var e = new Error(message);
        return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
    };

    __disposeResources = function (env) {
        function fail(e) {
            env.error = env.hasError ? new _SuppressedError(e, env.error, "An error was suppressed during disposal.") : e;
            env.hasError = true;
        }
        function next() {
            while (env.stack.length) {
                var rec = env.stack.pop();
                try {
                    var result = rec.dispose && rec.dispose.call(rec.value);
                    if (rec.async) return Promise.resolve(result).then(next, function(e) { fail(e); return next(); });
                }
                catch (e) {
                    fail(e);
                }
            }
            if (env.hasError) throw env.error;
        }
        return next();
    };

    exporter("__extends", __extends);
    exporter("__assign", __assign);
    exporter("__rest", __rest);
    exporter("__decorate", __decorate);
    exporter("__param", __param);
    exporter("__esDecorate", __esDecorate);
    exporter("__runInitializers", __runInitializers);
    exporter("__propKey", __propKey);
    exporter("__setFunctionName", __setFunctionName);
    exporter("__metadata", __metadata);
    exporter("__awaiter", __awaiter);
    exporter("__generator", __generator);
    exporter("__exportStar", __exportStar);
    exporter("__createBinding", __createBinding);
    exporter("__values", __values);
    exporter("__read", __read);
    exporter("__spread", __spread);
    exporter("__spreadArrays", __spreadArrays);
    exporter("__spreadArray", __spreadArray);
    exporter("__await", __await);
    exporter("__asyncGenerator", __asyncGenerator);
    exporter("__asyncDelegator", __asyncDelegator);
    exporter("__asyncValues", __asyncValues);
    exporter("__makeTemplateObject", __makeTemplateObject);
    exporter("__importStar", __importStar);
    exporter("__importDefault", __importDefault);
    exporter("__classPrivateFieldGet", __classPrivateFieldGet);
    exporter("__classPrivateFieldSet", __classPrivateFieldSet);
    exporter("__classPrivateFieldIn", __classPrivateFieldIn);
    exporter("__addDisposableResource", __addDisposableResource);
    exporter("__disposeResources", __disposeResources);
});

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],75:[function(require,module,exports){

require('@formatjs/intl-durationformat/polyfill-force')

},{"@formatjs/intl-durationformat/polyfill-force":62}]},{},[75]);
