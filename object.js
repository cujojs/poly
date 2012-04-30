/**
 * Object polyfill / shims
 *
 * (c) copyright 2011-2012 Brian Cavalier and John Hann
 *
 * This module is part of the cujo.js family of libraries (http://cujojs.com/).
 *
 * Licensed under the MIT License at:
 * 		http://www.opensource.org/licenses/mit-license.php
 */
/**
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
 * TODO: devise workable shims? for freeze, seal, etc.
 * TODO: resolve IE8's partial defineProperty impl? (works for DOM nodes)
 *
 */
define(['./_base', 'exports'], function (base, exports) {
"use strict";

	var alreadyShimmed = false,
		methods = {},
		missing = {},
		refObj = Object,
		getPrototypeOf,
		featureMap,
		squelchUnimplemented,
		shouldSquelch;

	getPrototypeOf = typeof {}.__proto__ == 'object'
		? function (object) { return object.__proto__; }
		: function (object) { return object.constructor.prototype; };

	featureMap = {
		'object-create': { prop: 'create', impl: create },
		'object-freeze': { prop: 'freeze', impl: freeze },
		'object-isfrozen': { prop: 'isFrozen', impl: isFrozen },
		'object-seal': { prop: 'seal', impl: seal },
		'object-issealed': { prop: 'isSealed', impl: isSealed },
		'object-getprototypeof': { prop: 'getPrototypeOf', impl: getPrototypeOf },
		'object-keys': { prop: 'keys', impl: keys },
		'object-getownpropertynames': { prop: 'getOwnPropertyNames', impl: getOwnPropertyNames },
		'object-defineproperty': { prop: 'defineProperty', impl: defineProperty },
		'object-defineproperties': { prop: 'defineProperties', impl: defineProperties },
		'object-isextensible': { prop: 'isExtensible', impl: isExtensible },
		'object-preventextensions': { prop: 'preventExtensions', impl: preventExtensions },
		'object-getownpropertydescriptor': { prop: 'getOwnPropertyDescriptor', impl: getOwnPropertyDescriptor }
	};

	squelchUnimplemented = /freeze|isfrozen|seal|issealed|getprototypeof|keys/;

	shouldSquelch = RegexpShouldSquelch;

	function RegexpShouldSquelch (feature) {
		return squelchUnimplemented.test(feature);
	}

	function createSquelcher (feature) {
		return function () {
			throw new Error('poly/object: ' + feature + ' not supported.');
		}
	}

	function has (feature) {
		var prop = featureMap[feature];
		return prop in refObj;
	}

	function PolyBase () {}

	function create (prototype, props) {
		var obj;
		if (arguments.length > 1) createSquelcher('object-create')();
		PolyBase.prototype = prototype;
		obj = new PolyBase(props);
		PolyBase.prototype = null;
		return obj;
	}

	function freeze (object) {
		return object;
	}

	function isFrozen (object) {
		return false;
	}

	function seal (object) {
		return object;
	}

	function isSealed (object) {
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
		return _getPropsArray(object, true);
	}

	function defineProperty(object, name, descriptor) {
		object[name] = descriptor && descriptor.value;
		return object;
	}

	function defineProperties(object, descriptors) {
		var i = 0,
			names = keys(descriptors);
		for (; i < names.length; i++) {
			defineProperty(object, names[i], descriptors[names[i]]);
		}
		return object;
	}

	function isExtensible (object) {
		return false;
	}

	function preventExtensions (object) {
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

	function createShims (squelched) {

		// first convert squelched to a function
		if (typeof squelched == 'string' || squelched instanceof String) {
			squelched = new RegExp(squelched);
		}
		if (squelched instanceof RegExp) {
			squelchUnimplemented = squelched;
			shouldSquelch = RegexpShouldSquelch;
		}
		else if (typeof squelched == 'function') {
			shouldSquelch = squelched;
		}

		// create shims for missing features
		for (var feature in featureMap) {
			var def = featureMap[feature];
			methods[def.prop] = shouldSquelch(feature) ? createSquelcher(feature) : def.impl;
			if (missing[def.prop]) {
				missing[def.prop] = methods[def.prop];
			}
		}

	}

	// don't attempt to meta-program the following since has
	// processors need them to be explicit
	if (!has('object-create')) {
		missing.create = methods.create;
	}
	if (!has('object-freeze')) {
		missing.freeze = methods.freeze;
	}
	if (!has('object-isfrozen')) {
		missing.isFrozen = methods.isFrozen;
	}
	if (!has('object-seal')) {
		missing.seal = methods.seal;
	}
	if (!has('object-issealed')) {
		missing.isSealed = methods.isSealed;
	}
	if (!has('object-getprototypeof')) {
		missing.getPrototypeOf = methods.getPrototypeOf;
	}
	if (!has('object-keys')) {
		missing.keys = methods.keys;
	}
	if (!has('object-getownpropertynames')) {
		missing.getOwnPropertyNames = methods.getOwnPropertyNames;
	}
	if (!has('object-defineproperty')) {
		missing.defineProperty = methods.defineProperty;
	}
	if (!has('object-defineproperties')) {
		missing.defineProperties = methods.defineProperties;
	}
	if (!has('object-getownpropertydescriptor')) {
		missing.getOwnPropertyDescriptor = methods.getOwnPropertyDescriptor;
	}

	createShims();

	base.addWrappers(methods, Object, exports);

	exports['polyfill'] = function (config) {
		if (config.squelchUnimplemented) createShims(config.squelchUnimplemented);
		if (!alreadyShimmed) {
			alreadyShimmed = true;
			base.addShims(missing, refObj);
		}
	};

});

/*
var O = Object;
function P (value) {
    return O.call(this, value);
}
Object = P;

new Object(5);

	*/