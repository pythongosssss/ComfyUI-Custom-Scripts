import { app } from "/scripts/app.js";
import { api } from "/scripts/api.js";
import { $el } from "/scripts/ui.js";

const id = "pysssss.ShowImageOnMenu";
const ext = {
	name: id,
	async setup(app) {
		let enabled = true;
		let nodeId = null;
		const img = $el("img", {
			style: {
				width: "100%",
				height: "150px",
				objectFit: "contain",
			},
		});
		const link = $el(
			"a",
			{
				style: {
					position: "absolute",
					bottom: 0,
					width: "100%",
					height: "150px",
				},
				href: "#",
				onclick: (e) => {
					e.stopPropagation();
					e.preventDefault();
					const node = app.graph.getNodeById(nodeId);
					if (!node) return;
					app.canvas.centerOnNode(node);
					app.canvas.setZoom(1);
				},
			},
			[img]
		);

		const show = (src, node) => {
			img.src = src;
			nodeId = +node;
			if (!link.parentNode) {
				app.ui.menuContainer.style.paddingBottom = "150px";
				app.ui.menuContainer.append(link);
			}
		};

		api.addEventListener("executed", ({ detail }) => {
			if (!enabled) return;
			const images = detail?.output?.images;
			if (!images) return;
			const format = app.getPreviewFormatParam();
			const src = `/view?filename=${encodeURIComponent(images[0].filename)}&type=${
				images[0].type
			}&subfolder=${encodeURIComponent(images[0].subfolder)}&t=${+new Date()}${format}`;
			show(src, detail.node);
		});

		api.addEventListener("b_preview", ({ detail }) => {
			show(URL.createObjectURL(detail), app.runningNodeId);
		});

		app.ui.settings.addSetting({
			id,
			name: "🐍 Show Image On Menu",
			defaultValue: true,
			type: "boolean",
			onChange(value) {
				enabled = value;
				if (!value) {
					app.ui.menuContainer.style.removeProperty("padding-bottom");
					app.ui.menuContainer.removeChild(link);
				}
			},
		});
	},
};

app.registerExtension(ext);
