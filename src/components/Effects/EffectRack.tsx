/**
 * SP Studio DAW - Studio DSP Effect Rack
 * Interactive controls with real-time curve visualizations for EQ,
 * Compressor, Reverb, Delay, and Saturation.
 */

import React from 'react';
import {
  Sliders,
  Activity,
  Waves,
  Repeat,
  Flame,
  Power,
  Plus,
} from 'lucide-react';
import { useDawStore } from '../../store/useDawStore';
import { AudioEngine } from '../../audio/AudioEngine';

export const EffectRack: React.FC = () => {
  const { state, setTracks } = useDawStore();
  const currentTrack = state.tracks.find((t) => t.id === state.selectedTrackId) || state.tracks[0];

  const updateFxParam = (fxId: string, paramKey: string, val: any) => {
    setTracks((tracks) =>
      tracks.map((t) =>
        t.id === currentTrack.id
          ? {
              ...t,
              effects: t.effects.map((fx) =>
                fx.id === fxId ? { ...fx, params: { ...fx.params, [paramKey]: val } } : fx
              ),
            }
          : t
      )
    );

    // Apply live to AudioEngine
    const targetFx = currentTrack.effects.find((f) => f.id === fxId);
    if (targetFx && targetFx.type === 'eq') {
      const p = { ...targetFx.params, [paramKey]: val };
      AudioEngine.getInstance().updateTrackEQ(
        currentTrack.id,
        p.lowGain || 0,
        p.midGain || 0,
        p.highGain || 0,
        p.midFreq || 1000
      );
    }
  };

  const toggleFxEnable = (fxId: string) => {
    setTracks((tracks) =>
      tracks.map((t) =>
        t.id === currentTrack.id
          ? {
              ...t,
              effects: t.effects.map((fx) =>
                fx.id === fxId ? { ...fx, enabled: !fx.enabled } : fx
              ),
            }
          : t
      )
    );
  };

  return (
    <div className="h-full bg-[#131519] border-t border-[#232732] flex flex-col select-none text-xs overflow-hidden">
      {/* Header */}
      <div className="h-8 bg-[#181a20] border-b border-[#242832] px-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Sliders className="w-3.5 h-3.5 text-purple-400" />
          <span className="font-bold text-zinc-200 uppercase tracking-wide">
            TRACK DSP INSERT RACK
          </span>
          <span className="text-[10px] text-zinc-400 font-mono">
            Target: {currentTrack.name}
          </span>
        </div>
      </div>

      {/* Effects list */}
      <div className="flex-1 overflow-x-auto p-3 flex gap-3 bg-[#0e1014]">
        {currentTrack.effects.map((fx) => {
          return (
            <div
              key={fx.id}
              className={`w-72 bg-[#171922] border rounded-lg p-3 flex flex-col justify-between shrink-0 transition-all ${
                fx.enabled ? 'border-[#303646]' : 'border-[#22252e] opacity-60'
              }`}
            >
              {/* FX Header */}
              <div className="flex items-center justify-between border-b border-[#262a38] pb-1.5 mb-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleFxEnable(fx.id)}
                    className={`p-1 rounded-full ${
                      fx.enabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-500'
                    }`}
                    title="Bypass / Enable"
                  >
                    <Power className="w-3 h-3" />
                  </button>
                  <span className="font-bold text-zinc-200">{fx.name}</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 bg-[#202430] text-purple-300 font-mono uppercase rounded">
                  {fx.type}
                </span>
              </div>

              {/* 4-Band Parametric EQ UI */}
              {fx.type === 'eq' && (
                <div className="space-y-3">
                  {/* Visual Filter Curve */}
                  <div className="h-16 bg-[#111318] border border-[#262a38] rounded p-1 flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 100 40">
                      <path
                        d={`M 0 20 Q 25 ${20 - (fx.params.lowGain || 0) * 1.5} 50 ${
                          20 - (fx.params.midGain || 0) * 1.5
                        } T 100 ${20 - (fx.params.highGain || 0) * 1.5}`}
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <span className="text-[9px] text-zinc-400">LOW</span>
                      <input
                        type="range"
                        min="-12"
                        max="12"
                        value={fx.params.lowGain || 0}
                        onChange={(e) => updateFxParam(fx.id, 'lowGain', parseFloat(e.target.value))}
                        className="w-full h-1 bg-[#282d38] accent-cyan-400 mt-1 cursor-pointer"
                      />
                      <span className="text-[9px] font-mono text-cyan-300">
                        {fx.params.lowGain || 0} dB
                      </span>
                    </div>

                    <div>
                      <span className="text-[9px] text-zinc-400">MID</span>
                      <input
                        type="range"
                        min="-12"
                        max="12"
                        value={fx.params.midGain || 0}
                        onChange={(e) => updateFxParam(fx.id, 'midGain', parseFloat(e.target.value))}
                        className="w-full h-1 bg-[#282d38] accent-cyan-400 mt-1 cursor-pointer"
                      />
                      <span className="text-[9px] font-mono text-cyan-300">
                        {fx.params.midGain || 0} dB
                      </span>
                    </div>

                    <div>
                      <span className="text-[9px] text-zinc-400">HIGH</span>
                      <input
                        type="range"
                        min="-12"
                        max="12"
                        value={fx.params.highGain || 0}
                        onChange={(e) => updateFxParam(fx.id, 'highGain', parseFloat(e.target.value))}
                        className="w-full h-1 bg-[#282d38] accent-cyan-400 mt-1 cursor-pointer"
                      />
                      <span className="text-[9px] font-mono text-cyan-300">
                        {fx.params.highGain || 0} dB
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Compressor UI */}
              {fx.type === 'compressor' && (
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-[10px] text-zinc-400">
                      <span>Threshold</span>
                      <span className="font-mono text-purple-400">{fx.params.threshold || -16} dB</span>
                    </div>
                    <input
                      type="range"
                      min="-40"
                      max="0"
                      value={fx.params.threshold || -16}
                      onChange={(e) => updateFxParam(fx.id, 'threshold', parseFloat(e.target.value))}
                      className="w-full h-1 bg-[#282d38] accent-purple-400 mt-1 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-zinc-400">
                      <span>Ratio</span>
                      <span className="font-mono text-purple-400">{fx.params.ratio || 4}:1</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="12"
                      value={fx.params.ratio || 4}
                      onChange={(e) => updateFxParam(fx.id, 'ratio', parseFloat(e.target.value))}
                      className="w-full h-1 bg-[#282d38] accent-purple-400 mt-1 cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* Reverb UI */}
              {fx.type === 'reverb' && (
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-[10px] text-zinc-400">
                      <span>Decay Time</span>
                      <span className="font-mono text-emerald-400">{fx.params.decayTime || 2.2}s</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="6"
                      step="0.1"
                      value={fx.params.decayTime || 2.2}
                      onChange={(e) => updateFxParam(fx.id, 'decayTime', parseFloat(e.target.value))}
                      className="w-full h-1 bg-[#282d38] accent-emerald-400 mt-1 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-zinc-400">
                      <span>Wet / Dry</span>
                      <span className="font-mono text-emerald-400">
                        {Math.round((fx.params.wetDry || 0.2) * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={fx.params.wetDry || 0.2}
                      onChange={(e) => updateFxParam(fx.id, 'wetDry', parseFloat(e.target.value))}
                      className="w-full h-1 bg-[#282d38] accent-emerald-400 mt-1 cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* Delay UI */}
              {fx.type === 'delay' && (
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-[10px] text-zinc-400">
                      <span>Delay Time</span>
                      <span className="font-mono text-blue-400">{fx.params.delayTime || 0.35}s</span>
                    </div>
                    <input
                      type="range"
                      min="0.05"
                      max="1.0"
                      step="0.05"
                      value={fx.params.delayTime || 0.35}
                      onChange={(e) => updateFxParam(fx.id, 'delayTime', parseFloat(e.target.value))}
                      className="w-full h-1 bg-[#282d38] accent-blue-400 mt-1 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-zinc-400">
                      <span>Feedback</span>
                      <span className="font-mono text-blue-400">
                        {Math.round((fx.params.feedback || 0.4) * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="0.9"
                      step="0.05"
                      value={fx.params.feedback || 0.4}
                      onChange={(e) => updateFxParam(fx.id, 'feedback', parseFloat(e.target.value))}
                      className="w-full h-1 bg-[#282d38] accent-blue-400 mt-1 cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* Saturation UI */}
              {fx.type === 'saturation' && (
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-[10px] text-zinc-400">
                      <span>Tape Drive</span>
                      <span className="font-mono text-amber-400">{fx.params.drive || 4}x</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={fx.params.drive || 4}
                      onChange={(e) => updateFxParam(fx.id, 'drive', parseFloat(e.target.value))}
                      className="w-full h-1 bg-[#282d38] accent-amber-400 mt-1 cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
