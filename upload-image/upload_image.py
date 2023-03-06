from PIL import Image
import numpy as np
import torch


class UploadImage:
    @classmethod
    def INPUT_TYPES(s):
        return {"required":
                {"image": ("B64IMAGE",)},
                }

    CATEGORY = "image"

    RETURN_TYPES = ("IMAGE",)
    FUNCTION = "load_image"

    def load_image(self, image):
        from io import BytesIO
        import re
        import base64
        if image.startswith("data:image/"):
            image_data = re.sub('^data:image/.+;base64,', '', image)
            i = Image.open(BytesIO(base64.b64decode(image_data)))
        else:
            raise Exception("Invalid image data")

        image = i.convert("RGB")
        image = np.array(image).astype(np.float32) / 255.0
        image = torch.from_numpy(image)[None,]
        return (image,)

NODE_CLASS_MAPPINGS = {
    "UploadImage": UploadImage,
}
