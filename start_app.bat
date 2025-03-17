@echo off
echo Starting TZ_Hackathon Health Assistant...
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

REM Run the services
echo Starting backend services...
start cmd /k "python run_both_services.py"

REM Wait a bit for the services to start
timeout /t 5 /nobreak >nul

REM Start the frontend
echo Starting frontend...
start cmd /k "npm run dev"

echo.
echo Services are starting. Please wait a moment...
echo.
echo When ready, access the application at: http://localhost:5173
echo.
echo Press any key to exit this window (services will continue running in other windows)
pause >nul 