import { app } from "/scripts/app.js";
import { ComfyWidgets } from "/scripts/widgets.js";

app.registerExtension({
	name: "test",
	addCustomNodeDefs(defs) {
		defs["Txt2Img"] = {
			name: "Txt2Img",
			category: "basic",
			input: {
				required: {
					clip: ["CLIP"],
					positive: [
						"STRING",
						{
							multiline: true,
							placeholder: "Positive",
						},
					],
					negative: [
						"STRING",
						{
							multiline: true,
							placeholder: "Negative",
						},
					],
				},
			},
			output: ["CONDITIONING", "CONDITIONING"],
		};
	},
	nodeCreated(node, app) {
		if (node.constructor.type === "Txt2Img") {
			node.size = [400, 500];

			node.getInnerNodes = function () {
				const assignValue = (ourName, theirNode, theirName) => {
					if (!theirName) {
						theirName = ourName;
					}
					const ourWidget = this.widgets.find((w) => w.name === ourName);
					if (!ourWidget) {
						throw new Error("Unable to find Txt2Img widget: " + ourName);
					}
					const thierWidget = theirNode.widgets.find((w) => w.name === theirName);
					if (!thierWidget) {
						throw new Error("Unable to find " + theirNode.constructor.type + " widget: " + ourName);
					}
					thierWidget.value = ourWidget.value;
				};

				const clip1 = LiteGraph.createNode("CLIPTextEncode");
				clip1.graph = app.graph;
				assignValue("positive", clip1, "text");

				const clip2 = LiteGraph.createNode("CLIPTextEncode");
				clip2.graph = app.graph;
				assignValue("negative", clip2, "text");

				clip1.inputs[0].link = this.inputs[0].link;
				clip2.inputs[0].link = this.inputs[0].link;
				clip1.outputs[0].links = this.outputs[0].links;
				clip2.outputs[0].links = this.outputs[1].links;

				clip1.id = -1;
				clip2.id = -2;

				return [clip1, clip2];
			};
		}
	},

	// addCustomNodeDefs(defs) {
	// 	// Simple node added using same format as nodes from the server
	// 	defs["Txt2Img"] = {
	// 		name: "Txt2Img",
	// 		category: "basic",
	// 		input: {
	// 			required: {
	// 				model: ["MODEL"],
	// 				clip: ["CLIP"],
	// 				...defs["EmptyLatentImage"].input.required,
	// 				...defs["VAELoader"].input.required,
	// 				positive: [
	// 					"STRING",
	// 					{
	// 						multiline: true,
	// 						placeholder: "Positive",
	// 					},
	// 				],
	// 				negative: [
	// 					"STRING",
	// 					{
	// 						multiline: true,
	// 						placeholder: "Negative",
	// 					},
	// 				],
	// 				seed: defs["KSampler"].input.required.seed,
	// 				steps: defs["KSampler"].input.required.steps,
	// 				cfg: defs["KSampler"].input.required.cfg,
	// 				sampler_name: defs["KSampler"].input.required.sampler_name,
	// 				scheduler: defs["KSampler"].input.required.scheduler,
	// 			},
	// 		},
	// 		output: ["IMAGE", "VAE"],
	// 	};
	// },
	// nodeCreated(node, app) {
	// 	if (node.constructor.type === "Txt2Img") {
	// 		node.size = [400, 500];

	// 		node.getInnerNodes = function () {
	// 			const assignValues = (theirNode) => {
	// 				for (const w of theirNode.widgets) {
	// 					const ow = node.widgets.find((ow) => ow.name === w.name);
	// 					if (ow) {
	// 						w.value = ow.value;
	// 					}
	// 				}
	// 			};

	// 			const assignValue = (ourName, theirNode, theirName) => {
	// 				if (!theirName) {
	// 					theirName = ourName;
	// 				}
	// 				const ourWidget = this.widgets.find((w) => w.name === ourName);
	// 				if (!ourWidget) {
	// 					throw new Error("Unable to find Txt2Img widget: " + ourName);
	// 				}
	// 				const thierWidget = theirNode.widgets.find((w) => w.name === theirName);
	// 				if (!thierWidget) {
	// 					throw new Error("Unable to find " + theirNode.constructor.type + " widget: " + ourName);
	// 				}
	// 				thierWidget.value = ourWidget.value;
	// 			};

	// 			const img = LiteGraph.createNode("EmptyLatentImage");
	// 			assignValues(img);

	// 			const vae = LiteGraph.createNode("VAELoader");
	// 			assignValues(img);

	// 			const clip1 = LiteGraph.createNode("CLIPTextEncode");
	// 			assignValue("positive", clip1, "text");

	// 			const clip2 = LiteGraph.createNode("CLIPTextEncode");
	// 			assignValue("negative", clip1, "text");

	// 			const sampler = LiteGraph.createNode("KSampler");
	// 			assignValues(sampler);

	// 			debugger;

	// 			return [img, vae, clip1, clip2, sampler];
	// 		};
	// 	}
	// },
});
