it("is a function", function () {
	proclaim.isFunction(URL.canParse);
});

it("has correct arity", function () {
	proclaim.arity(URL.canParse, 1);
});

it("has correct name", function () {
	proclaim.hasName(URL.canParse, "canParse");
});

it("is enumerable", function () {
	proclaim.isEnumerable(URL, "canParse");
});

describe("canParse", function () {
	it("returns true if it can parse", function () {
		proclaim.isTrue(URL.canParse("http://hello/there"));
		proclaim.isTrue(URL.canParse("/there", "http://hello"));
	});

	it("returns false if it can't parse", function () {
		proclaim.isFalse(URL.canParse("/there"));
	});

	it("throws for too few arguments", function () {
		proclaim.throws(function () {
			URL.canParse();
		});
	});

	it("throws for a stringifier that throws", function () {
		proclaim.throws(function () {
			URL.canParse({
				toString: function () {
					throw new Error();
				}
			});
		});
		proclaim.throws(function () {
			URL.canParse("http://hello", {
				toString: function () {
					throw new Error();
				}
			});
		});
		proclaim.throws(function () {
			URL.canParse("/there", {
				toString: function () {
					throw new Error();
				}
			});
		});
	});
});
