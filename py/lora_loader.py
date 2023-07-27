import os
from nodes import LoraLoader
import folder_paths
from server import PromptServer
from aiohttp import web


@PromptServer.instance.routes.get("/pysssss/view/{name}")
async def view_image(request):
    name = request.match_info["name"]
    pos = name.index("/")
    type = name[0:pos]
    name = name[pos+1:]

    image_path = folder_paths.get_full_path(
        type, name)
    if not image_path:
        return web.Response(status=404)

    filename = os.path.basename(image_path)
    return web.FileResponse(image_path, headers={"Content-Disposition": f"filename=\"{filename}\""})


class LoraLoaderWithImages(LoraLoader):
    @classmethod
    def INPUT_TYPES(s):
        types = super().INPUT_TYPES()
        names = types["required"]["lora_name"][0]

        for idx, lora_name in enumerate(names):
            lora_image = os.path.splitext(lora_name)[0] + ".png"
            lora_image_path = folder_paths.get_full_path("loras", lora_image)
            if not lora_image_path:
                lora_image = os.path.splitext(lora_name)[0] + ".jpg"
                lora_image_path = folder_paths.get_full_path(
                    "loras", lora_image)

            names[idx] = {"content": lora_name,
                          "image": f"loras/{lora_image}" if lora_image_path else None, }

        return types

    def load_lora(self, model, clip, lora_name, strength_model, strength_clip):
        return super().load_lora(model, clip, lora_name["content"], strength_model, strength_clip)


NODE_CLASS_MAPPINGS = {
    "LoraLoader|pysssss": LoraLoaderWithImages,
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "LoraLoader|pysssss": "Lora Loader 🐍",
}
