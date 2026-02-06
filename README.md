
Principles of Software Engineering Project
========
Blackboard Analysis Tool

# Note for running (while in dev) (Windows)
Need to use two different terminals (eg powershell, cmd)
This is just temp until a proper pipline is set up
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

Within the project root (so cd to analaysisTool), run the following two commands (may also need to seperately pip install pandas,flask_cors,flask), only need to do these the first time:
> python3 -m venv .venv

> python3 -m pip install -r requirements.txt

To run the programme (remove 'analaysisTool.' depending on directory you are running from):

> python3 -m analaysisTool.backend.processing_excel

Click on the link (e.g. http://127.0.0.1:5000) to open the webpage/frontend.