import React, { useState } from 'react';
import { X, LayoutTemplate, Check, Clock, Brain, Zap, Coffee, ArrowRight } from 'lucide-react';
import { DAY_TEMPLATES } from '../data/templates';
import { DayScheduleTemplate, WorkBlock } from '../types';
import { formatTime12h } from '../utils/time';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTemplate: (blocks: WorkBlock[], templateName: string) => void;
}

export const TemplateModal: React.FC<TemplateModalProps> = ({
  isOpen,
  onClose,
  onApplyTemplate,
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(DAY_TEMPLATES[0].id);

  if (!isOpen) return null;

  const selectedTemplate = DAY_TEMPLATES.find((t) => t.id === selectedTemplateId) || DAY_TEMPLATES[0];

  const handleApply = () => {
    // Generate fresh blocks with unique IDs
    const formattedBlocks: WorkBlock[] = selectedTemplate.blocks.map((block, idx) => ({
      ...block,
      id: `tmpl-${Date.now()}-${idx}`,
      completed: false,
      tasks: (block.tasks || []).map((t, tIdx) => ({
        ...t,
        id: `ttask-${Date.now()}-${idx}-${tIdx}`,
        completed: false,
      })),
    }));

    onApplyTemplate(formattedBlocks, selectedTemplate.name);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-stone-200 w-full max-w-3xl shadow-xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-stone-200 text-stone-800 flex items-center justify-center">
              <LayoutTemplate className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">
                Workday Structure Blueprints
              </h2>
              <p className="text-xs text-stone-500">
                Choose a proven daily schedule architecture
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
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 max-h-[75vh] overflow-y-auto">
          
          {/* Left Column: Template Selection List */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
              Select Architecture
            </p>
            {DAY_TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.id}
                onClick={() => setSelectedTemplateId(tmpl.id)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  selectedTemplateId === tmpl.id
                    ? 'border-amber-500 bg-amber-50/60 shadow-xs'
                    : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                }`}
              >
                <div className="font-bold text-xs text-stone-900 mb-0.5">
                  {tmpl.name}
                </div>
                <p className="text-[11px] text-stone-500 line-clamp-2">
                  {tmpl.tagline}
                </p>
              </button>
            ))}
          </div>

          {/* Right Column: Template Breakdown & Preview */}
          <div className="md:col-span-2 border border-stone-200 rounded-xl p-4 bg-stone-50/50 flex flex-col justify-between">
            <div>
              <div className="border-b border-stone-200 pb-3 mb-3">
                <h3 className="text-sm font-bold text-stone-900">
                  {selectedTemplate.name}
                </h3>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  {selectedTemplate.description}
                </p>
              </div>

              {/* Blocks Preview List */}
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 mb-1">
                  Schedule Blocks ({selectedTemplate.blocks.length})
                </p>
                {selectedTemplate.blocks.map((b, i) => (
                  <div 
                    key={i} 
                    className="flex items-center justify-between p-2 rounded-lg bg-white border border-stone-200/80 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-mono text-[11px] text-stone-500">
                        {formatTime12h(b.startTime)}
                      </span>
                      <span className="font-semibold text-stone-800 truncate">
                        {b.title}
                      </span>
                    </div>
                    <span className="text-[11px] text-stone-400 whitespace-nowrap ml-2">
                      {b.durationMinutes}m
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Apply Button */}
            <div className="pt-4 mt-4 border-t border-stone-200 flex items-center justify-between">
              <span className="text-xs text-stone-500">
                Replaces today's current blocks
              </span>
              <button
                onClick={handleApply}
                className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
              >
                <span>Apply This Schedule</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
