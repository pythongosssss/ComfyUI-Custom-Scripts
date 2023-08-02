import { app } from "/scripts/app.js";

const id = "pysssss.SnapToGrid";
const ext = {
	name: id,
	async setup(app) {
		app.ui.settings.addSetting({
			id,
			name: "🐍 Always snap to grid",
			defaultValue: false,
			type: "boolean",
			onChange(value) {
				app.canvas.align_to_grid = value;
			},
		});
		const origDrawNode = LGraphCanvas.prototype.drawNode;
		LGraphCanvas.prototype.drawNode = function () {
			const shift = app.shiftDown;
			app.shiftDown = true; // Force it to draw the drop position
			const r = origDrawNode.apply(this, arguments);
			app.shiftDown = shift;
            return r;
		};
	},
};

app.registerExtension(ext);
