import { app } from "../../../scripts/app.js";
import { $el } from "../../../scripts/ui.js";
import { placeSettingRow } from "./settingsHost.js";

const id = "pysssss.LinkRenderMode";
const ext = {
	name: id,
	async setup(app) {
		if (app.extensions.find((ext) => ext.name === "Comfy.LinkRenderMode")) {
			console.log("%c[🐍 pysssss]", "color: limegreen", "Skipping LinkRenderMode as core extension found");
			return;
		}
		const setting = app.ui.settings.addSetting({
			id,
			name: "🐍 Link Render Mode",
			defaultValue: 2,
			type: () => {
				return placeSettingRow($el("tr", [
					$el("td", [
						$el("label", {
							for: id.replaceAll(".", "-"),
							textContent: "🐍 Link Render Mode:",
						}),
					]),
					$el("td", [
						$el(
							"select",
							{
								textContent: "Manage",
								style: {
									fontSize: "14px",
								},
								oninput: (e) => {
									setting.value = e.target.value;
									app.canvas.links_render_mode = +e.target.value;
									app.graph.setDirtyCanvas(true, true);
								},
							},
							LiteGraph.LINK_RENDER_MODES.map((m, i) =>
								$el("option", {
									value: i,
									textContent: m,
									selected: i == app.canvas.links_render_mode,
								})
							)
						),
					]),
				]));
			},
			onChange(value) {
				app.canvas.links_render_mode = +value;
				app.graph.setDirtyCanvas(true);
			},
		});
	},
};

app.registerExtension(ext);
