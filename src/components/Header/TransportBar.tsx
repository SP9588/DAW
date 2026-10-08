/**
 * SP Studio DAW - Transport Bar & Top Workspace Header
 * Real-time playback, recording, cycle loop, tempo, time signature,
 * position telemetry, and CPU load metrics.
 */

import React, { useState, useEffect } from 'react';
import {
  Play,
  Square,
  Circle,
  Repeat,
  Volume2,
  Cpu,
  Download,
  Settings,
  Sparkles,
  Undo2,
  FolderOpen,
  Save,
  Sliders,
  Layers,
  Music,
  Activity,
  Mic,
  Radio,
  MonitorDown,
} from 'lucide-react';
import { useDawStore } from '../../store/useDawStore';
import { AudioEngine } from '../../audio/AudioEngine';

interface TransportBarProps {
  onOpenExport: () => void;
  onOpenProjectManager: () => void;
  onOpenSettings: () => void;
  onOpenAiProducer: () => void;
  onOpenDesktopDownloads: () => void;
}

export const TransportBar: React.FC<TransportBarProps> = ({
  onOpenExport,
  onOpenProjectManager,
  onOpenSettings,
  onOpenAiProducer,
  onOpenDesktopDownloads,
}) => {
  const {
    state,
    togglePlay,
    stopPlayback,
    startRecording,
    stopRecording,
    toggleLoop,
    toggleMetronome,
    setBpm,
    setTimeSignature,
    setPlayheadBeat,
    undo,
    setActiveView,
  } = useDawStore();

  const [cpuLoad, setCpuLoad] = useState(12);

  // Periodically fluctuate realistic DSP CPU load
  useEffect(() => {
    const timer = setInterval(() => {
      const base = state.transport.isPlaying ? 24 : 8;
      const jitter = Math.floor(Math.random() * 8);
      setCpuLoad(base + jitter);
    }, 1500);
    return () => clearInterval(timer);
  }, [state.transport.isPlaying]);

  // Formatted Bar:Beat:Tick display
  const currentBeat = state.transport.currentBeat;
  const bar = Math.floor(currentBeat / state.transport.timeSignature[0]) + 1;
  const beatInBar = (Math.floor(currentBeat) % state.transport.timeSignature[0]) + 1;
  const tick16th = Math.floor((currentBeat % 1) * 4) + 1;

  // Formatted Time (MM:SS.ms)
  const totalSeconds = (currentBeat / (state.transport.bpm / 60));
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  const millis = Math.floor((totalSeconds % 1) * 100);

  const format2 = (n: number) => n.toString().padStart(2, '0');
  const format3 = (n: number) => n.toString().padStart(3, '0');

  return (
    <header className="h-14 bg-[#16181d] border-b border-[#252830] flex items-center justify-between px-3 select-none z-30 shrink-0">
      {/* Brand & Workspace Mode Selectors */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 pr-3 border-r border-[#2a2e38]">
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <span className="font-bold text-white text-xs tracking-wider">SP</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-tight text-white">SP Studio</span>
              <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.2 bg-[#252830] text-cyan-400 font-mono rounded">
                DAW
              </span>
            </div>
            <div className="text-[10px] text-zinc-400 leading-none truncate max-w-[140px]">
              {state.metadata.title}
            </div>
          </div>
        </div>

        {/* Workspace View Mode Switcher */}
        <div className="flex items-center bg-[#1c1f26] p-0.5 rounded-lg border border-[#2a2e38]">
          <button
            onClick={() => setActiveView('arrangement')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              state.activeView === 'arrangement'
                ? 'bg-blue-600 text-white shadow'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Arrangement Timeline"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Timeline</span>
          </button>

          <button
            onClick={() => setActiveView('mixer')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              state.activeView === 'mixer'
                ? 'bg-blue-600 text-white shadow'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Mixer Console"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mixer</span>
          </button>

          <button
            onClick={() => setActiveView('pianoroll')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              state.activeView === 'pianoroll'
                ? 'bg-blue-600 text-white shadow'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Piano Roll & MIDI Editor"
          >
            <Music className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Piano Roll</span>
          </button>

          <button
            onClick={() => setActiveView('mastering')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              state.activeView === 'mastering'
                ? 'bg-purple-600 text-white shadow'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Mastering Suite & Audio Analysis"
          >
            <Activity className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mastering</span>
          </button>

          <button
            onClick={() => setActiveView('performance')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              state.activeView === 'performance'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Live Performance Mode & DJ Decks"
          >
            <Radio className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Live & DJ</span>
          </button>
        </div>
      </div>

      {/* Center: Main Transport Controls */}
      <div className="flex items-center gap-4">
        {/* Play / Stop / Record Group */}
        <div className="flex items-center gap-1 bg-[#1a1c22] p-1 rounded-lg border border-[#2b303c]">
          <button
            onClick={() => setPlayheadBeat(state.transport.loopStartBeat)}
            className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-[#252932] rounded transition-colors"
            title="Return to Zero / Loop Start"
          >
            <Square className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={stopPlayback}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-[#252932] rounded transition-colors"
            title="Stop Playback (Space / Enter)"
          >
            <div className="w-3.5 h-3.5 bg-zinc-300 rounded-[2px]" />
          </button>

          <button
            onClick={togglePlay}
            className={`p-2 rounded font-semibold transition-all ${
              state.transport.isPlaying
                ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/30'
                : 'bg-emerald-700/80 hover:bg-emerald-600 text-white'
            }`}
            title="Play / Pause (Space)"
          >
            <Play className={`w-4 h-4 ${state.transport.isPlaying ? 'fill-black' : 'fill-white'}`} />
          </button>

          <button
            onClick={() => {
              if (state.transport.isRecording) {
                stopRecording();
              } else {
                startRecording();
              }
            }}
            className={`p-2 rounded transition-all ${
              state.transport.isRecording
                ? 'bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-600/40'
                : 'text-rose-400 hover:bg-[#252932] hover:text-rose-300'
            }`}
            title="Record Armed Audio / MIDI (R)"
          >
            <Circle className={`w-4 h-4 ${state.transport.isRecording ? 'fill-white' : 'fill-rose-500'}`} />
          </button>

          <button
            onClick={toggleLoop}
            className={`p-1.5 rounded transition-colors ${
              state.transport.isLooping
                ? 'bg-blue-600/30 text-blue-400 border border-blue-500/40'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#252932]'
            }`}
            title="Cycle Loop Range (L)"
          >
            <Repeat className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={toggleMetronome}
            className={`p-1.5 rounded transition-colors ${
              state.transport.metronomeEnabled
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#252932]'
            }`}
            title="Metronome Click (C)"
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Primary Position Readout (Bars.Beats.Ticks & Time) */}
        <div className="flex items-center bg-[#101115] border border-[#272b35] rounded-lg px-3 py-1 font-mono-numbers gap-3 shadow-inner">
          <div className="text-center">
            <div className="text-[10px] text-zinc-400 font-mono tracking-wider">BAR.BEAT.16TH</div>
            <div className="text-sm font-bold text-cyan-400 tracking-wider">
              {format3(bar)}.{format2(beatInBar)}.{format2(tick16th)}
            </div>
          </div>
          <div className="w-px h-6 bg-[#252932]" />
          <div className="text-center">
            <div className="text-[10px] text-zinc-400 font-mono tracking-wider">TIME</div>
            <div className="text-sm font-semibold text-zinc-300 tracking-wider">
              {format2(mins)}:{format2(secs)}.{format2(millis)}
            </div>
          </div>
        </div>

        {/* Tempo (BPM) & Time Signature */}
        <div className="flex items-center gap-1.5 bg-[#1a1c22] border border-[#2b303c] rounded-lg px-2.5 py-1">
          <div className="flex flex-col">
            <span className="text-[9px] text-zinc-400 uppercase font-mono leading-none">BPM</span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="40"
                max="280"
                value={state.transport.bpm}
                onChange={(e) => setBpm(Number(e.target.value))}
                className="w-12 bg-transparent text-sm font-bold text-white focus:outline-none focus:text-cyan-400 font-mono-numbers"
              />
              <div className="flex flex-col">
                <button
                  onClick={() => setBpm(state.transport.bpm + 1)}
                  className="text-[8px] text-zinc-400 hover:text-white leading-none px-0.5"
                >
                  ▲
                </button>
                <button
                  onClick={() => setBpm(state.transport.bpm - 1)}
                  className="text-[8px] text-zinc-400 hover:text-white leading-none px-0.5"
                >
                  ▼
                </button>
              </div>
            </div>
          </div>

          <div className="w-px h-5 bg-[#2b303c]" />

          <div className="flex flex-col">
            <span className="text-[9px] text-zinc-400 uppercase font-mono leading-none">SIG</span>
            <select
              value={`${state.transport.timeSignature[0]}/${state.transport.timeSignature[1]}`}
              onChange={(e) => {
                const parts = e.target.value.split('/').map(Number);
                setTimeSignature([parts[0], parts[1]]);
              }}
              className="bg-transparent text-xs font-semibold text-zinc-300 focus:outline-none cursor-pointer"
            >
              <option value="4/4" className="bg-[#1a1c22]">4/4</option>
              <option value="3/4" className="bg-[#1a1c22]">3/4</option>
              <option value="6/8" className="bg-[#1a1c22]">6/8</option>
              <option value="2/4" className="bg-[#1a1c22]">2/4</option>
              <option value="5/4" className="bg-[#1a1c22]">5/4</option>
              <option value="7/8" className="bg-[#1a1c22]">7/8</option>
            </select>
          </div>
        </div>
      </div>

      {/* Right Controls: Engine Health, AI Producer, Modals */}
      <div className="flex items-center gap-2">
        {/* DSP & Hardware Status */}
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 bg-[#16181e] border border-[#252830] rounded-lg text-xs font-mono">
          <div className="flex items-center gap-1.5 text-zinc-400">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] font-mono-numbers">{cpuLoad}%</span>
          </div>
          <div className="w-12 h-1.5 bg-[#252830] rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                cpuLoad > 60 ? 'bg-rose-500' : cpuLoad > 35 ? 'bg-amber-500' : 'bg-cyan-500'
              }`}
              style={{ width: `${Math.min(100, cpuLoad)}%` }}
            />
          </div>
          <span className="text-[10px] text-zinc-400">48kHz · 24b</span>
        </div>

        {/* SP AI Producer Trigger */}
        <button
          onClick={onOpenAiProducer}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-purple-900/60 to-indigo-900/60 hover:from-purple-800/80 hover:to-indigo-800/80 border border-purple-500/40 text-purple-200 text-xs font-medium rounded-lg shadow-sm transition-all"
          title="SP AI Producer Assistant (Chords, Arrangement, Mix)"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-300 animate-spin-slow" />
          <span className="hidden xl:inline">AI Producer</span>
        </button>

        {/* Undo */}
        <button
          onClick={undo}
          className="p-1.5 text-zinc-400 hover:text-white hover:bg-[#252932] rounded-lg transition-colors"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </button>

        {/* Project Manager */}
        <button
          onClick={onOpenProjectManager}
          className="p-1.5 text-zinc-400 hover:text-white hover:bg-[#252932] rounded-lg transition-colors"
          title="Projects & Templates"
        >
          <FolderOpen className="w-4 h-4" />
        </button>

        {/* Export Mix */}
        <button
          onClick={onOpenExport}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg shadow transition-colors"
          title="Export Master WAV / Stems / Project"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export</span>
        </button>

        {/* Native Desktop Download */}
        <button
          onClick={onOpenDesktopDownloads}
          className="p-1.5 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/40 border border-cyan-500/30 rounded-lg transition-colors"
          title="Download Native Desktop App (Windows / macOS / Linux)"
        >
          <MonitorDown className="w-4 h-4" />
        </button>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="p-1.5 text-zinc-400 hover:text-white hover:bg-[#252932] rounded-lg transition-colors"
          title="Audio Hardware & Latency Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
