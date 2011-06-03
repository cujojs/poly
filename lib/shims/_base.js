/**
 * shime common functions
 *
 * (c) copyright 2011, unscriptable.com / John Hann
 * Licensed under the MIT License at:
 * 		http://www.opensource.org/licenses/mit-license.php
 *
 */
define(function (require, exports, module) {

	var slice = [].slice;

	exports.addWrappers = function (shims, wrapper) {
		// export wrappers for missing features
		for (var p in shims) {
			if (shims.hasOwnProperty(p)) {
				wrapper[p] = function (func) {
					return shims[p].apply(func, slice.call(arguments, 1));
				}
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

});
