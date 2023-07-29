import { app } from "/scripts/app.js";

// Adds sub menus for lora directories

app.registerExtension({
	name: "pysssss.LoraSubfolder",
	setup() {
		LiteGraph.ContextMenu["pyssss:ctor"].push(function (values, options) {
			// Copy the class from the parent so if we are dark we are also dark
			if (options.parentMenu?.options?.className === "dark") {
				options.className = "dark";
			}
		});
	},
	async beforeRegisterNodeDef(nodeType, nodeData, app) {
		if (nodeData.name === "LoraLoader") {
			const onNodeCreated = nodeType.prototype.onNodeCreated;
			nodeType.prototype.onNodeCreated = function () {
				const r = onNodeCreated ? onNodeCreated.apply(this, arguments) : undefined;

				const name = this.widgets.find((w) => w.name === "lora_name");
				const callback = name.callback;
				let prevValue = name.value;
				name.callback = function () {
					if (typeof name.value === "object") {
						// Prevent selection of submenus
						name.value = prevValue;
						return;
					}

					prevValue = name.value;
					return callback ? callback.call(this, name.value) : undefined;
				};

				const { values } = name.options;
				const lookup = {
					"": { options: [] },
				};

				// Simple check for the path character
				const splitBy = (navigator.platform || navigator.userAgent).includes("Win") ? "\\" : "/";

				// Split paths into menu structure
				for (const value of values) {
					const split = value.split(splitBy);
					let path = "";
					for (let i = 0; i < split.length; i++) {
						const s = split[i];
						const last = i === split.length - 1;
						if (last) {
							// Leaf node, manually add handler that sets the lora
							lookup[path].options.push({
								title: s,
								callback: () => {
									name.value = value;
									name.callback(value);
									app.graph.setDirtyCanvas(true);
								},
							});
						} else {
							const prevPath = path;
							path += s + splitBy;
							if (!lookup[path]) {
								const sub = {
									title: s,
									submenu: {
										options: [],
										title: s,
									},
								};

								// Add to tree
								lookup[path] = sub.submenu;
								lookup[prevPath].options.push(sub);
							}
						}
					}
				}

				name.options.values = lookup[""].options;

				return r;
			};
		}
	},
});
