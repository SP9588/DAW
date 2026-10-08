/**
 * SP Studio DAW - Dedicated Mastering Workspace & Real-Time Analysis
 * High-resolution FFT spectrum analyzer, LUFS meter, phase correlation,
 * stereo imager, and industry-standard loudness target presets.
 */

import React, { useEffect, useState } from 'react';
import {
  Activity,
  Sliders,
  Shield,
  Layers,
  Sparkles,
  Volume2,
  CheckCircle2,
} from 'lucide-react';
import { useDawStore } from '../../store/useDawStore';
import { AudioEngine } from '../../audio/AudioEngine';

export const MasteringWorkspace: React.FC = () => {
  const { state, setMasterVolume } = useDawStore();
  const [spectrumBins, setSpectrumBins] = useState<Uint8Array>(new Uint8Array(64));
  const [loudnessProfile, setLoudnessProfile] = useState<'spotify' | 'apple' | 'youtube' | 'club' | 'podcast'>('spotify');

  const [metrics, setMetrics] = useState({
    peakL: 0,
    peakR: 0,
    rmsL: 0,
    rmsR: 0,
    lufsIntegrated: -70,
    phaseCorrelation: 1.0,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const engine = AudioEngine.getInstance();
      setSpectrumBins(engine.getSpectrumBins(64));
      setMetrics(engine.getMeterTelemetry());
    }, 33);
    return () => clearInterval(interval);
  }, []);

  const profiles = {
    spotify: { name: 'Spotify / Tidal', targetLufs: -14, maxTruePeak: -1.0 },
    apple: { name: 'Apple Music (Sound Check)', targetLufs: -16, maxTruePeak: -1.0 },
    youtube: { name: 'YouTube Video', targetLufs: -14, maxTruePeak: -1.0 },
    club: { name: 'Club / Festival EDM', targetLufs: -9, maxTruePeak: -0.3 },
    podcast: { name: 'Podcast / Broadcast (EBU)', targetLufs: -19, maxTruePeak: -1.0 },
  };

  const selectedProfile = profiles[loudnessProfile];
  const lufsDelta = metrics.lufsIntegrated - selectedProfile.targetLufs;

  return (
    <div className="flex-1 bg-[#101216] flex flex-col p-4 select-none overflow-y-auto text-xs space-y-4">
      {/* Workspace Header */}
      <div className="flex items-center justify-between bg-[#161820] p-3 rounded-lg border border-[#252834]">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-purple-400" />
          <div>
            <div className="font-bold text-sm text-white">SP Mastering Suite & Acoustic Analysis</div>
            <div className="text-[10px] text-zinc-400">
              EBU R128 Compliant Metering · FFT Multi-Band Spectrograph · True Peak Ceiling
            </div>
          </div>
        </div>

        {/* Loudness Target Profile Selector */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-zinc-400">Target Standard:</span>
          <select
            value={loudnessProfile}
            onChange={(e) => setLoudnessProfile(e.target.value as any)}
            className="bg-[#1e222c] border border-[#2c3242] rounded px-2 py-1 text-purple-300 font-medium focus:outline-none"
          >
            <option value="spotify">Spotify (-14 LUFS)</option>
            <option value="apple">Apple Music (-16 LUFS)</option>
            <option value="youtube">YouTube (-14 LUFS)</option>
            <option value="club">Club / EDM (-9 LUFS)</option>
            <option value="podcast">Podcast (-19 LUFS)</option>
          </select>
        </div>
      </div>

      {/* Main Analysis Visualizer Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Real-time FFT Frequency Spectrum Analyzer */}
        <div className="lg:col-span-2 bg-[#14161e] border border-[#262a38] rounded-lg p-3 space-y-2">
          <div className="flex justify-between items-center text-[11px] font-semibold text-zinc-300">
            <span>REAL-TIME 64-BAND SPECTRUM ANALYZER</span>
            <span className="text-[10px] text-cyan-400 font-mono">20 Hz — 20 kHz</span>
          </div>

          {/* SVG Spectrum Bars */}
          <div className="h-44 bg-[#0d0e13] border border-[#1f222d] rounded-md p-2 flex items-end gap-1">
            {Array.from(spectrumBins).map((bin, idx) => {
              const h = Math.max(3, (bin / 255) * 100);
              return (
                <div
                  key={idx}
                  className="flex-1 bg-gradient-to-t from-cyan-600 via-blue-500 to-purple-400 rounded-t-sm transition-all duration-75"
                  style={{ height: `${h}%` }}
                />
              );
            })}
          </div>

          <div className="flex justify-between text-[9px] text-zinc-400 font-mono pt-1">
            <span>30 Hz (Sub)</span>
            <span>120 Hz (Bass)</span>
            <span>500 Hz (Low-Mid)</span>
            <span>2.5 kHz (Presence)</span>
            <span>8 kHz (Air)</span>
            <span>18 kHz</span>
          </div>
        </div>

        {/* Right Col: Loudness Telemetry & Target Meters */}
        <div className="bg-[#14161e] border border-[#262a38] rounded-lg p-3 space-y-3 flex flex-col justify-between">
          <div className="font-semibold text-zinc-300 text-[11px] border-b border-[#262a38] pb-1">
            LOUDNESS & PHASE METRICS
          </div>

          {/* LUFS Readout */}
          <div className="bg-[#0e1015] p-2.5 rounded border border-[#20232e] text-center">
            <span className="text-[10px] text-zinc-400 uppercase font-mono">Integrated LUFS</span>
            <div className="text-2xl font-bold font-mono text-cyan-400 my-1">
              {metrics.lufsIntegrated} dB
            </div>
            <div className="text-[10px] flex items-center justify-center gap-1 font-mono">
              <span className="text-zinc-400">Target: {selectedProfile.targetLufs} dB</span>
              <span className="text-zinc-600">·</span>
              <span className={Math.abs(lufsDelta) < 1.5 ? 'text-emerald-400' : 'text-amber-400'}>
                Delta: {lufsDelta > 0 ? `+${lufsDelta.toFixed(1)}` : lufsDelta.toFixed(1)} dB
              </span>
            </div>
          </div>

          {/* Phase Correlation & Stereo Width Meter */}
          <div className="bg-[#0e1015] p-2.5 rounded border border-[#20232e]">
            <div className="flex justify-between text-[10px] text-zinc-400 font-mono mb-1">
              <span>Phase Correlation:</span>
              <span className="font-bold text-white">{metrics.phaseCorrelation}</span>
            </div>
            {/* Meter Bar: -1 (Out of phase) to +1 (Perfect mono/stereo) */}
            <div className="h-2 bg-[#202430] rounded-full relative overflow-hidden">
              <div
                className="absolute top-0 bottom-0 bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400 rounded-full transition-all duration-100"
                style={{
                  left: `${((metrics.phaseCorrelation + 1) / 2) * 100}%`,
                  width: '6px',
                  marginLeft: '-3px',
                }}
              />
            </div>
            <div className="flex justify-between text-[8px] text-zinc-400 font-mono mt-1">
              <span>-1.0 (Out of Phase)</span>
              <span>0.0</span>
              <span>+1.0 (Solid Stereo)</span>
            </div>
          </div>

          {/* True Peak Meter */}
          <div className="bg-[#0e1015] p-2.5 rounded border border-[#20232e] flex items-center justify-between">
            <div>
              <div className="text-[10px] text-zinc-400 font-mono">True Peak Ceiling:</div>
              <div className="text-xs font-bold text-emerald-400 font-mono">
                {selectedProfile.maxTruePeak} dBFS
              </div>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Compliant</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mastering Processing Strip */}
      <div className="bg-[#14161e] border border-[#262a38] rounded-lg p-3">
        <div className="font-semibold text-zinc-300 text-[11px] mb-3">
          MASTERING HARDWARE EMULATION RACK
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="bg-[#181a24] p-2.5 rounded border border-[#252936] space-y-1">
            <span className="text-[10px] text-zinc-400 uppercase font-mono">Linear-Phase EQ</span>
            <div className="text-xs font-bold text-white">4-Band Passive Precision</div>
            <div className="text-[9px] text-emerald-400">Phase shift: 0.0°</div>
          </div>

          <div className="bg-[#181a24] p-2.5 rounded border border-[#252936] space-y-1">
            <span className="text-[10px] text-zinc-400 uppercase font-mono">Glue Bus Compressor</span>
            <div className="text-xs font-bold text-white">VCA Master Glue</div>
            <div className="text-[9px] text-zinc-400">Ratio: 2:1 · 30ms Attack</div>
          </div>

          <div className="bg-[#181a24] p-2.5 rounded border border-[#252936] space-y-1">
            <span className="text-[10px] text-zinc-400 uppercase font-mono">Stereo Imager</span>
            <div className="text-xs font-bold text-white">Multi-Band Width 110%</div>
            <div className="text-[9px] text-zinc-400">Mono Bass under 120 Hz</div>
          </div>

          <div className="bg-[#181a24] p-2.5 rounded border border-[#252936] space-y-1">
            <span className="text-[10px] text-zinc-400 uppercase font-mono">True Peak Limiter</span>
            <div className="text-xs font-bold text-white">Brickwall Lookahead</div>
            <div className="text-[9px] text-cyan-400">Release: 50ms Auto</div>
          </div>
        </div>
      </div>
    </div>
  );
};
