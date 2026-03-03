
import React, { useState, useEffect } from 'react';
import { Timer, Zap, AlertCircle } from 'lucide-react';

interface FocusQuestProps {
  onComplete: () => void;
}

const FocusQuest: React.FC<FocusQuestProps> = ({ onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(60); // 1 minute for demo
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (timeLeft === 0 && !isFinished) {
      setIsFinished(true);
      onComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, isFinished, onComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="glass rounded-3xl p-8 text-center space-y-6 animate-in fade-in">
      <div className="flex justify-center">
        <div className={`w-32 h-32 rounded-full border-4 flex items-center justify-center transition-all duration-500 ${isActive ? 'border-amber-500 animate-pulse' : 'border-slate-700'}`}>
          <span className="text-3xl font-bold font-outfit text-white">{formatTime(timeLeft)}</span>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-bold font-outfit">Focus Quest</h3>
        <p className="text-slate-400 text-sm">
          Put your phone down or just stay on this screen for 1 minute of quiet. No distractions.
        </p>
      </div>

      {!isActive && !isFinished && (
        <button
          onClick={() => setIsActive(true)}
          className="w-full bg-amber-500 hover:bg-amber-400 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all"
        >
          <Timer className="w-5 h-5" />
          Start Focus Session
        </button>
      )}

      {isActive && !isFinished && (
        <div className="flex items-center justify-center gap-2 text-amber-400 text-sm font-medium">
          <Zap className="w-4 h-4 animate-bounce" />
          Focusing...
        </div>
      )}

      {isFinished && (
        <div className="text-emerald-400 font-bold animate-in zoom-in">
          Focus Complete! +30 XP
        </div>
      )}
    </div>
  );
};

export default FocusQuest;
