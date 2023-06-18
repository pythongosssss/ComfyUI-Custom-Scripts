import { api } from "/scripts/api.js";
import { app } from "/scripts/app.js";

// Simple script that adds the current queue size to the window title
// Adds a favicon that changes color while active

app.registerExtension({
	name: "pysssss.FaviconStatus",
	setup() {
		api.addEventListener("status", ({ detail }) => {
			let title = "ComfyUI";
			let favicon = "favicon";
			if (detail && detail.exec_info.queue_remaining) {
				favicon += "-active";
				title = `(${detail.exec_info.queue_remaining}) ${title}`;
			}
			document.title = title;

			let link = document.querySelector("link[rel~='icon']");
			if (!link) {
				link = document.createElement("link");
				link.rel = "icon";
				document.head.appendChild(link);
			}

			link.href = new URL(`assets/${favicon}.ico`, import.meta.url);
		});
	},
});
