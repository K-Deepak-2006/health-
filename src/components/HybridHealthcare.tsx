import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, X } from 'lucide-react';

interface AssessmentQuestion {
  id: number;
  question: string;
  type: 'heartRate' | 'bloodPressure' | 'temperature' | 'stressLevel' | 'other';
  options: {
    text: string;
    value: any;
  }[];
}

const assessmentQuestions: AssessmentQuestion[] = [
  {
    id: 1,
    question: "What is your current heart rate (beats per minute)?",
    type: 'heartRate',
    options: [
      { text: "Below 60 bpm", value: 55 },
      { text: "60-80 bpm", value: 72 },
      { text: "81-100 bpm", value: 90 },
      { text: "Above 100 bpm", value: 110 }
    ]
  },
  {
    id: 2,
    question: "What is your blood pressure range?",
    type: 'bloodPressure',
    options: [
      { text: "Low (Below 90/60)", value: { systolic: 85, diastolic: 55 } },
      { text: "Normal (90/60 - 120/80)", value: { systolic: 115, diastolic: 75 } },
      { text: "Elevated (120/80 - 140/90)", value: { systolic: 135, diastolic: 85 } },
      { text: "High (Above 140/90)", value: { systolic: 145, diastolic: 95 } }
    ]
  },
  {
    id: 3,
    question: "What is your current body temperature?",
    type: 'temperature',
    options: [
      { text: "Below normal (< 97.0°F)", value: 96.8 },
      { text: "Normal (97.0°F - 99.0°F)", value: 98.6 },
      { text: "Slightly elevated (99.1°F - 100.4°F)", value: 99.8 },
      { text: "Fever (> 100.4°F)", value: 101.2 }
    ]
  },
  {
    id: 4,
    question: "How would you rate your current stress level?",
    type: 'stressLevel',
    options: [
      { text: "Feeling calm and relaxed", value: "Low" },
      { text: "Slightly stressed", value: "Moderate" },
      { text: "Moderately stressed", value: "High" },
      { text: "Extremely stressed", value: "Very High" }
    ]
  },
  {
    id: 5,
    question: "How is your energy level today?",
    type: 'other',
    options: [
      { text: "Very energetic", value: "high" },
      { text: "Moderately energetic", value: "moderate" },
      { text: "Somewhat tired", value: "low" },
      { text: "Extremely fatigued", value: "very_low" }
    ]
  }
];

interface HybridHealthcareProps {
  onAssessmentComplete: (results: {
    heartRate?: number;
    bloodPressure?: { systolic: number; diastolic: number };
    temperature?: number;
    stressLevel?: 'Low' | 'Moderate' | 'High' | 'Very High';
  }) => void;
}

export const HybridHealthcare: React.FC<HybridHealthcareProps> = ({ onAssessmentComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [showQuestions, setShowQuestions] = useState(true);

  const handleAnswer = (questionId: number, answer: any) => {
    const newAnswers = { ...answers, [questionId]: answer };
    setAnswers(newAnswers);

    if (currentQuestionIndex < assessmentQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Process results and complete silently
      const results = {
        heartRate: newAnswers[1],
        bloodPressure: newAnswers[2],
        temperature: newAnswers[3],
        stressLevel: newAnswers[4]
      };
      onAssessmentComplete(results);
    }
  };

  const handleReset = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setShowQuestions(false);
  };

  if (!showQuestions) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
            <Activity className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            Health Assessment
          </h2>
          <button
            onClick={handleReset}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Question {currentQuestionIndex + 1} of {assessmentQuestions.length}
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {Math.round(((currentQuestionIndex + 1) / assessmentQuestions.length) * 100)}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${((currentQuestionIndex + 1) / assessmentQuestions.length) * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
              {assessmentQuestions[currentQuestionIndex].question}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assessmentQuestions[currentQuestionIndex].options.map((option, index) => (
                <motion.button
                  key={index}
                  className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow text-gray-900 dark:text-white"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAnswer(assessmentQuestions[currentQuestionIndex].id, option.value)}
                >
                  {option.text}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};