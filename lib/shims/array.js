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

	var proto = Array.prototype,
		toString = {}.toString,
		slice = proto.slice,
		exports = {},
		methods,
		missing = [],
		each,
		propRx = /^[^\-]*\-/;

	methods = {
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

	function isFunction (o) {
		return typeof o == 'function';
	}

	function isArray (o) {
		return toString.call(o) == '[object Array]';
	}

	function has (feature) {
		var prop = methods[feature];
		return isFunction(proto[prop]);
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
				i = 0;

			if (arr == undef || !isFunction(lambda)) {
				throw new TypeError();
			}

			for (; i < len; ++i) {
				if (i in alo) {
					if (lambda.call(context, alo[i], i, alo) === false) {
						return false;
					}
				}
			}

			return true;
		};
	}

	if (!has('array-foreach')) {
		missing.forEach = function (lambda, context) {
			iterate(this, lambda, context);
		};
	}

	if (!has('array-every')) {
		missing.every = function (lambda, context) {
			return iterate(this, lambda, context);
		};
	}

	if (!has('array-some')) {
		missing.some = function (lambda, context) {
			return iterate(this, function (item, i, arr) { return !lambda.call(this, item, i, arr); }, context);
		};
	}

	/***** mutators *****/

	if(!has('array-map')) {
 		missing.map = function (lambda, context) {
			var arr, result;

			arr = this;
			result = new Array(arr.length);

			iterate(arr, function (item, i) {
				result[i] = lambda.call(context, item, i, arr);
				return true;
			});

			return result;
		};
	}

	if (!has('array-filter')) {
		missing.filter = function (lambda, context) {
			var arr, result, val;

			arr = this;
			result = [];

			iterate(arr, function (item, i) {
				// save a copy of the original value in case
				// the lambda function changed it
				val = arr[i];
				if (lambda.call(context, item, i, arr)) {
					arr.push(val);
				}
				return true;
			});

			return result;
		};
	}
	
	if (!has('array-reduce')) {
        // ES5 reduce
        // http://es5.github.com/#x15.4.4.21
		missing.reduce = function(reduceFunc /*, initialValue */) {
            // ES5 dictates that reduce.length === 1

            var arr, args, reduced, len, i;

            arr = Object(this);

			if(arr === undef || !isFunction(reduceFunc)) {
				throw new TypeError();
			}

            i = 0;
            len = arr.length >>> 0;
            args = arguments;

            // If no initialValue, use first item of array (we know length !== 0 here)
            // and adjust i to start at second item
            if(args.length <= 1) {
                // Skip to the first real element in the array
                for(;;) {
                    if(i in arr) {
                        reduced = arr[i++];
                        break;
                    }

                    // If we reached the end of the array without finding any real
                    // elements, it's a TypeError
                    if(++i >= len) {
                        throw new TypeError();
                    }
                }
            } else {
                // If initialValue provided, use it
                reduced = args[1];
            }

            // Do the actual reduce
            for(;i < len; ++i) {
                // Skip holes
                if(i in arr) reduced = reduceFunc(reduced, arr[i], i, arr);
            }

            return reduced;
        };
	}

    if (!has('array-reduceright')) {
        // ES5 reduceRight
        // http://es5.github.com/#x15.4.4.22
        missing.reduceRight = function (reduceFunc /*, initialValue */) {
            // ES5 dictates that reduceRight.length === 1

            // NOTE: reduceRight operates from right to left, so references below
            // to the "first" item mean the right-most item, second item means
            // second-to-right-most, etc.

            var arr, args, reduced, len, i;

            arr = Object(this);

            if (arr === undef || !isFunction(reduceFunc)) {
                throw new TypeError();
            }

            len = arr.length >>> 0;
            i = len - 1;
            args = arguments;

            // If no initialValue, use first item of array (we know length !== 0 here)
            // and adjust i to start at second item
            if (args.length <= 1) {
                // Skip to the first real element in the array
                for (;;) {
                    if (i in arr) {
                        reduced = arr[i--];
                        break;
                    }

                    // If we reached the beginning of the array without finding any real
                    // elements, it's a TypeError
                    if (--i < 0) {
                        throw new TypeError();
                    }
                }
            } else {
                // If initialValue provided, use it
                reduced = args[1];
            }

            // Do the actual reduce
            for (; i >= 0; --i) {
                // Skip holes
                if (i in arr) reduced = reduceFunc(reduced, arr[i], i, arr);
            }

            return reduced;
        };
    }

	/***** finders *****/

	var find;
	if (!has('array-indexof') || !has('array-lastindexof')) {
		find = function (item, from, forward) {

			var alo = Object(this),
				len = alo.length >>> 0,
				i;

			if (this == undef) {
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
		missing.indexOf = function (item, from) {
			return find(this, item, from, true);
		};
	}

	if (!has('array-lastindexof')) {
		missing.lastIndexOf = function (item, from) {
			return find(this, item, from, false);
		};
	}

	// add native and non-native methods to a wrapper
	function exportMethod (name) {
		if (name in missing) {
			exports[name] = function (obj, arg1, arg2) {
				return missing[name](obj, arg1, arg2);
			}
		}
		else {
			exports[name] = wrapNative(name);
		}
	}
	exports.isArray = isArray;

	// augment prototype if requested
	var polyfill;
	polyfill = function () {
        for(var method in missing) {
			proto[method] = missing[method];
        }
		if (!Array.isArray) {
			Array.isArray = isArray;
		}
	};

	exports.polyfill = function () {
		polyfill();
		// don't ever run polyfill again even if it is called again
		polyfill = function () {};
	};

    // FIXME: methods are not exported? i.e. exportMethod is never called?
    // It seems odd to only export methods that are missing from Array.prototype
    // when this shim is used as a module rather than a polyfill.  Seems like
    // all methods should be exported so that the API is consistent.
    //
    // Maybe the pattern should be:
    // missing.featureMethod = function(...) {...}
    // if(!has(feature)) { exports.featureMethod = missing.featureMethod; }

	define(exports);

}(this, define));
