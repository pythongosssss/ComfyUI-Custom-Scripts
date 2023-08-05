# ComfyUI-Custom-Scripts

# Installation

1. Clone the repository:
`git clone https://github.com/pythongosssss/ComfyUI-Custom-Scripts.git`  
to your ComfyUI `custom_nodes` directory

   The script will then automatically install all custom scripts and nodes.  
   It will attempt to use symlinks and junctions to prevent having to copy files and keep them up to date.

- For uninstallation:
  - Delete the cloned repo in `custom_nodes`
  - Ensure `web/extensions/pysssss/CustomScripts` has also been removed

# Update
1. Navigate to the cloned repo e.g. `custom_nodes/ComfyUI-Custom-Scripts`
2. `git pull`

# Features

## Auto Arrange Graph
![image](https://github.com/pythongosssss/ComfyUI-Custom-Scripts/assets/125205205/04b06081-ca6f-4c0f-8584-d0a157c36747)  
Adds a menu option to auto arrange the graph in order of execution, this makes very wide graphs!

## Always Snap to Grid
![image](https://github.com/pythongosssss/ComfyUI-Custom-Scripts/assets/125205205/66f36d1f-e579-4959-9880-9a9624922e3a)  
Adds a setting to make moving nodes always snap to grid.

## [Testing] "Better" Loader Lists
![image](https://github.com/pythongosssss/ComfyUI-Custom-Scripts/assets/125205205/664caa71-f25f-4a96-a04a-1466d6b2b8b4)  
Adds custom Lora and Checkpoint loader nodes, these have the ability to show preview images, just place a png or jpg next to the file and it'll display in the list on hover (e.g. sdxl.safetensors and sdxl.png).  
![image](https://github.com/pythongosssss/ComfyUI-Custom-Scripts/assets/125205205/e15b5e83-4f9d-4d57-8324-742bedf75439)  
Optionally enable subfolders via the settings, subfolders currently don't support filtering but support should be coming soon!  

## Constrain Image
Adds a node for resizing an image to a max & min size optionally cropping if required.

## Custom Colors
![image](https://github.com/pythongosssss/ComfyUI-Custom-Scripts/assets/125205205/fa7883f3-f81c-49f6-9ab6-9526e4debab6)  
Adds a custom color picker to nodes & groups

## Favicon Status
![image](https://user-images.githubusercontent.com/125205205/230171227-31f061a6-6324-4976-bed9-723a87500cf3.png)
![image](https://user-images.githubusercontent.com/125205205/230171445-c7202a45-b511-4d69-87fa-945ad44c063f.png)  
Adds a favicon and title to the window, favicon changes color while generating and the window title includes the number of prompts in the queue

## Image Feed
![image](https://github.com/pythongosssss/ComfyUI-Custom-Scripts/assets/125205205/caea0d48-85b9-4ca9-9771-5c795db35fbc)
Adds a panel showing images that have been generated in the current session, you can control the direction that images are added and the position of the panel via the ComfyUI settings screen and the size of the panel and the images via the sliders at the top of the panel.  
![image](https://github.com/pythongosssss/ComfyUI-Custom-Scripts/assets/125205205/ca093d38-41a3-4647-9223-5bd0b9ee4f1e)

## KSampler (Advanced) denoise helper
Provides a simple method to set custom denoise on the advanced sampler  
![image](https://github.com/pythongosssss/ComfyUI-Custom-Scripts/assets/125205205/42946bd8-0078-4c7a-bfe9-7adb1382b5e2)
![image](https://github.com/pythongosssss/ComfyUI-Custom-Scripts/assets/125205205/7cfccb22-f155-4848-934b-a2b2a6efe16f)

## Lock Nodes & Groups
![image](https://user-images.githubusercontent.com/125205205/230172868-5c5a943c-ade1-4799-bf80-cc931da5d4b2.png)  
Adds a lock option to nodes & groups that prevents you from moving them until unlocked

## Lora Subfolders
![image](https://user-images.githubusercontent.com/125205205/230173454-9ade50fb-6f08-435a-8c30-e87e8043de48.png)  
Changes the lora menu into a dropdown of subfolders, not currently compatible with the searching/filtering (the search won't appear on submenus)

## Math Expression
Allows for evaluating complex expressions using values from the graph.  
![image](https://github.com/pythongosssss/ComfyUI-Custom-Scripts/assets/125205205/c0047cbd-8512-46ae-841f-f570b93f700b)  
Other nodes values can be referenced via the `Node name for S&R` via the `Properties` menu item on a node, or the node title.  
The above example evaluates as `(10 * 512) / 2 + 1000`.  
## Node Finder
![image](https://github.com/pythongosssss/ComfyUI-Custom-Scripts/assets/125205205/177d2b67-acbc-4ec3-ab31-7c295a98c194)  
Adds a menu item for following/jumping to the executing node, and a menu to quickly go to a node of a specific type.

## Preset Text
![image](https://user-images.githubusercontent.com/125205205/230173939-08459efc-785b-46da-93d1-b02f0300c6f4.png)  
Adds a node that lets you save and use text presets (e.g. for your 'normal' negatives)

## Quick Nodes
![image](https://user-images.githubusercontent.com/125205205/230174266-5232831a-a03b-4bf7-bc8b-c45466a0bc64.png)  
Adds various menu items to some nodes for quickly setting up common parts of graphs

## Play Sound
![image](https://github.com/pythongosssss/ComfyUI-Custom-Scripts/assets/125205205/6e615663-ab55-4b78-82d9-4881769db9c5)  
Plays a sound when the node is executed, either after each prompt or only when the queue is empty for queuing multiple prompts.  
You can customize the sound by replacing the mp3 file `web/extensions/pysssss/CustomScripts/assets\notify.mp3`

## Show Text
![image](https://user-images.githubusercontent.com/125205205/230174888-c004fd48-da78-4de9-81c2-93a866fcfcd1.png)  
Takes input from a node that produces a string and displays it, useful for things like interrogator, prompt generators, etc.

## Show Image on Menu
![image](https://github.com/pythongosssss/ComfyUI-Custom-Scripts/assets/125205205/b6ab58f2-583b-448c-bcfc-f93f5cdab0fc)  
Shows the current generating image on the menu at the bottom, you can disable this via the settings menu.

## String Function
![image](https://github.com/pythongosssss/ComfyUI-Custom-Scripts/assets/125205205/01107137-8a93-4765-bae0-fcc110a09091)  
Supports appending and replacing text  
`tidy_tags` will add commas between parts when in `append` mode.  
`replace` mode supports regex replace by using `/your regex here/` and you can reference capturing groups using `\number` e.g. `\1`

## Touch Support
Provides basic support for touch screen devices, its not perfect but better than nothing

## Widget Defaults
![image](https://github.com/pythongosssss/ComfyUI-Custom-Scripts/assets/125205205/3d675032-2b19-4da8-a7d7-fa2d7c555daa)  
Allows you to specify default values for widgets when adding new nodes, the values are configured via the settings menu  
![image](https://github.com/pythongosssss/ComfyUI-Custom-Scripts/assets/125205205/7b57a3d8-98d3-46e9-9b33-6645c0da41e7)

## Workflows
Adds options to the menu for saving + loading workflows:  
![image](https://github.com/pythongosssss/ComfyUI-Custom-Scripts/assets/125205205/7b5a3012-4c59-47c6-8eea-85cf534403ea)

## Workflow Images
![image](https://github.com/pythongosssss/ComfyUI-Custom-Scripts/assets/125205205/06453fd2-c020-46ee-a7db-2b8bf5bcba7e)  
Adds menu options for importing/exporting the graph as SVG and PNG showing a view of the nodes

## (Testing) Reroute Primitive
![image](https://github.com/pythongosssss/ComfyUI-Custom-Scripts/assets/125205205/8b870eef-d572-43f9-b394-cfa7abbd2f98)  Provides a node that allows rerouting primitives.  
The node can also be collapsed to a single point that you can drag around.  
![image](https://github.com/pythongosssss/ComfyUI-Custom-Scripts/assets/125205205/a9bd0112-cf8f-44f3-af6d-f9a8fed152a7)  
Warning: Don't use normal reroutes or primitives with these nodes, it isn't tested and this node replaces their functionality.

<br>
<br>


## WD14 Tagger
Moved to: https://github.com/pythongosssss/ComfyUI-WD14-Tagger

## Link Render Mode  
![image](https://github.com/pythongosssss/ComfyUI-Custom-Scripts/assets/125205205/ad3be76b-43b1-455e-a64a-bf2a6571facf)  
Allows you to control the rendering of the links between nodes between straight, linear & spline, e.g. Straight. 

<br>
<br>

# Changelog
## 2023-08-05
### Major
- 🚨 The ComfyUI Lora Loader no longer has subfolders, due to compatibility issues you need to use my Lora Loader if you want subfolers, these can be enabled/disabled on the node via a setting (🐍 Enable submenu in custom nodes)
### New
- ✨ Add custom Checkpoint Loader supporting images & subfolders
- ✨ Add Play Sound node for notifying when a prompt is finished
### Minor
- ✨ Quick Nodes supports new LoRA loader ("Add 🐍 LoRA")
- ♻️ Disable link render mode if ComfyUI has native support

## 2023-08-04
### Minor
- ✨ Always snap to grid now applies on node resize
- 🐛 Fix reroute primitive widget value not being restored on reload
- ✨ Workflows now reuse last filename from load & save - save must be done by the submenu

## 2023-08-02
### New
- ✨ Add "Always snap to grid" setting that does the same as holding shift, aligning nodes to the grid
### Minor
- 🚨 No longer populates image feed when its closed
- 🐛 Allow lock/unlock of multiple selected nodes

# Changelog
## 2023-08-01
### Minor
- 🎨 Image feed now uses comfy theme variables for colors
- 🐛 Link render mode redraws graph on change of setting instead of requiring mouse move

## 2023-07-30
- 🎨 Update to image feed to make more user friendly, change image size to column count, various other tweaks (thanks @DrJKL)

## 2023-07-30
### Major
- 🐛 Fix issue with context menu (right click) not working for some users after Lora script updates
### New
- ✨ Add "Custom" option to color menu for nodes & groups
### Minor
- 🐛 Fix String Function values converted to unconnected inputs outputting the text "undefined"

## 2023-07-29
### New
- ✨ Added Reroute Primitive combining the functionality of reroutes + primitives, also allowing collapsing to a single point.
- ✨ Add support for exporting workflow images as PNGs and optional embedding of metadata in PNG and SVG
### Minor
- ✨ Remove new lines in Math Expression node
- ✨ String function is now an output node
- 🐛 Fix conflict between Lora Loader + Lora submenu causing the context menu to be have strangely (#23, #24)
- 🎨 Rename "SVG -> Import/Export" to "Workflow Image" -> Import/Export

## 2023-07-27
### New
- ✨ Added custom Lora Loader that includes image previews
### Minor
- ✨ Add preview output to string function node
- 📄 Updated missing/out of date parts of readme
- 🐛 Fix crash on show image on menu when set to not show (thanks @DrJKL)
- 🐛 Fix incorrect category (util vs utils) for math node (thanks @DrJKL)

## 2023-07-27
### Minor
- ✨ Save Image Feed close state
- 🐛 Fix unlocked group size calculation

## 2023-07-21 + 22
### Minor
- 🐛 Fix preset text incompatibility with Impact Pack (thanks @ltdrdata)

## 2023-07-13
### New
- ✨ Add Math Expression node for evaluating expressions using values from the graph
### Minor
- ✨ Add settings for image feed location + image order

## 2023-06-27
### Minor
- 🐛 Fix unlocking group using incorrect size
- ✨ Save visibility of image feed

## 2023-06-18
### Major Changes
- ✨ Added auto installation of scripts and `__init__` (thanks @TashaSkyUp)
- ♻️ Reworked folder structure
- 🚨 Renamed a number of nodes to include `pysssss` to prevent name conflicts
- 🚨 Remove Latent Upscale By as it is now a built in node in ComfyUI
- 🚨 Removed Anime Segmentation to own repo
### New
- ✨ Add Link Render Mode setting to choose how links are rendered
- ✨ Add Constrain Image node for resizing nodes to a min/max resolution with optional cropping
- ✨ Add Show Image On Menu to include the latest image output on the menu
- ✨ Add KSamplerAdvanced simple denoise prompt for configuring the node using steps + denoise
- 🎨 Add sizing options to Image Feed

### Other
- ♻️ Include [canvas2svg](https://gliffy.github.io/canvas2svg/) for SVG export in assets to prevent downloading at runtime
- 🎨 Add background color (using theme color) to exported SVG
- 🐛 Fix Manage Widget Defaults to work with new ComfyUI settings dialog
- 🐛 Increase Image Feed z-index to prevent node text overlapping
