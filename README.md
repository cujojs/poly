Code to modern standards -- or not
=========

version: 0.2
License: MIT

poly is a collection of AMD modules that can be used to work with old or new
javascript engines in a uniform manner.

Sounds like any other micro-framework, right?  Yah, I guess.  But poly has some
unique features:

1. poly is a set of AMD modules instead of a monolithic collection of functions
2. poly (will soon have) a comprehensive suite of tests
3. poly will work on just about every javascript-powered browser ever conceived
4. poly's modules can be used as either "standardized" abstractions/wrappers or
as shims that add methods to native prototypes.  You choose.

Examples
==========

Using poly's modules as "standardized" abstractions/wrappers:

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
	require(["poly!poly/array"]);

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
