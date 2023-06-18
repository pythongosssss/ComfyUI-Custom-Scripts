import { app } from "/scripts/app.js";

// Adds sub menus for lora directories

app.registerExtension({
	name: "pysssss.LoraSubfolder",
	init() {
		// Big ol' hack to get filtering working in submenus
		// Replace the addItem function with our own that wraps the context of "this" with a proxy
		// That proxy then replaces the constructor with another proxy
		// That proxy then calls the custom ContextMenu that supports filters

		const ctorProxy = new Proxy(LiteGraph.ContextMenu, {
			construct(target, args) {
				return new LiteGraph.ContextMenu(...args);
			},
		});

		const addItem = LiteGraph.ContextMenu.prototype.addItem;
		LiteGraph.ContextMenu.prototype.addItem = function () {
			const proxy = new Proxy(this, {
				get(target, prop) {
					if (prop === "constructor") {
						return ctorProxy;
					}
					return target[prop];
				},
			});
			proxy.__target__ = this;
			return addItem.apply(proxy, arguments);
		};

		// We also need to patch the ContextMenu constructor to unwrap the parent else it fails a LiteGraph type check
		const ctxMenu = LiteGraph.ContextMenu;
		LiteGraph.ContextMenu = function (values, options) {
			if (options?.parentMenu) {
				if (options.parentMenu.__target__) {
					options.parentMenu = options.parentMenu.__target__;
				}
				// Copy the class from the parent so if we are dark we are also dark
				if (options.parentMenu.options?.className === "dark") {
					options.className = "dark";
				}
			}
			ctxMenu.call(this, values, options);
		};
		LiteGraph.ContextMenu.prototype = ctxMenu.prototype;
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
