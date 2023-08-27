import { $el } from "../../../../scripts/ui.js";
import { addStylesheet } from "./utils.js";

addStylesheet(import.meta.url);

/*
    https://github.com/component/textarea-caret-position
    The MIT License (MIT)

    Copyright (c) 2015 Jonathan Ong me@jongleberry.com

    Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
const getCaretCoordinates = (function () {
	// We'll copy the properties below into the mirror div.
	// Note that some browsers, such as Firefox, do not concatenate properties
	// into their shorthand (e.g. padding-top, padding-bottom etc. -> padding),
	// so we have to list every single property explicitly.
	var properties = [
		"direction", // RTL support
		"boxSizing",
		"width", // on Chrome and IE, exclude the scrollbar, so the mirror div wraps exactly as the textarea does
		"height",
		"overflowX",
		"overflowY", // copy the scrollbar for IE

		"borderTopWidth",
		"borderRightWidth",
		"borderBottomWidth",
		"borderLeftWidth",
		"borderStyle",

		"paddingTop",
		"paddingRight",
		"paddingBottom",
		"paddingLeft",

		// https://developer.mozilla.org/en-US/docs/Web/CSS/font
		"fontStyle",
		"fontVariant",
		"fontWeight",
		"fontStretch",
		"fontSize",
		"fontSizeAdjust",
		"lineHeight",
		"fontFamily",

		"textAlign",
		"textTransform",
		"textIndent",
		"textDecoration", // might not make a difference, but better be safe

		"letterSpacing",
		"wordSpacing",

		"tabSize",
		"MozTabSize",
	];

	var isBrowser = typeof window !== "undefined";
	var isFirefox = isBrowser && window.mozInnerScreenX != null;

	return function getCaretCoordinates(element, position, options) {
		if (!isBrowser) {
			throw new Error("textarea-caret-position#getCaretCoordinates should only be called in a browser");
		}

		var debug = (options && options.debug) || false;
		if (debug) {
			var el = document.querySelector("#input-textarea-caret-position-mirror-div");
			if (el) el.parentNode.removeChild(el);
		}

		// The mirror div will replicate the textarea's style
		var div = document.createElement("div");
		div.id = "input-textarea-caret-position-mirror-div";
		document.body.appendChild(div);

		var style = div.style;
		var computed = window.getComputedStyle ? window.getComputedStyle(element) : element.currentStyle; // currentStyle for IE < 9
		var isInput = element.nodeName === "INPUT";

		// Default textarea styles
		style.whiteSpace = "pre-wrap";
		if (!isInput) style.wordWrap = "break-word"; // only for textarea-s

		// Position off-screen
		style.position = "absolute"; // required to return coordinates properly
		if (!debug) style.visibility = "hidden"; // not 'display: none' because we want rendering

		// Transfer the element's properties to the div
		properties.forEach(function (prop) {
			if (isInput && prop === "lineHeight") {
				// Special case for <input>s because text is rendered centered and line height may be != height
				if (computed.boxSizing === "border-box") {
					var height = parseInt(computed.height);
					var outerHeight =
						parseInt(computed.paddingTop) +
						parseInt(computed.paddingBottom) +
						parseInt(computed.borderTopWidth) +
						parseInt(computed.borderBottomWidth);
					var targetHeight = outerHeight + parseInt(computed.lineHeight);
					if (height > targetHeight) {
						style.lineHeight = height - outerHeight + "px";
					} else if (height === targetHeight) {
						style.lineHeight = computed.lineHeight;
					} else {
						style.lineHeight = 0;
					}
				} else {
					style.lineHeight = computed.height;
				}
			} else {
				style[prop] = computed[prop];
			}
		});

		if (isFirefox) {
			// Firefox lies about the overflow property for textareas: https://bugzilla.mozilla.org/show_bug.cgi?id=984275
			if (element.scrollHeight > parseInt(computed.height)) style.overflowY = "scroll";
		} else {
			style.overflow = "hidden"; // for Chrome to not render a scrollbar; IE keeps overflowY = 'scroll'
		}

		div.textContent = element.value.substring(0, position);
		// The second special handling for input type="text" vs textarea:
		// spaces need to be replaced with non-breaking spaces - http://stackoverflow.com/a/13402035/1269037
		if (isInput) div.textContent = div.textContent.replace(/\s/g, "\u00a0");

		var span = document.createElement("span");
		// Wrapping must be replicated *exactly*, including when a long word gets
		// onto the next line, with whitespace at the end of the line before (#7).
		// The  *only* reliable way to do that is to copy the *entire* rest of the
		// textarea's content into the <span> created at the caret position.
		// For inputs, just '.' would be enough, but no need to bother.
		span.textContent = element.value.substring(position) || "."; // || because a completely empty faux span doesn't render at all
		div.appendChild(span);

		var coordinates = {
			top: span.offsetTop + parseInt(computed["borderTopWidth"]),
			left: span.offsetLeft + parseInt(computed["borderLeftWidth"]),
			height: parseInt(computed["lineHeight"]),
		};

		if (debug) {
			span.style.backgroundColor = "#aaa";
		} else {
			document.body.removeChild(div);
		}

		return coordinates;
	};
})();

/*
    Key functions from:
    https://github.com/yuku/textcomplete
    © Yuku Takahashi - This software is licensed under the MIT license.

    The MIT License (MIT)

    Copyright (c) 2015 Jonathan Ong me@jongleberry.com

    Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
const CHAR_CODE_ZERO = "0".charCodeAt(0);
const CHAR_CODE_NINE = "9".charCodeAt(0);

class TextAreaCaretHelper {
	constructor(el) {
		this.el = el;
	}

	#calculateElementOffset() {
		const rect = this.el.getBoundingClientRect();
		const owner = this.el.ownerDocument;
		if (owner == null) {
			throw new Error("Given element does not belong to document");
		}
		const { defaultView, documentElement } = owner;
		if (defaultView == null) {
			throw new Error("Given element does not belong to window");
		}
		const offset = {
			top: rect.top + defaultView.pageYOffset,
			left: rect.left + defaultView.pageXOffset,
		};
		if (documentElement) {
			offset.top -= documentElement.clientTop;
			offset.left -= documentElement.clientLeft;
		}
		return offset;
	}

	#isDigit(charCode) {
		return CHAR_CODE_ZERO <= charCode && charCode <= CHAR_CODE_NINE;
	}

	#getLineHeightPx() {
		const computedStyle = getComputedStyle(this.el);
		const lineHeight = computedStyle.lineHeight;
		// If the char code starts with a digit, it is either a value in pixels,
		// or unitless, as per:
		// https://drafts.csswg.org/css2/visudet.html#propdef-line-height
		// https://drafts.csswg.org/css2/cascade.html#computed-value
		if (this.#isDigit(lineHeight.charCodeAt(0))) {
			const floatLineHeight = parseFloat(lineHeight);
			// In real browsers the value is *always* in pixels, even for unit-less
			// line-heights. However, we still check as per the spec.
			return this.#isDigit(lineHeight.charCodeAt(lineHeight.length - 1))
				? floatLineHeight * parseFloat(computedStyle.fontSize)
				: floatLineHeight;
		}
		// Otherwise, the value is "normal".
		// If the line-height is "normal", calculate by font-size
		return this.#calculateLineHeightPx(this.el.nodeName, computedStyle);
	}

	/**
	 * Returns calculated line-height of the given node in pixels.
	 */
	#calculateLineHeightPx(nodeName, computedStyle) {
		const body = document.body;
		if (!body) return 0;

		const tempNode = document.createElement(nodeName);
		tempNode.innerHTML = "&nbsp;";
		Object.assign(tempNode.style, {
			fontSize: computedStyle.fontSize,
			fontFamily: computedStyle.fontFamily,
			padding: "0",
		});
		body.appendChild(tempNode);

		// Make sure textarea has only 1 row
		if (tempNode instanceof HTMLTextAreaElement) {
			tempNode.rows = 1;
		}

		// Assume the height of the element is the line-height
		const height = tempNode.offsetHeight;
		body.removeChild(tempNode);

		return height;
	}

	getCursorOffset() {
		const elOffset = this.#calculateElementOffset();
		const elScroll = this.#getElScroll();
		const cursorPosition = this.#getCursorPosition();
		const lineHeight = this.#getLineHeightPx();
		const top = elOffset.top - elScroll.top + cursorPosition.top + lineHeight;
		const left = elOffset.left - elScroll.left + cursorPosition.left;
		const clientTop = this.el.getBoundingClientRect().top;
		if (this.el.dir !== "rtl") {
			return { top, left, lineHeight, clientTop };
		} else {
			const right = document.documentElement ? document.documentElement.clientWidth - left : 0;
			return { top, right, lineHeight, clientTop };
		}
	}

	#getElScroll() {
		return { top: this.el.scrollTop, left: this.el.scrollLeft };
	}

	#getCursorPosition() {
		return getCaretCoordinates(this.el, this.el.selectionEnd);
	}

	getBeforeCursor() {
		return this.el.selectionStart !== this.el.selectionEnd ? null : this.el.value.substring(0, this.el.selectionEnd);
	}

	getAfterCursor() {
		return this.el.value.substring(this.el.selectionEnd);
	}

	insertAtCursor(value) {
		if (document.selection) {
			this.el.focus();
			sel = document.selection.createRange();
			sel.text = value;
		} else if (this.el.selectionStart) {
			const startPos = this.el.selectionStart;
			const endPos = this.el.selectionEnd;
			this.el.value =
				this.el.value.substring(0, startPos) + value + this.el.value.substring(endPos, this.el.value.length);
			this.el.selectionStart = startPos + value.length;
			this.el.selectionEnd = startPos + value.length;
		} else {
			this.el.value += value;
		}
	}
}

/*********************/

export class TextAreaAutoComplete {
	static groups = {};
	static words = {};

	/** @type {HTMLTextAreaElement} */
	el;

	/**
	 * @param {HTMLTextAreaElement} el
	 */
	constructor(el) {
		this.el = el;
		this.helper = new TextAreaCaretHelper(el);
		this.dropdown = $el("div.pysssss-autocomplete");

		this.#setup();

		setTimeout(() => this.#update(), 100);
	}

	#setup() {
		this.el.addEventListener("keydown", this.#keyDown.bind(this));
		this.el.addEventListener("keypress", this.#keyPress.bind(this));
		this.el.addEventListener("keyup", this.#keyUp.bind(this));
		this.el.addEventListener("click", this.#hide.bind(this));
		this.el.addEventListener("blur", () => setTimeout(() => this.#hide(), 150));
	}

	/**
	 * @param {KeyboardEvent} e
	 */
	#keyDown(e) {
		if (this.dropdown.parentElement) {
			// We are visible
			switch (e.key) {
				case "ArrowUp":
					e.preventDefault();
					if (this.selected.index) {
						this.#setSelected(this.currentWords[this.selected.index - 1]);
					} else {
						this.#setSelected(this.currentWords[this.currentWords.length - 1]);
					}
					break;
				case "ArrowDown":
					e.preventDefault();
					if (this.selected.index === this.currentWords.length - 1) {
						this.#setSelected(this.currentWords[0]);
					} else {
						this.#setSelected(this.currentWords[this.selected.index + 1]);
					}
					break;
				case "Tab":
					e.preventDefault();
					this.#insertItem();
					break;
			}
		}
	}

	/**
	 * @param {KeyboardEvent} e
	 */
	#keyPress(e) {
		if (this.dropdown.parentElement) {
			// We are visible
			switch (e.key) {
				case "Enter":
					e.preventDefault();
					this.#insertItem();
					break;
			}
		}

		if (!e.defaultPrevented) {
			this.#update();
		}
	}

	#keyUp(e) {
		if (this.dropdown.parentElement) {
			// We are visible
			switch (e.key) {
				case "Escape":
					e.preventDefault();
					this.#hide();
					break;
			}
		}
		if (!e.defaultPrevented) {
			this.#update();
		}
	}

	#setSelected(item) {
		if (this.selected) {
			this.selected.el.classList.remove("pysssss-autocomplete-item--selected");
		}

		this.selected = item;
		this.selected.el.classList.add("pysssss-autocomplete-item--selected");
	}

	#insertItem() {
		if (!this.selected) return;
		this.selected.el.click();
	}

	#getFilteredWords(term) {
		term = term.toLocaleLowerCase();
		return Object.keys(TextAreaAutoComplete.words)
			.filter((w) => {
				const t = w.toLocaleLowerCase();
				return t !== term && t.startsWith(term);
			})
			.sort((a, b) => a.length - b.length)
			.slice(0, 20)
			.map((k) => TextAreaAutoComplete.words[k]);
	}

	#update() {
		let before = this.helper.getBeforeCursor();
		if (before?.length) {
			const m = before.match(/\b([\w-_:\\\/]+)$/);
			if (m) {
				before = m[0];
			} else {
				before = null;
			}
		}

		if (!before) {
			this.#hide();
			return;
		}

		this.currentWords = this.#getFilteredWords(before);
		if (!this.currentWords.length) {
			this.#hide();
			return;
		}

		this.dropdown.style.display = "";

		let hasSelected = false;
		const items = this.currentWords.map((w, i) => {
			const parts = [
				$el("span.pysssss-autocomplete-highlight", {
					textContent: w.text.substring(0, before.length),
				}),
				$el("span", {
					textContent: w.text.substring(before.length),
				}),
			];
			if (w.info) {
				parts.push(
					$el("a.pysssss-autocomplete-item-info", {
						textContent: "ℹ️",
						title: "View info...",
						onclick: (e) => {
							e.stopPropagation();
							w.info();
							e.preventDefault();
						},
					})
				);
			}
			const item = $el(
				"div.pysssss-autocomplete-item",
				{
					onclick: () => {
						this.el.focus();
						this.helper.insertAtCursor(w.text.substr(before.length));
						setTimeout(() => {
							this.#update();
						}, 150);
					},
					onmousemove: () => {
						this.#setSelected(w);
					},
				},
				parts
			);

			if (w === this.selected) {
				hasSelected = true;
			}

			w.index = i;
			w.el = item;

			return item;
		});

		this.#setSelected(hasSelected ? this.selected : this.currentWords[0]);
		this.dropdown.replaceChildren(...items);

		if (!this.dropdown.parentElement) {
			document.body.append(this.dropdown);
		}

		const position = this.helper.getCursorOffset();
		this.dropdown.style.left = (position.left ?? 0) + "px";
		this.dropdown.style.top = (position.top ?? 0) + "px";
	}

	#hide() {
		this.selected = null;
		this.dropdown.remove();
	}

	static updateWords(id, words) {
		const isUpdate = id in TextAreaAutoComplete.groups;
		TextAreaAutoComplete.groups[id] = words;
		if (isUpdate) {
			// Remerge all words
			TextAreaAutoComplete.words = Object.assign({}, ...Object.values(TextAreaAutoComplete.groups));
		} else {
			// Just insert the new words
			Object.assign(TextAreaAutoComplete.words, words);
		}
	}
}
