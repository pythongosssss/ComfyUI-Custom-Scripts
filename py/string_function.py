import re

class StringFunction:
    @classmethod
    def INPUT_TYPES(s):
        return {
            "required": {
                "action": (["append", "replace"], {}),
                "tidy_tags": (["yes", "no"], {}),
                "text_a": ("STRING", {"multiline": True}),
                "text_b": ("STRING", {"multiline": True}),
            },
            "optional": {
                "text_c": ("STRING", {"multiline": True})
            }
        }

    RETURN_TYPES = ("STRING",)
    FUNCTION = "exec"
    CATEGORY = "utils"

    def exec(self, action, tidy_tags, text_a, text_b, text_c=""):
        tidy_tags = tidy_tags == "yes"
        out = ""
        if action == "append":
            out = (", " if tidy_tags else "").join(filter(None, [text_a, text_b, text_c]))
        else:
           if text_c is None:
               text_c = ""
           if text_b.startswith("/") and text_b.endswith("/"):
               regex = text_b[1:-1]
               out = re.sub(regex, text_c, text_a)
           else:
               out = text_a.replace(text_b, text_c)
        if tidy_tags:
            out = out.replace("  ", " ").replace(" ,", ",").replace(",,", ",").replace(",,", ",")
        return (out, )
            
NODE_CLASS_MAPPINGS = {
    "StringFunction|pysssss": StringFunction,
}

NODE_DISPLAY_NAME_MAPPINGS = {
    "StringFunction|pysssss": "String Function 🐍",
}
