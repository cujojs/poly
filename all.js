/** @license MIT License (c) copyright 2013 original authors */
/**
 * polyfill / shim plugin for AMD loaders
 *
 * @author Brian Cavalier
 * @author John Hann
 */

define(['./object', './string', './date', './array', './function', './json', './xhr', './setImmediate', './array-es6'], function (object, string, date) {

	return {
		failIfShimmed: object.failIfShimmed,
		setWhitespaceChars: string.setWhitespaceChars,
		setIsoCompatTest: date.setIsoCompatTest
	};

});
