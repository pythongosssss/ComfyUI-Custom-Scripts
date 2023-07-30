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

		LiteGraph.ContextMenu["pysssss:addItem"].push(function (el, menu, args) {
			if (args[1]?.image) {
				el.textContent += " *";
				$el("div.pysssss-combo-image", {
					parent: el,
					style: {
						backgroundImage: `url(/pysssss/view/${encodeURIComponent(args[1].image)})`,
					},
				});
			}
		});

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
