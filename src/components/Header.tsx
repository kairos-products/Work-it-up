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
  CheckCircle2
} from 'lucide-react';
import { formatDisplayDate, getTodayDateString } from '../utils/time';
import { DayStats } from '../types';

interface HeaderProps {
  currentDate: string;
  onDateChange: (newDate: string) => void;
  stats: DayStats;
  onOpenAiArchitect: () => void;
  onOpenTemplates: () => void;
  onOpenAddBlock: () => void;
  onOpenBrainDump: () => void;
  onOpenSummary: () => void;
  unresolvedDistractionCount: number;
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
  unresolvedDistractionCount,
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
    <header className="sticky top-0 z-30 bg-stone-900 text-stone-100 border-b border-stone-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Brand & Date Navigation */}
          <div className="flex items-center justify-between sm:justify-start gap-4 flex-wrap">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold shadow-inner">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-semibold tracking-tight leading-tight text-stone-50">
                  Workday Structurer
                </h1>
                <p className="text-xs text-stone-400 hidden sm:block">
                  Intentional pacing & deep focus architecture
                </p>
              </div>
            </div>

            {/* Date Scrubber */}
            <div className="flex items-center bg-stone-800/90 rounded-lg p-1 border border-stone-700/70 text-sm">
              <button 
                id="header-prev-day-btn"
                onClick={handlePrevDay} 
                className="p-1 text-stone-400 hover:text-stone-100 hover:bg-stone-700 rounded transition-colors"
                title="Previous Day"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                id="header-today-btn"
                onClick={handleToday}
                className={`px-2.5 py-0.5 rounded text-xs font-medium transition-colors ${
                  isToday 
                    ? 'bg-amber-500/20 text-amber-300 font-semibold' 
                    : 'text-stone-300 hover:text-stone-100'
                }`}
              >
                {isToday ? 'Today' : 'Jump to Today'}
              </button>

              <span className="text-xs text-stone-300 px-2 font-medium border-l border-stone-700/60">
                {formatDisplayDate(currentDate)}
              </span>

              <button 
                id="header-next-day-btn"
                onClick={handleNextDay} 
                className="p-1 text-stone-400 hover:text-stone-100 hover:bg-stone-700 rounded transition-colors"
                title="Next Day"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Metrics & Quick Action Controls */}
          <div className="flex items-center justify-between sm:justify-end gap-2.5 flex-wrap">
            
            {/* Focus Metrics Capsule */}
            <div className="hidden lg:flex items-center gap-3 bg-stone-800/70 border border-stone-700/60 rounded-xl px-3 py-1.5 text-xs text-stone-300">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
                <span>Deep Work:</span>
                <span className="font-semibold text-stone-100">
                  {deepWorkHoursDone}h / {deepWorkHoursScheduled}h
                </span>
              </div>
              <div className="h-3 w-px bg-stone-700"></div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Blocks:</span>
                <span className="font-semibold text-stone-100">
                  {stats.blocksCompleted}/{stats.totalBlocks} ({progressPct}%)
                </span>
              </div>
            </div>

            {/* Brain Dump / Parking Lot Button */}
            <button
              id="header-brain-dump-btn"
              onClick={onOpenBrainDump}
              className="relative flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-750 text-stone-200 hover:text-stone-50 border border-stone-700 rounded-lg text-xs font-medium transition-colors shadow-sm"
              title="Park stray distracting thoughts to keep focus"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Parking Lot</span>
              {unresolvedDistractionCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 text-[10px] font-bold bg-amber-500 text-stone-950 rounded-full">
                  {unresolvedDistractionCount}
                </span>
              )}
            </button>

            {/* Template Presets */}
            <button
              id="header-templates-btn"
              onClick={onOpenTemplates}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-750 text-stone-200 hover:text-stone-50 border border-stone-700 rounded-lg text-xs font-medium transition-colors shadow-sm"
            >
              <LayoutTemplate className="w-3.5 h-3.5 text-stone-300" />
              <span className="hidden sm:inline">Templates</span>
            </button>

            {/* Day Architect (AI Powered) */}
            <button
              id="header-ai-architect-btn"
              onClick={onOpenAiArchitect}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-semibold rounded-lg text-xs transition-all shadow-sm shadow-amber-500/20 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Architect</span>
            </button>

            {/* Add Custom Block */}
            <button
              id="header-add-block-btn"
              onClick={onOpenAddBlock}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-700 hover:bg-stone-600 text-stone-100 rounded-lg text-xs font-medium transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Block</span>
            </button>

            {/* Daily Summary & Shutdown */}
            <button
              id="header-summary-btn"
              onClick={onOpenSummary}
              className="p-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-stone-100 border border-stone-700 rounded-lg transition-colors"
              title="Daily Review & Shutdown"
            >
              <BarChart3 className="w-4 h-4" />
            </button>

          </div>
        </div>

        {/* Mini Daily Progress Strip */}
        <div className="mt-2.5 w-full bg-stone-800/80 rounded-full h-1.5 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 h-full transition-all duration-500 rounded-full"
            style={{ width: `${progressPct}%` }}
          />
        </div>

      </div>
    </header>
  );
};
