/** @license MIT License (c) copyright 2013 original authors */
/**
 * Array -- a stand-alone module for using ES6 array features.
 *
 * @author Jared Cacurak
 * @author Brian Cavalier
 * @author John Hann
 *
 * Huge thanks to Rick Waldron:
 * https://gist.github.com/rwldrn/5079436
 * https://gist.github.com/rwldrn/5079427
 * https://gist.github.com/rwldrn/1074126
 */
define(['./lib/_base', './lib/_array'], function (base, array) {
"use strict";

	var ctor = Array,
		proto = ctor.prototype,
		slice = proto.slice,
		protoFeatureMap,
		ctorFeatureMap,
		_findIndex;

	protoFeatureMap = {
		'array-find': 'find',
		'array-findIndex': 'findIndex'
	};

	ctorFeatureMap = {
		'array-from': 'from',
		'array-of': 'of'
	};

	function has (feature) {
		var prop = protoFeatureMap[feature];
		if (prop) {
			return base.isFunction(proto[prop]);
		}
		prop = ctorFeatureMap[feature];
		return base.isFunction(ctor[prop]);
	}

	if (!has('array-from')) {
		Array.from = function (o) { return slice.call(o); }
	}

	if (!has('array-of')) {
		Array.of = function () { return slice.call(arguments); }
	}

	if (!has('array-findIndex') || !has('array-find')) {
		_findIndex = function findIndexImpl (lambda /*, thisArg */) {

			var foundAt = -1;

			array.iterate(this, function (val, i, arr) {
				if (lambda.call(this, val, i, arr)) {
					foundAt = i;
				}
				return foundAt == -1;
			// arguments[+1] is to fool google closure compiler into NOT adding a function argument!
			}, array.returnValue, arguments[+1]);
			return foundAt;
		};

		if (!has('array-findIndex')) {
			proto.findIndex = function findIndex (lambda) {
				// arguments[+1] is to fool google closure compiler into NOT adding a function argument!
				return _findIndex.call(this, lambda, arguments[+1]);
			};
		}

		if (!has('array-find')) {
			proto.find = function find (lambda) {
				// arguments[+1] is to fool google closure compiler into NOT adding a function argument!
				return this[_findIndex.call(this, lambda, arguments[+1])];
			}
		}
	}
});
