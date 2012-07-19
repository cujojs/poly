define(['./object', './string', './array', './function', './json', './xhr'], function (object, string) {

	// set unshimmable Object methods to be forgiving:
	object.failIfShimmed(false);
	// set simple whitepsace chars
	string.setWhitespaceChars('\\s');

	return {
		failIfShimmed: object.failIfShimmed,
		setWhitespaceChars: string.setWhitespaceChars
	};

});
