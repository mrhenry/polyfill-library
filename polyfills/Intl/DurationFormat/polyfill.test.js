describe("Intl.DurationFormat", function () {
	before(function () {
		if (
			Intl.ListFormat &&
			typeof Intl.ListFormat.__addLocaleData === "function"
		) {
			Intl.ListFormat.__addLocaleData({
				data: {
					conjunction: {
						"long": {
							start: "{0}, {1}",
							middle: "{0}, {1}",
							end: "{0}, and {1}",
							pair: "{0} and {1}"
						},
						"short": {
							start: "{0}, {1}",
							middle: "{0}, {1}",
							end: "{0}, & {1}",
							pair: "{0} & {1}"
						},
						narrow: {
							start: "{0}, {1}",
							middle: "{0}, {1}",
							end: "{0}, {1}",
							pair: "{0}, {1}"
						}
					},
					disjunction: {
						"long": {
							start: "{0}, {1}",
							middle: "{0}, {1}",
							end: "{0}, or {1}",
							pair: "{0} or {1}"
						},
						"short": {
							start: "{0}, {1}",
							middle: "{0}, {1}",
							end: "{0}, or {1}",
							pair: "{0} or {1}"
						},
						narrow: {
							start: "{0}, {1}",
							middle: "{0}, {1}",
							end: "{0}, or {1}",
							pair: "{0} or {1}"
						}
					},
					unit: {
						"long": {
							start: "{0}, {1}",
							middle: "{0}, {1}",
							end: "{0}, {1}",
							pair: "{0}, {1}"
						},
						"short": {
							start: "{0}, {1}",
							middle: "{0}, {1}",
							end: "{0}, {1}",
							pair: "{0}, {1}"
						},
						narrow: {
							start: "{0} {1}",
							middle: "{0} {1}",
							end: "{0} {1}",
							pair: "{0} {1}"
						}
					}
				},
				locale: "en"
			});
		}

		if (
			Intl.NumberFormat &&
			typeof Intl.NumberFormat.__addLocaleData === "function"
		) {
			Intl.NumberFormat.__addLocaleData({
				data: {
					units: {
						simple: {
							year: {
								"long": { other: "{0} years", one: "{0} year" },
								"short": { other: "{0} yrs", one: "{0} yr" },
								narrow: { other: "{0}y" },
								perUnit: { "long": "{0} per year", "short": "{0}/y", narrow: "{0}/y" }
							},
							month: {
								"long": { other: "{0} months", one: "{0} month" },
								"short": { other: "{0} mths", one: "{0} mth" },
								narrow: { other: "{0}m" },
								perUnit: {
									"long": "{0} per month",
									"short": "{0}/m",
									narrow: "{0}/m"
								}
							},
							week: {
								"long": { other: "{0} weeks", one: "{0} week" },
								"short": { other: "{0} wks", one: "{0} wk" },
								narrow: { other: "{0}w" },
								perUnit: { "long": "{0} per week", "short": "{0}/w", narrow: "{0}/w" }
							},
							day: {
								"long": { other: "{0} days", one: "{0} day" },
								"short": { other: "{0} days", one: "{0} day" },
								narrow: { other: "{0}d" },
								perUnit: { "long": "{0} per day", "short": "{0}/d", narrow: "{0}/d" }
							},
							hour: {
								"long": { other: "{0} hours", one: "{0} hour" },
								"short": { other: "{0} hr" },
								narrow: { other: "{0}h" },
								perUnit: { "long": "{0} per hour", "short": "{0}/h", narrow: "{0}/h" }
							},
							minute: {
								"long": { other: "{0} minutes", one: "{0} minute" },
								"short": { other: "{0} min" },
								narrow: { other: "{0}m" },
								perUnit: {
									"long": "{0} per minute",
									"short": "{0}/min",
									narrow: "{0}/min"
								}
							},
							second: {
								"long": { other: "{0} seconds", one: "{0} second" },
								"short": { other: "{0} sec" },
								narrow: { other: "{0}s" },
								perUnit: {
									"long": "{0} per second",
									"short": "{0}/s",
									narrow: "{0}/s"
								}
							},
							millisecond: {
								"long": { other: "{0} milliseconds", one: "{0} millisecond" },
								"short": { other: "{0} ms" },
								narrow: { other: "{0}ms" },
								perUnit: {}
							}
						}
				  },
					numbers: {
						nu: ["latn"],
						symbols: {
							latn: {
								decimal: ".",
								group: ",",
								list: ";",
								percentSign: "%",
								plusSign: "+",
								minusSign: "-",
								approximatelySign: "~",
								exponential: "E",
								superscriptingExponent: "×",
								perMille: "‰",
								infinity: "∞",
								nan: "NaN",
								timeSeparator: ":"
							}
						},
						decimal: {
							latn: {
								standard: "#,##0.###",
								"long": {
									1000: { other: "0 thousand" },
									10000: { other: "00 thousand" },
									100000: { other: "000 thousand" },
									1000000: { other: "0 million" },
									10000000: { other: "00 million" },
									100000000: { other: "000 million" },
									1000000000: { other: "0 billion" },
									10000000000: { other: "00 billion" },
									100000000000: { other: "000 billion" },
									1000000000000: { other: "0 trillion" },
									10000000000000: { other: "00 trillion" },
									100000000000000: { other: "000 trillion" }
								},
								"short": {
									1000: { other: "0K" },
									10000: { other: "00K" },
									100000: { other: "000K" },
									1000000: { other: "0M" },
									10000000: { other: "00M" },
									100000000: { other: "000M" },
									1000000000: { other: "0B" },
									10000000000: { other: "00B" },
									100000000000: { other: "000B" },
									1000000000000: { other: "0T" },
									10000000000000: { other: "00T" },
									100000000000000: { other: "000T" }
								}
							}
						}
					},
					nu: ["latn"]
				},
				locale: "en"
			});
		}

		if (
			Intl.PluralRules &&
			typeof Intl.PluralRules.__addLocaleData === "function"
		) {
			Intl.PluralRules.__addLocaleData({
				data: {
					categories: {
						cardinal: ["one", "other"],
						ordinal: ["one", "two", "few", "other"]
					},
					fn: function (n, ord) {
						var s = String(n).split("."),
							v0 = !s[1],
							t0 = Number(s[0]) == n,
							n10 = t0 && s[0].slice(-1),
							n100 = t0 && s[0].slice(-2);
						if (ord)
							return n10 == 1 && n100 != 11
								? "one"
								: n10 == 2 && n100 != 12
								? "two"
								: n10 == 3 && n100 != 13
								? "few"
								: "other";
						return n == 1 && v0 ? "one" : "other";
					}
				},
				locale: "en"
			});
		}

		if (
			Intl.DurationFormat &&
			typeof Intl.DurationFormat.__addLocaleData === "function"
		) {
			Intl.DurationFormat.__addLocaleData({
				data: { nu: ["latn"], digitalFormat: { latn: ":" } },
				locale: "en"
			});
		}
	});

	it("format should work for style narrow", function () {
		proclaim.equal(
			new Intl.DurationFormat("en", { style: "narrow" }).format({
				days: 4,
				hours: 3
			}),
			"4d 3h"
		);
	});

	it("formatToParts should work for style long", function () {
		proclaim.deepEqual(
			new Intl.DurationFormat("en", { style: "long" }).formatToParts({
				days: 4,
				hours: 3
			}),
			[
				{ type: "integer", value: "4", unit: "day" },
				{ type: "literal", value: " ", unit: "day" },
				{ type: "unit", value: "days", unit: "day" },
				{ type: "literal", value: ", " },
				{ type: "integer", value: "3", unit: "hour" },
				{ type: "literal", value: " ", unit: "hour" },
				{ type: "unit", value: "hours", unit: "hour" }
			]
		);
	});
});
