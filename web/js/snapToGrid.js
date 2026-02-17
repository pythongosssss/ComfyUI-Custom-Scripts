import { app } from "../../../scripts/app.js";

let setting;
const id = "pysssss.SnapToGrid";

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
		setting = app.ui.settings.addSetting({
			id,
			name: "🐍 Always snap to grid",
			defaultValue: false,
			type: "boolean",
			onChange(value) {
				app.canvas.align_to_grid = value;
			},
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

		// keep states related to the drag-and-drop of groups
		let dndState = {
			group: null,
			ctrlDown: false,
		};

		// when ctrl is pressed, we default to the original behavior of smooth translation w/o affecting the nodes in the group
		window.addEventListener("keydown", (e) => {
			// check whether ctrl is pressed
			if (e.ctrlKey) {
				dndState.ctrlDown = true;
			}
		});

		window.addEventListener("keyup", (e) => {
			// check whether ctrl is released
			if (!e.ctrlKey) {
				dndState.ctrlDown = false;
			}
		});

		// capture the drag-and-drop event for groups
		const onMouseDown = LGraphCanvas.prototype.onMouseDown;
		LGraphCanvas.prototype.onMouseDown = function (e) {
			const r = onMouseDown?.apply(this, arguments);
			const group = this.graph.getGroupOnPos(this.graph_mouse[0], this.graph_mouse[1]);
			dndState.group = group;
			return r;
		};

		const onMouseUp = LGraphCanvas.prototype.onMouseUp;
		LGraphCanvas.prototype.onMouseUp = function (e) {
			const r = onMouseUp?.apply(this, arguments);
			dndState.group = null;
			return r;
		};

		// override the drawGroups function to snap the group to the grid
		const origDrawGroups = LGraphCanvas.prototype.drawGroups;
		LGraphCanvas.prototype.drawGroups = function () {		
			const snapToGrid = app.shiftDown || setting?.value;
			const mouseX = this.graph_mouse[0];
			const mouseY = this.graph_mouse[1];
			let shiftX = 0;
			let shiftY = 0;
			if (snapToGrid && dndState.group) {
				// discretize the canvas position to the nearest snappable coordinate,
				// but account for the diff between mouse and group positions
				const g = dndState.group;

				if (this.selected_group_resizing) {
					// snap after redrawing the group during a resize, to avoid flickering title bar
					// TODO: show preview box like we do for nodes
					const r = origDrawGroups.apply(this, arguments);
					// ensure the group bounds are snapped to the grid (e.g., when resizing the group)
					g.size[0] = LiteGraph.CANVAS_GRID_SIZE * Math.round(g.size[0] / LiteGraph.CANVAS_GRID_SIZE);
					g.size[1] = LiteGraph.CANVAS_GRID_SIZE * Math.round(g.size[1] / LiteGraph.CANVAS_GRID_SIZE);
					return r;
				} else {
					// unlike resizing, we snap the group and its nodes before redrawing, to avoid flickering
					shiftX = LiteGraph.CANVAS_GRID_SIZE * Math.round((mouseX - g.pos[0]) / LiteGraph.CANVAS_GRID_SIZE);
					shiftY = LiteGraph.CANVAS_GRID_SIZE * Math.round((mouseY - g.pos[1]) / LiteGraph.CANVAS_GRID_SIZE);

					let x = LiteGraph.CANVAS_GRID_SIZE * Math.round((mouseX) / LiteGraph.CANVAS_GRID_SIZE);
					let y = LiteGraph.CANVAS_GRID_SIZE * Math.round((mouseY) / LiteGraph.CANVAS_GRID_SIZE);
					x -= shiftX;
					y -= shiftY;
	
					// update group position (`move()` does not yield smooth translation across canvas)
					const dx = g.pos[0] - x;
					const dy = g.pos[1] - y;
					g.pos[0] = x;
					g.pos[1] = y;
	
					// translate all nodes in group, translate them by dx, dy
					// but don't do this when ctrl is pressed
					if (!dndState.ctrlDown) {
						for (const node of g._nodes) {
							node.pos[0] -= dx;
							node.pos[1] -= dy;
						}
					}				
				}
			}

			return origDrawGroups.apply(this, arguments);
		};
	},
};

app.registerExtension(ext);
