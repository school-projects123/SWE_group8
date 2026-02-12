
Principles of Software Engineering Project
========
Blackboard Analysis Tool

# Note for running (while in dev) (Windows)
Need to use two different terminals (eg Powershell, CMD). This is just temp until a proper pipline is set up.
## Activate the environment
Powershell:
> Set-ExecutionPolicy Bypass -Scope Process

to temp allow activation because Powershell doesn't like it for some reason, then run: 
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
Assuming you are in the GitHub repo root folder (so 'SWE_GROUP8').

Run the following command (may also need to seperately pip install pandas,flask_cors,flask?), this only needs to be done the first time:

> python3 -m pip install -r analaysisTool/requirements.txt

Use the following command to run the app:

> cd analaysisTool && npm run dev

If that gives permission error, use this to reset the folder owner and try again:

> sudo chown -R $(whoami) .

Click on the link (e.g. http://localhost:5173/) to open the webpage/frontend.
