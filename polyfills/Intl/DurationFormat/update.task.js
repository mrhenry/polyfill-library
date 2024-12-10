/*
 * This script will copy all of the localisation language files from the Intl.DurationFormat
 * module and install them within a folder in this directory named ~locale.
 *
 * The detect.js file used for Intl is copied into every ~locale polyfill for
 * use on detecting whether that locale needs to be polyfilled.
 *
 * The config.toml file for each locale polyfill is based off of the one for
 * Intl. The changes made ot it are:
 *  - Removing the "install" section
 *  - Adding Intl as a dependency
 */

"use strict";

var fs = require("fs");
var path = require("path");
var ListFormatLocalesPath = path.dirname(
	require.resolve("@formatjs/intl-listformat/locale-data/en.js")
);
var NumberFormatLocalesPath = path.dirname(
	require.resolve("@formatjs/intl-numberformat/locale-data/en.js")
);
var PluralRulesLocalesPath = path.dirname(
	require.resolve("@formatjs/intl-pluralrules/locale-data/en.js")
);
var IntlPolyfillOutput = path.resolve("polyfills/Intl/DurationFormat");
var LocalesPolyfillOutput = path.resolve(
	"polyfills/Intl/DurationFormat/~locale"
);
var timeSeparators =
	require("@formatjs/intl-durationformat/src/time-separators.generated").TIME_SEPARATORS;
var TOML = require("@iarna/toml");
var localeMatcher = require("@formatjs/intl-localematcher");
var browserify = require("browserify");
var stream = require("stream");

var entry = `
require('@formatjs/intl-durationformat/polyfill-force')
`;

const codeProcessors = [
	{
		filename:
			"node_modules/@formatjs/intl-durationformat/src/time-separators.generated.js",
		description: "remove redundant TIME_SEPARATORS",
		processor: (code) =>
			code.replace(
				/exports\.TIME_SEPARATORS = \{[\S\s]+?\};/,
				"exports.TIME_SEPARATORS = {localeData:{}};"
			)
	},
	{
		filename: "node_modules/@formatjs/intl-durationformat/src/core.js",
		description: "remove presumed default locale",
		processor: (code) =>
			code.replace(
				"DurationFormat.__defaultLocale = 'en';",
				"DurationFormat.__defaultLocale = '';"
			)
	},
	{
		filename: "node_modules/@formatjs/intl-durationformat/src/core.js",
		description: "add `__addLocaleData` function",
		processor: (code) =>
			code.replace(
				"DurationFormat.polyfilled = true;",
				`DurationFormat.polyfilled = true;
	DurationFormat.__addLocaleData = function __addLocaleData() {
		var data = [];
		for (var _i = 0; _i < arguments.length; _i++) {
			data[_i] = arguments[_i];
		}
		for (var _a = 0, data_1 = data; _a < data_1.length; _a++) {
			var _b = data_1[_a], d = _b.data, locale = _b.locale;
			var minimizedLocale = new Intl.Locale(locale).minimize().toString();
			DurationFormat.localeData[locale] = DurationFormat.localeData[minimizedLocale] = d;
			DurationFormat.availableLocales.add(minimizedLocale);
			DurationFormat.availableLocales.add(locale);
			if (!DurationFormat.__defaultLocale) {
				DurationFormat.__defaultLocale = minimizedLocale;
			}
		}
	};`
			)
	},
	{
		filename:
			"node_modules/@formatjs/intl-durationformat/node_modules/@formatjs/intl-localematcher/abstract/regions.generated.js",
		description: "truncate unused regions file",
		processor: () => `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.regions = void 0;
`
	},
	{
		filename:
			"node_modules/@formatjs/intl-durationformat/node_modules/@formatjs/intl-localematcher/abstract/languageMatching.js",
		description: "truncate unused language matching file",
		processor: () => `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.data = void 0;
`
	},
	{
		filename:
			"node_modules/@formatjs/intl-durationformat/node_modules/@formatjs/intl-localematcher/abstract/BestFitMatcher.js",
		description:
			"simplify `BestFitMatcher` polyfill so it doesn't depend on large generated files",
		processor: () => `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BestFitMatcher = BestFitMatcher;
var BestAvailableLocale_1 = require("./BestAvailableLocale");
var utils_1 = require("./utils");

// bazel-out/darwin-fastbuild/bin/packages/ecma402-abstract/lib/BestFitMatcher.js
function BestFitMatcher(availableLocales, requestedLocales, getDefaultLocale) {
	var minimizedAvailableLocaleMap = {};
	var minimizedAvailableLocales = new Set();
	availableLocales.forEach(function(locale2) {
		var minimizedLocale = new Intl.Locale(locale2).minimize().toString();
		minimizedAvailableLocaleMap[minimizedLocale] = locale2;
		minimizedAvailableLocales.add(minimizedLocale);
	});
	var foundLocale;
	for (var _i = 0, requestedLocales_1 = requestedLocales; _i < requestedLocales_1.length; _i++) {
		var l = requestedLocales_1[_i];
		if (foundLocale) {
			break;
		}
		var noExtensionLocale = l.replace(utils_1.UNICODE_EXTENSION_SEQUENCE_REGEX, "");
		if (availableLocales.indexOf(noExtensionLocale) > -1) {
			foundLocale = noExtensionLocale;
			break;
		}
		if (minimizedAvailableLocales.has(noExtensionLocale)) {
			foundLocale = minimizedAvailableLocaleMap[noExtensionLocale];
			break;
		}
		var locale = new Intl.Locale(noExtensionLocale);
		var maximizedRequestedLocale = locale.maximize().toString();
		var minimizedRequestedLocale = locale.minimize().toString();
		if (minimizedAvailableLocales.has(minimizedRequestedLocale)) {
			foundLocale = minimizedAvailableLocaleMap[minimizedRequestedLocale];
			break;
		}
		foundLocale = (0, BestAvailableLocale_1.BestAvailableLocale)(Array.from(minimizedAvailableLocales), maximizedRequestedLocale);
	}
	return {
		locale: foundLocale || getDefaultLocale()
	};
}
`
	}
];

const processCode = (file, code) => {
	for (const { filename, processor } of codeProcessors) {
		if (file.endsWith(filename)) {
			code = processor(code);
		}
	}
	return code;
};

browserify()
	.add(stream.Readable.from(entry), {
		basedir: IntlPolyfillOutput
	})
	.transform(
		(file) => {
			const bufs = [];
			return new stream.Transform({
				transform: function (chunk, enc, next) {
					bufs.push(chunk);
					next();
				},
				flush: function (next) {
					const code = Buffer.concat(bufs).toString();
					this.push(processCode(file, code));
					next();
				}
			});
		},
		{
			global: true
		}
	)
	.bundle()
	.pipe(fs.createWriteStream(path.join(IntlPolyfillOutput, "polyfill.js")));

var listFormatLocales = new Set(
	fs
		.readdirSync(ListFormatLocalesPath)
		.filter(function (f) {
			return f.endsWith(".js");
		})
		.map((f) => {
			return f.slice(0, f.indexOf("."));
		})
);

var numberFormatLocales = new Set(
	fs
		.readdirSync(NumberFormatLocalesPath)
		.filter(function (f) {
			return f.endsWith(".js");
		})
		.map((f) => {
			return f.slice(0, f.indexOf("."));
		})
);

var pluralRulesLocales = new Set(
	fs
		.readdirSync(PluralRulesLocalesPath)
		.filter(function (f) {
			return f.endsWith(".js");
		})
		.map((f) => {
			return f.slice(0, f.indexOf("."));
		})
);

function localeDependencies(locale) {
	const out = [];

	const listFormatMatch = localeMatcher.match(
		[locale],
		Array.from(listFormatLocales)
	);
	if (listFormatMatch) {
		out.push(`Intl.ListFormat.~locale.${listFormatMatch}`);
	}

	const numberFormatMatch = localeMatcher.match(
		[locale],
		Array.from(numberFormatLocales)
	);
	if (numberFormatMatch) {
		out.push(`Intl.NumberFormat.~locale.${numberFormatMatch}`);
	}

	const pluralRulesMatch = localeMatcher.match(
		[locale],
		Array.from(pluralRulesLocales)
	);
	if (pluralRulesMatch) {
		out.push(`Intl.PluralRules.~locale.${pluralRulesMatch}`);
	}

	return out;
}

var configSource = TOML.parse(
	fs.readFileSync(path.join(IntlPolyfillOutput, "config.toml"), "utf-8")
);
delete configSource.install;

if (!fs.existsSync(LocalesPolyfillOutput)) {
	fs.mkdirSync(LocalesPolyfillOutput, { recursive: true });
}

// customizing the config to add intl as a dependency
configSource.dependencies.push("Intl.DurationFormat");

// don't test every single locale - it will be too slow
configSource.test = { ci: false };

function intlLocaleDetectFor(locale) {
	return (
		"'Intl' in self && " +
		"Intl.DurationFormat && " +
		"Intl.DurationFormat.supportedLocalesOf && " +
		"Intl.DurationFormat.supportedLocalesOf('" +
		locale +
		"').length === 1"
	);
}

console.log(
	"Importing Intl.DurationFormat~locale.* polyfill from " +
		NumberFormatLocalesPath
);
var locales = fs.readdirSync(NumberFormatLocalesPath);
locales
	.filter(function (f) {
		return f.endsWith(".js");
	})
	.forEach(function (file) {
		var locale = file.slice(0, file.indexOf("."));
		var localeOutputPath = path.join(LocalesPolyfillOutput, locale);

		if (!fs.existsSync(localeOutputPath)) {
			fs.mkdirSync(localeOutputPath, { recursive: true });
		}

		var polyfillOutputPath = path.join(localeOutputPath, "polyfill.js");
		var detectOutputPath = path.join(localeOutputPath, "detect.js");
		var configOutputPath = path.join(localeOutputPath, "config.toml");

		var lookupLocale = locale;
		if (locale === "ca-ES-VALENCIA") lookupLocale = "ca-ES-valencia";
		if (locale === "en-US-POSIX") lookupLocale = "en";
		var nu = timeSeparators.localeData[lookupLocale].nu;
		var digitalFormat =
			timeSeparators.localeData[lookupLocale].separator ||
			nu.reduce(function (separators, n) {
				separators[n] = timeSeparators.default;
				return separators;
			}, {});
		var localeData = {
			nu,
			digitalFormat
		};

		fs.writeFileSync(
			polyfillOutputPath,
			`/* @generated */
// prettier-ignore
if (Intl.DurationFormat && typeof Intl.DurationFormat.__addLocaleData === 'function') {
  Intl.DurationFormat.__addLocaleData(${JSON.stringify({
		data: localeData,
		locale
	})})
}
`
		);
		fs.writeFileSync(detectOutputPath, intlLocaleDetectFor(locale));
		fs.writeFileSync(
			configOutputPath,
			TOML.stringify({
				...configSource,
				dependencies: [
					...configSource.dependencies,
					...localeDependencies(locale)
				].sort()
			})
		);
	});

console.log(locales.length + " imported locales");
console.log("Intl.DurationFormat polyfill imported successfully");
