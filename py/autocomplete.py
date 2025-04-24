from server import PromptServer
from aiohttp import web
import os
import folder_paths

dir = os.path.abspath(os.path.join(__file__, "../../user"))
if not os.path.exists(dir):
    os.mkdir(dir)
tag_file = os.path.join(dir, "autocomplete.txt")
url_file = os.path.join(dir, "url.txt")


@PromptServer.instance.routes.get("/pysssss/autocomplete")
async def get_autocomplete(request):
    if os.path.isfile(tag_file):
        return web.FileResponse(tag_file)
    return web.Response(status=404)


@PromptServer.instance.routes.post("/pysssss/autocomplete")
async def update_autocomplete(request):
    with open(tag_file, "w", encoding="utf-8") as f:
        f.write(await request.text())
    return web.Response(status=200)


@PromptServer.instance.routes.get("/pysssss/cwlUrl")
async def get_url(request):
    if os.path.isfile(url_file):
        return web.FileResponse(url_file)
    return web.Response(status=404)


@PromptServer.instance.routes.post("/pysssss/cwlUrl")
async def update_url(request):
    with open(url_file, "w", encoding="utf-8") as f:
        f.write(await request.text())
    return web.Response(status=200)


@PromptServer.instance.routes.get("/pysssss/loras")
async def get_loras(request):
    loras = folder_paths.get_filename_list("loras")
    return web.json_response(list(map(lambda a: os.path.splitext(a)[0], loras)))
