it("is a function", function () {
	proclaim.isFunction(Error.isError);
});

it("has correct arity", function () {
	proclaim.arity(Error.isError, 1);
});

it("has correct name", function () {
	proclaim.hasName(Error.isError, "isError");
});

it("is not enumerable", function () {
	proclaim.isNotEnumerable(Error, "isError");
});

describe("Error.isError", function () {
	var trueCases = [
		{ arg: new Error(), name: "Error" },
		{ arg: new TypeError(), name: "TypeError" },
		{ arg: new DOMException(), name: "DOMException" }
	];
	if ("AggregateError" in self) {
		trueCases.push({
			arg: new self.AggregateError([]),
			name: "AggregateError"
		});
	}
	trueCases.forEach(function (trueCase) {
		it('returns true for "' + trueCase.name + '"', function () {
			proclaim.isTrue(Error.isError(trueCase.arg));
		});
	});

	var falseCases = [
		{ arg: undefined, name: "undefined" },
		{ arg: null, name: "null" },
		{ arg: "", name: "string" },
		{ arg: {}, name: "object" },
		{ arg: function () {}, name: "function" },
		{ arg: Object.create(Error.prototype), name: "object with Error prototype" }
	];
	falseCases.forEach(function (falseCase) {
		it('returns false for "' + falseCase.name + '"', function () {
			proclaim.isFalse(Error.isError(falseCase.arg));
		});
	});
});
