
import React, { useState } from 'react';
import { Heart, Send } from 'lucide-react';

interface GratitudeQuestProps {
  onComplete: () => void;
}

const GratitudeQuest: React.FC<GratitudeQuestProps> = ({ onComplete }) => {
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (text.trim().length < 5) return;
    setSubmitted(true);
    setTimeout(onComplete, 2000);
  };

  return (
    <div className="glass rounded-3xl p-8 space-y-6 animate-in fade-in">
      <div className="flex items-center gap-3 text-rose-400">
        <Heart className="w-6 h-6 fill-current" />
        <h3 className="text-xl font-bold font-outfit">Gratitude Quest</h3>
      </div>

      {!submitted ? (
        <>
          <p className="text-slate-400 text-sm">
            What's one small thing that went okay today? Even if it was just a good cup of coffee.
          </p>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Today, I'm grateful for..."
            className="w-full h-32 bg-slate-900/50 border border-slate-700 rounded-2xl p-4 text-slate-200 focus:ring-2 focus:ring-rose-500 outline-none transition-all resize-none"
          />
          <button
            onClick={handleSubmit}
            disabled={text.trim().length < 5}
            className="w-full bg-rose-500 hover:bg-rose-400 disabled:opacity-50 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all"
          >
            <Send className="w-5 h-5" />
            Share Gratitude
          </button>
        </>
      ) : (
        <div className="text-center py-8 space-y-4 animate-in zoom-in">
          <div className="w-20 h-20 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto">
            <Heart className="w-10 h-10 text-rose-500 fill-current" />
          </div>
          <p className="text-rose-300 font-medium italic">"That's a beautiful thought."</p>
          <p className="text-emerald-400 font-bold">+15 XP Earned</p>
        </div>
      )}
    </div>
  );
};

export default GratitudeQuest;
