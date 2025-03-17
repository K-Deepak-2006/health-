#!/bin/bash

echo "Starting TZ_Hackathon API Servers..."
echo

# Change to the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$SCRIPT_DIR"
echo "Working directory: $(pwd)"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

# Check if required packages are installed
echo "Checking required packages..."
python3 -c "import fastapi, uvicorn, google.generativeai, requests" &> /dev/null
if [ $? -ne 0 ]; then
    echo "Installing required packages..."
    pip3 install fastapi uvicorn google-generativeai requests
    if [ $? -ne 0 ]; then
        echo "Failed to install required packages. Please install them manually:"
        echo "pip3 install fastapi uvicorn google-generativeai requests"
        exit 1
    fi
fi

# Check if required files exist
echo "Checking required files..."
if [ ! -f "feature1_fastapi.py" ]; then
    echo "ERROR: feature1_fastapi.py not found."
    echo "Please make sure this file exists in the current directory."
    exit 1
fi
if [ ! -f "chatbot.py" ]; then
    echo "ERROR: chatbot.py not found."
    echo "Please make sure this file exists in the current directory."
    exit 1
fi

# Run the server manager
echo "Starting API servers..."
python3 server_manager.py

# This line will only be reached if the server manager exits
echo "Servers stopped." 