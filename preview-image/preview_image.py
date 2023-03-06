import numpy as np
import json
from PIL.PngImagePlugin import PngInfo
from PIL import Image
import base64
from io import BytesIO

class PreviewImage:
    @classmethod
    def INPUT_TYPES(s):
        return {"required":
                {"images": ("IMAGE", ), },
                "hidden": {"prompt": "PROMPT", "extra_pnginfo": "EXTRA_PNGINFO"},
                }

    RETURN_TYPES = ()
    FUNCTION = "save_images"

    OUTPUT_NODE = True

    CATEGORY = "image"

    def save_images(self, images, prompt=None, extra_pnginfo=None):
        paths = list()
        for image in images:
            i = 255. * image.cpu().numpy()
            img = Image.fromarray(i.astype(np.uint8))
            metadata = PngInfo()
            if prompt is not None:
                metadata.add_text("prompt", json.dumps(prompt))
            if extra_pnginfo is not None:
                for x in extra_pnginfo:
                    metadata.add_text(x, json.dumps(extra_pnginfo[x]))
            buffered = BytesIO()
            img.save(buffered, format="PNG", pnginfo=metadata, optimize=True)
            paths.append("data:image/png;base64," + base64.b64encode(buffered.getvalue()).decode('ascii'))
        return {"ui": {"images": paths}}


NODE_CLASS_MAPPINGS = {
    "PreviewImage": PreviewImage,
}
