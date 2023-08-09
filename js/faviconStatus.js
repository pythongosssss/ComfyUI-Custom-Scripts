import { api } from "/scripts/api.js";
import { app } from "/scripts/app.js";

// Simple script that adds the current queue size to the window title
// Adds a favicon that changes color while active

const id = "pysssss.FaviconStatus";

app.registerExtension({
	name: id,
	setup() {
		let progressEnabled = false;

		api.addEventListener("status", ({ detail }) => {
			let favicon = "favicon";
			let title = "ComfyUI";
			if (detail && detail.exec_info.queue_remaining) {
				favicon += "-active";
				title = `(${detail.exec_info.queue_remaining}) ${title}`;
			}

			if (!progressEnabled) {
				document.title = title;
			}

			let link = document.querySelector("link[rel~='icon']");
			if (!link) {
				link = document.createElement("link");
				link.rel = "icon";
				document.head.appendChild(link);
			}

			link.href = new URL(`assets/${favicon}.ico`, import.meta.url);
		});
		api.addEventListener("progress", ({ detail }) => {
			let title = "ComfyUI";
			if (detail && detail.value && detail.max) {
				title = `(${Math.floor(detail.value/detail.max*100)}%) ${title}`;
			}
			if (progressEnabled) {
				document.title = title;
			}
		});

		app.ui.settings.addSetting({
			id,
			name: "🐍 Show progress in title",
			defaultValue: false,
			type: "boolean",
			onChange(value) {
				progressEnabled = value;
			},
		});
	},
});
