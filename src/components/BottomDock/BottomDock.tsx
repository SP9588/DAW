/**
 * SP Studio DAW - Bottom Multi-View Dock
 * Hosts Mixer, Piano Roll, Instrument Rack, and DSP Effect Rack with resizable tabs.
 */

import React, { useState } from 'react';
import {
  Sliders,
  Music,
  Disc,
  Activity,
  Radio,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useDawStore } from '../../store/useDawStore';
import { MixerPanel } from '../Mixer/MixerPanel';
import { PianoRoll } from '../PianoRoll/PianoRoll';
import { InstrumentRack } from '../Instruments/InstrumentRack';
import { EffectRack } from '../Effects/EffectRack';

export const BottomDock: React.FC = () => {
  const { state, setBottomTab } = useDawStore();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={`border-t border-[#252834] bg-[#14161c] flex flex-col shrink-0 transition-all duration-200 ${
        collapsed ? 'h-8' : 'h-72'
      }`}
    >
      {/* Dock Tab Selector Header */}
      <div className="h-8 bg-[#171922] border-b border-[#252834] px-2 flex items-center justify-between select-none shrink-0">
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setBottomTab('mixer');
              setCollapsed(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-colors ${
              state.bottomTab === 'mixer' && !collapsed
                ? 'bg-[#252936] text-blue-400'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Mixer Console</span>
          </button>

          <button
            onClick={() => {
              setBottomTab('pianoroll');
              setCollapsed(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-colors ${
              state.bottomTab === 'pianoroll' && !collapsed
                ? 'bg-[#252936] text-cyan-400'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>Piano Roll (MIDI)</span>
          </button>

          <button
            onClick={() => {
              setBottomTab('instruments');
              setCollapsed(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-colors ${
              state.bottomTab === 'instruments' && !collapsed
                ? 'bg-[#252936] text-rose-400'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Disc className="w-3.5 h-3.5" />
            <span>Instruments & 808 Drums</span>
          </button>

          <button
            onClick={() => {
              setBottomTab('effects');
              setCollapsed(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-colors ${
              state.bottomTab === 'effects' && !collapsed
                ? 'bg-[#252936] text-purple-400'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Insert Effects (DSP)</span>
          </button>
        </div>

        {/* Collapse / Expand Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 text-zinc-400 hover:text-white rounded hover:bg-[#252936] transition-colors"
          title={collapsed ? 'Expand Bottom Dock' : 'Collapse Bottom Dock'}
        >
          {collapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Dock Content Body */}
      {!collapsed && (
        <div className="flex-1 overflow-hidden">
          {state.bottomTab === 'mixer' && <MixerPanel />}
          {state.bottomTab === 'pianoroll' && <PianoRoll />}
          {state.bottomTab === 'instruments' && <InstrumentRack />}
          {state.bottomTab === 'effects' && <EffectRack />}
        </div>
      )}
    </div>
  );
};
