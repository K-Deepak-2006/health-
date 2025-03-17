@echo off
echo Checking /analyze endpoint...
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
echo Checking required packages...
python -c "import requests" >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Installing requests package...
    pip install requests
)

REM Run the test script
echo Running test script...
python test_analyze_endpoint.py

echo.
echo Test complete.
pause 