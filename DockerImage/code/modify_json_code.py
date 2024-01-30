import os
import json
from path import filter_path

def modify_json_code():
    # Initialize a set to store unique file names
    unique_file_names = set()

    # Traverse all files in the path
    for root, dirs, files in os.walk(filter_path):
        for file in files:
            if file.endswith(".json") and file[2] == '-' and len(file) == 10:
                unique_file_names.add(file)

    # Traverse all json files in the folder
    for root, dirs, files in os.walk(filter_path):
        for file in files:
            if file.endswith((tuple(unique_file_names))):
                file_path = os.path.join(root, file)

                # Read the original json content
                with open(file_path, "r") as f:
                    data = json.load(f)

                # Insert new intents
                new_intents = [
                    {
                        "name": "NoExitIntent",
                        "slots": [],
                        "samples": ["no", "no exit", "exit"]
                    },
                    {
                        "name": "YesContinueIntent",
                        "slots": [],
                        "samples": ["yes", "yes continue", "continue"]
                    }
                ]
                data["interactionModel"]["languageModel"]["intents"].extend(new_intents)
                # data['interactionModel']['languageModel']['invocationName'] = 'privacynoticetest'

                # Write back the updated json content
                with open(file_path, "w") as f:
                    json.dump(data, f, indent=4)

                print(f"Inserted new intents in {file_path}.")