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
var IntlPolyfillOutput = path.resolve("polyfills/Intl/DurationFormat");
var LocalesPolyfillOutput = path.resolve(
	"polyfills/Intl/DurationFormat/~locale"
);
var TOML = require("@iarna/toml");
var localeMatcher = require("@formatjs/intl-localematcher");
var browserify = require("browserify");
var stream = require("stream");

var entry = `
require('@formatjs/intl-durationformat/polyfill-force')
`;

browserify()
	.add(stream.Readable.from(entry), {
		basedir: IntlPolyfillOutput
	})
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
		fs.writeFileSync(polyfillOutputPath, "");
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
