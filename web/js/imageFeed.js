import { api } from "../../../scripts/api.js";
import { app } from "../../../scripts/app.js";
import { $el } from "../../../scripts/ui.js";
import { lightbox } from "./common/lightbox.js";
import { PopUp } from "./common/popup.js";
import { addStylesheet } from "./common/utils.js";

addStylesheet(import.meta.url);

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

		const getValString = (n, d) => {
			const v = localStorage.getItem("pysssss.ImageFeed." + n);
			if (v) {
				return v;
			}
			return d;
		}

		const imageFeedRoot = $el("div.pysssss-image-feed-root", {
			parent: document.body,
		});

		const imageFeed = $el("div.pysssss-image-feed");

		const imageList = $el("div.pysssss-image-feed-list");

		const resizeHandle = $el("div.pysssss-image-feed-handle");

		imageFeedRoot.append(imageFeed, resizeHandle);

		function updateFeedLocation(value) {
			imageFeed.className = `pysssss-image-feed pysssss-image-feed--${value}`;
			imageFeedRoot.className = `pysssss-image-feed-root pysssss-image-feed-root--${value}`;
			resizeHandle.className = `pysssss-image-feed-handle pysssss-image-feed-handle--${value}`;
			if (["left", "right"].includes(value)) {
				imageFeedRoot.style.height = "unset";
			} else {
				imageFeedRoot.style.width = "unset";
			}
		}

		updateFeedLocation(getValString("Location", "bottom"));

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
			const table = $el("table.pysssss-image-feed-table");

			table.append(
				$el("tr", [
					$el("td", [
						$el("label", {
							textContent: "Image Size"
						}),
					]),
					$el("input.image-feed-image-size", {
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
				$el("tr", [
					$el("td", [
						$el("label", {
							textContent: "Location",
						}),
					]),
					$el("td.right", [
						$el(
							"select",
							{
								oninput: (e) => {
									saveVal("Location", e.target.value);
									updateFeedLocation(getValString("Location", "bottom"));
								},
							},
							["left", "top", "right", "bottom"].map((m) =>
								$el("option", {
									value: m,
									textContent: m,
									selected: getValString("Location", "bottom") === m,
								})
							)
						),
					]),
				]),
				$el("tr", [
					$el("td", [
						$el("label", {
							textContent: "Sort by",
						}),
					]),
					$el("td.right", [
						$el(
							"select",
							{
								oninput: (e) => {
									saveVal("Direction", e.target.value);
									imageList.replaceChildren(...[...imageList.childNodes].reverse());
								},
							},
							["newest", "oldest"].map((m) =>
								$el("option", {
									value: m,
									textContent: m,
									selected: getValString("Direction", "newest") === m,
								})
							)
						),
					]),
				]),
			);

			content.append(table);
		});

		imageFeed.append(
			$el("div.pysssss-image-feed-header", [
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

					const method = getValString("Direction", "newest") === "newest" ? "prepend" : "append";
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
		let isOpposite = false;

		resizeHandle.addEventListener('mousedown', (e) => {
			isResizing = true;

			const feedLocation = getValString("Location", "bottom");
			isVertical = ["left", "right"].includes(feedLocation);
			isOpposite = ["right", "bottom"].includes(feedLocation);
			
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
			const feedLocation = getValString("Location", "bottom");
			if (isVertical) {
				const deltaX = e.clientX - initialSize;
				newSize = feedLocation == "left" ? imageFeedRootSize + deltaX : imageFeedRootSize - deltaX;
			} else {
				const deltaY = e.clientY - initialSize;
				newSize = feedLocation == "top" ? imageFeedRootSize + deltaY : imageFeedRootSize - deltaY;
			}

			/* Change image size */
			if (e.shiftKey && !e.ctrlKey) {
				const axis = isVertical ? "movementX" : "movementY";

				let newImageSize = parseInt(getVal("ImageSize"));
				newImageSize += isOpposite ? -e[axis] : e[axis];
				newImageSize = Math.min(Math.max(32, newImageSize), 512);

				saveVal("ImageSize", newImageSize);
				imageFeedRoot.style.setProperty("--image-size", `${newImageSize}px`);
				/* Update settings slider */
				document.querySelector("input.image-feed-image-size").value = newImageSize;
			}
			
			/* Snap to closest image-size multiple for a cleaner list */
			if (e.ctrlKey) {
				const imageSize = getVal("ImageSize", 128);
				let steps = Math.round(newSize / imageSize)
				let gapSize = parseFloat(getComputedStyle(imageFeedRoot).getPropertyValue("--image-gap-size"));
				newSize = steps * imageSize;
				newSize = newSize + paddingSize + (steps * (gapSize + 2));
			}
			
			/* Make sure panel size is always within window */
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
