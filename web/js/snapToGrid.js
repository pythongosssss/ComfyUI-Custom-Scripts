import { app } from "../../../scripts/app.js";
import { $el } from "../../../scripts/ui.js";

let setting, guide_setting, guide_config;
const id = "pysssss.SnapToGrid";
const guide_id = id + ".Guide";
const guide_config_default = {
	lines: {
		enabled: false,
		fillStyle: "rgba(255, 0, 0, 0.5)",
	},
	block: {
		enabled: false,
		fillStyle: "rgba(0, 0, 255, 0.5)",
	},
}

/** Wraps the provided function call to set/reset shiftDown when setting is enabled. */
function wrapCallInSettingCheck(fn) {
	if (setting?.value) {
		const shift = app.shiftDown;
		app.shiftDown = true;
		const r = fn();
		app.shiftDown = shift;
		return r;
	}
	return fn();
}

const ext = {
	name: id,
	init() {
		if (localStorage.getItem(guide_id) === null) {
			localStorage.setItem(guide_id, JSON.stringify(guide_config_default));
		}
		guide_config = JSON.parse(localStorage.getItem(guide_id));

		setting = app.ui.settings.addSetting({
			id,
			name: "🐍 Always snap to grid",
			defaultValue: false,
			type: "boolean",
			onChange(value) {
				app.canvas.align_to_grid = value;
			},
		});

		guide_setting = app.ui.settings.addSetting({
			id: id + ".Guide",
			name: "🐍 Display drag-and-drop guides",
			type: (name, setter, value) => {
				return $el("tr", [
					$el("td", [
						$el("label", {
							for: id.replaceAll(".", "-"),
							textContent: name,
						}),
					]),
					$el("td", [
						$el(
							"label",
							{
								textContent: "Lines: ",
								style: {
									display: "inline-block",
								},
							},
							[
								$el("input", {
									id: id.replaceAll(".", "-") + "-line-text",
									type: "text",
									value: guide_config.lines.fillStyle,
									onchange: (event) => {
										guide_config.lines.fillStyle = event.target.value;
										localStorage.setItem(guide_id, JSON.stringify(guide_config));
									}
								}),
								$el("input", {
									id: id.replaceAll(".", "-") + "-line-checkbox",
									type: "checkbox",
									checked: guide_config.lines.enabled,
									onchange: (event) => {
										guide_config.lines.enabled = !!event.target.checked;
										localStorage.setItem(guide_id, JSON.stringify(guide_config));
									},
								}),
							]
						),
						$el(
							"label",
							{
								textContent: "Block: ",
								style: {
									display: "inline-block",
								},
							},
							[
								$el("input", {
									id: id.replaceAll(".", "-") + "-block-text",
									type: "text",
									value: guide_config.block.fillStyle,
									onchange: (event) => {
										guide_config.block.fillStyle = event.target.value;
										localStorage.setItem(guide_id, JSON.stringify(guide_config));
									}
								}),
								$el("input", {
									id: id.replaceAll(".", "-") + '-block-checkbox',
									type: "checkbox",
									checked: guide_config.block.enabled,
									onchange: (event) => {
										guide_config.block.enabled = !!event.target.checked;
										localStorage.setItem(guide_id, JSON.stringify(guide_config));
									},
								}),
							]
						),
					]),
				]);
			}
		});

		// We need to register our hooks after the core snap to grid extension runs
		// Do this from the graph configure function so we still get onNodeAdded calls
		const configure = LGraph.prototype.configure;
		LGraph.prototype.configure = function () {
			// Override drawNode to draw the drop position
			const drawNode = LGraphCanvas.prototype.drawNode;
			LGraphCanvas.prototype.drawNode = function () {
				wrapCallInSettingCheck(() => drawNode.apply(this, arguments));
			};

			// Override node added to add a resize handler to force grid alignment
			const onNodeAdded = app.graph.onNodeAdded;
			app.graph.onNodeAdded = function (node) {
				const r = onNodeAdded?.apply(this, arguments);
				const onResize = node.onResize;
				node.onResize = function () {
					wrapCallInSettingCheck(() => onResize?.apply(this, arguments));
				};
				return r;
			};


			const groupMove = LGraphGroup.prototype.move;
			LGraphGroup.prototype.move = function(deltax, deltay, ignore_nodes) {
				wrapCallInSettingCheck(() => groupMove.apply(this, arguments));
			}

			const canvasDrawGroups = LGraphCanvas.prototype.drawGroups;
			LGraphCanvas.prototype.drawGroups = function (canvas, ctx) {
				wrapCallInSettingCheck(() => canvasDrawGroups.apply(this, arguments));
			}

			const canvasOnGroupAdd = LGraphCanvas.onGroupAdd;
			LGraphCanvas.onGroupAdd = function() {
				wrapCallInSettingCheck(() => canvasOnGroupAdd.apply(this, arguments));
			}

			return configure.apply(this, arguments);
		};

		// Override drag-and-drop behavior to show orthogonal guide lines around selected node(s) and preview of where the node(s) will be placed
		const origDrawNode = LGraphCanvas.prototype.drawNode
		LGraphCanvas.prototype.drawNode = function (node, ctx) {
			const enabled = guide_config.lines.enabled || guide_config.block.enabled;
			if (enabled && app.shiftDown && this.node_dragged && node.id in this.selected_nodes) {
				// discretize the canvas into grid
				let x = LiteGraph.CANVAS_GRID_SIZE * Math.round(node.pos[0] / LiteGraph.CANVAS_GRID_SIZE);
				let y = LiteGraph.CANVAS_GRID_SIZE * Math.round(node.pos[1] / LiteGraph.CANVAS_GRID_SIZE);

				// calculate the width and height of the node
				// (also need to shift the y position of the node, depending on whether the title is visible)
				x -= node.pos[0];
				y -= node.pos[1];
				let w, h;
				if (node.flags.collapsed) {
					w = node._collapsed_width;
					h = LiteGraph.NODE_TITLE_HEIGHT;
					y -= LiteGraph.NODE_TITLE_HEIGHT;
				} else {
					w = node.size[0];
					h = node.size[1];
					let titleMode = node.constructor.title_mode;
					if (titleMode !== LiteGraph.TRANSPARENT_TITLE && titleMode !== LiteGraph.NO_TITLE) {
						h += LiteGraph.NODE_TITLE_HEIGHT;
						y -= LiteGraph.NODE_TITLE_HEIGHT;
					}
				}

				// save the original fill style
				const f = ctx.fillStyle;

				// draw preview for drag-and-drop (rectangle to show where the node will be placed)
				if (guide_config.block.enabled) {
					ctx.fillStyle = guide_config.block.fillStyle;
					ctx.fillRect(x, y, w, h);
				}

				// add guide lines around node (arbitrarily long enough to span most workflows)
				if (guide_config.lines.enabled) {
					const xd = 10000;
					const yd = 10000;
					const thickness = 3;
					ctx.fillStyle = guide_config.lines.fillStyle;
					ctx.fillRect(x - xd, y, 2*xd, thickness);
					ctx.fillRect(x, y - yd, thickness, 2*yd);
					ctx.fillRect(x - xd, y + h, 2*xd, thickness);
					ctx.fillRect(x + w, y - yd, thickness, 2*yd);
				}

				// restore the original fill style
				ctx.fillStyle = f;
			}

			return origDrawNode.apply(this, arguments);
		};
	},
};

app.registerExtension(ext);
