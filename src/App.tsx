import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Plus, 
  Sparkles, 
  LayoutTemplate, 
  Clock, 
  CheckCircle2, 
  Calendar, 
  Lightbulb, 
  Brain,
  Zap,
  Shield,
  Users,
  Flame,
  Layers,
  BarChart3,
  Waves,
  ArrowRight
} from 'lucide-react';
import { Header } from './components/Header';
import { ActiveFocusBar } from './components/ActiveFocusBar';
import { TimelineBlock } from './components/TimelineBlock';
import { AiDayArchitectModal } from './components/AiDayArchitectModal';
import { TemplateModal } from './components/TemplateModal';
import { BlockEditModal } from './components/BlockEditModal';
import { BrainDumpDrawer } from './components/BrainDumpDrawer';
import { DaySummaryModal } from './components/DaySummaryModal';
import { ThunderShieldModal } from './components/ThunderShieldModal';
import { EnterpriseSaaSModal } from './components/EnterpriseSaaSModal';
import { OlympusTeamRadar } from './components/OlympusTeamRadar';
import { CircadianBandwidthRadar } from './components/CircadianBandwidthRadar';
import { SoundscapePlayer } from './components/SoundscapePlayer';
import { DAY_TEMPLATES } from './data/templates';
import { WorkBlock, DistractionNote, DayStats, WorkBlockType, Chronotype } from './types';
import { 
  getTodayDateString, 
  getCurrentTimeHHMM, 
  timeToMinutes, 
  minutesToTime,
  formatTime12h 
} from './utils/time';

const STORAGE_KEY_SCHEDULES = 'zeus_workforce_schedules_v3';
const STORAGE_KEY_NOTES = 'zeus_workforce_notes_v3';
const STORAGE_KEY_CHRONO = 'zeus_workforce_chronotype_v3';

export default function App() {
  const [currentDate, setCurrentDate] = useState<string>(getTodayDateString());
  const [currentTime, setCurrentTime] = useState<string>(getCurrentTimeHHMM());
  const [scheduleName, setScheduleName] = useState<string>('ZEUS Corporate Executive Command');
  const [productivityTip, setProductivityTip] = useState<string>(
    'Protect your 09:00 - 11:30 AM circadian zenith for pure architecture and strategic execution. Deflect low-ROI syncs to async.'
  );

  // Active view tab (Timeline, ThunderShield, Circadian, Team Radar, Enterprise SaaS)
  const [activeTab, setActiveTab] = useState<'timeline' | 'shield' | 'circadian' | 'radar' | 'saas'>('timeline');

  // Chronotype state
  const [chronotype, setChronotype] = useState<Chronotype>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CHRONO);
      if (saved === 'lion' || saved === 'bear' || saved === 'wolf') return saved;
    } catch (e) {}
    return 'bear';
  });

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
    // Default initial schedule for today from ZEUS template
    const initialToday = DAY_TEMPLATES[0].blocks.map((b, i) => ({
      ...b,
      id: `zeus-init-${i}`,
      completed: false,
      tasks: (b.tasks || []).map((t, ti) => ({ ...t, id: `ztask-${i}-${ti}`, completed: false })),
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
        id: 'note-welcome-1',
        text: 'Review board slide deck feedback from Elena (VP Strategy)',
        timestamp: '09:15 AM',
        resolved: false,
      },
      {
        id: 'note-welcome-2',
        text: 'Evaluate vendor pricing for enterprise single sign-on upgrade',
        timestamp: '11:40 AM',
        resolved: false,
      }
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
  const [isThunderShieldOpen, setIsThunderShieldOpen] = useState(false);
  const [isEnterpriseSaaSOpen, setIsEnterpriseSaaSOpen] = useState(false);
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

  // Persist chronotype
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CHRONO, chronotype);
    } catch (e) {}
  }, [chronotype]);

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

  // Meeting burn calculation
  const meetingBurnCost = useMemo(() => {
    return currentBlocks
      .filter((b) => b.type === 'meeting')
      .reduce((acc, m) => {
        const attendees = m.attendeesCount || 4;
        const rate = m.hourlyRateAvg || 140;
        return acc + Math.round((m.durationMinutes / 60) * attendees * rate);
      }, 0);
  }, [currentBlocks]);

  // Compute statistics
  const stats: DayStats = useMemo(() => {
    let totalScheduledMinutes = 0;
    let completedMinutes = 0;
    let deepWorkScheduledMinutes = 0;
    let deepWorkCompletedMinutes = 0;
    let blocksCompleted = 0;
    let totalMeetingMinutes = 0;

    currentBlocks.forEach((b) => {
      totalScheduledMinutes += b.durationMinutes;
      if (b.type === 'deep-work') {
        deepWorkScheduledMinutes += b.durationMinutes;
      }
      if (b.type === 'meeting') {
        totalMeetingMinutes += b.durationMinutes;
      }
      if (b.completed) {
        completedMinutes += b.durationMinutes;
        blocksCompleted++;
        if (b.type === 'deep-work') {
          deepWorkCompletedMinutes += b.durationMinutes;
        }
      }
    });

    const meetingCount = currentBlocks.filter((b) => b.type === 'meeting').length;
    const fragmentationScore = Math.min(100, Math.round((meetingCount * 18) + (totalMeetingMinutes > 180 ? 25 : 10)));

    return {
      totalScheduledMinutes,
      completedMinutes,
      deepWorkScheduledMinutes,
      deepWorkCompletedMinutes,
      blocksCompleted,
      totalBlocks: currentBlocks.length,
      distractionsCaptured: distractionNotes.length,
      totalMeetingMinutes,
      totalMeetingCost: meetingBurnCost,
      savedMeetingCost: Math.round(meetingBurnCost * 0.22),
      fragmentationScore,
    };
  }, [currentBlocks, distractionNotes, meetingBurnCost]);

  // Update current date's blocks
  const updateCurrentDateBlocks = useCallback((newBlocks: WorkBlock[]) => {
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
      const updated = currentBlocks.map((b) =>
        b.id === editingBlock.id ? ({ ...b, ...blockData } as WorkBlock) : b
      );
      updateCurrentDateBlocks(updated);
    } else {
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
    const temp = copy[index];
    copy[index] = copy[newIdx];
    copy[newIdx] = temp;

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

  // Convert a meeting block into protected deep work via ThunderShield
  const handleBlockConverted = (blockId: string, asyncMemo: string) => {
    const updated = currentBlocks.map((b) => {
      if (b.id === blockId) {
        return {
          ...b,
          type: 'deep-work' as WorkBlockType,
          title: `[Protected Deep Work] ${b.title}`,
          isDeflectedToAsync: true,
          asyncMemo,
          description: `⚡ Deflected to asynchronous brief. ${b.description || ''}`,
          energyLevel: 'high' as const,
        };
      }
      return b;
    });
    updateCurrentDateBlocks(updated);
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

  // Circadian Schedule Auto-Alignment
  const handleAlignScheduleWithChronotype = () => {
    // Reorders blocks so highest-priority deep work sits in peak window
    const deepBlocks = currentBlocks.filter((b) => b.type === 'deep-work');
    const meetingBlocks = currentBlocks.filter((b) => b.type === 'meeting');
    const shallowBlocks = currentBlocks.filter((b) => b.type === 'shallow-work');
    const breakBlocks = currentBlocks.filter((b) => b.type === 'break' || b.type === 'kickoff' || b.type === 'shutdown');

    // Simple smart re-assembly: Kickoff -> Deep Work -> Break -> Meetings -> Shallow Admin -> Shutdown
    const kickoff = breakBlocks.find((b) => b.type === 'kickoff') || currentBlocks[0];
    const shutdown = breakBlocks.find((b) => b.type === 'shutdown') || currentBlocks[currentBlocks.length - 1];
    const lunches = breakBlocks.filter((b) => b !== kickoff && b !== shutdown);

    const reordered = [
      kickoff,
      ...deepBlocks,
      ...lunches,
      ...meetingBlocks,
      ...shallowBlocks,
      shutdown,
    ].filter(Boolean);

    // Retime
    let start = 8 * 60 + 30; // 08:30 AM
    const retimed = reordered.map((b, i) => {
      const dur = b.durationMinutes || 45;
      const s = start;
      const e = s + dur;
      start = e;
      return {
        ...b,
        startTime: minutesToTime(s),
        endTime: minutesToTime(e),
      };
    });

    updateCurrentDateBlocks(retimed);
    setProductivityTip(`Aligned schedule with your ${chronotype.toUpperCase()} circadian rhythm. High-impact deep work is now locked during peak alertness.`);
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
    if (filterType === 'meetings') {
      return currentBlocks.filter((b) => b.type === 'meeting');
    }
    return currentBlocks;
  }, [currentBlocks, filterType]);

  const unresolvedDistractions = distractionNotes.filter((n) => !n.resolved).length;

  return (
    <div className="min-h-screen flex flex-col bg-stone-100 text-stone-900 selection:bg-amber-100 pb-20 sm:pb-0">
      
      {/* Top Application Header with Zeus Branding */}
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
        onOpenThunderShield={() => setIsThunderShieldOpen(true)}
        onOpenEnterpriseSaaS={() => setIsEnterpriseSaaSOpen(true)}
        unresolvedDistractionCount={unresolvedDistractions}
        meetingBurnCost={meetingBurnCost}
      />

      {/* Main Corporate Command Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5">
        
        {/* Navigation Tabs for Desktop & Tablets */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 border-b border-stone-200">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setActiveTab('timeline')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'timeline'
                  ? 'bg-black text-white shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-stone-50 border border-stone-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Timeline Command</span>
            </button>

            <button
              onClick={() => setActiveTab('shield')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'shield'
                  ? 'bg-black text-white shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-stone-50 border border-stone-200'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>ThunderShield™ Deflector</span>
              {stats.totalMeetingCost > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 bg-amber-500/20 text-amber-600 rounded-full font-mono">
                  ${stats.totalMeetingCost}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('circadian')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'circadian'
                  ? 'bg-black text-white shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-stone-50 border border-stone-200'
              }`}
            >
              <Brain className="w-3.5 h-3.5 text-purple-600" />
              <span>Circadian Radar</span>
            </button>

            <button
              onClick={() => setActiveTab('radar')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'radar'
                  ? 'bg-black text-white shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-stone-50 border border-stone-200'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-blue-600" />
              <span>Olympus Team Sync</span>
            </button>

            <button
              onClick={() => setActiveTab('saas')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === 'saas'
                  ? 'bg-black text-white shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-stone-50 border border-stone-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Enterprise SaaS & ROI</span>
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={() => setIsTemplateModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:text-stone-950 bg-white border border-stone-200 rounded-xl"
            >
              <LayoutTemplate className="w-3.5 h-3.5 text-stone-500" />
              <span>Executive Blueprints</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Timeline Command */}
        {activeTab === 'timeline' && (
          <div className="space-y-5 animate-in fade-in duration-200">
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

            {/* Corporate Strategy & Circadian Summary Banner */}
            <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-black text-amber-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  <Zap className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-stone-900">
                      {scheduleName}
                    </h3>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
                      {currentBlocks.length} Blocks • {(stats.totalScheduledMinutes / 60).toFixed(1)}h Total
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-mono">
                      Meeting Burn: ${meetingBurnCost}
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
                  <span>Timeline Shift:</span>
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
                  title="Shift all blocks later by 15 mins"
                >
                  +15m
                </button>
              </div>
            </div>

            {/* Timeline Filter Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div>
                <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <span>Executive Workday Timeline</span>
                  <span className="text-xs font-normal text-stone-400">
                    (Current Time: {currentTime})
                  </span>
                </h2>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-1.5 bg-stone-200/80 p-1 rounded-xl text-xs font-medium text-stone-600 overflow-x-auto">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    filterType === 'all' 
                      ? 'bg-white text-stone-900 font-bold shadow-xs' 
                      : 'hover:text-stone-900'
                  }`}
                >
                  All ({currentBlocks.length})
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
                  onClick={() => setFilterType('meetings')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    filterType === 'meetings' 
                      ? 'bg-white text-emerald-700 font-bold shadow-xs' 
                      : 'hover:text-stone-900'
                  }`}
                >
                  Meetings ({currentBlocks.filter((b) => b.type === 'meeting').length})
                </button>
                <button
                  onClick={() => setFilterType('uncompleted')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    filterType === 'uncompleted' 
                      ? 'bg-white text-amber-700 font-bold shadow-xs' 
                      : 'hover:text-stone-900'
                  }`}
                >
                  Remaining ({currentBlocks.filter((b) => !b.completed).length})
                </button>
              </div>
            </div>

            {/* Vertical Timeline Container */}
            <div className="relative pl-5 sm:pl-8 border-l-2 border-stone-200 space-y-4 my-4">
              
              {/* Real-Time "NOW" Indicator Scrubber */}
              <div 
                className="absolute left-0 -ml-[5px] w-2.5 h-2.5 rounded-full bg-amber-500 ring-4 ring-amber-500/20 z-10 transition-all"
                style={{ top: '35px' }}
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
                <div className="w-2 h-2 rounded-full bg-stone-300 -ml-[19px] sm:-ml-[25px]" />
                <span>Workday Shutdown & Executive Disconnect</span>
              </div>

            </div>

            {/* Soundscape Widget */}
            <SoundscapePlayer />
          </div>
        )}

        {/* Tab 2: ThunderShield Meeting Deflector View */}
        {activeTab === 'shield' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-600" />
                  ThunderShield™ Meeting Deflector & Burn-Rate Auditor
                </h3>
                <p className="text-xs text-stone-500">
                  Protect cognitive flow by converting low-leverage synchronous meetings to async decision memos
                </p>
              </div>
              <button
                onClick={() => setIsThunderShieldOpen(true)}
                className="px-3.5 py-2 bg-black hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Launch Deflector Modal
              </button>
            </div>

            {/* In-tab view of ThunderShield metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-xs">
                <div className="text-[10px] uppercase font-bold text-amber-700">
                  Current Day Meeting Burn
                </div>
                <div className="text-3xl font-black font-mono text-stone-900 mt-1">
                  ${meetingBurnCost.toLocaleString()}
                </div>
                <p className="text-xs text-stone-500 mt-1">
                  {currentBlocks.filter((b) => b.type === 'meeting').length} meetings scheduled
                </p>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-xs">
                <div className="text-[10px] uppercase font-bold text-stone-500">
                  Swiss-Cheese Index (Fragmentation)
                </div>
                <div className="text-3xl font-black font-mono text-stone-900 mt-1">
                  {stats.fragmentationScore}%
                </div>
                <p className="text-xs text-stone-500 mt-1">
                  {stats.fragmentationScore > 50 ? '⚠️ High Context Switch Risk' : '✅ Healthy Consolidated Focus'}
                </p>
              </div>

              <div className="p-5 rounded-3xl bg-stone-950 text-white shadow-xs flex flex-col justify-between">
                <div>
                  <div className="text-xs font-bold text-amber-400">
                    Target Meeting Deflation: 22%
                  </div>
                  <p className="text-xs text-stone-400 mt-1">
                    Convert 1 meeting today to save ~45 minutes of deep focus.
                  </p>
                </div>
                <button
                  onClick={() => setIsThunderShieldOpen(true)}
                  className="mt-3 py-1.5 px-3 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs rounded-xl text-center"
                >
                  Open AI Deflector Studio
                </button>
              </div>
            </div>

            {/* List of Meetings with direct 1-click actions */}
            <div className="bg-white border border-stone-200 rounded-3xl p-5 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                Today's Scheduled Synchronous Syncs
              </h4>

              {currentBlocks.filter((b) => b.type === 'meeting').length === 0 ? (
                <div className="text-center py-8 text-xs text-stone-500">
                  No meetings on today's calendar! Your schedule is 100% focused.
                </div>
              ) : (
                <div className="space-y-3">
                  {currentBlocks.filter((b) => b.type === 'meeting').map((m) => (
                    <div
                      key={m.id}
                      className="p-4 rounded-2xl border border-stone-200 bg-stone-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-stone-900">{m.title}</span>
                          <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md">
                            ${Math.round((m.durationMinutes / 60) * (m.attendeesCount || 4) * (m.hourlyRateAvg || 140))} burn
                          </span>
                          <span className="text-xs text-stone-400">
                            ({m.startTime} - {m.endTime}, {m.durationMinutes}m)
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 mt-0.5">
                          {m.description || 'General departmental alignment call'}
                        </p>
                      </div>

                      <button
                        onClick={() => setIsThunderShieldOpen(true)}
                        className="px-3 py-1.5 bg-black hover:bg-stone-800 text-white text-xs font-semibold rounded-xl shrink-0"
                      >
                        Deflect with AI
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Circadian Radar View */}
        {activeTab === 'circadian' && (
          <div className="animate-in fade-in duration-200">
            <CircadianBandwidthRadar
              chronotype={chronotype}
              onChangeChronotype={setChronotype}
              blocks={currentBlocks}
              onAlignSchedule={handleAlignScheduleWithChronotype}
            />
          </div>
        )}

        {/* Tab 4: Olympus Radar View */}
        {activeTab === 'radar' && (
          <div className="animate-in fade-in duration-200">
            <OlympusTeamRadar
              myCurrentFocus={activeBlock?.title || 'Deep Work: System Architecture'}
              myUntilTime={activeBlock?.endTime || '11:30 AM'}
              isMyShieldActive={activeBlock?.type === 'deep-work'}
            />
          </div>
        )}

        {/* Tab 5: Enterprise SaaS & ROI View */}
        {activeTab === 'saas' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-stone-900">
                  ZEUS Enterprise SaaS & ROI Command
                </h3>
                <p className="text-xs text-stone-500">
                  Plans, enterprise licensing, and interactive workforce cost deflation calculator
                </p>
              </div>
              <button
                onClick={() => setIsEnterpriseSaaSOpen(true)}
                className="px-4 py-2 bg-black hover:bg-stone-800 text-white font-bold text-xs rounded-xl"
              >
                Open Full Enterprise Modal
              </button>
            </div>

            <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden border border-stone-800 shadow-xl">
              <div className="max-w-2xl space-y-4">
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 font-mono tracking-widest uppercase border border-amber-400/30">
                  ENTERPRISE COGNITIVE OPERATING SYSTEM
                </span>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  Turn Fragmented Corporate Calendars Into Synchronized Deep Flow
                </h2>
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                  ZEUS eliminates 22%+ of corporate meeting waste, bridges time zones with asynchronous Olympus Radars, and synthesizes focus-inducing bio-audio.
                </p>
                <div className="pt-2 flex flex-wrap gap-3">
                  <button
                    onClick={() => setIsEnterpriseSaaSOpen(true)}
                    className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold rounded-xl shadow-md"
                  >
                    View Enterprise Pricing & ROI
                  </button>
                  <button
                    onClick={() => setIsAiModalOpen(true)}
                    className="px-5 py-2.5 bg-stone-800 hover:bg-stone-700 text-white text-xs font-semibold rounded-xl border border-stone-700"
                  >
                    Test AI Day Architect
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Floating Desktop Footer */}
      <footer className="border-t border-stone-200 bg-white/80 backdrop-blur-xs py-3 px-4 text-center text-xs text-stone-500 hidden sm:block">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>ZEUS Enterprise Workforce OS • Built for corporate cognitive bandwidth & meeting deflation</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsTemplateModalOpen(true)}
              className="text-amber-700 hover:text-amber-900 font-medium"
            >
              Executive Blueprints
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

      {/* Mobile Ergonomic Bottom Navigation Bar (Touch-optimized 44px+ hit targets) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-stone-950 border-t border-stone-800 px-2 py-1.5 flex items-center justify-around shadow-2xl">
        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex flex-col items-center justify-center p-2 rounded-xl min-w-[56px] min-h-[44px] transition-colors ${
            activeTab === 'timeline' ? 'text-amber-400 font-bold' : 'text-stone-400 hover:text-white'
          }`}
        >
          <Zap className="w-5 h-5 fill-current" />
          <span className="text-[10px] mt-0.5">Timeline</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('timeline');
            // Scroll to top where active focus bar is
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex flex-col items-center justify-center p-2 rounded-xl min-w-[56px] min-h-[44px] text-stone-400 hover:text-white"
        >
          <Clock className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Focus</span>
        </button>

        <button
          onClick={() => setActiveTab('shield')}
          className={`flex flex-col items-center justify-center p-2 rounded-xl min-w-[56px] min-h-[44px] transition-colors relative ${
            activeTab === 'shield' ? 'text-amber-400 font-bold' : 'text-stone-400 hover:text-white'
          }`}
        >
          <Flame className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Shield</span>
          {meetingBurnCost > 0 && (
            <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-amber-500" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('radar')}
          className={`flex flex-col items-center justify-center p-2 rounded-xl min-w-[56px] min-h-[44px] transition-colors ${
            activeTab === 'radar' ? 'text-amber-400 font-bold' : 'text-stone-400 hover:text-white'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Team</span>
        </button>

        <button
          onClick={() => setActiveTab('saas')}
          className={`flex flex-col items-center justify-center p-2 rounded-xl min-w-[56px] min-h-[44px] transition-colors ${
            activeTab === 'saas' ? 'text-amber-400 font-bold' : 'text-stone-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Plans</span>
        </button>
      </div>

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
        defaultStartTime={currentBlocks[0]?.startTime || '08:30'}
        defaultEndTime={currentBlocks[currentBlocks.length - 1]?.endTime || '17:15'}
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

      <ThunderShieldModal
        isOpen={isThunderShieldOpen}
        onClose={() => setIsThunderShieldOpen(false)}
        blocks={currentBlocks}
        onUpdateBlocks={updateCurrentDateBlocks}
        onBlockConverted={handleBlockConverted}
      />

      <EnterpriseSaaSModal
        isOpen={isEnterpriseSaaSOpen}
        onClose={() => setIsEnterpriseSaaSOpen(false)}
      />

    </div>
  );
}
