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

	TODO: use _base module

 */

define(['./_base', 'exports'], function (base, exports) {
"use strict";

	var proto = Array.prototype,
		toString = {}.toString,
		featureMap,
		methods = {},
		missing = {},
		alreadyShimmed,
		undef;

	// DO NOT REMOVE QUOTES FROM NAMES! (closure compiler will clobber some!)
	featureMap = {
		'foreach': 'forEach',
		'every': 'every',
		'some': 'some',
		'map': 'map',
		'filter': 'filter',
		'reduce': 'reduce',
		'reduceright': 'reduceRight',
		'indexof': 'indexOf',
		'lastindexof': 'lastIndexOf'
	};

	function isArray (o) {
		return toString.call(o) == '[object Array]';
	}

	function has (feature) {
		var prop = featureMap['array-' + feature];
		return base.isFunction(proto[prop]);
	}

	function returnTruthy () {
		return 1;
	}

	function returnValue (val) {
		return val;
	}

	/***** iterators *****/

	function _iterate (arr, lambda, continueFunc, context, start, inc) {

		var alo, len, i, end;

		alo = Object(arr);
		len = alo.length >>> 0;

		if (start === undef) start = 0;
		if (!inc) inc = 1;
		end = inc < 0 ? -1 : len;

		if (arr == undef) {
			throw new TypeError('Array is undefined');
		}
		if (!base.isFunction(lambda)) {
			throw new TypeError('Lambda is not callable');
		}
		if (start == end) {
			return false;
		}
		if ((start <= end) ^ (inc > 0)) {
			throw new TypeError();
		}

		for (i = start; i != end; i = i + inc) {
			if (i in alo) {
				if (!continueFunc(lambda.call(context, alo[i], i, alo), i, alo[i])) {
					return false;
				}
			}
		}

		return true;
	}

	/**
	 * Iterates through all items in the array, calling the lambda function
	 * on each.  Skips missing items in sparse arrays.
	 * @param lambda {function} function (item, index, array) { }
	 * @param context {object} context of `this` inside lambda function
	 */
	function forEach (lambda) {
		// arguments[+1] is to fool google closure compiler into NOT adding a function argument!
		_iterate(this, lambda, returnTruthy, arguments[+1]);
	}

	function every (lambda) {
		// arguments[+1] is to fool google closure compiler into NOT adding a function argument!
		return _iterate(this, lambda, returnValue, arguments[+1]);
	}

	function some (lambda) {
		// arguments[+1] is to fool google closure compiler into NOT adding a function argument!
		return _iterate(this, lambda, function (val) { return !val; }, arguments[+1]);
	}

	methods.forEach = forEach;
	if (!has('array-foreach')) {
		missing.forEach = forEach;
	}

	methods.every = every;
	if (!has('array-every')) {
		missing.every = every;
	}

	methods.some = some;
	if (!has('array-some')) {
		missing.some = some;
	}

	/***** mutators *****/

	function map (lambda) {
		var arr, result;

		arr = this;
		result = new Array(arr.length);

		// arguments[+1] is to fool google closure compiler into NOT adding a function argument!
		_iterate(arr, lambda, function (val, i) { result[i] = val; return 1; }, arguments[+1]);

		return result;
	}

	function filter (lambda) {
		var arr, result, val;

		arr = this;
		result = [];

		_iterate(arr, lambda, function (val, i, orig) {
			// use a copy of the original value in case
			// the lambda function changed it
			if (val) {
				result.push(orig);
			}
			return 1;
		}, arguments[1]);

		return result;
	}

	methods.map = map;
	if(!has('array-map')) {
		missing.map = map;
	}

	methods.filter = filter;
	if (!has('array-filter')) {
		missing.filter = filter;
	}

	/***** reducers *****/

	function _reduce (reduceFunc, inc, initialValue, hasInitialValue) {
		var reduced, startPos, initialValuePos;

		startPos = initialValuePos = inc > 0 ? -1 : Object(this).length >>> 0;

		// If no initialValue, use first item of array (we know length !== 0 here)
		// and adjust i to start at second item
		if (!hasInitialValue) {
			_iterate(this, returnValue, function (val, i) {
				reduced = val;
				initialValuePos = i;
			}, null, startPos + inc, inc);
			if (initialValuePos == startPos) {
				// no intial value and no items in array!
				throw new TypeError();
			}
		}
		else {
			// If initialValue provided, use it
			reduced = initialValue;
		}

		// Do the actual reduce
		_iterate(this, function (item, i, arr) {
			reduced = reduceFunc(reduced, item, i, arr);
		}, returnTruthy, null, initialValuePos + inc, inc);

		// we have a reduced value!
		return reduced;
	}

	function reduce (reduceFunc /*, initialValue */) {
		return _reduce.call(this, reduceFunc, 1, arguments[+1], arguments.length > 1);
	}

	function reduceRight (reduceFunc /*, initialValue */) {
		return _reduce.call(this, reduceFunc, -1, arguments[+1], arguments.length > 1);
	}

	methods.reduce = reduce;
	if (!has('array-reduce')) {
		missing.reduce = reduce;
	}

	methods.reduceRight = reduceRight;
	if (!has('array-reduceright')) {
		missing.reduceRight = reduceRight;
    }

	/***** finders *****/

	function find (arr, item, from, forward) {
		var len = Object(arr).length >>> 0, foundAt = -1;

		// convert to number, or default to start or end positions
		from = isNaN(from) ? (forward ? 0 : len - 1) : Number(from);
		// negative means it's an offset from the end position
		if (from < 0) {
			from = len + from - 1;
		}

		_iterate(arr, returnValue, function (val, i) {
			if (val === item) {
				foundAt = i;
			}
			return foundAt == -1;
		}, null, from, forward ? 1 : -1);

		return foundAt;
	}

	function indexOf (item) {
		// arguments[+1] is to fool google closure compiler into NOT adding a function argument!
		return find(this, item, arguments[+1], true);
	}

	function lastIndexOf (item) {
		// arguments[+1] is to fool google closure compiler into NOT adding a function argument!
		return find(this, item, arguments[+1], false);
	}

	methods.indexOf = indexOf;
	if (!has('array-indexof')) {
		missing.indexOf = indexOf;
	}

	methods.lastIndexOf = lastIndexOf;
	if (!has('array-lastindexof')) {
		missing.lastIndexOf = lastIndexOf;
	}

	exports.isArray = isArray;

	base.addWrappers(methods, proto, exports);

	// augment prototype if requested
	exports.polyfill = function () {
		if (!alreadyShimmed) {
			alreadyShimmed = true;
			base.addShims(missing, proto);
			if (!Array.isArray) {
				Array.isArray = isArray;
			}
		}
	};

});
