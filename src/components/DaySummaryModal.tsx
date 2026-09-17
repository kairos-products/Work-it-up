import React, { useState } from 'react';
import { 
  X, 
  BarChart3, 
  CheckCircle2, 
  Brain, 
  Clock, 
  Sunset, 
  Sparkles, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { DayStats, WorkBlock } from '../types';
import { formatDuration } from '../utils/time';

interface DaySummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: DayStats;
  blocks: WorkBlock[];
  date: string;
}

export const DaySummaryModal: React.FC<DaySummaryModalProps> = ({
  isOpen,
  onClose,
  stats,
  blocks,
  date,
}) => {
  const [winNote, setWinNote] = useState('');
  const [tomorrowFocus, setTomorrowFocus] = useState('');
  const [shutdownConfirmed, setShutdownConfirmed] = useState(false);

  if (!isOpen) return null;

  const deepWorkHours = (stats.deepWorkCompletedMinutes / 60).toFixed(1);
  const totalCompletedHours = (stats.completedMinutes / 60).toFixed(1);

  const completionPct = stats.totalBlocks > 0
    ? Math.round((stats.blocksCompleted / stats.totalBlocks) * 100)
    : 0;

  const handleFinishShutdown = () => {
    setShutdownConfirmed(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-stone-200 w-full max-w-xl shadow-xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">
                Daily Review & Workday Shutdown
              </h2>
              <p className="text-xs text-stone-500">
                Acknowledge progress and close mental loops
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Key Metrics Bento */}
          <div className="grid grid-cols-3 gap-3 text-center">
            
            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
              <div className="text-2xl font-bold text-stone-900 font-mono">
                {deepWorkHours}h
              </div>
              <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mt-0.5">
                Deep Work Done
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
              <div className="text-2xl font-bold text-emerald-600 font-mono">
                {completionPct}%
              </div>
              <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mt-0.5">
                Schedule Adherence
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
              <div className="text-2xl font-bold text-amber-600 font-mono">
                {stats.distractionsCaptured}
              </div>
              <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mt-0.5">
                Thoughts Parked
              </div>
            </div>

          </div>

          {/* Cal Newport Shutdown Ritual Guidance */}
          <div className="p-4 bg-indigo-50/60 border border-indigo-200/80 rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
              <Sunset className="w-4 h-4 text-indigo-600" />
              The Clean Workday Shutdown Ritual
            </h4>
            <p className="text-xs text-indigo-900 leading-relaxed">
              Research demonstrates that leaving work tasks unfinished without a concrete plan produces the "Zeigarnik Effect"—intrusive thoughts and burnout during personal hours. Formally closing the workday restores mental freedom.
            </p>
          </div>

          {/* Prompts */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                1. What was your biggest accomplishment or meaningful progress today?
              </label>
              <input
                type="text"
                value={winNote}
                onChange={(e) => setWinNote(e.target.value)}
                placeholder="E.g., Shipped feature architecture spec, cleared blocker with client"
                className="w-full text-xs px-3 py-2 rounded-xl border border-stone-200 text-stone-800 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                2. What is tomorrow morning's #1 opening task?
              </label>
              <input
                type="text"
                value={tomorrowFocus}
                onChange={(e) => setTomorrowFocus(e.target.value)}
                placeholder="E.g., Begin coding user authentication API endpoint"
                className="w-full text-xs px-3 py-2 rounded-xl border border-stone-200 text-stone-800 focus:ring-2 focus:ring-indigo-500/20"
              />
              <p className="text-[11px] text-stone-400 mt-1">
                Having tomorrow's starting move pre-decided eliminates morning decision fatigue.
              </p>
            </div>
          </div>

          {/* Shutdown Declaration button */}
          <div className="pt-2">
            {shutdownConfirmed ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center flex items-center justify-center gap-2 text-emerald-800 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Shutdown Complete! Disconnect and enjoy your evening.</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleFinishShutdown}
                className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
              >
                <Sunset className="w-4 h-4" />
                <span>Declare Workday Complete & Shut Down</span>
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
