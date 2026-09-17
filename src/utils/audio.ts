// Web Audio API soundscape synthesizer and focus chime for ZEUS Workforce OS
import { SoundscapeMode } from '../types';

let audioCtx: AudioContext | null = null;
let currentSoundscapeNodes: {
  stop: () => void;
  masterGain: GainNode;
} | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (!audioCtx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        audioCtx = new AudioCtx();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  } catch (e) {
    return null;
  }
}

export function playFocusChime(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const fundamental = 528; // Solfeggio resonance
    const harmonics = [1, 2.01, 3.01, 4.2];
    const gains = [0.4, 0.2, 0.1, 0.05];

    harmonics.forEach((h, index) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(fundamental * h, now);

      gainNode.gain.setValueAtTime(0.001, now);
      gainNode.gain.exponentialRampToValueAtTime(gains[index], now + 0.04);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 2.3);
    });
  } catch (err) {
    // Audio playback error caught silently
  }
}

export function playThunderChime(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Resonant deep thunder strike
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 1.2);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 1.5);
  } catch (e) {}
}

export function stopSoundscape(): void {
  if (currentSoundscapeNodes) {
    try {
      currentSoundscapeNodes.stop();
    } catch (e) {}
    currentSoundscapeNodes = null;
  }
}

export function setSoundscapeVolume(volumePct: number): void {
  if (currentSoundscapeNodes) {
    const gain = Math.max(0, Math.min(1, volumePct / 100)) * 0.4;
    currentSoundscapeNodes.masterGain.gain.setTargetAtTime(gain, (audioCtx?.currentTime || 0), 0.05);
  }
}

export function startSoundscape(mode: SoundscapeMode, volumePct: number = 40): void {
  stopSoundscape();
  if (mode === 'none') return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const masterGain = ctx.createGain();
  const initialGain = Math.max(0, Math.min(1, volumePct / 100)) * 0.4;
  masterGain.gain.setValueAtTime(initialGain, ctx.currentTime);
  masterGain.connect(ctx.destination);

  const cleanupTasks: (() => void)[] = [];

  if (mode === 'binaural-theta') {
    // Binaural Beats: Left ear 216Hz, Right ear 226Hz (10Hz Alpha Focus Pulse)
    const merger = ctx.createChannelMerger(2);

    // Left oscillator
    const oscL = ctx.createOscillator();
    const gainL = ctx.createGain();
    oscL.type = 'sine';
    oscL.frequency.setValueAtTime(216, ctx.currentTime);
    gainL.gain.setValueAtTime(0.25, ctx.currentTime);
    oscL.connect(gainL);
    gainL.connect(merger, 0, 0); // Left channel

    // Right oscillator
    const oscR = ctx.createOscillator();
    const gainR = ctx.createGain();
    oscR.type = 'sine';
    oscR.frequency.setValueAtTime(226, ctx.currentTime);
    gainR.gain.setValueAtTime(0.25, ctx.currentTime);
    oscR.connect(gainR);
    gainR.connect(merger, 0, 1); // Right channel

    // Soft pink noise floor for psychoacoustic comfort
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      output[i] = (b0 + b1 + b2) * 0.05;
    }
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(400, ctx.currentTime);
    noiseSource.connect(noiseFilter);
    noiseFilter.connect(masterGain);

    merger.connect(masterGain);
    oscL.start();
    oscR.start();
    noiseSource.start();

    cleanupTasks.push(() => {
      oscL.stop();
      oscR.stop();
      noiseSource.stop();
    });
  } else if (mode === 'olympus-storm') {
    // Synthesized rain (white/pink noise through high-shelf) + randomized low rumble filter
    const bufferSize = ctx.sampleRate * 4;
    const noiseBuffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
    for (let channel = 0; channel < 2; channel++) {
      const output = noiseBuffer.getChannelData(channel);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02; // Brown noise for rain
        lastOut = output[i];
        output[i] *= 2.5;
      }
    }

    const rainSource = ctx.createBufferSource();
    rainSource.buffer = noiseBuffer;
    rainSource.loop = true;

    const rainFilter = ctx.createBiquadFilter();
    rainFilter.type = 'lowpass';
    rainFilter.frequency.setValueAtTime(850, ctx.currentTime);

    // Subtle LFO for thunder wave swells
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.setValueAtTime(0.08, ctx.currentTime); // very slow wave
    lfoGain.gain.setValueAtTime(250, ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(rainFilter.frequency);

    rainSource.connect(rainFilter);
    rainFilter.connect(masterGain);

    rainSource.start();
    lfo.start();

    cleanupTasks.push(() => {
      rainSource.stop();
      lfo.stop();
    });
  } else if (mode === 'executive-brown') {
    // Deep Brown Noise for corporate open-office sound masking
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5;
    }

    const brownSource = ctx.createBufferSource();
    brownSource.buffer = noiseBuffer;
    brownSource.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, ctx.currentTime);

    brownSource.connect(filter);
    filter.connect(masterGain);
    brownSource.start();

    cleanupTasks.push(() => {
      brownSource.stop();
    });
  }

  currentSoundscapeNodes = {
    masterGain,
    stop: () => {
      cleanupTasks.forEach((fn) => fn());
      try {
        masterGain.disconnect();
      } catch (e) {}
    },
  };
}
