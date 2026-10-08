/**
 * SP Studio DAW - Left Sidebar & Asset Browser
 * High-speed search and preview for Instruments, Effects, Samples,
 * Project Templates, and Plugin manifests.
 */

import React, { useState } from 'react';
import {
  Folder,
  Sliders,
  Music2,
  Disc,
  Play,
  Volume2,
  Plus,
  Search,
  ChevronRight,
  Layers,
  Sparkles,
  Tag,
  Radio,
  FileCode,
} from 'lucide-react';
import { useDawStore } from '../../store/useDawStore';
import { AudioEngine } from '../../audio/AudioEngine';

export const Browser: React.FC = () => {
  const { state, setSidebarTab, addTrack, setBottomTab } = useDawStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [previewingSample, setPreviewingSample] = useState<string | null>(null);

  const previewSound = (type: string) => {
    const engine = AudioEngine.getInstance();
    engine.init();
    setPreviewingSample(type);

    if (type.startsWith('drum_')) {
      const drumName = type.replace('drum_', '');
      engine.playDrum(drumName, 115);
    } else if (type.startsWith('synth_')) {
      engine.playPolySynth(60, 100, 0.4);
    } else if (type.startsWith('bass_')) {
      engine.play808Bass(36, 120, 0.8);
    } else if (type.startsWith('keys_')) {
      engine.playFmPiano(64, 90, 0.6);
    }

    setTimeout(() => setPreviewingSample(null), 400);
  };

  // Sample library items
  const samplePacks = [
    { id: 'drum_kick', name: 'SP-808 Tight Sub Kick.wav', category: 'Drums', bpm: 124, key: 'C' },
    { id: 'drum_snare', name: 'Punchy Studio Snare 01.wav', category: 'Drums', bpm: 124, key: '-' },
    { id: 'drum_clap', name: 'Layered Analog Clap.wav', category: 'Drums', bpm: 124, key: '-' },
    { id: 'drum_hihat', name: 'Crisp Closed Hat 909.wav', category: 'Drums', bpm: 124, key: '-' },
    { id: 'drum_openhat', name: 'Open Hi-Hat Sizzle.wav', category: 'Drums', bpm: 124, key: '-' },
    { id: 'drum_crash', name: 'Dark Studio Crash 18in.wav', category: 'Drums', bpm: 124, key: '-' },
    { id: 'drum_tom', name: 'Acoustic Punch Low Tom.wav', category: 'Drums', bpm: 124, key: 'F' },
    { id: 'bass_sub', name: '808 Glide Heavy Sub.wav', category: 'Bass', bpm: 124, key: 'C' },
    { id: 'synth_lead', name: 'Jupiter Saw Lead Strum.wav', category: 'Synths', bpm: 124, key: 'G' },
    { id: 'keys_rhodes', name: 'Neo-Soul Electric Chime.wav', category: 'Keys', bpm: 124, key: 'E' },
  ];

  const filteredSamples = samplePacks.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside className="w-64 bg-[#14161a] border-r border-[#22262e] flex flex-col h-full select-none text-xs shrink-0">
      {/* Category Tabs */}
      <div className="flex items-center border-b border-[#22262e] bg-[#181a20] px-1 py-1">
        <button
          onClick={() => setSidebarTab('browser')}
          className={`flex-1 py-1.5 text-center font-medium rounded-md transition-colors ${
            state.sidebarTab === 'browser'
              ? 'bg-[#252830] text-cyan-400 font-semibold shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Samples
        </button>
        <button
          onClick={() => setSidebarTab('plugins')}
          className={`flex-1 py-1.5 text-center font-medium rounded-md transition-colors ${
            state.sidebarTab === 'plugins'
              ? 'bg-[#252830] text-cyan-400 font-semibold shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Devices
        </button>
        <button
          onClick={() => setSidebarTab('templates')}
          className={`flex-1 py-1.5 text-center font-medium rounded-md transition-colors ${
            state.sidebarTab === 'templates'
              ? 'bg-[#252830] text-cyan-400 font-semibold shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          Templates
        </button>
      </div>

      {/* Search Input */}
      <div className="p-2 border-b border-[#22262e]">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search audio, kits, plugins..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1b1e25] border border-[#2b303c] rounded-md pl-8 pr-2.5 py-1 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-2 space-y-3">
        {state.sidebarTab === 'browser' && (
          <div>
            <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2 px-1">
              <span>Factory Sample Bank</span>
              <span className="text-[10px] text-cyan-400 font-mono">10 SAMPLES</span>
            </div>

            <div className="space-y-1">
              {filteredSamples.map((sample) => (
                <div
                  key={sample.id}
                  className="flex items-center justify-between p-1.5 rounded-md hover:bg-[#1f222a] border border-transparent hover:border-[#2e3340] group transition-all"
                >
                  <div className="flex items-center gap-2 truncate">
                    <button
                      onClick={() => previewSound(sample.id)}
                      className={`p-1 rounded transition-colors ${
                        previewingSample === sample.id
                          ? 'bg-cyan-500 text-black'
                          : 'bg-[#262a34] text-zinc-300 hover:text-white'
                      }`}
                      title="Audition Sample"
                    >
                      <Play className="w-3 h-3 fill-current" />
                    </button>
                    <div className="truncate">
                      <div className="text-zinc-200 truncate font-mono text-[11px]">{sample.name}</div>
                      <div className="text-[10px] text-zinc-400 flex items-center gap-1.5">
                        <span>{sample.category}</span>
                        <span>·</span>
                        <span>{sample.key}</span>
                        <span>·</span>
                        <span>{sample.bpm} BPM</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      previewSound(sample.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-cyan-400 transition-opacity"
                    title="Preview Sound"
                  >
                    <Volume2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {state.sidebarTab === 'plugins' && (
          <div className="space-y-4">
            {/* Built-in Instruments */}
            <div>
              <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2 px-1">
                Built-in Instruments
              </div>
              <div className="space-y-1">
                {[
                  { name: 'Analog PolySynth', type: 'synth', desc: 'Dual VCO Moog-style subtractive synth' },
                  { name: 'FM Electric Piano', type: 'instrument', desc: 'DX7/Rhodes frequency modulation engine' },
                  { name: '808 Sub Bass Synth', type: 'instrument', desc: 'Warm saturated sub glide synthesizer' },
                  { name: 'SP-808 Drum Sequencer', type: 'drum', desc: '16-step algorithmic drum machine' },
                  { name: 'Audio Vocal Recorder', type: 'audio', desc: 'Multi-take microphone audio tracking' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-md bg-[#191b22] border border-[#272a34] hover:border-cyan-500/50 group transition-all"
                  >
                    <div>
                      <div className="text-zinc-200 font-medium">{item.name}</div>
                      <div className="text-[10px] text-zinc-400">{item.desc}</div>
                    </div>
                    <button
                      onClick={() => addTrack(item.type as any)}
                      className="p-1 bg-[#252830] hover:bg-cyan-500 hover:text-black rounded text-zinc-300 transition-colors"
                      title="Add to Project"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Built-in Audio DSP Effects */}
            <div>
              <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2 px-1">
                Studio DSP Effects
              </div>
              <div className="space-y-1">
                {[
                  { name: '4-Band Parametric EQ', desc: 'Surgical curve filter with visual FFT' },
                  { name: 'Studio Dynamics Compressor', desc: 'VCA/Opto leveling with gain-reduction' },
                  { name: 'Algorithmic Hall Reverb', desc: 'Diffuse stereo space convolver' },
                  { name: 'Stereo Ping-Pong Delay', desc: 'Tempo-synced dual delay line' },
                  { name: 'Analog Tape Saturation', desc: 'Warm harmonic soft-clipper' },
                  { name: 'Master Brickwall Limiter', desc: 'Zero-overshoot lookahead limiter' },
                ].map((fx, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-md bg-[#191b22] border border-[#272a34] hover:border-purple-500/50 transition-all cursor-pointer"
                    onClick={() => setBottomTab('effects')}
                  >
                    <div className="text-zinc-200 font-medium flex items-center justify-between">
                      <span>{fx.name}</span>
                      <Sliders className="w-3 h-3 text-purple-400" />
                    </div>
                    <div className="text-[10px] text-zinc-400">{fx.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {state.sidebarTab === 'templates' && (
          <div className="space-y-2">
            <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2 px-1">
              Project Templates
            </div>
            {[
              { title: 'Synthwave & Cyberpunk', bpm: 124, key: 'Am', genre: 'Electronic' },
              { title: 'Hip-Hop & Trap Heavy 808', bpm: 140, key: 'F#m', genre: 'Urban' },
              { title: 'Neo-Soul & R&B Ballad', bpm: 85, key: 'Db Maj', genre: 'Soul' },
              { title: 'Lo-Fi Chill Study Beat', bpm: 78, key: 'C Maj', genre: 'Lo-Fi' },
              { title: 'Podcast & Vocal Master', bpm: 120, key: 'Voice', genre: 'Broadcast' },
            ].map((tmpl, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-[#191c24] border border-[#272b36] hover:border-blue-500/60 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div className="text-zinc-200 font-semibold">{tmpl.title}</div>
                  <span className="text-[10px] px-1.5 py-0.5 bg-[#252a36] text-blue-400 rounded font-mono">
                    {tmpl.bpm} BPM
                  </span>
                </div>
                <div className="text-[10px] text-zinc-400 mt-1 flex items-center gap-2">
                  <span>{tmpl.genre}</span>
                  <span>·</span>
                  <span>Key: {tmpl.key}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Track Quick Footer */}
      <div className="p-2 border-t border-[#22262e] bg-[#16181e] flex gap-1.5">
        <button
          onClick={() => addTrack('instrument')}
          className="flex-1 py-1.5 px-2 bg-[#232732] hover:bg-[#2e3342] text-zinc-200 rounded font-medium flex items-center justify-center gap-1 transition-colors"
        >
          <Plus className="w-3 h-3 text-cyan-400" />
          <span>Synth</span>
        </button>
        <button
          onClick={() => addTrack('drum')}
          className="flex-1 py-1.5 px-2 bg-[#232732] hover:bg-[#2e3342] text-zinc-200 rounded font-medium flex items-center justify-center gap-1 transition-colors"
        >
          <Plus className="w-3 h-3 text-rose-400" />
          <span>Drums</span>
        </button>
        <button
          onClick={() => addTrack('audio')}
          className="flex-1 py-1.5 px-2 bg-[#232732] hover:bg-[#2e3342] text-zinc-200 rounded font-medium flex items-center justify-center gap-1 transition-colors"
        >
          <Plus className="w-3 h-3 text-amber-400" />
          <span>Audio</span>
        </button>
      </div>
    </aside>
  );
};
