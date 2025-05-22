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

describe("isError", function () {
	var supportDOMExceptionConstructor = (function () {
		try {
			new DOMException();
			return true;
		} catch (_) {
			return false;
		}
	}());

	var trueCases = [
		{ arg: new Error(), name: "Error" },
		{ arg: new TypeError(), name: "TypeError" }
	];

	if (supportDOMExceptionConstructor) {
		trueCases.push({
			arg: new DOMException(),
			name: "DOMException"
		});
	}

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
		{ arg: function () {}, name: "function" }
	];
	falseCases.forEach(function (falseCase) {
		it('returns false for "' + falseCase.name + '"', function () {
			proclaim.isFalse(Error.isError(falseCase.arg));
		});
	});
});
