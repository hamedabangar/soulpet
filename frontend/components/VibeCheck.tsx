
import React from 'react';
import { Mood, UserState } from '../types';
import { MOOD_CONFIG } from '../constants';

interface VibeCheckProps {
  onMoodSelect: (mood: Mood) => void;
  currentMood?: Mood;
}

const VibeCheck: React.FC<VibeCheckProps> = ({ onMoodSelect, currentMood }) => {
  return (
    <div className="glass rounded-3xl p-6 w-full max-w-md mx-auto">
      <h3 className="text-lg font-semibold mb-4 text-center text-slate-200">How's your vibe right now?</h3>
      <div className="grid grid-cols-5 gap-3">
        {(Object.keys(MOOD_CONFIG) as Mood[]).map((mood) => {
          const config = MOOD_CONFIG[mood];
          const isSelected = currentMood === mood;
          
          return (
            <button
              key={mood}
              onClick={() => onMoodSelect(mood)}
              className={`flex flex-col items-center p-3 rounded-2xl transition-all duration-300 ${
                isSelected 
                  ? `${config.color} scale-110 shadow-lg` 
                  : 'bg-slate-800/50 hover:bg-slate-700'
              }`}
            >
              <span className="text-2xl mb-1">{config.emoji}</span>
              <span className={`text-[10px] font-medium ${isSelected ? 'text-slate-900' : 'text-slate-400'}`}>
                {config.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default VibeCheck;
