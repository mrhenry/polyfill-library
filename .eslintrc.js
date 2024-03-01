module.exports = {
	env: {
		commonjs: true,
		es6: true,
		node: true
	},
	extends: ["eslint:recommended", "plugin:unicorn/recommended"],
	globals: {
		Atomics: "readonly",
		SharedArrayBuffer: "readonly"
	},
	parserOptions: {
		ecmaVersion: 2018,
		allowReserved: false
	},
	rules: {
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
	}
};
