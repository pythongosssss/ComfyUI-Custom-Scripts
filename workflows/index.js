import { app } from "/scripts/app.js";
import { $el } from "/scripts/ui.js";

// Adds workflow management
// Original implementation by https://github.com/i-h4x
// Thanks for permission to reimplement as an extension

const style = `
#comfy-save-button, #comfy-load-button {
   position: relative;
   overflow: hidden;
}
.pysssss-workflow-arrow {
   position: absolute;
   top: 0;
   bottom: 0;
   right: 0;
   font-size: 12px;
   display: flex;
   align-items: center;
   width: 24px;
   justify-content: center;
   background: rgba(255,255,255,0.1);
}
.pysssss-workflow-arrow:after {
   content: "▼";
}
.pysssss-workflow-arrow:hover {
   filter: brightness(1.6);
   background-color: var(--comfy-menu-bg);
}
.pysssss-workflow-load .litemenu-entry:not(.has_submenu):before,
.pysssss-workflow-load ~ .litecontextmenu .litemenu-entry:not(.has_submenu):before {
	content: "🎛️";
	padding-right: 5px;
}
.pysssss-workflow-load .litemenu-entry.has_submenu:before,
.pysssss-workflow-load ~ .litecontextmenu .litemenu-entry.has_submenu:before {
	content: "📂";
	padding-right: 5px;
	position: relative;
	top: -1px;
}
.pysssss-workflow-popup ~ .litecontextmenu {
	transform: scale(1.3);
}
`;

async function getWorkflows() {
	const response = await fetch("/pysssss/workflows", { cache: "no-store" });
	return await response.json();
}

async function getWorkflow(name) {
	const response = await fetch(`/pysssss/workflows/${encodeURIComponent(name)}`, { cache: "no-store" });
	return await response.json();
}

async function saveWorkflow(name, workflow, overwrite) {
	try {
		const response = await fetch("/pysssss/workflows", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ name, workflow, overwrite }),
		});
		if (response.status === 201) {
			return true;
		}
		if (response.status === 409) {
			return false;
		}
		throw new Error(response.statusText);
	} catch (error) {
		console.error(error);
	}
}

class PysssssWorkflows {
	async load() {
		this.workflows = await getWorkflows();
		this.loadMenu.style.display = this.workflows.length ? "flex" : "none";
	}

	constructor() {
		function buildMenu(workflows) {
			var menu = [];
			var directories = new Map();
			for (const workflow of workflows) {
				var path = workflow.split("/");
				var parent = menu;
				var currentPath = "";
				for (var i = 0; i < path.length - 1; i++) {
					currentPath += "/" + path[i];
					var newParent = directories.get(currentPath);
					if (!newParent) {
						newParent = {
							title: path[i],
							has_submenu: true,
							submenu: {
								options: [],
							},
						};
						parent.push(newParent);
						newParent = newParent.submenu.options;
						directories.set(currentPath, newParent);
					}
					parent = newParent;
				}
				parent.push({
					title: path[path.length - 1],
					callback: async () => {
						const json = await getWorkflow(workflow);
						app.loadGraphData(json);
					},
				});
			}
			return menu;
		}

		function addWorkflowMenu(type, getOptions) {
			return $el("div.pysssss-workflow-arrow", {
				parent: document.getElementById(`comfy-${type}-button`),
				onclick: (e) => {
					e.preventDefault();
					e.stopPropagation();

					LiteGraph.closeAllContextMenus();
					const menu = new LiteGraph.ContextMenu(
						getOptions(),
						{
							event: e,
							scale: 1.3,
						},
						window
					);
					menu.root.classList.add("pysssss-workflow-popup");
					menu.root.classList.add(`pysssss-workflow-${type}`);
				},
			});
		}

		this.loadMenu = addWorkflowMenu("load", () => buildMenu(this.workflows || []));
		addWorkflowMenu("save", () => {
			return [
				{
					title: "Save as",
					callback() {
						let filename = prompt("Enter filename", "workflow");
						if (filename) {
							if (!filename.toLowerCase().endsWith(".json")) {
								filename += ".json";
							}

							const json = JSON.stringify(app.graph.serialize(), null, 2); // convert the data to a JSON string
							const blob = new Blob([json], { type: "application/json" });
							const url = URL.createObjectURL(blob);
							const a = $el("a", {
								href: url,
								download: filename,
								style: { display: "none" },
								parent: document.body,
							});
							a.click();
							setTimeout(function () {
								a.remove();
								window.URL.revokeObjectURL(url);
							}, 0);
						}
					},
				},
				{
					title: "Save to workflows",
					callback: async () => {
						const name = prompt("Enter filename", "workflow");
						if (name) {
							const data = app.graph.serialize();
							if (!(await saveWorkflow(name, data))) {
								if (confirm("A workspace with this name already exists, do you want to overwrite it?")) {
									await saveWorkflow(name, app.graph.serialize(), true);
								} else {
									return;
								}
							}
							await this.load();
						}
					},
				},
			];
		});
		this.load();
	}
}

app.registerExtension({
	name: "pysssss.Workflows",
	init() {
		$el("style", {
			textContent: style,
			parent: document.head,
		});
	},
	setup() {
		const workflows = new PysssssWorkflows();
		const refreshComboInNodes = app.refreshComboInNodes;
		app.refreshComboInNodes = function () {
			workflows.load();
			refreshComboInNodes.apply(this, arguments);
		};
	},
});
