/* global BigInt, CreateIterResultObject, CreateMethodProperty, Get, Iterator, Symbol, ToBoolean */

// 27.1.4.2 The %NumericRangeIteratorPrototype% Object
var NumericRangeIteratorPrototype = Object.create(Iterator.prototype);

// 27.1.4.2.2 %NumericRangeIteratorPrototype%.[@@toStringTag]
Object.defineProperty(NumericRangeIteratorPrototype, Symbol.toStringTag, {
	configurable: true,
	enumerable: false,
	writable: false,
	value: "NumericRangeIterator"
});

CreateMethodProperty(
	NumericRangeIteratorPrototype,
	Symbol.iterator,
	function iterator() {
		return this;
	}
);

// 27.1.4.1 CreateNumericRangeIterator ( start, end, optionOrStep, type )
// eslint-disable-next-line no-unused-vars
function CreateNumericRangeIterator(start, end, optionOrStep, type) {
	var numericRangeIterator = Object.create(NumericRangeIteratorPrototype);

	// 1. If start is NaN, throw a RangeError exception.
	if (typeof start === "number" && isNaN(start)) {
		throw new RangeError("start must not be NaN");
	}
	// 2. If end is NaN, throw a RangeError exception.
	if (typeof end === "number" && isNaN(end)) {
		throw new RangeError("end must not be NaN");
	}
	// 3. If type is number-range, then
	if (type === "NUMBER-RANGE") {
		// a. Assert: start is a Number.
		// b. If end is not a Number, throw a TypeError exception.
		if (typeof end !== "number") {
			throw new TypeError("end must be a number");
		}
		// c. Let zero be +0𝔽.
		var zero = 0;
		// d. Let one be 1𝔽.
		var one = 1;
	}
	// 4. Else,
	else {
		// a. Assert: start is a BigInt.
		// b. If end is not +∞𝔽 or -∞𝔽 and end is not a BigInt, throw a TypeError exception.
		if (end !== Infinity && end !== -Infinity && typeof end !== "bigint") {
			throw new TypeError("end must be a BigInt");
		}
		// c. Let zero be 0ℤ.
		zero = BigInt(0);
		// d. Let one be 1ℤ.
		one = BigInt(1);
	}
	// 5. If start is +∞𝔽 or -∞𝔽, throw a RangeError exception.
	if (start === Infinity || start === -Infinity) {
		throw new RangeError("start must be finite");
	}
	// 6. Let inclusiveEnd be false.
	var inclusiveEnd = false;
	// 7. If optionOrStep is undefined or null, then
	if (optionOrStep === undefined || optionOrStep === null) {
		// a. Let step be undefined.
		var step = undefined;
	}
	// 8. Else if optionOrStep is an Object, then
	else if (typeof optionOrStep === "object") {
		// a. Let step be ? Get(optionOrStep, "step").
		step = Get(optionOrStep, "step");
		// b. Set inclusiveEnd to ToBoolean(? Get(optionOrStep, "inclusive")).
		inclusiveEnd = ToBoolean(Get(optionOrStep, "inclusive"));
	}
	// 9. Else if type is number-range and optionOrStep is a Number, then
	else if (type === "NUMBER-RANGE" && typeof optionOrStep === "number") {
		// a. Let step be optionOrStep.
		step = optionOrStep;
	}
	// 10. Else if type is bigint-range and optionOrStep is a BigInt, then
	else if (type === "BIGINT-RANGE" && typeof optionOrStep === "bigint") {
		// a. Let step be optionOrStep.
		step = optionOrStep;
	}
	// 11. Else,
	else {
		// a. Throw a TypeError exception.
		throw new TypeError(
			"optionOrStep must be either an object or a number/BigInt"
		);
	}
	// 12. If step is undefined or null, then
	if (step === undefined || step === null) {
		// a. If end is +∞𝔽, let step be one.
		if (end === Infinity) {
			step = one;
		}
		// b. Else if end is -∞𝔽, let step be -one.
		else if (end === -Infinity) {
			step = -one;
		}
		// c. Assert: In the next branch, end is a BigInt and start is a BigInt, or end is a Number and start is a Number.
		// d. Else if end > start, let step be one.
		else if (end > start) {
			step = one;
		}
		// e. Else let step be -one.
		else {
			step = -one;
		}
	}
	// 13. If step is NaN, throw a RangeError exception.
	if (typeof step === "number" && isNaN(step)) {
		throw new RangeError("step must not be NaN");
	}
	// 14. If type is number-range and step is not a Number, throw a TypeError exception.
	if (type === "NUMBER-RANGE" && typeof step !== "number") {
		throw new RangeError("step must be a number");
	}
	// 15. Else if type is bigint-range and step is not a BigInt, throw a TypeError exception.
	else if (type === "BIGINT-RANGE" && typeof step !== "bigint") {
		throw new RangeError("step must be a BigInt");
	}
	// 16. If step is +∞𝔽 or -∞𝔽, throw a RangeError exception.
	if (step === Infinity || step === -Infinity) {
		throw new RangeError("step must be finite");
	}
	// 17. If step is zero and start is not end, throw a RangeError exception.
	if (step === zero && start !== end) {
		throw new RangeError("start and end must match when step is zero");
	}

	// 18. Let closure be a new Abstract Closure with no parameters that captures start, end, step, inclusiveEnd, zero, one and performs the following steps when called:
	// a. If end is +∞𝔽, let ifIncrease be true.
	if (end === Infinity) {
		var ifIncrease = true;
	}
	// b. Else if end is -∞𝔽, let ifIncrease be false.
	else if (end === -Infinity) {
		ifIncrease = false;
	}
	// c. Assert: In the next branch, end is a BigInt and start is a BigInt, or end is a Number and start is a Number.
	// d. Else if end > start, let ifIncrease be true.
	else if (end > start) {
		ifIncrease = true;
	}
	// e. Else let ifIncrease be false.
	else {
		ifIncrease = false;
	}
	// f. If step > zero, let ifStepIncrease be true.
	if (step > zero) {
		var ifStepIncrease = true;
	}
	// g. Else let ifStepIncrease be false.
	else {
		ifStepIncrease = false;
	}
	// h. If ifIncrease is not ifStepIncrease, return undefined.
	if (ifIncrease !== ifStepIncrease) {
		numericRangeIterator["[[Done]]"] = true;
	}
	// i. Let hitsEnd be false.
	var hitsEnd = false;
	// j. Let currentCount be zero.
	var currentCount = zero;

	// 19. Return CreateIteratorFromClosure(closure, "%NumericRangeIteratorPrototype%", %NumericRangeIteratorPrototype%).
	CreateMethodProperty(numericRangeIterator, "next", function next() {
		if (this["[[Done]]"] === true) {
			return CreateIterResultObject(undefined, true);
		}
		// k. NOTE: You can debug these steps at https://tc39.es/proposal-Number.range/playground.html .
		// l. Repeat, while hitsEnd is false,
		if (hitsEnd === false) {
			// i. Let currentYieldingValue be start + (step * currentCount).
			var currentYieldingValue = start + step * currentCount;
			// ii. If currentYieldingValue is end, Set hitsEnd to true.
			if (currentYieldingValue === end) {
				hitsEnd = true;
			}
			// iii. Set currentCount to currentCount + one.
			currentCount += one;
			// iv. If ifIncrease is true, then
			if (ifIncrease === true) {
				// 1. Assert: end is a BigInt or +∞𝔽 and currentYieldingValue is a BigInt, or end is a Number and currentYieldingValue is a Number.
				// 2. If end is not +∞𝔽, then
				if (end !== Infinity) {
					// a. If inclusiveEnd is true, then
					if (inclusiveEnd === true) {
						// i. If currentYieldingValue > end, return undefined.
						if (currentYieldingValue > end) {
							this["[[Done]]"] = true;
							return CreateIterResultObject(undefined, true);
						}
					}
					// b. Else,
					else {
						// i. If currentYieldingValue ≥ end, return undefined.
						if (currentYieldingValue >= end) {
							this["[[Done]]"] = true;
							return CreateIterResultObject(undefined, true);
						}
					}
				}
			}
			// v. Else,
			else {
				// 1. Assert: end is a BigInt or -∞𝔽 and currentYieldingValue is a BigInt, or end is a Number and currentYieldingValue is a Number.
				// 2. If end is not -∞𝔽, then
				if (end !== -Infinity) {
					// a. If inclusiveEnd is true, then
					if (inclusiveEnd === true) {
						// i. If end > currentYieldingValue, return undefined.
						if (end > currentYieldingValue) {
							this["[[Done]]"] = true;
							return CreateIterResultObject(undefined, true);
						}
					}
					// b. Else,
					else {
						// i. If end ≥ currentYieldingValue, return undefined.
						if (end >= currentYieldingValue) {
							this["[[Done]]"] = true;
							return CreateIterResultObject(undefined, true);
						}
					}
				}
			}
			// vi. Perform ? Yield(currentYieldingValue).
			return CreateIterResultObject(currentYieldingValue, false);
		}
		// m. Return undefined.
		this["[[Done]]"] = true;
		return CreateIterResultObject(undefined, true);
	});

	return numericRangeIterator;
}
