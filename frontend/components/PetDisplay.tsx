
import React from 'react';
import { Egg, Ghost, Zap, Shield, Sword, Frown } from 'lucide-react';
import { PetStage, PetStatus } from '../types';

interface PetDisplayProps {
  xp: number;
  status: PetStatus;
  message?: string;
  isTyping?: boolean;
  onPet?: () => void;
}

const PetDisplay: React.FC<PetDisplayProps> = ({ xp, status, message, isTyping, onPet }) => {
  const level = Math.floor(xp / 100) + 1;
  const nextLevelXp = level * 100;
  const currentLevelXp = (level - 1) * 100;
  const progress = ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;

  const getPetStage = () => {
    const isEmo = status === PetStatus.EMO;
    const baseClass = `transition-all duration-700 ${isEmo ? 'grayscale brightness-50' : ''}`;
    
    if (level < 2) return { 
      icon: <Egg className={`w-24 h-24 text-amber-200 ${baseClass}`} />, 
      label: 'Mystic Egg'
    };
    
    if (level < 4) return { 
      icon: <Ghost className={`w-32 h-32 text-cyan-300 ${baseClass}`} />, 
      label: 'Aura Hatchling'
    };
    
    if (level < 6) return { 
      icon: (
        <div className={`relative flex items-center justify-center ${baseClass}`}>
          <Ghost className="w-36 h-36 text-purple-300" />
          <Zap className="absolute -top-2 -right-2 w-10 h-10 text-yellow-400 animate-pulse" />
          <Zap className="absolute -bottom-2 -left-2 w-8 h-8 text-yellow-400 animate-pulse [animation-delay:0.5s]" />
        </div>
      ), 
      label: 'Volt Phantom'
    };
    
    if (level < 8) return { 
      icon: (
        <div className={`relative flex items-center justify-center ${baseClass}`}>
          <Ghost className="w-40 h-40 text-emerald-300" />
          <Shield className="absolute -right-4 top-1/2 -translate-y-1/2 w-14 h-14 text-emerald-500 drop-shadow-xl" />
        </div>
      ), 
      label: 'Aegis Spirit'
    };
    
    return { 
      icon: (
        <div className={`relative flex items-center justify-center ${baseClass}`}>
          <Ghost className="w-44 h-44 text-rose-300" />
          <Sword className="absolute -right-6 top-4 w-16 h-16 text-rose-500 rotate-45 drop-shadow-xl" />
        </div>
      ), 
      label: 'Guardian Blade'
    };
  };

  const stageInfo = getPetStage();

  return (
    <div className="flex flex-col items-center justify-end py-8 relative min-h-[460px]">
      <div className="absolute top-0 left-0 w-full flex justify-center px-6 pointer-events-none">
        {message && (
          <div className="relative z-20 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-[300px] pointer-events-auto">
            <div className="bg-white text-slate-900 px-6 py-5 rounded-[2.5rem] shadow-2xl text-sm font-bold leading-relaxed border-2 border-slate-100/50">
              {isTyping ? (
                <div className="flex gap-1.5 py-1 justify-center">
                  <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              ) : (
                <div className="flex items-start gap-2">
                  {status === PetStatus.EMO && <Frown className="w-4 h-4 text-slate-400 shrink-0 mt-1" />}
                  <span>{message}</span>
                </div>
              )}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-5 bg-white transform rotate-45 border-r-2 border-b-2 border-slate-100/50" />
            </div>
          </div>
        )}
      </div>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className={`w-80 h-82 rounded-full blur-[100px] opacity-20 animate-pulse transition-colors duration-1000 ${
          status === PetStatus.EMO ? 'bg-slate-700' :
          level < 2 ? 'bg-amber-500' : level < 4 ? 'bg-cyan-500' : level < 6 ? 'bg-purple-500' : 'bg-emerald-500'
        }`}></div>
      </div>
      
      <div className="flex flex-col items-center">
        <div 
          onClick={onPet}
          className={`relative z-10 cursor-pointer transition-all duration-500 transform hover:scale-110 active:scale-90 ${status === PetStatus.EMO ? 'animate-none opacity-80' : 'animate-bounce [animation-duration:5s]'}`}
        >
          {stageInfo.icon}
          {status !== PetStatus.EMO && (
            <>
              <div className="absolute -top-6 -right-6 w-4 h-4 bg-white/20 rounded-full animate-ping" />
              <div className="absolute top-16 -left-10 w-2 h-2 bg-white/30 rounded-full animate-ping [animation-delay:2s]" />
            </>
          )}
        </div>
        
        <div className="mt-10 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <h2 className="text-3xl font-black text-white font-outfit tracking-tight drop-shadow-sm">{stageInfo.label}</h2>
            {status === PetStatus.EMO && <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-black uppercase">Wilted</span>}
          </div>
          
          <div className="flex flex-col items-center gap-2 mt-3">
            <div className="flex items-center gap-3">
              <div className="h-2.5 w-40 bg-slate-900 rounded-full overflow-hidden border border-white/10 shadow-inner relative">
                <div 
                  className={`h-full transition-all duration-1000 ${status === PetStatus.EMO ? 'bg-slate-600' : 'bg-gradient-to-r from-cyan-400 to-purple-500'}`} 
                  style={{ width: `${progress}%` }} 
                />
              </div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">LVL {level}</p>
            </div>
            <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">
              {nextLevelXp - xp} XP to next evolution • Complete quests to grow
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetDisplay;
