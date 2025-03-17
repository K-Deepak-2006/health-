import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Menu, Activity, Stethoscope } from 'lucide-react';
import { HealthDashboard } from './components/HealthDashboard';
import { SymptomChecker } from './components/SymptomChecker';
import { AppointmentBooking } from './components/AppointmentBooking';
import { HybridHealthcare } from './components/HybridHealthcare';
import { HealthIssuesAssessment } from './components/HealthIssuesAssessment';

interface AssessmentResults {
  heartRate?: number;
  bloodPressure?: { systolic: number; diastolic: number };
  temperature?: number;
  stressLevel?: 'Low' | 'Moderate' | 'High' | 'Very High';
}

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showHealthAssessment, setShowHealthAssessment] = useState(false);
  const [showHealthIssues, setShowHealthIssues] = useState(false);
  const [hasCompletedAssessment, setHasCompletedAssessment] = useState(false);
  const [assessmentResults, setAssessmentResults] = useState<AssessmentResults>({});

  const handleAssessmentComplete = (results: AssessmentResults) => {
    setAssessmentResults(results);
    setHasCompletedAssessment(true);
    setShowHealthAssessment(false); // Hide assessment after completion
  };

  const handleHealthAssessmentClose = () => {
    setShowHealthAssessment(false);
    setHasCompletedAssessment(false);
    setAssessmentResults({});
  };

  const handleHealthIssuesClose = () => {
    setShowHealthIssues(false);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Menu className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
                Virtual Health Assistant
              </span>
            </div>
            
            <motion.button
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700"
              onClick={() => setIsDarkMode(!isDarkMode)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5 text-yellow-500" />
              ) : (
                <Moon className="h-5 w-5 text-gray-600" />
              )}
            </motion.button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Your AI Health Companion
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Get instant health insights and personalized care recommendations
            </p>
            <div className="flex justify-center gap-4">
              <motion.button
                className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setShowHealthAssessment(true);
                  setShowHealthIssues(false);
                }}
              >
                <Activity className="w-5 h-5" />
                Health Assessment
              </motion.button>
              <motion.button
                className="bg-green-600 text-white px-6 py-3 rounded-lg flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setShowHealthIssues(true);
                  setShowHealthAssessment(false);
                }}
              >
                <Stethoscope className="w-5 h-5" />
                Health Issues Assessment
              </motion.button>
            </div>
          </motion.div>

          {/* Health Dashboard */}
          <AnimatePresence>
            {hasCompletedAssessment && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-12"
              >
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                  Health Overview
                </h2>
                <HealthDashboard assessmentResults={assessmentResults} />
              </motion.section>
            )}
          </AnimatePresence>

          {/* Hybrid Healthcare */}
          <AnimatePresence>
            {showHealthAssessment && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-12"
              >
                <HybridHealthcare 
                  onAssessmentComplete={handleAssessmentComplete} 
                />
              </motion.section>
            )}
          </AnimatePresence>

          {/* Health Issues Assessment */}
          <AnimatePresence>
            {showHealthIssues && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-12"
              >
                <HealthIssuesAssessment />
              </motion.section>
            )}
          </AnimatePresence>

          {/* Symptom Checker */}
          <section className="mb-12">
            <SymptomChecker />
          </section>

          {/* Appointment Booking */}
          <section className="mb-12">
            <AppointmentBooking />
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;