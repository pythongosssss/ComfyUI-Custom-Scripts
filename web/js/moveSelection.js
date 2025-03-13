import { app } from "../../../scripts/app.js";

let setting;
const id = "pysssss.MoveSelection";
const ext = {
	name: id,
	init() {
		setting = app.ui.settings.addSetting({
			id,
			name: "🐍 Always move selected nodes (without SHIFT)",
			defaultValue: false,
			type: "boolean",
		});
	},
};

app.registerExtension(ext);
