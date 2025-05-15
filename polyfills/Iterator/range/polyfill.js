/* global CreateMethodProperty, Iterator, CreateNumericRangeIterator */
// 27.1.3.2.2 Iterator.range ( start, end, optionOrStep )
CreateMethodProperty(
	Iterator,
	"range",
	function range(start, end, optionOrStep) {
		// 1. If start is a Number, return ? CreateNumericRangeIterator(start, end, optionOrStep, number-range).
		if (typeof start === "number") {
			return CreateNumericRangeIterator(
				start,
				end,
				optionOrStep,
				"NUMBER-RANGE"
			);
		}
		// 2. If start is a BigInt, return ? CreateNumericRangeIterator(start, end, optionOrStep, bigint-range).
		if (typeof start === "bigint") {
			return CreateNumericRangeIterator(
				start,
				end,
				optionOrStep,
				"BIGINT-RANGE"
			);
		}
		// 3. Throw a TypeError exception.
		throw new TypeError("start must be either a number or a BigInt");
	}
);
