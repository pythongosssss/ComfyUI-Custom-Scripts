import { api } from "/scripts/api.js";
import { app } from "/scripts/app.js";
import { $el } from "/scripts/ui.js";

// Adds a list of images that are generated to the bottom of the page

$el("style", {
	textContent: `
	.pysssss-image-feed {
		position: absolute;
		background: #333;
		overflow: auto;
		z-index: 99;
		font-family: sans-serif;
		font-size: 12px;
	}
	.pysssss-image-feed--top, .pysssss-image-feed--bottom {
		width: 100vw;
		min-height: 30px;
		max-height: var(--max-size, 200px);
	}
	.pysssss-image-feed--top {
		top: 0;
	}
	.pysssss-image-feed--bottom {
		bottom: 0;
	}
	.pysssss-image-feed--left, .pysssss-image-feed--right {
		top: 0;
		height: 100vh;
		min-width: 30px;
		max-width: var(--max-size, 200px);
	}
	.pysssss-image-feed--left {
		left: 0;
	}
	.pysssss-image-feed--right {
		right: 0;
	}
	.pysssss-image-feed-menu {
		position: sticky;
		top: 0;
		height: 0px;
		display: flex;
		gap: 5px;
		padding: 5px 5px 0 5px;
	}
	.pysssss-image-feed-btn {
		cursor: pointer;
	}
	.pysssss-image-feed-menu section {
		border-radius: 5px;
		background: rgba(0,0,0,0.6);
		padding: 0 5px;
		display: flex;
		gap: 5px;
		align-items: center;
	}
	.pysssss-image-feed-menu section * {
		display: none;
	}
	.pysssss-image-feed-menu section:hover * {
		display: initial;
	}
	.pysssss-image-feed-menu > * {
		min-height: 24px;
	}
	.pysssss-image-feed-list {
		display: grid;
		align-items: center;
		justify-content: center;
		grid-template-columns: repeat( auto-fit, minmax(var(--img-sz), 1fr) );
	}
	.pysssss-image-feed-list div {
		text-align: center;
	}
	.pysssss-image-feed-list img {
		object-fit: var(--img-fit, contain);
		max-width: 100%;
		max-height: var(--max-size);
	}
	.pysssss-image-feed-list img:hover {
		filter: brightness(1.2);
	}`,
	parent: document.body,
});

app.registerExtension({
	name: "pysssss.ImageFeed",
	setup() {
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

		const imageFeed = $el("div.pysssss-image-feed", {
			parent: document.body,
		});
		const imageList = $el("div.pysssss-image-feed-list");

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
									imageFeed.className = `pysssss-image-feed pysssss-image-feed--${feedLocation.value}`;
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
				imageFeed.className = `pysssss-image-feed pysssss-image-feed--${value}`;
			},
		});

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

		const hideButton = $el("button.pysssss-image-feed-btn", {
			textContent: "❌",
			onclick: () => {
				imageFeed.style.display = "none";
				showButton.style.display = "unset";
				saveVal("Visible", 0);
			},
		});

		imageFeed.append(
			$el("div.pysssss-image-feed-menu", [
				$el(
					"section",
					{
						textContent: "Feed Size...",
					},
					[
						$el("input", {
							type: "range",
							style: { width: "100px" },
							min: 10,
							max: 80,
							oninput: (e) => {
								e.target.parentElement.title = `Controls the maximum size of the image feed panel (${e.target.value}vh)`;
								imageFeed.style.setProperty("--max-size", e.target.value + "vh");
								saveVal("FeedSize", e.target.value);
							},
							$: (el) => {
								requestAnimationFrame(() => {
									el.value = getVal("FeedSize", 25);
									el.oninput({ target: el });
								});
							},
						}),
					]
				),
				$el(
					"section",
					{
						textContent: "Image Size...",
						style: {
							marginRight: "auto",
						},
					},
					[
						$el("input", {
							type: "range",
							style: { width: "100px" },
							min: 5,
							max: 100,
							oninput: (e) => {
								e.target.parentElement.title = `Controls the maximum size images in the feed (${e.target.value}vw)`;
								imageFeed.style.setProperty("--img-sz", e.target.value + "vw");
								saveVal("ImageSize", e.target.value);
							},
							$: (el) => {
								requestAnimationFrame(() => {
									el.value = getVal("ImageSize", 25);
									el.oninput({ target: el });
								});
							},
						}),
					]
				),
				$el("button.pysssss-image-feed-btn", {
					textContent: "Clear",
					onclick: () => imageList.replaceChildren(),
				}),
				hideButton,
			]),
			imageList
		);
		showButton.onclick = () => {
			imageFeed.style.display = "block";
			showButton.style.display = "none";
			saveVal("Visible", 1);
		};
		document.querySelector(".comfy-settings-btn").after(showButton);

		if (!+getVal("Visible", 1)) {
			hideButton.onclick();
		}

		api.addEventListener("executed", ({ detail }) => {
			if (detail?.output?.images) {
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
									href,
								},
								[$el("img", { src: href })]
							),
						])
					);
				}
			}
		});
	},
});
