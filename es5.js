/** @license MIT License (c) copyright 2013 original authors */
/**
 * ES5 polyfills / shims for AMD loaders
 *
 * @author Brian Cavalier
 * @author John Hann
 */
define(['./object', './string', './date', './array', './function', './json', './xhr'], function (object, string, date) {

	return {
		failIfShimmed: object.failIfShimmed,
		setWhitespaceChars: string.setWhitespaceChars,
		setIsoCompatTest: date.setIsoCompatTest
	};

});
