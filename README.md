
Principles of Software Engineering Project
========
Blackboard Analysis Tool

# Note for running (while in dev) (Windows)
Need to use two different terminals (eg powershell, cmd). This is just temp until a proper pipline is set up.
## Activate the environment
Powershell:
> Set-ExecutionPolicy Bypass -Scope Process

to temp allow activation because powershell doesn't like it for some reason, then run: 
> .venv\Scripts\Activate.ps1

CMD:
> .\\.venv\Scripts\activate.bat

## Run each script
Run the backend then the frontend
flask/python - runing backend:
    ensure all installs in requirements.txt are installed
    cd to analaysisTool/backend/file_processing
    python processing_excel.py

vite/react - running frontend:
    cd to analaysisTool
    npm run dev

# Notes for running (Mac/Linux)
Assuming you are in the github repo root folder (so 'SWE_GROUP8').

Run the following command (may also need to seperately pip install pandas,flask_cors,flask), only need to do this the first time:

> python3 -m pip install -r analaysisTool/requirements.txt

One might say to use the following command to update it to include changes, but it seems that this doesn't work properly and saves the new stuff to another directory, and at any rate the .js it produces doesn't seem to work for me.

> sudo npm run build

To run the programme:

> python3 -m analaysisTool.backend.processing_excel

Click on the link (e.g. http://127.0.0.1:5000) to open the webpage/frontend.