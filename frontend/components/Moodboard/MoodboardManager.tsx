
import React, { useState } from 'react';
import { Plus, ChevronLeft, Calendar, Trash2, Eye } from 'lucide-react';
import { Moodboard } from '../../types';
import MoodboardCreator from './MoodboardCreator';

interface MoodboardManagerProps {
  moodboards: Moodboard[];
  onSave: (moodboard: Moodboard) => void;
  onBack: () => void;
}

const MoodboardManager: React.FC<MoodboardManagerProps> = ({ moodboards, onSave, onBack }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [viewingMoodboard, setViewingMoodboard] = useState<Moodboard | null>(null);

  if (isCreating) {
    return (
      <MoodboardCreator 
        onSave={(mb) => {
          onSave(mb);
          setIsCreating(false);
        }} 
        onCancel={() => setIsCreating(false)} 
      />
    );
  }

  if (viewingMoodboard) {
    return (
      <div className="space-y-6 animate-in fade-in">
        <button onClick={() => setViewingMoodboard(null)} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <ChevronLeft className="w-5 h-5" /> Back to Moodboards
        </button>
        <div className="glass rounded-[2.5rem] p-6 space-y-6">
          <h2 className="text-2xl font-black font-outfit text-white">{viewingMoodboard.name}</h2>
          <div className="grid grid-cols-2 gap-3">
            {viewingMoodboard.images.map((img, i) => (
              <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-white/10">
                <img src={img} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <ChevronLeft className="w-5 h-5" /> Back
        </button>
        <button 
          onClick={() => setIsCreating(true)}
          className="p-3 bg-rose-500 text-white rounded-2xl shadow-lg shadow-rose-900/20 hover:scale-105 transition-transform"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <h2 className="text-2xl font-black font-outfit text-white">My Moodboards</h2>

      {moodboards.length === 0 ? (
        <div className="glass rounded-[2.5rem] p-12 text-center space-y-4 border-dashed border-2 border-white/5">
          <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto">
            <Plus className="text-slate-700 w-8 h-8" />
          </div>
          <p className="text-slate-500 font-medium">No moodboards yet.<br/>Create one to visualize your vibe!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {moodboards.map((mb) => (
            <button
              key={mb.id}
              onClick={() => setViewingMoodboard(mb)}
              className="glass p-5 rounded-3xl text-left hover:bg-slate-800/50 transition-all group border-white/5 flex items-center gap-4"
            >
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-900 shrink-0 border border-white/10">
                {mb.images[0] ? (
                  <img src={mb.images[0]} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-700">?</div>
                )}
              </div>
              <div className="flex-1">
                <h4 className="text-white font-bold text-base mb-1">{mb.name}</h4>
                <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                  <Calendar className="w-3 h-3" />
                  {new Date(mb.timestamp).toLocaleDateString()}
                </div>
              </div>
              <Eye className="text-slate-600 group-hover:text-rose-400 transition-colors w-5 h-5" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MoodboardManager;
