import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Mic, X } from 'lucide-react';
import { useSpring, animated } from '@react-spring/web';

export const AIAvatar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const pulseAnimation = useSpring({
    from: { transform: 'scale(1)' },
    to: { transform: 'scale(1.1)' },
    config: { duration: 1000 },
    loop: { reverse: true },
  });

  return (
    <>
      <motion.div
        className={`fixed bottom-8 right-8 ${isOpen ? 'w-96' : 'w-16'} transition-all duration-300`}
        initial={false}
      >
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: 20, height: 0 }}
              className="bg-white rounded-lg shadow-xl mb-4 overflow-hidden"
            >
              <div className="p-4 border-b">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">AI Health Assistant</h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-4 h-96 overflow-y-auto">
                <div className="space-y-4">
                  <div className="bg-blue-50 p-3 rounded-lg max-w-[80%]">
                    <p className="text-sm">Hello! How can I help you with your health today?</p>
                  </div>
                </div>
              </div>
              <div className="p-4 border-t bg-gray-50">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Type your health concern..."
                    className="flex-1 px-4 py-2 rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <animated.button
                    style={isListening ? pulseAnimation : {}}
                    onClick={() => setIsListening(!isListening)}
                    className={`p-2 rounded-full ${
                      isListening ? 'bg-red-500' : 'bg-blue-500'
                    } text-white`}
                  >
                    <Mic className="w-5 h-5" />
                  </animated.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <motion.button
          className={`${
            isOpen ? 'bg-gray-200' : 'bg-blue-600'
          } rounded-full p-4 shadow-lg w-16 h-16 flex items-center justify-center`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)}
        >
          <Bot className={`w-8 h-8 ${isOpen ? 'text-blue-600' : 'text-white'}`} />
        </motion.button>
      </motion.div>
    </>
  );
};