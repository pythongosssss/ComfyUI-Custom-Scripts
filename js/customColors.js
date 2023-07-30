import { app } from "/scripts/app.js";
import { $el } from "/scripts/ui.js";

// https://stackoverflow.com/a/41491220
function pickTextColorBasedOnBgColorAdvanced(bgColor, lightColor, darkColor) {
	var color = bgColor.charAt(0) === "#" ? bgColor.substring(1, 7) : bgColor;
	var r = parseInt(color.substring(0, 2), 16); // hexToR
	var g = parseInt(color.substring(2, 4), 16); // hexToG
	var b = parseInt(color.substring(4, 6), 16); // hexToB
	var uicolors = [r / 255, g / 255, b / 255];
	var c = uicolors.map((col) => {
		if (col <= 0.03928) {
			return col / 12.92;
		}
		return Math.pow((col + 0.055) / 1.055, 2.4);
	});
	var L = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
	return L > 0.179 ? darkColor : lightColor;
}

app.registerExtension({
	name: "pysssss.ShowText",
	setup() {
		let picker;
		let activeNode;
		const onMenuNodeColors = LGraphCanvas.onMenuNodeColors;
		LGraphCanvas.onMenuNodeColors = function (value, options, e, menu, node) {
			const r = onMenuNodeColors.apply(this, arguments);
			requestAnimationFrame(() => {
				const menus = document.querySelectorAll(".litecontextmenu");
				for (let i = menus.length - 1; i >= 0; i--) {
					if (menus[i].firstElementChild.textContent.includes("No color")) {
						$el(
							"div.litemenu-entry.submenu",
							{
								parent: menus[i],
								$: (el) => {
									el.onclick = () => {
										LiteGraph.closeAllContextMenus();
										if (!picker) {
											picker = $el("input", {
												type: "color",
												parent: document.body,
												style: {
													display: "none",
												},
											});
											picker.onchange = () => {
												if (activeNode) {
													if (activeNode.constructor === LiteGraph.LGraphGroup) {
														activeNode.color = picker.value;
													} else {
														activeNode.color = pickTextColorBasedOnBgColorAdvanced(picker.value, "white", "black");
														activeNode.bgcolor = picker.value;
													}
													activeNode.setDirtyCanvas(true, true);
												}
											};
										}
										activeNode = null;
										picker.value = node.bgcolor;
										activeNode = node;
										picker.click();
									};
								},
							},
							[
								$el("span", {
									style: {
										paddingLeft: "4px",
										display: "block",
									},
									textContent: "🎨 Custom",
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
