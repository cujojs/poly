/*
	Array -- a stand-alone module for using Javascript 1.6 array iterators
	in lame-o browsers that don't support Javascript 1.6

	(c) copyright unscriptable.com / John Hann

	Licensed under the MIT License at:
	http://www.opensource.org/licenses/mit-license.php

	This module will wrap native methods to normalize array calls to
	be unified across js engines that support the array methods
	natively with those that don't:

	define(['poly/shim/Array'], function (array) {
		var items = [1, 2, 3];
		array.forEach(items, function (item) {
			console.log(item);
		};
	});

	You may also use this module to augment the Array.prototype of
	older js engines by loading it via the poly! plugin prefix.

	This module is compatible with has() pre-processors.

	When has()-processed for a modern browser, this file is only
	390 bytes when closure-compiled (240 bytes gzipped).

	If not has()-processed, this file is 1.55kB when closure-compiled
	(680 bytes gzipped).

	API:

	-- iterators (context is optional):

	forEach(array, lambda, context)
	every(array, lambda, context)
	some(array, lambda, context)

	-- mutators (context is optional):

	filter(array, lambda, context)
	map(array, lambda, context)

	-- finders (fromIndex is optional):

	indexOf(arr, item, fromIndex)
	lastIndexOf(arr, item, fromIndex)

	isArray(object)

	TODO: reduce, reduceRight

 */

(function (global, define, undef) {
	"use strict";

	var arrayPrototype = Array.prototype,
		toString = {}.toString,
		thisModule = {},
		methods = ['forEach', 'every', 'some', 'map', 'filter', 'indexOf', 'lastIndexOf'],
		missing = [],
		forEach,
		propRx = /^[^\-]*\-/;

	function isFunction (o) {
		return typeof o == 'function';
	}

	function isArray (o) {
		return toString.call(o) == '[object Array]';
	}

	function has (feature) {
		var prop = feature.replace(propRx, '');
		return isFunction(arrayPrototype[prop]);
	}

	function wrapNative (which) {
		return function (arr, arg1, arg2) { return arr[which](arg1, arg2); };
	}

	/***** iterators *****/

	var iterate;
	if (!has('array-foreach') || !has('array-every') || !has('array-some')) {
		iterate = function (arr, lambda, context) {

			var alo = Object(arr),
				len = alo.length >>> 0,
				i;

			if (arr == undef || !isFunction(lambda)) {
				throw new TypeError();
			}

			for (i = 0; i < len; i++) {
				if (i in alo) {
					if (!lambda.call(context, i, alo[i], alo)) {
						return false;
					}
				}
			}

			return true;
		};
	}

	if (!has('array-foreach')) {
		forEach = function (arr, lambda, context) {
			iterate(arr, function (item, i, arr) { lambda(item, i, arr); return true; }, context);
		};
	}
	else {
		forEach = wrapNative('forEach');
	}
	thisModule.forEach = forEach

	if (!has('array-every')) {
		missing.every = function (arr, lambda, context) {
			return iterate(arr, lambda, context);
		};
	}

	if (!has('array-some')) {
		missing.some = function (arr, lambda, context) {
			return iterate(arr, function (item, i, arr) { return !lambda(item, i, arr); }, context);
		};
	}

	/***** mutators *****/

	var mutate;
	if (!has('array-map') || !has('array-filter')) {
		mutate = function (arr, lambda, context, filter) {
			var result = [], val, res;
			iterate(arr, function (item, i) {
				val = arr[i];
				res = lambda.call(context, item, i, arr);
				if (!filter || res) {
					result.push(val);
				}
				return true;
			});
			return result;
		};
	}

	if(!has('array-map')) {
 		missing.map = function (arr, lambda, context) {
			return mutate(arr, lambda, context, false);
		};
	}

	if (!has('array-filter')) {
		missing.filter = function (arr, lambda, context) {
			return mutate(arr, lambda, context, true);
		};
	}

	/***** finders *****/

	var find;
	if (!has('array-indexof') || !has('array-lastindexof')) {
		find = function (arr, item, from, forward) {

			var alo = Object(arr),
				len = alo.length >>> 0,
				i;

			if (arr == undef) {
				throw new TypeError();
			}

			from = isNaN(from) ? (forward ? 0 : len) : Number(from);
// TODO: finish lastIndexOf
			from = from < 0 ? Math.max(0, len + from) : from;

			for (i = from; i < len; forward ? i++ : i--) {
				if (i in alo && alo[i] === item) {
					return i;
				}
			}

			return -1;
		}
	}

	if (!has('array-indexof')) {
		missing.indexOf = function (arr, item, from) {
			return find(arr, item, from, true);
		};
	}

	if (!has('array-lastindexof')) {
		missing.lastIndexOf = function (arr, item, from) {
			return find(arr, item, from, false);
		};
	}

	forEach(methods, function (name) {
		if (name in missing) {
			thisModule[name] = missing[name];
		}
		else {
			thisModule[name] = wrapNative(name);
		}
	});
	thisModule.isArray = isArray;

	// this method works kinda convoluted-ly, but I can't think of a good
	// way to offer this feature without tons of extra code. Note: you can
	// execute this method as often as you like. it only runs once.
	var augmentArrayPrototype;
	augmentArrayPrototype = function () {
		forEach(missing, function (method) {
			arrayPrototype[method] = function (arg1, arg2) {
				return thisModule[method](this, arg1, arg2);
			};
		});
		if (!Array.isArray) {
			Array.isArray = isArray;
		}
		augmentArrayPrototype = function () {};
	};
	thisModule['polyfill'] = function () {
		augmentArrayPrototype();
	};

	define(thisModule);

}(this, define));
