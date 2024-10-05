it("is a function", function () {
	proclaim.isFunction(URL.parse);
});

it("has correct arity", function () {
	proclaim.arity(URL.parse, 1);
});

it("has correct name", function () {
	proclaim.hasName(URL.parse, "parse");
});

it("is enumerable", function () {
	proclaim.isEnumerable(URL, "parse");
});

describe("parse", function () {
	it("returns parsed url if it can parse", function () {
		proclaim.instanceOf(URL.parse("http://hello/there"), URL);
		proclaim.equal(
			URL.parse("http://hello/there").href,
			new URL("http://hello/there").href
		);
		proclaim.instanceOf(URL.parse("/there", "http://hello"), URL);
		proclaim.equal(
			URL.parse("/there", "http://hello").href,
			new URL("/there", "http://hello").href
		);
	});

	it("returns null if it can't parse", function () {
		proclaim.isNull(URL.parse("/there"));
	});

	it("throws for too few arguments", function () {
		proclaim.throws(function () {
			URL.parse();
		});
	});

	it("throws for a stringifier that throws", function () {
		proclaim.throws(function () {
			URL.parse({
				toString: function () {
					throw new Error();
				}
			});
		});
		proclaim.throws(function () {
			URL.parse("http://hello", {
				toString: function () {
					throw new Error();
				}
			});
		});
		proclaim.throws(function () {
			URL.parse("/there", {
				toString: function () {
					throw new Error();
				}
			});
		});
	});
});
