import { app } from "/scripts/app.js";

// Allows you to manage preset tags for e.g. common negative prompt

app.registerExtension({
	name: "pysssss.PresetText",
	registerCustomNodes() {
		class PresetTextNode {
			constructor() {
				this.isVirtualNode = true;

				const id = "pysssss.PresetText.Presets";
				const getPresets = () => {
					let items;
					try {
						items = JSON.parse(localStorage.getItem(id));
					} catch (error) {}
					if (!items || !items.length) {
						items = [
							{ name: "default negative", value: "worst quality" },
						];
					}
					return items;
				};

				this.addOutput("text", "STRING");

				let presets = getPresets();
				const widget = this.addWidget("combo", "value", presets[0].name, () => {}, {
					values: presets.map((p) => p.name),
				});
				this.addWidget("button", "Manage", "Manage", () => {
					const container = document.createElement("div");
					Object.assign(container.style, {
						display: "grid",
						gridTemplateColumns: "1fr 1fr",
						gap: "10px",
					});

					const addNew = document.createElement("button");
					addNew.textContent = "Add New";
					addNew.classList.add("pysssss-presettext-addnew");
					Object.assign(addNew.style, {
						fontSize: "13px",
						gridColumn: "1 / 3",
						color: "dodgerblue",
						width: "auto",
						textAlign: "center",
					});
					addNew.onclick = () => {
						addRow({ name: "", value: "" });
					};
					container.append(addNew);

					function addRow(p) {
						const name = document.createElement("input");
						const nameLbl = document.createElement("label");
						name.value = p.name;
						nameLbl.textContent = "Name:";
						nameLbl.append(name);

						const value = document.createElement("input");
						const valueLbl = document.createElement("label");
						value.value = p.value;
						valueLbl.textContent = "Value:";
						valueLbl.append(value);

						addNew.before(nameLbl, valueLbl);
					}
					for (const p of presets) {
						addRow(p);
					}

					const help = document.createElement("span");
					help.textContent = "To remove a preset set the name or value to blank";
					help.style.gridColumn = "1 / 3";
					container.append(help);

					dialog.show("");
					dialog.textElement.append(container);
				});

				const dialog = new app.ui.dialog.constructor();
				dialog.element.classList.add("comfy-settings");

				const closeButton = dialog.element.querySelector("button");
				closeButton.textContent = "CANCEL";
				const saveButton = document.createElement("button");
				saveButton.textContent = "SAVE";
				saveButton.onclick = function () {
					const inputs = dialog.element.querySelectorAll("input");
					const p = [];
					for (let i = 0; i < inputs.length; i += 2) {
						const n = inputs[i];
						const v = inputs[i + 1];
						if (!n.value.trim() || !v.value.trim()) {
							continue;
						}
						p.push({ name: n.value, value: v.value });
					}

					widget.options.values = p.map((p) => p.name);
					if (!widget.options.values.includes(widget.value)) {
						widget.value = widget.options.values[0];
					}

					presets = p;
					localStorage.setItem(id, JSON.stringify(presets));

					dialog.close();
				};

				closeButton.before(saveButton);

				this.applyToGraph = function (workflow) {
					// For each output link copy our value over the original widget value
					if (this.outputs[0].links && this.outputs[0].links.length) {
						for (const l of this.outputs[0].links) {
							debugger;
							const link_info = app.graph.links[l];
							const outNode = app.graph.getNodeById(link_info.target_id);
							const outIn = outNode && outNode.inputs && outNode.inputs[link_info.target_slot];
							if (outIn.widget) {
								const w = outNode.widgets.find((w) => w.name === outIn.widget);
								if (w) {
									w.value = presets.find((p) => p.name === widget.value).value;
								}
							}
						}
					}
				};
			}
		}

		LiteGraph.registerNodeType(
			"PresetText",
			Object.assign(PresetTextNode, {
				title: "PresetText",
			})
		);

		PresetTextNode.category = "utils";
	},
});
