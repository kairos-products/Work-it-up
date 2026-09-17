import React from 'react';
import { 
  Sparkles, 
  LayoutTemplate, 
  Plus, 
  Lightbulb, 
  BarChart3, 
  ChevronLeft, 
  ChevronRight, 
  Clock,
  CheckCircle2,
  ShieldAlert,
  Users,
  Zap,
  Flame,
  Brain
} from 'lucide-react';
import { formatDisplayDate, getTodayDateString } from '../utils/time';
import { DayStats } from '../types';
import { ZeusLogo } from './ZeusLogo';
import { SoundscapePlayer } from './SoundscapePlayer';

interface HeaderProps {
  currentDate: string;
  onDateChange: (newDate: string) => void;
  stats: DayStats;
  onOpenAiArchitect: () => void;
  onOpenTemplates: () => void;
  onOpenAddBlock: () => void;
  onOpenBrainDump: () => void;
  onOpenSummary: () => void;
  onOpenThunderShield: () => void;
  onOpenEnterpriseSaaS: () => void;
  unresolvedDistractionCount: number;
  meetingBurnCost: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentDate,
  onDateChange,
  stats,
  onOpenAiArchitect,
  onOpenTemplates,
  onOpenAddBlock,
  onOpenBrainDump,
  onOpenSummary,
  onOpenThunderShield,
  onOpenEnterpriseSaaS,
  unresolvedDistractionCount,
  meetingBurnCost,
}) => {
  const isToday = currentDate === getTodayDateString();

  const handlePrevDay = () => {
    const [y, m, d] = currentDate.split('-').map(Number);
    const date = new Date(y, m - 1, d - 1);
    const prev = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    onDateChange(prev);
  };

  const handleNextDay = () => {
    const [y, m, d] = currentDate.split('-').map(Number);
    const date = new Date(y, m - 1, d + 1);
    const next = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    onDateChange(next);
  };

  const handleToday = () => {
    onDateChange(getTodayDateString());
  };

  const progressPct = stats.totalBlocks > 0 
    ? Math.round((stats.blocksCompleted / stats.totalBlocks) * 100) 
    : 0;

  const deepWorkHoursScheduled = (stats.deepWorkScheduledMinutes / 60).toFixed(1);
  const deepWorkHoursDone = (stats.deepWorkCompletedMinutes / 60).toFixed(1);

  return (
    <header className="sticky top-0 z-30 bg-stone-950 text-white border-b border-stone-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Brand & Date Navigation */}
          <div className="flex items-center justify-between sm:justify-start gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <ZeusLogo size="md" showText={true} inverted={true} />
            </div>

            {/* Date Scrubber */}
            <div className="flex items-center bg-stone-900 rounded-xl p-1 border border-stone-800 text-xs">
              <button 
                id="header-prev-day-btn"
                onClick={handlePrevDay} 
                className="p-1 text-stone-400 hover:text-white hover:bg-stone-800 rounded transition-colors"
                title="Previous Day"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <button
                id="header-today-btn"
                onClick={handleToday}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                  isToday 
                    ? 'bg-amber-500/20 text-amber-400' 
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                {isToday ? 'Today' : 'Today'}
              </button>

              <span className="text-[11px] text-stone-300 px-2 font-medium border-l border-stone-800">
                {formatDisplayDate(currentDate)}
              </span>

              <button 
                id="header-next-day-btn"
                onClick={handleNextDay} 
                className="p-1 text-stone-400 hover:text-white hover:bg-stone-800 rounded transition-colors"
                title="Next Day"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Controls & Badges */}
          <div className="flex items-center justify-between sm:justify-end gap-2 flex-wrap">
            
            {/* ThunderShield Burn Metric Capsule */}
            <button
              onClick={onOpenThunderShield}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-semibold hover:bg-amber-500/25 transition-all shadow-xs"
              title="Open ThunderShield Meeting Deflector"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-current" />
              <span className="hidden sm:inline">ThunderShield:</span>
              <span className="font-mono font-bold text-amber-200">
                ${meetingBurnCost} Burn
              </span>
            </button>

            {/* Audio Pulse Synthesizer */}
            <SoundscapePlayer compact={true} />

            {/* Deep Work Stats Capsule */}
            <div className="hidden xl:flex items-center gap-3 bg-stone-900 border border-stone-800 rounded-xl px-3 py-1.5 text-xs text-stone-300">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                <span>Deep Work:</span>
                <span className="font-semibold text-stone-100 font-mono">
                  {deepWorkHoursDone}h / {deepWorkHoursScheduled}h
                </span>
              </div>
              <div className="h-3 w-px bg-stone-800"></div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-mono text-stone-100">
                  {progressPct}%
                </span>
              </div>
            </div>

            {/* Brain Dump / Parking Lot Button */}
            <button
              id="header-brain-dump-btn"
              onClick={onOpenBrainDump}
              className="relative flex items-center gap-1.5 px-2.5 py-1.5 bg-stone-900 hover:bg-stone-850 text-stone-200 border border-stone-800 rounded-xl text-xs font-medium transition-colors"
              title="Park stray distracting thoughts"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Parking Lot</span>
              {unresolvedDistractionCount > 0 && (
                <span className="px-1.5 py-0.2 text-[9px] font-bold bg-amber-500 text-stone-950 rounded-full">
                  {unresolvedDistractionCount}
                </span>
              )}
            </button>

            {/* Enterprise Plans Button */}
            <button
              onClick={onOpenEnterpriseSaaS}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-200 rounded-xl text-xs font-semibold transition-all"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>Plans & ROI</span>
            </button>

            {/* Day Architect (AI Powered) */}
            <button
              id="header-ai-architect-btn"
              onClick={onOpenAiArchitect}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded-xl text-xs transition-all shadow-sm active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Architect</span>
            </button>

            {/* Daily Summary & Shutdown */}
            <button
              id="header-summary-btn"
              onClick={onOpenSummary}
              className="p-1.5 bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 rounded-xl transition-colors"
              title="Daily Review & Shutdown"
            >
              <BarChart3 className="w-4 h-4" />
            </button>

          </div>
        </div>

        {/* Mini Daily Progress Strip */}
        <div className="mt-2 w-full bg-stone-900 rounded-full h-1 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-amber-500 to-amber-300 h-full transition-all duration-500 rounded-full"
            style={{ width: `${progressPct}%` }}
          />
        </div>

      </div>
    </header>
  );
};
