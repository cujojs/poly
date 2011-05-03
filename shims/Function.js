/**
 * Function polyfill / shim
 *
 * (c) copyright 2011, unscriptable.com / John Hann
 * Licensed under the MIT License at:
 * 		http://www.opensource.org/licenses/mit-license.php
 *
 */
define(function (require, exports, module) {

	var slice = [].slice,
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

	// check for missing features
	if (!has('function-bind')) {
		shims.bind = bind;
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
	exports.polyfill = function () {
		for (var p in shims) {
			if (shims.hasOwnProperty(p)) {
				proto[p] = shims[p];
			}
		}
	};

});
