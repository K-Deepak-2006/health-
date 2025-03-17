@echo off
echo Running TZ_Hackathon Troubleshooting Tool...
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

REM Check if requests package is installed
python -c "import requests" >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Installing requests package...
    pip install requests
    if %ERRORLEVEL% neq 0 (
        echo Failed to install requests package. Please install it manually:
        echo pip install requests
        pause
        exit /b 1
    )
)

REM Run the troubleshooting script
python troubleshoot.py

echo.
pause 