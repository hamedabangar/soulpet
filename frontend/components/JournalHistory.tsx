
import React from 'react';
import { Calendar, ChevronRight, Sparkles, BrainCircuit, Clock } from 'lucide-react';
import { JournalEntry } from '../types';

interface JournalHistoryProps {
  entries: JournalEntry[];
  onSelectEntry: (entry: JournalEntry) => void;
}

const JournalHistory: React.FC<JournalHistoryProps> = ({ entries, onSelectEntry }) => {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center">
          <BrainCircuit className="text-slate-700 w-8 h-8" />
        </div>
        <p className="text-slate-500 font-medium">Your diary is empty.<br/>Start a brain dump to fill it!</p>
      </div>
    );
  }

  // Group entries by date
  const sortedEntries = [...entries].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold font-outfit text-slate-200">Past Reflections</h3>
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{entries.length} Entries</span>
      </div>

      <div className="space-y-4">
        {sortedEntries.map((entry) => (
          <button
            key={entry.id}
            onClick={() => onSelectEntry(entry)}
            className="w-full glass p-5 rounded-3xl text-left hover:bg-slate-800/50 transition-all group border-white/5"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2 text-cyan-400">
                <Calendar className="w-3.5 h-3.5" />
                <span className="text-xs font-bold">{entry.date}</span>
              </div>
              <div className="flex items-center gap-1 text-slate-500">
                <Clock className="w-3 h-3" />
                <span className="text-[10px] font-medium">
                  {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            <h4 className="text-white font-bold text-sm mb-2 line-clamp-1 group-hover:text-cyan-300 transition-colors">
              {entry.analysis.summary}
            </h4>

            <div className="flex flex-wrap gap-1.5">
              {entry.analysis.feelings.slice(0, 3).map((feeling, i) => (
                <span key={i} className="px-2 py-0.5 bg-purple-500/10 text-purple-300 rounded-full text-[9px] font-bold border border-purple-500/20">
                  {feeling}
                </span>
              ))}
              {entry.analysis.feelings.length > 3 && (
                <span className="text-[9px] text-slate-500 font-bold">+{entry.analysis.feelings.length - 3} more</span>
              )}
            </div>

            <div className="mt-4 flex items-center justify-end text-cyan-500 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
              <span className="text-[10px] font-black uppercase tracking-widest mr-1">Read More</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default JournalHistory;
