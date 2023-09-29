module.exports = {
	parser: '@typescript-eslint/parser',
	extends: [
	  'plugin:react/recommended',
	  'plugin:@typescript-eslint/recommended',
	  'prettier',
	  'plugin:prettier/recommended'
	],
	parserOptions: {
	  ecmaFeatures: {
		jsx: true
	  }
	},
	settings: {
	  react: {
		version: 'detect'
	  }
	},
	rules: {
	  'prettier/prettier': 'error',
	  'react/prop-types': 'off'
	}
  }
  