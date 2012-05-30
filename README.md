Code to modern standards. Run everywhere.
=========

version: 0.4
License: MIT

poly.js is the a collection of AMD modules that shim (aka "polyfill")
old browsers to support modern (aka "ES5-ish") javascript.

poly.js is unique amongst ES5-ish shims because it:

* is modular, not monolithic
* is tiny
* is configurable to suit your code
* can be minified using a has-aware compiler/compressor

After cloning poly, be sure to update the submodules if you want to include
JSON support.  Run the following from the root of the poly directory:

```
git submodule init && git submodule update
```

Features
----

poly augments browsers with all of the following features:

poly/array:
---

* array.forEach
* array.map
* array.some
* array.every
* array.indexOf
* array.lastIndexOf
* array.reduce
* array.reduceRight
* Array.isArray

poly/function:
---

* func.bind

poly/json:
---

* (global) JSON

poly/object:
---

* Object.create,
* Object.freeze *
* Object.isFrozen *
* Object.seal *
* Object.isSealed *
* Object.getPrototypeOf
* Object.keys
* Object.getOwnPropertyNames
* Object.defineProperty *
* Object.defineProperties *
* Object.isExtensible
* Object.preventExtensions *
* Object.getOwnPropertyDescriptor *

Methods marked with * cannot be shimmed completely. You can decide whether
these methods should fail silently or loudly.  The poly/object and poly/all
modules return a function, `failIfShimmed`, that takes a single parameter.

This parameter may be:

* a boolean (all Object.XXX functions should fail)
* a RegExp (matches on `("object-" + methodName).toLowerCase()`)
* a string that can be converted to a RegExp
* a function that takes a method name as a parameter and return truthy/falsey

By default, `failIfShimmed` will fail loudly for the following functions:

* Object.defineProperty
* Object.defineProperties
* Object.preventExtensions
* Object.getOwnPropertyDescriptor

poly/string:
---

* string.trim
* string.trimLeft
* string.trimRight

poly/xhr:
---

* (global) XMLHttpRequest

Examples
==========

Using poly's modules as shims / polyfills:

```js
	// somewhere in your app's initialization code, load the "poly/array"
	// and "poly/function" module
	// and it will shim the native Array prototype
	curl({ preloads: [ "poly/array" ] });

	// later, just use arrays as if the js engine supports javascript 1.7!
	define(/* my module */ function () {

		// Arrays are so hawt!

		return {

			myFunc: function (arr, process) {

				arr.forEach(function (item) {

					process(item);

				}

			}

		}

	});
```

```js
	// use all available shims
	curl({ preloads: [ "poly/all" ] });
```

```js
	// use just the array and function shims
	curl({ preloads: [ "poly/array", "poly/function" ] });
```
