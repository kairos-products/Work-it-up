import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Plus, 
  Sparkles, 
  LayoutTemplate, 
  Filter, 
  Clock, 
  CheckCircle2, 
  Calendar, 
  Lightbulb, 
  RotateCcw,
  ArrowDownUp,
  Brain,
  Coffee,
  Info
} from 'lucide-react';
import { Header } from './components/Header';
import { ActiveFocusBar } from './components/ActiveFocusBar';
import { TimelineBlock } from './components/TimelineBlock';
import { AiDayArchitectModal } from './components/AiDayArchitectModal';
import { TemplateModal } from './components/TemplateModal';
import { BlockEditModal } from './components/BlockEditModal';
import { BrainDumpDrawer } from './components/BrainDumpDrawer';
import { DaySummaryModal } from './components/DaySummaryModal';
import { DAY_TEMPLATES } from './data/templates';
import { WorkBlock, DistractionNote, DayStats, WorkBlockType } from './types';
import { 
  getTodayDateString, 
  getCurrentTimeHHMM, 
  timeToMinutes, 
  minutesToTime,
  formatTime12h 
} from './utils/time';

const STORAGE_KEY_SCHEDULES = 'workday_structurer_schedules_v2';
const STORAGE_KEY_NOTES = 'workday_structurer_notes_v2';

export default function App() {
  const [currentDate, setCurrentDate] = useState<string>(getTodayDateString());
  const [currentTime, setCurrentTime] = useState<string>(getCurrentTimeHHMM());
  const [scheduleName, setScheduleName] = useState<string>('Balanced Flow Schedule');
  const [productivityTip, setProductivityTip] = useState<string>(
    'Protect your morning deep work block by silencing notifications and batching emails into the afternoon.'
  );

  // Schedules by date
  const [schedulesByDate, setSchedulesByDate] = useState<Record<string, WorkBlock[]>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SCHEDULES);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse saved schedules', e);
    }
    // Default initial schedule for today from Balanced template
    const initialToday = DAY_TEMPLATES[0].blocks.map((b, i) => ({
      ...b,
      id: `init-${i}`,
      completed: false,
      tasks: (b.tasks || []).map((t, ti) => ({ ...t, id: `itask-${i}-${ti}`, completed: false })),
    }));
    return { [getTodayDateString()]: initialToday };
  });

  // Distraction Notes (Parking Lot)
  const [distractionNotes, setDistractionNotes] = useState<DistractionNote[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_NOTES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse notes', e);
    }
    return [
      {
        id: 'note-welcome',
        text: 'Review project specification feedback from design team',
        timestamp: '09:15 AM',
        resolved: false,
      },
    ];
  });

  // Active manually focused block id (or null to auto-track)
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  // Modals state
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<WorkBlock | null>(null);
  const [isBrainDumpOpen, setIsBrainDumpOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');

  // Persist schedules
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SCHEDULES, JSON.stringify(schedulesByDate));
    } catch (e) {
      console.error('Failed to persist schedules', e);
    }
  }, [schedulesByDate]);

  // Persist notes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(distractionNotes));
    } catch (e) {
      console.error('Failed to persist notes', e);
    }
  }, [distractionNotes]);

  // Update real-time clock every 10 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getCurrentTimeHHMM());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Blocks for current date
  const currentBlocks: WorkBlock[] = useMemo(() => {
    const blocks = schedulesByDate[currentDate];
    if (blocks && blocks.length > 0) return blocks;

    // Fallback: load default template for this date
    const fallback = DAY_TEMPLATES[0].blocks.map((b, i) => ({
      ...b,
      id: `date-${currentDate}-${i}`,
      completed: false,
      tasks: (b.tasks || []).map((t, ti) => ({ ...t, id: `dtask-${i}-${ti}`, completed: false })),
    }));
    return fallback;
  }, [schedulesByDate, currentDate]);

  // Determine current active block (based on manual selection or current clock time)
  const currentMinutes = timeToMinutes(currentTime);
  
  const autoActiveBlock = useMemo(() => {
    // 1. Find block where current time falls between start and end
    const liveBlock = currentBlocks.find((b) => {
      const s = timeToMinutes(b.startTime);
      const e = timeToMinutes(b.endTime);
      return currentMinutes >= s && currentMinutes < e;
    });
    if (liveBlock) return liveBlock;

    // 2. Otherwise find first uncompleted block
    const uncompleted = currentBlocks.find((b) => !b.completed);
    if (uncompleted) return uncompleted;

    return currentBlocks[0] || null;
  }, [currentBlocks, currentMinutes]);

  const activeBlock = useMemo(() => {
    if (selectedBlockId) {
      const found = currentBlocks.find((b) => b.id === selectedBlockId);
      if (found) return found;
    }
    return autoActiveBlock;
  }, [selectedBlockId, currentBlocks, autoActiveBlock]);

  // Determine the block following the active one
  const nextBlock = useMemo(() => {
    if (!activeBlock) return null;
    const currentIndex = currentBlocks.findIndex((b) => b.id === activeBlock.id);
    if (currentIndex >= 0 && currentIndex < currentBlocks.length - 1) {
      return currentBlocks[currentIndex + 1];
    }
    return null;
  }, [activeBlock, currentBlocks]);

  // Compute statistics
  const stats: DayStats = useMemo(() => {
    let totalScheduledMinutes = 0;
    let completedMinutes = 0;
    let deepWorkScheduledMinutes = 0;
    let deepWorkCompletedMinutes = 0;
    let blocksCompleted = 0;

    currentBlocks.forEach((b) => {
      totalScheduledMinutes += b.durationMinutes;
      if (b.type === 'deep-work') {
        deepWorkScheduledMinutes += b.durationMinutes;
      }
      if (b.completed) {
        completedMinutes += b.durationMinutes;
        blocksCompleted++;
        if (b.type === 'deep-work') {
          deepWorkCompletedMinutes += b.durationMinutes;
        }
      }
    });

    return {
      totalScheduledMinutes,
      completedMinutes,
      deepWorkScheduledMinutes,
      deepWorkCompletedMinutes,
      blocksCompleted,
      totalBlocks: currentBlocks.length,
      distractionsCaptured: distractionNotes.length,
    };
  }, [currentBlocks, distractionNotes]);

  // Update current date's blocks
  const updateCurrentDateBlocks = useCallback((newBlocks: WorkBlock[]) => {
    // Sort by startTime
    const sorted = [...newBlocks].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
    setSchedulesByDate((prev) => ({
      ...prev,
      [currentDate]: sorted,
    }));
  }, [currentDate]);

  // Handlers for Block interactions
  const handleToggleComplete = (blockId: string) => {
    const updated = currentBlocks.map((b) => {
      if (b.id === blockId) {
        const nextCompleted = !b.completed;
        return {
          ...b,
          completed: nextCompleted,
          // If marking completed, mark all subtasks completed too
          tasks: nextCompleted
            ? b.tasks.map((t) => ({ ...t, completed: true }))
            : b.tasks,
        };
      }
      return b;
    });
    updateCurrentDateBlocks(updated);
  };

  const handleToggleTask = (blockId: string, taskId: string) => {
    const updated = currentBlocks.map((b) => {
      if (b.id === blockId) {
        const updatedTasks = b.tasks.map((t) =>
          t.id === taskId ? { ...t, completed: !t.completed } : t
        );
        const allDone = updatedTasks.length > 0 && updatedTasks.every((t) => t.completed);
        return {
          ...b,
          tasks: updatedTasks,
          completed: allDone ? true : b.completed,
        };
      }
      return b;
    });
    updateCurrentDateBlocks(updated);
  };

  const handleAddSubTask = (blockId: string, title: string) => {
    const updated = currentBlocks.map((b) => {
      if (b.id === blockId) {
        return {
          ...b,
          tasks: [
            ...(b.tasks || []),
            { id: `task-${Date.now()}-${Math.random()}`, title, completed: false },
          ],
        };
      }
      return b;
    });
    updateCurrentDateBlocks(updated);
  };

  const handleShiftTime = (blockId: string, deltaMinutes: number) => {
    const updated = currentBlocks.map((b) => {
      if (b.id === blockId) {
        const startM = timeToMinutes(b.startTime);
        const endM = timeToMinutes(b.endTime);
        const newDuration = Math.max(10, (endM - startM) + deltaMinutes);
        return {
          ...b,
          durationMinutes: newDuration,
          endTime: minutesToTime(startM + newDuration),
        };
      }
      return b;
    });
    updateCurrentDateBlocks(updated);
  };

  const handleDeleteBlock = (blockId: string) => {
    const updated = currentBlocks.filter((b) => b.id !== blockId);
    updateCurrentDateBlocks(updated);
    if (selectedBlockId === blockId) {
      setSelectedBlockId(null);
    }
  };

  const handleSaveBlock = (blockData: Partial<WorkBlock>) => {
    if (editingBlock) {
      // Edit existing
      const updated = currentBlocks.map((b) =>
        b.id === editingBlock.id ? ({ ...b, ...blockData } as WorkBlock) : b
      );
      updateCurrentDateBlocks(updated);
    } else {
      // Add new block
      const newBlock: WorkBlock = {
        id: `blk-${Date.now()}`,
        title: blockData.title || 'New Work Block',
        type: (blockData.type || 'deep-work') as WorkBlockType,
        startTime: blockData.startTime || '09:00',
        endTime: blockData.endTime || '10:00',
        durationMinutes: blockData.durationMinutes || 60,
        description: blockData.description || '',
        energyLevel: blockData.energyLevel || 'medium',
        tasks: blockData.tasks || [],
        completed: false,
      };
      updateCurrentDateBlocks([...currentBlocks, newBlock]);
    }
    setEditingBlock(null);
  };

  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= currentBlocks.length) return;

    const copy = [...currentBlocks];
    // Swap positions
    const temp = copy[index];
    copy[index] = copy[newIdx];
    copy[newIdx] = temp;

    // Recalculate start and end times sequentially so schedule stays coherent
    let currentStartMin = timeToMinutes(copy[0].startTime);
    const reTimed = copy.map((block) => {
      const dur = block.durationMinutes;
      const start = currentStartMin;
      const end = start + dur;
      currentStartMin = end;
      return {
        ...block,
        startTime: minutesToTime(start),
        endTime: minutesToTime(end),
      };
    });

    updateCurrentDateBlocks(reTimed);
  };

  // Shift whole schedule forward/backward by 15 min
  const handleShiftEntireSchedule = (deltaMinutes: number) => {
    const shifted = currentBlocks.map((b) => {
      const s = Math.max(0, timeToMinutes(b.startTime) + deltaMinutes);
      const e = Math.max(0, timeToMinutes(b.endTime) + deltaMinutes);
      return {
        ...b,
        startTime: minutesToTime(s),
        endTime: minutesToTime(e),
      };
    });
    updateCurrentDateBlocks(shifted);
  };

  // Distraction Notes Handlers
  const handleAddDistraction = (text: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setDistractionNotes([
      {
        id: `dist-${Date.now()}`,
        text,
        timestamp: timeStr,
        resolved: false,
      },
      ...distractionNotes,
    ]);
  };

  const handleToggleResolveDistraction = (id: string) => {
    setDistractionNotes(
      distractionNotes.map((n) => (n.id === id ? { ...n, resolved: !n.resolved } : n))
    );
  };

  const handleDeleteDistraction = (id: string) => {
    setDistractionNotes(distractionNotes.filter((n) => n.id !== id));
  };

  const handleClearResolvedDistractions = () => {
    setDistractionNotes(distractionNotes.filter((n) => !n.resolved));
  };

  // Filtered blocks for timeline
  const displayedBlocks = useMemo(() => {
    if (filterType === 'deep') {
      return currentBlocks.filter((b) => b.type === 'deep-work');
    }
    if (filterType === 'uncompleted') {
      return currentBlocks.filter((b) => !b.completed);
    }
    return currentBlocks;
  }, [currentBlocks, filterType]);

  const unresolvedDistractions = distractionNotes.filter((n) => !n.resolved).length;

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 selection:bg-amber-100">
      
      {/* Top Application Header */}
      <Header
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        stats={stats}
        onOpenAiArchitect={() => setIsAiModalOpen(true)}
        onOpenTemplates={() => setIsTemplateModalOpen(true)}
        onOpenAddBlock={() => {
          setEditingBlock(null);
          setIsEditModalOpen(true);
        }}
        onOpenBrainDump={() => setIsBrainDumpOpen(true)}
        onOpenSummary={() => setIsSummaryOpen(true)}
        unresolvedDistractionCount={unresolvedDistractions}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* Active Focus Console Bar */}
        <ActiveFocusBar
          activeBlock={activeBlock}
          nextBlock={nextBlock}
          onCompleteBlock={handleToggleComplete}
          onToggleTask={handleToggleTask}
          onAddSubTask={handleAddSubTask}
          onAddDistraction={handleAddDistraction}
          onSelectNextBlock={() => {
            if (nextBlock) setSelectedBlockId(nextBlock.id);
          }}
        />

        {/* Schedule Strategy & Pacing Banner */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-stone-900">
                  {scheduleName}
                </h3>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
                  {currentBlocks.length} Blocks • {(stats.totalScheduledMinutes / 60).toFixed(1)}h Total
                </span>
              </div>
              <p className="text-xs text-stone-600 mt-1 max-w-3xl leading-relaxed">
                {productivityTip}
              </p>
            </div>
          </div>

          {/* Quick Schedule Shifts */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <div className="text-[11px] font-medium text-stone-500 flex items-center gap-1 mr-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Shift Day:</span>
            </div>
            <button
              onClick={() => handleShiftEntireSchedule(-15)}
              className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-semibold transition-colors"
              title="Shift all blocks earlier by 15 mins"
            >
              -15m
            </button>
            <button
              onClick={() => handleShiftEntireSchedule(15)}
              className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-semibold transition-colors"
              title="Shift all blocks later by 15 mins (running late)"
            >
              +15m
            </button>
          </div>
        </div>

        {/* Timeline Header & Filter Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div>
            <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <span>Daily Timeline</span>
              <span className="text-xs font-normal text-stone-400">
                (Current Time: {currentTime})
              </span>
            </h2>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-1.5 bg-stone-200/70 p-1 rounded-xl text-xs font-medium text-stone-600">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterType === 'all' 
                  ? 'bg-white text-stone-900 font-bold shadow-xs' 
                  : 'hover:text-stone-900'
              }`}
            >
              All Blocks ({currentBlocks.length})
            </button>
            <button
              onClick={() => setFilterType('deep')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterType === 'deep' 
                  ? 'bg-white text-indigo-700 font-bold shadow-xs' 
                  : 'hover:text-stone-900'
              }`}
            >
              Deep Work ({currentBlocks.filter((b) => b.type === 'deep-work').length})
            </button>
            <button
              onClick={() => setFilterType('uncompleted')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterType === 'uncompleted' 
                  ? 'bg-white text-amber-700 font-bold shadow-xs' 
                  : 'hover:text-stone-900'
              }`}
            >
              Uncompleted ({currentBlocks.filter((b) => !b.completed).length})
            </button>
          </div>
        </div>

        {/* Vertical Timeline Container */}
        <div className="relative pl-6 sm:pl-8 border-l-2 border-stone-200 space-y-4 my-4">
          
          {/* Real-Time "NOW" Indicator Scrubber */}
          <div 
            className="absolute left-0 -ml-[5px] w-2.5 h-2.5 rounded-full bg-amber-500 ring-4 ring-amber-500/20 z-10 transition-all"
            style={{
              top: '40px',
            }}
          />

          {displayedBlocks.length === 0 ? (
            <div className="bg-white border border-stone-200 rounded-2xl p-8 text-center text-stone-500 text-sm">
              No blocks match the selected filter.
            </div>
          ) : (
            displayedBlocks.map((block, index) => {
              const isActive = activeBlock?.id === block.id;
              const isPast = timeToMinutes(block.endTime) < currentMinutes;

              return (
                <TimelineBlock
                  key={block.id}
                  block={block}
                  isActive={isActive}
                  isPast={isPast}
                  onSelectBlock={(b) => setSelectedBlockId(b.id)}
                  onToggleComplete={handleToggleComplete}
                  onToggleTask={handleToggleTask}
                  onEditBlock={(b) => {
                    setEditingBlock(b);
                    setIsEditModalOpen(true);
                  }}
                  onDeleteBlock={handleDeleteBlock}
                  onShiftTime={handleShiftTime}
                  onMoveUp={() => handleMoveBlock(index, 'up')}
                  onMoveDown={() => handleMoveBlock(index, 'down')}
                  isFirst={index === 0}
                  isLast={index === displayedBlocks.length - 1}
                />
              );
            })
          )}

          {/* End of Day Marker */}
          <div className="pt-2 flex items-center gap-2 text-xs text-stone-400 font-medium">
            <div className="w-2 h-2 rounded-full bg-stone-300 -ml-[21px] sm:-ml-[25px]" />
            <span>Workday Finish & Evening Disconnect</span>
          </div>

        </div>

      </main>

      {/* Floating Quick Action Footer */}
      <footer className="border-t border-stone-200 bg-white/80 backdrop-blur-xs py-3 px-4 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Workday Structurer • Built for deep work and human cognitive pacing</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsTemplateModalOpen(true)}
              className="text-amber-700 hover:text-amber-900 font-medium"
            >
              Browse Blueprints
            </button>
            <span>•</span>
            <button
              onClick={() => setIsSummaryOpen(true)}
              className="text-stone-600 hover:text-stone-900 font-medium"
            >
              Daily Shutdown Review
            </button>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <AiDayArchitectModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onApplySchedule={(blocks, name, tip) => {
          updateCurrentDateBlocks(blocks);
          if (name) setScheduleName(name);
          if (tip) setProductivityTip(tip);
          if (blocks.length > 0) {
            setSelectedBlockId(blocks[0].id);
          }
        }}
        currentBlocks={currentBlocks}
        defaultStartTime={currentBlocks[0]?.startTime || '09:00'}
        defaultEndTime={currentBlocks[currentBlocks.length - 1]?.endTime || '17:30'}
      />

      <TemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onApplyTemplate={(blocks, name) => {
          updateCurrentDateBlocks(blocks);
          setScheduleName(name);
          if (blocks.length > 0) {
            setSelectedBlockId(blocks[0].id);
          }
        }}
      />

      <BlockEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingBlock(null);
        }}
        onSave={handleSaveBlock}
        initialBlock={editingBlock}
      />

      <BrainDumpDrawer
        isOpen={isBrainDumpOpen}
        onClose={() => setIsBrainDumpOpen(false)}
        notes={distractionNotes}
        onAddNote={handleAddDistraction}
        onToggleResolve={handleToggleResolveDistraction}
        onDeleteNote={handleDeleteDistraction}
        onClearResolved={handleClearResolvedDistractions}
      />

      <DaySummaryModal
        isOpen={isSummaryOpen}
        onClose={() => setIsSummaryOpen(false)}
        stats={stats}
        blocks={currentBlocks}
        date={currentDate}
      />

    </div>
  );
}
