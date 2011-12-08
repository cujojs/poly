/**
 * Object polyfill / shims
 *
 * (c) copyright Brian Cavalier and John Hann
 *
 * This module is part of the cujo.js family of libraries (http://cujojs.com/).
 *
 * Licensed under the MIT License at:
 * 		http://www.opensource.org/licenses/mit-license.php
 *
 * The goal of these shims is to emulate a JavaScript 1.8.5 environment as
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
define(['./_base', 'exports'], function (base, exports) {
	"use strict";

	var alreadyShimmed = false,
		methods = {},
		missing = {},
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

	var getPrototypeOf = {}.__proto__ ?
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
	methods.create = create;
	if (!has('object-create')) {
		missing.create = create;
	}
	methods.freeze = freeze;
	if (!has('object-freeze')) {
		missing.freeze = freeze;
	}
	methods.isFrozen = isFrozen;
	if (!has('object-isFrozen')) {
		missing.isFrozen = isFrozen;
	}
	methods.seal = seal;
	if (!has('object-seal')) {
		missing.seal = seal;
	}
	methods.isSealed = isSealed;
	if (!has('object-isSealed')) {
		missing.isSealed = isSealed;
	}
	methods.getPrototypeOf = getPrototypeOf;
	if (!has('object-getPrototypeOf')) {
		missing.getPrototypeOf = getPrototypeOf;
	}
	methods.keys = keys;
	if (!has('object-keys')) {
		missing.keys = keys;
	}
	methods.getOwnPropertyNames = getOwnPropertyNames;
	if (!has('object-getOwnPropertyNames')) {
		missing.getOwnPropertyNames = getOwnPropertyNames;
	}
	methods.defineProperty = defineProperty;
	if (!has('object-defineProperty')) {
		missing.defineProperty = defineProperty;
	}
	methods.defineProperties = defineProperties;
	if (!has('object-defineProperties')) {
		missing.defineProperties = defineProperties;
	}
	methods.getOwnPropertyDescriptor = getOwnPropertyDescriptor;
	if (!has('object-getOwnPropertyDescriptor')) {
		missing.getOwnPropertyDescriptor = getOwnPropertyDescriptor;
	}

	base.addWrappers(methods, Object, exports);

	exports['polyfill'] = function () {
		if (!alreadyShimmed) {
			alreadyShimmed = true;
			base.addShims(missing, refObj);
		}
	};

});
