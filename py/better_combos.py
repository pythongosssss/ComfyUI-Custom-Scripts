import os
from nodes import LoraLoader, CheckpointLoaderSimple
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


def populate_images(names, type):
    for idx, item_name in enumerate(names):
        item_image = os.path.splitext(item_name)[0] + ".png"
        item_image_path = folder_paths.get_full_path(type, item_image)
        if not item_image_path:
            item_image = os.path.splitext(item_name)[0] + ".jpg"
            item_image_path = folder_paths.get_full_path(
                type, item_image)

        names[idx] = {"content": item_name,
                      "image": f"{type}/{item_image}" if item_image_path else None, }
    names.sort(key=lambda i: i["content"].lower())


class LoraLoaderWithImages(LoraLoader):
    @classmethod
    def INPUT_TYPES(s):
        types = super().INPUT_TYPES()
        names = types["required"]["lora_name"][0]
        populate_images(names, "loras")
        return types
    
    def load_lora(self, **kwargs):
        kwargs["lora_name"] = kwargs["lora_name"]["content"]
        return super().load_lora(**kwargs)


class CheckpointLoaderSimpleWithImages(CheckpointLoaderSimple):
    @classmethod
    def INPUT_TYPES(s):
        types = super().INPUT_TYPES()
        names = types["required"]["ckpt_name"][0]
        populate_images(names, "checkpoints")
        return types
    
    def load_checkpoint(self, **kwargs):
        kwargs["ckpt_name"] = kwargs["ckpt_name"]["content"]
        return super().load_checkpoint(**kwargs)


NODE_CLASS_MAPPINGS = {
    "LoraLoader|pysssss": LoraLoaderWithImages,
    "CheckpointLoader|pysssss": CheckpointLoaderSimpleWithImages,
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "LoraLoader|pysssss": "Lora Loader 🐍",
    "CheckpointLoader|pysssss": "Checkpoint Loader 🐍",
}
