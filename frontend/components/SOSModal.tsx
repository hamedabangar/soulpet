
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Phone, MessageSquare, Wind, ShieldAlert, CheckCircle2, Eye, Hand, Volume2, Flower2, Utensils, Mic, MicOff } from 'lucide-react';
import { CRISIS_RESOURCES } from '../constants';

interface SOSModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GROUNDING_STEPS = [
  {
    count: 5,
    label: "Things you can see",
    instruction: "Look around. Name 5 objects out loud.",
    icon: <Eye className="w-6 h-6 text-cyan-400" />,
    color: "border-cyan-500/30",
    accent: "text-cyan-400"
  },
  {
    count: 4,
    label: "Things you can touch",
    instruction: "Describe 4 textures you can feel right now.",
    icon: <Hand className="w-6 h-6 text-purple-400" />,
    color: "border-purple-500/30",
    accent: "text-purple-400"
  },
  {
    count: 3,
    label: "Things you can hear",
    instruction: "Name 3 sounds reaching your ears.",
    icon: <Volume2 className="w-6 h-6 text-amber-400" />,
    color: "border-amber-500/30",
    accent: "text-amber-400"
  },
  {
    count: 2,
    label: "Things you can smell",
    instruction: "Identify 2 scents in your environment.",
    icon: <Flower2 className="w-6 h-6 text-rose-400" />,
    color: "border-rose-500/30",
    accent: "text-rose-400"
  },
  {
    count: 1,
    label: "Thing you can taste",
    instruction: "Focus on 1 taste or take a sip of water.",
    icon: <Utensils className="w-6 h-6 text-emerald-400" />,
    color: "border-emerald-500/30",
    accent: "text-emerald-400"
  }
];

const SOSModal: React.FC<SOSModalProps> = ({ isOpen, onClose }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  
  const recognitionRef = useRef<any>(null);
  const currentStep = GROUNDING_STEPS[activeStep];

  // Use a ref for the handler to avoid stale closures in the speech recognition callback
  const handleItemFoundRef = useRef<() => void>(() => {});

  const handleItemFound = useCallback(() => {
    setItemCount(prev => {
      const nextCount = prev + 1;
      if (nextCount >= currentStep.count) {
        // Move to next step after a short delay to show completion
        setTimeout(() => {
          setActiveStep(s => {
            if (s + 1 < GROUNDING_STEPS.length) {
              setItemCount(0);
              setTranscript("");
              return s + 1;
            } else {
              setIsComplete(true);
              if (recognitionRef.current) {
                try { recognitionRef.current.stop(); } catch(e) {}
              }
              return s;
            }
          });
        }, 800);
        return currentStep.count;
      }
      return nextCount;
    });
  }, [currentStep.count]);

  // Keep the ref updated with the latest handler
  useEffect(() => {
    handleItemFoundRef.current = handleItemFound;
  }, [handleItemFound]);

  // Initialize Speech Recognition
  useEffect(() => {
    if (!isOpen) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            const text = event.results[i][0].transcript.trim();
            if (text.length > 1) {
              setTranscript(text);
              // Call the latest handler via ref
              handleItemFoundRef.current();
            }
          }
        }
      };

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => {
        setIsListening(false);
        // Restart if not complete and modal still open
        if (isOpen && !isComplete) {
          try { recognition.start(); } catch(e) {}
        }
      };
      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;

      // Start listening
      try {
        recognition.start();
      } catch (e) {
        console.error("Speech start error", e);
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null; // Prevent restart on cleanup
        try { recognitionRef.current.stop(); } catch(e) {}
      }
    };
  }, [isOpen, isComplete]);

  const resetGrounding = () => {
    setActiveStep(0);
    setItemCount(0);
    setIsComplete(false);
    setTranscript("");
    if (recognitionRef.current) {
      try { recognitionRef.current.start(); } catch(e) {}
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl">
      <div className="glass w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl border-rose-500/20 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-rose-500/10 p-6 flex justify-between items-center border-b border-rose-500/10">
          <div className="flex items-center gap-3">
            <ShieldAlert className="text-rose-500 w-6 h-6" />
            <h2 className="text-2xl font-black font-outfit text-rose-500 tracking-tight">Safe Mode</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Grounding Exercise Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                <Wind className="text-cyan-400 w-5 h-5" />
                Aura's Voice Grounding
              </h3>
              {!isComplete && (
                <div className="flex items-center gap-2">
                  {isListening && <div className="w-2 h-2 bg-rose-500 rounded-full animate-ping" />}
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Step {activeStep + 1} of 5
                  </span>
                </div>
              )}
            </div>

            {!isComplete ? (
              <div className={`bg-slate-900/50 rounded-[2rem] p-8 text-center border-2 transition-all duration-500 relative overflow-hidden ${currentStep.color}`}>
                {/* Voice Waveform Background */}
                {isListening && (
                  <div className="absolute bottom-0 left-0 w-full h-12 flex items-end justify-center gap-1 opacity-20 pointer-events-none">
                    {[...Array(15)].map((_, i) => (
                      <div 
                        key={i} 
                        className={`w-full ${currentStep.accent.replace('text-', 'bg-')} animate-pulse`} 
                        style={{ height: `${20 + Math.random() * 80}%`, animationDelay: `${i * 0.1}s` }} 
                      />
                    ))}
                  </div>
                )}

                <div className="flex justify-center mb-6">
                  <div className="p-5 bg-slate-800 rounded-2xl shadow-inner">
                    {currentStep.icon}
                  </div>
                </div>
                
                <h4 className="text-xl font-black text-white mb-2">{currentStep.label}</h4>
                <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                  {currentStep.instruction}
                </p>

                {/* Progress Slots */}
                <div className="flex flex-wrap justify-center gap-3 mb-8">
                  {Array.from({ length: currentStep.count }).map((_, i) => (
                    <button 
                      key={i}
                      onClick={() => i === itemCount && handleItemFound()}
                      className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center transition-all duration-300 ${
                        i < itemCount 
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 scale-110' 
                          : i === itemCount 
                            ? 'border-slate-600 text-slate-400 animate-pulse'
                            : 'border-slate-800 text-slate-800'
                      }`}
                    >
                      {i < itemCount ? <CheckCircle2 className="w-6 h-6" /> : i + 1}
                    </button>
                  ))}
                </div>

                {/* Transcript / Feedback */}
                <div className="min-h-[40px] flex flex-col items-center justify-center">
                  {transcript ? (
                    <p className="text-white font-medium italic animate-in fade-in slide-in-from-bottom-2">
                      "{transcript}"
                    </p>
                  ) : (
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-widest">
                      <Mic className="w-3 h-3" />
                      Speak to Aura...
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-emerald-500/10 rounded-[2rem] p-8 text-center border-2 border-emerald-500/20 animate-in zoom-in">
                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                </div>
                <h4 className="text-2xl font-black text-white mb-2">You're doing great</h4>
                <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                  You've successfully grounded yourself. Aura is proud of you. Take one more slow, deep breath.
                </p>
                <button 
                  onClick={resetGrounding}
                  className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-black uppercase tracking-widest rounded-xl transition-all"
                >
                  Restart Exercise
                </button>
              </div>
            )}
          </section>

          {/* Crisis Resources Section */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-slate-200">Immediate Support</h3>
            <div className="grid gap-3">
              {CRISIS_RESOURCES.map((resource, i) => (
                <a
                  key={i}
                  href={resource.link}
                  className="flex items-center justify-between p-5 bg-slate-900/50 hover:bg-slate-800 border border-slate-800 rounded-3xl transition-all group"
                >
                  <div className="space-y-1">
                    <p className="font-black text-slate-200 tracking-tight">{resource.name}</p>
                    <p className="text-xs text-slate-500 font-medium">{resource.contact}</p>
                  </div>
                  <div className="p-3 bg-rose-500/10 rounded-2xl group-hover:bg-rose-500/20 transition-colors">
                    {resource.link.startsWith('tel') ? (
                      <Phone className="w-5 h-5 text-rose-500" />
                    ) : (
                      <MessageSquare className="w-5 h-5 text-rose-500" />
                    )}
                  </div>
                </a>
              ))}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-900/50 border-t border-white/5 text-center">
          <p className="text-xs text-slate-500 font-medium">
            You are not alone. Aura is here, and so are these people.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SOSModal;
