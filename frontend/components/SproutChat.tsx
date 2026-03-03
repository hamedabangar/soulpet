
import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, Mic, MicOff, Loader2 } from 'lucide-react';
import { chatWithSprout } from '../services/geminiService';
import { ChatMessage } from '../types';

interface SproutChatProps {
  userContext: any;
  history: ChatMessage[];
  onNewMessage: (message: ChatMessage, isCrisis: boolean) => void;
  onTyping: (isTyping: boolean) => void;
}

const SproutChat: React.FC<SproutChatProps> = ({ userContext, history, onNewMessage, onTyping }) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentTranscript += event.results[i][0].transcript;
        }
        setInput(currentTranscript);
      };

      recognitionRef.current.onstart = () => setIsListening(true);
      recognitionRef.current.onend = () => setIsListening(false);
      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Voice recognition is not supported in this browser. Please try Chrome or Safari.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error("Failed to start recognition", e);
      }
    }
  };

  const handleSend = async () => {
    const messageText = input.trim();
    if (!messageText) return;
    
    setInput('');
    onTyping(true);
    
    // Add user message to history immediately via parent
    onNewMessage({ role: 'user', text: messageText }, false);

    // Get reply from Aura using the current history + the new message
    const reply = await chatWithSprout(history, messageText, userContext);
    
    // Add model reply to history via parent
    onNewMessage({ role: 'model', text: reply.text }, reply.isCrisis);
    onTyping(false);
  };

  return (
    <div className="glass rounded-[2rem] p-2 flex items-center gap-2 border-white/10 focus-within:border-emerald-500/50 transition-all relative overflow-hidden">
      {/* Listening Indicator Background */}
      {isListening && (
        <div className="absolute inset-0 bg-emerald-500/5 animate-pulse pointer-events-none" />
      )}

      <button 
        onClick={toggleListening}
        className={`p-3 rounded-2xl transition-all ${
          isListening 
            ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' 
            : 'text-emerald-400 hover:bg-white/5'
        }`}
      >
        {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
      </button>

      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        placeholder={isListening ? "Aura is listening..." : "Talk to Aura..."}
        className="flex-1 bg-transparent border-none outline-none text-slate-200 text-sm placeholder:text-slate-500 py-3"
      />

      <button
        onClick={handleSend}
        disabled={!input.trim() || isListening}
        className="p-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 disabled:hover:bg-emerald-50 text-slate-950 rounded-2xl transition-all shadow-lg shadow-emerald-900/20"
      >
        <Send className="w-4 h-4" />
      </button>
    </div>
  );
};

export default SproutChat;
