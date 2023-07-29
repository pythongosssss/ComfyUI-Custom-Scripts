import { app } from "/scripts/app.js";
app.registerExtension({
	name: "pysssss.ContextMenuHook",
	init() {
		// Big ol' hack to get allow customizing the context menu
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
			let el = addItem.apply(proxy, arguments);
			const callbacks = LiteGraph.ContextMenu["pyssss:addItem"];
			for (const cb of callbacks) {
				el = cb(el, this, arguments) || el;
			}
			return el;
		};

		// We also need to patch the ContextMenu constructor to unwrap the parent else it fails a LiteGraph type check
		const ctxMenu = LiteGraph.ContextMenu;
		LiteGraph.ContextMenu = function (values, options) {
			if (options?.parentMenu) {
				if (options.parentMenu.__target__) {
					options.parentMenu = options.parentMenu.__target__;
				}
			}
			const callbacks = LiteGraph.ContextMenu["pyssss:ctor"];
			for (const cb of callbacks) {
				cb(values, options);
			}
			ctxMenu.call(this, values, options);
		};
		LiteGraph.ContextMenu.prototype = ctxMenu.prototype;
		LiteGraph.ContextMenu["pyssss:ctor"] = [];
		LiteGraph.ContextMenu["pyssss:addItem"] = [];
	},
});
