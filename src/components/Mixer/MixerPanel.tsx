/**
 * SP Studio DAW - Professional Mixing Console
 * Channel strips, precision dB faders, multi-segment peak/RMS meters,
 * insert effect racks, send buses, and master output section.
 */

import React, { useEffect, useState } from 'react';
import {
  Volume2,
  Sliders,
  Maximize2,
  ChevronUp,
  Activity,
  Layers,
  Sparkles,
  Power,
  Plus,
} from 'lucide-react';
import { useDawStore } from '../../store/useDawStore';
import { AudioEngine } from '../../audio/AudioEngine';

export const MixerPanel: React.FC = () => {
  const {
    state,
    updateTrackVolume,
    updateTrackPan,
    toggleTrackMute,
    toggleTrackSolo,
    toggleTrackArm,
    setMasterVolume,
    setMasterPan,
    setSelectedTrackId,
  } = useDawStore();

  const [meterValues, setMeterValues] = useState<{
    peakL: number;
    peakR: number;
    rmsL: number;
    rmsR: number;
    lufs: number;
  }>({
    peakL: 0,
    peakR: 0,
    rmsL: 0,
    rmsR: 0,
    lufs: -70,
  });

  // Real-time audio engine metering polling at 30 FPS
  useEffect(() => {
    const interval = setInterval(() => {
      const engine = AudioEngine.getInstance();
      const telemetry = engine.getMeterTelemetry();
      setMeterValues({
        peakL: telemetry.peakL,
        peakR: telemetry.peakR,
        rmsL: telemetry.rmsL,
        rmsR: telemetry.rmsR,
        lufs: telemetry.lufsIntegrated,
      });
    }, 33);
    return () => clearInterval(interval);
  }, []);

  const gainToDb = (gain: number): string => {
    if (gain <= 0.001) return '-inf';
    const db = Math.round(20 * Math.log10(gain) * 10) / 10;
    return db > 0 ? `+${db}` : `${db}`;
  };

  return (
    <div className="h-full bg-[#131519] border-t border-[#232732] flex flex-col select-none text-xs overflow-hidden">
      {/* Mixer Top Bar */}
      <div className="h-8 bg-[#181a20] border-b border-[#242832] px-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold text-zinc-300">
            <Sliders className="w-3.5 h-3.5 text-blue-400" />
            <span>MIXING CONSOLE</span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">
            {state.tracks.length} Channels · Master Bus · 32-Bit Float Internal
          </span>
        </div>

        {/* Global Meter Readout */}
        <div className="flex items-center gap-4 text-[10px] font-mono text-zinc-400">
          <div>
            <span>LUFS: </span>
            <span className="text-cyan-400 font-bold">{meterValues.lufs} dB</span>
          </div>
          <div>
            <span>PEAK: </span>
            <span className={meterValues.peakL > 0.95 ? 'text-rose-500 font-bold' : 'text-emerald-400'}>
              {gainToDb(meterValues.peakL)} dB
            </span>
          </div>
        </div>
      </div>

      {/* Channel Strips Container */}
      <div className="flex-1 flex overflow-x-auto p-2 gap-2 bg-[#0e1014]">
        {/* Track Channel Strips */}
        {state.tracks.map((track) => {
          const isSelected = state.selectedTrackId === track.id;
          const trackPeak = track.mute ? 0 : Math.min(1, meterValues.peakL * track.volume);

          return (
            <div
              key={track.id}
              onClick={() => setSelectedTrackId(track.id)}
              className={`w-32 bg-[#171920] border rounded-lg flex flex-col p-2 justify-between shrink-0 transition-all ${
                isSelected
                  ? 'border-blue-500 shadow-lg shadow-blue-500/10'
                  : 'border-[#262a34] hover:border-[#353b4a]'
              }`}
            >
              {/* Channel Label & Color Top Bar */}
              <div className="flex flex-col gap-1 pb-1 border-b border-[#262a34]">
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: track.color }}
                  />
                  <span className="font-bold text-zinc-200 truncate text-[11px]">{track.name}</span>
                </div>
                <div className="flex justify-between text-[9px] text-zinc-400 font-mono">
                  <span>{track.outputBus}</span>
                  <span className="uppercase">{track.type}</span>
                </div>
              </div>

              {/* Insert Effects Preview */}
              <div className="my-1.5 bg-[#121419] p-1.5 rounded border border-[#232732] flex flex-col gap-1 min-h-[44px]">
                <span className="text-[8px] text-zinc-400 font-mono uppercase">INSERTS</span>
                {track.effects.slice(0, 2).map((fx) => (
                  <div
                    key={fx.id}
                    className="flex items-center justify-between text-[9px] bg-[#1a1d24] px-1 py-0.5 rounded text-zinc-300 font-mono"
                  >
                    <span className="truncate">{fx.name}</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  </div>
                ))}
                {track.effects.length === 0 && (
                  <span className="text-[9px] text-zinc-600 italic">No inserts</span>
                )}
              </div>

              {/* Pan Potentiometer */}
              <div className="flex flex-col items-center gap-0.5 my-1">
                <div className="flex justify-between w-full text-[9px] text-zinc-400 font-mono">
                  <span>PAN</span>
                  <span>
                    {track.pan === 0 ? 'C' : track.pan > 0 ? `R${Math.round(track.pan * 50)}` : `L${Math.round(-track.pan * 50)}`}
                  </span>
                </div>
                <input
                  type="range"
                  min="-1"
                  max="1"
                  step="0.05"
                  value={track.pan}
                  onChange={(e) => updateTrackPan(track.id, parseFloat(e.target.value))}
                  className="w-full h-1 bg-[#282d38] accent-blue-400 cursor-pointer"
                />
              </div>

              {/* Mute, Solo, Record Arm Row */}
              <div className="grid grid-cols-3 gap-1 my-1 font-mono font-bold text-[10px]">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTrackMute(track.id);
                  }}
                  className={`py-1 rounded text-center transition-colors ${
                    track.mute ? 'bg-amber-600 text-white font-bold' : 'bg-[#252934] text-zinc-400 hover:text-white'
                  }`}
                  title="Mute Track"
                >
                  M
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTrackSolo(track.id);
                  }}
                  className={`py-1 rounded text-center transition-colors ${
                    track.solo ? 'bg-blue-600 text-white font-bold' : 'bg-[#252934] text-zinc-400 hover:text-white'
                  }`}
                  title="Solo Track"
                >
                  S
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTrackArm(track.id);
                  }}
                  className={`py-1 rounded text-center transition-colors ${
                    track.armed ? 'bg-rose-600 text-white font-bold' : 'bg-[#252934] text-zinc-400 hover:text-rose-400'
                  }`}
                  title="Arm Recording"
                >
                  R
                </button>
              </div>

              {/* Fader & LED Meter Ladder */}
              <div className="flex-1 flex items-center justify-center gap-2 py-2 min-h-[140px]">
                {/* Vertical LED Peak Meter */}
                <div className="w-2.5 h-32 bg-[#101216] rounded-sm p-0.5 flex flex-col justify-end border border-[#2b303c]">
                  <div
                    className="w-full rounded-sm transition-all duration-75"
                    style={{
                      height: `${trackPeak * 100}%`,
                      backgroundColor:
                        trackPeak > 0.95 ? '#ef4444' : trackPeak > 0.75 ? '#f59e0b' : '#10b981',
                      boxShadow: trackPeak > 0.9 ? '0 0 6px #ef4444' : 'none',
                    }}
                  />
                </div>

                {/* Vertical Fader Input */}
                <div className="flex flex-col items-center">
                  <input
                    type="range"
                    min="0"
                    max="1.5"
                    step="0.01"
                    value={track.volume}
                    onChange={(e) => updateTrackVolume(track.id, parseFloat(e.target.value))}
                    className="vertical-fader"
                  />
                  <span className="text-[9px] font-mono mt-1 text-zinc-300">
                    {gainToDb(track.volume)} dB
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Master Output Channel Strip */}
        <div className="w-36 bg-[#181a22] border-2 border-indigo-500/60 rounded-lg flex flex-col p-2 justify-between shrink-0 shadow-xl shadow-indigo-500/10">
          {/* Master Header */}
          <div className="flex flex-col gap-1 pb-1 border-b border-[#2e3344]">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-xs tracking-wider">MASTER BUS</span>
              <span className="text-[9px] px-1 py-0.2 bg-indigo-500/20 text-indigo-300 rounded font-mono">
                OUT 1-2
              </span>
            </div>
            <span className="text-[9px] text-zinc-400 font-mono">True Peak Limiter</span>
          </div>

          {/* Master Limiter Status */}
          <div className="my-1.5 bg-[#12141a] p-1.5 rounded border border-[#282d3c] flex flex-col gap-1">
            <span className="text-[8px] text-zinc-400 font-mono uppercase">BRICKWALL CEILING</span>
            <div className="flex items-center justify-between text-[9px] font-mono text-zinc-300">
              <span>Threshold</span>
              <span className="text-cyan-400 font-bold">-0.5 dB</span>
            </div>
          </div>

          {/* Master Pan */}
          <div className="flex flex-col items-center gap-0.5 my-1">
            <div className="flex justify-between w-full text-[9px] text-zinc-400 font-mono">
              <span>BALANCE</span>
              <span>C</span>
            </div>
            <input
              type="range"
              min="-1"
              max="1"
              step="0.05"
              value={state.masterPan}
              onChange={(e) => setMasterPan(parseFloat(e.target.value))}
              className="w-full h-1 bg-[#282d38] accent-indigo-400 cursor-pointer"
            />
          </div>

          {/* Master Dual Stereo Meters & Fader */}
          <div className="flex-1 flex items-center justify-center gap-2 py-2 min-h-[140px]">
            {/* Left & Right Master Peak Ladders */}
            <div className="flex gap-0.5">
              <div className="w-2.5 h-32 bg-[#101216] rounded-sm p-0.5 flex flex-col justify-end border border-[#2b303c]">
                <div
                  className="w-full rounded-sm transition-all duration-75"
                  style={{
                    height: `${meterValues.peakL * 100}%`,
                    backgroundColor:
                      meterValues.peakL > 0.95 ? '#ef4444' : meterValues.peakL > 0.75 ? '#f59e0b' : '#38bdf8',
                  }}
                />
              </div>
              <div className="w-2.5 h-32 bg-[#101216] rounded-sm p-0.5 flex flex-col justify-end border border-[#2b303c]">
                <div
                  className="w-full rounded-sm transition-all duration-75"
                  style={{
                    height: `${meterValues.peakR * 100}%`,
                    backgroundColor:
                      meterValues.peakR > 0.95 ? '#ef4444' : meterValues.peakR > 0.75 ? '#f59e0b' : '#38bdf8',
                  }}
                />
              </div>
            </div>

            {/* Master Fader */}
            <div className="flex flex-col items-center">
              <input
                type="range"
                min="0"
                max="1.5"
                step="0.01"
                value={state.masterVolume}
                onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
                className="vertical-fader"
              />
              <span className="text-[9px] font-mono mt-1 font-bold text-cyan-300">
                {gainToDb(state.masterVolume)} dB
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
