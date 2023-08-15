import { app } from "../../../scripts/app.js";
import { ComfyWidgets } from "../../../scripts/widgets.js";

let getDrawTextConfig = null;
let fileInput;

class WorkflowImage {
	static accept = "";

	getBounds() {
		// Calculate the min max bounds for the nodes on the graph
		const bounds = app.graph._nodes.reduce(
			(p, n) => {
				if (n.pos[0] < p[0]) p[0] = n.pos[0];
				if (n.pos[1] < p[1]) p[1] = n.pos[1];
				const r = n.pos[0] + n.size[0];
				const b = n.pos[1] + n.size[1];
				if (r > p[2]) p[2] = r;
				if (b > p[3]) p[3] = b;
				return p;
			},
			[99999, 99999, -99999, -99999]
		);

		bounds[0] -= 100;
		bounds[1] -= 100;
		bounds[2] += 100;
		bounds[3] += 100;
		return bounds;
	}

	saveState() {
		this.state = {
			scale: app.canvas.ds.scale,
			width: app.canvas.canvas.width,
			height: app.canvas.canvas.height,
			offset: app.canvas.ds.offset,
		};
	}

	restoreState() {
		app.canvas.ds.scale = this.state.scale;
		app.canvas.canvas.width = this.state.width;
		app.canvas.canvas.height = this.state.height;
		app.canvas.ds.offset = this.state.offset;
	}

	updateView(bounds) {
		app.canvas.ds.scale = 1;
		app.canvas.canvas.width = bounds[2] - bounds[0];
		app.canvas.canvas.height = bounds[3] - bounds[1];
		app.canvas.ds.offset = [-bounds[0], -bounds[1]];
	}

	getDrawTextConfig() {
		return {
			x: 10,
			y: LiteGraph.NODE_TITLE_HEIGHT,
		};
	}

	async export(includeWorkflow) {
		// Save the current state of the canvas
		this.saveState();
		// Update to render the whole workflow
		this.updateView(this.getBounds());

		// Flag that we are saving and render the canvas
		getDrawTextConfig = this.getDrawTextConfig;
		app.canvas.draw(true, true);
		getDrawTextConfig = null;

		// Generate a blob of the image containing the workflow
		const blob = await this.getBlob(includeWorkflow ? JSON.stringify(app.graph.serialize()) : undefined);

		// Restore initial state and redraw
		this.restoreState();
		app.canvas.draw(true, true);

		// Download the generated image
		this.download(blob);
	}

	download(blob) {
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		Object.assign(a, {
			href: url,
			download: "workflow." + this.extension,
			style: "display: none",
		});
		document.body.append(a);
		a.click();
		setTimeout(function () {
			a.remove();
			window.URL.revokeObjectURL(url);
		}, 0);
	}

	static import() {
		if (!fileInput) {
			fileInput = document.createElement("input");
			Object.assign(fileInput, {
				type: "file",
				style: "display: none",
				onchange: () => {
					app.handleFile(fileInput.files[0]);
				},
			});
			document.body.append(fileInput);
		}
		fileInput.accept = WorkflowImage.accept;
		fileInput.click();
	}
}

class PngWorkflowImage extends WorkflowImage {
	static accept = ".png,image/png";
	extension = "png";

	n2b(n) {
		return new Uint8Array([(n >> 24) & 0xff, (n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff]);
	}

	joinArrayBuffer(...bufs) {
		const result = new Uint8Array(bufs.reduce((totalSize, buf) => totalSize + buf.byteLength, 0));
		bufs.reduce((offset, buf) => {
			result.set(buf, offset);
			return offset + buf.byteLength;
		}, 0);
		return result;
	}

	crc32(data) {
		const crcTable =
			PngWorkflowImage.crcTable ||
			(PngWorkflowImage.crcTable = (() => {
				let c;
				const crcTable = [];
				for (let n = 0; n < 256; n++) {
					c = n;
					for (let k = 0; k < 8; k++) {
						c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
					}
					crcTable[n] = c;
				}
				return crcTable;
			})());
		let crc = 0 ^ -1;
		for (let i = 0; i < data.byteLength; i++) {
			crc = (crc >>> 8) ^ crcTable[(crc ^ data[i]) & 0xff];
		}
		return (crc ^ -1) >>> 0;
	}

	async getBlob(workflow) {
		return new Promise((r) => {
			app.canvasEl.toBlob(async (blob) => {
				if (workflow) {
					// If we have a workflow embed it in the PNG
					const buffer = await blob.arrayBuffer();
					const typedArr = new Uint8Array(buffer);
					const view = new DataView(buffer);

					const data = new TextEncoder().encode(`tEXtworkflow\0${workflow}`);
					const chunk = this.joinArrayBuffer(this.n2b(data.byteLength - 4), data, this.n2b(this.crc32(data)));

					const sz = view.getUint32(8) + 20;
					const result = this.joinArrayBuffer(typedArr.subarray(0, sz), chunk, typedArr.subarray(sz));

					blob = new Blob([result], { type: "image/png" });
				}

				r(blob);
			});
		});
	}
}

class SvgWorkflowImage extends WorkflowImage {
	static accept = ".svg,image/svg+xml";
	extension = "svg";

	static init() {
		// Override file handling to allow drag & drop of SVG
		const handleFile = app.handleFile;
		app.handleFile = function (file) {
			if (file && (file.type === "image/svg+xml" || file.name?.endsWith(".svg"))) {
				const reader = new FileReader();
				reader.onload = () => {
					// Extract embedded workflow from desc tags
					const descEnd = reader.result.lastIndexOf("</desc>");
					if (descEnd !== -1) {
						const descStart = reader.result.lastIndexOf("<desc>", descEnd);
						if (descStart !== -1) {
							const json = reader.result.substring(descStart + 6, descEnd);
							this.loadGraphData(JSON.parse(SvgWorkflowImage.unescapeXml(json)));
						}
					}
				};
				reader.readAsText(file);
			} else {
				return handleFile.apply(this, arguments);
			}
		};
	}

	static escapeXml(unsafe) {
		return unsafe.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
	}

	static unescapeXml(safe) {
		return safe.replaceAll("&amp;", "&").replaceAll("&lt;", "<").replaceAll("&gt;", ">");
	}

	getDrawTextConfig(_, widget) {
		return {
			x: parseInt(widget.inputEl.style.left),
			y: parseInt(widget.inputEl.style.top),
			resetTransform: true,
		};
	}

	saveState() {
		super.saveState();
		this.state.ctx = app.canvas.ctx;
	}

	restoreState() {
		super.restoreState();
		app.canvas.ctx = this.state.ctx;
	}

	updateView(bounds) {
		super.updateView(bounds);
		this.createSvgCtx(bounds);
	}

	createSvgCtx(bounds) {
		const ctx = this.state.ctx;
		const svgCtx = (this.svgCtx = new C2S(bounds[2] - bounds[0], bounds[3] - bounds[1]));
		svgCtx.canvas.getBoundingClientRect = function () {
			return { width: svgCtx.width, height: svgCtx.height };
		};

		// Override the c2s handling of images to draw images as canvases
		const drawImage = svgCtx.drawImage;
		svgCtx.drawImage = function (...args) {
			const image = args[0];
			// If we are an image node and not a datauri then we need to replace with a canvas
			// we cant convert to data uri here as it is an async process
			if (image.nodeName === "IMG" && !image.src.startsWith("data:image/")) {
				const canvas = document.createElement("canvas");
				canvas.width = image.width;
				canvas.height = image.height;
				const imgCtx = canvas.getContext("2d");
				imgCtx.drawImage(image, 0, 0);
				args[0] = canvas;
			}

			return drawImage.apply(this, args);
		};

		// Implement missing required functions
		svgCtx.getTransform = function () {
			return ctx.getTransform();
		};
		svgCtx.resetTransform = function () {
			return ctx.resetTransform();
		};
		svgCtx.roundRect = svgCtx.rect;
		app.canvas.ctx = svgCtx;
	}

	getBlob(workflow) {
		let svg = this.svgCtx
			.getSerializedSvg(true)
			.replace("<svg ", `<svg style="background: ${app.canvas.clear_background_color}" `);

		if (workflow) {
			svg = svg.replace("</svg>", `<desc>${SvgWorkflowImage.escapeXml(workflow)}</desc></svg>`);
		}

		return new Blob([svg], { type: "image/svg+xml" });
	}
}

app.registerExtension({
	name: "pysssss.WorkflowImage",
	init() {
		// https://codepen.io/peterhry/pen/nbMaYg
		function wrapText(context, text, x, y, maxWidth, lineHeight) {
			var words = text.split(" "),
				line = "",
				i,
				test,
				metrics;

			for (i = 0; i < words.length; i++) {
				test = words[i];
				metrics = context.measureText(test);
				while (metrics.width > maxWidth) {
					// Determine how much of the word will fit
					test = test.substring(0, test.length - 1);
					metrics = context.measureText(test);
				}
				if (words[i] != test) {
					words.splice(i + 1, 0, words[i].substr(test.length));
					words[i] = test;
				}

				test = line + words[i] + " ";
				metrics = context.measureText(test);

				if (metrics.width > maxWidth && i > 0) {
					context.fillText(line, x, y);
					line = words[i] + " ";
					y += lineHeight;
				} else {
					line = test;
				}
			}

			context.fillText(line, x, y);
		}

		const stringWidget = ComfyWidgets.STRING;
		// Override multiline string widgets to draw text using canvas while saving as svg
		ComfyWidgets.STRING = function () {
			const w = stringWidget.apply(this, arguments);
			if (w.widget && w.widget.type === "customtext") {
				const draw = w.widget.draw;
				w.widget.draw = function (ctx) {
					draw.apply(this, arguments);

					if (getDrawTextConfig) {
						const config = getDrawTextConfig(ctx, this);
						const t = ctx.getTransform();
						ctx.save();
						if (config.resetTransform) {
							ctx.resetTransform();
						}

						const style = document.defaultView.getComputedStyle(this.inputEl, null);
						const x = config.x;
						const y = config.y;
						const w = parseInt(this.inputEl.style.width);
						const h = parseInt(this.inputEl.style.height);
						ctx.fillStyle = style.getPropertyValue("background-color");
						ctx.fillRect(x, y, w, h);

						ctx.fillStyle = style.getPropertyValue("color");
						ctx.font = style.getPropertyValue("font");

						wrapText(ctx, this.inputEl.value, x, y + t.d * 12, w, t.d * 12);

						ctx.restore();
					}
				};
			}
			return w;
		};
	},
	setup() {
		const script = document.createElement("script");
		script.onload = function () {
			const formats = [SvgWorkflowImage, PngWorkflowImage];
			for (const f of formats) {
				f.init?.call();
				WorkflowImage.accept += (WorkflowImage.accept ? "," : "") + f.accept;
			}

			// Add canvas menu options
			const orig = LGraphCanvas.prototype.getCanvasMenuOptions;
			LGraphCanvas.prototype.getCanvasMenuOptions = function () {
				const options = orig.apply(this, arguments);

				options.push(null, {
					content: "Workflow Image",
					submenu: {
						options: [
							{
								content: "Import",
								callback: () => {
									WorkflowImage.import();
								},
							},
							{
								content: "Export",
								submenu: {
									options: formats.flatMap((f) => [
										{
											content: f.name.replace("WorkflowImage", "").toLocaleLowerCase(),
											callback: () => {
												new f().export(true);
											},
										},
										{
											content: f.name.replace("WorkflowImage", "").toLocaleLowerCase() + " (no embedded workflow)",
											callback: () => {
												new f().export();
											},
										},
									]),
								},
							},
						],
					},
				});
				return options;
			};
		};

		script.src = new URL(`assets/canvas2svg.js`, import.meta.url);
		document.body.append(script);
	},
});
