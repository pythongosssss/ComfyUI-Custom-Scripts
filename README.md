# ComfyUI-Custom-Scripts

### ⚠️ While these extensions work for the most part, i'm very busy at the moment and so unable to keep on top of everything here, thanks for your patience!

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

## Autocomplete
![image](https://github.com/pythongosssss/ComfyUI-Custom-Scripts/assets/125205205/b5971135-414f-4f4e-a6cf-2650dc01085f)  
Provides embedding and custom word autocomplete. You can view embedding details by clicking on the info icon on the list.  
Define your list of custom words via the settings.  
![image](https://github.com/pythongosssss/ComfyUI-Custom-Scripts/assets/125205205/160ef61c-7d7e-49d0-b60f-5a1501b74c9d)  
You can quickly default to danbooru tags using the Load button, or load/manage other custom word lists.  
![image](https://github.com/pythongosssss/ComfyUI-Custom-Scripts/assets/125205205/cc180b35-5f45-442f-9285-3ddf3fa320d0)

## Auto Arrange Graph
![image](https://github.com/pythongosssss/ComfyUI-Custom-Scripts/assets/125205205/04b06081-ca6f-4c0f-8584-d0a157c36747)  
Adds a menu option to auto arrange the graph in order of execution, this makes very wide graphs!

## Always Snap to Grid
![image](https://github.com/pythongosssss/ComfyUI-Custom-Scripts/assets/125205205/66f36d1f-e579-4959-9880-9a9624922e3a)  
Adds a setting to make moving nodes always snap to grid.

## [Testing] "Better" Loader Lists
![image](https://github.com/pythongosssss/ComfyUI-Custom-Scripts/assets/125205205/664caa71-f25f-4a96-a04a-1466d6b2b8b4)  
Adds custom Lora and Checkpoint loader nodes, these have the ability to show preview images, just place a png or jpg next to the file and it'll display in the list on hover (e.g. sdxl.safetensors and sdxl.png).  
Optionally enable subfolders via the settings:  
![image](https://github.com/pythongosssss/ComfyUI-Custom-Scripts/assets/125205205/e15b5e83-4f9d-4d57-8324-742bedf75439)   
Adds an "examples" widget to load sample prompts, triggerwords, etc:  
![image](https://github.com/pythongosssss/ComfyUI-Custom-Scripts/assets/125205205/ad1751e4-4c85-42e7-9490-e94fb1cbc8e7)  
These should be stored in a folder matching the name of the model, e.g. if it is `loras/add_detail.safetensors` put your files in as  `loras/add_detail/*.txt`  
To quickly save a generated image as the preview to use for the model, you can right click on an image on a node, and select Save as Preview and choose the model to save the preview for:  
![image](https://github.com/pythongosssss/ComfyUI-Custom-Scripts/assets/125205205/9fa8e9db-27b3-45cb-85c2-0860a238fd3a)

## Checkpoint/LoRA/Embedding Info
![image](https://github.com/pythongosssss/ComfyUI-Custom-Scripts/assets/125205205/6b67bf40-ee17-4fa6-a0c1-7947066bafc2)
![image](https://github.com/pythongosssss/ComfyUI-Custom-Scripts/assets/125205205/32405df6-b367-404f-a5df-2d4347089a9e)  
Adds "View Info" menu option to view details about the selected LoRA or Checkpoint. To view embedding details, click the info button when using embedding autocomplete.

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
![image](https://github.com/pythongosssss/ComfyUI-Custom-Scripts/assets/125205205/cfca09d9-38e5-4ecd-8b73-1455009fcd67)  
Adds a lock option to nodes & groups that prevents you from moving them until unlocked

## Math Expression
Allows for evaluating complex expressions using values from the graph. You can input `INT`, `FLOAT`, `IMAGE` and `LATENT` values.  
![image](https://github.com/pythongosssss/ComfyUI-Custom-Scripts/assets/125205205/1593edde-67b8-45d8-88cb-e75f52dba039)  
Other nodes values can be referenced via the `Node name for S&R` via the `Properties` menu item on a node, or the node title.  
Supported operators: `+ - * /` (basic ops) `//` (floor division) `**` (power) `^` (xor) `%` (mod)  
Supported functions `floor(num, dp?)` `floor(num)` `ceil(num)` `randomint(min,max)`  
If using a `LATENT` or `IMAGE` you can get the dimensions using `a.width` or `a.height` where `a` is the input name.

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
![image](https://github.com/pythongosssss/ComfyUI-Custom-Scripts/assets/125205205/9bcf9fb3-5898-4432-a974-fb1e17d3b7e8)  
Plays a sound when the node is executed, either after each prompt or only when the queue is empty for queuing multiple prompts.  
You can customize the sound by replacing the mp3 file `web/extensions/pysssss/CustomScripts/assets\notify.mp3`

## System Notification
![image](https://github.com/pythongosssss/ComfyUI-Custom-Scripts/assets/30354775/993fd783-5cd6-4779-aa97-173bc06cc405)
![image](https://github.com/pythongosssss/ComfyUI-Custom-Scripts/assets/30354775/e45227fb-5714-4f45-b96b-6601902ef6e2)

Sends a system notification via the browser when the node is executed, either after each prompt or only when the queue is empty for queuing multiple prompts.

## [WIP] Repeater
![image](https://github.com/pythongosssss/ComfyUI-Custom-Scripts/assets/125205205/ec0dac25-14e4-4d44-b975-52193656709d)
Node allows you to either create a list of N repeats of the input node, or create N outputs from the input node.  
You can optionally decide if you want to reuse the input node, or create a new instance each time (e.g. a Checkpoint Loader would want to be re-used, but a random number would want to be unique)
TODO: Type safety on the wildcard outputs to require match with input

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

## 2023-09-22
### Minor
- ✨ Use Civitai image as preview
- 🐛 CTRL+Enter on autocomplete will no longer accept the suggestions as it is the shortcut for queuing a prompt.
- 🐛 Fix using numbers in widget defaults
- ✨ Support setting node properties (e.g. title, colors) via widget defaults

## 2023-09-13
### New
- ✨ Ability to "send" an image to a Load Image node in either the current or a different workflow
### Minor
- ✨ Add support for A1111 autocomplete CSV format
- ✨ Allow setting custom node for middle click to add node

## 2023-09-10
### Minor
- 🐛 Fix rendering new lines in workflow image exports

## 2023-09-08
### New
- ✨ Add Load + Save Text file nodes, you can configure the allowed directories in the `user/text_file_dirs.json` file
### Minor
- 🎨 Show autocomplete alias word on popup
- ✨ Add setting to disable middle click from adding a reroute node
- 🎨 Add prompt for setting custom column count on image feed  (click the column count label)

## 2023-09-07
### New
- ✨ Support Unicode (e.g. Chinese) and word aliases in autocomplete.

## 2023-09-05
### Minor
- 🎨 Disable autocomplete on math node
- 🐛 Fix Show Text node always resizing on update

### Minor
- 🎨 Better adding of preview image to menu (thanks to @zeroeightysix)
- 🎨 UX improvements for image feed (thanks to @birdddev)
- 🐛 Fix Math Expression expression not showing on updated ComfyUI
- 
## 2023-08-30
### Minor
- 🎨 Allow jpeg lora/checkpoint preview images
- ✨ Save ShowText value to embedded image metadata
  
## 2023-08-29
### Minor
- ✨ Option to auto insert `, ` after autocomplete
- 🎨 Exclude arrow keys from triggering autocomplete
- 🐛 Split paths by `\` and `/` on Windows for submenus

## 2023-08-28
### New
- ✨ Add custom autocomplete word list setting
- ✨ Support autocomplete word priority sorting
- ✨ Support autocomplete matching anywhere in word rather than requiring starts with

## 2023-08-27
### New
- ✨ Add Checkpoint info
- ✨ Add embedding autocomplete
- ✨ Add embedding info
### Major
- ♻️ Refactor LoRA info

## 2023-08-26
### Minor
- 🐛 Fix using text widget values in Math Expression not casting to number
- 🎨 Fix padding on lightbox next arrow
 
## 2023-08-25
### Minor
- ♻️ Support older versions of python
  
## 2023-08-24
### Minor
- 🐛 Fix extracting links from LoRA info notes

## 2023-08-23
### Major
- 🚨 Update to use `WEB_DIRECTORY` feature instead of manual linking/copying web files

## 2023-08-22
### New
- ✨ Math Expression now supports IMAGE and LATENT inputs, to access the dimensions use `a.width`, `b.height`
- 🎨 Removed STRING output on Math Expression, now draws the result onto the node

## 2023-08-21
### New
- ✨ Allow custom note (named {file}.txt) to show in LoRA info
- ✨ Query Civita API using the model hash to provide link
  
## 2023-08-20
### New
- ✨ Add LoRA Info menu option for displaying LoRA metadata
### Minor
- 🐛 Fix crash on preset text replacement (thanks to @sjuxax)

## 2023-08-19
### New
- ✨ Add support for importing JPG files with embedded metadata (e.g. from Civitai)
### Minor
- 🐛 Fix crash on graph arrange where LiteGraph sometimes stores links to deleted nodes
- 🐛 Fix a couple of rendering issues in workflow export

## 2023-08-18
### New
- ✨ Add "example" widget to custom LoRA + Checkpoint loader allowing you to quickly view saved prompts, triggers, etc
- ✨ Add quick "Save as Preview" option on images to save generated images for models

## 2023-08-16
### New
- ✨ Add repeater node for generating lists or quickly duplicating nodes
### Minor
- 🐛 Support quick Add LoRA on custom Checkpoint Loader
- ✨ Support `randomint(min,max)` function in math node
- 🎨 Use relative imports to support proxied urls not on root path (thanks to @mcmonkey4eva)

## 2023-08-13
### Minor
- ✨ Support `round` `floor` `ceil` functions in math node
- 🐛 Fix floor division in math node

## 2023-08-12
### New
- 🎨 Image feed now uses a lightbox for showing images
### Minor
- 🎨 Better loader lists now supports images named `{name}.preview.png`

## 2023-08-11
### Minor
- ✨ Enable filter box on submenus
  
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
