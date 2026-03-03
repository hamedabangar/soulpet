
import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Loader2, BrainCircuit, AlertCircle, Mic, MicOff, Volume2, CheckCircle2 } from 'lucide-react';
import { analyzeBrainDump } from '../services/geminiService';
import { AIAnalysis, JournalEntry } from '../types';

interface BrainDumpProps {
  onComplete: (xp: number, entry: JournalEntry) => void;
  onCrisis: () => void;
  canUseVoice: boolean;
}

const BrainDump: React.FC<BrainDumpProps> = ({ onComplete, onCrisis, canUseVoice }) => {
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setText(prev => (prev ? prev + ' ' + finalTranscript : finalTranscript));
        }
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
      alert("Voice recognition is not supported in this browser.");
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

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setIsAnalyzing(true);
    const result = await analyzeBrainDump(text);
    
    if (result.isCrisis) {
      onCrisis();
      setIsAnalyzing(false);
      return;
    }

    setAnalysis(result);
    setIsAnalyzing(false);
  };

  const handleSave = () => {
    if (!analysis) return;
    
    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      text: text,
      analysis: analysis
    };

    onComplete(50, newEntry);
  };

  return (
    <div className="space-y-6 pb-24">
      {!analysis ? (
        <div className="glass rounded-3xl p-6 relative overflow-hidden animate-in fade-in">
          {isListening && (
            <div className="absolute top-0 left-0 w-full h-1.5 flex items-end justify-center gap-1 px-4">
              {[...Array(24)].map((_, i) => (
                <div 
                  key={i} 
                  className="w-full bg-cyan-400/60 animate-pulse" 
                  style={{ 
                    height: `${20 + Math.random() * 80}%`,
                    animationDelay: `${i * 0.05}s`,
                    animationDuration: '0.5s'
                  }} 
                />
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BrainCircuit className="text-purple-400 w-5 h-5" />
              <h3 className="text-xl font-bold font-outfit">Brain Dump</h3>
            </div>
            
            {canUseVoice ? (
              <button
                onClick={toggleListening}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl transition-all duration-300 ${
                  isListening 
                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/40 scale-105' 
                    : 'bg-slate-800 text-cyan-400 hover:bg-slate-700 border border-white/5'
                }`}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-4 h-4" />
                    <span className="text-xs font-black uppercase tracking-wider">Stop</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" />
                    <span className="text-xs font-black uppercase tracking-wider">Speak</span>
                  </>
                )}
              </button>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest border border-white/5">
                <Volume2 className="w-3 h-3" />
                Unlocks at LVL 1
              </div>
            )}
          </div>
          
          <p className="text-slate-400 text-sm mb-4 leading-relaxed">
            {isListening 
              ? "Aura is listening... speak freely." 
              : "Pour your thoughts out. Use the 'Speak' button to talk directly to Aura."}
          </p>
          
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="I'm feeling so stressed about..."
            className="w-full h-56 bg-slate-900/50 border border-slate-700/50 rounded-2xl p-5 text-slate-200 focus:ring-2 focus:ring-purple-500/50 focus:border-transparent outline-none transition-all resize-none placeholder:text-slate-600"
          />
          
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !text.trim()}
            className="w-full mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-purple-900/20"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="animate-spin w-5 h-5" />
                Organizing Thoughts...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Organize My Thoughts
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="glass rounded-3xl p-6 border-purple-500/30">
            <h4 className="text-purple-400 font-bold mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Aura's Insight
            </h4>
            <p className="text-slate-200 mb-4 leading-relaxed">{analysis.summary}</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {analysis.feelings.map((f, i) => (
                <span key={i} className="px-3 py-1 bg-purple-500/10 text-purple-300 rounded-full text-xs font-bold border border-purple-500/20">
                  {f}
                </span>
              ))}
            </div>

            {analysis.distortions.length > 0 && (
              <div className="bg-slate-900/80 rounded-2xl p-4 mb-4 border border-slate-700">
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Thought Patterns Noticed
                </h5>
                <ul className="space-y-1">
                  {analysis.distortions.map((d, i) => (
                    <li key={i} className="text-sm text-slate-300">• {d}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 mb-6">
              <p className="text-emerald-400 text-sm italic">"{analysis.encouragement}"</p>
            </div>

            <button
              onClick={handleSave}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/20"
            >
              <CheckCircle2 className="w-5 h-5" />
              Save to Diary
            </button>
            
            <button
              onClick={() => setAnalysis(null)}
              className="w-full mt-3 text-slate-500 text-xs font-bold uppercase tracking-widest hover:text-slate-300 transition-colors"
            >
              Edit Entry
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrainDump;
