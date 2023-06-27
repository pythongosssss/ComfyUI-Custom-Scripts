# ComfyUI-Custom-Scripts

> &#x26a0;&#xfe0f; **If updating from a version prior to 2023-06-18**: Many of the nodes have been renamed to include `pysssss` to prevent conflicts with other nodes. If you get missing nodes, please replace them with the new names.

> &#x26a0;&#xfe0f; **Auto installation process is still a new feature in need of testing, if you have any problems please log an issue**

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
![image](https://user-images.githubusercontent.com/125205205/230170664-acddff3e-f47b-452e-970e-0a7279734b96.png)  
Adds a menu option to auto arrange the graph in order of execution, this makes very wide graphs!

## Workflow SVG
![image](https://user-images.githubusercontent.com/125205205/230170905-904888e7-d980-4713-b94f-0656f062c406.png)  
Adds menu options for importing and exporting the graph as SVG showing a view of the nodes

## Favicon Status
![image](https://user-images.githubusercontent.com/125205205/230171227-31f061a6-6324-4976-bed9-723a87500cf3.png)
![image](https://user-images.githubusercontent.com/125205205/230171445-c7202a45-b511-4d69-87fa-945ad44c063f.png)  
Adds a favicon and title to the window, favicon changes color while generating and the window title includes the number of prompts in the queue

## Image Feed
![image](https://user-images.githubusercontent.com/125205205/230172436-3fbeb426-a0e8-4a89-9a1d-c7383d11a9db.png)  
Adds a panel at the bottom of the window showing images that have been generated in the current session

## Lock Nodes & Groups
![image](https://user-images.githubusercontent.com/125205205/230172868-5c5a943c-ade1-4799-bf80-cc931da5d4b2.png)  
Adds a lock option to nodes & groups that prevents you from moving them until unlocked

## Lora Subfolders
![image](https://user-images.githubusercontent.com/125205205/230173454-9ade50fb-6f08-435a-8c30-e87e8043de48.png)  
Changes the lora menu into a dropdown of subfolders, not currently compatible with the searching/filtering (the search won't appear on submenus)

## Preset Text
![image](https://user-images.githubusercontent.com/125205205/230173939-08459efc-785b-46da-93d1-b02f0300c6f4.png)  
Adds a node that lets you save and use text presets (e.g. for your 'normal' negatives)

## Quick Nodes
![image](https://user-images.githubusercontent.com/125205205/230174266-5232831a-a03b-4bf7-bc8b-c45466a0bc64.png)  
Adds various menu items to some nodes for quickly setting up common parts of graphs

## Show Text
![image](https://user-images.githubusercontent.com/125205205/230174888-c004fd48-da78-4de9-81c2-93a866fcfcd1.png)  
Takes input from a node that produces a string and displays it, useful for things like interrogator, prompt generators, etc.

## Touch Support
Provides basic support for touch screen devices, its not perfect but better than nothing

## WD14 Tagger
Moved to: https://github.com/pythongosssss/ComfyUI-WD14-Tagger

---
<br>

# Changelog

## 2023-06-27
### Minor
- ✨ Save Image Feed close state
- 🐛 Fix unlocked group size calculation

## 2023-06-18
### Major Changes
- ✨ Added auto installation of scripts and `__init__` with thanks to @TashaSkyUp
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