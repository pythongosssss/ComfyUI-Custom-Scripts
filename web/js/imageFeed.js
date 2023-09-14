import { api } from "../../../scripts/api.js";
import { app } from "../../../scripts/app.js";
import { $el } from "../../../scripts/ui.js";
import { lightbox } from "./common/lightbox.js";
import { PopUp } from "./common/popup.js";

$el("style", {
	textContent: `
	.pysssss-image-feed-root {
		--image-size: 128px;
		--image-gap-size: 4px;

		--image-feed-radius: 5px;
		--image-feed-theme-handle: #333;
		

		align-items: stretch;
		display: flex;
		font-size: 12px;
		position: absolute;
		text-align: center;
		vertical-align: top;
		z-index: 99;
	}
	.pysssss-image-feed-root--left, .pysssss-image-feed-root--right {
		top: 0;
		height: 100vh;
	}
	.pysssss-image-feed-root--left {
		left: 0;
	}
	.pysssss-image-feed-root--right {
		right: 0;
		flex-direction: row-reverse;
	}
	.pysssss-image-feed-root--top, .pysssss-image-feed-root--bottom {
		left: 0;
		width: 100vw;
	}
	.pysssss-image-feed-root--top {
		top: 0;
		flex-direction: column;
	}
	.pysssss-image-feed-root--bottom {
		bottom: 0;
		flex-direction: column-reverse;
	}
	.pysssss-image-feed {
		flex: 1;
		background: var(--comfy-menu-bg);
		color: var(--fg-color);
		font-family: sans-serif;
		font-size: 12px;
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100%;
	}
	.pysssss-image-feed--left, .pysssss-image-feed--right {
		top: 0;
		height: 100vh;
		width: 100%;
	}

	.pysssss-image-feed--top, .pysssss-image-feed--bottom {
		left: 0;
		width: 100vw;
		height: 100%;
	}

	.pysssss-image-feed-menu {
		position: relative;
		flex: 0 1 min-content;
		display: flex;
		gap: 5px;
		padding: 5px;
		justify-content: space-between;
	}
	.pysssss-image-feed-btn-group {
		align-items: stretch;
		display: flex;
		gap: .5rem;
		flex: 0 1 fit-content;
		justify-content: flex-end;
	}
	.pysssss-image-feed-btn {
		background-color:var(--comfy-input-bg);
		border-radius: var(--image-feed-radius);
		border:2px solid var(--border-color);
		color: var(--fg-color);
		cursor:pointer;
		display:inline-block;
		flex: 0 1 fit-content;
		text-decoration:none;
	}
	.pysssss-image-feed-btn.sizing-btn:checked {
		filter: invert();
	}
	.pysssss-image-feed-btn.clear-btn {
		padding: 5px 20px;
	}
	.pysssss-image-feed-btn.hide-btn {
		padding: 5px;
		aspect-ratio: 1 / 1;
	}
	.pysssss-image-feed-btn:hover {
		filter: brightness(1.2);
	}
	.pysssss-image-feed-btn:active {
		position:relative;
		top:1px;
	}
	.pysssss-image-feed-menu section {
		border-radius: var(--image-feed-radius);
		background: rgba(0,0,0,0.6);
		padding: 0 5px;
		display: flex;
		gap: 5px;
		align-items: center;
		position: relative;
	}
	.pysssss-image-feed-menu section span {
		white-space: nowrap;
	}
	.pysssss-image-feed-menu section input {
		flex: 1 1 100%;
		background: rgba(0,0,0,0.6);
		border-radius: var(--image-feed-radius);
		overflow: hidden;
		z-index: 100;
	}

	.sizing-menu {
		position: relative;
	}

	.size-controls-flyout {
		position: absolute;
		transform: scaleX(0%);
		transition: 200ms ease-out;
		transition-delay: 500ms;
		z-index: 101;
		width: 300px;
	}

	.sizing-menu:hover .size-controls-flyout {
		position: absolute;
		transform: scale(1, 1);
		transition: 200ms linear;
		transition-delay: 0;
	}
	.pysssss-image-feed--bottom .size-controls-flyout  {
		transform: scale(1,0);
		transform-origin: bottom;
		bottom: 0;
		left: 0;
	}
	.pysssss-image-feed--top .size-controls-flyout  {
		transform: scale(1,0);
		transform-origin: top;
		top: 0;
		left: 0;
	}
	.pysssss-image-feed--left .size-controls-flyout  {
		transform: scale(0, 1);
		transform-origin: left;
		top: 0;
		left: 0;
	}
	.pysssss-image-feed--right .size-controls-flyout  {
		transform: scale(0, 1);
		transform-origin: right;
		top: 0;
		right: 0;
	}

	.pysssss-image-feed-menu > * {
		min-height: 24px;
	}
	.pysssss-image-feed-list {
		align-content: flex-start;
		overflow-y: auto;
		display: grid;
		gap: var(--image-gap-size);
		align-items: center;
      	justify-items: center;
		transition: 100ms linear;
		scrollbar-gutter: stable both-edges;
		padding: 5px;
		background: var(--comfy-input-bg);
		border-radius: var(--image-feed-radius);
		margin: 5px;
		margin-top: 0px;
		height: 100%;
	}
	.pysssss-image-feed-list div, .pysssss-image-feed-list a {
		display: flex;
		flex-wrap: wrap;
		width: var(--image-size);
		height: var(--image-size);
		align-content: center;
		justify-content: center;
	}
	.pysssss-image-feed-list div {
		background: rgba(0,0,0,0.15);
		box-sizing: border-box;
	}
	.pysssss-image-feed-list div:hover{
		filter: brightness(1.2);
	}
	.pysssss-image-feed-list img {
		max-width: 100%;
      	max-height: 100%;
	}
	.pysssss-image-feed-list::-webkit-scrollbar {
		background: var(--comfy-input-bg);
		border-radius: var(--image-feed-radius);
	}
	.pysssss-image-feed-list::-webkit-scrollbar-thumb {
		background:var(--comfy-menu-bg);
		border: 5px solid transparent;
		border-radius: var(--image-feed-radius);
		background-clip: content-box;
	}
	.pysssss-image-feed-list::-webkit-scrollbar-thumb:hover {
		background: var(--border-color);
		background-clip: content-box;
	}
	.pysssss-image-feed-handle {
		flex: 0;
		background-color: #191919;
		display: flex;
		align-items: center;
		justify-content: center;

		/* Disables dragging so it doesn't mess up the grab. */
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;
	}
	.pysssss-image-feed-handle--left, .pysssss-image-feed-handle--right {
		cursor: col-resize;
		min-width: 8px;
		height: 100vh;
	}
	.pysssss-image-feed-handle--top, .pysssss-image-feed-handle--bottom {
		cursor: row-resize;
		min-height: 8px;
		width: 100vw;
	}
	.pysssss-image-feed-handle:hover, .pysssss-image-feed-handle:active {
		background-color: var(--border-color);
	}
	`,
	parent: document.body,
});

app.registerExtension({
	name: "pysssss.ImageFeed",
	setup() {
		let visible = true;
		const showButton = $el("button.comfy-settings-btn", {
			textContent: "🖼️",
			style: {
				right: "16px",
				cursor: "pointer",
				display: "none",
			},
		});

		const getVal = (n, d) => {
			const v = localStorage.getItem("pysssss.ImageFeed." + n);
			if (v && !isNaN(+v)) {
				return v;
			}
			return d;
		};

		const saveVal = (n, v) => {
			localStorage.setItem("pysssss.ImageFeed." + n, v);
		};

		const imageFeedRoot = $el("div.pysssss-image-feed-root", {
			parent: document.body,
		});

		const imageFeed = $el("div.pysssss-image-feed");

		const imageList = $el("div.pysssss-image-feed-list");

		const resizeHandle = $el("div.pysssss-image-feed-handle");

		imageFeedRoot.append(imageFeed, resizeHandle);

		const feedLocation = app.ui.settings.addSetting({
			id: "pysssss.ImageFeed.Location",
			name: "🐍 Image Feed Location",
			defaultValue: "bottom",
			type: () => {
				return $el("tr", [
					$el("td", [
						$el("label", {
							textContent: "🐍 Image Feed Location:",
						}),
					]),
					$el("td", [
						$el(
							"select",
							{
								style: {
									fontSize: "14px",
								},
								oninput: (e) => {
									feedLocation.value = e.target.value;
									onFeedLocationChange(feedLocation.value);
								},
							},
							["left", "top", "right", "bottom"].map((m) =>
								$el("option", {
									value: m,
									textContent: m,
									selected: feedLocation.value === m,
								})
							)
						),
					]),
				]);
			},
			onChange(value) {
				onFeedLocationChange(value);
			},
		});

		function onFeedLocationChange(value) {
			imageFeed.className = `pysssss-image-feed pysssss-image-feed--${value}`;
			imageFeedRoot.className = `pysssss-image-feed-root pysssss-image-feed-root--${value}`;
			resizeHandle.className = `pysssss-image-feed-handle pysssss-image-feed-handle--${value}`;
			if (["left", "right"].includes(value)) {
				imageFeedRoot.style.height = "unset";
			} else {
				imageFeedRoot.style.width = "unset";
			}
		}

		const feedDirection = app.ui.settings.addSetting({
			id: "pysssss.ImageFeed.Direction",
			name: "🐍 Image Feed Direction",
			defaultValue: "newest first",
			type: () => {
				return $el("tr", [
					$el("td", [
						$el("label", {
							textContent: "🐍 Image Feed Direction:",
						}),
					]),
					$el("td", [
						$el(
							"select",
							{
								style: {
									fontSize: "14px",
								},
								oninput: (e) => {
									feedDirection.value = e.target.value;
									imageList.replaceChildren(...[...imageList.childNodes].reverse());
								},
							},
							["newest first", "oldest first"].map((m) =>
								$el("option", {
									value: m,
									textContent: m,
									selected: feedDirection.value === m,
								})
							)
						),
					]),
				]);
			},
		});

		const clearButton = $el("button.pysssss-image-feed-btn.clear-btn", {
			textContent: "Clear",
			onclick: () => {
				imageList.replaceChildren();
				imageList.style.gridTemplateColumns = "unset";
			},
		});

		const hideButton = $el("button.pysssss-image-feed-btn.hide-btn", {
			textContent: "❌",
			onclick: () => {
				imageFeedRoot.style.display = "none";
				showButton.style.display = "unset";
				saveVal("Visible", 0);
				visible = false;
			},
		});

		const settingsButton = $el("button.pysssss-image-feed-btn.settings-btn", {}, [
			$el("label.size-control-handle", { textContent: "⚙️" })
		]);

		const settingsPopup = new PopUp(settingsButton, {
			name: "Feed Settings",
			activeOnHover: true,
		});
		settingsPopup.setContent( (content) => {
			content.append(
				$el("section.size-control.feed-size-control", {}, [
					$el("span", {
						textContent: "Image Size",
					}),
					$el("input", {
						type: "range",
						min: 32,
						max: 512,
						step: 12,
						oninput: (e) => {
							e.target.parentElement.title = `Controls the maximum size of the images in the feed panel (${e.target.value}px/512px)`;
							imageFeedRoot.style.setProperty("--image-size", `${e.target.value}px` );
							saveVal("ImageSize", e.target.value);
							e.target.textContent = `${e.target.value}px/512px`;
						},
						$: (el) => {
							requestAnimationFrame(() => {
								el.value = getVal("ImageSize", 128);
								el.oninput({ target: el });
							});
						},
					}),
				]),
			)
		});

		imageFeed.append(
			$el("div.pysssss-image-feed-menu", [
				settingsButton,
				$el("div.pysssss-image-feed-btn-group", {}, [clearButton, hideButton]),
			]),
			imageList
		);
		showButton.onclick = () => {
			imageFeedRoot.style.display = "flex";
			showButton.style.display = "none";
			saveVal("Visible", 1);
			visible = true;
		};
		document.querySelector(".comfy-settings-btn").after(showButton);

		if (!+getVal("Visible", 1)) {
			hideButton.onclick();
		}

		api.addEventListener("executed", ({ detail }) => {
			if (visible && detail?.output?.images) {
				for (const src of detail.output.images) {
					const href = `/view?filename=${encodeURIComponent(src.filename)}&type=${
						src.type
					}&subfolder=${encodeURIComponent(src.subfolder)}&t=${+new Date()}`;

					const method = feedDirection.value === "newest first" ? "prepend" : "append";
					imageList[method](
						$el("div", [
							$el(
								"a",
								{
									target: "_blank",
									draggable: false,
									href,
									onclick: (e) => {
										const imgs = [...imageList.querySelectorAll("img")].map((img) => img.getAttribute("src"));
										lightbox.show(imgs, imgs.indexOf(href));
										e.preventDefault();
									},
								},
								[$el("img", { src: href })]
							),
						])
					);
				}
				if (imageList.childNodes.length > 0) {
					imageList.style.gridTemplateColumns = "repeat( auto-fit, minmax(var(--image-size, 128), 1fr) )";
				}
			}
		});

		let isResizing = false;
		let initialSize = 0;
		let imageFeedRootSize = 0;
		let paddingSize = 0;
		let isVertical = false;

		resizeHandle.addEventListener('mousedown', (e) => {
			isResizing = true;
			isVertical = ["left", "right"].includes(feedLocation.value);
			
			if (isVertical) {
				initialSize = e.clientX;
				imageFeedRootSize = parseFloat(getComputedStyle(imageFeedRoot).width);
				paddingSize = (imageFeedRootSize - parseFloat(getComputedStyle(imageFeed).width)) * 8;
			} else {
				initialSize = e.clientY;
				imageFeedRootSize = parseFloat(getComputedStyle(imageFeedRoot).height);
				paddingSize = (imageFeedRootSize - parseFloat(getComputedStyle(imageFeed).height)) * 16;
			}

			[...imageList.querySelectorAll("img")].map((img) => {
				img.setAttribute("draggable", false);
			});

			document.documentElement.style.cursor = isVertical ? "col-resize" : "row-resize";

			document.addEventListener('mousemove', resizeContainer);
			document.addEventListener('mouseup', stopResize);
		});

		function resizeContainer(e) {
			if (!isResizing) {
				return;
			}
			
			var newSize = 0;
			if (isVertical) {
				const deltaX = e.clientX - initialSize;
				newSize = feedLocation.value == "left" ? imageFeedRootSize + deltaX : imageFeedRootSize - deltaX;
			} else {
				const deltaY = e.clientY - initialSize;
				newSize = feedLocation.value == "top" ? imageFeedRootSize + deltaY : imageFeedRootSize - deltaY;
			}

			/* Change image size */
			if (e.shiftKey && !e.ctrlKey) {
				let newImageSize = parseInt(getVal("ImageSize")) + (isVertical ? e.movementX : e.movementY);
				newImageSize = Math.min(Math.max(32, newImageSize), 512);

				saveVal("ImageSize", newImageSize);
				imageFeedRoot.style.setProperty("--image-size", `${newImageSize}px`);
				/* Update settings slider */
				document.querySelector("section.size-control.feed-size-control input").value = newImageSize;
			}
			
			/* Snap to closest image-size multiple for a cleaner list */
			if (e.ctrlKey) {
				const imageSize = getVal("ImageSize", 128);
				let steps = Math.round(newSize / imageSize)
				let gapSize = parseFloat(getComputedStyle(imageFeedRoot).getPropertyValue("--image-gap-size"));
				newSize = steps * imageSize;
				newSize = newSize + paddingSize + (steps * (gapSize + 2));
			}
			
			if (newSize >= 0.0 && newSize <= isVertical ?  window.innerWidth : window.innerHeight) {
				if (isVertical) {
					imageFeedRoot.style.minWidth = `${newSize}px`;
				} else {
					imageFeedRoot.style.minHeight = `${newSize}px`;
				}
			}
		}

		function stopResize() {
			isResizing = false;
			document.removeEventListener('mousemove', resizeContainer);
			document.removeEventListener('mouseup', stopResize);

			document.documentElement.style.cursor = "default";

			[...imageList.querySelectorAll("img")].map((img) => {
				img.setAttribute("draggable", true);
			});
		}
	},
});
