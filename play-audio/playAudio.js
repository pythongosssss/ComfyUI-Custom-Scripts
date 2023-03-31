import { app } from "/scripts/app.js";

app.registerExtension({
	name: "pysssss.PlayAudio",
	async beforeRegisterNodeDef(nodeType, nodeData, app) {
		if (nodeData.name === "SaveAudioNode") {
			const WIDGETS = Symbol();
			nodeType.prototype.onExecuted = function (data) {
				if (WIDGETS in this) {
					// Clear all other widgets
					if (this.widgets) {
						this.widgets.length = this[WIDGETS];
					}
					if (this.widgets_values) {
						this.widgets_values.length = this.widgets.length;
					}
				} else {
					// On first execute store widget count
					this[WIDGETS] = this.widgets?.length || 0;
				}

				// For each file create a seek bar + play button
				for (const file of data) {
					let isTick = true;
					const audio = new Audio(`/view?filename=${encodeURIComponent(file)}`);
					const slider = this.addWidget(
						"slider",
						"loading",
						0,
						(v) => {
							if (!isTick) {
								audio.currentTime = v;
							}
							isTick = false;
						},
						{
							min: 0,
							max: 0,
						}
					);

					const button = this.addWidget("button", `Play ${file}`, "play", () => {
						try {
							if (audio.paused) {
								audio.play();
								button.name = `Pause ${file}`;
							} else {
								audio.pause();
								button.name = `Play ${file}`;
							}
						} catch (error) {
							alert(error);
						}
						app.canvas.setDirty(true);
					});
					audio.addEventListener("timeupdate", () => {
						isTick = true;
						slider.value = audio.currentTime;
						app.canvas.setDirty(true);
					});
					audio.addEventListener("ended", () => {
						button.name = `Play ${file}`;
						app.canvas.setDirty(true);
					});
					audio.addEventListener("loadedmetadata", () => {
						slider.options.max = audio.duration;
						slider.name = `(${audio.duration})`;
						app.canvas.setDirty(true);
					});
				}
			};
		}
	},
});
