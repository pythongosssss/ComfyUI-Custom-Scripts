import { app } from "../../../scripts/app.js";
import { $el, ComfyDialog } from "../../../scripts/ui.js";
import { api } from "../../../scripts/api.js";
import { addStylesheet, getUrl } from "./common/utils.js";

addStylesheet(getUrl("loraInfo.css", import.meta.url));

const MAX_TAGS = 500;

class LoraMetadataDialog extends ComfyDialog {
	constructor(name, metadata) {
		super();

		this.element.classList.add("pysssss-lora-metadata");
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

class LoraInfoDialog extends ComfyDialog {
	#metadata;

	get tagFrequency() {
		if (!this.#metadata.ss_tag_frequency) return [];

		const datasets = JSON.parse(this.#metadata.ss_tag_frequency);
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

	get resolutions() {
		let res = [];
		if (this.#metadata.ss_bucket_info) {
			const { buckets } = JSON.parse(this.#metadata.ss_bucket_info);
			for (const { resolution, count } of Object.values(buckets)) {
				res.push([count, `${resolution.join("x")} * ${count}`]);
			}
		}
		res = res.sort((a, b) => b[0] - a[0]).map((a) => a[1]);
		let r = this.#metadata.ss_resolution;
		if (r) {
			const s = r.split(",");
			const w = s[0].replace("(", "");
			const h = s[1].replace(")", "");
			res.push(`${w.trim()}x${h.trim()} (Base res)`);
		} else if ((r = this.#metadata["modelspec.resolution"])) {
			res.push(r + " (Base res");
		}
		if (!res.length) {
			res.push("⚠️ Unknown");
		}
		return res;
	}

	get customNotes() {
		return this.#metadata["pysssss.notes"];
	}

	get hash() {
		return this.#metadata["pysssss.sha256"];
	}

	getTagList(tags) {
		return tags.map((t) =>
			$el(
				"li.pysssss-lora-tag",
				{
					dataset: {
						tag: t[0],
					},
					$: (el) => {
						el.onclick = () => {
							el.classList.toggle("pysssss-lora-tag--selected");
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

	constructor(name, metadata) {
		super();

		this.element.classList.add("pysssss-lora-info");
		this.#metadata = metadata;

		let tags = this.tagFrequency;
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
							list.replaceChildren(...this.getTagList(this.tagFrequency));
							hasMore.remove();
						},
					}),
				]);
			}
			list = $el("ol.pysssss-lora-tags-list", this.getTagList(tags));
			this.tags = $el("div", [list]);
		} else {
			this.tags = $el("p", { textContent: "⚠️ No tag frequency metadata found" });
		}

		const resolutions = $el("label", { textContent: "Resolution:" }, [
			$el(
				"select",
				this.resolutions.map((r) => $el("option", { textContent: r }))
			),
		]);

		let notes = null;
		if (this.customNotes?.startsWith("http")) {
			notes = $el("p", { textContent: "Notes: " }, [
				$el("a", {
					href: this.customNotes,
					textContent: this.customNotes,
					target: "_blank",
				}),
			]);
		} else {
			notes = $el("p", {
				textContent: "Notes: " + (this.customNotes ?? `Add custom notes in ${name.split(".")[0] + ".txt"}`),
			});
		}

		this.content = $el(
			"div.pysssss-lora-content",
			[
				$el("h2", { textContent: name }),
				$el("p", {
					textContent: "Output Name: " + (metadata.ss_output_name || "⚠️ Unknown"),
				}),
				$el("p", {
					textContent: "Base Model: " + (metadata.ss_sd_model_name || "⚠️ Unknown"),
				}),
				$el("p", {
					textContent: "Clip Skip: " + (metadata.ss_clip_skip || "⚠️ Unknown"),
				}),
				resolutions,
				notes,
				this.createCivitaiInfo(),
				this.tags,
				hasMore,
			].filter(Boolean)
		);
	}

	createCivitaiInfo() {
		if (!this.hash) return;

		const info = $el("span", { textContent: "ℹ️ Loading..." });
		const el = $el("p", [
			$el("img", {
				style: {
					width: "18px",
					position: "relative",
					top: "3px",
					marginRight: "5px",
				},
				src: "https://civitai.com/favicon.ico",
			}),
			$el("span", { textContent: "Civitai: " }),
			info,
		]);

		(async () => {
			try {
				const req = await fetch("https://civitai.com/api/v1/model-versions/by-hash/" + this.hash);
				if (req.status === 200) {
					const res = await req.json();
					info.replaceChildren(
						$el("a", {
							href: "https://civitai.com/models/" + res.modelId,
							textContent: "View " + res.model.name,
							target: "_blank",
						})
					);
				} else if (req.status === 404) {
					info.textContent = "⚠️ Model not found";
				} else {
					info.textContent = `⚠️ Error loading info (${req.status}) ` + req.statusText;
				}
			} catch (error) {
				console.error(error);
				info.textContent = "⚠️ Error loading info";
			}
		})();

		return el;
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
					copyTags(e, [...this.tags.querySelectorAll(".pysssss-lora-tag--selected")]);
				},
			}),
			$el("button", {
				type: "button",
				textContent: "Copy All",
				onclick: (e) => {
					copyTags(e, [...this.tags.querySelectorAll(".pysssss-lora-tag")]);
				},
			}),
			$el("button", {
				type: "button",
				textContent: "View raw metadata",
				onclick: (e) => {
					new LoraMetadataDialog().show(this.#metadata);
				},
			})
		);
		return btns;
	}

	show() {
		super.show(this.content);
	}
}

app.registerExtension({
	name: "pysssss.LoraInfo",
	beforeRegisterNodeDef(nodeType, nodeData, app) {
		if (nodeType.comfyClass === "LoraLoader" || nodeType.comfyClass === "LoraLoader|pysssss") {
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
						const meta = await (await api.fetchApi("/pysssss/metadata/" + encodeURIComponent(`loras/${value}`))).json();
						new LoraInfoDialog(value, meta).show();
					},
				});

				return getExtraMenuOptions?.apply(this, arguments);
			};
		}
	},
});
