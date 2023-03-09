import comfy.utils
import math

class LatentUpscaleBy:
    upscale_methods = ["nearest-exact", "bilinear", "area"]
    crop_methods = ["disabled", "center"]

    @classmethod
    def INPUT_TYPES(s):
        return {"required": {"samples": ("LATENT",), "upscale_method": (s.upscale_methods,),
                             "scale": ("FLOAT", {"default": 1.5, "min": 0.1, "max": 10, "step": 0.05}),
                             "crop": (s.crop_methods,)}}
    RETURN_TYPES = ("LATENT",)
    FUNCTION = "upscale"

    CATEGORY = "latent"

    def upscale(self, samples, upscale_method, scale, crop):
        s = samples.copy()
        w = round(samples["samples"].shape[3] * 8 * scale)
        w = 64 * math.ceil(w / 64)

        h = round(samples["samples"].shape[2] * 8 * scale)
        h = 64 * math.ceil(h / 64)
        
        s["samples"] = comfy.utils.common_upscale(
            samples["samples"], w // 8, h // 8, upscale_method, crop)
        return (s,)


NODE_CLASS_MAPPINGS = {
    "LatentUpscaleBy": LatentUpscaleBy,
}
