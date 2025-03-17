@echo off
echo Starting Symptom Analyzer API service...
echo.

REM Change to the script directory
cd /d "%~dp0"
echo Working directory: %CD%

REM Check if Python is installed
where python >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Python is not installed or not in PATH. Please install Python 3.8 or higher.
    pause
    exit /b 1
)

REM Check if required packages are installed
echo Checking required packages...
python -c "import fastapi, uvicorn, google.generativeai" >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Installing required packages...
    pip install -r requirements.txt
)

REM Run the service
echo Starting Symptom Analyzer API service...
uvicorn feature1_fastapi:app --host 0.0.0.0 --port 8000 --reload

REM This line will only be reached if the service stops
echo Service stopped.
pause 