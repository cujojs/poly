/**
 * DOM event polyfill / shim
 *
 * (c) copyright 2011-2012 Brian Cavalier and John Hann
 *
 * poly is part of the cujo.js family of libraries (http://cujojs.com/)
 *
 * Licensed under the MIT License at:
 * 		http://www.opensource.org/licenses/mit-license.php
 *
 * TODO: create more dom-ish shims in a different module
 * see:
 * http://msdn.microsoft.com/en-us/library/dd282900(VS.85).aspx
 * 		getElementsByClassName
 * 		getAttribute / setAttribute
 * 	and see http://www.quirksmode.org/dom/w3c_core.html:
 * 		children[] (incorrectly includes comment nodes)
 * 		childElementCount
 * 		firstChildElement
 * 		lastChildElement
 * 		nextElementSibling
 * 		prevElementSibling
 * 		textContent
 * 		compareDocumentPosition()
 * 	not as interesting:
 * 		wholeText
 * 		createHTMLDocument()
 * 		defaultView
 * 		createDocument()
 * 	these are buggy in IE9 too:
 * 		getElementsByName()
 * 		clearAttributes()
 */
define(['./lib/_base'], function (base) {
	var featureMap, proto, proto2, buttonMap;

	featureMap = {
		'dom-addeventlistener': 'addEventListener'
	};

	proto = typeof Element != 'undefined' ? Element.prototype : {};
	proto2 = typeof HTMLDocument != 'undefined' ? HTMLDocument.prototype : {};

	if (!has('dom-addeventlistener')) {
		proto.addEventListener = addEventListener;
		proto.removeEventListener = removeEventListener;
		proto2.addEventListener = addEventListener;
		proto2.removeEventListener = removeEventListener;
	}

	buttonMap = { 1: 0, 2: 2, 4: 1 };

	function has (feature) {
		var prop = featureMap[feature];
		return base.isFunction(proto[prop]);
	}

	/**
	 * @private
	 * @param type {String}
	 * @param listener {Function}
	 * @param useCapture {Boolean}
	 * TODO: fix IE8 event object property mismatches
	 * 	metaKey
	 * 	relatedTarget (?)
	 * 	stopImmediatePropagation()
	 * 	getModifierState() (also not in IE9)
	 * TODO: fix IE8 event type mismatches
	 * 	change (radios and checkboxes)
	 * 	wheel
	 * TODO: fix bubbling differences in IE8?
	 */
	function addEventListener (type, listener, useCapture) {
		var id = '_poly_' + type, node = this;

		if (useCapture) throw new Error('capture phase not supported.');
		// only add first time, discard duplicates
		if (listener[id]) return;

		// create event fixer and save as a unique turd on the listener
		listener[id] = function fixEvent () {
			var e = window.event;

			// fix targets and other props
			e.target = e.srcElement;
			e.currentTarget = node;
			e.eventPhase = node == e.target ? 2 : 3;
			e.key = e.keyCode;
			if (type == 'keypress') e.char = e.charCode = e.keyCode;
			e.buttons = e.button;
			if ('button' in e) e.button = buttonMap[e.button];
			e.relatedTarget = e.fromElement;
			// fix DOM level 2 event functions
			e.stopPropagation = function () { e.cancelBubble = true; };
			e.preventDefault = function () {e.defaultPrevented = !(e.returnValue = false); };

			// call listener with target element in context (not window)
			return listener.call(e.target, e);
		};
		return this.attachEvent('on' + type, fixEvent);
	}

	/**
	 * @private
	 * @param type {String}
	 * @param listener {Function}
	 * @param useCapture {Boolean}
	 */
	function removeEventListener (type, listener, useCapture) {
		var id = '_poly_' + type, fixEvent = listener[id];

		// remove turd
		delete listener[id];

		// detach event
		return this.detachEvent('on' + type, fixEvent);
	}

	return {};
});
