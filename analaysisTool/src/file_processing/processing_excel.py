# need to change to snake case
from flask import Flask, request, jsonify # flask for getting file path from front end (upload page)
from flask_cors import CORS
import os # for finding the file path
import pandas as pd # for mock retriving the post until that is set up in frontend

app = Flask(__name__)
#to allow for cross platform communication (flask and vite are on diff [ports for development])
CORS(app)

# This script will retrive the information from the upload page and store/ sort the excel files depending on the courses they are assigned to

# for now file info is being passed in the function directly to mock the json responce
# file_info = {"num_of_files":"N", "file_0": {"name": "name.csv","FormData": "what everform data looks like", "course": "CS3400"},..., "file_N":{}}
# likely recived via a POST from front end that sends a json that can be read as a python dict /process with be the front end command thats sends the files to be processed once the gen report button is clicked
@app.route("/process", methods=["POST"])

# funtion to process input from react frontend
def process_excel():
    #info = request.get_json
    num_of_files = int(request.form.get("numOfFiles",0))
    #num_of_files = int(file_info["num_of_files"])
    courses = {}

    for i in range(num_of_files):

        # could there ever be a case where the front end sends an empty filepath or course?
        file = request.files.get(f"file_{i}")
        course = request.form.get(f"course_{i}","unknown")

        if course not in courses:
            courses[course] = []
        # incase there isn't a course (because thats not implemented yet)
        if file:
            try:
                # read excel/csv
                file_extrac = file.filename.split(".")[-1].lower()
                preview_text = ""

                if file_extrac in ["csv"]:
                    df = pd.read_csv(file)
                    # currently preview first 5 rows
                    preview_text = df.head(5).to_csv(index = False) 
                elif file_extrac in ["xls","xlsx"]:
                    df = pd.read_excel(file)
                    preview_text = df.head(5).to_csv(ndex=False)
                else:
                    # error if another file is somehow uloaded
                    content = file.read().decode("utf-8", errors = "ignore")
                    preview_text = content[:500]

                courses[course].append({
                    "file_name":file.filename,
                    "preview":preview_text
                })
            except Exception as e:
                courses[course].append({
                    "file_name": file.filename,
                    "": f"failed to read file:{str(e)}"
                })
        # likely wont need to handle if its a folder because of frontend safeguards
        # could the same file be uploaded twise? how to deal with it?

    #return jsonify({"status": "success", "results": results})
    # the temp filepaths probubly will be marked as not existing as they are gibberish
    print(courses)
    return jsonify({"status":"success", "courses":courses})

if __name__ =="__main__":
    # app.run(port=5000, debug=True)
    # dummy file_info dict to use for now
    file_info = {"num_of_files":"2", "file_1": {"file_path": "C:\\efsj\\nje.csv", "course": "CS3400"}, "file_2": {"file_path": "C:\\apdmj\\nefje.csv", "course": "CS3203"}}
    app.run(port=5000,debug=True)