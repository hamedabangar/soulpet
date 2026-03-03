
import React, { useState, useEffect } from 'react';
import { CheckCircle2, Wind } from 'lucide-react';

interface GroundingQuestProps {
  onComplete: () => void;
}

const GroundingQuest: React.FC<GroundingQuestProps> = ({ onComplete }) => {
  const [breaths, setBreaths] = useState(0);
  const [phase, setPhase] = useState<'Inhale' | 'Exhale' | 'Prepare'>('Prepare');
  const totalRequired = 5;

  useEffect(() => {
    const startTimer = setTimeout(() => {
      setPhase('Inhale');
    }, 1000);
    return () => clearTimeout(startTimer);
  }, []);

  useEffect(() => {
    if (breaths >= totalRequired) {
      const timer = setTimeout(onComplete, 1500);
      return () => clearTimeout(timer);
    }

    if (phase === 'Prepare') return;

    const interval = setInterval(() => {
      setPhase(prev => {
        if (prev === 'Inhale') {
          return 'Exhale';
        } else {
          setBreaths(b => b + 1);
          return 'Inhale';
        }
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [breaths, phase, onComplete]);

  return (
    <div className="glass rounded-[2.5rem] p-8 text-center space-y-12 animate-in fade-in">
      <div className="flex justify-center items-center min-h-[320px]">
        <div className="relative w-64 h-64 flex items-center justify-center">
          {/* The Breathing Circle */}
          <div 
            className={`absolute rounded-full bg-cyan-400/20 transition-all duration-[4000ms] ease-in-out shadow-[0_0_60px_rgba(34,211,238,0.15)] ${
              phase === 'Inhale' ? 'w-full h-full opacity-60' : 'w-1/3 h-1/3 opacity-20'
            } ${phase === 'Prepare' ? 'w-1/3 h-1/3 opacity-0' : ''}`} 
          />
          
          {/* Centered Text */}
          <div className="relative z-10 flex flex-col items-center">
            <Wind className={`w-8 h-8 mb-4 transition-all duration-1000 ${phase === 'Inhale' ? 'text-cyan-400 scale-125' : 'text-slate-600 scale-100'}`} />
            <span className={`text-xl font-light tracking-[0.4em] uppercase transition-all duration-1000 ${
              breaths >= totalRequired ? 'text-emerald-400 font-medium opacity-100' : 'text-white/40'
            }`}>
              {breaths >= totalRequired ? 'Peace' : (phase === 'Prepare' ? 'Ready?' : phase)}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-bold text-slate-200 font-outfit tracking-tight">Rhythmic Breathing</h3>
        <p className="text-slate-500 text-sm max-w-[260px] mx-auto leading-relaxed">
          Sync your breath with Aura's energy. Inhale as the light expands.
        </p>
      </div>

      <div className="flex justify-center gap-3">
        {Array.from({ length: totalRequired }).map((_, i) => (
          <div 
            key={i} 
            className={`h-1.5 rounded-full transition-all duration-700 ${
              i < breaths ? 'bg-cyan-400 w-10' : 'bg-slate-800 w-4'
            }`}
          />
        ))}
      </div>

      {breaths >= totalRequired && (
        <div className="flex items-center justify-center gap-2 text-emerald-400 animate-in fade-in zoom-in">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm font-black uppercase tracking-widest">Quest Complete</span>
        </div>
      )}
    </div>
  );
};

export default GroundingQuest;
