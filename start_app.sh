#!/bin/bash

echo "Starting TZ_Hackathon Health Assistant..."
echo

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "npm is not installed. Please install Node.js and npm."
    exit 1
fi

# Run the services
echo "Starting backend services..."
gnome-terminal -- python3 run_both_services.py 2>/dev/null || \
xterm -e "python3 run_both_services.py" 2>/dev/null || \
osascript -e 'tell app "Terminal" to do script "cd '"$(pwd)"' && python3 run_both_services.py"' 2>/dev/null || \
konsole --noclose -e python3 run_both_services.py 2>/dev/null || \
python3 run_both_services.py &

# Wait a bit for the services to start
echo "Waiting for services to start..."
sleep 5

# Start the frontend
echo "Starting frontend..."
gnome-terminal -- npm run dev 2>/dev/null || \
xterm -e "npm run dev" 2>/dev/null || \
osascript -e 'tell app "Terminal" to do script "cd '"$(pwd)"' && npm run dev"' 2>/dev/null || \
konsole --noclose -e npm run dev 2>/dev/null || \
npm run dev &

echo
echo "Services are starting. Please wait a moment..."
echo
echo "When ready, access the application at: http://localhost:5173"
echo

# Make the script wait for user input
read -p "Press Enter to exit this window (services will continue running in other windows)" 