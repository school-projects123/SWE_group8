import os
import io
import re
import uuid
import time
from html import unescape

from flask import Flask, request, jsonify, send_from_directory, render_template, session
from flask_cors import CORS
import pandas as pd

from compile_tool import detect_gradebook, detect_analytics, build_master_dataframe


app = Flask(__name__, static_folder="../static", template_folder="../templates")

app.secret_key = "dev-only-change-me"

# If frontend is on a different port (Vite 5173) and you need cookies:
CORS(app, supports_credentials=True)

# constants / compiled regex
re_tag = re.compile(r"<.*?>")

# Per-session store in memory (NOT shared between users)
SESSION_STORE = {}  
SESSION_TTL_SECONDS = 30 * 60  # 30 mins (optional auto cleanup)


def get_sid():
    if "sid" not in session:
        session["sid"] = str(uuid.uuid4())
    return session["sid"]


def cleanup_sessions():
    now = time.time()
    expired = [
        sid for sid, data in SESSION_STORE.items()
        if now - data.get("ts", now) > SESSION_TTL_SECONDS
    ]
    for sid in expired:
        del SESSION_STORE[sid]


def strip_html(text):
    if isinstance(text, str):
        return re_tag.sub("", unescape(text))
    return text


def get_courses_from_req(req):
    courses = {}

    for key, file in req.files.items():
        if not key.startswith("file_"):
            continue

        i = key.split("_")[1]
        course = req.form.get(f"course_{i}", "unknown")

        courses.setdefault(course, [])

        try:
            file_ext = file.filename.split(".")[-1].lower()

            if file_ext == "csv":
                try:
                    df = pd.read_csv(file, encoding="utf-8-sig")
                except Exception:
                    file.seek(0)
                    df = pd.read_csv(file, encoding="utf-16")

            elif file_ext == "xlsx":
                df = pd.read_excel(file, engine="openpyxl")

            elif file_ext == "xls":
                file.seek(0)
                file_bytes = file.read()

                # fake-xls (often tab-separated text)
                if file_bytes.startswith(b"\xff\xfe") or file_bytes.startswith(b"\xfe\xff"):
                    text = file_bytes.decode("utf-16")
                    df = pd.read_csv(io.StringIO(text), sep="\t")
                else:
                    try:
                        text = file_bytes.decode("utf-8-sig")
                        df = pd.read_csv(io.StringIO(text), sep="\t")
                    except Exception:
                        # real binary xls
                        df = pd.read_excel(io.BytesIO(file_bytes), engine="xlrd")

            else:
                raise ValueError("Unsupported file type")

            # clean html safely
            df = df.map(strip_html)

            courses[course].append({
                "file_name": file.filename,
                "df": df
            })

        except Exception as e:
            print("FAILED TO PROCESS FILE:", file.filename, repr(e))

    return {"courses": courses}


@app.route("/process", methods=["POST"])
def process_file():
    cleanup_sessions()
    sid = get_sid()

    info = get_courses_from_req(request)
    courses = info["courses"]

    # Collect dfs with Username column
    uploaded_dfs = []
    for course, files in courses.items():
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

    if gradebook_df is None or analytics_df is None:
        return jsonify({"error": "Could not detect both Gradebook + Analytics files."}), 400

    master_df = build_master_dataframe(gradebook_df, analytics_df)


    master_df = master_df.astype(object).where(pd.notnull(master_df), None)

    master_columns = master_df.columns.tolist()
    master_rows = master_df.to_dict(orient="records")

    SESSION_STORE[sid] = {
        "masterColumns": master_columns,
        "masterRows": master_rows,
        "ts": time.time()
    }

    print(f"[SID {sid}] Built master spreadsheet with {len(master_rows)} rows.")

    return jsonify({
        "masterColumns": master_columns,
        "masterRows": master_rows
    })


@app.route("/master", methods=["GET"])
def get_master():
    cleanup_sessions()
    sid = get_sid()

    data = SESSION_STORE.get(sid)
    if not data:
        return jsonify({"masterColumns": [], "masterRows": []})

    return jsonify({
        "masterColumns": data["masterColumns"],
        "masterRows": data["masterRows"]
    })

# Serve frontend (Flask version)
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def index(path):
    static_path = os.path.join(app.static_folder, path)

    if path != "" and os.path.exists(static_path):
        return send_from_directory(app.static_folder, path)

    return render_template("index.html")


if __name__ == "__main__":
    app.run(port=5000, debug=True)