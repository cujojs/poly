/**
 * JSON polyfill / shim
 *
 * (c) copyright 2011-2012 Brian Cavalier and John Hann
 *
 * poly is part of the cujo.js family of libraries (http://cujojs.com/)
 *
 * Licensed under the MIT License at:
 * 		http://www.opensource.org/licenses/mit-license.php
 *
 * TODO: document that this polyfill doesn't bake-in JSON automatically
 */
(function (global) {
define(['require'], function (require) {

	var JSON;

	function has () {
		return global.JSON;
	}

	if (!has('json')) {
		return {
			then: function (success, failure) {
				require(['js!./support/json/json2.js!exports=JSON'], success, failure);
			}
		};
	}
	else {
		return;
	}

});
}(this));
