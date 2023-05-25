# ComfyUI-Custom-Scripts

# Installation
## Usage

1. Clone the repository:
git clone https://github.com/pythongosssss/ComfyUI-Custom-Scripts.git
2. Navigate to the repository directory:
cd ComfyUI-Custom-Scripts
3. Run the `InstallCustomNodes.py` script:
python InstallCustomNodes.py
4. Follow the prompts to choose between installation and uninstallation, as well as test mode.

- For installation:
  - Choose 'i' to install.
  - If the destination directory already exists, you will be prompted to remove it.
  - Choose whether to run in test mode (dry run) or perform the actual file movements.
  - The script will clone the repository, move the files, and create a mapping file.
  - If you choose not to run in test mode, the installation will be completed.

- For uninstallation:
  - Choose 'u' to uninstall.
  - The script will use the mapping file to undo the file movements.
  - Any errors encountered during the uninstallation process will be displayed, but the script will continue.
  - The script will remove both the files and empty directories.

5. Review the generated `move_mapping.yaml` file for the mapping of moved files.

6. If needed, repeat the steps above to perform installation or uninstallation again

**If the script has its own readme, that may include additional requirements so be sure to check it!**

## Anime Segmentation
![image](https://user-images.githubusercontent.com/125205205/230170464-90a60a6e-9dfa-4244-b027-4e13169c71f6.png)  
Takes an image/images and uses https://github.com/SkyTNT/anime-segmentation to remove the background or foreground.

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

## Latent Upscale By
![image](https://user-images.githubusercontent.com/125205205/230172680-9348b086-5278-472e-91ac-d08433b7b197.png)  
Allows upscaling by a factor instead of specific width and height

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
