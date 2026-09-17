import React from 'react';
import { Sun, Moon, Sunrise, AlertCircle, CheckCircle, Zap, ArrowRight, Brain } from 'lucide-react';
import { Chronotype, WorkBlock } from '../types';

interface CircadianBandwidthRadarProps {
  chronotype: Chronotype;
  onChangeChronotype: (type: Chronotype) => void;
  blocks: WorkBlock[];
  onAlignSchedule: () => void;
}

export const CircadianBandwidthRadar: React.FC<CircadianBandwidthRadarProps> = ({
  chronotype,
  onChangeChronotype,
  blocks,
  onAlignSchedule,
}) => {
  const chronotypeConfigs = {
    lion: {
      name: 'Lion (Early Zenith)',
      peakLabel: '07:30 AM – 11:30 AM',
      slumpLabel: '01:30 PM – 03:00 PM',
      desc: 'Optimal for early morning strategic decisions & deep analytical code/architecture.',
      curve: [85, 95, 100, 90, 75, 45, 55, 65, 50, 40], // 8am to 5pm
      icon: Sunrise,
    },
    bear: {
      name: 'Bear (Solar Rhythm)',
      peakLabel: '09:30 AM – 01:00 PM',
      slumpLabel: '02:00 PM – 03:30 PM',
      desc: 'Matches traditional business hours with steady midday peak and gentle afternoon glide.',
      curve: [60, 80, 95, 95, 80, 50, 60, 70, 60, 45],
      icon: Sun,
    },
    wolf: {
      name: 'Wolf (Late Surge)',
      peakLabel: '01:30 PM – 06:00 PM',
      slumpLabel: '08:30 AM – 10:30 AM',
      desc: 'Slow morning startup, followed by explosive afternoon focus and evening creative surge.',
      curve: [40, 50, 60, 70, 80, 85, 95, 95, 85, 75],
      icon: Moon,
    },
  };

  const currentConfig = chronotypeConfigs[chronotype];

  // Inspect blocks to see if deep work is scheduled during slump or low-energy hours
  const deepBlocks = blocks.filter((b) => b.type === 'deep-work');
  const postLunchSlumpBlock = deepBlocks.find((b) => {
    const startHour = parseInt(b.startTime.split(':')[0], 10);
    return startHour >= 13 && startHour <= 15;
  });

  const morningDeepBlock = deepBlocks.find((b) => {
    const startHour = parseInt(b.startTime.split(':')[0], 10);
    return startHour >= 8 && startHour <= 12;
  });

  return (
    <div className="bg-white border border-stone-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-stone-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 flex items-center justify-center font-bold">
              <Brain className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-stone-900">
              Circadian Bandwidth & Chronotype Radar
            </h3>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Map cognitive energy peaks to mission-critical corporate deliverables
          </p>
        </div>

        {/* Chronotype Pills */}
        <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-2xl">
          {(['lion', 'bear', 'wolf'] as Chronotype[]).map((type) => {
            const isSelected = chronotype === type;
            const Icon = chronotypeConfigs[type].icon;
            return (
              <button
                key={type}
                onClick={() => onChangeChronotype(type)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                  isSelected
                    ? 'bg-black text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-400' : 'text-stone-400'}`} />
                <span>{type}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chronotype Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80">
          <div className="text-[10px] uppercase font-bold text-amber-800">
            Neuro-Peak Flow Window
          </div>
          <div className="text-sm font-bold text-stone-950 font-mono mt-0.5">
            {currentConfig.peakLabel}
          </div>
          <div className="text-[11px] text-stone-600 mt-1">
            Schedule top-tier architecture, financial modeling & hard problems here.
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
          <div className="text-[10px] uppercase font-bold text-stone-500">
            Circadian Slump Trough
          </div>
          <div className="text-sm font-bold text-stone-800 font-mono mt-0.5">
            {currentConfig.slumpLabel}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            Ideal for low-load shallow admin, inbox processing, or walking breaks.
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-stone-900 text-white flex flex-col justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-amber-400">
              Cognitive Match Audit
            </div>
            <p className="text-xs text-stone-300 mt-1">
              {postLunchSlumpBlock
                ? '⚠️ Deep work detected during your circadian trough.'
                : '✅ Schedule is well-aligned with your peak alert windows.'}
            </p>
          </div>
          {postLunchSlumpBlock && (
            <button
              onClick={onAlignSchedule}
              className="mt-2 text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              <span>Auto-align with Peak Window</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* SVG Circadian Alertness Curve */}
      <div className="pt-2">
        <div className="flex items-center justify-between text-[11px] font-semibold text-stone-400 mb-1">
          <span>Biological Alertness Curve</span>
          <span className="text-amber-700 font-mono">Profile: {currentConfig.name}</span>
        </div>

        <div className="h-28 w-full bg-stone-50 rounded-2xl border border-stone-200/80 p-3 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle peak zone overlay */}
          <div 
            className="absolute top-0 bottom-0 bg-amber-400/10 border-x border-amber-400/30"
            style={{
              left: chronotype === 'lion' ? '10%' : chronotype === 'bear' ? '25%' : '55%',
              width: '35%',
            }}
          />

          <svg className="w-full h-16 overflow-visible" viewBox="0 0 900 100" preserveAspectRatio="none">
            {/* Draw smooth curve */}
            <path
              d={`M 0,${100 - currentConfig.curve[0]} 
                 C 100,${100 - currentConfig.curve[1]} 200,${100 - currentConfig.curve[2]} 300,${100 - currentConfig.curve[3]}
                 C 400,${100 - currentConfig.curve[4]} 500,${100 - currentConfig.curve[5]} 600,${100 - currentConfig.curve[6]}
                 C 700,${100 - currentConfig.curve[7]} 800,${100 - currentConfig.curve[8]} 900,${100 - currentConfig.curve[9]}`}
              fill="none"
              stroke="#d97706"
              strokeWidth="3"
            />
            {/* Data points */}
            {currentConfig.curve.map((val, i) => (
              <circle
                key={i}
                cx={i * 100}
                cy={100 - val}
                r="4"
                className="fill-amber-500 stroke-white stroke-2"
              />
            ))}
          </svg>

          {/* Time axis */}
          <div className="flex justify-between text-[10px] font-mono text-stone-400 border-t border-stone-200 pt-1">
            <span>08:00</span>
            <span>09:00</span>
            <span>10:00</span>
            <span>11:00</span>
            <span>12:00</span>
            <span>13:00</span>
            <span>14:00</span>
            <span>15:00</span>
            <span>16:00</span>
            <span>17:00</span>
          </div>
        </div>
      </div>

    </div>
  );
};
