/**
 * String polyfill / shims
 *
 * (c) copyright 2011-2012 Brian Cavalier and John Hann
 *
 * This module is part of the cujo.js family of libraries (http://cujojs.com/).
 *
 * Licensed under the MIT License at:
 * 		http://www.opensource.org/licenses/mit-license.php
 *
 *
 * Adds str.trim(), str.trimRight(), and str.trimLeft()
 *
 * Note: we don't bother trimming all ES5 white-space characters
 * by default since we'd have to shim _all browsers_ because (even as of
 * April 2012) almost all of them don't trim all whitespace characters.
 *
 * For strict ES5 compliance in all browsers, set the AMD loader config option,
 * `strictWhitespace`, to a truthy value.  Note: this option only works
 * if you use poly to shim the String prototype, not if you use poly/string
 * as a wrapper object.
 *
 */
define (['./_base', 'exports'], function (base, exports) {
	"use strict";

	var alreadyShimmed = false,
		methods = {},
		missing = {},
		proto = String.prototype,
		featureMap,
		toString;

	featureMap = {
		'string-trim': 'trim',
		'string-trimleft': 'trimLeft',
		'string-trimright': 'trimRight'
	};

	function has (feature) {
		var prop = featureMap[feature];
		return base.isFunction(proto[prop]);
	}

	// compressibility helper
	function remove (str, rx) {
		return str.replace(rx, '');
	}

	toString = base.createCaster(String, 'String');

	var whitespaceChars, trimRightRx, trimLeftRx;

	trimRightRx = /\s+$/;
	trimLeftRx = /^\s+/;

	function trim () {
		return remove(remove(toString(this), trimLeftRx), trimRightRx);
	}

	function trimLeft () {
		return remove(toString(this), trimLeftRx);
	}

	function trimRight () {
		return remove(toString(this), trimRightRx);
	}

	methods.trim = trim;
	if (!has('string-trim')) {
		missing.trim = trim;
	}
	methods.trimLeft = trimLeft;
	if (!has('string-trimleft')) {
		missing.trimLeft = trimLeft;
	}
	methods.trimRight = trimRight;
	if (!has('string-trimright')) {
		missing.trimRight = trimRight;
	}

	base.addWrappers(methods, proto, exports);

	exports['polyfill'] = function (config) {
		if (!alreadyShimmed) {
			if (config.strictWhitespace) {
				// from http://perfectionkills.com/whitespace-deviations/
				whitespaceChars = '[\x09-\x0D\x20\xA0\u1680\u180E\u2000-\u200A\u202F\u205F\u3000\u2028\u2029]';
				trimRightRx = new RegExp(whitespaceChars + '+$');
				trimLeftRx = new RegExp('^' + whitespaceChars + '+');
			}
			// add all shims if strictWhitespace is specified
			base.addShims(config.strictWhitespace ? methods : missing, proto);
			alreadyShimmed = true;
		}
	};

});
