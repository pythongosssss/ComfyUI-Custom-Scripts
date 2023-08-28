import { app } from "../../../scripts/app.js";
import { ComfyWidgets } from "../../../scripts/widgets.js";
import { api } from "../../../../scripts/api.js";
import { $el, ComfyDialog } from "../../../../scripts/ui.js";
import { TextAreaAutoComplete } from "./common/autocomplete.js";
import { ModelInfoDialog } from "./common/modelInfoDialog.js";

async function getCustomWords() {
	const resp = await api.fetchApi("/pysssss/autocomplete", { cache: "no-store" });
	if (resp.status === 200) {
		return await resp.text();
	}
	return undefined;
}

async function addCustomWords(text) {
	if (!text) {
		text = await getCustomWords();
	}
	if (text) {
		TextAreaAutoComplete.updateWords(
			"pysssss.customwords",
			text.split("\n").reduce((p, n) => {
				n = n.trim();
				const pos = n.lastIndexOf(",");
				let priority = undefined;
				if (pos > -1) {
					const v = parseInt(n.substr(pos + 1).trim());
					if (!isNaN(v)) {
						priority = v;
						n = n.substr(0, pos).trim();
					}
				}
				p[n] = { text: n, priority };
				return p;
			}, {})
		);
	}
}

class EmbeddingInfoDialog extends ModelInfoDialog {
	async addInfo() {
		super.addInfo();
		const info = await this.addCivitaiInfo();
		if (info) {
			$el("div", {
				parent: this.content,
				innerHTML: info.description,
				style: {
					maxHeight: "250px",
					overflow: "auto",
				},
			});
		}
	}
}

class CustomWordsDialog extends ComfyDialog {
	async show() {
		const text = await getCustomWords();
		this.words = $el("textarea", {
			textContent: text,
			style: {
				width: "70vw",
				height: "70vh",
			},
		});
		super.show(
			$el("div", [
				$el("h2", {
					textContent: "Custom Autocomplete Words",
					style: {
						color: "#fff",
						marginTop: 0,
						textAlign: "center",
						fontFamily: "sans-serif",
					},
				}),
				this.words,
			])
		);
	}

	createButtons() {
		const btns = super.createButtons();
		const save = $el("button", {
			type: "button",
			textContent: "Save",
			onclick: async (e) => {
				try {
					const res = await api.fetchApi("/pysssss/autocomplete", { method: "POST", body: this.words.value });
					if (res.status !== 200) {
						throw new Error("Error saving: " + res.status + " " + res.statusText);
					}
					save.textContent = "Saved!";
					addCustomWords(this.words.value);
					setTimeout(() => {
						save.textContent = "Save";
					}, 500);
				} catch (error) {
					alert("Error saving word list!");
					console.error(error);
				}
			},
		});

		btns.unshift(save);
		return btns;
	}
}

const id = "pysssss.AutoCompleter";

app.registerExtension({
	name: id,
	init() {
		async function addEmbeddings() {
			const embeddings = await api.getEmbeddings();
			const words = {};
			words["embedding:"] = { text: "embedding:" };

			for (const emb of embeddings) {
				const v = `embedding:${emb}`;
				words[v] = {
					text: v,
					info: () => new EmbeddingInfoDialog(emb).show("embeddings", emb),
				};
			}

			TextAreaAutoComplete.updateWords("pysssss.embeddings", words);
		}

		Promise.all([addEmbeddings(), addCustomWords()]);

		const STRING = ComfyWidgets.STRING;
		ComfyWidgets.STRING = function (node, inputName, inputData) {
			const r = STRING.apply(this, arguments);

			if (inputData[1]?.multiline) {
				new TextAreaAutoComplete(r.widget.inputEl);
			}

			return r;
		};

		app.ui.settings.addSetting({
			id,
			name: "🐍 Text Autocomplete",
			defaultValue: true,
			type: (name, setter, value) => {
				return $el("tr", [
					$el("td", [
						$el("label", {
							for: id.replaceAll(".", "-"),
							textContent: name,
						}),
					]),
					$el("td", [
						$el("input", {
							id: id.replaceAll(".", "-"),
							type: "checkbox",
							checked: value,
							onchange: (event) => {
								const checked = !!event.target.checked;
								TextAreaAutoComplete.enabled = checked;
								setter(checked);
							},
						}),
						$el("button", {
							textContent: "Manage Custom Words",
							onclick: () => {
								app.ui.settings.element.close();
								new CustomWordsDialog().show();
							},
							style: {
								fontSize: "14px",
								display: "block",
								marginTop: "5px",
							},
						}),
					]),
				]);
			},
		});
	},
});
