 Health Assistant

A web application with AI-powered health tools including a symptom checker and an AI health assistant chatbot.

## Features

1. **Symptom Checker**: Analyze your symptoms using Gemini 2.5 Flash AI to get potential diagnoses and health insights.
2. **AI Health Assistant**: Chat with an AI health assistant to get answers to your health-related questions.

## Setup and Installation

### Prerequisites

- Python 3.8+
- Node.js 14+
- npm or yarn

### Backend Setup

1. Install Python dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Set up your Gemini API key:
   - Get an API key from [Google AI Studio](https://ai.google.dev/)
   - The default key is already set in the code, but you can update it in the UI

### Frontend Setup

1. Install Node.js dependencies:
   ```
   npm install
   # or
   yarn install
   ```

2. Start the development server:
   ```
   npm run dev
   # or
   yarn dev
   ```

## Running the Application

### Option 1: Easy Start (Recommended)

#### Windows Users
Simply double-click the `start_servers.bat` file or run it from the command line:
```
start_servers.bat
```

Then start the frontend in a separate terminal:
```
npm run dev
# or
yarn dev
```

#### Unix/Linux/Mac Users
Make the script executable and run it:
```
chmod +x start_servers.sh
./start_servers.sh
```

Then start the frontend in a separate terminal:
```
npm run dev
# or
yarn dev
```

### Option 2: Using the Server Manager

Run the Python script that manages both backend services:
```
python server_manager.py
```

Then start the frontend in a separate terminal:
```
npm run dev
# or
yarn dev
```

### Option 3: Run services separately

1. Start the Symptom Analyzer API:
   ```
   uvicorn feature1_fastapi:app --host 0.0.0.0 --port 8000 --reload
   ```

2. Start the Health Assistant API:
   ```
   uvicorn chatbot:app --host 0.0.0.0 --port 8001 --reload
   ```

3. Start the frontend development server:
   ```
   npm run dev
   # or
   yarn dev
   ```

## Usage

1. Open your browser and navigate to `http://localhost:5173` (or the port shown in your terminal)
2. Use the Symptom Checker to analyze your symptoms
3. Click the chat button in the bottom-right corner to interact with the AI Health Assistant

## API Endpoints

### Symptom Analyzer API (Port 8000)

- `POST /analyze`: Analyze symptoms and get potential diagnoses

### Health Assistant API (Port 8001)

- `POST /chat`: Send a message to the AI Health Assistant
- `POST /reset`: Reset the conversation history
- `GET /health`: Check the health status of the API

## Text Formatting

The AI responses support special formatting:

- Text between ** ** will be displayed in bold
- Sentences starting with "Explanation:" will be highlighted
- Responses are formatted with clear sections and newlines after periods

## Disclaimer

This application is for informational purposes only and does not replace professional medical advice. Always consult with a healthcare provider for diagnosis and treatment.

## Troubleshooting

If you encounter connection errors like `ERR_CONNECTION_REFUSED` or `Failed to fetch`, follow these steps:

### 1. Run the Troubleshooting Tool

#### Windows Users
```
troubleshoot.bat
```

#### Unix/Linux/Mac Users
```
python3 troubleshoot.py
```

The troubleshooting tool will:
- Check if all required files exist
- Verify that required Python packages are installed
- Check if ports 8000 and 8001 are available
- Identify processes that might be using these ports
- Test if the servers are responding

### 2. Common Issues and Solutions

#### Ports Already in Use
If ports 8000 or 8001 are already in use:
- Find and stop the processes using these ports
- Or modify the server code to use different ports

#### Missing Files
Make sure these files exist in your project directory:
- `feature1_fastapi.py` (Symptom Analyzer API)
- `chatbot.py` (Health Assistant API)
- `server_manager.py` (Server manager script)

#### Server Not Starting
Check the server output for error messages. Common issues include:
- Syntax errors in the server code
- Missing dependencies
- Incorrect file paths

### 3. Manual Server Testing

You can test the servers manually using curl or a web browser:

```
# Test Symptom Analyzer API
curl http://localhost:8000/health

# Test Health Assistant API
curl http://localhost:8001/health
```

If these requests fail, the servers are not running correctly.
