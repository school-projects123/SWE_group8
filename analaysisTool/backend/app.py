import os
from flask import Flask, render_template, send_from_directory, jsonify, request

app = Flask(
    __name__,
    static_folder="../static",
    template_folder="../templates"
)

# API ENDPOINT FOR BACKEND
#TO BE ADDED



# ROUTES FOR FRONTEND
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def index(path):
    static_path = os.path.join(app.static_folder, path)


    if path != "" and os.path.exists(static_path):
        return send_from_directory(app.static_folder, path)


    return render_template("index.html")


if __name__ == "__main__":
    app.run(debug=True)