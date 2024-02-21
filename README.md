# Instructions
If you prefer use Docker, Please exexute the following commands:
* Place the repos and result folder in the /dataset.
* Run ./build.sh
* Run ./run.sh
* You can check the reuslt from /dataset/repo. There will be a new index_new.js. And the json file has been modified. 
* Upload modified files to Alexs skill developer console to test.

You can also exexute the code directly:
* Run pip install openai
* Run pip install spacy
* Run python -m spacy download en_core_web_sm
* Run DockerImage/code/data_collection_analysis/scan_skills.py
* Run DockerImage/code/privacy_notice_generator/main.py