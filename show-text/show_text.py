class ShowText:
    @classmethod
    def INPUT_TYPES(s):
        return {"required": {
            "text": ("STRING", {"forceInput": True}),
        }}

    RETURN_TYPES = ("STRING",)
    FUNCTION = "notify"
    OUTPUT_NODE = True

    CATEGORY = "utils"

    def notify(self, text):   
        return {"ui": { "text": text }, "result": (text,)}


NODE_CLASS_MAPPINGS = {
    "ShowText": ShowText,
}