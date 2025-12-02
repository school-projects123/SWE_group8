
Principles of Software Engineering Project
=======
Principles of Software Engineering Project...
Blackboard Analysis Tool
>>>>>>> 1734a6054ef172cd6c567cb54d80564d7fbcaf66

# Note for running (while in dev)
need to use two diffrent terminals (eg powershell, cmd)
This is just temp until proper pipline is set up
## Activate the environment
powershell:
"Set-ExecutionPolicy Bypass -Scope Process"
to temp allow activation becuse powershell doesn't like it for some reason. then run: ".venv\Scripts\Activate.ps1"

cmd: ".\\.venv\Scripts\activate.bat"

## Run each script
run the backend then the frontend
flask/python - runing backend:
    ensure all installs in requirements.txt are installed
    cd to analaysisTool/src/file_processing
    python processing_excel.py

vite/react - running frontend:
    cd to analaysisTool
    npm run dev

