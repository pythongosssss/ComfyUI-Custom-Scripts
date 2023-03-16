import { app } from "/scripts/app.js";

// Adds mapping of touch events to mouse events for mobile. This isnt great but it is somewhat usable

app.registerExtension({
	name: "pysssss.TouchEvents",
	setup() {
		let touchStart = null;
		let touchType = 0;

		function fireEvent(originalEvent, type) {
			const fakeEvent = document.createEvent("MouseEvent");
			const touch = originalEvent.changedTouches[0];
			fakeEvent.initMouseEvent(
				type,
				true,
				true,
				window,
				1,
				touch.screenX,
				touch.screenY,
				touch.clientX,
				touch.clientY,
				false,
				false,
				false,
				false,
				0,
				null
			);

			touch.target.dispatchEvent(fakeEvent);
			if (fakeEvent.defaultPrevented) {
				originalEvent.preventDefault();
			}
		}

		document.addEventListener(
			"touchstart",
			(e) => {
				// Support tap as click if it completes within a delay
				if (touchStart) {
					clearTimeout(touchStart);
				}
				touchStart = setTimeout(() => {
					touchStart = null;
				}, 100);

				// Left or right button down
				touchType = e.touches.length === 1 ? 0 : 2;

				fireEvent(e, "mousedown");
			},
			true
		);

		document.addEventListener("touchmove", (e) => fireEvent(e, "mousemove"), true);

		document.addEventListener(
			"touchend",
			(e) => {
				const isClick = touchStart;
				if (isClick) {
					// We are within the touch start delay so fire this as a click
					clearTimeout(touchStart);
					fireEvent(e, "click");
				}
				fireEvent(e, "mouseup");
				touchType = 0;
			},
			true
		);
	},
});
