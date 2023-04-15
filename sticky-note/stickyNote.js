import { app } from "/scripts/app.js";
import { ComfyWidgets } from "/scripts/widgets.js";

// For adding notes
const id = "pysssss.StickyNote";
app.registerExtension({
	name: id,
	addCustomNodeDefs(defs) {
		defs.StickyNote = {
			name: "StickyNote",
			display_name: "Note",
			category: "utils",
			input: {
				required: {
					note: ["STRING", { multiline: true }],
				},
			},
		};
	},
	beforeRegisterNodeDef(nodeType) {
		if (nodeType.comfyClass === "StickyNote") {
			const onNodeCreated = nodeType.prototype.onNodeCreated;
			nodeType.prototype.onNodeCreated = function () {
				const r = onNodeCreated?.apply(this, arguments);

				const w = this.widgets[0];
				w.inputEl.style.fontFamily = "cursive";
				w.inputEl.style.backgroundColor = "transparent";
				w.inputEl.style.mixBlendMode = "difference";
				w.inputEl.style.color = "white";

				return r;
			};

			nodeType.color = "#ffff7c";
			nodeType.bgcolor = "#ffff7c";
		}
	},
});
