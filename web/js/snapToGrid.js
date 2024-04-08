import { app } from "../../../scripts/app.js";

let setting;
const id = "pysssss.SnapToGrid";
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
				if (setting?.value) {
					const shift = app.shiftDown;
					app.shiftDown = true; 
					const r = drawNode.apply(this, arguments);
					app.shiftDown = shift;
					return r;
				}
				return drawNode.apply(this, arguments);
			};

			// Override node added to add a resize handler to force grid alignment
			const onNodeAdded = app.graph.onNodeAdded;
			app.graph.onNodeAdded = function (node) {
				const r = onNodeAdded?.apply(this, arguments);
				const onResize = node.onResize;
				node.onResize = function () {
					if (setting?.value) {
						const shift = app.shiftDown;
						app.shiftDown = true;
						const r = onResize?.apply(this, arguments);
						app.shiftDown = shift;
						return r;
					}
					return onResize?.apply(this, arguments);
				};
				return r;
			};

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
			dndState.origMouseX = this.graph_mouse[0];
			dndState.origMouseY = this.graph_mouse[1];
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
			if (snapToGrid && !dndState.ctrlDown && dndState.group) {
				// discretize the canvas position to the nearest snappable coordinate,
				// but account for the diff between mouse and group positions
				const g = dndState.group;
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
				for (const node of g._nodes) {
					node.pos[0] -= dx;
					node.pos[1] -= dy;
				}

				// ensure the group bounds are snapped to the grid (e.g., when resizing the group)
				// caveat: this may resize the group to snap the bounds to the grid, even if the group is not being resized but only being moved
				g.size[0] = LiteGraph.CANVAS_GRID_SIZE * Math.round(g.size[0] / LiteGraph.CANVAS_GRID_SIZE);
				g.size[1] = LiteGraph.CANVAS_GRID_SIZE * Math.round(g.size[1] / LiteGraph.CANVAS_GRID_SIZE);

			}

			return origDrawGroups.apply(this, arguments);
		};
	},
};

app.registerExtension(ext);
