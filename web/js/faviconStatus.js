import { api } from "../../../scripts/api.js";
import { app } from "../../../scripts/app.js";

// Simple script that adds the current queue size to the window title
// Adds a favicon that changes color while active

app.registerExtension({
	name: "pysssss.FaviconStatus",
	setup() {
		let link = document.querySelector("link[rel~='icon']");
		if (!link) {
			link = document.createElement("link");
			link.rel = "icon";
			document.head.appendChild(link);
		}

		let executing = false;
		const update = () => (link.href = new URL(`assets/favicon${executing ? "-active" : ""}.ico`, import.meta.url));

		for (const e of ["execution_start", "progress"]) {
			api.addEventListener(e, () => {
				executing = true;
				update();
			});
		}

		api.addEventListener("executing", ({ detail }) => {
			// null will be sent when it's finished
			executing = !!detail;
			update();
		});

		api.addEventListener("status", ({ detail }) => {
			let title = "ComfyUI";
			if (detail && detail.exec_info.queue_remaining) {
				title = `(${detail.exec_info.queue_remaining}) ${title}`;
			}
			document.title = title;
			update();
			executing = false;
		});
		update();
	},
});
