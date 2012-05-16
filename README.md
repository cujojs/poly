Code to modern standards -- or not. you pick.
=========

version: 0.3.1
License: MIT

poly is a collection of AMD modules that can be used to polyfill (aka "shim")
old browsers to support modern javascript methods.  You can use poly's modules
to augment native objects or use them as standardized wrapper functions.

You choose how you want to use poly by how you load the modules.

If you load the shims using the poly! plugin, they augment the native objects.
If you load the shims directly, they are served as wrapper functions.

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
* Object.freeze *,
* Object.isFrozen *,
* Object.seal *,
* Object.isSealed *,
* Object.getPrototypeOf,
* Object.keys,
* Object.getOwnPropertyNames,
* Object.defineProperty *,
* Object.defineProperties *,
* Object.isExtensible *,
* Object.preventExtensions *,
* Object.getOwnPropertyDescriptor *

Methods marked with * cannot be shimmed safely. You can decide whether these
methods should fail silently or loudly.  Use the AMD config variable,
"failIfShimmed" to determine which methods should fail loudly.

"failIfShimmed" can be:

* a boolean (all should fail)
* a RegExp (matches on `("object-" + methodName).toLowerCase()`)
* a string that can be converted to a RegExp
* a function that takes a method name as a parameter and return truthy/falsey

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

Using poly's modules as abstractions/wrappers:

	// the AMD loader has been configured to point the "array" module id to
	// "poly/array". You could later decide not to use poly and switch over to
	// another set of modules, such as dojo by aliasing "array" to "dojo/array"

	define(/* my module */ ["array"], function (array) {

		// array is a "standardized" wrapper around native array implementations

		return {

			myFunc: function (arr) {

				array.forEach(arr, function (item) {

					console.log(item);

				}

			}

		}

	});

Using poly's modules as shims / polyfills:

	// somewhere in your app's initialization code, load the "poly/array" module
	// using the "poly!" plugin and it will shim the native Array prototype
	curl({ preloads: [ "poly!poly/array" ] });

	// later, just use arrays as if the js engine supports javascript 1.8!
	define(/* my module */ function () {

		// Arrays are so hawt!

		return {

			myFunc: function (arr) {

				arr.forEach(function (item) {

					console.log(item);

				}

			}

		}

	});
