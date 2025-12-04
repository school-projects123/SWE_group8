# need to change to snake case
from flask import Flask, request, jsonify, send_from_directory # flask for getting file info from front end (upload page)
from flask_cors import CORS
import io # for file reading
import os
import pandas as pd # for mock retriving the post until that is set up in frontend
# these are for converting dict info to pandas dataframe:
import re
from html import unescape

from compile_tool import detect_gradebook, detect_analytics, build_master_dataframe

# constants/ compiled regex
re_tag = re.compile(r"<.*?>")

app = Flask(__name__,
            static_folder = "../../dist",
            static_url_path="")
#to allow for cross platform communication (flask and vite are on diff [ports for development] doesnt make a diffrence in production)
CORS(app)

# these are the react serving routes
# Serve the React homepage
@app.route("/")
def serve_react():
    # should this be the upload page insted?
    return send_from_directory(app.static_folder, "index.html")

# need to add a message that sends to front end if there are file issues , rn it just says that the files were uploaded
def get_courses_from_req(request):
    #old loop was fragile and somtimes skpped files
    # noe builds 1 pandas DataFrame PER uploaded file.
    # Each file is stored directly – NO dict roundtrip
    #info = request.get_json
    #num_of_files = int(file_info["num_of_files"])
    courses = {}
    for key, file in request.files.items():

        # Only process uploaded file fields
        if not key.startswith("file_"):
            continue

        i = key.split("_")[1]
        course = request.form.get(f"course_{i}", "unknown")

        if course not in courses:
            courses[course] = []
        # incase there isn't a course (because thats not implemented yet)

        try:
            # read excel/csv
            file_extrac = file.filename.split(".")[-1].lower()
            body_content = {}

            if file_extrac == "csv":
                try:
                    # if file is csv from blackboard it will be utf-8 with BOM
                    df = pd.read_csv(file, encoding = "utf-8-sig")
                except:
                    # if it is xls or xlsx it will be utf- 16
                    file.seek(0)                      
                    df = pd.read_csv(file, encoding = "utf-16")
                # print("csv uploaded")
                # currently preview first 3 rows for preview but is converted to a python dict for the version with all info 
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
                    else:
                        try:
                            # try utf 8 first again
                            text = file_bytes.decode("utf-8-sig")
                            df = pd.read_excel(io.StringIO(text), sep="\t")
                            # got rid of try and catch becuse it was getting in the way of debugging
                            # will add try and except to handle actual malformed files in future
                            #print("is other weird fake xls file",df)
                        except Exception:
                            # fall back onto excel binary format
                            df = pd.read_excel(io.BytesIO(file_bytes), engine="xlrd")
            else:
                raise ValueError("Unsupported file type")        
            
            #clean html safely
            df = df.map(strip_html)
            
            # storeing as df directky
            courses[course].append({
                "file_name": file.filename,
                "df": df
            }) 
            # this genrates the wrongly processed file!
            # preview_text = df.head().to_csv(index=False)
            # print("normal xls: ",df ) # this one gives cannot access local variable 'df' where it is not associated with a value"
            # but even when commented an unknow error is still being thrown??
            # an exception is being thrown

        except Exception as e:
            print("FAILED TO PROCESS FILE:", file.filename, repr(e))
            # cannot access local variable 'df' where it is not associated with a value"
            # failuse is flagging files that are also being processed as expected to adding same file twoce with diffrent rsult -
            # not proper exception handleing

        # likely wont need to handle if its a folder because of frontend safeguards
        # could the same file be uploaded twise? how to deal with it?

    #return jsonify({"status": "success", "results": results})
    # the temp filepaths probubly will be marked as not existing as they are gibberish
   
    info = {"courses": courses}

    # Debug print: show filenames only
    print("INFO STRUCTURE:", {
        course: [f["file_name"] for f in files]
        for course, files in courses.items()
    })

    # debug print: confirm DataFrames are created
    for course, files in courses.items():
        for f in files:
            print("\nDF FOR:", f["file_name"])
            print(f["df"].head())
    #print("TYPE:", type(info))
    #for getting the course name
    """"
    for course in info["courses"]["unknown"]:
        print(course["file_name"])
    for course in info["courses"]["unknown"]:
        print(course["preview"])
    """
    # info is structred like: 
    # {"courses":
    #   {"course_name": - currently "unknown" as that isn'y implented on the front end
    #       [{"file_name": "the actual name", "file" : [{"the acctual content of the file that kayma needs which is a dict that can be converted back to a dataframe"}]},
    #        {"file_name": "the actual name", "file" : [{"the dict content of the next file in the course"}]}]}}
    # eventually it will have multiple course_names with actuall names to parse through
    return info 
    print("not implimented")

# will add call within file processor to cheak that uploaded file isn't malformed - not fully implemented yet
def safe_dataframe(df):
    try:
        # Basic sanity checks
        # incase a non compatable file is accidentally passed in
        if df is None:
            raise ValueError("No data loaded")
        # wont add an emty file because it has no info
        if df.empty:
            raise ValueError("File contains no rows")

        # Force evaluation so it catches parser/data corruption issues
        df.head(1)

        return None   # no error
    # if somthing else goes wring return the error # insted of sending a signal to front end to move on send an error message that the file cannon't be read
    except Exception as e:
        return f"Malformed or unreadable file: {str(e)}"

# if a value is like <span style="color: #000000">Beijing</span> -  clear it so that it is just Beijing
def strip_html(text):
    if isinstance(text, str):
        # unescape enteties (&amp, etc..) and strip tags
        return re_tag.sub("",unescape(text))
    return text
# takes in output from file processing, will be useful for kaymas code as it returns a df of file info
# returns one df per course


def get_all_courses(info:dict):
    return NotImplementedError

# This script will retrive the information from the upload page and store/ sort the excel files depending on the courses they are assigned to
# for now file info is being passed in the function directly to mock the json responce
# file_info = {"num_of_files":"N", "file_0": {"name": "name.csv","FormData": "what everform data looks like", "course": "CS3400"},..., "file_N":{}}
# likely recived via a POST from front end that sends a json that can be read as a python dict /process with be the front end command thats sends the files to be processed once the gen report button is clicked
@app.route("/process", methods=["POST"])

# funtion to process input from react frontend
def process_file():
    info = get_courses_from_req(request)
    # note:
    # cant jsonify pandas DataFrames directly.
    # If later need to send data to the frontend,
    # convert each df using:
    #
    # df.to_dict(orient="records")

    uploaded_dfs = []

    for course, files in info["courses"].items():
        for f in files:
            df = f.get("df")
            if df is not None and "Username" in df.columns:
                uploaded_dfs.append(df)
        if not uploaded_dfs:
            return jsonify({"error": "No usable files with a 'Username' column were found."}), 400
    
    gradebook_df = None
    analytics_df = None

    for df in uploaded_dfs:
        if gradebook_df is None and detect_gradebook(df):
            gradebook_df = df
        elif analytics_df is None and detect_analytics(df):
            analytics_df = df

        if gradebook_df is None:
            return jsonify({"error": "No valid gradebook file uploaded"}), 400
        
        if analytics_df is None:
            return jsonify({"error": "No valid analytics file uploaded"}), 400
        
        master_df = build_master_dataframe(gradebook_df, analytics_df)
        

    return jsonify({
        # "courses": {
        #     course: [
        #         {"file_name": f["file_name"]}
        #         for f in files
        #     ]
        #     for course, files in info["courses"].items()
        # }

        "columns": master_df.columns.tolist(),
        "rows": master_df.to_dict(oreient="records")
    })
# Serve React assets + handle client-side routing should add
@app.route("/<path:path>")
def index(path):
    static_path = os.path.join(app.static_folder, path)

    if path != "" and os.path.exists(static_path):
        return send_from_directory(app.static_folder, path)

    return send_from_directory(app.static_folder, "index.html")

if __name__ =="__main__":
    # app.run(port=5000, debug=True)
    # dummy file_info dict to use for now
    #python anywher ignores this
    app.run(port=5000,debug=True)
    