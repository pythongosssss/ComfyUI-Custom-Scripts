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
		} else if (nodeData.name === "LoadImage") {
			const onNodeCreated = nodeType.prototype.onNodeCreated;

			const BUTTON_TEXT = "WD14 Interrogate";
			const BUTTON_TEXT_LOADING = "Loading...";
			nodeType.prototype.onNodeCreated = function () {
				const r = onNodeCreated ? onNodeCreated.apply(this, arguments) : undefined;
				this.imageOffset = 120;

				const btn = this.addWidget("button", BUTTON_TEXT, "interrogate", () => {
					if (btn.name === BUTTON_TEXT_LOADING) return;

					btn.name = BUTTON_TEXT_LOADING;
					app.canvas.setDirty(true);
					(async () => {
						try {
							const w = this.widgets.find((w) => w.name === "image");
							if (w?.value) {
								const tags = await (
									await fetch("/pysssss/wd14tagger?type=input&image=" + encodeURIComponent(w.value))
								).json();
								alert(tags);
							}
						} finally {
							btn.name = BUTTON_TEXT;
							app.canvas.setDirty(true);
						}
					})();
				});

				return r;
			};
		}
	},
});
