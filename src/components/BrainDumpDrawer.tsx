import React, { useState } from 'react';
import { X, Lightbulb, Check, Trash2, Plus, Sparkles, ArrowRight } from 'lucide-react';
import { DistractionNote } from '../types';

interface BrainDumpDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notes: DistractionNote[];
  onAddNote: (text: string) => void;
  onToggleResolve: (id: string) => void;
  onDeleteNote: (id: string) => void;
  onClearResolved: () => void;
}

export const BrainDumpDrawer: React.FC<BrainDumpDrawerProps> = ({
  isOpen,
  onClose,
  notes,
  onAddNote,
  onToggleResolve,
  onDeleteNote,
  onClearResolved,
}) => {
  const [inputText, setInputText] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('active');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onAddNote(inputText.trim());
    setInputText('');
  };

  const filteredNotes = notes.filter((n) => {
    if (filter === 'active') return !n.resolved;
    if (filter === 'resolved') return n.resolved;
    return true;
  });

  const unresolvedCount = notes.filter((n) => !n.resolved).length;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-stone-950/40 backdrop-blur-xs">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col border-l border-stone-200">
        
        {/* Drawer Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-900">
                Thought Parking Lot
              </h2>
              <p className="text-xs text-stone-500">
                Capture distractions instantly to preserve deep work
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Capsule */}
        <div className="p-4 bg-amber-50/70 border-b border-amber-200/60 text-xs text-amber-900 leading-relaxed">
          <span className="font-semibold">The 10-Second Rule:</span> Whenever an unrelated thought, errand, or message impulse interrupts your focus block, park it here. Review and triage these during your scheduled Shallow Work or Shutdown block!
        </div>

        {/* Quick Add Form */}
        <form onSubmit={handleSubmit} className="p-4 border-b border-stone-100 flex gap-2">
          <input
            type="text"
            placeholder="Type fleeting thought or errand..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 text-xs px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-stone-800"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="px-3 py-2 bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Park</span>
          </button>
        </form>

        {/* Filter tabs */}
        <div className="px-4 pt-2 flex items-center justify-between text-xs">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('active')}
              className={`pb-1 font-semibold border-b-2 transition-colors ${
                filter === 'active' 
                  ? 'border-amber-600 text-amber-900' 
                  : 'border-transparent text-stone-400 hover:text-stone-700'
              }`}
            >
              Active ({unresolvedCount})
            </button>
            <button
              onClick={() => setFilter('resolved')}
              className={`pb-1 font-semibold border-b-2 transition-colors ${
                filter === 'resolved' 
                  ? 'border-amber-600 text-amber-900' 
                  : 'border-transparent text-stone-400 hover:text-stone-700'
              }`}
            >
              Handled ({notes.length - unresolvedCount})
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`pb-1 font-semibold border-b-2 transition-colors ${
                filter === 'all' 
                  ? 'border-amber-600 text-amber-900' 
                  : 'border-transparent text-stone-400 hover:text-stone-700'
              }`}
            >
              All
            </button>
          </div>

          {notes.some((n) => n.resolved) && (
            <button
              onClick={onClearResolved}
              className="text-[11px] text-stone-400 hover:text-red-600 font-medium"
            >
              Clear Handled
            </button>
          )}
        </div>

        {/* Notes List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-2">
          {filteredNotes.length === 0 ? (
            <div className="text-center py-12 text-stone-400 text-xs">
              {filter === 'active'
                ? 'No pending distractions. Clear mind!'
                : 'No items found in this view.'}
            </div>
          ) : (
            filteredNotes.map((note) => (
              <div
                key={note.id}
                className={`p-3 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                  note.resolved
                    ? 'bg-stone-50 border-stone-200 opacity-60'
                    : 'bg-white border-stone-200/90 shadow-xs'
                }`}
              >
                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                  <button
                    onClick={() => onToggleResolve(note.id)}
                    className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                      note.resolved
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-stone-300 hover:border-amber-500'
                    }`}
                  >
                    {note.resolved && <Check className="w-3 h-3" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs text-stone-800 break-words ${note.resolved ? 'line-through text-stone-400' : ''}`}>
                      {note.text}
                    </p>
                    <span className="text-[10px] text-stone-400 mt-0.5 block font-mono">
                      {note.timestamp}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteNote(note.id)}
                  className="text-stone-300 hover:text-red-600 p-1 rounded transition-colors"
                  title="Delete note"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl"
          >
            Back to Flow
          </button>
        </div>

      </div>
    </div>
  );
};
