
import React from 'react';
import { ChevronLeft, Sparkles, BrainCircuit, AlertCircle, Quote } from 'lucide-react';
import { JournalEntry } from '../types';

interface JournalEntryDetailProps {
  entry: JournalEntry;
  onBack: () => void;
}

const JournalEntryDetail: React.FC<JournalEntryDetailProps> = ({ entry, onBack }) => {
  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500 pb-24">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
        Back to Diary
      </button>

      <div className="glass rounded-3xl p-6 border-cyan-500/20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-cyan-400">
            <BrainCircuit className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-widest">Reflection</span>
          </div>
          <span className="text-xs font-bold text-slate-500">{entry.date}</span>
        </div>

        <h2 className="text-2xl font-black font-outfit text-white mb-4 leading-tight">
          {entry.analysis.summary}
        </h2>

        <div className="bg-slate-900/50 rounded-2xl p-5 border border-white/5 mb-6">
          <div className="flex items-start gap-3">
            <Quote className="w-5 h-5 text-slate-700 shrink-0" />
            <p className="text-slate-300 text-sm italic leading-relaxed">
              {entry.text}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Feelings Identified</h4>
            <div className="flex flex-wrap gap-2">
              {entry.analysis.feelings.map((feeling, i) => (
                <span key={i} className="px-3 py-1 bg-purple-500/10 text-purple-300 rounded-full text-xs font-bold border border-purple-500/20">
                  {feeling}
                </span>
              ))}
            </div>
          </div>

          {entry.analysis.distortions.length > 0 && (
            <div className="bg-amber-500/5 rounded-2xl p-4 border border-amber-500/10">
              <h5 className="text-xs font-black text-amber-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5" />
                Thought Patterns
              </h5>
              <ul className="space-y-2">
                {entry.analysis.distortions.map((d, i) => (
                  <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">•</span>
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5">
            <div className="flex items-center gap-2 text-emerald-400 mb-2">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-black uppercase tracking-widest">Aura's Encouragement</span>
            </div>
            <p className="text-emerald-300 text-sm italic leading-relaxed">
              "{entry.analysis.encouragement}"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JournalEntryDetail;
