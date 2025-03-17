# main.py
from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel, Field
import google.generativeai as genai
import uvicorn
import os
from typing import Optional

# Initialize FastAPI app
app = FastAPI(
    title="Medical Symptom Analyzer API",
    description="API for analyzing medical symptoms using Gemini AI",
    version="1.0.0"
)

# Add CORS middleware to allow cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup Jinja2 templates for the simple frontend
templates = Jinja2Templates(directory="templates")

# Try to mount static files if the directory exists
try:
    app.mount("/static", StaticFiles(directory="static"), name="static")
except:
    # Static directory might not exist in some deployments
    pass

# Create templates directory if it doesn't exist
os.makedirs("templates", exist_ok=True)

# Create a basic HTML template
with open("templates/index.html", "w", encoding="utf-8") as f:
    f.write("""
<!DOCTYPE html>
<html>
<head>
    <title>Medical Symptom Analyzer</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        h1 {
            color: #1E88E5;
            text-align: center;
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        textarea {
            width: 100%;
            height: 150px;
            padding: 10px;
            box-sizing: border-box;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        button {
            background-color: #1E88E5;
            color: white;
            padding: 10px 15px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
        }
        button:hover {
            background-color: #1976D2;
        }
        .result {
            margin-top: 20px;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 4px;
            background-color: #f9f9f9;
        }
        .symptoms, .diagnosis {
            margin-top: 10px;
        }
        .disclaimer {
            margin-top: 30px;
            padding: 10px;
            background-color: #FFF3E0;
            border-radius: 4px;
            font-style: italic;
        }
        .loading {
            display: none;
            text-align: center;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <h1>Medical Symptom Analyzer</h1>
    <p>Describe your symptoms for AI-powered analysis</p>

    <div class="form-group">
        <label for="api-key">Gemini API Key:</label>
        <input type="password" id="api-key" value="AIzaSyBBugr5_EJvAsWknredcLTbTYGhupmr7x8" style="width: 100%; padding: 8px; box-sizing: border-box;">
    </div>

    <div class="form-group">
        <label for="symptoms">Describe your symptoms:</label>
        <textarea id="symptoms" placeholder="Example: I've been having a fever of 101°F for the past 2 days, with a sore throat and fatigue."></textarea>
    </div>

    <button id="analyze-btn">Analyze Symptoms</button>

    <div id="loading" class="loading">
        <p>Analyzing symptoms... Please wait.</p>
    </div>

    <div id="result" class="result" style="display: none;">
        <h3>Extracted Symptoms:</h3>
        <div id="extracted-symptoms" class="symptoms"></div>
        
        <h3>Diagnosis Analysis:</h3>
        <div id="diagnosis" class="diagnosis"></div>
    </div>

    <div class="disclaimer">
        <p>⚠️ <strong>Disclaimer:</strong> This tool is for informational purposes only and does not replace professional medical advice. Always consult with a healthcare provider for diagnosis and treatment.</p>
    </div>

    <script>
        document.getElementById('analyze-btn').addEventListener('click', async () => {
            const apiKey = document.getElementById('api-key').value;
            const symptoms = document.getElementById('symptoms').value;
            
            if (!symptoms) {
                alert('Please enter your symptoms');
                return;
            }
            
            // Show loading message
            document.getElementById('loading').style.display = 'block';
            document.getElementById('result').style.display = 'none';
            
            try {
                const response = await fetch('/analyze', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ 
                        text: symptoms,
                        api_key: apiKey
                    })
                });
                
                if (!response.ok) {
                    throw new Error('API request failed');
                }
                
                const data = await response.json();
                
                // Display results
                document.getElementById('extracted-symptoms').innerHTML = data.extracted_symptoms;
                document.getElementById('diagnosis').innerHTML = data.diagnosis;
                document.getElementById('result').style.display = 'block';
            } catch (error) {
                alert('Error analyzing symptoms: ' + error.message);
            } finally {
                // Hide loading message
                document.getElementById('loading').style.display = 'none';
            }
        });
    </script>
</body>
</html>
    """)

# Pydantic models for request and response data validation
class SymptomRequest(BaseModel):
    text: str = Field(..., description="Text describing the symptoms")
    api_key: str = Field(..., description="Gemini API key")

class AnalysisResponse(BaseModel):
    extracted_symptoms: str
    diagnosis: Optional[str] = None

# Function to initialize Gemini model
def initialize_genai(api_key: str):
    genai.configure(api_key=api_key)
    return genai.GenerativeModel(model_name="gemini-2.0-flash-exp")

# Function to extract symptoms from text
def symptoms_extract(text: str, model):
    prompt = f"""
    Imagine you are an efficient and knowledgeable medical advisor. Your task is to carefully analyze the provided text and accurately extract any mentioned symptoms. Focus only on symptoms related to medical conditions and provide a structured list. If no symptoms are found, respond with 'No symptoms detected.'
    Text Input: {text}
    """
    response = model.generate_content(prompt)
    return response.text

# Function to analyze symptoms and provide diagnosis
def response_analysis(symptoms: str, model):
    prompt = f"""
    Imagine you are a highly efficient medical advisor and professor. Your task is to analyze the provided symptoms, identify the most likely diseases, and assign a confidence score (%) to each.

Instructions:
Extract key symptoms from the input.
Determine the most probable disease(s) based on medical knowledge.
Assign a confidence score (%) to each diagnosis.
If symptoms are unclear, request additional details.
Summarize the diagnosis, limiting output to the most relevant condition(s).
Provide insights into the cause of symptoms, possible cures, and recommended diet.
Output Format:
🔹 Diagnosis Analysis:
 Most Likely Condition: [Disease Name]
Confidence Level: [X%]
Explanation: [Brief reason for likelihood]
Suggested Next Steps: [Recommended action]

 Alternative Diagnosis (if applicable): [Disease Name]
Confidence Level: [Y%]
Explanation: [Brief reason for consideration]

1. Reason for These Symptoms:
[Explain possible causes such as infections, deficiencies, lifestyle factors, etc.]

2. Cure/Treatment:
[Suggested treatments, medications, home remedies, or medical interventions]

3. Recommended Foods:
[Best foods to aid recovery, boost immunity, or alleviate symptoms]

⚠ Disclaimer: This is an AI-based preliminary analysis. Please consult a medical professional for an accurate diagnosis.
    """
    response = model.generate_content(prompt)
    return response.text

# Routes
@app.get("/", response_class=HTMLResponse)
async def get_home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_symptoms(request: SymptomRequest):
    try:
        # Initialize Gemini model
        model = initialize_genai(request.api_key)
        
        # Extract symptoms
        extracted_symptoms = symptoms_extract(request.text, model)
        
        # Initialize diagnosis as None
        diagnosis = None
        
        # If symptoms were detected, analyze them
        if "No symptoms detected" not in extracted_symptoms:
            diagnosis = response_analysis(extracted_symptoms, model)
        
        return AnalysisResponse(
            extracted_symptoms=extracted_symptoms,
            diagnosis=diagnosis
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing symptoms: {str(e)}")

# Run the app with uvicorn if this file is executed directly
if __name__ == "__main__":
    uvicorn.run("feature1_fastapi:app", host="0.0.0.0", port=8000, reload=True)