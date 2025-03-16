import { app } from "../../../scripts/app.js";
import { $el } from "../../../scripts/ui.js";

const colorShade = (col, amt) => {
	col = col.replace(/^#/, "");
	if (col.length === 3) col = col[0] + col[0] + col[1] + col[1] + col[2] + col[2];

	let [r, g, b] = col.match(/.{2}/g);
	[r, g, b] = [parseInt(r, 16) + amt, parseInt(g, 16) + amt, parseInt(b, 16) + amt];

	r = Math.max(Math.min(255, r), 0).toString(16);
	g = Math.max(Math.min(255, g), 0).toString(16);
	b = Math.max(Math.min(255, b), 0).toString(16);

	const rr = (r.length < 2 ? "0" : "") + r;
	const gg = (g.length < 2 ? "0" : "") + g;
	const bb = (b.length < 2 ? "0" : "") + b;

	return `#${rr}${gg}${bb}`;
};

app.registerExtension({
	name: "pysssss.CustomColors",
	setup() {
		let pickerFull;
		let activeNodeFull;
		let pickerTitle;
		let activeNodeTitle;
		let pickerBG;
		let activeNodeBG;
		const onMenuNodeColors = LGraphCanvas.onMenuNodeColors;

		LGraphCanvas.onMenuNodeColors = function (value, options, e, menu, node) {
			const r = onMenuNodeColors.apply(this, arguments);
			requestAnimationFrame(() => {
				const menus = document.querySelectorAll(".litecontextmenu");
				for (let i = menus.length - 1; i >= 0; i--) {
					if (menus[i].firstElementChild.textContent.includes("No color") || menus[i].firstElementChild.value?.content?.includes("No color")) {
						// Original Custom Color for title-bar and background
						$el(
							"div.litemenu-entry.submenu",
							{
								parent: menus[i],
								$: (el) => {
									el.onclick = () => {
										LiteGraph.closeAllContextMenus();
										if (!pickerFull) {
											pickerFull = $el("input", {
												type: "color",
												parent: document.body,
												style: {
													display: "none",
												},
											});
											pickerFull.oninput = () => {
												if (activeNodeFull) {
													const fApplyColor = function(node){
														if (pickerFull.value) {
															if (node.constructor === LiteGraph.LGraphGroup) {
																node.color = pickerFull.value;
															} else {
																node.color = colorShade(pickerFull.value, 20);
																node.bgcolor = pickerFull.value;
															}
														}
													}
													const graphcanvas = LGraphCanvas.active_canvas;
													if (!graphcanvas.selected_nodes || Object.keys(graphcanvas.selected_nodes).length <= 1){
														fApplyColor(activeNodeFull);
													} else {
														for (let i in graphcanvas.selected_nodes) {
															fApplyColor(graphcanvas.selected_nodes[i]);
														}
													}

													activeNodeFull.setDirtyCanvas(true, true);
												}
											};
										}
										activeNodeFull = node; // Set activeNodeFull to the clicked node first
										pickerFull.value = node.bgcolor; // Set the pickerFull to the current node's bgcolor
										pickerFull.click(); // Open the color pickerFull
									};
								},
							},
							[
								$el("span", {
									style: {
										paddingLeft: "4px",
										display: "block",
									},
									textContent: "🎨 Custom Full",
								}),
							]
						);
						// New Entry for Changing Title Color Only
						$el(
							"div.litemenu-entry.submenu",
							{
								parent: menus[i],
								$: (el) => {
									el.onclick = () => {
										LiteGraph.closeAllContextMenus();
										if (!pickerTitle) {
											pickerTitle = $el("input", {
												type: "color",
												parent: document.body,
												style: {
													display: "none",
												},
											});
											pickerTitle.oninput = () => {
												if (activeNodeTitle) {
													const fApplyColor = function(node){
														if (pickerTitle.value) {
															// Changes only the node.color without affecting bgcolor
															// node.color = colorShade(pickerTitle.value, 20); // brightens selected color
															node.color = pickerTitle.value; // uses selected color directly
														}
													}
													const graphcanvas = LGraphCanvas.active_canvas;
													if (!graphcanvas.selected_nodes || Object.keys(graphcanvas.selected_nodes).length <= 1){
														fApplyColor(activeNodeTitle);
													} else {
														for (let i in graphcanvas.selected_nodes) {
															fApplyColor(graphcanvas.selected_nodes[i]);
														}
													}
													
													activeNodeTitle.setDirtyCanvas(true, true);
												}
											};
										}
										activeNodeTitle = node; // Set activeNodeTitle to the clicked node first
										pickerTitle.value = node.color; // Set the pickerTitle to the current node's bgcolor
										pickerTitle.click(); // Open the color pickerTitle
									};
								},
							},
							[
								$el("span", {
									style: {
										paddingLeft: "4px",
										display: "block",
									},
									textContent: "🎨 Custom Title",
								}),
							]
						);
						// New Entry for Changing Background Color Only
						$el(
							"div.litemenu-entry.submenu",
							{
								parent: menus[i],
								$: (el) => {
									el.onclick = () => {
										LiteGraph.closeAllContextMenus();
										if (!pickerBG) {
											pickerBG = $el("input", {
												type: "color",
												parent: document.body,
												style: {
													display: "none",
												},
											});
											pickerBG.oninput = () => {
												if (activeNodeBG) {
													const fApplyColor = function(node){
														if (pickerBG.value) {
															node.bgcolor = pickerBG.value; // uses selected color directly
														}
													}
													const graphcanvas = LGraphCanvas.active_canvas;
													if (!graphcanvas.selected_nodes || Object.keys(graphcanvas.selected_nodes).length <= 1){
														fApplyColor(activeNodeBG);
													} else {
														for (let i in graphcanvas.selected_nodes) {
															fApplyColor(graphcanvas.selected_nodes[i]);
														}
													}
													
													activeNodeBG.setDirtyCanvas(true, true);
												}
											};
										}
										activeNodeBG = node; // Set activeNodeBG to the clicked node first
										pickerBG.value = node.bgcolor; // Set the pickerBG to the current node's bgcolor
										pickerBG.click(); // Open the color pickerBG
									};
								},
							},
							[
								$el("span", {
									style: {
										paddingLeft: "4px",
										display: "block",
									},
									textContent: "🎨 Custom BG",
								}),
							]
						);
						break;
					}
				}
			});
			return r;
		};
	},
});
