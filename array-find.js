// https://gist.github.com/rwldrn/5079436
// https://gist.github.com/rwldrn/5079427
define(['./lib/_base', './lib/_array'], function (base, array) {
"use strict";

	var proto = Array.prototype,
		featureMap,
		_findIndex;

	featureMap = {
		'array-find': 'find',
		'array-findIndex': 'findIndex'
	};

	function has (feature) {
		var prop = featureMap[feature];
		return base.isFunction(proto[prop]);
	}

	if (!has('array-findIndex') || !has('array-find')) {
		_findIndex = function _findIndex (lambda /*, thisArg */) {

			var foundAt = -1;

			array.iterate(this, function (val, i, arr) {
				if (lambda.call(this, val, i, arr)) {
					foundAt = i;
				}
				return foundAt == -1;
			// arguments[+1] is to fool google closure compiler into NOT adding a function argument!
			}, array.returnValue, arguments[+1]);
			return foundAt;
		}

		if (!has('array-findIndex')) {
			proto.findIndex = function findIndex (lambda) {
				// arguments[+1] is to fool google closure compiler into NOT adding a function argument!
				return _findIndex.call(this, lambda, arguments[+1]);
			};
		}

		if (!has('array-find')) {
			proto.find = function find (lambda) {
				// arguments[+1] is to fool google closure compiler into NOT adding a function argument!
				return this[_findIndex.call(this, lambda, arguments[+1])];
			}
		}
	}
});