define(['./object', './string', './array', './function', './json', './xhr'], function (object, string) {

	var failTestRx;

	failTestRx = /^define|^prevent|descriptor$/i;

	function regexpShouldThrow (feature) {
		return failTestRx.test(feature);
	}

	// set unshimmable Object methods to be forgiving:
	object.failIfShimmed(regexpShouldThrow);
	string.setWhitespaceChars('\\s');

	return {
		failIfShimmed: object.failIfShimmed,
		setWhitespaceChars: string.setWhitespaceChars
	};

});
