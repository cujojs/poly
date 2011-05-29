/**
 * Object polyfill / shim
 *
 * (c) copyright 2011, unscriptable.com / John Hann
 * Licensed under the MIT License at:
 * 		http://www.opensource.org/licenses/mit-license.php
 *
 * The gaol of these shims is to emulate a JavaScript 1.8.5 environment as
 * much as possible.  While it's not feasible to fully shim the Object object,
 * we can try to maximize code compatibility with older js engines.
 *
 * Note: these shims cannot fix `for (var p in obj) {}`. Instead, use this:
 *     Object.keys(obj).forEach(function (p) {}); // shimmed Array
 * or
 *     array.forEach(Object.keys(obj), function (p) {}); // wrapped Array
 *
 * Also, these shims can't prevent writing to object properties.
 *
 * TODO: isExtensible and preventExtensions
 * TODO: devise shims for freeze, seal, etc.
 * TODO: resolve IE8's partial defineProperty impl (works for DOM nodes)
 *
 */
define(function (require, exports, module) {
	"use strict";

	var slice = [].slice,
		shims = {},
		refObj = Object,
		propRx = /^[^\-]*\-/;

	function has (feature) {
		var prop = feature.replace(propRx, '');
		return prop in refObj;
	}

	function F (props) {
		for (var p in props) {
			if (props.hasOwnProperty(p)) {
				this[p] = props[p];
			}
		}
	}

	function create (prototype, props) {
		F.prototype = prototype;
		return new F(props);
	}

	var getPrototypeOf = has('object-getPrototypeOf') ?
		function (object) {
			return object.__proto__;
		} :
		function (object) {
			return object.constructor.prototype;
		};

	function freeze (object) {
		// TODO: implement shim
		//object.__poly.extensible = false;
		//object.__poly.writable = false;
		return object;
	}

	function isFrozen (object) {
		// TODO: implement shim
		//return !object.__poly.extensible && !object.__poly.writable;
		return false;
	}

	function seal (object) {
		// TODO: implement shim
		//object.__poly.extensible = false;
		//object.__poly.configurable = false;
		return object;
	}

	function isSealed (object) {
		// TODO: implement shim
		//return !object.__poly.extensible && !object.__poly.configurable;
		return false;
	}

	function _getPropsArray (object, own) {
		var result = [];
		for (var p in object) {
			if (!own || object.hasOwnProperty(p)) {
				result.push(p);
			}
		}
		return result;
	}

	function keys (object) {
		return _getPropsArray(object, true);
	}

	function getOwnPropertyNames (object) {
		return _getPropsArray(object, false);
	}

	function defineProperty(object, name, descriptor) {
		// TODO: implement shim
		object[name] = descriptor && descriptor.value;
		return object;
	}

	function defineProperties(object, descriptors) {
		var i = 0,
			names = (Object.getOwnPropertyNames || getOwnPropertyNames)(descriptors);
		for (; i < names.length; i++) {
			defineProperty(object, names[i], descriptors[names[i]]);
		}
		return object;
	}

	function getOwnPropertyDescriptor (object, name) {
		return {
			value: object[name],
			enumerable: true,
			configurable: true,
			writable: true
		};
	}

	// check for missing features
	if (!has('object-create')) {
		shims.create = create;
	}
	if (!has('object-freeze')) {
		shims.freeze = freeze;
	}
	if (!has('object-isFrozen')) {
		shims.isFrozen = isFrozen;
	}
	if (!has('object-seal')) {
		shims.seal = seal;
	}
	if (!has('object-isSealed')) {
		shims.isSealed = isSealed();
	}
	if (!has('object-getPrototypeOf')) {
		shims.getPrototypeOf = getPrototypeOf;
	}
	if (!has('object-keys')) {
		shims.keys = keys;
	}
	if (!has('object-getOwnPropertyNames')) {
		shims.getOwnPropertyNames = getOwnPropertyNames;
	}
	if (!has('object-defineProperty')) {
		shims.defineProperty = defineProperty;
	}
	if (!has('object-defineProperties')) {
		shims.defineProperties = defineProperties;
	}
	if (!has('object-getOwnPropertyDescriptor')) {
		shims.getOwnPropertyDescriptor = getOwnPropertyDescriptor;
	}

	// export wrappers for missing features
	for (var p in shims) {
		if (shims.hasOwnProperty(p)) {
			exports[p] = function (func) {
				return shims[p].apply(func, slice.call(arguments, 1));
			}
		}
	}

	// export prototype augmentation function to be invoked by poly! plugin
	var polyfill = function () {
		for (var p in shims) {
			if (shims.hasOwnProperty(p)) {
				refObj[p] = shims[p];
			}
		}
		// reserve a place to put shim data
		//Object.prototype.__poly = {};
	};

	exports.polyfill = function () {
		polyfill();
		// don't ever run polyfill again even if it is called again
		polyfill = function () {};
	};

});
