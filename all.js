define(['./object', './string', './array', './function', './json', './xhr'], function (object, string) {

	return {
		failIfShimmed: object.failIfShimmed,
		setWhitespaceChars: string.setWhitespaceChars
	};

});
