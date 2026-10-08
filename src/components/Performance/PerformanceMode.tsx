/**
 * SP Studio DAW - Live Performance Matrix & DJ Decks
 * Ableton-style quantized scene/clip matrix launcher and dual-deck DJ performance mixer.
 */

import React, { useState } from 'react';
import {
  Radio,
  Disc,
  Play,
  Square,
  Repeat,
  Sliders,
  Zap,
  Volume2,
} from 'lucide-react';
import { useDawStore } from '../../store/useDawStore';
import { AudioEngine } from '../../audio/AudioEngine';

export const PerformanceMode: React.FC = () => {
  const { state, setCrossfader, updateDJDeck } = useDawStore();
  const [activeTab, setActiveTab] = useState<'matrix' | 'dj'>('matrix');

  // Performance clips matrix state (4 tracks x 4 scenes)
  const [activeCells, setActiveCells] = useState<Record<string, boolean>>({
    'c_0_0': true,
    'c_1_0': true,
    'c_2_0': false,
    'c_3_0': false,
  });

  const toggleCell = (trackIdx: number, sceneIdx: number) => {
    const key = `c_${trackIdx}_${sceneIdx}`;
    setActiveCells((prev) => ({ ...prev, [key]: !prev[key] }));

    // Trigger audio preview
    const engine = AudioEngine.getInstance();
    engine.init();
    if (trackIdx === 0) engine.playDrum('kick', 120);
    else if (trackIdx === 1) engine.play808Bass(36, 120, 0.8);
    else if (trackIdx === 2) engine.playFmPiano(60, 95, 0.8);
    else if (trackIdx === 3) engine.playPolySynth(72, 100, 0.5);
  };

  const launchScene = (sceneIdx: number) => {
    const updated: Record<string, boolean> = {};
    for (let t = 0; t < 4; t++) {
      updated[`c_${t}_${sceneIdx}`] = true;
    }
    setActiveCells(updated);
    const engine = AudioEngine.getInstance();
    engine.init();
    engine.playDrum('kick', 120);
    engine.play808Bass(36, 120, 0.8);
  };

  const scenes = ['Intro Groove', 'Verse A', 'Chorus Build', 'Drop Maximum'];
  const trackLabels = ['808 Drums', 'Sub Bass', 'FM Keys', 'Poly Lead'];
  const colors = ['#f43f5e', '#06b6d4', '#8b5cf6', '#38bdf8'];

  const deckA = state.djDecks.deckA;
  const deckB = state.djDecks.deckB;

  return (
    <div className="flex-1 bg-[#101216] flex flex-col p-4 select-none overflow-y-auto text-xs space-y-4">
      {/* Performance Top Switcher */}
      <div className="flex items-center justify-between bg-[#161820] p-3 rounded-lg border border-[#252834]">
        <div className="flex items-center gap-3">
          <Radio className="w-5 h-5 text-emerald-400" />
          <div>
            <div className="font-bold text-sm text-white">Live Performance & Stage Control</div>
            <div className="text-[10px] text-zinc-400">
              Quantized Clip Matrix · Dual DJ Decks with Beatgrid & Stem Mixing
            </div>
          </div>
        </div>

        <div className="flex items-center bg-[#1e222c] p-0.5 rounded-lg border border-[#2c3242]">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-3 py-1 font-medium rounded-md transition-colors ${
              activeTab === 'matrix' ? 'bg-emerald-600 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Clip Matrix (Scenes)
          </button>
          <button
            onClick={() => setActiveTab('dj')}
            className={`px-3 py-1 font-medium rounded-md transition-colors ${
              activeTab === 'dj' ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            DJ Decks A/B
          </button>
        </div>
      </div>

      {/* TAB 1: CLIP LAUNCH MATRIX */}
      {activeTab === 'matrix' && (
        <div className="bg-[#14161e] border border-[#262a38] rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-300">
            <span>PERFORMANCE CLIP GRID</span>
            <span className="text-[10px] text-emerald-400 font-mono">Quantize: 1 Bar</span>
          </div>

          <div className="grid grid-cols-5 gap-3">
            {/* Track headers */}
            {trackLabels.map((lbl, idx) => (
              <div
                key={idx}
                className="p-2 rounded bg-[#1a1c26] border border-[#282d3c] font-bold text-center text-xs truncate"
                style={{ color: colors[idx] }}
              >
                {lbl}
              </div>
            ))}
            <div className="p-2 rounded bg-[#202432] border border-[#2f3546] font-bold text-center text-xs text-zinc-300">
              SCENE LAUNCH
            </div>

            {/* 4 Rows of Scenes */}
            {scenes.map((sceneName, sIdx) => (
              <React.Fragment key={sIdx}>
                {trackLabels.map((_, tIdx) => {
                  const key = `c_${tIdx}_${sIdx}`;
                  const isPlaying = activeCells[key];

                  return (
                    <button
                      key={tIdx}
                      onClick={() => toggleCell(tIdx, sIdx)}
                      className={`h-20 rounded-lg border flex flex-col justify-between p-2.5 transition-all text-left ${
                        isPlaying
                          ? 'border-emerald-400 shadow-lg shadow-emerald-500/20'
                          : 'bg-[#181a24] border-[#252936] hover:border-zinc-500'
                      }`}
                      style={{
                        backgroundColor: isPlaying ? `${colors[tIdx]}33` : undefined,
                      }}
                    >
                      <div className="flex justify-between items-center w-full">
                        <span className="font-semibold text-[11px] text-zinc-200 truncate">
                          Clip {sIdx + 1}
                        </span>
                        <Play
                          className={`w-3.5 h-3.5 ${
                            isPlaying ? 'text-emerald-400 fill-current' : 'text-zinc-600'
                          }`}
                        />
                      </div>
                      <span className="text-[9px] font-mono text-zinc-400">4 Bars · Loop</span>
                    </button>
                  );
                })}

                {/* Scene Launch Trigger */}
                <button
                  onClick={() => launchScene(sIdx)}
                  className="h-20 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/40 p-2.5 flex flex-col justify-between text-left transition-colors"
                >
                  <span className="font-bold text-emerald-300">{sceneName}</span>
                  <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                    <Play className="w-3 h-3 fill-current" />
                    <span>Trigger All</span>
                  </div>
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: DJ DECKS */}
      {activeTab === 'dj' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* DECK A */}
            <div className="bg-[#14161e] border-2 border-blue-500/40 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center border-b border-[#262a38] pb-2">
                <div>
                  <div className="font-bold text-white text-sm">{deckA.trackName}</div>
                  <div className="text-[10px] text-zinc-400">{deckA.artist}</div>
                </div>
                <span className="text-xs font-mono font-bold text-blue-400 bg-blue-950 px-2 py-0.5 rounded">
                  DECK A · {deckA.bpm} BPM
                </span>
              </div>

              {/* Jogwheel & Vinyl Display */}
              <div className="flex items-center justify-center py-4">
                <div className="w-36 h-36 rounded-full bg-gradient-to-tr from-zinc-900 to-zinc-800 border-4 border-blue-500/60 shadow-xl flex items-center justify-center relative animate-spin-slow">
                  <div className="w-12 h-12 rounded-full bg-[#161820] border-2 border-zinc-700 flex items-center justify-center text-[10px] font-mono text-blue-400 font-bold">
                    A
                  </div>
                </div>
              </div>

              {/* 3-Band EQ & Filter */}
              <div className="grid grid-cols-4 gap-2 text-center bg-[#0e1015] p-2.5 rounded border border-[#20232e]">
                <div>
                  <span className="text-[9px] text-zinc-400">HIGH</span>
                  <input
                    type="range"
                    min="-24"
                    max="6"
                    value={deckA.eqHigh}
                    onChange={(e) => updateDJDeck('deckA', { eqHigh: parseFloat(e.target.value) })}
                    className="w-full h-1 bg-[#282d38] accent-blue-400 mt-1 cursor-pointer"
                  />
                </div>
                <div>
                  <span className="text-[9px] text-zinc-400">MID</span>
                  <input
                    type="range"
                    min="-24"
                    max="6"
                    value={deckA.eqMid}
                    onChange={(e) => updateDJDeck('deckA', { eqMid: parseFloat(e.target.value) })}
                    className="w-full h-1 bg-[#282d38] accent-blue-400 mt-1 cursor-pointer"
                  />
                </div>
                <div>
                  <span className="text-[9px] text-zinc-400">LOW</span>
                  <input
                    type="range"
                    min="-24"
                    max="6"
                    value={deckA.eqLow}
                    onChange={(e) => updateDJDeck('deckA', { eqLow: parseFloat(e.target.value) })}
                    className="w-full h-1 bg-[#282d38] accent-blue-400 mt-1 cursor-pointer"
                  />
                </div>
                <div>
                  <span className="text-[9px] text-zinc-400">FILTER</span>
                  <input
                    type="range"
                    min="-1"
                    max="1"
                    step="0.05"
                    value={deckA.filter}
                    onChange={(e) => updateDJDeck('deckA', { filter: parseFloat(e.target.value) })}
                    className="w-full h-1 bg-[#282d38] accent-cyan-400 mt-1 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* DECK B */}
            <div className="bg-[#14161e] border-2 border-rose-500/40 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center border-b border-[#262a38] pb-2">
                <div>
                  <div className="font-bold text-white text-sm">{deckB.trackName}</div>
                  <div className="text-[10px] text-zinc-400">{deckB.artist}</div>
                </div>
                <span className="text-xs font-mono font-bold text-rose-400 bg-rose-950 px-2 py-0.5 rounded">
                  DECK B · {deckB.bpm} BPM
                </span>
              </div>

              {/* Jogwheel & Vinyl Display */}
              <div className="flex items-center justify-center py-4">
                <div className="w-36 h-36 rounded-full bg-gradient-to-tr from-zinc-900 to-zinc-800 border-4 border-rose-500/60 shadow-xl flex items-center justify-center relative animate-spin-slow">
                  <div className="w-12 h-12 rounded-full bg-[#161820] border-2 border-zinc-700 flex items-center justify-center text-[10px] font-mono text-rose-400 font-bold">
                    B
                  </div>
                </div>
              </div>

              {/* 3-Band EQ & Filter */}
              <div className="grid grid-cols-4 gap-2 text-center bg-[#0e1015] p-2.5 rounded border border-[#20232e]">
                <div>
                  <span className="text-[9px] text-zinc-400">HIGH</span>
                  <input
                    type="range"
                    min="-24"
                    max="6"
                    value={deckB.eqHigh}
                    onChange={(e) => updateDJDeck('deckB', { eqHigh: parseFloat(e.target.value) })}
                    className="w-full h-1 bg-[#282d38] accent-rose-400 mt-1 cursor-pointer"
                  />
                </div>
                <div>
                  <span className="text-[9px] text-zinc-400">MID</span>
                  <input
                    type="range"
                    min="-24"
                    max="6"
                    value={deckB.eqMid}
                    onChange={(e) => updateDJDeck('deckB', { eqMid: parseFloat(e.target.value) })}
                    className="w-full h-1 bg-[#282d38] accent-rose-400 mt-1 cursor-pointer"
                  />
                </div>
                <div>
                  <span className="text-[9px] text-zinc-400">LOW</span>
                  <input
                    type="range"
                    min="-24"
                    max="6"
                    value={deckB.eqLow}
                    onChange={(e) => updateDJDeck('deckB', { eqLow: parseFloat(e.target.value) })}
                    className="w-full h-1 bg-[#282d38] accent-rose-400 mt-1 cursor-pointer"
                  />
                </div>
                <div>
                  <span className="text-[9px] text-zinc-400">FILTER</span>
                  <input
                    type="range"
                    min="-1"
                    max="1"
                    step="0.05"
                    value={deckB.filter}
                    onChange={(e) => updateDJDeck('deckB', { filter: parseFloat(e.target.value) })}
                    className="w-full h-1 bg-[#282d38] accent-cyan-400 mt-1 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Central DJ Crossfader Console */}
          <div className="bg-[#14161e] border border-[#262a38] rounded-lg p-4 flex flex-col items-center gap-3">
            <div className="flex justify-between w-full max-w-md text-xs font-mono font-bold">
              <span className="text-blue-400">DECK A</span>
              <span className="text-zinc-500">CROSSFADER</span>
              <span className="text-rose-400">DECK B</span>
            </div>

            <div className="w-full max-w-md">
              <input
                type="range"
                min="-1"
                max="1"
                step="0.02"
                value={state.crossfader}
                onChange={(e) => setCrossfader(parseFloat(e.target.value))}
                className="w-full h-3 bg-[#1e222c] rounded cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
