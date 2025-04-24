from server import PromptServer
from aiohttp import web
import os
import folder_paths

dir = os.path.abspath(os.path.join(__file__, "../../user"))
if not os.path.exists(dir):
    os.mkdir(dir)
file = os.path.join(dir, "autocomplete.txt")
custom_word_list_file = os.path.join(dir, "customWordListUrl.txt")


@PromptServer.instance.routes.get("/pysssss/autocomplete")
async def get_autocomplete(request):
    if os.path.isfile(file):
        return web.FileResponse(file)
    return web.Response(status=404)


@PromptServer.instance.routes.post("/pysssss/autocomplete")
async def update_autocomplete(request):
    with open(file, "w", encoding="utf-8") as f:
        f.write(await request.text())
    return web.Response(status=200)


@PromptServer.instance.routes.post("/pysssss/saveCustomWordListUrl")
async def save_custom_word_list_url(request):
    with open(custom_word_list_file, "w", encoding="utf-8") as f:
        f.write(await request.text())
    return web.Response(status=200)


@PromptServer.instance.routes.get("/pysssss/customWordListUrl")
async def get_custom_word_list_url(request):
    if os.path.isfile(custom_word_list_file):
        with open(custom_word_list_file, "r", encoding="utf-8") as f:
            return web.Response(text=f.read())
    else:
        return web.Response(
            text="https://gist.githubusercontent.com/pythongosssss/1d3efa6050356a08cea975183088159a/raw/a18fb2f94f9156cf4476b0c24a09544d6c0baec6/danbooru-tags.txt"
        )
    # return web.Response(status=404)


@PromptServer.instance.routes.get("/pysssss/loras")
async def get_loras(request):
    loras = folder_paths.get_filename_list("loras")
    return web.json_response(list(map(lambda a: os.path.splitext(a)[0], loras)))
