# need to change to snake case
from flask import Flask, request, jsonify # flask for getting file path from front end (upload page)
from flask_cors import CORS
import io # for file reading
import pandas as pd # for mock retriving the post until that is set up in frontend
import json
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
    preview_courses = {}

    for i in range(num_of_files):

        # could there ever be a case where the front end sends an empty filepath or course?
        file = request.files.get(f"file_{i}")
        course = request.form.get(f"course_{i}","unknown")

        if course not in courses:
            courses[course] = []
            preview_courses[course]=[]
        # incase there isn't a course (because thats not implemented yet)
        if file:
            try:
                # read excel/csv
                file_extrac = file.filename.split(".")[-1].lower()
                preview_text = ""
                body_content = {}

                if file_extrac == "csv":
                    df = pd.read_csv(file, encoding = "utf-16")
                    #print("csv uploaded")
                    # currently preview first 5 rows
                    preview_text = df.head(3).to_csv(index = False) 
                    body_content = df.head().to_dict(orient = 'records')
                elif file_extrac == "xlsx":
                    df = pd.read_excel(file, engine="openpyxl")
                    #print("xlsx type file uploaded")
                    preview_text = df.head(3).to_csv(index=False)
                    body_content = df.head().to_dict(orient = 'records')
                # most files downloaded from blackboard are this type
                elif file_extrac == "xls":
                        #go to reading as CSV/ UTF-16 text - was having issues because its a bof type file not a biff type file?
                        #check what type of file it is
                        file.seek(0)
                        file_bytes = file.read()
                        
                        # read as tsl file if it detects BOM becuase its not a proper excel/csv (because its doenloaded from blackboard)
                        if file_bytes.startswith(b"\xff\xfe") or file_bytes.startswith(b"\xfe\xff"):
                            text = file_bytes.decode("utf-16")
                            df = pd.read_csv(io.StringIO(text), sep="\t")
                            #print("is weird tsl (pretending to be xls) file",df)
                            preview_text = df.head(3).to_csv(index=False)
                            body_content = df.head().to_dict(orient = 'records')
                        else:
                            try:
                                df = pd.read_excel(io.BytesIO(file_bytes), engine="xlrd")
                                # got rid of try and catch becuse it was getting in the way of debugging
                                # will add try and except to handle actual malformed files in future
                                #print("is other weird fake xls file",df)
                                preview_text = df.head(3).to_csv(index=False)
                                body_content = df.head().to_dict(orient = 'records')
                            except Exception as excel_err:
                                raise Exception("unsupported XLS format: "+str(excel_err))
                            
                        
                        # this genrates the wrongly processed file!
                        # preview_text = df.head().to_csv(index=False)
                        # print("normal xls: ",df ) # this one gives cannot access local variable 'df' where it is not associated with a value"
                        # but even when commented an unknow error is still being thrown??
                        # an exception is being thrown

               # print(file.read(20))
               # file.seek(0)

                #print(type(preview_text))
                courses[course].append({
                    "file_name":file.filename,
                    "file": body_content
                })
                
                preview_courses[course].append({
                    "file_name":file.filename,
                    "preview":preview_text
                })
                
            # fail
            # cannot access local variable 'df' where it is not associated with a value"
            # failuse is flagging files that are also being processed as expected to adding same file twoce with diffrent rsult -
            # not proper exception handleing
            except Exception as e:
                print("ERROR:", repr(e))
                courses[course].append({
                    "file_name": file.filename,
                    "preview": f"failed to read file:{str(e)}"
                })
        # likely wont need to handle if its a folder because of frontend safeguards
        # could the same file be uploaded twise? how to deal with it?

    #return jsonify({"status": "success", "results": results})
    # the temp filepaths probubly will be marked as not existing as they are gibberish
   
    info = {"courses":courses}

    #jsonify(info)
    print("INFO STRUCTURE:", info)
    #print("TYPE:", type(info))
    #for getting the course name
    """"
    for course in info["courses"]["unknown"]:
        print(course["file_name"])
    for course in info["courses"]["unknown"]:
        print(course["preview"])
    """
    return info 
    print("not implimented")


if __name__ =="__main__":
    # app.run(port=5000, debug=True)
    # dummy file_info dict to use for now
    app.run(port=5000,debug=True)