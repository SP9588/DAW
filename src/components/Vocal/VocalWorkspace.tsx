/**
 * SP Studio DAW - Vocal Production Suite
 * Pitch correction display, multi-take comping lanes, de-esser,
 * optical leveling compressor, and studio vocal chain presets.
 */

import React, { useState } from 'react';
import {
  Mic,
  Sliders,
  Sparkles,
  Waves,
  Volume2,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { useDawStore } from '../../store/useDawStore';

export const VocalWorkspace: React.FC = () => {
  const { state } = useDawStore();
  const [selectedPreset, setSelectedPreset] = useState('modern_pop');
  const [pitchCorrectionAmount, setPitchCorrectionAmount] = useState(65);
  const [deEsserThreshold, setDeEsserThreshold] = useState(-18);

  const vocalPresets = [
    { id: 'modern_pop', name: 'Modern Pop Air', desc: 'Bright presence shelf, optical 2:1 leveling, wide plate reverb' },
    { id: 'warm_rnb', name: 'Warm R&B Velvet', desc: 'Tube saturation, gentle de-ess, lush stereo chorus doubling' },
    { id: 'trap_rap', name: 'Aggressive Trap Rap', desc: 'Hard pitch snap, heavy VCA compression, punchy saturation' },
    { id: 'podcast_broadcast', name: 'Clean Broadcast Podcast', desc: 'Tight noise gate, high-pass 80 Hz, broadcast loudness leveler' },
  ];

  return (
    <div className="flex-1 bg-[#101216] flex flex-col p-4 select-none overflow-y-auto text-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between bg-[#161820] p-3 rounded-lg border border-[#252834]">
        <div className="flex items-center gap-3">
          <Mic className="w-5 h-5 text-amber-400" />
          <div>
            <div className="font-bold text-sm text-white">Vocal Production Suite & Pitch Tuner</div>
            <div className="text-[10px] text-zinc-400">
              Automatic Pitch Alignment · Multi-Take Comping · High-Frequency De-Esser
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-zinc-400">Vocal Chain Preset:</span>
          <select
            value={selectedPreset}
            onChange={(e) => setSelectedPreset(e.target.value)}
            className="bg-[#1e222c] border border-[#2c3242] rounded px-2 py-1 text-amber-300 font-medium focus:outline-none"
          >
            {vocalPresets.map((vp) => (
              <option key={vp.id} value={vp.id}>
                {vp.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Vocal Visualizer & Tuning Display */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Real-time Pitch Correction Display */}
        <div className="lg:col-span-2 bg-[#14161e] border border-[#262a38] rounded-lg p-3 space-y-2">
          <div className="flex justify-between items-center text-[11px] font-semibold text-zinc-300">
            <span>REAL-TIME PITCH DETECTOR & CHROMATIC TARGET</span>
            <span className="text-[10px] text-amber-400 font-mono">Key Lock: C Minor</span>
          </div>

          <div className="h-44 bg-[#0d0e13] border border-[#1f222d] rounded-md p-3 flex flex-col justify-between relative overflow-hidden">
            {/* Tuning Note Center Line */}
            <div className="flex justify-between items-center font-mono text-zinc-500 text-[10px]">
              <span>C3</span>
              <div className="flex-1 border-b border-zinc-800 mx-2" />
              <span>130.8 Hz</span>
            </div>
            <div className="flex justify-between items-center font-mono text-amber-400 font-bold text-xs bg-amber-500/10 px-2 py-1 rounded border border-amber-500/30">
              <span>Eb3 (Target Note)</span>
              <div className="flex-1 border-b border-amber-400/30 mx-2" />
              <span>155.6 Hz · Deviation: 0 cents</span>
            </div>
            <div className="flex justify-between items-center font-mono text-zinc-500 text-[10px]">
              <span>F3</span>
              <div className="flex-1 border-b border-zinc-800 mx-2" />
              <span>174.6 Hz</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-zinc-400 pt-1">
            <span>Correction Speed / Retune: <strong>Fast (Auto-Snap)</strong></span>
            <span>Scale Quantize: <strong>100%</strong></span>
          </div>
        </div>

        {/* Vocal Processors & De-Esser */}
        <div className="bg-[#14161e] border border-[#262a38] rounded-lg p-3 space-y-3">
          <div className="font-semibold text-zinc-300 text-[11px] border-b border-[#262a38] pb-1">
            VOCAL DYNAMICS & AIR
          </div>

          {/* Pitch Retune Amount */}
          <div className="bg-[#0e1015] p-2.5 rounded border border-[#20232e] space-y-1">
            <div className="flex justify-between text-[10px] text-zinc-400">
              <span>Pitch Correction Amount:</span>
              <span className="font-bold text-amber-400 font-mono">{pitchCorrectionAmount}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={pitchCorrectionAmount}
              onChange={(e) => setPitchCorrectionAmount(Number(e.target.value))}
              className="w-full h-1 bg-[#282d38] accent-amber-400 cursor-pointer"
            />
          </div>

          {/* De-Esser */}
          <div className="bg-[#0e1015] p-2.5 rounded border border-[#20232e] space-y-1">
            <div className="flex justify-between text-[10px] text-zinc-400">
              <span>Sibilance De-Esser:</span>
              <span className="font-bold text-amber-400 font-mono">{deEsserThreshold} dB</span>
            </div>
            <input
              type="range"
              min="-36"
              max="0"
              value={deEsserThreshold}
              onChange={(e) => setDeEsserThreshold(Number(e.target.value))}
              className="w-full h-1 bg-[#282d38] accent-amber-400 cursor-pointer"
            />
            <div className="text-[9px] text-zinc-500 font-mono">Detection Center: 6.8 kHz</div>
          </div>
        </div>
      </div>
    </div>
  );
};
