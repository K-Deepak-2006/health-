import streamlit as st
import google.generativeai as genai

# Page configuration
st.set_page_config(
    page_title="Medical Symptom Analyzer",
    page_icon="🏥",
    layout="centered"
)

# Custom CSS for better styling
st.markdown("""
<style>
    .main-header {
        font-size: 2.5rem;
        color: #1E88E5;
        text-align: center;
        margin-bottom: 1rem;
    }
    .sub-header {
        font-size: 1.5rem;
        color: #424242;
        margin-bottom: 1.5rem;
    }
    .disclaimer {
        background-color: #FFF3E0;
        padding: 10px;
        border-radius: 5px;
        margin-top: 20px;
        font-style: italic;
    }
    .stButton>button {
        background-color: #1E88E5;
        color: white;
        font-weight: bold;
    }
    .result-section {
        margin-top: 20px;
        padding: 15px;
        border-radius: 5px;
        background-color: #F5F5F5;
    }
</style>
""", unsafe_allow_html=True)

# Function to initialize Gemini API
@st.cache_resource
def initialize_genai(api_key):
    genai.configure(api_key=api_key)
    return genai.GenerativeModel(model_name="gemini-2.0-flash")

# Function to extract symptoms from text
def symptoms_extract(text, model):
    prompt1 = f"""
    Imagine you are an efficient and knowledgeable medical advisor. Your task is to carefully analyze the provided text and accurately extract any mentioned symptoms. Focus only on symptoms related to medical conditions and provide a structured list. If no symptoms are found, respond with 'No symptoms detected.'
    Text Input: {text}
    """
    response = model.generate_content(prompt1)
    return response.text

# Function to analyze symptoms and provide diagnosis
def response_analysis(symptoms, model):
    prompt2 = f"""
    **"Imagine you are an efficient and knowledgeable medical advisor as well as a medical professor. Your task is to carefully analyze the provided symptoms, determine the most likely diseases the user may be suffering from, and provide a confidence score for each possible condition.
    Instructions:
    Extract key symptoms from the input.
    Analyze potential diseases based on medical knowledge.
    Provide a confidence score (%) for each predicted disease.
    If symptoms are unclear or insufficient, suggest additional information the user should provide.
    User Symptoms: {symptoms}
    Diagnosis Analysis:
    1️⃣ Possible Disease: [Disease Name]
    Confidence Level: [X%]
    Explanation: [Why this disease is likely]
    Suggested Next Steps: [What the user should do next]
    2️⃣ Alternative Diagnosis (if applicable): [Disease Name]
    confidence Level: [Y%]
    Explanation: [Why this disease is a possibility]
    ⚠ Disclaimer: This is an AI-based preliminary analysis. Please consult a medical professional for an accurate diagnosis."**
    """
    response = model.generate_content(prompt2)
    return response.text

# Main app function
def main():
    st.markdown('<h1 class="main-header">Medical Symptom Analyzer</h1>', unsafe_allow_html=True)
    st.markdown('<p class="sub-header">Describe your symptoms for analysis</p>', unsafe_allow_html=True)
    
    # Sidebar for API key
    with st.sidebar:
        st.header("API Configuration")
        api_key = st.text_input("Enter Gemini API Key:", type="password", value="AIzaSyBBugr5_EJvAsWknredcLTbTYGhupmr7x8")
        st.info("Your API key is stored only in your session and not saved elsewhere.")
    
    # Initialize the model
    try:
        model = initialize_genai(api_key)
    except Exception as e:
        st.error(f"Error initializing Gemini API: {e}")
        return
    
    # Text input for symptoms
    user_input = st.text_area("Describe your symptoms:", height=150, 
                              placeholder="Example: I've been having a fever of 101°F for the past 2 days, with a sore throat and fatigue.")
    
    # Analysis button
    analyze_button = st.button("Analyze Symptoms")
    if analyze_button and user_input:
        with st.spinner("Analyzing symptoms..."):
            # Extract symptoms
            extracted_symptoms = symptoms_extract(user_input, model)
            
            # Show extracted symptoms
            st.subheader("Extracted Symptoms:")
            st.write(extracted_symptoms)
            
            # If symptoms are detected, proceed with analysis
            if "No symptoms detected" not in extracted_symptoms:
                # Get analysis
                with st.spinner("Generating diagnosis..."):
                    diagnosis = response_analysis(extracted_symptoms, model)
                
                # Display the diagnosis
                st.markdown('<div class="result-section">', unsafe_allow_html=True)
                st.subheader("Diagnosis Analysis:")
                st.markdown(diagnosis)
                st.markdown('</div>', unsafe_allow_html=True)
            else:
                st.warning("No symptoms were detected in your input. Please provide more specific information about your condition.")
    elif analyze_button and not user_input:
        st.warning("Please enter symptoms before analysis.")
    
    # Disclaimer
    st.markdown('<div class="disclaimer">', unsafe_allow_html=True)
    st.write("⚠️ **Disclaimer:** This tool is for informational purposes only and does not replace professional medical advice. Always consult with a healthcare provider for diagnosis and treatment.")
    st.markdown('</div>', unsafe_allow_html=True)

if __name__ == "__main__":
    main()