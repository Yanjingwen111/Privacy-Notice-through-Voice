import os
import shutil
from path import repo_path, final_path, filter_path

# get all repo with data collection
def get_file_with_data_collection(folder):
    components = folder.split("~~") 
    last_two_parts = components[0:2] # get the last two parts: author and skill 
    author = last_two_parts[0]
    skill = last_two_parts[1]
    return repo_path + "/" + author + "/" + skill

folder_path = final_path
repo_with_dc = []
for root, dirs, files in os.walk(folder_path):
    for file in files:
        dc_file = get_file_with_data_collection(file)
        repo_with_dc.append(dc_file)
print(repo_with_dc)

# get all index.js files with data collection and under lambda folder and with LaunchRequest
def filter_js_file(repo):
    index_js_files = []
    for folder in repo:
        for root, dirs, files in os.walk(folder):
            if 'index.js' in files:
                index_js_files.append(root + "/index.js")
    index_js_files_filter = [item for item in index_js_files if "lambda" in item]
    index_js_files_final = []
    for js_file in index_js_files_filter:
        with open(js_file, 'r') as file:
            content = file.read()
            if 'LaunchRequest' in content:
                index_js_files_final.append(js_file)
    return index_js_files_final

def copy_repo():
    new_folder = filter_path
    index_js_files_final = filter_js_file(repo_with_dc)
    print(index_js_files_final)
    for file_path in index_js_files_final:
        parts = file_path.split('/')
        # ['dataset', 'repos', 'juanmf', 'InnovationChallengeDealsAssistantAlexaSkill', 'lambda', 'custom', 'index.js']
        level_path = '/'.join(parts[0:4])
        skill_path = '/'.join(parts[2:4])
        destination_path = os.path.join(new_folder, skill_path)
        #print ("d: ", destination_path, "lv: ", level_path)
        if not os.path.exists(destination_path):
            shutil.copytree(level_path, destination_path)
