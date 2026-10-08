/**
 * SP Studio DAW - Instrument Rack & Drum Sequencer
 * Interactive controls for PolySynth, FM Rhodes, 808 Sub, and 16-step drum sequencer.
 */

import React from 'react';
import {
  Disc,
  Music,
  Sliders,
  Volume2,
  Zap,
  Play,
  RotateCcw,
} from 'lucide-react';
import { useDawStore } from '../../store/useDawStore';
import { AudioEngine } from '../../audio/AudioEngine';

export const InstrumentRack: React.FC = () => {
  const { state, setTracks } = useDawStore();
  const currentTrack = state.tracks.find((t) => t.id === state.selectedTrackId) || state.tracks[0];
  const instrument = currentTrack?.instrument;

  const auditionDrum = (drumName: string) => {
    const engine = AudioEngine.getInstance();
    engine.init();
    engine.playDrum(drumName, 115);
  };

  const toggleDrumStep = (soundIdx: number, stepIdx: number) => {
    if (!instrument || instrument.type !== 'drummachine' || !instrument.params.pattern) return;

    const newPattern = instrument.params.pattern.map((row, rIdx) =>
      rIdx === soundIdx
        ? row.map((cell, cIdx) => (cIdx === stepIdx ? !cell : cell))
        : [...row]
    );

    setTracks((tracks) =>
      tracks.map((t) =>
        t.id === currentTrack.id && t.instrument
          ? {
              ...t,
              instrument: {
                ...t.instrument,
                params: { ...t.instrument.params, pattern: newPattern },
              },
            }
          : t
      )
    );
  };

  const updateParam = (key: string, value: any) => {
    if (!instrument) return;
    setTracks((tracks) =>
      tracks.map((t) =>
        t.id === currentTrack.id && t.instrument
          ? {
              ...t,
              instrument: {
                ...t.instrument,
                params: { ...t.instrument.params, [key]: value },
              },
            }
          : t
      )
    );
  };

  const drumSounds = ['Kick 808', 'Snare Punch', 'Analog Clap', 'Closed Hat', 'Open Hat', 'Tom Low', 'Crash Cymbal'];
  const drumKeys = ['kick', 'snare', 'clap', 'hihat', 'openhat', 'tom', 'crash'];

  return (
    <div className="h-full bg-[#131519] border-t border-[#232732] flex flex-col select-none text-xs overflow-hidden">
      {/* Header */}
      <div className="h-8 bg-[#181a20] border-b border-[#242832] px-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Music className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-bold text-zinc-200 uppercase tracking-wide">
            {instrument ? instrument.name : 'NO INSTRUMENT SELECTED'}
          </span>
          {instrument && (
            <span className="text-[10px] px-1.5 py-0.5 bg-[#252834] text-cyan-400 rounded font-mono">
              {instrument.presetName}
            </span>
          )}
        </div>
        <div className="text-[10px] text-zinc-400 font-mono">
          Track: {currentTrack.name}
        </div>
      </div>

      {/* Main Rack Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-[#0e1014]">
        {/* DRUM MACHINE 16-STEP SEQUENCER */}
        {instrument?.type === 'drummachine' && instrument.params.pattern && (
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-[#181a22] p-2 rounded-lg border border-[#272b38]">
              <div className="flex items-center gap-3">
                <Disc className="w-5 h-5 text-rose-500 animate-spin-slow" />
                <div>
                  <div className="font-bold text-sm text-white">SP-808 Rhythm Pattern Matrix</div>
                  <div className="text-[10px] text-zinc-400">16 Steps · Velocity Linked · Auto-Quantized</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-zinc-400">Swing: {instrument.params.swing}%</span>
              </div>
            </div>

            {/* 16-Step Drum Grid */}
            <div className="space-y-1.5 bg-[#161820] p-3 rounded-lg border border-[#272b38]">
              {drumSounds.map((sound, sIdx) => {
                const row = instrument.params.pattern![sIdx] || [];
                return (
                  <div key={sIdx} className="flex items-center gap-2">
                    {/* Audition Drum Sound Button */}
                    <button
                      onClick={() => auditionDrum(drumKeys[sIdx])}
                      className="w-24 px-2 py-1 bg-[#20242e] hover:bg-[#2c3240] text-zinc-200 rounded text-left truncate font-mono text-[10px] flex items-center justify-between group transition-colors"
                      title="Audition Trigger"
                    >
                      <span className="truncate">{sound}</span>
                      <Play className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 fill-current text-rose-400" />
                    </button>

                    {/* 16 Steps */}
                    <div className="flex-1 grid grid-cols-16 gap-1">
                      {Array.from({ length: 16 }).map((_, stepIdx) => {
                        const isActive = row[stepIdx];
                        const isBeatStart = stepIdx % 4 === 0;

                        return (
                          <button
                            key={stepIdx}
                            onClick={() => toggleDrumStep(sIdx, stepIdx)}
                            className={`h-7 rounded-sm border transition-all ${
                              isActive
                                ? 'bg-rose-500 border-rose-300 shadow-md shadow-rose-500/30'
                                : isBeatStart
                                ? 'bg-[#252936] border-[#363c4c] hover:bg-[#303646]'
                                : 'bg-[#1b1e27] border-[#252934] hover:bg-[#252936]'
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* POLYSYNTH CONTROLS */}
        {instrument?.type === 'polysynth' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Oscillators */}
            <div className="bg-[#181a22] border border-[#272b38] rounded-lg p-3 space-y-3">
              <div className="font-bold text-zinc-300 text-xs border-b border-[#272b38] pb-1">
                DUAL OSCILLATORS
              </div>
              <div className="space-y-2">
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase">OSC 1 Wave</label>
                  <select
                    value={instrument.params.osc1Wave || 'sawtooth'}
                    onChange={(e) => updateParam('osc1Wave', e.target.value)}
                    className="w-full bg-[#12141a] border border-[#2b303c] rounded p-1 text-zinc-200 mt-0.5"
                  >
                    <option value="sawtooth">Sawtooth (Analog Warm)</option>
                    <option value="square">Square (Pulse Lead)</option>
                    <option value="sine">Pure Sine</option>
                    <option value="triangle">Triangle</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase">OSC 2 Detune (Cents)</label>
                  <input
                    type="range"
                    min="0"
                    max="25"
                    value={instrument.params.osc2Detune ?? 8}
                    onChange={(e) => updateParam('osc2Detune', parseInt(e.target.value))}
                    className="w-full h-1 bg-[#282d38] accent-cyan-400 mt-1 cursor-pointer"
                  />
                  <div className="text-[10px] text-cyan-400 font-mono text-right">
                    {instrument.params.osc2Detune ?? 8} cents
                  </div>
                </div>
              </div>
            </div>

            {/* Moog Filter */}
            <div className="bg-[#181a22] border border-[#272b38] rounded-lg p-3 space-y-3">
              <div className="font-bold text-zinc-300 text-xs border-b border-[#272b38] pb-1">
                24dB MOOG LADDER FILTER
              </div>
              <div className="space-y-2">
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase">Cutoff Frequency (Hz)</label>
                  <input
                    type="range"
                    min="100"
                    max="16000"
                    value={instrument.params.filterCutoff ?? 3800}
                    onChange={(e) => updateParam('filterCutoff', parseInt(e.target.value))}
                    className="w-full h-1 bg-[#282d38] accent-cyan-400 mt-1 cursor-pointer"
                  />
                  <div className="text-[10px] text-cyan-400 font-mono text-right">
                    {instrument.params.filterCutoff ?? 3800} Hz
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase">Resonance (Q)</label>
                  <input
                    type="range"
                    min="0.5"
                    max="15"
                    step="0.5"
                    value={instrument.params.filterResonance ?? 3.5}
                    onChange={(e) => updateParam('filterResonance', parseFloat(e.target.value))}
                    className="w-full h-1 bg-[#282d38] accent-cyan-400 mt-1 cursor-pointer"
                  />
                  <div className="text-[10px] text-cyan-400 font-mono text-right">
                    Q: {instrument.params.filterResonance ?? 3.5}
                  </div>
                </div>
              </div>
            </div>

            {/* ADSR Envelope */}
            <div className="bg-[#181a22] border border-[#272b38] rounded-lg p-3 space-y-3">
              <div className="font-bold text-zinc-300 text-xs border-b border-[#272b38] pb-1">
                AMPLIFIER ENVELOPE (ADSR)
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div>
                  <span className="text-[9px] text-zinc-400 uppercase">A</span>
                  <input
                    type="range"
                    min="0.005"
                    max="1.5"
                    step="0.01"
                    value={instrument.params.attack ?? 0.04}
                    onChange={(e) => updateParam('attack', parseFloat(e.target.value))}
                    className="vertical-fader h-20 my-1"
                  />
                  <span className="text-[8px] font-mono text-zinc-400">{instrument.params.attack ?? 0.04}s</span>
                </div>
                <div>
                  <span className="text-[9px] text-zinc-400 uppercase">D</span>
                  <input
                    type="range"
                    min="0.05"
                    max="2.0"
                    step="0.05"
                    value={instrument.params.decay ?? 0.3}
                    onChange={(e) => updateParam('decay', parseFloat(e.target.value))}
                    className="vertical-fader h-20 my-1"
                  />
                  <span className="text-[8px] font-mono text-zinc-400">{instrument.params.decay ?? 0.3}s</span>
                </div>
                <div>
                  <span className="text-[9px] text-zinc-400 uppercase">S</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={instrument.params.sustain ?? 0.5}
                    onChange={(e) => updateParam('sustain', parseFloat(e.target.value))}
                    className="vertical-fader h-20 my-1"
                  />
                  <span className="text-[8px] font-mono text-zinc-400">{instrument.params.sustain ?? 0.5}</span>
                </div>
                <div>
                  <span className="text-[9px] text-zinc-400 uppercase">R</span>
                  <input
                    type="range"
                    min="0.05"
                    max="3.0"
                    step="0.05"
                    value={instrument.params.release ?? 0.4}
                    onChange={(e) => updateParam('release', parseFloat(e.target.value))}
                    className="vertical-fader h-20 my-1"
                  />
                  <span className="text-[8px] font-mono text-zinc-400">{instrument.params.release ?? 0.4}s</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FM ELECTRIC PIANO OR 808 SUB */}
        {instrument?.type !== 'drummachine' && instrument?.type !== 'polysynth' && (
          <div className="bg-[#181a22] border border-[#272b38] rounded-lg p-4 max-w-lg mx-auto text-center space-y-3">
            <div className="font-bold text-white text-base">{instrument?.name}</div>
            <div className="text-zinc-400 text-xs">
              Algorithmic synthesis engine active. Modulate harmonics and play notes via keyboard or timeline.
            </div>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => {
                  const engine = AudioEngine.getInstance();
                  engine.init();
                  if (instrument?.type === 'sub808') engine.play808Bass(36, 120, 0.8);
                  else if (instrument?.type === 'fmpiano') engine.playFmPiano(60, 100, 0.8);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium shadow flex items-center gap-1.5"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Test Audition Note</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
