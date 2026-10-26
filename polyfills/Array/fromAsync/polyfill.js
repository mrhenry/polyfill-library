/* global
	ArrayCreate, AsyncIteratorClose, Call, Construct, CreateAsyncFromSyncIterator, CreateDataPropertyOrThrow, CreateMethodProperty,
	Get, GetIterator, GetMethod, IsCallable, IsConstructor, IteratorComplete, IteratorValue, LengthOfArrayLike, Promise, Symbol,
	ThrowCompletion, ToObject, ToString, Type
*/
(function () {
	// 6.2.3.1 Await ( value )
	// Returns a promise to continue with, also rejected when PromiseResolve throws.
	function Await(value) {
		try {
			return Promise.resolve(value);
		} catch (error) {
			return Promise.reject(error);
		}
	}

	// 23.1.2.2 Array.fromAsync ( items [ , mapper [ , thisArg ] ] )
	CreateMethodProperty(Array, "fromAsync", function fromAsync(items /* [ , mapper [ , thisArg ] ] */) {
		var mapper = arguments.length > 1 ? arguments[1] : undefined;
		var thisArg = arguments.length > 2 ? arguments[2] : undefined;
		// 1. Let ctor be the this value.
		var ctor = this;
		// This is an async function: it returns a promise, which also rejects for errors thrown before the first Await.
		return new Promise(function (resolve) {
			// 2. Let mapping be false.
			var mapping = false;
			// 3. If mapper is not undefined, then
			if (mapper !== undefined) {
				// a. If IsCallable(mapper) is false, throw a TypeError exception.
				if (IsCallable(mapper) === false) {
					throw new TypeError(Object.prototype.toString.call(mapper) + " is not a function.");
				}
				// b. Set mapping to true.
				mapping = true;
			}
			// 4. Let iteratorRecord be undefined.
			var iteratorRecord;
			// 5. Let usingAsyncIterator be ? GetMethod(items, %Symbol.asyncIterator%).
			var usingAsyncIterator = GetMethod(items, Symbol.asyncIterator);
			// 6. If usingAsyncIterator is undefined, then
			if (usingAsyncIterator === undefined) {
				// a. Let usingSyncIterator be ? GetMethod(items, %Symbol.iterator%).
				var usingSyncIterator = GetMethod(items, Symbol.iterator);
				// b. If usingSyncIterator is not undefined, then
				if (usingSyncIterator !== undefined) {
					// i. Set iteratorRecord to CreateAsyncFromSyncIterator(? GetIteratorFromMethod(items, usingSyncIterator)).
					iteratorRecord = CreateAsyncFromSyncIterator(GetIterator(items, usingSyncIterator));
				}
			// 7. Else,
			} else {
				// a. Set iteratorRecord to ? GetIteratorFromMethod(items, usingAsyncIterator).
				iteratorRecord = GetIterator(items, usingAsyncIterator);
			}
			resolve(iteratorRecord !== undefined
				? fromIterator(ctor, iteratorRecord, mapping, mapper, thisArg)
				: fromArrayLike(ctor, items, mapping, mapper, thisArg)
			);
		});
	});

	// 8. If iteratorRecord is not undefined, then
	function fromIterator(ctor, iteratorRecord, mapping, mapper, thisArg) {
		// a. If IsConstructor(ctor) is true, then
		// i. Let array be ? Construct(ctor).
		// b. Else,
		// i. Let array be ! ArrayCreate(0).
		var array = IsConstructor(ctor) ? Construct(ctor) : ArrayCreate(0);
		// c. Let k be 0.
		var k = 0;
		// d. Repeat,
		// Each iteration continues once its awaited values have settled.
		function iterate() {
			// i. If k ≥ 2^53 - 1, then
			if (k >= 9007199254740991) {
				// 1. Let error be ThrowCompletion(a newly created TypeError object).
				// 2. Return ? AsyncIteratorClose(iteratorRecord, error).
				return AsyncIteratorClose(iteratorRecord, ThrowCompletion(new TypeError("Array length exceeds the maximum safe integer.")));
			}
			// ii. Let propertyKey be ! ToString(𝔽(k)).
			var propertyKey = ToString(k);
			// iii. Let nextResult be ? Call(iteratorRecord.[[NextMethod]], iteratorRecord.[[Iterator]]).
			var nextResult = Call(iteratorRecord["[[NextMethod]]"], iteratorRecord["[[Iterator]]"]);
			// iv. Set nextResult to ? Await(nextResult).
			return Await(nextResult).then(function (nextResult) {
				// v. If nextResult is not an Object, throw a TypeError exception.
				if (Type(nextResult) !== "object") {
					throw new TypeError("Iterator result " + nextResult + " is not an object.");
				}
				// vi. Let done be ? IteratorComplete(nextResult).
				var done = IteratorComplete(nextResult);
				// vii. If done is true, then
				if (done === true) {
					// 1. Perform ? Set(array, "length", 𝔽(k), true).
					array.length = k;
					// 2. Return array.
					return array;
				}
				// viii. Let nextValue be ? IteratorValue(nextResult).
				var nextValue = IteratorValue(nextResult);
				// ix. If mapping is true, then
				if (mapping === true) {
					// 1. Let mappedValue be Completion(Call(mapper, thisArg, « nextValue, 𝔽(k) »)).
					var mappedValue;
					try {
						mappedValue = Call(mapper, thisArg, [nextValue, k]);
					} catch (error) {
						// 2. IfAbruptCloseAsyncIterator(mappedValue, iteratorRecord).
						return AsyncIteratorClose(iteratorRecord, ThrowCompletion(error));
					}
					// 3. Set mappedValue to Completion(Await(mappedValue)).
					// 4. IfAbruptCloseAsyncIterator(mappedValue, iteratorRecord).
					return Await(mappedValue).then(define, function (error) {
						return AsyncIteratorClose(iteratorRecord, ThrowCompletion(error));
					});
				}
				// x. Else,
				// 1. Let mappedValue be nextValue.
				return define(nextValue);
			});

			function define(mappedValue) {
				// xi. Let defineStatus be Completion(CreateDataPropertyOrThrow(array, propertyKey, mappedValue)).
				try {
					CreateDataPropertyOrThrow(array, propertyKey, mappedValue);
				} catch (error) {
					// xii. IfAbruptCloseAsyncIterator(defineStatus, iteratorRecord).
					return AsyncIteratorClose(iteratorRecord, ThrowCompletion(error));
				}
				// xiii. Set k to k + 1.
				k = k + 1;
				return iterate();
			}
		}
		return iterate();
	}

	// 9. Else,
	function fromArrayLike(ctor, items, mapping, mapper, thisArg) {
		// a. NOTE: items is neither async iterable nor iterable so assume it is an array-like object.
		// b. Let arrayLike be ! ToObject(items).
		var arrayLike = ToObject(items);
		// c. Let length be ? LengthOfArrayLike(arrayLike).
		var length = LengthOfArrayLike(arrayLike);
		// d. If IsConstructor(ctor) is true, then
		// i. Let array be ? Construct(ctor, « 𝔽(length) »).
		// e. Else,
		// i. Let array be ? ArrayCreate(length).
		var array = IsConstructor(ctor) ? Construct(ctor, [length]) : ArrayCreate(length);
		// f. Let k be 0.
		var k = 0;
		// g. Repeat, while k < length,
		// Each iteration continues once its awaited values have settled.
		function iterate() {
			if (k < length) {
				// i. Let propertyKey be ! ToString(𝔽(k)).
				var propertyKey = ToString(k);
				// ii. Let kValue be ? Get(arrayLike, propertyKey).
				var kValue = Get(arrayLike, propertyKey);
				// iii. Set kValue to ? Await(kValue).
				return Await(kValue).then(function (kValue) {
					// iv. If mapping is true, then
					if (mapping === true) {
						// 1. Let mappedValue be ? Call(mapper, thisArg, « kValue, 𝔽(k) »).
						// 2. Set mappedValue to ? Await(mappedValue).
						return Await(Call(mapper, thisArg, [kValue, k])).then(define);
					}
					// v. Else,
					// 1. Let mappedValue be kValue.
					return define(kValue);
				});
			}
			// h. Perform ? Set(array, "length", 𝔽(length), true).
			array.length = length;
			// i. Return array.
			return array;

			function define(mappedValue) {
				// vi. Perform ? CreateDataPropertyOrThrow(array, propertyKey, mappedValue).
				CreateDataPropertyOrThrow(array, propertyKey, mappedValue);
				// vii. Set k to k + 1.
				k = k + 1;
				return iterate();
			}
		}
		return iterate();
	}
})();
