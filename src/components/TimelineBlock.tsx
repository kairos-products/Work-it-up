import React, { useState } from 'react';
import { 
  Play, 
  Check, 
  MoreVertical, 
  Trash2, 
  Edit2, 
  ArrowUp, 
  ArrowDown, 
  Plus, 
  Minus,
  CheckCircle2,
  Clock,
  Zap,
  Coffee,
  Users,
  Brain,
  Sunrise,
  Sunset
} from 'lucide-react';
import { WorkBlock, WorkBlockType } from '../types';
import { formatTime12h } from '../utils/time';

interface TimelineBlockProps {
  block: WorkBlock;
  isActive: boolean;
  isPast: boolean;
  onSelectBlock: (block: WorkBlock) => void;
  onToggleComplete: (blockId: string) => void;
  onToggleTask: (blockId: string, taskId: string) => void;
  onEditBlock: (block: WorkBlock) => void;
  onDeleteBlock: (blockId: string) => void;
  onShiftTime: (blockId: string, deltaMinutes: number) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export const TimelineBlock: React.FC<TimelineBlockProps> = ({
  block,
  isActive,
  isPast,
  onSelectBlock,
  onToggleComplete,
  onToggleTask,
  onEditBlock,
  onDeleteBlock,
  onShiftTime,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const getTypeVisuals = (type: WorkBlockType) => {
    switch (type) {
      case 'deep-work':
        return {
          icon: <Brain className="w-4 h-4 text-indigo-600" />,
          border: 'border-l-4 border-l-indigo-500',
          badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          label: 'Deep Work',
          cardBg: 'bg-white hover:bg-stone-50/80',
        };
      case 'shallow-work':
        return {
          icon: <Zap className="w-4 h-4 text-amber-600" />,
          border: 'border-l-4 border-l-amber-500',
          badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
          label: 'Shallow / Admin',
          cardBg: 'bg-white hover:bg-stone-50/80',
        };
      case 'meeting':
        return {
          icon: <Users className="w-4 h-4 text-emerald-600" />,
          border: 'border-l-4 border-l-emerald-500',
          badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          label: 'Meeting',
          cardBg: 'bg-white hover:bg-stone-50/80',
        };
      case 'break':
        return {
          icon: <Coffee className="w-4 h-4 text-teal-600" />,
          border: 'border-l-4 border-l-teal-400',
          badgeBg: 'bg-teal-50 text-teal-700 border-teal-200',
          label: 'Break & Recharge',
          cardBg: 'bg-teal-50/30 hover:bg-teal-50/60',
        };
      case 'kickoff':
        return {
          icon: <Sunrise className="w-4 h-4 text-orange-600" />,
          border: 'border-l-4 border-l-orange-500',
          badgeBg: 'bg-orange-50 text-orange-700 border-orange-200',
          label: 'Morning Kickoff',
          cardBg: 'bg-white hover:bg-stone-50/80',
        };
      case 'shutdown':
        return {
          icon: <Sunset className="w-4 h-4 text-stone-700" />,
          border: 'border-l-4 border-l-stone-600',
          badgeBg: 'bg-stone-100 text-stone-700 border-stone-300',
          label: 'Workday Shutdown',
          cardBg: 'bg-white hover:bg-stone-50/80',
        };
    }
  };

  const visuals = getTypeVisuals(block.type);

  const completedTasks = block.tasks?.filter((t) => t.completed).length || 0;
  const totalTasks = block.tasks?.length || 0;

  return (
    <div 
      className={`relative group rounded-xl border transition-all duration-200 ${visuals.border} ${visuals.cardBg} ${
        isActive 
          ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-md' 
          : block.completed 
            ? 'border-stone-200 opacity-80' 
            : 'border-stone-200/80 shadow-xs'
      }`}
    >
      <div className="p-4">
        
        {/* Top bar: Time, Type, Status & Actions */}
        <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
          
          <div className="flex items-center gap-2 flex-wrap">
            {/* Time badge */}
            <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-stone-700 bg-stone-100 px-2 py-0.5 rounded-md">
              <Clock className="w-3 h-3 text-stone-500" />
              {formatTime12h(block.startTime)} – {formatTime12h(block.endTime)}
            </span>

            {/* Duration */}
            <span className="text-xs text-stone-500 font-medium">
              {block.durationMinutes}m
            </span>

            {/* Category badge */}
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${visuals.badgeBg}`}>
              {visuals.icon}
              <span>{visuals.label}</span>
            </span>

            {/* Corporate Meeting Burn Pill */}
            {block.type === 'meeting' && (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
                <span>Burn:</span>
                <span>${Math.round((block.durationMinutes / 60) * (block.attendeesCount || 4) * (block.hourlyRateAvg || 140))}</span>
              </span>
            )}

            {/* Deflected Badge */}
            {block.isDeflectedToAsync && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                ⚡ Deflected to Async
              </span>
            )}

            {/* Compressed Badge */}
            {block.isCompressed && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                ⚡ Speed-Meeting
              </span>
            )}

            {/* Energy level badge */}
            {block.energyLevel && block.type === 'deep-work' && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800">
                High Energy
              </span>
            )}

            {/* Active Now Pill */}
            {isActive && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-500 text-stone-950 animate-pulse">
                Active Session
              </span>
            )}
          </div>

          {/* Quick Shift & Action Menu */}
          <div className="flex items-center gap-1">
            
            {/* Quick +/- 15 min duration adjust */}
            <div className="hidden sm:flex items-center bg-stone-100 rounded-md p-0.5 text-stone-600 text-[11px]">
              <button
                onClick={() => onShiftTime(block.id, -15)}
                className="px-1.5 py-0.5 hover:bg-stone-200 rounded text-stone-600"
                title="Shorten block by 15m"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="px-1 text-[10px] font-mono text-stone-400">15m</span>
              <button
                onClick={() => onShiftTime(block.id, 15)}
                className="px-1.5 py-0.5 hover:bg-stone-200 rounded text-stone-600"
                title="Extend block by 15m"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            {/* Focus / Select Button */}
            {!block.completed && (
              <button
                onClick={() => onSelectBlock(block)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-amber-500 text-stone-950 shadow-xs'
                    : 'bg-stone-900 hover:bg-stone-800 text-white'
                }`}
                title="Focus on this block"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>{isActive ? 'In Focus' : 'Focus'}</span>
              </button>
            )}

            {/* Completed toggle */}
            <button
              onClick={() => onToggleComplete(block.id)}
              className={`p-1 rounded-md transition-colors ${
                block.completed
                  ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                  : 'bg-stone-100 text-stone-400 hover:text-stone-700 hover:bg-stone-200'
              }`}
              title={block.completed ? 'Mark as incomplete' : 'Mark as completed'}
            >
              <Check className="w-3.5 h-3.5" />
            </button>

            {/* Context Menu Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowMenu((v) => !v)}
                className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                title="Block options"
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>

              {showMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-stone-200 rounded-xl shadow-lg z-20 py-1 text-xs">
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onEditBlock(block);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-stone-50 flex items-center gap-2 text-stone-700"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit Block</span>
                    </button>

                    {!isFirst && onMoveUp && (
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          onMoveUp();
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-stone-50 flex items-center gap-2 text-stone-700"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                        <span>Move Earlier</span>
                      </button>
                    )}

                    {!isLast && onMoveDown && (
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          onMoveDown();
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-stone-50 flex items-center gap-2 text-stone-700"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                        <span>Move Later</span>
                      </button>
                    )}

                    <div className="border-t border-stone-100 my-1" />

                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onDeleteBlock(block.id);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-red-50 flex items-center gap-2 text-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Block</span>
                    </button>
                  </div>
                </>
              )}
            </div>

          </div>

        </div>

        {/* Block Title & Description */}
        <div className="mb-2">
          <h3 className={`text-base font-semibold tracking-tight ${
            block.completed ? 'line-through text-stone-400' : 'text-stone-900'
          }`}>
            {block.title}
          </h3>
          {block.description && (
            <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
              {block.description}
            </p>
          )}
        </div>

        {/* Subtasks List */}
        {block.tasks && block.tasks.length > 0 && (
          <div className="mt-2.5 pt-2 border-t border-stone-100/80 space-y-1">
            <div className="flex items-center justify-between text-[11px] text-stone-400 mb-1">
              <span>Subtasks ({completedTasks}/{totalTasks})</span>
            </div>
            {block.tasks.map((task) => (
              <label
                key={task.id}
                className="flex items-start gap-2 text-xs text-stone-600 hover:text-stone-900 cursor-pointer p-0.5 rounded"
              >
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => onToggleTask(block.id, task.id)}
                  className="mt-0.5 rounded border-stone-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                />
                <span className={task.completed ? 'line-through text-stone-400' : ''}>
                  {task.title}
                </span>
              </label>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
