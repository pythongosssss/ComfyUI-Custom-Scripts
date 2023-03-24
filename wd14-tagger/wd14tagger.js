import { app } from "/scripts/app.js";
import { ComfyWidgets } from "/scripts/widgets.js";
import { api } from "/scripts/api.js";

// Displays the wd14 prompt

app.registerExtension({
	name: "pysssss.Wd14Tagger",
	async beforeRegisterNodeDef(nodeType, nodeData, app) {
		if (nodeData.name === "WD14Tagger") {
			const onNodeCreated = nodeType.prototype.onNodeCreated;
			nodeType.prototype.onNodeCreated = function () {
				const r = onNodeCreated ? onNodeCreated.apply(this, arguments) : undefined;

				const w = ComfyWidgets["STRING"](this, "tags", ["STRING", { multiline: true }], app).widget;
				w.inputEl.readOnly = true;
				w.inputEl.style.opacity = 0.6;

				api.addEventListener("wd14tagger", (e) => {
					if (+app.runningNodeId === this.id) {
						w.inputEl.value = e.detail;
						if (this.size[1] < 180) {
							this.size[1] = 180;
						}
					}
				});

				return r;
			};
		}
	},
});
