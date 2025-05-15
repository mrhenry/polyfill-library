/* global BigInt, Iterator */

it("is a function", function () {
	proclaim.isFunction(Iterator.range);
});

it("has correct arity", function () {
	proclaim.arity(Iterator.range, 3);
});

it("has correct name", function () {
	proclaim.hasName(Iterator.range, "range");
});

it("is not enumerable", function () {
	proclaim.isNotEnumerable(Iterator, "range");
});

function consumeIterator(iter) {
	var arr = [];
	for (var i = 0; i < 15; i++) {
		var result = iter.next();
		if (result.done) break;
		arr.push(result.value);
	}
	return arr;
}

it("should create a numeric range iterator", function () {
	var cases = [
		[
			[-1, 5],
			[-1, 0, 1, 2, 3, 4]
		],
		[
			[-5, 1],
			[-5, -4, -3, -2, -1, 0]
		],
		[
			[0, 1, 0.1],
			[
				0, 0.1, 0.2, 0.30000000000000004, 0.4, 0.5, 0.6000000000000001,
				0.7000000000000001, 0.8, 0.9
			]
		],
		[
			[Math.pow(2, 53) - 1, Math.pow(2, 53), { inclusive: true }],
			[9007199254740991, 9007199254740992]
		],
		[[0, 0], []],
		[[0, -5, 1], []],
		[
			[0, -2],
			[0, -1]
		],
		[
			[0, -2, { inclusive: true }],
			[0, -1, -2]
		],
		[[0, 0, { inclusive: true }], [0]],
		[
			[0, Infinity],
			[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
		],
		[
			[0, Infinity, { step: 2 }],
			[0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28]
		]
	];

	if (typeof BigInt !== "undefined") {
		cases.push(
			[
				[BigInt(-1), BigInt(5)],
				[BigInt(-1), BigInt(0), BigInt(1), BigInt(2), BigInt(3), BigInt(4)]
			],
			[
				[BigInt(-5), BigInt(1)],
				[BigInt(-5), BigInt(-4), BigInt(-3), BigInt(-2), BigInt(-1), BigInt(0)]
			],
			[
				[BigInt(0), BigInt(-2)],
				[BigInt(0), BigInt(-1)]
			],
			[
				[BigInt(0), BigInt(-2), { inclusive: true }],
				[BigInt(0), BigInt(-1), BigInt(-2)]
			],
			[
				[BigInt(0), Infinity, { step: BigInt(2) }],
				[
					BigInt(0),
					BigInt(2),
					BigInt(4),
					BigInt(6),
					BigInt(8),
					BigInt(10),
					BigInt(12),
					BigInt(14),
					BigInt(16),
					BigInt(18),
					BigInt(20),
					BigInt(22),
					BigInt(24),
					BigInt(26),
					BigInt(28)
				]
			]
		);
	}

	for (var i = 0; i < cases.length; i++) {
		proclaim.deepEqual(
			consumeIterator(Iterator.range.apply(Iterator, cases[i][0])),
			cases[i][1]
		);
	}

	proclaim.isInstanceOf(Iterator.range(0, 1), Iterator);
});

it("should throw for invalid inputs", function () {
	var cases = [
		[NaN, 0],
		[0, NaN],
		[NaN, NaN],
		[0, 0, { step: NaN }],
		[0, 5, NaN],
		[],
		[0],
		[0, 1, function () {}],
		[0, function () {}, 2],
		[function () {}, 2, 2],
		[0, 10, 0],
		[0, 10, { step: 0 }],
		[Infinity, 10, 0],
		[-Infinity, 10, 0],
		[0, 10, Infinity],
		[0, 10, { step: Infinity }]
	];

	if (typeof BigInt !== "undefined") {
		cases.push(
			[BigInt(0)],
			[BigInt(0), BigInt(1), function () {}],
			[BigInt(0), 1],
			[BigInt(0), 1, 1],
			[BigInt(0), 1, { step: 1 }],
			[0, BigInt(1)],
			[0, BigInt(1), 1],
			[0, BigInt(1), { step: 1 }],
			[0, 1, BigInt(1)],
			[0, 1, { step: BigInt(1) }],
			[0, BigInt(1), BigInt(1)],
			[0, BigInt(1), { step: BigInt(1) }],
			[BigInt(0), 1, BigInt(1)],
			[BigInt(0), 1, { step: BigInt(1) }],
			[BigInt(0), BigInt(1), 1],
			[BigInt(0), BigInt(1), { step: 1 }],
			[BigInt(0), BigInt(10), BigInt(0)],
			[BigInt(0), BigInt(10), { step: BigInt(0) }]
		);
	}

	for (var i = 0; i < cases.length; i++) {
		proclaim.throws(function () {
			Iterator.range.apply(Iterator, cases[i]);
		});
	}
});
