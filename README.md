
Principles of Software Engineering Project
========
Blackboard Analysis Tool

# Note for running (while in dev) (windows)
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

# Notes for running (mac/linux)

Within the project root (so cd to analaysisTool), try (second line might not be necesary?):
> python3 -m venv .venv

> source .venv/bin/activate

If not already installed dependancies (may also seperately need to install pandas,flask_cors,flask). Will work either in repository root or can cd into analaysis tool and remove that from the commands.

> python3 -m pip install -r analaysisTool/requirements.txt

To run the programme:

> python3 -m analaysisTool.backend.processing_excel

Then if the URL doesn't work (which it should), perhaps try in a seperate terminal:

> cd analaysisTool

And finally (try 'npm install' if this doesn't work?)

> npm run dev