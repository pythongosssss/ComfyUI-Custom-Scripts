import { app } from "/scripts/app.js";
import { api } from "/scripts/api.js";

// Adds a menu option to toggle follow the executing node

app.registerExtension({
	name: "pysssss.FollowExecution",
	setup() {
		let followExecution = false;

		const centerNode = (id) => {
			if (!followExecution || !id) return;
			const node = app.graph.getNodeById(id);
			if (!node) return;
			app.canvas.centerOnNode(node);
		};

		api.addEventListener("executing", ({ detail }) => centerNode(detail));

		// Add canvas menu options
		const orig = LGraphCanvas.prototype.getCanvasMenuOptions;
		LGraphCanvas.prototype.getCanvasMenuOptions = function () {
			const options = orig.apply(this, arguments);
			options.push(null, {
				content: followExecution ? "Stop following execution" : "Follow execution",
				callback: () => {
					if ((followExecution = !followExecution)) {
						centerNode(app.runningNodeId);
					}
				},
			});
			return options;
		};
	},
});
