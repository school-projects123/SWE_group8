# need to change to snake case
from flask import Flask, request, jsonify # flask for getting file path from front end (upload page)
import os # for finding the file path
import json # for mock retriving the post until that is set up in frontend

app = Flask(__name__)

# This script will retrive the information from the upload page and store/ sort the excel files depending on the courses they are assigned to

# for now file info is being passed in the function directly to mock the json responce
# file_info = {"num_of_files":"N", "file_0": {"file_path": "C:\efsj\nje", "course": "CS3400"}, "file_1": {"file_path": "C:\efsj\nje", "course": "CS3400"}, ..., "file_N":{}}
# likely recived via a POST from front end that sends a json that can be read as a python dict /process with be the front end command thats sends the files to be processed once the gen report button is clicked
@app.route("/process", methods=["POST"])

# funtion to process input from react frontend
def process_excel(file_info):
    #info = request.get_json
    info = file_info
    #num_of_files = int(info.get("num_of_files",0))
    num_of_files = int(file_info["num_of_files"])
    if num_of_files == 0: 
        return jsonify({"error": "No files provided"}), 400

    results = []
    for i in range(num_of_files):
        file_indx = f"file_{i+1}"
        file_info = info.get(file_indx)
        print(file_info)
        # if for some reason theres other stuff in the json ignore it lol
        if not file_info:
            continue

        # could there ever be a case where the front end sends an empty filepath or course?
        path = file_info.get("file_path")
        course = file_info.get("course")

        # incase it isnt a proper path/ file - unlikely beacsie of frontend safeguards
        if not path or not os.path.exists(path):
            results.append({
                    "file_name": os.path.basename(path) if path else None,
                    "course": course,
                    "error": "File/folder does not exist"
                })
            continue

        # if it is a path
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            content_preview = f.read(500)  # first 500 chars
        results.append({
            "file_name": os.path.basename(path),
            "course": course,
            "type": "file",
            "preview": content_preview
        })

        # likely wont need to handle if its a folder because of frontend safeguards
        # could the same file be uploaded twise? how to deal with it?

    #return jsonify({"status": "success", "results": results})
    # the temp filepaths probubly will be marked as not existing as they are gibberish
    print(results)

if __name__ =="__main__":
    # app.run(port=5000, debug=True)
    # dummy file_info dict to use for now
    file_info = {"num_of_files":"2", "file_1": {"file_path": "C:\\efsj\\nje.csv", "course": "CS3400"}, "file_2": {"file_path": "C:\\apdmj\\nefje.csv", "course": "CS3203"}}
    process_excel(file_info)