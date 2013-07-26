/** @license MIT License (c) copyright 2013 original authors */
/**
 * poly common functions
 *
 * @author Brian Cavalier
 * @author John Hann
 */
define(function (require, exports, module) {

	var toString;

	toString = ({}).toString;

	exports.isFunction = function (o) {
		return typeof o == 'function';
	};

	exports.isString = function (o) {
		return toString.call(o) == '[object String]';
	};

	exports.isArray = function (o) {
		return toString.call(o) == '[object Array]';
	};

	exports.toString = function (o) {
		return toString.apply(o);
	};

	exports.createCaster = function (caster, name) {
		return function cast (o) {
			if (o == null) throw new TypeError(name + ' method called on null or undefined');
			return caster(o);
		}
	}

});
