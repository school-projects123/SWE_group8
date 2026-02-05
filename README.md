
Principles of Software Engineering Project
========
Blackboard Analysis Tool

# Note for running (while in dev)
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
    cd to analaysisTool/src/file_processing
    python processing_excel.py

vite/react - running frontend:
    cd to analaysisTool
    npm run dev
