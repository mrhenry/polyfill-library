import js from "@eslint/js";
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import eslintPluginUncalledIIFE from 'eslint-plugin-uncalled-iife';
import globals from "globals";

const browserScriptDefaults = {
	rules: {
		"comma-dangle": ["error", "never"],
		"quote-props": ["error", "as-needed", { "keywords": true }],
		"dot-notation": ["error"],
		"radix": ["error"],
		"no-catch-shadow": ["error"],
		"no-dupe-else-if": ["error"],
		"no-unused-vars": ["error", {
			"argsIgnorePattern": "^_",
			"caughtErrors": "none",
		}],
		"no-empty": ["error", {
			"allowEmptyCatch": true,
		}],
		"no-useless-assignment": ["off"],
		"preserve-caught-error": ["off"]
	},
	languageOptions: {
		ecmaVersion: 3,
		sourceType: "script",
		parserOptions: {
			allowReserved: true
		},
		globals: {
			...globals.browser,
		},
	},
};

const ignores = [
	"polyfills/__dist/**",
	"tasks/**/node_modules",
	"test/coverage/**",

	// We ignore the polyfill.js files for third-party polyfills
	// because we do not control their implementation.

	// We do not ignore the config.json, detect.js or polyfill.test.js
	// because we do control their implementation.
	"polyfills/AbortController/polyfill.js",
	"polyfills/ArrayBuffer/polyfill.js",
	"polyfills/AudioContext/polyfill.js",
	"polyfills/EventSource/polyfill.js",
	"polyfills/HTMLPictureElement/polyfill.js",
	"polyfills/HTMLTemplateElement/polyfill.js",
	"polyfills/Intl/**/detect.js",
	"polyfills/Intl/**/polyfill.js",
	"polyfills/Intl/**/~locale",
	"polyfills/JSON/polyfill.js",
	"polyfills/MutationObserver/polyfill.js",
	"polyfills/ResizeObserver/polyfill.js",
	"polyfills/String/prototype/normalize/polyfill.js",
	"polyfills/TextEncoder/polyfill.js",
	"polyfills/UserTiming/polyfill.js",
	"polyfills/WebAnimations/polyfill.js",
	"polyfills/atob/polyfill.js",
	"polyfills/fetch/polyfill.js",
	"polyfills/smoothscroll/polyfill.js",
	"polyfills/~html5-elements/polyfill.js",
	"polyfills/_IteratorHelpers/polyfill.js",

	// Vendored mocha
	"test/polyfills/mocha/**",
];

const unicornConfigOverrides = {
	"unicorn/prefer-optional-catch-binding": "off",
	"unicorn/prefer-ternary": "off",
	"unicorn/prefer-module": "off",
	"unicorn/prefer-string-replace-all": "off",
	"unicorn/text-encoding-identifier-case": "off",
	"unicorn/no-typeof-undefined": "off",
	"unicorn/numeric-separators-style": "off",
	"unicorn/switch-case-braces": "off",
	"unicorn/prefer-at": "off",
	"unicorn/prefer-top-level-await": "off",
	"unicorn/no-abusive-eslint-disable": "off",
};

export default [
	js.configs.recommended,
	{
		ignores: ignores,
	},
	{
		files: [
			"tasks/**/*",
			"test/**/*",
			"polyfills/**/update.task.js",
		],
		ignores: [
			"tasks/polyfill-templates/polyfill.js",
			"tasks/polyfill-templates/detect.js",
			"tasks/polyfill-templates/polyfill.test.js",
		],
		languageOptions: {
			ecmaVersion: 2022,
			globals: {
				...globals.commonjs,
				...globals.es6,
				...globals.node,
				Atomics: "readonly",
				SharedArrayBuffer: "readonly",
			}
		},
		plugins: {
			unicorn: eslintPluginUnicorn,
		},
		rules: {
			...unicornConfigOverrides,
			"no-empty": ["error", {
				"allowEmptyCatch": true,
			}],
		}
	},
	{
		files: [
			"lib/**/*",
		],
		languageOptions: {
			ecmaVersion: 2018,
			globals: {
				...globals.commonjs,
				...globals.es6,
				...globals.node,
			}
		},
		plugins: {
			unicorn: eslintPluginUnicorn,
		},
		rules: {
			...unicornConfigOverrides,
			"no-empty": ["error", {
				"allowEmptyCatch": true,
			}],
			"no-unused-vars": ["error", {
				"caughtErrors": "none",
			}],
		}
	},
	{
		files: [
			"polyfills/**/polyfill.js",
		],
		languageOptions: browserScriptDefaults.languageOptions,
		rules: browserScriptDefaults.rules,
		ignores: ignores,
	},
	{
		files: [
			"tasks/polyfill-templates/polyfill.js",
		],
		languageOptions: browserScriptDefaults.languageOptions,
		rules: {
			...browserScriptDefaults.rules,
			"no-unused-vars": ["error", {
				"args": "none",
			}],
		},
		ignores: ignores,
	},
	{
		files: [
			"polyfills/**/detect.js",
			"tasks/polyfill-templates/detect.js",
		],
		languageOptions: browserScriptDefaults.languageOptions,
		plugins: {
			"uncalled-iife": eslintPluginUncalledIIFE,
		},
		rules: {
			...browserScriptDefaults.rules,
			"uncalled-iife/uncalled-iife": "error",
		}
	},
	{
		files: [
			"polyfills/**/*.test.js",
			"tasks/polyfill-templates/*.test.js",
		],
		languageOptions: {
			...browserScriptDefaults.languageOptions,
			globals: {
				...globals.mocha,
				...globals.browser,
				proclaim: "readonly",
			}
		},
		rules: browserScriptDefaults.rules,
	}
]
