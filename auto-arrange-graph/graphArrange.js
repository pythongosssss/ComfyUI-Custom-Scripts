import { app } from "/scripts/app.js";

// Adds right click -> arrange to the canvas

app.registerExtension({
	name: "pysssss.GraphArrange",
	setup(app) {
		const orig = LGraphCanvas.prototype.getCanvasMenuOptions;
		LGraphCanvas.prototype.getCanvasMenuOptions = function () {
			const options = orig.apply(this, arguments);
			options.push({ content: "Arrange", callback: () => graph.arrange() });
			return options;
		};
	},
});
