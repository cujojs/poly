/**
 * polyfill / shim plugin for AMD loaders
 *
 * (c) copyright 2011-2012 Brian Cavalier and John Hann
 *
 * poly is part of the cujo.js family of libraries (http://cujojs.com/)
 *
 * Licensed under the MIT License at:
 * 		http://www.opensource.org/licenses/mit-license.php
 *
 * @version 0.5
 */

define(['./all'], function (all) {

	var poly = {};

	Object.keys(all).forEach(function (p) {
		poly[p] = all[p];
	});

	poly.version = '0.5';

    return poly;

});
