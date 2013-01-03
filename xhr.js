/**
 * XHR polyfill / shims
 *
 * (c) copyright 2011-2012 Brian Cavalier and John Hann
 *
 * This module is part of the cujo.js family of libraries (http://cujojs.com/).
 *
 * Licensed under the MIT License at:
 * 		http://www.opensource.org/licenses/mit-license.php
 *
 */
define(function () {

	var progIds;

	// find XHR implementation
	if (typeof XMLHttpRequest == 'undefined') {
		// keep trying progIds until we find the correct one, then rewrite the
		// window.XMLHttpRequest function to always return that one.

		progIds = ['Msxml2.XMLHTTP', 'Microsoft.XMLHTTP', 'Msxml2.XMLHTTP.4.0'];

		assignCtor(function () { throw new Error("poly/xhr: XMLHttpRequest not available"); });

		while (progIds.length) (function (progId) {
			try {
				new ActiveXObject(progId);
				assignCtor(function () { return new ActiveXObject(progId); });
				break;
			}
			catch (ex) {}
		})(progIds.shift());
	}

	function assignCtor (ctor) {
		window.XMLHttpRequest = ctor;
	}

});
