import { app } from "../../../scripts/app.js";

let setting;
const id = "pysssss.SnapToGrid";
const ext = {
	name: id,
	init() {
		setting = app.ui.settings.addSetting({
			id,
			name: "🐍 Always snap to grid",
			defaultValue: false,
			type: "boolean",
			onChange(value) {
				app.canvas.align_to_grid = value;
			},
		});

		// We need to register our hooks after the core snap to grid extension runs
		// Do this from the graph configure function so we still get onNodeAdded calls
		const configure = LGraph.prototype.configure;
		LGraph.prototype.configure = function () {
			// Override drawNode to draw the drop position
			const drawNode = LGraphCanvas.prototype.drawNode;
			LGraphCanvas.prototype.drawNode = function () {
				if (setting?.value) {
					const shift = app.shiftDown;
					app.shiftDown = true; 
					const r = drawNode.apply(this, arguments);
					app.shiftDown = shift;
					return r;
				}
				return drawNode.apply(this, arguments);
			};

			// Override node added to add a resize handler to force grid alignment
			const onNodeAdded = app.graph.onNodeAdded;
			app.graph.onNodeAdded = function (node) {
				const r = onNodeAdded?.apply(this, arguments);
				const onResize = node.onResize;
				node.onResize = function () {
					if (setting?.value) {
						const shift = app.shiftDown;
						app.shiftDown = true;
						const r = onResize?.apply(this, arguments);
						app.shiftDown = shift;
						return r;
					}
					return onResize?.apply(this, arguments);
				};
				return r;
			};

			return configure.apply(this, arguments);
		};
	},
};

app.registerExtension(ext);
