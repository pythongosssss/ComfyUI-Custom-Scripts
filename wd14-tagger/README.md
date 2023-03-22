Based on https://huggingface.co/spaces/SmilingWolf/wd-v1-4-tags  
This requires onnxruntime or onnxruntime-gpu to run, so pip install it

Links to the models are found at the top of the url above  
Follow the link to one, e.g. convnextv2, go to Files 
Download model.onnx + selected_tags.csv  
Rename the model.onnx + csv the same thing, e.g. convnextv2.onnx + convnextv2.csv  
Place them in comfy_extras/wd14_models  

Place wd14tagger.py in custom_nodes

This currently requires this branch of ComfyUI to be of any use:  
https://github.com/pythongosssss/ComfyUI/tree/custom-ws-messages

You can right click the CLIPTextEncode node  
convert text to input  
then feed the results of this node into the text encode
