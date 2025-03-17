import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User, X, Minimize2, Maximize2, RefreshCw, XCircle } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatProps {
  apiKey: string;
  onClose?: () => void;
}

export const HealthAssistantChat: React.FC<ChatProps> = ({ apiKey, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your AI Health Assistant. How can I help you today?",
      sender: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const formatMessageText = (text: string) => {
    // Format text with bold for content inside ** **
    const parts = text.split(/(\*\*.*?\*\*)/g);
    
    return (
      <>
        {parts.map((part, idx) => {
          // Check if this part is wrapped in ** **
          if (part.startsWith('**') && part.endsWith('**')) {
            // Extract the content between ** **
            const content = part.slice(2, -2);
            return <strong key={idx} className="font-bold">{content}</strong>;
          }
          
          // Check if this is the start of an explanation
          if (part.toLowerCase().includes('explanation:')) {
            const [before, after] = part.split(/explanation:/i);
            return (
              <span key={idx}>
                {before}
                <strong className="font-bold text-blue-700 dark:text-blue-300">Explanation:</strong>
                {after}
              </span>
            );
          }
          
          return <span key={idx}>{part}</span>;
        })}
      </>
    );
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);
    
    try {
      // Make API call to the chatbot backend
      const response = await fetch('http://localhost:8001/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          api_key: apiKey,
          session_id: sessionId
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error from server: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Save the session ID for future requests
      if (data.session_id) {
        setSessionId(data.session_id);
      }
      
      // Add assistant response
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || "I'm sorry, I couldn't process your request.",
        sender: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err instanceof Error ? err.message : 'Failed to communicate with the assistant');
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I encountered an error. Please try again later.",
        sender: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetConversation = async () => {
    if (!sessionId || isLoading) return;
    
    setIsLoading(true);
    
    try {
      // Call the reset endpoint
      const response = await fetch('http://localhost:8000/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: "",
          api_key: apiKey,
          session_id: sessionId
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error from server: ${response.status} ${response.statusText}`);
      }
      
      // Reset the messages
      setMessages([
        {
          id: Date.now().toString(),
          text: "Conversation has been reset. How can I help you today?",
          sender: 'assistant',
          timestamp: new Date()
        }
      ]);
      
    } catch (err) {
      console.error('Error resetting conversation:', err);
      setError(err instanceof Error ? err.message : 'Failed to reset conversation');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const closeChat = () => {
    setIsVisible(false);
    setIsOpen(false);
    setSessionId(null);
    setMessages([
      {
        id: '1',
        text: "Hello! I'm your AI Health Assistant. How can I help you today?",
        sender: 'assistant',
        timestamp: new Date()
      }
    ]);
    
    // Notify parent component if onClose callback is provided
    if (onClose) {
      onClose();
    }
  };

  // If not visible, don't render anything
  if (!isVisible) {
    return null;
  }

  return (
    <>
      {/* Chat button */}
      {!isOpen && (
        <motion.button
          className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-lg z-50 w-16 h-16 flex items-center justify-center"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleChat}
        >
          <Bot className="w-8 h-8" />
        </motion.button>
      )}
      
      {/* Chat window */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            height: isMinimized ? '60px' : '500px'
          }}
          className="fixed bottom-8 right-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 w-80 md:w-96 overflow-hidden flex flex-col"
        >
          {/* Chat header */}
          <div className="bg-blue-600 text-white p-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <h3 className="font-bold">AI Health Assistant</h3>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={resetConversation}
                className="p-1 hover:bg-blue-700 rounded"
                title="Reset conversation"
                disabled={isLoading || !sessionId}
              >
                <RefreshCw className={`w-4 h-4 ${isLoading || !sessionId ? 'opacity-50' : ''}`} />
              </button>
              <button 
                onClick={toggleMinimize}
                className="p-1 hover:bg-blue-700 rounded"
                title={isMinimized ? "Maximize" : "Minimize"}
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button 
                onClick={toggleChat}
                className="p-1 hover:bg-blue-700 rounded"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
              <button 
                onClick={closeChat}
                className="p-1 hover:bg-red-700 rounded"
                title="Remove Health Assistant"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Chat messages */}
          {!isMinimized && (
            <div className="flex-1 p-3 overflow-y-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-3 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {message.sender === 'assistant' ? (
                        <Bot className="w-4 h-4" />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                      <span className="text-xs opacity-70">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="whitespace-pre-line">
                      {formatMessageText(message.text)}
                    </div>
                  </div>
                </div>
              ))}
              {error && (
                <div className="text-center p-2 my-2 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-md text-sm">
                  {error}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
          
          {/* Chat input */}
          {!isMinimized && (
            <div className="border-t border-gray-200 dark:border-gray-700 p-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your health question..."
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  disabled={isLoading}
                />
                <motion.button
                  className={`bg-blue-600 text-white p-2 rounded-md ${isLoading ? 'opacity-50' : ''}`}
                  whileHover={!isLoading ? { scale: 1.05 } : {}}
                  whileTap={!isLoading ? { scale: 0.95 } : {}}
                  onClick={handleSendMessage}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <motion.div
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </motion.button>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </>
  );
}; 