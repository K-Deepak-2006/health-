import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, MessageCircle } from 'lucide-react';
import { VoiceInput } from './VoiceInput';
import { HealthAssistantChat } from './HealthAssistantChat';

interface Symptom {
  id: string;
  name: string;
  severity: 'low' | 'medium' | 'high';
}

interface AnalysisResponse {
  extracted_symptoms: string;
  diagnosis: string | null;
}

export const SymptomChecker = () => {
  const [symptoms, setSymptoms] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState<Symptom[]>([]);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(true);
  
  // For the Gemini API key - handled securely without exposing in UI
  const apiKey = 'AIzaSyCQcAZpBJi2ox3FZB1zXHGvYhDH8VGepL0';

  const commonSymptoms: Symptom[] = [
    { id: '1', name: 'Headache', severity: 'medium' },
    { id: '2', name: 'Fever', severity: 'high' },
    { id: '3', name: 'Cough', severity: 'low' },
    { id: '4', name: 'Fatigue', severity: 'medium' },
  ];

  const handleAnalyze = async () => {
    // Check if there's text to analyze
    if (!symptoms && selectedSymptoms.length === 0) {
      setError('Please describe your symptoms or select some from the common symptoms list');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    
    try {
      // Prepare the text to send - combine manual input and selected symptoms
      const symptomsText = [
        symptoms,
        ...selectedSymptoms.map(s => s.name)
      ].filter(Boolean).join(', ');
      
      // Make the API call to the FastAPI backend
      
      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: symptomsText,
          api_key: apiKey
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error from server: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setAnalysisResult(data);
    } catch (err) {
      console.error('Error analyzing symptoms:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze symptoms');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const addSymptom = (symptom: Symptom) => {
    if (!selectedSymptoms.find(s => s.id === symptom.id)) {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const formatDiagnosisText = (text: string) => {
    // First split by periods to handle newlines after sentences
    const sentences = text.split('.').filter(s => s.trim().length > 0);
    
    return (
      <div className="space-y-4">
        {sentences.map((sentence, idx) => {
          // Format each sentence with bold for text inside ** **
          const parts = sentence.split(/(\*\*.*?\*\*)/g);
          
          // Check if this sentence contains an explanation
          const isExplanation = sentence.trim().toLowerCase().startsWith('explanation');
          
          return (
            <div 
              key={idx} 
              className={`${
                isExplanation 
                  ? 'bg-blue-100 dark:bg-blue-900/30 p-2 rounded-md text-blue-800 dark:text-blue-200' 
                  : ''
              }`}
            >
              {parts.map((part, partIdx) => {
                // Check if this part is wrapped in ** **
                if (part.startsWith('**') && part.endsWith('**')) {
                  // Extract the content between ** **
                  const content = part.slice(2, -2);
                  return <strong key={partIdx} className="font-bold">{content}</strong>;
                }
                
                // Check if this is the start of an explanation
                if (partIdx === 0 && isExplanation) {
                  return (
                    <span key={partIdx}>
                      <strong className="font-bold text-blue-700 dark:text-blue-300">Explanation:</strong>
                      {part.replace(/explanation/i, '')}
                    </span>
                  );
                }
                
                return <span key={partIdx}>{part}</span>;
              })}
              {'.'}
            </div>
          );
        })}
      </div>
    );
  };

  const formatSymptomText = (text: string) => {
    // Split by commas to get individual symptoms
    const symptomsList = text.split(',').map(s => s.trim()).filter(Boolean);
    
    return (
      <div className="flex flex-wrap gap-2">
        {symptomsList.map((symptom, idx) => {
          // Format each symptom with bold for text inside ** **
          const parts = symptom.split(/(\*\*.*?\*\*)/g);
          
          return (
            <div 
              key={idx} 
              className="bg-purple-100 dark:bg-purple-900/40 px-3 py-1 rounded-full"
            >
              {parts.map((part, partIdx) => {
                // Check if this part is wrapped in ** **
                if (part.startsWith('**') && part.endsWith('**')) {
                  // Extract the content between ** **
                  const content = part.slice(2, -2);
                  return <strong key={partIdx} className="font-bold">{content}</strong>;
                }
                
                return <span key={partIdx}>{part}</span>;
              })}
              {idx < symptomsList.length - 1 && <span className="hidden">,</span>}
            </div>
          );
        })}
      </div>
    );
  };

  const formatDisclaimerText = (text: string) => {
    // Format text with bold for content inside ** **
    const parts = text.split(/(\*\*.*?\*\*)/g);
    
    return (
      <p>
        {parts.map((part, idx) => {
          // Check if this part is wrapped in ** **
          if (part.startsWith('**') && part.endsWith('**')) {
            // Extract the content between ** **
            const content = part.slice(2, -2);
            return <strong key={idx} className="font-bold">{content}</strong>;
          }
          
          return <span key={idx}>{part}</span>;
        })}
      </p>
    );
  };

  return (
    <React.Fragment>
      {/* Render the HealthAssistantChat component outside the main container */}
      {showChat ? (
        <HealthAssistantChat 
          apiKey={apiKey} 
          onClose={() => setShowChat(false)} 
        />
      ) : (
        <motion.button
          className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-lg z-50 flex items-center justify-center"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowChat(true)}
          title="Show Health Assistant"
        >
          <MessageCircle className="w-6 h-6" />
        </motion.button>
      )}
      
      {/* Main Symptom Checker Container */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400 mb-2">AI Symptom Checker</h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-lg mx-auto">
            Describe your symptoms or select from common ones below for an AI-powered health analysis
          </p>
        </div>
        
        {/* Selected Symptoms */}
        {selectedSymptoms.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6"
          >
            <h3 className="text-xl font-bold mb-3 text-indigo-600 dark:text-indigo-400">Selected Symptoms</h3>
            <div className="flex flex-wrap gap-2">
              {selectedSymptoms.map((symptom) => (
                <motion.span
                  key={symptom.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`px-3 py-1 rounded-full text-white font-bold ${
                    symptom.severity === 'high' 
                      ? 'bg-gradient-to-r from-red-500 to-red-600 shadow-md shadow-red-200 dark:shadow-red-900/30' 
                      : symptom.severity === 'medium'
                      ? 'bg-gradient-to-r from-yellow-500 to-amber-500 shadow-md shadow-yellow-200 dark:shadow-yellow-900/30'
                      : 'bg-gradient-to-r from-green-500 to-emerald-500 shadow-md shadow-green-200 dark:shadow-green-900/30'
                  }`}
                >
                  <strong>{symptom.name}</strong>
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}
        
        {/* Voice Input */}
        <div className="relative space-y-4">
          <VoiceInput
            onTranscriptChange={setSymptoms}
            placeholder="Describe your symptoms in detail or click the microphone to speak..."
          />
          
          {/* Analyze Button */}
          <motion.button
            className={`w-full bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 ${
              isAnalyzing ? 'cursor-not-allowed' : ''
            }`}
            whileHover={!isAnalyzing ? { scale: 1.02 } : {}}
            whileTap={!isAnalyzing ? { scale: 0.98 } : {}}
            onClick={handleAnalyze}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <motion.div
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            ) : (
              <React.Fragment>
                <Search className="w-5 h-5" />
                Analyze Symptoms
              </React.Fragment>
            )}
          </motion.button>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-lg"
          >
            <p>{error}</p>
          </motion.div>
        )}

        {/* Analysis Results */}
        {analysisResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <h3 className="text-xl font-bold mb-3 text-blue-600 dark:text-blue-400">Analysis Results</h3>
            
            <div className="mb-4">
              <h4 className="font-bold text-purple-700 dark:text-purple-400 mb-2">Extracted Symptoms:</h4>
              <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-md whitespace-pre-line text-purple-800 dark:text-purple-200">
                {formatSymptomText(analysisResult.extracted_symptoms)}
              </div>
            </div>
            
            {analysisResult.diagnosis && (
              <div>
                <h4 className="font-bold text-green-700 dark:text-green-400 mb-2">Diagnosis Analysis:</h4>
                <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-md whitespace-pre-line text-green-800 dark:text-green-200">
                  {formatDiagnosisText(analysisResult.diagnosis)}
                </div>
              </div>
            )}
            
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-md text-sm text-yellow-800 dark:text-yellow-200">
              {formatDisclaimerText("⚠️ **Disclaimer:** This analysis is for informational purposes only and does not replace professional medical advice.")}
            </div>
          </motion.div>
        )}

        {/* Common Symptoms */}
        <div className="mt-6">
          <h3 className="text-xl font-bold mb-3 text-orange-600 dark:text-orange-400">Common Symptoms</h3>
          <div className="flex flex-wrap gap-2">
            {commonSymptoms.map((symptom) => (
              <motion.button
                key={symptom.id}
                className={`flex items-center gap-1 px-3 py-1 rounded-full 
                  ${symptom.severity === 'high' 
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800/50' 
                    : symptom.severity === 'medium'
                    ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-800/50'
                    : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800/50'
                  }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => addSymptom(symptom)}
              >
                <Plus className="w-4 h-4" />
                <strong>{symptom.name}</strong>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};