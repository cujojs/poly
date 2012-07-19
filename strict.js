define(['./all'], function (all) {

	var failTestRx;

	failTestRx = /^define|^prevent|descriptor$/i;

	function regexpShouldThrow (feature) {
		return failTestRx.test(feature);
	}

	// set unshimmable Object methods to be somewhat strict:
	all.failIfShimmed(regexpShouldThrow);
	// set strict whitespace
	all.setWhitespaceChars('\\s');

	return all;

});
