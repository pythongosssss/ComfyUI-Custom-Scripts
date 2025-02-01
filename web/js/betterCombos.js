import { app } from "../../../scripts/app.js";
import { ComfyWidgets } from "../../../scripts/widgets.js";
import { $el } from "../../../scripts/ui.js";
import { api } from "../../../scripts/api.js";

const CHECKPOINT_LOADER = "CheckpointLoader|pysssss";
const LORA_LOADER = "LoraLoader|pysssss";
const IMAGE_WIDTH = 384;
const IMAGE_HEIGHT = 384;

function getType(node) {
	if (node.comfyClass === CHECKPOINT_LOADER) {
		return "checkpoints";
	}
	return "loras";
}

const getImage = (imageId) => document.querySelector(`#${CSS.escape(imageId)}`);

const calculateImagePosition = (el, bodyRect) => {
	let { top, left, right } = el.getBoundingClientRect();
	const { width: bodyWidth, height: bodyHeight } = bodyRect;

	const isSpaceRight = right + IMAGE_WIDTH <= bodyWidth;
	if (isSpaceRight) {
		left = right;
	} else {
		left -= IMAGE_WIDTH;
	}

	top = top - IMAGE_HEIGHT / 2;
	if (top + IMAGE_HEIGHT > bodyHeight) {
		top = bodyHeight - IMAGE_HEIGHT;
	}
	if (top < 0) {
		top = 0;
	}

	return { left: Math.round(left), top: Math.round(top), isLeft: !isSpaceRight };
};

function showImage(el, imageId) {
	const img = getImage(imageId);
	if (img) {
		const bodyRect = document.body.getBoundingClientRect();
		if (!bodyRect) return;

		const { left, top, isLeft } = calculateImagePosition(el, bodyRect);

		img.style.display = "block";
		img.style.left = `${left}px`;
		img.style.top = `${top}px`;

		if (isLeft) {
			img.classList.add("left");
		} else {
			img.classList.remove("left");
		}
	}
}

function closeImage(imageId) {
	const img = getImage(imageId);
	if (img) {
		img.style.display = "none";
	}
}

app.registerExtension({
	name: "pysssss.Combo++",
	init() {
		$el("style", {
			textContent: `
				.litemenu-entry:hover .pysssss-combo-image {
					display: block;
				}
				.pysssss-combo-image {
					display: none;
					position: absolute;
					left: 0;
					top: 0;
					width: ${IMAGE_WIDTH}px;
					height: ${IMAGE_HEIGHT}px;
					background-size: contain;
					background-repeat: no-repeat;
					z-index: 9999;
				}
				.pysssss-combo-image.left {
					background-position: top right;
				}
			`,
			parent: document.body,
		});

		const submenuSetting = app.ui.settings.addSetting({
			id: "pysssss.Combo++.Submenu",
			name: "🐍 Enable submenu in custom nodes",
			defaultValue: true,
			type: "boolean",
		});

		// Ensure hook callbacks are available
		const getOrSet = (target, name, create) => {
			if (name in target) return target[name];
			return (target[name] = create());
		};
		const symbol = getOrSet(window, "__pysssss__", () => Symbol("__pysssss__"));
		const store = getOrSet(window, symbol, () => ({}));
		const contextMenuHook = getOrSet(store, "contextMenuHook", () => ({}));
		for (const e of ["ctor", "preAddItem", "addItem"]) {
			if (!contextMenuHook[e]) {
				contextMenuHook[e] = [];
			}
		}
		// // Checks if this is a custom combo item
		const isCustomItem = (value) => value && typeof value === "object" && "image" in value && value.content;
		// Simple check for what separator to split by
		const splitBy = (navigator.platform || navigator.userAgent).includes("Win") ? /\/|\\/ : /\//;

		contextMenuHook["ctor"].push(function (values, options) {
			// Copy the class from the parent so if we are dark we are also dark
			// this enables the filter box
			if (options.parentMenu?.options?.className === "dark") {
				options.className = "dark";
			}
		});

		function encodeRFC3986URIComponent(str) {
			return encodeURIComponent(str).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
		}

		// After an element is created for an item, add an image if it has one
		contextMenuHook["addItem"].push(function (el, menu, [name, value, options]) {
			if (el && isCustomItem(value) && value?.image && !value.submenu) {
				const key = `pysssss-image-combo-${name}`;
				el.textContent += " *";
				$el("div.pysssss-combo-image", {
					id: key,
					parent: document.body,
					style: {
						backgroundImage: `url(/pysssss/view/${encodeRFC3986URIComponent(value.image)})`,
					},
				});
				const showHandler = () => showImage(el, key);
				const closeHandler = () => closeImage(key);

				el.addEventListener("mouseenter", showHandler, { passive: true });
				el.addEventListener("mouseleave", closeHandler, { passive: true });
				el.addEventListener("click", closeHandler, { passive: true });
			}
		});

		function buildMenu(widget, values) {
			const lookup = {
				"": { options: [] },
			};

			// Split paths into menu structure
			for (const value of values) {
				const split = value.content.split(splitBy);
				let path = "";
				for (let i = 0; i < split.length; i++) {
					const s = split[i];
					const last = i === split.length - 1;
					if (last) {
						// Leaf node, manually add handler that sets the lora
						lookup[path].options.push({
							...value,
							title: s,
							callback: () => {
								widget.value = value;
								widget.callback(value);
								app.graph.setDirtyCanvas(true);
							},
						});
					} else {
						const prevPath = path;
						path += s + splitBy;
						if (!lookup[path]) {
							const sub = {
								title: s,
								submenu: {
									options: [],
									title: s,
								},
							};

							// Add to tree
							lookup[path] = sub.submenu;
							lookup[prevPath].options.push(sub);
						}
					}
				}
			}

			return lookup[""].options;
		}

		// Override COMBO widgets to patch their values
		const combo = ComfyWidgets["COMBO"];
		ComfyWidgets["COMBO"] = function (node, inputName, inputData) {
			const type = inputData[0];
			const res = combo.apply(this, arguments);
			if (isCustomItem(type[0])) {
				let value = res.widget.value;
				let values = res.widget.options.values;
				let menu = null;

				// Override the option values to check if we should render a menu structure
				Object.defineProperty(res.widget.options, "values", {
					get() {
						let v = values;

						if (submenuSetting.value) {
							if (!menu) {
								// Only build the menu once
								menu = buildMenu(res.widget, values);
							}
							v = menu;
						}

						const valuesIncludes = v.includes;
						v.includes = function (searchElement) {
							const includesFromMenuItems = function (items) {
								for (const item of items) {
									if (includesFromMenuItem(item)) {
										return true;
									}
								}
								return false;
							};
							const includesFromMenuItem = function (item) {
								if (item.submenu) {
									return includesFromMenuItems(item.submenu.options);
								} else {
									return item.content === searchElement.content;
								}
							};

							const includes = valuesIncludes.apply(this, arguments) || includesFromMenuItems(this);
							return includes;
						};

						return v;
					},
					set(v) {
						// Options are changing (refresh) so reset the menu so it can be rebuilt if required
						values = v;
						menu = null;
					},
				});

				Object.defineProperty(res.widget, "value", {
					get() {
						// HACK: litegraph supports rendering items with "content" in the menu, but not on the widget
						// This detects when its being called by the widget drawing and just returns the text
						// Also uses the content for the same image replacement value
						if (res.widget) {
							const stack = new Error().stack;
							if (stack.includes("drawNodeWidgets") || stack.includes("saveImageExtraOutput")) {
								return (value || type[0]).content;
							}
						}
						return value;
					},
					set(v) {
						if (v?.submenu) {
							// Dont allow selection of submenus
							return;
						}
						value = v;
					},
				});
			}

			return res;
		};
	},
	async beforeRegisterNodeDef(nodeType, nodeData, app) {
		const isCkpt = nodeType.comfyClass === CHECKPOINT_LOADER;
		const isLora = nodeType.comfyClass === LORA_LOADER;
		if (isCkpt || isLora) {
			const onAdded = nodeType.prototype.onAdded;
			nodeType.prototype.onAdded = function () {
				onAdded?.apply(this, arguments);
				const { widget: exampleList } = ComfyWidgets["COMBO"](this, "example", [[""]], app);

				let exampleWidget;

				const get = async (route, suffix) => {
					const url = encodeURIComponent(`${getType(nodeType)}${suffix || ""}`);
					return await api.fetchApi(`/pysssss/${route}/${url}`);
				};

				const getExample = async () => {
					if (exampleList.value === "[none]") {
						if (exampleWidget) {
							exampleWidget.inputEl.remove();
							exampleWidget = null;
							this.widgets.length -= 1;
						}
						return;
					}

					const v = this.widgets[0].value.content;
					const pos = v.lastIndexOf(".");
					const name = v.substr(0, pos);
					let exampleName = exampleList.value;
					let viewPath = `/${name}`;
					if (exampleName === "notes") {
						viewPath += ".txt";
					} else {
						viewPath += `/${exampleName}`;
					}
					const example = await (await get("view", viewPath)).text();
					if (!exampleWidget) {
						exampleWidget = ComfyWidgets["STRING"](this, "prompt", ["STRING", { multiline: true }], app).widget;
						exampleWidget.inputEl.readOnly = true;
						exampleWidget.inputEl.style.opacity = 0.6;
					}
					exampleWidget.value = example;
				};

				const exampleCb = exampleList.callback;
				exampleList.callback = function () {
					getExample();
					return exampleCb?.apply(this, arguments) ?? exampleList.value;
				};

				const listExamples = async () => {
					exampleList.disabled = true;
					exampleList.options.values = ["[none]"];
					exampleList.value = "[none]";
					let examples = [];
					if (this.widgets[0].value?.content) {
						try {
							examples = await (await get("examples", `/${this.widgets[0].value.content}`)).json();
						} catch (error) {}
					}
					exampleList.options.values = ["[none]", ...examples];
					exampleList.value = exampleList.options.values[+!!examples.length];
					exampleList.callback();
					exampleList.disabled = !examples.length;
					app.graph.setDirtyCanvas(true, true);
				};

				// Expose function to update examples
				nodeType.prototype["pysssss.updateExamples"] = listExamples;

				const modelWidget = this.widgets[0];
				const modelCb = modelWidget.callback;
				let prev = undefined;
				modelWidget.callback = function () {
					const ret = modelCb?.apply(this, arguments) ?? modelWidget.value;
					let v = ret;
					if (ret?.content) {
						v = ret.content;
					}
					if (prev !== v) {
						listExamples();
						prev = v;
					}
					return ret;
				};
				setTimeout(() => {
					modelWidget.callback();
				}, 30);
			};

			// Prevent adding HIDDEN inputs
			const addInput = nodeType.prototype.addInput ?? LGraphNode.prototype.addInput;
			nodeType.prototype.addInput = function (_, type) {
				if (type === "HIDDEN") return;
				return addInput.apply(this, arguments);
			};
		}

		const getExtraMenuOptions = nodeType.prototype.getExtraMenuOptions;
		nodeType.prototype.getExtraMenuOptions = function (_, options) {
			if (this.imgs) {
				// If this node has images then we add an open in new tab item
				let img;
				if (this.imageIndex != null) {
					// An image is selected so select that
					img = this.imgs[this.imageIndex];
				} else if (this.overIndex != null) {
					// No image is selected but one is hovered
					img = this.imgs[this.overIndex];
				}
				if (img) {
					const nodes = app.graph._nodes.filter((n) => n.comfyClass === LORA_LOADER || n.comfyClass === CHECKPOINT_LOADER);
					if (nodes.length) {
						options.unshift({
							content: "Save as Preview",
							submenu: {
								options: nodes.map((n) => ({
									content: n.widgets[0].value.content,
									callback: async () => {
										const url = new URL(img.src);
										const { image } = await api.fetchApi(
											"/pysssss/save/" + encodeURIComponent(`${getType(n)}/${n.widgets[0].value.content}`),
											{
												method: "POST",
												body: JSON.stringify({
													filename: url.searchParams.get("filename"),
													subfolder: url.searchParams.get("subfolder"),
													type: url.searchParams.get("type"),
												}),
												headers: {
													"content-type": "application/json",
												},
											}
										);
										n.widgets[0].value.image = image;
										app.refreshComboInNodes();
									},
								})),
							},
						});
					}
				}
			}
			return getExtraMenuOptions?.apply(this, arguments);
		};
	},
});
