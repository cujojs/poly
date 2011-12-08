/**
 * poly common functions
 *
 * (c) copyright 2011, unscriptable.com / John Hann
 * Licensed under the MIT License at:
 * 		http://www.opensource.org/licenses/mit-license.php
 *
 */
define(function (require, exports, module) {

	var slice = [].slice;

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

});
