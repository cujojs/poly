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
define (['./_base', 'exports'], function (base, exports) {
	"use strict";

	var alreadyShimmed = false,
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

	base.addWrappers(shims, exports);

	exports.polyfill = function () {
		if (!alreadyShimmed) {
			base.addShims(shims, proto);
			alreadyShimmed = true;
		}
	};

});
