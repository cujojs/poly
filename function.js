/**
 * Function polyfill / shims
 *
 * (c) copyright 2011-2012 Brian Cavalier and John Hann
 *
 * This module is part of the cujo.js family of libraries (http://cujojs.com/).
 *
 * Licensed under the MIT License at:
 * 		http://www.opensource.org/licenses/mit-license.php
 */
/**
 * 	TODO: push?
 *
 */
define (['./_base', 'exports'], function (base, exports) {
	"use strict";

	var alreadyShimmed = false,
		slice = [].slice,
		missing = {},
		proto = Function.prototype,
		featureMap;

	featureMap = {
		'bind': 'bind'
	};

	function has (feature) {
		var prop = featureMap[feature];
		return base.isFunction(proto[prop]);
	}

	// adapted from Mozilla Developer Network example at
	// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind
	function bind (obj) {
		var args = slice.call(arguments, 1),
			self = this,
			nop = function () {},
			bound = function () {
			  return self.apply(this instanceof nop ? this : (obj || {}), args.concat(slice.call(arguments)));
			};
		nop.prototype = this.prototype;
		bound.prototype = new nop();
		return bound;
	}

	// check for missing features
	if (!has('function-bind')) {
		missing.bind = bind;
		exports.bind = function (func) {
			return bind.apply(func, slice.call(arguments, 1));
		};
	}
	else {
		exports.bind = function (func) {
			return func.bind.apply(func, slice.call(arguments, 1));
		};
	}

	exports['polyfill'] = function () {
		if (!alreadyShimmed) {
			base.addShims(missing, proto);
			alreadyShimmed = true;
		}
	};

});
