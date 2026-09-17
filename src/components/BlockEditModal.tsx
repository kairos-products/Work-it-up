import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Clock, Check } from 'lucide-react';
import { WorkBlock, WorkBlockType } from '../types';
import { timeToMinutes, minutesToTime } from '../utils/time';

interface BlockEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (blockData: Partial<WorkBlock>) => void;
  initialBlock: WorkBlock | null;
}

export const BlockEditModal: React.FC<BlockEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialBlock,
}) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<WorkBlockType>('deep-work');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:30');
  const [description, setDescription] = useState('');
  const [energyLevel, setEnergyLevel] = useState<'high' | 'medium' | 'low'>('high');
  const [tasks, setTasks] = useState<{ id: string; title: string; completed: boolean }[]>([]);
  const [newTaskInput, setNewTaskInput] = useState('');

  useEffect(() => {
    if (initialBlock) {
      setTitle(initialBlock.title);
      setType(initialBlock.type);
      setStartTime(initialBlock.startTime);
      setEndTime(initialBlock.endTime);
      setDescription(initialBlock.description || '');
      setEnergyLevel(initialBlock.energyLevel || 'medium');
      setTasks(initialBlock.tasks || []);
    } else {
      setTitle('');
      setType('deep-work');
      setStartTime('09:00');
      setEndTime('10:00');
      setDescription('');
      setEnergyLevel('high');
      setTasks([]);
    }
  }, [initialBlock, isOpen]);

  if (!isOpen) return null;

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskInput.trim()) return;
    setTasks([
      ...tasks,
      { id: `task-${Date.now()}-${Math.random()}`, title: newTaskInput.trim(), completed: false },
    ]);
    setNewTaskInput('');
  };

  const handleRemoveTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const handleStartTimeChange = (newStart: string) => {
    setStartTime(newStart);
    // Keep duration preserved if valid
    const startM = timeToMinutes(newStart);
    const endM = timeToMinutes(endTime);
    if (endM <= startM) {
      setEndTime(minutesToTime(startM + 60));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const duration = Math.max(10, timeToMinutes(endTime) - timeToMinutes(startTime));

    onSave({
      id: initialBlock ? initialBlock.id : `blk-${Date.now()}`,
      title: title.trim(),
      type,
      startTime,
      endTime,
      durationMinutes: duration,
      description: description.trim(),
      energyLevel,
      tasks,
      completed: initialBlock ? initialBlock.completed : false,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-stone-200 w-full max-w-lg shadow-xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50">
          <h2 className="text-base font-bold text-stone-900">
            {initialBlock ? 'Edit Work Block' : 'Add Work Block'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Block Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="E.g. Deep Work: System Architecture Design"
              className="w-full text-xs px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-stone-800"
            />
          </div>

          {/* Type Category */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Category
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as WorkBlockType)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-stone-800"
            >
              <option value="deep-work">Deep Work (High Cognitive Load)</option>
              <option value="shallow-work">Shallow / Admin (Emails, Triage)</option>
              <option value="meeting">Meeting / Collaboration</option>
              <option value="break">Break & Rest (Lunch, Walk, Rest)</option>
              <option value="kickoff">Morning Kickoff</option>
              <option value="shutdown">Workday Shutdown</option>
            </select>
          </div>

          {/* Time Bounds */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Start Time
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => handleStartTimeChange(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-stone-200 text-stone-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                End Time
              </label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-stone-200 text-stone-800"
              />
            </div>
          </div>

          {/* Energy Level */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Expected Cognitive Energy
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['high', 'medium', 'low'] as const).map((lvl) => (
                <button
                  type="button"
                  key={lvl}
                  onClick={() => setEnergyLevel(lvl)}
                  className={`py-1.5 px-3 rounded-lg text-xs font-semibold capitalize border transition-all ${
                    energyLevel === lvl
                      ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold'
                      : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Focus Scope / Notes (optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What specifically needs to be achieved during this block?"
              className="w-full text-xs p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-stone-800 placeholder-stone-400"
            />
          </div>

          {/* Tasks checklist */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Actionable Subtasks ({tasks.length})
            </label>
            <div className="space-y-1.5 mb-2 max-h-36 overflow-y-auto">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-1.5 bg-stone-50 rounded-lg text-xs">
                  <span className="text-stone-700 truncate pr-2">{task.title}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTask(task.id)}
                    className="text-stone-400 hover:text-red-600 p-0.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Add task to this block..."
                value={newTaskInput}
                onChange={(e) => setNewTaskInput(e.target.value)}
                className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 text-stone-800 placeholder-stone-400"
              />
              <button
                type="button"
                onClick={handleAddTask}
                disabled={!newTaskInput.trim()}
                className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 disabled:opacity-50 text-stone-800 rounded-lg text-xs font-medium"
              >
                Add
              </button>
            </div>
          </div>

          {/* Footer actions */}
          <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold transition-colors"
            >
              Save Block
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
