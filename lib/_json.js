/**
 * JSON polyfill / shim
 *
 * (c) copyright 2011-2012 Brian Cavalier and John Hann
 *
 * poly is part of the cujo.js family of libraries (http://cujojs.com/)
 *
 * Licensed under the MIT License at:
 * 		http://www.opensource.org/licenses/mit-license.php
 */
(function (global) {
define(['require', 'curl/_privileged'], function (require, priv) {

	var Promise, promise;

	Promise = priv['Promise'];
	promise = new Promise();

	function has (feature) {
		return global.JSON;
	}

	if (!has('json')) {
		require(['js!../support/json/json2.js!exports=JSON'], promise.resolve, promise.reject);
		return { promise: promise };
	}

});
}(this));
