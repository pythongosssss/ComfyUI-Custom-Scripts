import { app } from "/scripts/app.js";
import { ComfyWidgets } from "/scripts/widgets.js";

// Adds support for import + export as SVG including input + output images
// Adds two context menu items to the canvas
// Supports drag + drop import

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

function escapeXml(unsafe) {
	return unsafe.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
function unescapeXml(safe) {
	return safe.replaceAll("&amp;", "&").replaceAll("&lt;", "<").replaceAll("&gt;", ">");
}

let saving = false;
app.registerExtension({
	name: "pysssss.ExportAsSvg",
	init() {
		const stringWidget = ComfyWidgets.STRING;
		// Override multiline string widgets to draw text using canvas while saving as svg
		ComfyWidgets.STRING = function () {
			const w = stringWidget.apply(this, arguments);
			if (w.widget && w.widget.type === "customtext") {
				const draw = w.widget.draw;
				w.widget.draw = function (ctx) {
					draw.apply(this, arguments);

					if (saving) {
						const t = ctx.getTransform();
						ctx.save();
						ctx.resetTransform();

						const style = document.defaultView.getComputedStyle(this.inputEl, null);
						const x = parseInt(this.inputEl.style.left) + 10;
						const y = parseInt(this.inputEl.style.top) + LiteGraph.NODE_TITLE_HEIGHT;
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
	setup(app) {
		const script = document.createElement("script");
		script.onload = function () {
			function exportSvg() {
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

				// Store current canvas values to reset after drawing
				const ctx = app.canvas.ctx;
				const scale = app.canvas.ds.scale;
				const width = app.canvas.canvas.width;
				const height = app.canvas.canvas.height;
				const offset = app.canvas.ds.offset;

				const svgCtx = new C2S(bounds[2] - bounds[0], bounds[3] - bounds[1]);

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

				// Force the canvas to render the whole graph to the svg context
				app.canvas.ds.scale = 1;
				app.canvas.canvas.width = bounds[2] - bounds[0];
				app.canvas.canvas.height = bounds[3] - bounds[1];
				app.canvas.ds.offset = [-bounds[0], -bounds[1]];
				app.canvas.ctx = svgCtx;

				// Trigger saving
				saving = true;
				app.canvas.draw(true, true);
				saving = false;

				// Restore original settings
				app.canvas.ds.scale = scale;
				app.canvas.canvas.width = width;
				app.canvas.canvas.height = height;
				app.canvas.ds.offset = offset;
				app.canvas.ctx = ctx;

				app.canvas.draw(true, true);

				// Convert to SVG, embed graph and save
				const json = JSON.stringify(app.graph.serialize());
				const svg = svgCtx
					.getSerializedSvg(true)
					.replace("</svg>", `<desc>${escapeXml(json)}</desc></svg>`)
					.replace("<svg ", `<svg style="background: ${app.canvas.clear_background_color}" `);
				const blob = new Blob([svg], { type: "image/svg+xml" });
				const url = URL.createObjectURL(blob);
				const a = document.createElement("a");
				Object.assign(a, {
					href: url,
					download: "workflow.svg",
					style: "display: none",
				});
				document.body.append(a);
				a.click();
				setTimeout(function () {
					a.remove();
					window.URL.revokeObjectURL(url);
				}, 0);
			}

			let fileInput;
			function importSvg() {
				if (!fileInput) {
					fileInput = document.createElement("input");
					Object.assign(fileInput, {
						type: "file",
						accept: ".svg,image/svg+xml",
						style: "display: none",
						onchange: () => {
							app.handleFile(fileInput.files[0]);
						},
					});
					document.body.append(fileInput);
				}
				fileInput.click();
			}

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
								this.loadGraphData(JSON.parse(unescapeXml(json)));
							}
						}
					};
					reader.readAsText(file);
				} else {
					return handleFile.apply(this, arguments);
				}
			};

			// Add canvas menu options
			const orig = LGraphCanvas.prototype.getCanvasMenuOptions;
			LGraphCanvas.prototype.getCanvasMenuOptions = function () {
				const options = orig.apply(this, arguments);
				options.push(
					null,
					{ content: "SVG -> Import", callback: importSvg },
					{ content: "SVG -> Export", callback: exportSvg }
				);
				return options;
			};
		};

		script.src = new URL(`assets/canvas2svg.js`, import.meta.url);
		document.body.append(script);
	},
});
