import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Clock, 
  Calendar, 
  Zap, 
  Coffee, 
  AlertCircle,
  RotateCcw,
  Check
} from 'lucide-react';
import { WorkBlock } from '../types';
import { getCurrentTimeHHMM } from '../utils/time';

interface AiDayArchitectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplySchedule: (blocks: WorkBlock[], scheduleName: string, tip: string) => void;
  currentBlocks: WorkBlock[];
  defaultStartTime: string;
  defaultEndTime: string;
}

export const AiDayArchitectModal: React.FC<AiDayArchitectModalProps> = ({
  isOpen,
  onClose,
  onApplySchedule,
  currentBlocks,
  defaultStartTime,
  defaultEndTime,
}) => {
  const [priorities, setPriorities] = useState('');
  const [meetings, setMeetings] = useState('');
  const [workStartTime, setWorkStartTime] = useState(defaultStartTime || '09:00');
  const [workEndTime, setWorkEndTime] = useState(defaultEndTime || '17:30');
  const [lunchStartTime, setLunchStartTime] = useState('12:30');
  const [lunchDuration, setLunchDuration] = useState(45);
  const [pacingStyle, setPacingStyle] = useState<'balanced' | 'maker' | 'ultradian' | 'pomodoro'>('balanced');
  const [energyPreference, setEnergyPreference] = useState('morning-focus');

  const [isLoading, setIsLoading] = useState(false);
  const [rebalanceNote, setRebalanceNote] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/ai/structure-day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priorities,
          meetings,
          workStartTime,
          workEndTime,
          lunchStartTime,
          lunchDurationMinutes: lunchDuration,
          pacingStyle,
          energyPreference,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      if (data.blocks && data.blocks.length > 0) {
        onApplySchedule(data.blocks, data.scheduleName, data.productivityTip);
        onClose();
      } else {
        throw new Error('No blocks returned from day structure generator.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Failed to generate schedule. Please check your inputs or network.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRebalance = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    const currentTime = getCurrentTimeHHMM();
    const remaining = currentBlocks.filter((b) => !b.completed);
    const completed = currentBlocks.filter((b) => b.completed);

    try {
      const res = await fetch('/api/ai/rebalance-day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentTime,
          remainingBlocks: remaining,
          completedBlocks: completed,
          workEndTime,
          note: rebalanceNote || 'Running behind schedule, need to rebalance remaining time',
        }),
      });

      if (!res.ok) {
        throw new Error('Rebalance endpoint error');
      }

      const data = await res.json();
      if (data.blocks) {
        // Keep completed blocks as they are, replace remaining
        const fullSchedule = [...completed, ...data.blocks];
        onApplySchedule(
          fullSchedule, 
          'Rebalanced Schedule', 
          data.rebalanceMessage || 'Remaining blocks re-timed starting from current time.'
        );
        onClose();
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Could not rebalance remaining day. Try adjusting times manually.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-stone-200 w-full max-w-2xl shadow-xl overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">
                AI Workday Architect
              </h2>
              <p className="text-xs text-stone-500">
                Generate an intentional, cognitively paced schedule for your day
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

        {/* Modal Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 text-xs bg-red-50 text-red-700 border border-red-200 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Rebalance banner if blocks exist */}
          {currentBlocks.length > 0 && (
            <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-xl">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-xs font-semibold text-amber-950 flex items-center gap-1.5">
                    <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
                    Running Behind Schedule?
                  </h4>
                  <p className="text-xs text-amber-800 mt-0.5">
                    Re-align your remaining uncompleted blocks starting right now ({getCurrentTimeHHMM()}) to fit your planned finish time.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRebalance}
                  disabled={isLoading}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold whitespace-nowrap shadow-xs disabled:opacity-50"
                >
                  {isLoading ? 'Rebalancing...' : 'Rebalance Remaining Day'}
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleGenerate} className="space-y-4">
            
            {/* Priorities & Tasks */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                What are your top priorities and must-do tasks today?
              </label>
              <textarea
                rows={3}
                required
                value={priorities}
                onChange={(e) => setPriorities(e.target.value)}
                placeholder="E.g., Complete technical proposal draft, review design prototypes, respond to client email batch, prepare slides for sprint review..."
                className="w-full text-xs p-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-stone-800 placeholder-stone-400"
              />
              <p className="text-[11px] text-stone-400 mt-1">
                Tip: Brain dump everything; the AI will allocate high-energy focus zones for the hardest tasks and batch the rest.
              </p>
            </div>

            {/* Fixed Meetings */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Fixed Meetings or Inflexible Appointments (optional)
              </label>
              <input
                type="text"
                value={meetings}
                onChange={(e) => setMeetings(e.target.value)}
                placeholder="E.g., 10:00-10:30 Team Standup, 14:00-15:00 Client Demo"
                className="w-full text-xs px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-stone-800 placeholder-stone-400"
              />
            </div>

            {/* Time boundaries */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-stone-600 mb-1">
                  Work Start
                </label>
                <input
                  type="time"
                  value={workStartTime}
                  onChange={(e) => setWorkStartTime(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 text-stone-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-stone-600 mb-1">
                  Work End
                </label>
                <input
                  type="time"
                  value={workEndTime}
                  onChange={(e) => setWorkEndTime(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 text-stone-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-stone-600 mb-1">
                  Target Lunch
                </label>
                <input
                  type="time"
                  value={lunchStartTime}
                  onChange={(e) => setLunchStartTime(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 text-stone-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-stone-600 mb-1">
                  Lunch Duration
                </label>
                <select
                  value={lunchDuration}
                  onChange={(e) => setLunchDuration(Number(e.target.value))}
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 text-stone-800"
                >
                  <option value={30}>30 mins</option>
                  <option value={45}>45 mins</option>
                  <option value={60}>60 mins</option>
                </select>
              </div>
            </div>

            {/* Workday Pacing Archetype */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-2">
                Workday Pacing Style
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                
                <label 
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    pacingStyle === 'balanced' 
                      ? 'border-amber-500 bg-amber-50/40 ring-1 ring-amber-500/20' 
                      : 'border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="pacing"
                    className="sr-only"
                    checked={pacingStyle === 'balanced'}
                    onChange={() => setPacingStyle('balanced')}
                  />
                  <div className="font-semibold text-xs text-stone-900 flex items-center justify-between">
                    <span>Balanced Flow</span>
                    {pacingStyle === 'balanced' && <Check className="w-3.5 h-3.5 text-amber-600" />}
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1 leading-normal">
                    Morning deep focus, afternoon collaboration, and structured evening wrap-up.
                  </p>
                </label>

                <label 
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    pacingStyle === 'maker' 
                      ? 'border-amber-500 bg-amber-50/40 ring-1 ring-amber-500/20' 
                      : 'border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="pacing"
                    className="sr-only"
                    checked={pacingStyle === 'maker'}
                    onChange={() => setPacingStyle('maker')}
                  />
                  <div className="font-semibold text-xs text-stone-900 flex items-center justify-between">
                    <span>Maker’s Deep Focus</span>
                    {pacingStyle === 'maker' && <Check className="w-3.5 h-3.5 text-amber-600" />}
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1 leading-normal">
                    Large 2-3 hour uninterrupted blocks with minimal context switching.
                  </p>
                </label>

                <label 
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    pacingStyle === 'ultradian' 
                      ? 'border-amber-500 bg-amber-50/40 ring-1 ring-amber-500/20' 
                      : 'border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="pacing"
                    className="sr-only"
                    checked={pacingStyle === 'ultradian'}
                    onChange={() => setPacingStyle('ultradian')}
                  />
                  <div className="font-semibold text-xs text-stone-900 flex items-center justify-between">
                    <span>90-Min Ultradian Rhythm</span>
                    {pacingStyle === 'ultradian' && <Check className="w-3.5 h-3.5 text-amber-600" />}
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1 leading-normal">
                    90 min intense sprints paired with mandatory 20m restorative resets.
                  </p>
                </label>

                <label 
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                    pacingStyle === 'pomodoro' 
                      ? 'border-amber-500 bg-amber-50/40 ring-1 ring-amber-500/20' 
                      : 'border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="pacing"
                    className="sr-only"
                    checked={pacingStyle === 'pomodoro'}
                    onChange={() => setPacingStyle('pomodoro')}
                  />
                  <div className="font-semibold text-xs text-stone-900 flex items-center justify-between">
                    <span>Pomodoro Cadence</span>
                    {pacingStyle === 'pomodoro' && <Check className="w-3.5 h-3.5 text-amber-600" />}
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1 leading-normal">
                    25m focus / 5m recovery sets. High momentum for clearing large backlogs.
                  </p>
                </label>

              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-semibold rounded-xl text-xs transition-all shadow-md shadow-amber-500/20 disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isLoading ? 'Architecting Day...' : 'Generate Day Schedule'}</span>
              </button>
            </div>

          </form>

        </div>

      </div>
    </div>
  );
};
