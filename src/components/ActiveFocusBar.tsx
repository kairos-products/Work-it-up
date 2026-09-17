import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  Plus, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Clock, 
  Maximize2, 
  Minimize2,
  ListTodo,
  Lightbulb,
  ArrowRight
} from 'lucide-react';
import { WorkBlock, SubTask } from '../types';
import { formatTime12h } from '../utils/time';
import { playFocusChime } from '../utils/audio';

interface ActiveFocusBarProps {
  activeBlock: WorkBlock | null;
  nextBlock: WorkBlock | null;
  onCompleteBlock: (blockId: string) => void;
  onToggleTask: (blockId: string, taskId: string) => void;
  onAddSubTask: (blockId: string, title: string) => void;
  onAddDistraction: (text: string) => void;
  onSelectNextBlock?: () => void;
}

export const ActiveFocusBar: React.FC<ActiveFocusBarProps> = ({
  activeBlock,
  nextBlock,
  onCompleteBlock,
  onToggleTask,
  onAddSubTask,
  onAddDistraction,
  onSelectNextBlock,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number>(
    activeBlock ? activeBlock.durationMinutes * 60 : 25 * 60
  );
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [distractionInput, setDistractionInput] = useState('');
  const [distractionFeedback, setDistractionFeedback] = useState(false);

  const prevBlockIdRef = useRef<string | null>(null);

  // Sync timer when block changes
  useEffect(() => {
    if (activeBlock && activeBlock.id !== prevBlockIdRef.current) {
      prevBlockIdRef.current = activeBlock.id;
      setSecondsLeft(activeBlock.durationMinutes * 60);
      setIsRunning(false);
    }
  }, [activeBlock]);

  // Countdown timer loop
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            // Timer completed!
            if (!isMuted) {
              playFocusChime();
            }
            setIsRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, secondsLeft, isMuted]);

  const toggleTimer = () => {
    setIsRunning((prev) => !prev);
  };

  const resetTimer = () => {
    setIsRunning(false);
    if (activeBlock) {
      setSecondsLeft(activeBlock.durationMinutes * 60);
    }
  };

  const addFiveMinutes = () => {
    setSecondsLeft((prev) => prev + 5 * 60);
  };

  const handleCompleteCurrent = () => {
    if (!activeBlock) return;
    if (!isMuted) {
      playFocusChime();
    }
    onCompleteBlock(activeBlock.id);
    setIsRunning(false);
  };

  const handleAddSubTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBlock || !newTaskTitle.trim()) return;
    onAddSubTask(activeBlock.id, newTaskTitle.trim());
    setNewTaskTitle('');
  };

  const handleDistractionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!distractionInput.trim()) return;
    onAddDistraction(distractionInput.trim());
    setDistractionInput('');
    setDistractionFeedback(true);
    setTimeout(() => setDistractionFeedback(false), 2000);
  };

  // Format MM:SS
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const totalBlockSeconds = activeBlock ? activeBlock.durationMinutes * 60 : 25 * 60;
  const progressPercent = Math.min(100, Math.max(0, ((totalBlockSeconds - secondsLeft) / totalBlockSeconds) * 100));

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'deep-work':
        return { bg: 'bg-indigo-50 border-indigo-200 text-indigo-900', badge: 'bg-indigo-600 text-white', label: 'Deep Focus' };
      case 'shallow-work':
        return { bg: 'bg-amber-50 border-amber-200 text-amber-900', badge: 'bg-amber-600 text-white', label: 'Admin / Shallow' };
      case 'meeting':
        return { bg: 'bg-emerald-50 border-emerald-200 text-emerald-900', badge: 'bg-emerald-600 text-white', label: 'Meeting' };
      case 'break':
        return { bg: 'bg-teal-50 border-teal-200 text-teal-900', badge: 'bg-teal-600 text-white', label: 'Rest & Recharge' };
      case 'kickoff':
        return { bg: 'bg-orange-50 border-orange-200 text-orange-900', badge: 'bg-orange-600 text-white', label: 'Morning Kickoff' };
      case 'shutdown':
        return { bg: 'bg-stone-100 border-stone-300 text-stone-900', badge: 'bg-stone-800 text-white', label: 'Workday Shutdown' };
      default:
        return { bg: 'bg-stone-50 border-stone-200 text-stone-900', badge: 'bg-stone-700 text-white', label: 'Work Block' };
    }
  };

  if (!activeBlock) {
    return (
      <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-sm text-center">
        <p className="text-sm font-medium text-stone-600 mb-1">
          No work block currently active or selected.
        </p>
        <p className="text-xs text-stone-400">
          Click "Start" on any timeline block below or generate today’s schedule with the AI Architect.
        </p>
      </div>
    );
  }

  const typeConfig = getTypeStyle(activeBlock.type);

  return (
    <div 
      className={`transition-all duration-300 ${
        isFullscreen 
          ? 'fixed inset-0 z-50 bg-stone-950/95 p-6 sm:p-12 flex flex-col justify-center max-w-4xl mx-auto' 
          : 'bg-white border border-stone-200/90 rounded-2xl p-5 sm:p-6 shadow-sm mb-6'
      }`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        
        {/* Left: Active Block Details & Controls */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-2 flex-wrap">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${typeConfig.badge}`}>
              {typeConfig.label}
            </span>
            <span className="text-xs font-medium text-stone-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              {formatTime12h(activeBlock.startTime)} – {formatTime12h(activeBlock.endTime)}
              <span className="text-stone-400">({activeBlock.durationMinutes}m)</span>
            </span>
            {activeBlock.completed && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                <CheckCircle className="w-3 h-3" /> Completed
              </span>
            )}
          </div>

          <h2 className={`text-xl sm:text-2xl font-bold tracking-tight mb-1 truncate ${
            isFullscreen ? 'text-white' : 'text-stone-900'
          }`}>
            {activeBlock.title}
          </h2>

          {activeBlock.description && (
            <p className={`text-xs sm:text-sm line-clamp-2 mb-3 ${
              isFullscreen ? 'text-stone-300' : 'text-stone-600'
            }`}>
              {activeBlock.description}
            </p>
          )}

          {/* Subtasks Progress Bar & Checklist */}
          {activeBlock.tasks && activeBlock.tasks.length > 0 && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-stone-500 mb-1.5 font-medium">
                <span className="flex items-center gap-1">
                  <ListTodo className="w-3.5 h-3.5" />
                  Block Checklist
                </span>
                <span>
                  {activeBlock.tasks.filter((t) => t.completed).length} of {activeBlock.tasks.length} done
                </span>
              </div>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {activeBlock.tasks.map((task) => (
                  <label 
                    key={task.id} 
                    className={`flex items-start gap-2 text-xs p-1.5 rounded cursor-pointer transition-colors ${
                      isFullscreen ? 'hover:bg-stone-900 text-stone-200' : 'hover:bg-stone-50 text-stone-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => onToggleTask(activeBlock.id, task.id)}
                      className="mt-0.5 rounded border-stone-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                    />
                    <span className={task.completed ? 'line-through text-stone-400' : ''}>
                      {task.title}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Quick Add Subtask Input */}
          <form onSubmit={handleAddSubTaskSubmit} className="mt-2.5 flex items-center gap-2">
            <input
              type="text"
              placeholder="Add actionable subtask..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className={`flex-1 text-xs px-2.5 py-1.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-amber-500/20 ${
                isFullscreen 
                  ? 'bg-stone-900 border-stone-800 text-white placeholder-stone-500' 
                  : 'bg-stone-50 border-stone-200 text-stone-800 placeholder-stone-400'
              }`}
            />
            <button
              type="submit"
              disabled={!newTaskTitle.trim()}
              className="px-2.5 py-1.5 bg-stone-200 hover:bg-stone-300 disabled:opacity-50 text-stone-800 rounded-lg text-xs font-medium transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Right: Digital Timer & Focus Controls */}
        <div className="flex flex-col items-center lg:items-end justify-center">
          
          {/* Main Large Timer Display */}
          <div className="flex items-center gap-4 mb-3">
            <div className="text-center lg:text-right">
              <div 
                className={`font-mono text-4xl sm:text-5xl font-bold tracking-tight ${
                  secondsLeft === 0 
                    ? 'text-emerald-500 animate-bounce' 
                    : isFullscreen ? 'text-amber-400' : 'text-stone-900'
                }`}
              >
                {timeFormatted}
              </div>
              <p className={`text-[11px] font-medium uppercase tracking-widest ${
                isFullscreen ? 'text-stone-400' : 'text-stone-400'
              }`}>
                {isRunning ? 'Focus Session in Progress' : 'Paused / Ready'}
              </p>
            </div>
          </div>

          {/* Timer Progress Ring / Bar */}
          <div className="w-full lg:w-64 bg-stone-100 dark:bg-stone-800 rounded-full h-2 mb-4 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            
            {/* Play/Pause */}
            <button
              id="focus-play-pause-btn"
              onClick={toggleTimer}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm ${
                isRunning
                  ? 'bg-amber-500 hover:bg-amber-600 text-stone-950'
                  : 'bg-stone-900 hover:bg-stone-800 text-white'
              }`}
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isRunning ? 'Pause' : 'Start Focus'}</span>
            </button>

            {/* +5 Min */}
            <button
              id="focus-add-5m-btn"
              onClick={addFiveMinutes}
              className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-medium transition-colors"
              title="Add 5 minutes to this block"
            >
              +5m
            </button>

            {/* Reset */}
            <button
              id="focus-reset-btn"
              onClick={resetTimer}
              className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl transition-colors"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Complete Block */}
            <button
              id="focus-complete-btn"
              onClick={handleCompleteCurrent}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
              title="Mark block as finished"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Complete</span>
            </button>

            {/* Sound Toggle */}
            <button
              id="focus-sound-btn"
              onClick={() => setIsMuted((m) => !m)}
              className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl transition-colors"
              title={isMuted ? 'Unmute finish chime' : 'Mute finish chime'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Fullscreen Toggle */}
            <button
              id="focus-fullscreen-btn"
              onClick={() => setIsFullscreen((f) => !f)}
              className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl transition-colors"
              title={isFullscreen ? 'Exit full screen' : 'Expand full screen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>

          {/* Distraction Parking Lot Quick Catch */}
          <div className="w-full mt-4 pt-3 border-t border-stone-100">
            <form onSubmit={handleDistractionSubmit} className="flex items-center gap-2">
              <div className="relative flex-1">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Park a distracting thought (don't break flow)..."
                  value={distractionInput}
                  onChange={(e) => setDistractionInput(e.target.value)}
                  className="w-full text-xs pl-8 pr-2.5 py-1.5 rounded-lg bg-stone-50 border border-stone-200 focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-800 placeholder-stone-400"
                />
              </div>
              <button
                type="submit"
                disabled={!distractionInput.trim()}
                className="px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 disabled:opacity-40 text-amber-800 border border-amber-300 rounded-lg text-xs font-medium transition-colors whitespace-nowrap"
              >
                Park It
              </button>
            </form>
            {distractionFeedback && (
              <p className="text-[11px] text-emerald-600 mt-1 font-medium">
                ✓ Parked safely in Parking Lot! Resume your focus.
              </p>
            )}
          </div>

        </div>

      </div>

      {/* Up Next Preview */}
      {nextBlock && (
        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-1.5 truncate">
            <span className="font-semibold text-stone-700">Up next:</span>
            <span className="truncate">{nextBlock.title}</span>
            <span className="text-stone-400">({formatTime12h(nextBlock.startTime)})</span>
          </div>
          {onSelectNextBlock && (
            <button
              onClick={onSelectNextBlock}
              className="text-amber-700 hover:text-amber-900 font-medium flex items-center gap-1 whitespace-nowrap"
            >
              Skip to this <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
