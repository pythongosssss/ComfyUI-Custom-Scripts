import json
from aiohttp import web
from server import PromptServer
import folder_paths


def get_metadata(filepath):
    with open(filepath, "rb") as file:
        # https://github.com/huggingface/safetensors#format
        # 8 bytes: N, an unsigned little-endian 64-bit integer, containing the size of the header
        header_size = int.from_bytes(file.read(8), "little", signed=False)

        if header_size <= 0:
            raise BufferError("Invalid header size")

        header = file.read(header_size)
        if header_size <= 0:
            raise BufferError("Invalid header")

        header_json = json.loads(header)
        return header_json["__metadata__"] if "__metadata__" in header_json else None


@PromptServer.instance.routes.get("/pysssss/metadata/{name}")
async def load_metadata(request):
    name = request.match_info["name"]
    pos = name.index("/")
    type = name[0:pos]
    name = name[pos+1:]

    file_path = folder_paths.get_full_path(
        type, name)
    if not file_path:
        return web.Response(status=404)

    meta = get_metadata(file_path)
    return web.json_response(meta)
