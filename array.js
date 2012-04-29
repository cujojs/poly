/*
	Array -- a stand-alone module for using Javascript 1.6 array features
	in lame-o browsers that don't support Javascript 1.6

	(c) copyright 2011-2012 Brian Cavalier and John Hann

	This module is part of the cujo.js family of libraries (http://cujojs.com/).

	Licensed under the MIT License at:
		http://www.opensource.org/licenses/mit-license.php
*/
/*
	This module is under 1kB when compiled/gzipped and is compatible with
	has() pre-processors (<400 bytes when compiled for modern browsers).

	wrapper API:

	This module will wrap native methods to normalize array calls to
	be unified across js engines that support the array methods
	natively with those that don't:

	define(['poly/lib/shim/array'], function (array) {
		var items = [1, 2, 3];
		array.forEach(items, function (item) {
			console.log(item);
		};
	});

	forEach(array, lambda [, context]);
	every(array, lambda [, context]);
	some(array, lambda [, context]);
	filter(array, lambda [, context]);
	map(array, lambda [, context]);
	indexOf(arr, item [, fromIndex]);
	lastIndexOf(arr, item [, fromIndex]);
	reduce(arr, reduceFunc [, initialValue]);
	reduceRight(arr, reduceFunc [, initialValue]);
	isArray(object)

	polyfill API:

	You may also use this module to augment the Array.prototype of
	older js engines by loading it via the poly! plugin prefix:

	define(['poly!poly/lib/shim/array'], function () {
		var items = [1, 2, 3];
		items.forEach(function (item) {
			console.log(item);
		};
	});

	All of the wrapper API methods are shimmed and are reasonably close to
	the ES5 specification, but may vary slightly in unforeseen edge cases:

	var array = [1, 2, 3];

	array.forEach(lambda [, context]);
	array.every(lambda [, context]);
	array.some(lambda [, context]);
	array.filter(lambda [, context]);
	array.map(lambda [, context]);
	array.indexOf(item [, fromIndex]);
	array.lastIndexOf(item [, fromIndex]);
	array.reduce(reduceFunc [, initialValue]);
	array.reduceRight(reduceFunc [, initialValue]);
	Array.isArray(object)

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

	featureMap = {
		'array-foreach': 'forEach',
		'array-every': 'every',
		'array-some': 'some',
		'array-map': 'map',
		'array-filter': 'filter',
		'array-reduce': 'reduce',
		'array-reduceright': 'reduceRight',
		'array-indexof': 'indexOf',
		'array-lastindexof': 'lastIndexOf'
	};

	function isArray (o) {
		return toString.call(o) == '[object Array]';
	}

	function has (feature) {
		var prop = featureMap[feature];
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
			throw new TypeError('Invalid length or starting index');
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
	exports['polyfill'] = function () {
		if (!alreadyShimmed) {
			alreadyShimmed = true;
			base.addShims(missing, proto);
			if (!Array.isArray) {
				Array.isArray = isArray;
			}
		}
	};

    return exports;

});
