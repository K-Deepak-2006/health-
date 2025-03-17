from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
import google.generativeai as genai
import logging
from typing import Dict, Any, List, Optional
import json
import uvicorn

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("health_assistant_api")

# Initialize FastAPI app
app = FastAPI(
    title="Health Assistant API",
    description="API for AI-powered health assistant using Gemini 2.5 Flash",
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

# Pydantic models for request and response validation
class ChatRequest(BaseModel):
    message: str = Field(..., description="User message for the chat")
    api_key: str = Field(default="AIzaSyCQcAZpBJi2ox3FZB1zXHGvYhDH8VGepL0", description="Gemini API key")
    session_id: Optional[str] = Field(default=None, description="Session ID for conversation tracking")

class ChatResponse(BaseModel):
    response: str
    session_id: str

# Store conversation histories by session ID
conversation_histories: Dict[str, List[Dict[str, Any]]] = {}

# Function to initialize Gemini model
def initialize_genai(api_key: str):
    genai.configure(api_key=api_key)
    return genai.GenerativeModel(model_name="gemini-2.0-flash-exp")

def format_prompt(user_message: str, conversation_history: List[Dict[str, Any]]) -> str:
    """
    Format the prompt for the Gemini model
    
    Args:
        user_message: The user's message
        conversation_history: The conversation history
        
    Returns:
        Formatted prompt string
    """
    # Create a context from conversation history (limited to last 5 messages)
    context = ""
    if conversation_history:
        recent_history = conversation_history[-5:]
        for msg in recent_history:
            role = "User" if msg["role"] == "user" else "Assistant"
            context += f"{role}: {msg['content']}\n"
    
    prompt = f"""
    You are an AI Health Assistant, a knowledgeable and helpful medical advisor. Your task is to analyze the provided symptoms, suggest possible conditions, and offer guidance while maintaining caution in diagnosis.

Instructions:
Extract key symptoms and analyze potential conditions.
Provide confidence scores (%) for each possible disease.
Use evidence-based medical knowledge to explain likely causes.
Format key information using bold text for emphasis.
Break responses into clear sections with spacing for readability.
Offer guidance on possible causes, treatments, and diet.
Avoid making definitive diagnoses and recommend professional consultation.
    
    
    Previous conversation:
    {context}
    
    User: {user_message}
    Assistant:
    """
    
    return prompt

@app.post("/chat", response_model=ChatResponse)
async def chat_with_assistant(request: ChatRequest):
    try:
        # Generate a session ID if not provided
        session_id = request.session_id or f"session_{len(conversation_histories) + 1}"
        
        # Get or create conversation history for this session
        if session_id not in conversation_histories:
            conversation_histories[session_id] = []
        
        conversation_history = conversation_histories[session_id]
        
        # Add user message to conversation history
        conversation_history.append({
            "role": "user",
            "content": request.message
        })
        
        # Initialize Gemini model with the provided API key
        model = initialize_genai(request.api_key)
        
        # Generate the prompt
        prompt = format_prompt(request.message, conversation_history)
        
        # Get response from Gemini
        response = model.generate_content(prompt)
        assistant_response = response.text
        
        # Add assistant response to conversation history
        conversation_history.append({
            "role": "assistant",
            "content": assistant_response
        })
        
        # Ensure we have a disclaimer if not already present
        if "disclaimer" not in assistant_response.lower() and "consult" not in assistant_response.lower():
            assistant_response += ""
        
        # Update the conversation history
        conversation_histories[session_id] = conversation_history
        
        return ChatResponse(response=assistant_response, session_id=session_id)
    except Exception as e:
        logger.error(f"Error processing chat: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing chat: {str(e)}")

@app.post("/reset")
async def reset_conversation(request: ChatRequest):
    try:
        session_id = request.session_id
        
        if session_id and session_id in conversation_histories:
            conversation_histories[session_id] = []
            return JSONResponse(content={"message": "Conversation reset successfully", "session_id": session_id})
        else:
            return JSONResponse(content={"message": "Session not found", "session_id": session_id}, status_code=404)
    except Exception as e:
        logger.error(f"Error resetting conversation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error resetting conversation: {str(e)}")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "Health Assistant API"}

# Run the app with uvicorn if this file is executed directly
if __name__ == "__main__":
    uvicorn.run("chatbot:app", host="0.0.0.0", port=8001, reload=True) 