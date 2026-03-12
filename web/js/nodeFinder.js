import { app } from "../../../scripts/app.js";
import { api } from "../../../scripts/api.js";

app.registerExtension({
	name: "pysssss.NodeFinder",
	setup() {
		let followExecution = false;
		let focusTimeoutId = null;

		const findNodePath = (targetNode, graph = app.graph, path =[]) => {
			for (const node of graph.nodes) {
				if (node === targetNode) {
					return [...path, node.graph];
				}
				if (node.subgraph) {
					const found = findNodePath(targetNode, node.subgraph, [...path, node.graph]);
					if (found) {
						return found;
					}
				}
			}
			return null;
		};

		const focusNode = (node) => {
			if (!node) return;

			const centerOnNodeAction = () => {
				app.canvas.centerOnNode(node);
			};

			if (app.canvas.graph !== node.graph) {
				const path = findNodePath(node);
				if (path) {
					app.canvas.setGraph(app.graph);
					for (let i = 1; i < path.length; i++) {
						app.canvas.openSubgraph(path[i]);
					}
				}
				setTimeout(centerOnNodeAction, 0);
			} else {
				centerOnNodeAction();
			}
		};

		const findNodeByExecutionId = (id) => {
			if (!id) return null;
			const path = String(id).split(":");
			let currentGraph = app.graph;
			let node = null;

			for (let i = 0; i < path.length; i++) {
				node = currentGraph.getNodeById(Number(path[i]));
				if (!node) return null;
				if (i < path.length - 1) {
					if (!node.subgraph) return null;
					currentGraph = node.subgraph;
				}
			}
			return node;
		};

		const centerExecutionNode = (id) => {
			if (!followExecution || !id) return;

			if (focusTimeoutId) {
				clearTimeout(focusTimeoutId);
			}

			focusTimeoutId = setTimeout(() => {
				focusNode(findNodeByExecutionId(id));
				focusTimeoutId = null;
			}, 50); 
		};

		api.addEventListener("executing", ({ detail }) => centerExecutionNode(detail));

		const origDrawNode = LGraphCanvas.prototype.drawNode;
		LGraphCanvas.prototype.drawNode = function (node, ctx) {
			origDrawNode.apply(this, arguments);

			let isRunning = false;
			if (app.runningNodeId) {
				const runningIdPath = String(app.runningNodeId).split(":");
				if (Number(runningIdPath[runningIdPath.length - 1]) === node.id) {
					if (findNodeByExecutionId(app.runningNodeId) === node) {
						isRunning = true;
					}
				}
			}

			const isError = (node.color === "#FF0000" || node.bgcolor === "#FF0000" || node.has_errors);

			if (isRunning || isError) {
				ctx.save();
				ctx.lineWidth = 6;
				ctx.strokeStyle = isError ? "#FF0000" : "#00FF00";
				
				const titleHeight = LiteGraph.NODE_TITLE_HEIGHT || 30;
				const isCollapsed = node.flags && node.flags.collapsed;
				
				// If collapsed, only frame the title bar. Otherwise, frame the whole node.
				const boxWidth = node._collapsed_width || node.size[0];
				const boxHeight = isCollapsed ? titleHeight : node.size[1] + titleHeight;

				if (ctx.roundRect) {
					ctx.beginPath();
					ctx.roundRect(0, -titleHeight, boxWidth, boxHeight, 8);
					ctx.stroke();
				} else {
					ctx.strokeRect(0, -titleHeight, boxWidth, boxHeight);
				}
				ctx.restore();
			}
		};

		const buildGraphMenu = (graph, activeGraph) => {
			const nodes = graph._nodes || graph.nodes ||[];
			const types = {};
			const subgraphs =[];

			for (const n of nodes) {
				if (n.subgraph) {
					subgraphs.push(n);
				} else {
					if (!types[n.type]) types[n.type] = [];
					types[n.type].push(n);
				}
			}

			const options =[];

			subgraphs.sort((a, b) => a.pos[0] - b.pos[0]).forEach((n) => {
				const isCurrentGraph = n.subgraph === activeGraph;
				const prefix = isCurrentGraph ? "* " : "";
				const subOptions =[
					{ content: `↳ Go to this Subgraph node`, callback: () => focusNode(n) },
					null,
					...buildGraphMenu(n.subgraph, activeGraph)
				];

				options.push({
					content: `${prefix}[SUBGRAPH] (#${n.id}) ${n.getTitle()}`,
					has_submenu: true,
					submenu: { options: subOptions }
				});
			});

			Object.keys(types).sort().forEach((t) => {
				options.push({
					content: t,
					has_submenu: true,
					submenu: {
						options: types[t]
							.sort((a, b) => a.pos[0] - b.pos[0])
							.map((n) => ({
								content: `${n.getTitle()} - #${n.id} (${Math.round(n.pos[0])}, ${Math.round(n.pos[1])})`,
								callback: () => focusNode(n),
							})),
					},
				});
			});

			return options;
		};

		const origGetCanvasMenuOptions = LGraphCanvas.prototype.getCanvasMenuOptions;
		LGraphCanvas.prototype.getCanvasMenuOptions = function () {
			const options = origGetCanvasMenuOptions.apply(this, arguments);

			options.push(null, {
				content: followExecution ? "Stop following execution" : "Follow execution",
				callback: () => {
					if ((followExecution = !followExecution)) {
						centerExecutionNode(app.runningNodeId);
					}
				},
			});

			if (app.runningNodeId) {
				options.push({
					content: "Show executing node",
					callback: () => focusNode(findNodeByExecutionId(app.runningNodeId)),
				});
			}

			const isRootActive = app.canvas.graph === app.graph;
			options.push({
				content: `${isRootActive ? "* " : ""}Go to node`,
				has_submenu: true,
				submenu: { options: buildGraphMenu(app.graph, app.canvas.graph) },
			});

			return options;
		};
	},
});
