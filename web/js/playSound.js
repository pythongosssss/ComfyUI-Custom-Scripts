import { app } from "../../../scripts/app.js";

app.registerExtension({
	name: "pysssss.PlaySound",
	async beforeRegisterNodeDef(nodeType, nodeData, app) {
		if (nodeData.name === "PlaySound|pysssss") {
			const onExecuted = nodeType.prototype.onExecuted;
			nodeType.prototype.onExecuted = async function () {
				onExecuted?.apply(this, arguments);
				if (this.widgets[0].value === "on empty queue") {
					if (app.ui.lastQueueSize !== 0) {
						await new Promise((r) => setTimeout(r, 500));
					}
					if (app.ui.lastQueueSize !== 0) {
						return;
					}
				}
				const url = new URL(`assets/notify.mp3`, import.meta.url);
				const audio = new Audio(url);
				audio.volume = this.widgets[1].value;
				audio.play();
			};
		}
	},
});
