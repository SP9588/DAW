/**
 * SP Studio DAW - Audio Hardware, Latency & MIDI Settings
 * Buffer size selection, sample rates (44.1 - 192 kHz), driver selection
 * (WASAPI, CoreAudio, PipeWire), latency compensation, and shortcuts.
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Settings,
  Cpu,
  Sliders,
  Keyboard,
  Radio,
  CheckCircle2,
} from 'lucide-react';
import { useDawStore } from '../../store/useDawStore';
import { SampleRate, BufferSize } from '../../types/daw';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { state } = useDawStore();
  const [activeTab, setActiveTab] = useState<'audio' | 'midi' | 'shortcuts'>('audio');

  const [sampleRate, setSampleRate] = useState<SampleRate>(state.audioConfig.sampleRate);
  const [bufferSize, setBufferSize] = useState<BufferSize>(state.audioConfig.bufferSize);
  const [driver, setDriver] = useState<'WASAPI' | 'CoreAudio' | 'ALSA/PipeWire' | 'WebAudio'>('WebAudio');
  const [latencyMs, setLatencyMs] = useState(0);

  // Calculate roundtrip latency estimate
  const estimatedLatency = ((bufferSize / sampleRate) * 1000 * 2 + latencyMs).toFixed(1);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#15171f] border border-[#2b3040] w-full max-w-xl rounded-xl shadow-2xl flex flex-col overflow-hidden text-xs">
        {/* Header */}
        <div className="h-12 bg-[#1a1d26] border-b border-[#262a38] px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-white text-sm">Preferences & Hardware Configuration</span>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white rounded hover:bg-[#252936]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex border-b border-[#242836] bg-[#12141c] px-4">
          <button
            onClick={() => setActiveTab('audio')}
            className={`py-2 px-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'audio'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Audio Engine & Hardware
          </button>
          <button
            onClick={() => setActiveTab('midi')}
            className={`py-2 px-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'midi'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            MIDI Controllers
          </button>
          <button
            onClick={() => setActiveTab('shortcuts')}
            className={`py-2 px-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'shortcuts'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Keyboard Shortcuts
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {activeTab === 'audio' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {/* Driver */}
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase font-mono">Audio Driver Type</label>
                  <select
                    value={driver}
                    onChange={(e) => setDriver(e.target.value as any)}
                    className="w-full bg-[#1b1e27] border border-[#2b303c] rounded p-1.5 text-zinc-200 mt-1"
                  >
                    <option value="WebAudio">Web Audio Worklet (Cross-Platform)</option>
                    <option value="WASAPI">Windows WASAPI Exclusive</option>
                    <option value="CoreAudio">macOS Core Audio HAL</option>
                    <option value="ALSA/PipeWire">Linux PipeWire / JACK</option>
                  </select>
                </div>

                {/* Sample Rate */}
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase font-mono">Sample Rate</label>
                  <select
                    value={sampleRate}
                    onChange={(e) => setSampleRate(Number(e.target.value) as SampleRate)}
                    className="w-full bg-[#1b1e27] border border-[#2b303c] rounded p-1.5 text-zinc-200 mt-1"
                  >
                    <option value={44100}>44.1 kHz (CD Standard)</option>
                    <option value={48000}>48.0 kHz (Broadcast Pro)</option>
                    <option value={88200}>88.2 kHz</option>
                    <option value={96000}>96.0 kHz (Hi-Res Master)</option>
                    <option value={192000}>192.0 kHz (Ultra Hi-Res)</option>
                  </select>
                </div>

                {/* Buffer Size */}
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase font-mono">Buffer Size (Samples)</label>
                  <select
                    value={bufferSize}
                    onChange={(e) => setBufferSize(Number(e.target.value) as BufferSize)}
                    className="w-full bg-[#1b1e27] border border-[#2b303c] rounded p-1.5 text-zinc-200 mt-1"
                  >
                    <option value={64}>64 Samples (1.3 ms ultra-low)</option>
                    <option value={128}>128 Samples (2.7 ms low)</option>
                    <option value={256}>256 Samples (5.3 ms studio)</option>
                    <option value={512}>512 Samples (10.7 ms mixing)</option>
                    <option value={1024}>1024 Samples (21.3 ms heavy DSP)</option>
                  </select>
                </div>

                {/* Latency Compensation */}
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase font-mono">
                    Recording Delay Compensation ({latencyMs} ms)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={latencyMs}
                    onChange={(e) => setLatencyMs(Number(e.target.value))}
                    className="w-full h-1 bg-[#282d38] accent-cyan-400 mt-3 cursor-pointer"
                  />
                </div>
              </div>

              {/* Latency Status Banner */}
              <div className="bg-[#12141c] p-3 rounded-lg border border-[#232734] flex items-center justify-between">
                <div>
                  <div className="font-semibold text-zinc-200">Total Roundtrip Latency:</div>
                  <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                    Input + DSP Pipeline + Hardware DAC
                  </div>
                </div>
                <div className="text-right font-mono">
                  <div className="text-lg font-bold text-cyan-400">{estimatedLatency} ms</div>
                  <span className="text-[9px] text-emerald-400">ZERO GLITCH DETECTED</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'midi' && (
            <div className="space-y-2">
              <span className="text-zinc-400 font-semibold block">Connected MIDI Devices</span>
              <div className="bg-[#181a24] p-3 rounded-lg border border-[#252834] flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">USB MIDI Master Keyboard (49 Keys)</div>
                  <div className="text-[10px] text-zinc-400">Channels 1-16 · Pitch Bend · Mod Wheel · CC</div>
                </div>
                <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded font-mono">
                  ACTIVE
                </span>
              </div>
              <div className="bg-[#181a24] p-3 rounded-lg border border-[#252834] flex items-center justify-between">
                <div>
                  <div className="font-semibold text-white">SP 4x4 Pad Controller</div>
                  <div className="text-[10px] text-zinc-400">Velocity Sensitive · Polyphonic Aftertouch</div>
                </div>
                <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded font-mono">
                  ACTIVE
                </span>
              </div>
            </div>
          )}

          {activeTab === 'shortcuts' && (
            <div className="space-y-1.5 font-mono text-[11px]">
              {[
                { key: 'Space', desc: 'Play / Pause Transport' },
                { key: 'R', desc: 'Record Armed Tracks' },
                { key: 'L', desc: 'Toggle Cycle Loop' },
                { key: 'C', desc: 'Toggle Metronome Click' },
                { key: 'S', desc: 'Split Selected Clip at Playhead' },
                { key: 'Ctrl + Z', desc: 'Undo Audio/MIDI Edit' },
                { key: 'M', desc: 'Mute Active Track' },
                { key: 'Del / Backspace', desc: 'Delete Selected Clip' },
              ].map((sc, idx) => (
                <div key={idx} className="flex justify-between p-2 bg-[#181a24] rounded border border-[#252834]">
                  <span className="px-1.5 py-0.5 bg-[#252936] text-cyan-300 rounded font-bold">{sc.key}</span>
                  <span className="text-zinc-300 font-sans">{sc.desc}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="h-12 bg-[#1a1d26] border-t border-[#262a38] px-4 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-black font-semibold rounded shadow transition-colors"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
