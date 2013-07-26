/** @license MIT License (c) copyright 2013 original authors */
/**
 * poly common array functions
 *
 * @author Jared Cacurak
 * @author Brian Cavalier
 * @author John Hann
 */
define(['./_base'], function (base) {

	var toString = base.toString,
		toObject = base.createCaster(Object, 'Array'),
		isFunction = base.isFunction,
		undef;

	return {
		returnValue: returnValue,
		iterate: iterate,
		toArrayLike: toArrayLike
	};

	function toArrayLike (o) {
		return (base.toString(o) == '[object String]')
			? o.split('')
			: toObject(o);
	}

	function returnValue (val) {
		return val;
	}

	function iterate (arr, lambda, continueFunc, context, start, inc) {

		var alo, len, i, end;

		alo = toArrayLike(arr);
		len = alo.length >>> 0;

		if (start === undef) start = 0;
		if (!inc) inc = 1;
		end = inc < 0 ? -1 : len;

		if (!isFunction(lambda)) {
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
	};

});
