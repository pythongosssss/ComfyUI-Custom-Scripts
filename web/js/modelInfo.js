import { app } from "../../../scripts/app.js";
import { $el, ComfyDialog } from "../../../scripts/ui.js";
import { api } from "../../../scripts/api.js";
import { addStylesheet, getUrl } from "./common/utils.js";

addStylesheet(getUrl("modelInfo.css", import.meta.url));

const MAX_TAGS = 500;

class MetadataDialog extends ComfyDialog {
	constructor() {
		super();

		this.element.classList.add("pysssss-model-metadata");
	}
	show(metadata) {
		super.show(
			$el(
				"div",
				Object.keys(metadata).map((k) =>
					$el("div", [$el("label", { textContent: k }), $el("span", { textContent: metadata[k] })])
				)
			)
		);
	}
}

class ModelInfoDialog extends ComfyDialog {
	constructor(name) {
		super();
		this.name = name;
		this.element.classList.add("pysssss-model-info");
	}

	get customNotes() {
		return this.metadata["pysssss.notes"];
	}

	get hash() {
		return this.metadata["pysssss.sha256"];
	}

	async show(req) {
		this.info = $el("div");
		this.img = $el("img", { style: { display: "none" } });
		this.main = $el("main", { style: { display: "flex" } }, [this.info, this.img]);
		this.content = $el("div.pysssss-model-content", [$el("h2", { textContent: this.name }), this.main]);

		const loading = $el("div", { textContent: "ℹ️ Loading...", parent: this.content });

		super.show(this.content);

		this.metadata = await (await req).json();
		this.viewMetadata.style.cursor = this.viewMetadata.style.opacity = "";
		this.viewMetadata.removeAttribute("disabled");

		loading.remove();
		this.addInfo();
	}

	createButtons() {
		const btns = super.createButtons();
		this.viewMetadata = $el("button", {
			type: "button",
			textContent: "View raw metadata",
			disabled: "disabled",
			style: {
				opacity: 0.5,
				cursor: "not-allowed",
			},
			onclick: (e) => {
				if (this.metadata) {
					new MetadataDialog().show(this.metadata);
				}
			},
		});

		btns.unshift(this.viewMetadata);
		return btns;
	}

	getNoteInfo() {
		if (this.customNotes) {
			let notes = [];
			// Extract links from notes
			const r = new RegExp("(\\bhttps?:\\/\\/[^\\s]+)", "g");
			let end = 0;
			let m;
			do {
				m = r.exec(this.customNotes);
				let pos;
				let fin = 0;
				if (m) {
					pos = m.index;
					fin = m.index + m[0].length;
				} else {
					pos = this.customNotes.length;
				}

				let pre = this.customNotes.substring(end, pos);
				if (pre) {
					pre = pre.replaceAll("\n", "<br>");
					notes.push(
						$el("span", {
							innerHTML: pre,
						})
					);
				}
				if (m) {
					notes.push(
						$el("a", {
							href: m[0],
							textContent: m[0],
							target: "_blank",
						})
					);
				}

				end = fin;
			} while (m);
			return $el("span", notes);
		} else {
			return `Add custom notes in ${this.name.split(".")[0] + ".txt"}`;
		}
	}

	addInfo() {
		this.addInfoEntry("Notes", this.getNoteInfo());
	}

	addInfoEntry(name, value) {
		return $el(
			"p",
			{
				parent: this.info,
			},
			[
				typeof name === "string" ? $el("label", { textContent: name + ": " }) : name,
				typeof value === "string" ? $el("span", { textContent: value }) : value,
			]
		);
	}

	async getCivitaiDetails() {
		const req = await fetch("https://civitai.com/api/v1/model-versions/by-hash/" + this.hash);
		if (req.status === 200) {
			return await req.json();
		} else if (req.status === 404) {
			throw new Error("Model not found");
		} else {
			throw new Error(`Error loading info (${req.status}) ${req.statusText}`);
		}
	}

	addCivitaiInfo() {
		const promise = this.getCivitaiDetails();
		const content = $el("span", { textContent: "ℹ️ Loading..." });

		this.addInfoEntry(
			$el("label", [
				$el("img", {
					style: {
						width: "18px",
						position: "relative",
						top: "3px",
						margin: "0 5px 0 0",
					},
					src: "https://civitai.com/favicon.ico",
				}),
				$el("span", { textContent: "Civitai: " }),
			]),
			content
		);

		return promise
			.then((info) => {
				content.replaceChildren(
					$el("a", {
						href: "https://civitai.com/models/" + info.modelId,
						textContent: "View " + info.model.name,
						target: "_blank",
					})
				);

				if (info.images?.length) {
					this.img.src = info.images[0].url;
					this.img.style.display = "";
				}

				return info;
			})
			.catch((err) => {
				content.textContent = "⚠️ " + err.message;
			});
	}
}

class LoraInfoDialog extends ModelInfoDialog {
	getTagFrequency() {
		if (!this.metadata.ss_tag_frequency) return [];

		const datasets = JSON.parse(this.metadata.ss_tag_frequency);
		const tags = {};
		for (const setName in datasets) {
			const set = datasets[setName];
			for (const t in set) {
				if (t in tags) {
					tags[t] += set[t];
				} else {
					tags[t] = set[t];
				}
			}
		}

		return Object.entries(tags).sort((a, b) => b[1] - a[1]);
	}

	getResolutions() {
		let res = [];
		if (this.metadata.ss_bucket_info) {
			const parsed = JSON.parse(this.metadata.ss_bucket_info);
			if (parsed?.buckets) {
				for (const { resolution, count } of Object.values(parsed.buckets)) {
					res.push([count, `${resolution.join("x")} * ${count}`]);
				}
			}
		}
		res = res.sort((a, b) => b[0] - a[0]).map((a) => a[1]);
		let r = this.metadata.ss_resolution;
		if (r) {
			const s = r.split(",");
			const w = s[0].replace("(", "");
			const h = s[1].replace(")", "");
			res.push(`${w.trim()}x${h.trim()} (Base res)`);
		} else if ((r = this.metadata["modelspec.resolution"])) {
			res.push(r + " (Base res");
		}
		if (!res.length) {
			res.push("⚠️ Unknown");
		}
		return res;
	}

	getTagList(tags) {
		return tags.map((t) =>
			$el(
				"li.pysssss-model-tag",
				{
					dataset: {
						tag: t[0],
					},
					$: (el) => {
						el.onclick = () => {
							el.classList.toggle("pysssss-model-tag--selected");
						};
					},
				},
				[
					$el("p", {
						textContent: t[0],
					}),
					$el("span", {
						textContent: t[1],
					}),
				]
			)
		);
	}

	addTags() {
		let tags = this.getTagFrequency();
		let hasMore;
		if (tags?.length) {
			const c = tags.length;
			let list;
			if (c > MAX_TAGS) {
				tags = tags.slice(0, MAX_TAGS);
				hasMore = $el("p", [
					$el("span", { textContent: `⚠️ Only showing first ${MAX_TAGS} tags ` }),
					$el("a", {
						href: "#",
						textContent: `Show all ${c}`,
						onclick: () => {
							list.replaceChildren(...this.getTagList(this.getTagFrequency()));
							hasMore.remove();
						},
					}),
				]);
			}
			list = $el("ol.pysssss-model-tags-list", this.getTagList(tags));
			this.tags = $el("div", [list]);
		} else {
			this.tags = $el("p", { textContent: "⚠️ No tag frequency metadata found" });
		}

		this.content.append(this.tags);

		if (hasMore) {
			this.content.append(hasMore);
		}
	}

	async addInfo() {
		this.addInfoEntry("Name", this.metadata.ss_output_name || "⚠️ Unknown");
		this.addInfoEntry("Base Model", this.metadata.ss_sd_model_name || "⚠️ Unknown");
		this.addInfoEntry("Clip Skip", this.metadata.ss_clip_skip || "⚠️ Unknown");

		this.addInfoEntry(
			"Resolution",
			$el(
				"select",
				this.getResolutions().map((r) => $el("option", { textContent: r }))
			)
		);

		super.addInfo();
		const p = this.addCivitaiInfo();
		this.addTags();

		const info = await p;
		if (info) {
			$el(
				"p",
				{
					parent: this.content,
					textContent: "Trained Words: ",
				},
				[
					$el("pre", {
						textContent: info.trainedWords.join(", "),
						style: {
							whiteSpace: "pre-wrap",
							margin: "10px 0",
							background: "#222",
							padding: "5px",
							borderRadius: "5px",
							maxHeight: "250px",
							overflow: "auto",
						},
					}),
				]
			);
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

	createButtons() {
		const btns = super.createButtons();

		function copyTags(e, tags) {
			const textarea = $el("textarea", {
				parent: document.body,
				style: {
					position: "fixed",
				},
				textContent: tags.map((el) => el.dataset.tag).join(", "),
			});
			textarea.select();
			try {
				document.execCommand("copy");
				if (!e.target.dataset.text) {
					e.target.dataset.text = e.target.textContent;
				}
				e.target.textContent = "Copied " + tags.length + " tags";
				setTimeout(() => {
					e.target.textContent = e.target.dataset.text;
				}, 1000);
			} catch (ex) {
				prompt("Copy to clipboard: Ctrl+C, Enter", text);
			} finally {
				document.body.removeChild(textarea);
			}
		}

		btns.unshift(
			$el("button", {
				type: "button",
				textContent: "Copy Selected",
				onclick: (e) => {
					copyTags(e, [...this.tags.querySelectorAll(".pysssss-model-tag--selected")]);
				},
			}),
			$el("button", {
				type: "button",
				textContent: "Copy All",
				onclick: (e) => {
					copyTags(e, [...this.tags.querySelectorAll(".pysssss-model-tag")]);
				},
			})
		);

		return btns;
	}
}

class CheckpointInfoDialog extends ModelInfoDialog {
	async addInfo() {
		super.addInfo();
		const info = await this.addCivitaiInfo();
		if (info) {
			this.addInfoEntry("Base Model", info.baseModel || "⚠️ Unknown");

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

const infoHandler = {
	LoraLoader: "loras",
	"LoraLoader|pysssss": "loras",
	CheckpointLoader: "checkpoints",
	CheckpointLoaderSimple: "checkpoints",
	"CheckpointLoader|pysssss": "checkpoints",
};

app.registerExtension({
	name: "pysssss.ModelInfo",
	beforeRegisterNodeDef(nodeType) {
		const type = infoHandler[nodeType.comfyClass];

		if (type) {
			const cls = type === "loras" ? LoraInfoDialog : CheckpointInfoDialog;
			const getExtraMenuOptions = nodeType.prototype.getExtraMenuOptions;
			nodeType.prototype.getExtraMenuOptions = function (_, options) {
				let value = this.widgets[0].value;
				if (!value) {
					return;
				}
				if (value.content) {
					value = value.content;
				}
				options.unshift({
					content: "View info...",
					callback: async () => {
						new cls(value).show(api.fetchApi("/pysssss/metadata/" + encodeURIComponent(`${type}/${value}`)));
					},
				});

				return getExtraMenuOptions?.apply(this, arguments);
			};
		}
	},
});
