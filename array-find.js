// https://gist.github.com/rwldrn/5079436
// https://gist.github.com/rwldrn/5079427
define(['./lib/_base'], function (base) {
"use strict";

	var proto = Array.prototype,
		toString = {}.toString,
		featureMap,
		toObject,
		_findIndex,
		undef;

	featureMap = {
		'array-find': 'find',
		'array-findIndex': 'findIndex'
	};

	toObject = base.createCaster(Object, 'Array');

	function has (feature) {
		var prop = featureMap[feature];
		return base.isFunction(proto[prop]);
	}

	function returnValue (val) {
		return val;
	}

	function toArrayLike (o) {
		return (base.toString(o) == '[object String]')
			? o.split('')
			: toObject(o);
	}

	function _iterate (arr, lambda, continueFunc, context, start, inc) {

		var alo, len, i, end;

		alo = toArrayLike(arr);
		len = alo.length >>> 0;

		if (start === undef) start = 0;
		if (!inc) inc = 1;
		end = inc < 0 ? -1 : len;

		if (!base.isFunction(lambda)) {
			throw new TypeError(lambda + ' is not a function');
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

	if (!has('array-findIndex') || !has('array-find')) {
		_findIndex = function _findIndex (lambda /*, thisArg */) {

			var foundAt = -1;

			_iterate(this, function (val, i, arr) {
				if (lambda.call(this, val, i, arr)) {
					foundAt = i;
				}
				return foundAt == -1;
			}, returnValue, arguments[1]);
			return foundAt;
		}

		if (!has('array-findIndex')) {
			proto.findIndex = function findIndex (lambda) {
				return _findIndex.call(this, lambda, arguments[1]);
			};
		}

		if (!has('array-find')) {
			proto.find = function find (lambda) {
				return this[_findIndex.call(this, lambda, arguments[1])];
			}
		}
	}
});