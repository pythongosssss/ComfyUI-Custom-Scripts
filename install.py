import os
import subprocess
import shutil
import yaml

def clone_repo(repo_url, destination_path):
    command = ["git", "clone", repo_url, destination_path]
    subprocess.run(command, shell=True)


def move_files(source_dir, python_files_destination, all_else_files, test_mode=False):
    all_else_files = os.path.normpath(all_else_files)
    file_mapping = {}

    for root, dirs, files in os.walk(source_dir):
        # Ignore hidden directories
        dirs[:] = [d for d in dirs if not d.startswith('.')]

        for file in files:
            source_file_path = os.path.join(root, file)
            if file.endswith(".py"):
                if test_mode:
                    print(f"[TEST MODE] Moving Python file: {file}")
                    destination_file_path = os.path.join(python_files_destination, file)
                    file_mapping[source_file_path] = destination_file_path
                else:
                    destination_file_path = os.path.join(python_files_destination, file)
                    shutil.move(source_file_path, destination_file_path)
                    file_mapping[source_file_path] = destination_file_path
            else:
                relative_path = os.path.relpath(root, source_dir)
                destination_subdir = os.path.join(all_else_files, relative_path)
                destination_file_path = os.path.join(destination_subdir, file)
                if test_mode:
                    print(f"[TEST MODE] Moving non-Python file: {file} -> {destination_file_path}")
                    destination_file_path = os.path.normpath(destination_file_path)
                    file_mapping[source_file_path] = destination_file_path
                else:
                    os.makedirs(destination_subdir, exist_ok=True)
                    destination_file_path = os.path.normpath(destination_file_path)
                    shutil.move(source_file_path, destination_file_path)
                    file_mapping[source_file_path] = destination_file_path

    return file_mapping


def write_mapping_file(file_mapping, mapping_file_path):
    with open(mapping_file_path, "w") as file:
        yaml.dump(file_mapping, file)


import os


def undo_moves(file_mapping):
    directories = set()

    for source_file, destination_file in file_mapping.items():
        try:
            destination_dir = os.path.dirname(destination_file)
            directories.add(destination_dir)
            shutil.move(destination_file, source_file)
        except Exception as e:
            print(f"Error occurred during file move: {e}")

    # Remove empty directories
    for directory in directories:
        try:
            os.removedirs(directory)
        except Exception as e:
            print(f"Error occurred during directory removal: {e}")


def uninstall(mapping_file_path):
    if not os.path.exists(mapping_file_path):
        print("Mapping file not found. Cannot perform uninstallation.")
        return

    with open(mapping_file_path, "r") as file:
        file_mapping = yaml.safe_load(file)

    if not file_mapping:
        print("No file mapping found. Nothing to undo.")
        return

    undo_moves(file_mapping)
    print("Uninstallation complete. Files restored to their original locations.")


if __name__ == '__main__':
    # Replace the following variables with your desired values
    repo_url = "https://github.com/pythongosssss/ComfyUI-Custom-Scripts.git"
    destination_path = "RawCustomNodesAndScripts"
    python_files_destination = "custom_nodes"
    all_else_files = "web/extensions"
    mapping_file_path = "move_mapping.yaml"

    # Prompt user for installation or uninstallation
    action = input("Do you want to [i]nstall or [u]ninstall? ").lower()
    if action == "i":
        test_mode = input("Do you want to run in test mode? (y/n): ").lower() == "y"

        # Check if the destination directory already exists
        if os.path.exists(destination_path) and os.path.isdir(destination_path):
            response = input(
                f"The destination directory '{destination_path}' already exists. Do you want to remove it? (y/n): ")
            if response.lower() == "y":
                # Use system command to force delete the directory
                if os.name == 'nt':  # Windows
                    os.system(f'rmdir /s /q "{destination_path}"')
                else:  # Linux
                    os.system(f'rm -r -f "{destination_path}"')
            else:
                print("Operation cancelled. Exiting script.")
                exit()

        clone_repo(repo_url, destination_path)
        file_mapping = move_files(destination_path, python_files_destination, all_else_files, test_mode)
        write_mapping_file(file_mapping, mapping_file_path)

        print("Installation complete.")
    elif action == "u":
        uninstall(mapping_file_path)
    else:
        print("Invalid action. Exiting script.")
