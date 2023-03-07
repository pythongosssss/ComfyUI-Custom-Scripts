import { app } from "/scripts/app.js";

// Inverts the scrolling of context menus so down scrolls down!

const ctxMenu = LiteGraph.ContextMenu;
app.registerExtension({
	name: "pysssss.InvertMenuScrolling",
	init() {
		const replace = () => {
			LiteGraph.ContextMenu = function (values, options) {
				options = options || {};
				if (options.scroll_speed) {
					options.scroll_speed *= -1;
				} else {
					options.scroll_speed = -0.1;
				}
				return ctxMenu.call(this, values, options);
			};
			LiteGraph.ContextMenu.prototype = ctxMenu.prototype;
		};
		// If the UI has setting support then add a setting, else just enable it
		if (app.ui.settings) {
			app.ui.settings.addSetting({
				id: "pysssss.InvertMenuScrolling",
				name: "Invert Menu Scrolling",
				type: "boolean",
				defaultValue: true,
				onChange(value) {
					if (value) {
						replace();
					} else {
						LiteGraph.ContextMenu = ctxMenu;
					}
				},
			});
		} else {
			replace();
		}
	},
});
