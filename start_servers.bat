@echo off
echo Starting TZ_Hackathon API Servers...
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
python -c "import fastapi, uvicorn, google.generativeai, requests" >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Installing required packages...
    pip install fastapi uvicorn google-generativeai requests
    if %ERRORLEVEL% neq 0 (
        echo Failed to install required packages. Please install them manually:
        echo pip install fastapi uvicorn google-generativeai requests
        pause
        exit /b 1
    )
)

REM Check if required files exist
echo Checking required files...
if not exist feature1_fastapi.py (
    echo ERROR: feature1_fastapi.py not found.
    echo Please make sure this file exists in the current directory.
    pause
    exit /b 1
)
if not exist chatbot.py (
    echo ERROR: chatbot.py not found.
    echo Please make sure this file exists in the current directory.
    pause
    exit /b 1
)

REM Run the server manager
echo Starting API servers...
python server_manager.py

REM This line will only be reached if the server manager exits
echo Servers stopped.
pause 