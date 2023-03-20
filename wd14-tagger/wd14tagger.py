# https://huggingface.co/spaces/SmilingWolf/wd-v1-4-tags

import numpy as np
from PIL import Image
import csv
import os
from server import PromptServer

NODE_CLASS_MAPPINGS = {}
valid = False

try:
    import onnxruntime as ort
    from onnxruntime import InferenceSession
    valid = True
except ImportError:
    print("onnxruntime is required for wd14 tagger")
    print("to use gpu")
    print("pip install onnxruntime-gpu")
    print("or to use cpu")
    print("pip install onnxruntime")

models_dir = os.path.realpath(os.path.join(os.path.dirname(os.path.realpath(__file__)), "../comfy_extras/wd14_models"))
if not os.path.exists(models_dir):
    print("Place WD14 tagger models + tags in: " + models_dir)
    print("You can download them from: https://huggingface.co/spaces/SmilingWolf/wd-v1-4-tags")
    print("Name the model.onnx and selected_tags.csv something unique per model, e.g. convnextv2.onnx/.csv")
elif valid:
    class WD14Tagger:
        @classmethod
        def INPUT_TYPES(s):
            return {"required": {
                "image": ("IMAGE", ),
                "model": (sorted(filter(lambda x: x.endswith(".onnx"), os.listdir(models_dir))), ),
                "threshold": ("FLOAT", {"default": 0.35, "min": 0.0, "max": 1, "step": 0.05}),
                "character_threshold": ("FLOAT", {"default": 0.85, "min": 0.0, "max": 1, "step": 0.05}),
                "exclude_tags": ("STRING", {"default": ""}),
            }}

        RETURN_TYPES = ("STRING",)
        FUNCTION = "tag"
        OUTPUT_NODE = True

        CATEGORY = "image"

        def tag(self, image, model, threshold, character_threshold, exclude_tags = ""):
            name = os.path.join(models_dir, model)
            model = InferenceSession(name, providers=ort.get_available_providers())

            input = model.get_inputs()[0]
            height = input.shape[1]

            # Read all tags from csv and locate start of each category
            tags = []
            general_index = None
            character_index = None
            with open(os.path.splitext(name)[0] + ".csv") as f:
                reader = csv.reader(f)
                next(reader)
                for row in reader:
                    if general_index is None and row[2] == "0":
                        general_index = reader.line_num - 2
                    elif character_index is None and row[2] == "4":
                        character_index = reader.line_num - 2
                    tags.append(row[1])

            tensor = image*255
            tensor = np.array(tensor, dtype=np.uint8)
            if np.ndim(tensor) > 3:
                assert tensor.shape[0] == 1
                tensor = tensor[0]

            image = Image.fromarray(tensor)
            # Reduce to max size and pad with white
            ratio = float(height)/max(image.size)
            new_size = tuple([int(x*ratio) for x in image.size])
            image = image.resize(new_size, Image.ANTIALIAS)
            square = Image.new("RGB", (height, height), (255, 255, 255))
            square.paste(image, ((height-new_size[0])//2, (height-new_size[1])//2))

            image = np.array(square).astype(np.float32)
            image = image[:, :, ::-1]  # RGB -> BGR
            image = np.expand_dims(image, 0)

            label_name = model.get_outputs()[0].name
            probs = model.run([label_name], {input.name: image})[0]

            result = list(zip(tags, probs[0]))

            rating = max(result[:general_index], key=lambda x: x[1])
            general = [item for item in result[general_index:character_index] if item[1] > threshold]
            character = [item for item in result[character_index:] if item[1] > character_threshold]

            all = character + general
            remove = [s.strip() for s in exclude_tags.lower().split(",")]
            all = [tag for tag in all if tag not in remove]

            res = ", ".join((item[0].replace(" ",
                                             "_").replace("(", "\\(").replace(")", "\\)") for item in all))

            print(res)

            if PromptServer.instance.client_id is not None:
                PromptServer.instance.send_sync("wd14tagger", res, PromptServer.instance.client_id)

            return (res,)

    NODE_CLASS_MAPPINGS = {
        "WD14Tagger": WD14Tagger,
    }
