import { app } from "/scripts/app.js";

// Adds a new UploadImage node

const toBase64 = (file) =>
	new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => resolve(reader.result);
		reader.onerror = (error) => reject(error);
	});

app.registerExtension({
	name: "Comfy.UploadImage",
	async getCustomWidgets() {
		return {
			B64IMAGE(node) {
				let uploadWidget;
				const fileInput = document.createElement("input");

				Object.assign(fileInput, {
					type: "file",
					accept: "image/jpeg,image/png",
					style: "display: none",
					onchange: () => {
						if (fileInput.files.length) {
							const img = new Image();
							img.onload = () => {
								node.imgs = [img];
							};
							toBase64(fileInput.files[0]).then((d) => {
								img.src = d;
							});
						}
					},
				});
				document.body.append(fileInput);

				uploadWidget = node.addWidget("button", "image", "image", () => {
					fileInput.click();
				});

				uploadWidget.serializeValue = () => {
					if(node.imgs && node.imgs.length) {
						return node.imgs[0].src;
					}
					return null;
				};

				return { widget: uploadWidget };
			},
		};
	},
});
