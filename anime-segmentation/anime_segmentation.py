import copy
import sys
import os
import torch
import cv2
import numpy as np
from torch.cuda import amp

sys.path.insert(0, os.path.join(os.path.dirname(os.path.realpath(__file__)), "../comfy_extras/anime_segmentation"))  # noqa
from comfy_extras.anime_segmentation.train import AnimeSegmentation


class Segment:
    net = ["isnet_is", "isnet", "u2net", "u2netl", "modnet"]

    @classmethod
    def INPUT_TYPES(s):
        return {"required": {
            "images": ("IMAGE", ),
            "net": (s.net, {"default": "isnet_is"}),
            "ckpt": ("STRING", {"default": "comfy_extras/anime_segmentation/saved_models/isnetis.ckpt"}),
            "device": ("STRING", {"default": "cuda:0"}),
            "precision": (["fp16", "fp32"], {"default": "fp16"}),
            "image_size": ("INT", {"default": 1024}),
            "remove": (["character", "background"], {"default": "background"}),
            "alpha": (["yes", "no"], {"default": "yes"}),
        }}

    RETURN_TYPES = ("IMAGE", "MASK")
    FUNCTION = "segment"

    CATEGORY = "image"

    def get_mask(self, model, input_img, use_amp=True, s=640):
        h0, w0 = h, w = input_img.shape[0], input_img.shape[1]
        if h > w:
            h, w = s, int(s * w / h)
        else:
            h, w = int(s * h / w), s
        ph, pw = s - h, s - w
        tmpImg = np.zeros([s, s, 3], dtype=np.float32)
        tmpImg[ph // 2:ph // 2 + h, pw // 2:pw // 2 + w] = cv2.resize(input_img, (w, h)) / 255
        tmpImg = tmpImg.transpose((2, 0, 1))
        tmpImg = torch.from_numpy(tmpImg).unsqueeze(0).type(torch.FloatTensor).to(model.device)
        with torch.no_grad():
            if use_amp:
                with amp.autocast():
                    pred = model(tmpImg)
                pred = pred.to(dtype=torch.float32)
            else:
                pred = model(tmpImg)
            pred = pred[0, :, ph // 2:ph // 2 + h, pw // 2:pw // 2 + w]
            pred = cv2.resize(pred.cpu().numpy().transpose((1, 2, 0)), (w0, h0))[:, :, np.newaxis]
            return pred

    def segment(self, images, net, ckpt, device, precision, image_size, remove, alpha):
        ckpt = os.path.realpath(ckpt)

        device = torch.device(device)
        model = AnimeSegmentation.try_load(net, ckpt, device)
        model.eval()
        model.to(device)

        outputs = []
        first_mask = None
        for image in images:
            i = 255. * image.cpu().numpy()
            img = cv2.cvtColor(np.clip(i, 0, 255).astype(np.uint8), cv2.COLOR_BGR2RGB)
            mask = self.get_mask(model, img, use_amp=precision == "fp16", s=image_size)

            img = np.concatenate(
                (mask * img + 1 - mask, mask * 255), axis=2).astype(np.uint8)

            img = cv2.cvtColor(img, cv2.COLOR_RGBA2BGRA)

            if remove == "background":
                # Store mask if we are first
                if first_mask is None:
                    mask = img[:, :, 3].astype(np.float32) / 255.0
                    mask = torch.from_numpy(mask)
                    first_mask = 1. - mask
            else:
                # Copy the source image
                i = i.copy()

                # Add alpha channel if it isnt present
                if i.shape[2] == 3:
                    i = np.concatenate([i, np.ones((i.shape[0], i.shape[1], 1), dtype=i.dtype) * 255], axis=2)

                # Remove non transparent pixels in segmented image from source
                mask = img[:, :, 3] > 0
                i[mask] = [0, 0, 0, 0]
                img = i

                # Store mask if we are first
                if first_mask is None:
                    mask = img[:, :, 3].astype(np.float32, copy=True) / 255.0
                    mask = torch.from_numpy(mask)
                    first_mask = 1. - mask

            if alpha == "no":
                # Remove alpha channel
                img = img[:, :, :3]

            img = img.astype(np.float32) / 255.0
            img = torch.from_numpy(img)
            outputs.append(img)

        # if len(outputs) == 1:
        #     outputs = outputs[0]

        return (outputs, first_mask,)


NODE_CLASS_MAPPINGS = {
    "AnimeSegmentation": Segment,
}
