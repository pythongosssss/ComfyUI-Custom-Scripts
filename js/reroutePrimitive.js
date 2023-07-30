import { app } from "/scripts/app.js";
import { ComfyWidgets } from "/scripts/widgets.js";

const NODE_ID = "ReroutePrimitive|pysssss";
app.registerExtension({
	name: "pysssss.ReroutePrimitive",
	async beforeRegisterNodeDef(nodeType, nodeData, app) {
		if (nodeData.name === NODE_ID) {
			const configure = nodeType.prototype.configure || LGraphNode.prototype.configure;
			const onConnectionsChange = nodeType.prototype.onConnectionsChange;
			const graphConfigure = LGraph.prototype.configure;
			const onAdded = nodeType.prototype.onAdded;

			nodeType.title_mode = LiteGraph.NO_TITLE;

			function hasAnyInput(node) {
				for (const input of node.inputs) {
					if (input.link) {
						return true;
					}
				}
				return false;
			}

			// On graph configure, fire onGraphConfigured to create widgets
			LGraph.prototype.configure = function () {
				const r = graphConfigure.apply(this, arguments);
				for (const n of app.graph._nodes) {
					if (n.type === NODE_ID) {
						n.onGraphConfigured();
					}
				}

				return r;
			};

			// Remove input text
			nodeType.prototype.onAdded = function () {
				onAdded?.apply(this, arguments);
				this.inputs[0].label = "";
				this.outputs[0].label = "value";
				this.setSize(this.computeSize());
			};

			// Restore any widgets
			nodeType.prototype.onGraphConfigured = function () {
				if (hasAnyInput(this)) return;

				const outputNode = this.getFirstReroutedOutput(0);
				if (outputNode) {
					this.checkPrimitiveWidget(outputNode);
				}
			};

			// Check if we need to create (or remove) a widget on the node
			nodeType.prototype.checkPrimitiveWidget = function ({ node, link }) {
				let widgetType = link.type;
				let targetLabel = widgetType;
				const input = node.inputs[link.target_slot];
				if (input.widget?.config?.[0] instanceof Array) {
					targetLabel = input.widget.name;
					widgetType = "COMBO";
				}

				if (widgetType in ComfyWidgets) {
					if (!this.widgets?.length) {
						let config = [link.type, {}];
						if (input.widget) {
							config = input.widget.config;
						}
						ComfyWidgets[widgetType](this, "value", config);
					}
				} else if (this.widgets) {
					this.widgets.length = 0;
				}

				return targetLabel;
			};

			// Finds all input nodes from the current reroute
			nodeType.prototype.getReroutedInputs = function (slot) {
				let nodes = [{ node: this }];
				let node = this;
				while (node?.type === NODE_ID) {
					const input = node.inputs[slot];
					if (input.link) {
						const link = app.graph.links[input.link];
						node = app.graph.getNodeById(link.origin_id);
						slot = link.origin_slot;
						nodes.push({
							node,
							link,
						});
					} else {
						node = null;
					}
				}

				return nodes;
			};

			// Finds the first non reroute output node down the chain
			nodeType.prototype.getFirstReroutedOutput = function (slot) {
				const links = this.outputs[slot].links;
				if (!links) return null;

				const search = [];
				for (const l of links) {
					const link = app.graph.links[l];
					if (!link) continue;

					const node = app.graph.getNodeById(link.target_id);
					if (node.type !== NODE_ID) {
						return { node, link };
					}
					search.push({ node, link });
				}

				for (const { link, node } of search) {
					const r = node.getFirstReroutedOutput(link.target_slot);
					if (r) {
						return r;
					}
				}
			};

			// Update the type of all reroutes in a chain
			nodeType.prototype.changeRerouteType = function (slot, type, label) {
				const color = LGraphCanvas.link_type_colors[type];
				const output = this.outputs[slot];
				this.inputs[slot].label = " ";
				output.label = label || (type === "*" ? "value" : type);
				output.type = type;

				// Process all linked outputs
				for (const linkId of output.links || []) {
					const link = app.graph.links[linkId];
					if (!link) continue;
					link.color = color;
					const node = app.graph.getNodeById(link.target_id);
					if (node.changeRerouteType) {
						// Recursively update reroutes
						node.changeRerouteType(link.target_slot, type, label);
					} else {
						// Validate links to 'real' nodes
						const theirType = node.inputs[link.target_slot].type;
						if (theirType !== type && theirType !== "*") {
							node.disconnectInput(link.target_slot);
						}
					}
				}

				if (this.inputs[slot].link) {
					const link = app.graph.links[this.inputs[slot].link];
					if (link) link.color = color;
				}
			};

			// Override configure so we can flag that we are configuring to avoid link validation breaking
			let configuring = false;
			nodeType.prototype.configure = function () {
				configuring = true;
				const r = configure?.apply(this, arguments);
				configuring = false;

				return r;
			};

			nodeType.prototype.onConnectionsChange = function (type, _, connected, link_info) {
				// If configuring treat everything as OK as links may not be set by litegraph yet
				if (configuring) return;

				const isInput = type === LiteGraph.INPUT;
				const slot = isInput ? link_info.target_slot : link_info.origin_slot;

				let targetLabel = null;
				let targetNode = null;
				let targetType = "*";
				let targetSlot = slot;

				const inputPath = this.getReroutedInputs(slot);
				const rootInput = inputPath[inputPath.length - 1];
				const outputNode = this.getFirstReroutedOutput(slot);
				if (rootInput.node.type === NODE_ID) {
					// Our input node is a reroute, so see if we have an output
					if (outputNode) {
						targetType = outputNode.link.type;
					} else if (rootInput.node.widgets) {
						rootInput.node.widgets.length = 0;
					}
					targetNode = rootInput;
					targetSlot = rootInput.link?.target_slot ?? slot;
				} else {
					// We have a real input, so we want to use that type
					targetNode = inputPath[inputPath.length - 2];
					targetType = rootInput.node.outputs[rootInput.link.origin_slot].type;
					targetSlot = rootInput.link.target_slot;
				}

				if (this.widgets && inputPath.length > 1) {
					// We have an input node so remove our widget
					this.widgets.length = 0;
				}

				if (outputNode) {
					// We have an output, check if we need to create a widget
					targetLabel = rootInput.node.checkPrimitiveWidget(outputNode);
				}

				// Trigger an update of the type to all child nodes
				targetNode.node.changeRerouteType(targetSlot, targetType, targetLabel);

				return onConnectionsChange?.apply(this, arguments);
			};

			// When collapsed fix the size to just the dot
			const computeSize = nodeType.prototype.computeSize || LGraphNode.prototype.computeSize;
			nodeType.prototype.computeSize = function () {
				const r = computeSize.apply(this, arguments);
				if (this.flags?.collapsed) {
					return [1, 25];
				} else if (this.widgets?.length) {
					return r;
				} else {
					let w = 75;
					if (this.outputs?.[0]?.label) {
						const t = LiteGraph.NODE_TEXT_SIZE * this.outputs[0].label.length * 0.6 + 30;
						if (t > w) {
							w = t;
						}
					}
					return [w, r[1]];
				}
			};

			// On collapse shrink the node to just a dot
			const collapse = nodeType.prototype.collapse || LGraphNode.prototype.collapse;
			nodeType.prototype.collapse = function () {
				collapse.apply(this, arguments);
				this.setSize(this.computeSize());
				requestAnimationFrame(() => {
					this.setDirtyCanvas(true, true);
				});
			};

			// Shift the bounding area up slightly as LiteGraph miscalculates it for collapsed nodes
			nodeType.prototype.onBounding = function (area) {
				if (this.flags?.collapsed) {
					area[1] -= 15;
				}
			};
		}
	},
});
