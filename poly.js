/** @license MIT License (c) copyright 2013 original authors */
/**
 * polyfill / shim for AMD loaders
 *
 * @author Brian Cavalier
 * @author John Hann
 */

define(['./all'], function (all) {

	var poly = {};

	// copy all
	for (var p in all) poly[p] = all[p];

	poly.version = '0.5.2';

	return poly;

});
