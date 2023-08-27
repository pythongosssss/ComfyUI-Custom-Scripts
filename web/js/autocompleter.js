import { app } from "../../../scripts/app.js";
import { ComfyWidgets } from "../../../scripts/widgets.js";
import { api } from "../../../../scripts/api.js";
import { $el } from "../../../../scripts/ui.js";
import { TextAreaAutoComplete } from "./common/autocomplete.js";
import { ModelInfoDialog } from "./common/modelInfoDialog.js";

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

app.registerExtension({
	name: "pysssss.AutoCompleter",
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

		addEmbeddings();

		const STRING = ComfyWidgets.STRING;
		ComfyWidgets.STRING = function (node, inputName, inputData) {
			const r = STRING.apply(this, arguments);

			if (inputData[1]?.multiline) {
				new TextAreaAutoComplete(r.widget.inputEl);
			}

			return r;
		};
	},
});
