import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Loader } from 'lucide-react';

interface VoiceInputProps {
  onTranscriptChange?: (transcript: string) => void;
  placeholder?: string;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({
  onTranscriptChange,
  placeholder = 'Click the microphone to start speaking...'
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Initialize speech recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
          setError(null);
        };

        recognition.onerror = (event) => {
          if (event.error === 'not-allowed') {
            setError('Microphone access denied. Please enable microphone access and try again.');
          } else {
            setError('Error occurred during speech recognition. Please try again.');
          }
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.onresult = (event) => {
          let finalTranscript = '';
          let interimTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }

          const fullTranscript = finalTranscript || interimTranscript;
          setTranscript(fullTranscript);
          onTranscriptChange?.(fullTranscript);
        };

        setRecognition(recognition);
      } else {
        setError('Speech recognition is not supported in this browser.');
      }
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [onTranscriptChange]);

  const toggleListening = useCallback(() => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
    } else {
      setTranscript('');
      recognition.start();
    }
  }, [isListening, recognition]);

  return (
    <div className="w-full space-y-4">
      <div className="relative">
        <textarea
          className="w-full min-h-[120px] p-4 pr-14 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-gray-800 dark:border-gray-700"
          placeholder={placeholder}
          value={transcript}
          onChange={(e) => {
            setTranscript(e.target.value);
            onTranscriptChange?.(e.target.value);
          }}
          readOnly={isListening}
        />
        <motion.button
          className={`absolute right-2 top-2 p-2 rounded-full ${
            isListening
              ? 'bg-red-500 text-white'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          } shadow-sm`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleListening}
          disabled={!recognition}
        >
          <AnimatePresence mode="wait">
            {isListening ? (
              <motion.div
                key="recording"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <MicOff className="w-5 h-5" />
              </motion.div>
            ) : (
              <motion.div
                key="not-recording"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <Mic className="w-5 h-5" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 text-blue-600 dark:text-blue-400"
          >
            <Loader className="w-4 h-4 animate-spin" />
            <span>Listening...</span>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 text-red-600 dark:text-red-400"
          >
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};