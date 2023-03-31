# https://github.com/dbolya/tomesd

# MIT License

# Copyright (c) 2023 Daniel Bolya

# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:

# The above copyright notice and this permission notice shall be included in all
# copies or substantial portions of the Software.

# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
# SOFTWARE.

# @article{bolya2023tomesd,
#   title={Token Merging for Fast Stable Diffusion},
#   author={Bolya, Daniel and Hoffman, Judy},
#   journal={arXiv},
#   year={2023}
# }

import torch


def isinstance_str(x: object, cls_name: str):
    """
    Checks whether x has any class *named* cls_name in its ancestry.
    Doesn't require access to the class's implementation.
    
    Useful for patching!
    """

    for _cls in x.__class__.__mro__:
        if _cls.__name__ == cls_name:
            return True
    
    return False
def do_nothing(x: torch.Tensor, mode:str=None):
    return x

import math

def make_tome_block(
        block_class,
        ratio: float,
        max_downsample: int,
        merge_attn: bool,
        merge_crossattn: bool,
        merge_mlp: bool,
        sx: int, sy: int, no_rand: bool):
    """
    Make a patched class on the fly so we don't have to import any specific modules.
    This patch applies ToMe to the forward function of the block.
    """

    class ToMeBlock(block_class):
        # Save for unpatching later
        _parent = block_class

        def _forward(self, x: torch.Tensor, context: torch.Tensor = None) -> torch.Tensor:
            original_h, original_w = self._tome_info["size"]
            original_tokens = original_h * original_w
            downsample = int(math.sqrt(original_tokens // x.shape[1]))

            if downsample <= max_downsample:
                w = original_w // downsample
                h = original_h // downsample
                r = int(x.shape[1] * ratio)
                m, u = bipartite_soft_matching_random2d(x, w, h, sx, sy, r, no_rand)
            else:
                m, u = (do_nothing, do_nothing)

            m_a, u_a = (m, u) if merge_attn      else (do_nothing, do_nothing)
            m_c, u_c = (m, u) if merge_crossattn else (do_nothing, do_nothing)
            m_m, u_m = (m, u) if merge_mlp       else (do_nothing, do_nothing)

            # This is where the meat of the computation happens
            x = u_a(self.attn1(m_a(self.norm1(x)), context=context if self.disable_self_attn else None)) + x
            x = u_c(self.attn2(m_c(self.norm2(x)), context=context)) + x
            x = u_m(self.ff(m_m(self.norm3(x)))) + x

            return x
    
    return ToMeBlock



def make_tome_model(model_class):
    """
    Make a patched class on the fly so we don't have to import any specific modules.
    
    This patches the forward function of the model only to get the current image size.
    Probably would be better off finding a way to get the size some other way.
    """

    if model_class.__name__ == "ToMeDiffusionModel":
        model_class = model_class._parent
    
    class ToMeDiffusionModel(model_class):
        # Save for later
        _parent = model_class

        def forward(self, *args, **kwdargs):
            self._tome_info["size"] = (args[0].shape[2], args[0].shape[3])
            return super().forward(*args, **kwdargs)

    return ToMeDiffusionModel

def apply_patch(
        model: torch.nn.Module,
        ratio: float = 0.5,
        max_downsample: int = 1,
        sx: int = 2, sy: int = 2,
        use_rand: bool = True,
        merge_attn: bool = True,
        merge_crossattn: bool = False,
        merge_mlp: bool = False):
    """
    Patches a stable diffusion model with ToMe.
    Apply this to the highest level stable diffusion object (i.e., it should have a .model.diffusion_model).
    Important Args:
     - model: A top level Stable Diffusion module to patch in place. Should have a ".model.diffusion_model"
     - ratio: The ratio of tokens to merge. I.e., 0.4 would reduce the total number of tokens by 40%.
              The maximum value for this is 1-(1/(sx*sy)). By default, the max is 0.75 (I recommend <= 0.5 though).
              Higher values result in more speed-up, but with more visual quality loss.
    
    Args to tinker with if you want:
     - max_downsample [1, 2, 4, or 8]: Apply ToMe to layers with at most this amount of downsampling.
                                       E.g., 1 only applies to layers with no downsampling (4/15) while
                                       8 applies to all layers (15/15). I recommend a value of 1 or 2.
     - sx, sy: The stride for computing dst sets (see paper). A higher stride means you can merge more tokens,
               but the default of (2, 2) works well in most cases. Must divide the image size.
     - use_rand: Whether or not to allow random perturbations when computing dst sets (see paper). Usually
                 you'd want to leave this on, but if you're having weird artifacts try turning this off.
     - merge_attn: Whether or not to merge tokens for attention (recommended).
     - merge_crossattn: Whether or not to merge tokens for cross attention (not recommended).
     - merge_mlp: Whether or not to merge tokens for the mlp layers (very not recommended).
    """

    # Make sure the module is not currently patched
    remove_patch(model)

    if not hasattr(model, "model") or not hasattr(model.model, "diffusion_model"):
        # Provided model not supported
        raise RuntimeError("Provided model was not a Stable Diffusion / Latent Diffusion model, as expected.")

    diffusion_model = model.model.diffusion_model
    diffusion_model._tome_info = { "size": None, }
    diffusion_model.__class__ = make_tome_model(diffusion_model.__class__)

    for _, module in diffusion_model.named_modules():
        # If for some reason this has a different name, create an issue and I'll fix it
        if isinstance_str(module, "BasicTransformerBlock"):
            module.__class__ = make_tome_block(
                module.__class__, ratio, max_downsample,
                merge_attn, merge_crossattn, merge_mlp,
                sx, sy, not use_rand
            )
            module._tome_info = diffusion_model._tome_info

            # Something introduced in SD 2.0
            if not hasattr(module, "disable_self_attn"):
                module.disable_self_attn = False

    return model

def remove_patch(model: torch.nn.Module):
    """ Removes a patch from a ToMe Diffusion module if it was already patched. """\
    
    for _, module in model.named_modules():
        if module.__class__.__name__ == "ToMeBlock":
            module.__class__ = module._parent
        elif module.__class__.__name__ == "ToMeDiffusionModel":
            module.__class__ = module._parent
    
    return model

def bipartite_soft_matching_random2d(metric: torch.Tensor,
                                     w: int, h: int, sx: int, sy: int, r: int,
                                     no_rand: bool = False):
    """
    Partitions the tokens into src and dst and merges r tokens from src to dst.
    Dst tokens are partitioned by choosing one randomy in each (sx, sy) region.
    Args:
     - metric [B, N, C]: metric to use for similarity
     - w: image width in tokens
     - h: image height in tokens
     - sx: stride in the x dimension for dst, must divide w
     - sy: stride in the y dimension for dst, must divide h
     - r: number of tokens to remove (by merging)
     - no_rand: if true, disable randomness (use top left corner only)
    """
    B, N, _ = metric.shape

    if r <= 0:
        return do_nothing, do_nothing
    
    with torch.no_grad():
        
        hsy, wsx = h // sy, w // sx

        # For each sy by sx kernel, randomly assign one token to be dst and the rest src
        idx_buffer = torch.zeros(1, hsy, wsx, sy*sx, 1, device=metric.device)

        if no_rand:
            rand_idx = torch.zeros(1, hsy, wsx, 1, 1, device=metric.device, dtype=torch.int64)
        else:
            rand_idx = torch.randint(sy*sx, size=(1, hsy, wsx, 1, 1), device=metric.device)
        
        idx_buffer.scatter_(dim=3, index=rand_idx, src=-torch.ones_like(rand_idx, dtype=idx_buffer.dtype))
        idx_buffer = idx_buffer.view(1, hsy, wsx, sy, sx, 1).transpose(2, 3).reshape(1, N, 1)
        rand_idx   = idx_buffer.argsort(dim=1)

        num_dst = int((1 / (sx*sy)) * N)
        a_idx = rand_idx[:, num_dst:, :] # src
        b_idx = rand_idx[:, :num_dst, :] # dst

        def split(x):
            C = x.shape[-1]
            src = x.gather(dim=1, index=a_idx.expand(B, N - num_dst, C))
            dst = x.gather(dim=1, index=b_idx.expand(B, num_dst, C))
            return src, dst

        metric = metric / metric.norm(dim=-1, keepdim=True)
        a, b = split(metric)
        scores = a @ b.transpose(-1, -2)

        # Can't reduce more than the # tokens in src
        r = min(a.shape[1], r)

        node_max, node_idx = scores.max(dim=-1)
        edge_idx = node_max.argsort(dim=-1, descending=True)[..., None]

        unm_idx = edge_idx[..., r:, :]  # Unmerged Tokens
        src_idx = edge_idx[..., :r, :]  # Merged Tokens
        dst_idx = node_idx[..., None].gather(dim=-2, index=src_idx)

    def merge(x: torch.Tensor, mode="mean") -> torch.Tensor:
        src, dst = split(x)
        n, t1, c = src.shape
        
        unm = src.gather(dim=-2, index=unm_idx.expand(n, t1 - r, c))
        src = src.gather(dim=-2, index=src_idx.expand(n, r, c))
        dst = dst.scatter_reduce(-2, dst_idx.expand(n, r, c), src, reduce=mode)

        return torch.cat([unm, dst], dim=1)

    def unmerge(x: torch.Tensor) -> torch.Tensor:
        unm_len = unm_idx.shape[1]
        unm, dst = x[..., :unm_len, :], x[..., unm_len:, :]
        _, _, c = unm.shape

        src = dst.gather(dim=-2, index=dst_idx.expand(B, r, c))

        # Combine back to the original shape
        out = torch.zeros(B, N, c, device=x.device, dtype=x.dtype)
        out.scatter_(dim=-2, index=b_idx.expand(B, num_dst, c), src=dst)
        out.scatter_(dim=-2, index=a_idx.expand(B, a_idx.shape[1], 1).gather(dim=1, index=unm_idx).expand(B, unm_len, c), src=unm)
        out.scatter_(dim=-2, index=a_idx.expand(B, a_idx.shape[1], 1).gather(dim=1, index=src_idx).expand(B, r, c), src=src)

        return out

    return merge, unmerge

class TomePatch:
    @classmethod
    def INPUT_TYPES(s):
        return {"required": {
           "model": ("MODEL",),
           "ratio": ("FLOAT", {"default": 0.5, "min": 0.0, "max": 1.0, "step": 0.1}),
        }}

    RETURN_TYPES = ("MODEL",)
    FUNCTION = "patch"

    CATEGORY = "utils"

    def patch(self, model, ratio):   
        model.model = apply_patch(model.model, ratio=ratio)
        return (model,)

# class TomeUnpatch:
#     @classmethod
#     def INPUT_TYPES(s):
#         return {"required": {
#            "model": ("MODEL",),
#         }}

#     RETURN_TYPES = ("MODEL",)
#     FUNCTION = "unpatch"

#     CATEGORY = "utils"

#     def unpatch(self, model, ratio):   
#         model.model = remove_patch(model.model)
#         return (model,)

NODE_CLASS_MAPPINGS = {
    "TomePatch": TomePatch,
    # "TomeUnpatch": TomeUnpatch,
}
