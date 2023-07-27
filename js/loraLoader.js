import { app } from "/scripts/app.js";
import { ComfyWidgets } from "/scripts/widgets.js";
import { $el } from "/scripts/ui.js";

app.registerExtension({
	name: "pysssss.LoraLoader",
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
					transform: translate(-100%, 0);
					width: 256px;
					height: 256px;
					background-size: cover;
					filter: brightness(65%);
				}
			`,
			parent: document.body,
		});

		// Big ol' hack to get subclassing the context menu to work
		// Replace the addItem function with our own that wraps the context of "this" with a proxy
		// That proxy then replaces the constructor with another proxy
		// That proxy then calls the custom ContextMenu that supports filters
		const ctorProxy = new Proxy(LiteGraph.ContextMenu, {
			construct(target, args) {
				return new LiteGraph.ContextMenu(...args);
			},
		});

		const addItem = LiteGraph.ContextMenu.prototype.addItem;
		LiteGraph.ContextMenu.prototype.addItem = function () {
			const proxy = new Proxy(this, {
				get(target, prop) {
					if (prop === "constructor") {
						return ctorProxy;
					}
					return target[prop];
				},
			});
			proxy.__target__ = this;
			const el = addItem.apply(proxy, arguments);
			if (arguments[1]?.image) {
				el.textContent += " *";
				$el("div.pysssss-combo-image", {
					parent: el,
					style: {
						backgroundImage: `url(/pysssss/view/${encodeURIComponent(arguments[1].image)})`,
					},
				});
			}
			return el;
		};

		// We also need to patch the ContextMenu constructor to unwrap the parent else it fails a LiteGraph type check
		const ctxMenu = LiteGraph.ContextMenu;
		LiteGraph.ContextMenu = function (values, options) {
			ctxMenu.call(this, values, options);
		};
		LiteGraph.ContextMenu.prototype = ctxMenu.prototype;

		const combo = ComfyWidgets["COMBO"];
		ComfyWidgets["COMBO"] = function (node, inputName, inputData) {
			const type = inputData[0];
			const res = combo.apply(this, arguments);
			if (type[0] && type[0].content) {
				let value = res.widget.value;
				Object.defineProperty(res.widget, "value", {
					get() {
						if (res.widget && new Error().stack.includes("drawNodeWidgets")) {
							return value.content;
						}
						return value;
					},
					set(v) {
						value = v;
					},
				});
			}
			return res;
		};
	},
});
