import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause, Waves, Sparkles, CloudRain, Shield, Sliders } from 'lucide-react';
import { SoundscapeMode } from '../types';
import { startSoundscape, stopSoundscape, setSoundscapeVolume } from '../utils/audio';

interface SoundscapePlayerProps {
  compact?: boolean;
}

export const SoundscapePlayer: React.FC<SoundscapePlayerProps> = ({ compact = false }) => {
  const [activeMode, setActiveMode] = useState<SoundscapeMode>('none');
  const [volume, setVolume] = useState<number>(35);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  useEffect(() => {
    return () => {
      stopSoundscape();
    };
  }, []);

  const handleSelectMode = (mode: SoundscapeMode) => {
    if (activeMode === mode) {
      stopSoundscape();
      setActiveMode('none');
    } else {
      setActiveMode(mode);
      startSoundscape(mode, volume);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    setSoundscapeVolume(newVol);
  };

  const modes: { id: SoundscapeMode; label: string; desc: string; icon: any }[] = [
    {
      id: 'binaural-theta',
      label: '10Hz Alpha Focus',
      desc: 'Binaural pulse for sustained deep coding & strategy',
      icon: Sparkles,
    },
    {
      id: 'olympus-storm',
      label: 'Olympus Storm',
      desc: 'Deep ambient thunder & rain for sensory shielding',
      icon: CloudRain,
    },
    {
      id: 'executive-brown',
      label: 'Executive Brown Noise',
      desc: 'Acoustic masking for noisy corporate environments',
      icon: Waves,
    },
  ];

  if (compact) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            activeMode !== 'none'
              ? 'bg-amber-500/10 border-amber-500/40 text-amber-900 shadow-xs'
              : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
          }`}
          title="ThunderPulse Audio Generator"
        >
          <Waves className={`w-3.5 h-3.5 ${activeMode !== 'none' ? 'text-amber-600 animate-pulse' : 'text-stone-500'}`} />
          <span className="hidden sm:inline">
            {activeMode === 'none' ? 'Audio Pulse' : modes.find((m) => m.id === activeMode)?.label}
          </span>
        </button>

        {isExpanded && (
          <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-stone-200 shadow-xl p-3 z-50 space-y-2.5">
            <div className="flex items-center justify-between pb-1.5 border-b border-stone-100">
              <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                <Waves className="w-3.5 h-3.5 text-amber-600" />
                ThunderPulse™ Neuro-Audio
              </span>
              {activeMode !== 'none' && (
                <button
                  onClick={() => handleSelectMode(activeMode)}
                  className="text-[10px] font-bold text-red-600 hover:underline"
                >
                  Mute
                </button>
              )}
            </div>

            <div className="space-y-1.5">
              {modes.map((m) => {
                const Icon = m.icon;
                const isSelected = activeMode === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => handleSelectMode(m.id)}
                    className={`w-full text-left p-2 rounded-xl border text-xs flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-amber-50 border-amber-400 font-bold text-amber-900'
                        : 'bg-stone-50/60 border-stone-200/80 hover:bg-stone-100 text-stone-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-600' : 'text-stone-400'}`} />
                      <div>
                        <div className="text-[11px] font-semibold">{m.label}</div>
                        <div className="text-[9px] text-stone-400 font-normal">{m.desc}</div>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Volume slider */}
            <div className="pt-1.5 flex items-center gap-2">
              <Volume2 className="w-3 h-3 text-stone-400 shrink-0" />
              <input
                type="range"
                min={5}
                max={100}
                value={volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="w-full accent-amber-500 h-1 bg-stone-200 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] text-stone-500 font-mono w-6 text-right">
                {volume}%
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-black text-amber-400 flex items-center justify-center">
            <Waves className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-stone-900">
              ThunderPulse™ Neuro-Soundscape
            </h4>
            <p className="text-[10px] text-stone-500">
              Zero-latency psychoacoustic frequency synthesis for flow state
            </p>
          </div>
        </div>

        {activeMode !== 'none' && (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
            Active Synthesizer
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
        {modes.map((m) => {
          const Icon = m.icon;
          const isSelected = activeMode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => handleSelectMode(m.id)}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-amber-500/10 border-amber-500 font-bold text-stone-950 shadow-xs ring-1 ring-amber-500/20'
                  : 'bg-stone-50 border-stone-200 hover:bg-stone-100/80 text-stone-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-600' : 'text-stone-400'}`} />
                {isSelected ? (
                  <Pause className="w-3 h-3 text-amber-600" />
                ) : (
                  <Play className="w-3 h-3 text-stone-400" />
                )}
              </div>
              <div className="text-xs font-bold text-stone-900">{m.label}</div>
              <p className="text-[10px] text-stone-500 mt-0.5 line-clamp-2 leading-tight">
                {m.desc}
              </p>
            </button>
          );
        })}
      </div>

      {/* Volume Bar */}
      <div className="flex items-center justify-between gap-3 pt-2 border-t border-stone-100">
        <div className="flex items-center gap-2 flex-1">
          <Volume2 className="w-3.5 h-3.5 text-stone-400" />
          <input
            type="range"
            min={5}
            max={100}
            value={volume}
            onChange={(e) => handleVolumeChange(Number(e.target.value))}
            className="w-full accent-amber-600 h-1.5 bg-stone-200 rounded-lg cursor-pointer"
          />
          <span className="text-[11px] font-mono text-stone-500 w-8 text-right">
            {volume}%
          </span>
        </div>

        {activeMode !== 'none' && (
          <button
            onClick={() => handleSelectMode(activeMode)}
            className="text-xs font-semibold text-red-600 hover:underline shrink-0"
          >
            Stop Audio
          </button>
        )}
      </div>
    </div>
  );
};
