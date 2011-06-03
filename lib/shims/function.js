/**
 * Function polyfill / shims
 *
 * (c) copyright 2011, unscriptable.com / John Hann
 * Licensed under the MIT License at:
 * 		http://www.opensource.org/licenses/mit-license.php
 *
 * 	TODO: push?
 *
 */
define (['./_base', 'exports'], function (base, exports) {
	"use strict";

	var alreadyShimmed = false,
		slice = [].slice,
		shims = {},
		proto = Function.prototype,
		propRx = /^[^\-]*\-/;

	function has (feature) {
		var prop = feature.replace(propRx, '');
		return prop in proto;
	}

	// adapted from Mozilla Developer Network example at
	// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind
	function bind (obj) {
		var args = slice.call(arguments, 1),
			self = this,
			nop = function () {},
			bound = function () {
			  return self.apply( this instanceof nop ? this : ( obj || {} ),
								  args.concat( slice.call(arguments) ) );
			};

		nop.prototype = this.prototype;

		bound.prototype = new nop();

		return bound;
	}

	function isGenerator () {
		return false;
	}

	// check for missing features
	if (!has('function-bind')) {
		shims.bind = bind;
	}
	if (!has('function-isGenerator')) {
		shims.isGenerator = isGenerator;
	}

	base.addWrappers(shims, exports);

	exports.polyfill = function () {
		if (!alreadyShimmed) {
			base.addShims(shims, proto);
			alreadyShimmed = true;
		}
	};

});
