# React Webpack Starter first version
> This is a boilerplate for React 16 & Webpack 4. It includes webpack-dev-server and a build script

## Quick Start

``` bash
# Install dependencies
npm install

# Serve on localhost:3000
npm start

# Build for development version
npm run build

# Build for production
npm run build:prod

# To run eslint 
npm run lint (--fix)

# To run tests 
npm run test

# Install rimraf" : "To clear node_modules code please install rimraf globally in machine. 
npm install -g rimraf

# eslint (airbnb) rules added for this project

# Disallow multiple elements/components being opened on one line
"react/jsx-one-expression-per-line": "never" 
# validates a specific indentation style for JSX (2 spaces indentation)
"react/jsx-indent": ["error", 2] 
# Enforce a defaultProps definition for every prop even though if it is not required prop, is disabled
"react/require-default-props": 0,
# allowed extensions is configurable, By default '.jsx' is allowed if needed both then add [".js", ".jsx"]
"react/jsx-filename-extension": [1, {"extensions": [".js"]}],
# Enforce consistent usage of destructuring assignment of props, state, and context. Enabled (this.state.value) (this.props.value) are allowed now.
"react/destructuring-assignment": [true, { "extensions": [".jsx"] }],
# Expected linebreaks to be 'LF' but found 'CRLF' linebreak-style - disabled this error
"linebreak-style": ["error", "windows"],
# By default this rule prevents vague prop types with more specific alternatives available (any, array, object)
"react/forbid-prop-types": ["any", "array", "object"],
# This includes cycles of depth 6 (imported module imports me) to Infinity, if the maxDepth option is not set.
"import/no-cycle": [6, { "maxDepth": 2 }],
# Enforce stateless React Components to be written as a pure function to be ignored
"react/prefer-stateless-function": [0, { "ignorePureComponents": true }],
# Default export is disabled
"import/prefer-default-export": "off",
# To resolve this error : Unexpected block statement surrounding arrow body
"arrow-body-style": ["error", "as-needed"]

# Internationalization using react-intl npm module
 * For internationalization we have used react-intl module,  Use FormattedMessage component inside react elements for example
_<h1>
    <FormattedMessage id='app.id' defaultMessage='any default message'></FormattedMessage>
</h1>

Now inside Translation/en.js and dc.js add your messages .
Make sure ids are unique._

# Jest for testing
_ We have integrated jest and enzyme in the boilerplate project.
For every component we create, it is mandatory to create test cases.
Best way to do is by snapshot testing. 
Under individual component folder, create a new folder called __test__ and name the test file as component_test.js
If we are doing snapshot testing, a new folder called snapshot will be created inside the test folder
Code coverage is also implemented. _

# linting for js/scss files
_ We have configured this biolerplate using eslint and eslint-plugin-react modules, to add more rules _
    * https://github.com/yannickcr/eslint-plugin-react
    * https://eslint.org/docs/rules/

#SCSS linting rules
#Specify indentation (Autofixable)
"indentation": 2
#Disallow invalid hex colors
"color-no-invalid-hex": true
#Disallow duplicate font family names
"font-family-no-duplicate-names": true
#Disallow missing generic families in lists of font family names
"font-family-no-missing-generic-family-keyword": true
#Disallow an unspaced operator within calc functions
"function-calc-no-unspaced-operator": true,
#Disallow direction values in linear-gradient() calls that are not valid according to the standard syntax. 
"function-linear-gradient-no-nonstandard-direction": true,
#Disallow (unescaped) newlines in strings
"string-no-newline": true,
#Disallow unknown units
"unit-no-unknown": true,
#Disallow unknown properties
"property-no-unknown": true,
#Disallow vendor prefixes for properties    
"property-no-vendor-prefix": true,
#Disallow duplicate properties within declaration blocks.
"declaration-block-no-duplicate-properties": true,
#Disallow shorthand properties that override related longhand properties within declaration blocks.
"declaration-block-no-shorthand-property-overrides": true,
#Disallow empty blocks
"block-no-empty": true,
#Disallow unknown pseudo-class selectors
"selector-pseudo-class-no-unknown": true,
#Disallow unknown pseudo-element selectors
"selector-pseudo-element-no-unknown": true,
#Disallow unknown type selectors
"selector-type-no-unknown": true,
#Disallow unknown media feature names
"media-feature-name-no-unknown": true,
#Disallow unknown at-rules
"at-rule-no-unknown": true,
#Disallow empty comments
"comment-no-empty": true,
#Disallow selectors of lower specificity from coming after overriding selectors of higher #specificity.
"no-descending-specificity": true,
#Disallow duplicate @import rules within a stylesheet
"no-duplicate-at-import-rules": true,
#Disallow duplicate selectors
"no-duplicate-selectors": true,
#Disallow empty sources
"no-empty-source": true,
#Disallow end-of-line whitespace (Autofixable)
"no-eol-whitespace": true,
#Disallow extra semicolons (Autofixable)
"no-extra-semicolons": true,
#Disallow double-slash comments (//...) which are not supported by CSS
"no-invalid-double-slash-comments": true,
#Require (where possible) or disallow named colors
"color-named": "never",
#Disallow scheme-relative urls
"function-url-no-scheme-relative": true,
#Disallow redundant values in shorthand properties (Autofixable)
"shorthand-property-no-redundant-values": true,
#Disallow vendor prefixes for values
"value-no-vendor-prefix": true,
#Disallow !important within declarations.
"declaration-no-important": true,
#Limit the number of declarations within single line declaration blocks
"declaration-block-single-line-max-declarations": 1,
#Limit the number of ID selectors in a selector
"selector-max-id": 2,
#Disallow vendor prefixes for media feature names
"media-feature-name-no-vendor-prefix": true,
#Limit the depth of nesting
"max-nesting-depth": 3,
#Specify single or double quotes around strings (Autofixable)
"string-quotes": "single",
#Disallow units for zero lengths (Autofixable)
"length-zero-no-unit": true,
#Limit the length of a line
"max-line-length": 80,
#Limit the number of adjacent empty lines within selectors
"max-empty-lines": 2,
#Disallow missing end-of-source newlines (Autofixable)
"no-missing-end-of-source-newline": true,
#Limit the number of adjacent empty lines within value lists
"value-list-max-empty-lines": 0,
#Require a single space or disallow whitespace after the colon of declarations (Autofixable)
"declaration-colon-space-after": "always"

##
Components

Components are divided into two categories

1. Container Components : Container components are state components which will create / update the state. 

Examples of container components : Login / Resignation / Making API calls and rendering the response

2. Components : Components folder contains presentational / dumb components which will 
receive the props and render the content accordingly.

Examples of components : Labels, Input controls e.t.c.

State management / Redux : 

Each component will have its own state management i.e.

1. Reducers
2. Actions
3. store

Testing :

Testing is included for each component folder

Linting :

1. .eslintrc.json : File contains all eslint rules for writing the standard code.

2. .stylelintrc.json : File contains all SCSS linting rules for writing standard SCSS code.

Configuring Java script Flow :

1. Flow is a static type checker for your JavaScript code. It does a lot of work to make you more productive. 
   Making you code faster, smarter, more confidently, and to a bigger scale.

2. Flow checks your code for errors through static type annotations. These types allow you to tell Flow how you want your code to work, 
   and Flow will make sure it does work that way.   
   
   Example Usage :
  
	// @flow
	function square(n: number): number {
		return n * n;
	}
	square("2"); // Error as the function is expecting the number but we are passing string!
   






        


