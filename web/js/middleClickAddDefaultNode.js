import { app } from "../../../scripts/app.js";

const id = "pysssss.MiddleClickAddDefaultNode";
const ext = {
	name: id,
	async setup(app) {
		app.ui.settings.addSetting({
			id,
			name: "🐍 Middle click slot to add reroute",
			defaultValue: true,
			type: "boolean",
			onChange(value) {
				LiteGraph.middle_click_slot_add_default_node = !!value;
			},
		});
	},
};

app.registerExtension(ext);
