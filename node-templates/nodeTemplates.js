import { app } from "/scripts/app.js";

// Adds the ability to save and add multiple nodes as a template
// To save: 
// Select multiple nodes (ctrl + drag or shift click)
// Right click the canvas
// Save Node Template -> give it a name
//
// To add:
// Right click the canvas
// Node templates -> click the one to add
//
// To delete/rename:
// Right click the canvas
// Node templates -> Manage

const id = "pysssss.NodeTemplates";
app.registerExtension({
	name: id,
	setup() {
		let templates;

		const dialog = new app.ui.dialog.constructor();
		dialog.element.classList.add("comfy-settings");

		const closeButton = dialog.element.querySelector("button");
		closeButton.textContent = "CANCEL";
		const saveButton = document.createElement("button");
		saveButton.textContent = "SAVE";
		saveButton.onclick = function () {
			// Find all visible inputs and save them as our new list
			const inputs = dialog.element.querySelectorAll("input");
			const updated = [];

			for (let i = 0; i < inputs.length; i++) {
				const input = inputs[i];
				if (input.parentElement.style.display !== "none") {
					const t = templates[i];
					t.name = input.value.trim() || input.getAttribute("data-name");
					updated.push(t);
				}
			}
			templates = updated;
			localStorage.setItem(id, JSON.stringify(templates));

			dialog.close();
		};
		closeButton.before(saveButton);

		const orig = LGraphCanvas.prototype.getCanvasMenuOptions;
		LGraphCanvas.prototype.getCanvasMenuOptions = function () {
			const options = orig.apply(this, arguments);

			let separated = false;
			templates = localStorage.getItem(id);
			if (templates) {
				templates = JSON.parse(templates);
			} else {
				templates = [];
			}

			// If we have nodes selected then show the save menu option
			if (Object.keys(app.canvas.selected_nodes || {}).length) {
				separated = true;
				options.push(null);

				options.push({
					content: `Save Node Template`,
					callback: () => {
						const name = prompt("Enter name");
						if (!name) return;

						// Use the copy to clipboard function, but store and restore the current clipboard
						const oldClip = localStorage.getItem("litegrapheditor_clipboard");
						app.canvas.copyToClipboard();
						const newClip = localStorage.getItem("litegrapheditor_clipboard");

						templates.push({ name, data: newClip });

						localStorage.setItem(id, JSON.stringify(templates));
						localStorage.setItem("litegrapheditor_clipboard", oldClip);
					},
				});
			}

			// Map each of our templates to menu items
			const subItems = templates.map((t) => ({
				content: t.name,
				callback: () => {
					// Use the paste function, store and restore the current clipboard
					const oldClip = localStorage.getItem("litegrapheditor_clipboard");
					localStorage.setItem("litegrapheditor_clipboard", t.data);
					app.canvas.pasteFromClipboard();
					localStorage.setItem("litegrapheditor_clipboard", oldClip);
				},
			}));

			if (subItems.length) {
				if (!separated) {
					options.push(null);
				}

				subItems.push(null, {
					content: "Manage",
					callback: () => {
						// Build simple manage UI
						dialog.show("");
						const container = document.createElement("div");
						Object.assign(container.style, {
							display: "grid",
							gridTemplateColumns: "1fr auto",
							gap: "5px",
						});

						function addRow(p) {
							const name = document.createElement("input");
							const nameLbl = document.createElement("label");
							name.setAttribute("data-name", p.name);
							name.value = p.name;
							nameLbl.textContent = "Name:";
							nameLbl.append(name);

							const del = document.createElement("button");
							del.textContent = "Delete";
							Object.assign(del.style, {
								fontSize: "12px",
								background: "#fff",
								color: "red",
								fontWeight: "normal",
							});
							del.onclick = () => {
								name.value = "";
								nameLbl.style.display = "none";
								del.style.display = "none";
							};

							container.append(nameLbl);
							container.append(del);
						}

						for (const t of templates) {
							addRow(t);
						}
						dialog.textElement.append(container);
					},
				});

				options.push({
					content: "Node Templates",
					submenu: {
						options: subItems,
					},
				});
			}

			return options;
		};
	},
});
