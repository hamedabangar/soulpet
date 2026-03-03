
import React, { useState, useEffect } from 'react';
import { Droplets, Plus, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { WaterLog } from '../../types';

interface WaterQuestProps {
  waterLog: WaterLog;
  onLogWater: (amount: number) => void;
}

const DAILY_GOAL_ML = 2500;
const CUP_SIZE_ML = 250;

const WaterQuest: React.FC<WaterQuestProps> = ({ waterLog, onLogWater }) => {
  const [timeSinceLast, setTimeSinceLast] = useState<string>('');

  useEffect(() => {
    const updateTimer = () => {
      if (waterLog.lastLogged === 0) {
        setTimeSinceLast('No water logged yet today');
        return;
      }
      const diff = Date.now() - waterLog.lastLogged;
      const mins = Math.floor(diff / 60000);
      if (mins < 60) {
        setTimeSinceLast(`${mins}m ago`);
      } else {
        const hrs = Math.floor(mins / 60);
        setTimeSinceLast(`${hrs}h ${mins % 60}m ago`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, [waterLog.lastLogged]);

  const progress = Math.min((waterLog.totalMl / DAILY_GOAL_ML) * 100, 100);
  const isGoalMet = waterLog.totalMl >= DAILY_GOAL_ML;
  const needsWater = waterLog.lastLogged === 0 || (Date.now() - waterLog.lastLogged > 3600000);

  return (
    <div className="glass rounded-[2.5rem] p-8 space-y-8 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-500/20 rounded-2xl">
            <Droplets className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-outfit text-white">Hydration Goal</h3>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">2.5L Daily Target</p>
          </div>
        </div>
        {isGoalMet && (
          <div className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/30">
            Goal Met
          </div>
        )}
      </div>

      {/* Progress Visual */}
      <div className="relative py-4">
        <div className="flex justify-between text-xs font-bold text-slate-400 mb-2">
          <span>{waterLog.totalMl}ml</span>
          <span>{DAILY_GOAL_ML}ml</span>
        </div>
        <div className="h-4 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5 shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-cyan-600 to-blue-400 transition-all duration-1000 ease-out relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20" />
          </div>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-900/50 rounded-3xl p-4 border border-white/5">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <Clock className="w-3 h-3" />
            <span className="text-[10px] font-black uppercase tracking-widest">Last Drink</span>
          </div>
          <p className={`text-sm font-bold ${needsWater ? 'text-amber-400' : 'text-white'}`}>
            {timeSinceLast}
          </p>
        </div>
        <div className="bg-slate-900/50 rounded-3xl p-4 border border-white/5">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <Droplets className="w-3 h-3" />
            <span className="text-[10px] font-black uppercase tracking-widest">Remaining</span>
          </div>
          <p className="text-sm font-bold text-white">
            {Math.max(0, DAILY_GOAL_ML - waterLog.totalMl)}ml
          </p>
        </div>
      </div>

      {/* Action */}
      <div className="space-y-4">
        {needsWater && !isGoalMet && (
          <div className="flex items-center gap-2 text-amber-400 bg-amber-400/10 p-3 rounded-2xl border border-amber-400/20 animate-pulse">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p className="text-[10px] font-bold uppercase tracking-wide">Time for your hourly cup!</p>
          </div>
        )}

        <button
          onClick={() => onLogWater(CUP_SIZE_ML)}
          className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black py-5 rounded-[2rem] flex items-center justify-center gap-3 transition-all shadow-lg shadow-cyan-900/20 group active:scale-95"
        >
          <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform" />
          Log 1 Cup (250ml)
        </button>
      </div>

      <p className="text-center text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">
        Drinking water helps Aura stay energized!
      </p>
    </div>
  );
};

export default WaterQuest;
