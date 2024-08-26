import { app } from "../../../scripts/app.js";

// Adds lock/unlock menu item for nodes + groups to prevent moving / resizing them

const LOCKED = Symbol();

function lockArray(arr, isLocked) {
	if (!Array.isArray(arr)) return; // Prevent crash on es6
	const v = [];

	for (let i = 0; i < 2; i++) {
		v[i] = arr[i];

		Object.defineProperty(arr, i, {
			get() {
				return v[i];
			},
			set(value) {
				if (!isLocked()) {
					v[i] = value;
				}
			},
		});
	}
}

app.registerExtension({
	name: "pysssss.Locking",
	init() {
		function lockGroup(node) {
			node[LOCKED] = true;
		}

		// Add the locked flag to serialization
		const serialize = LGraphGroup.prototype.serialize;
		LGraphGroup.prototype.serialize = function () {
			const o = serialize.apply(this, arguments);
			o.locked = !!this[LOCKED];
			return o;
		};

		// On initial configure lock group if required
		const configure = LGraphGroup.prototype.configure;
		LGraphGroup.prototype.configure = function (o) {
			configure.apply(this, arguments);
			if (o.locked) {
				lockGroup(this);
			}
		};

		// Allow click through locked groups
		const getGroupOnPos = LGraph.prototype.getGroupOnPos;
		LGraph.prototype.getGroupOnPos = function () {
			const r = getGroupOnPos.apply(this, arguments);
			if (r && r[LOCKED] && !new Error().stack.includes("processContextMenu")) return null;
			return r;
		};

		// Add menu options for lock/unlock
		const getGroupMenuOptions = LGraphCanvas.prototype.getGroupMenuOptions;
		LGraphCanvas.prototype.getGroupMenuOptions = function (node) {
			const opts = getGroupMenuOptions.apply(this, arguments);

			opts.unshift(
				node[LOCKED]
					? {
							content: "Unlock",
							callback: () => {
								delete node[LOCKED];
							},
					  }
					: {
							content: "Lock",
							callback: () => lockGroup(node),
					  },
				null
			);

			return opts;
		};
	},
	setup() {
		const drawNodeShape = LGraphCanvas.prototype.drawNodeShape;
		LGraphCanvas.prototype.drawNodeShape = function (node, ctx, size, fgcolor, bgcolor, selected, mouse_over) {
			const res = drawNodeShape.apply(this, arguments);

			if (node[LOCKED]) {
				ctx.fillText("🔒", node.getBounding()[2] - 20, -10);
			}

			return res;
		};
	},
	async beforeRegisterNodeDef(nodeType) {
		const nodesArray = (nodes) => {
			if (nodes) {
				if (nodes instanceof Array) {
					return nodes;
				}
				return [nodes];
			}
			return Object.values(app.canvas.selected_nodes);
		};
		function unlockNode(nodes) {
			nodes = nodesArray(nodes);
			for (const node of nodes) {
				delete node[LOCKED];
			}
			app.graph.setDirtyCanvas(true, false);
		}
		function lockNode(nodes) {
			nodes = nodesArray(nodes);
			for (const node of nodes) {
				if (node[LOCKED]) continue;

				node[LOCKED] = true;
				// Same hack as above
				lockArray(node.pos, () => !!node[LOCKED]);

				// Size is set by both replacing the value and setting individual values
				// So define a new property that can prevent reassignment
				const sz = [node.size[0], node.size[1]];
				Object.defineProperty(node, "size", {
					get() {
						return sz;
					},
					set(value) {
						if (!node[LOCKED]) {
							sz[0] = value[0];
							sz[1] = value[1];
						}
					},
				});
				// And then lock each element if required
				lockArray(sz, () => !!node[LOCKED]);
			}

			app.graph.setDirtyCanvas(true, false);
		}

		// Add menu options for lock/unlock
		const getExtraMenuOptions = nodeType.prototype.getExtraMenuOptions;
		nodeType.prototype.getExtraMenuOptions = function (_, options) {
			const r = getExtraMenuOptions ? getExtraMenuOptions.apply(this, arguments) : undefined;

			options.splice(
				options.findIndex((o) => o?.content === "Properties") + 1,
				0,
				null,
				this[LOCKED]
					? {
							content: "Unlock",
							callback: () => {
								unlockNode();
							},
					  }
					: {
							content: "Lock",
							callback: () => lockNode(),
					  }
			);

			return r;
		};

		// Add the locked flag to serialization
		const onSerialize = nodeType.prototype.onSerialize;
		nodeType.prototype.onSerialize = function (o) {
			if (onSerialize) {
				onSerialize.apply(this, arguments);
			}
			o.locked = this[LOCKED];
		};

		// On initial configure lock node if required
		const onConfigure = nodeType.prototype.onConfigure;
		nodeType.prototype.onConfigure = function (o) {
			if (onConfigure) {
				onConfigure.apply(this, arguments);
			}
			if (o.locked) {
				lockNode(this);
			}
		};
	},
});
