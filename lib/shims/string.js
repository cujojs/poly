/**
 * String polyfill / shims
 *
 * (c) copyright 2011, unscriptable.com / John Hann
 * Licensed under the MIT License at:
 * 		http://www.opensource.org/licenses/mit-license.php
 *
 * 	TODO: trim, trimLeft, trimRight
 *
 */
define (function (require, exports, module) {
	"use strict";

	var slice = [].slice,
		shims = {},
		proto = String.prototype,
		propRx = /^[^\-]*\-/;

	function has (feature) {
		var prop = feature.replace(propRx, '');
		return prop in proto;
	}

	var trimLeftRx = /\w+$/,
		trimRightRx = /^\w+/;

	function trim () {
		return this.trimLeft().trimRight();
	}

	function trimLeft () {
		return this.replace(trimLeftRx, '');
	}

	function trimRight () {
		return this.replace(trimRightRx, '');
	}

	if (!has('string-trim')) {
		shims.trim = trim;
	}
	if (!has('string-trimLeft')) {
		shims.trimLeft = trimLeft;
	}
	if (!has('string-trimRight')) {
		shims.trimRight = trimRight;
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
				proto[p] = shims[p];
			}
		}
	};

	exports.polyfill = function () {
		polyfill();
		// don't ever run polyfill again even if it is called again
		polyfill = function () {};
	};

});
