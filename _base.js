/**
 * poly common functions
 *
 * (c) copyright 2011-2012 Brian Cavalier and John Hann
 *
 * This module is part of the cujo.js family of libraries (http://cujojs.com/).
 *
 * Licensed under the MIT License at:
 * 		http://www.opensource.org/licenses/mit-license.php
 *
 */
define(function (require, exports, module) {

	var slice, toString;

	slice = [].slice;
	toString = ({}).toString;

	function createWrapper (method) {
		return function (refObj) {
			return method.apply(refObj, slice.call(arguments, 1));
		}
	}

	exports.addWrappers = function (methods, proto, wrapper) {
		// export wrappers for missing features
		for (var p in methods) {
			if (methods.hasOwnProperty(p)) {
				wrapper[p] = createWrapper(p in proto ? proto[p] : methods[p]);
			}
		}
	};

	exports.addShims = function (shims, refObj) {
		for (var p in shims) {
			if (shims.hasOwnProperty(p)) {
				refObj[p] = shims[p];
			}
		}
	};

	exports.isFunction = function (o) {
		return typeof o == 'function';
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
