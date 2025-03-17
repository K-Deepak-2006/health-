import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Stethoscope, Leaf, Pill, X } from 'lucide-react';

interface HealthQuestion {
  id: number;
  question: string;
  options: string[];
  category: 'digestive' | 'respiratory' | 'musculoskeletal' | 'mental' | 'sleep';
}

const healthQuestions: HealthQuestion[] = [
  {
    id: 1,
    question: "What type of digestive issues are you experiencing?",
    options: [
      "Acid reflux/heartburn",
      "Bloating and gas",
      "Constipation",
      "None of these"
    ],
    category: 'digestive'
  },
  {
    id: 2,
    question: "Are you experiencing any respiratory symptoms?",
    options: [
      "Frequent coughing",
      "Shortness of breath",
      "Chest congestion",
      "None of these"
    ],
    category: 'respiratory'
  },
  {
    id: 3,
    question: "Do you have any muscle or joint pain?",
    options: [
      "Back pain",
      "Joint stiffness",
      "Muscle soreness",
      "None of these"
    ],
    category: 'musculoskeletal'
  },
  {
    id: 4,
    question: "How would you describe your mental state?",
    options: [
      "Feeling anxious",
      "Having trouble focusing",
      "Mood swings",
      "None of these"
    ],
    category: 'mental'
  },
  {
    id: 5,
    question: "Are you experiencing any sleep issues?",
    options: [
      "Difficulty falling asleep",
      "Waking up frequently",
      "Daytime sleepiness",
      "None of these"
    ],
    category: 'sleep'
  }
];

const solutions = {
  digestive: {
    modern: {
      title: "Modern Digestive Care",
      description: "Evidence-based treatments for digestive health",
      recommendations: [
        "Proton pump inhibitors for acid reflux",
        "Dietary modifications",
        "Probiotics supplementation",
        "Regular exercise routine"
      ],
      image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=600"
    },
    ayurvedic: {
      title: "Ayurvedic Digestive Healing",
      description: "Traditional digestive wellness practices",
      recommendations: [
        "Triphala for digestive balance",
        "Ginger and cumin tea",
        "Mindful eating practices",
        "Digestive yoga poses"
      ],
      image: "https://images.unsplash.com/photo-1611288875785-f62fb9b044a1?auto=format&fit=crop&q=80&w=600"
    }
  },
  respiratory: {
    modern: {
      title: "Respiratory Health Management",
      description: "Contemporary respiratory care approaches",
      recommendations: [
        "Bronchodilators for breathing",
        "Steam inhalation therapy",
        "Breathing exercises",
        "Air quality improvement"
      ],
      image: "https://images.unsplash.com/photo-1584650589355-e89a29ec8159?auto=format&fit=crop&q=80&w=600"
    },
    ayurvedic: {
      title: "Ayurvedic Breath Healing",
      description: "Traditional respiratory wellness",
      recommendations: [
        "Pranayama breathing techniques",
        "Tulsi and honey mixture",
        "Chest warming herbs",
        "Nasya treatment"
      ],
      image: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&q=80&w=600"
    }
  },
  musculoskeletal: {
    modern: {
      title: "Pain Management Protocol",
      description: "Scientific approach to pain relief",
      recommendations: [
        "Physical therapy exercises",
        "Anti-inflammatory medication",
        "Heat/cold therapy",
        "Ergonomic adjustments"
      ],
      image: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&q=80&w=600"
    },
    ayurvedic: {
      title: "Ayurvedic Pain Relief",
      description: "Traditional pain management wisdom",
      recommendations: [
        "Abhyanga massage",
        "Joint-supporting herbs",
        "Therapeutic yoga poses",
        "Anti-inflammatory diet"
      ],
      image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=600"
    }
  },
  mental: {
    modern: {
      title: "Mental Wellness Program",
      description: "Evidence-based mental health support",
      recommendations: [
        "Cognitive behavioral therapy",
        "Stress management techniques",
        "Mindfulness practices",
        "Regular exercise"
      ],
      image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=600"
    },
    ayurvedic: {
      title: "Ayurvedic Mental Balance",
      description: "Traditional mental wellness practices",
      recommendations: [
        "Meditation techniques",
        "Brahmi herb supplements",
        "Daily routine optimization",
        "Stress-reducing diet"
      ],
      image: "https://images.unsplash.com/photo-1506126279646-a697353d3166?auto=format&fit=crop&q=80&w=600"
    }
  },
  sleep: {
    modern: {
      title: "Sleep Optimization Protocol",
      description: "Scientific sleep improvement methods",
      recommendations: [
        "Sleep hygiene practices",
        "Melatonin supplementation",
        "Cognitive behavioral therapy",
        "Light therapy"
      ],
      image: "https://images.unsplash.com/photo-1511295742362-92c96b1cf484?auto=format&fit=crop&q=80&w=600"
    },
    ayurvedic: {
      title: "Ayurvedic Sleep Harmony",
      description: "Traditional sleep enhancement",
      recommendations: [
        "Ashwagandha herbs",
        "Evening oil massage",
        "Calming tea rituals",
        "Sleep-promoting yoga"
      ],
      image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=600"
    }
  }
};

export const HealthIssuesAssessment = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [showQuestions, setShowQuestions] = useState(true);

  const handleAnswer = (answer: string) => {
    const question = healthQuestions[currentQuestion];
    setAnswers({ ...answers, [question.category]: answer });

    if (currentQuestion < healthQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const getRelevantCategories = () => {
    return Object.entries(answers)
      .filter(([_, answer]) => answer !== "None of these")
      .map(([category]) => category as keyof typeof solutions);
  };

  const handleReset = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
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
            <Stethoscope className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            Health Issues Assessment
          </h2>
          <button
            onClick={handleReset}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {!showResults ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Question {currentQuestion + 1} of {healthQuestions.length}
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {Math.round(((currentQuestion + 1) / healthQuestions.length) * 100)}% Complete
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${((currentQuestion + 1) / healthQuestions.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
                {healthQuestions[currentQuestion].question}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {healthQuestions[currentQuestion].options.map((option, index) => (
                  <motion.button
                    key={index}
                    className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow text-gray-900 dark:text-white"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAnswer(option)}
                  >
                    {option}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {getRelevantCategories().map((category) => (
              <div key={category} className="space-y-6">
                <h3 className="text-2xl font-semibold text-gray-800 dark:text-white">
                  Solutions for {category.charAt(0).toUpperCase() + category.slice(1)} Issues
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Modern Medicine Solution */}
                  <motion.div
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
                    whileHover={{ y: -5 }}
                  >
                    <img
                      src={solutions[category].modern.image}
                      alt="Modern treatment"
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Pill className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
                          {solutions[category].modern.title}
                        </h4>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        {solutions[category].modern.description}
                      </p>
                      <ul className="space-y-2">
                        {solutions[category].modern.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>

                  {/* Ayurvedic Solution */}
                  <motion.div
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
                    whileHover={{ y: -5 }}
                  >
                    <img
                      src={solutions[category].ayurvedic.image}
                      alt="Ayurvedic treatment"
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Leaf className="w-6 h-6 text-green-600 dark:text-green-400" />
                        <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
                          {solutions[category].ayurvedic.title}
                        </h4>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        {solutions[category].ayurvedic.description}
                      </p>
                      <ul className="space-y-2">
                        {solutions[category].ayurvedic.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};