/**
 * SP Studio DAW - Right Inspector & Properties Panel
 * Fine-grained editing for selected tracks, audio clips, fades, pitch shifts,
 * time stretch, and routing.
 */

import React from 'react';
import {
  Sliders,
  Layers,
  Music,
  Mic,
  Disc,
  Volume2,
  RotateCcw,
  Zap,
  Repeat,
  Sparkles,
} from 'lucide-react';
import { useDawStore } from '../../store/useDawStore';

export const TrackInspector: React.FC = () => {
  const { state, setTracks, updateTrackVolume, updateTrackPan } = useDawStore();
  const currentTrack = state.tracks.find((t) => t.id === state.selectedTrackId) || state.tracks[0];
  const selectedClip = currentTrack?.clips.find((c) => c.id === state.selectedClipId) || currentTrack?.clips[0];

  if (!state.showInspector) return null;

  const updateClipAudioData = (paramKey: string, val: any) => {
    if (!selectedClip || !selectedClip.audioData) return;
    setTracks((tracks) =>
      tracks.map((t) =>
        t.id === currentTrack.id
          ? {
              ...t,
              clips: t.clips.map((c) =>
                c.id === selectedClip.id
                  ? { ...c, audioData: { ...c.audioData!, [paramKey]: val } }
                  : c
              ),
            }
          : t
      )
    );
  };

  return (
    <aside className="w-64 bg-[#14161a] border-l border-[#22262e] flex flex-col h-full select-none text-xs shrink-0 overflow-y-auto">
      {/* Header */}
      <div className="h-8 bg-[#181a20] border-b border-[#22262e] px-3 flex items-center justify-between shrink-0">
        <span className="font-bold text-zinc-300 uppercase tracking-wide text-[10px]">
          INSPECTOR
        </span>
        <span className="text-[10px] text-cyan-400 font-mono">
          {currentTrack ? currentTrack.name : 'NO SELECTION'}
        </span>
      </div>

      <div className="p-3 space-y-4">
        {/* Track Settings */}
        {currentTrack && (
          <div className="space-y-3 bg-[#181a22] p-2.5 rounded-lg border border-[#272b38]">
            <div className="flex items-center justify-between border-b border-[#272b38] pb-1">
              <span className="font-bold text-zinc-200">Track Properties</span>
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: currentTrack.color }}
              />
            </div>

            <div className="space-y-2">
              <div>
                <label className="text-[10px] text-zinc-400 font-mono uppercase">Routing Out</label>
                <div className="text-zinc-200 font-mono bg-[#12141a] p-1 rounded mt-0.5 border border-[#232734]">
                  {currentTrack.outputBus} Bus
                </div>
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 font-mono uppercase">Input Source</label>
                <div className="text-zinc-200 font-mono bg-[#12141a] p-1 rounded mt-0.5 border border-[#232734]">
                  {currentTrack.inputChannel}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Clip Properties */}
        {selectedClip ? (
          <div className="space-y-3 bg-[#181a22] p-2.5 rounded-lg border border-[#272b38]">
            <div className="flex items-center justify-between border-b border-[#272b38] pb-1">
              <span className="font-bold text-zinc-200 truncate">{selectedClip.name}</span>
              <span className="text-[9px] uppercase px-1 py-0.2 bg-[#252936] text-zinc-400 font-mono rounded">
                {selectedClip.type}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-zinc-400">Start Beat:</span>
                <span className="text-white font-bold">{selectedClip.startBeat}</span>
              </div>

              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-zinc-400">Duration:</span>
                <span className="text-white font-bold">{selectedClip.durationBeats} Beats</span>
              </div>

              {/* Audio Specific Non-Destructive Clip Processing */}
              {selectedClip.type === 'audio' && selectedClip.audioData && (
                <div className="pt-2 border-t border-[#262a38] space-y-2">
                  <span className="text-[10px] text-zinc-400 font-mono uppercase block">
                    Non-Destructive Audio Controls
                  </span>

                  <div>
                    <div className="flex justify-between text-[10px] text-zinc-400">
                      <span>Clip Gain</span>
                      <span className="font-mono text-cyan-400">
                        {selectedClip.audioData.gain.toFixed(2)}x
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.05"
                      value={selectedClip.audioData.gain}
                      onChange={(e) => updateClipAudioData('gain', parseFloat(e.target.value))}
                      className="w-full h-1 bg-[#282d38] accent-cyan-400 mt-1 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-zinc-400">
                      <span>Fade In (beats)</span>
                      <span className="font-mono text-cyan-400">{selectedClip.audioData.fadeIn}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={selectedClip.audioData.fadeIn}
                      onChange={(e) => updateClipAudioData('fadeIn', parseFloat(e.target.value))}
                      className="w-full h-1 bg-[#282d38] accent-cyan-400 mt-1 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-zinc-400">
                      <span>Fade Out (beats)</span>
                      <span className="font-mono text-cyan-400">{selectedClip.audioData.fadeOut}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={selectedClip.audioData.fadeOut}
                      onChange={(e) => updateClipAudioData('fadeOut', parseFloat(e.target.value))}
                      className="w-full h-1 bg-[#282d38] accent-cyan-400 mt-1 cursor-pointer"
                    />
                  </div>

                  {/* Reverse Audio Toggle */}
                  <div className="pt-1 flex items-center justify-between">
                    <span className="text-zinc-300">Reverse Audio</span>
                    <button
                      onClick={() => updateClipAudioData('reversed', !selectedClip.audioData?.reversed)}
                      className={`px-2 py-0.5 rounded font-mono text-[10px] font-semibold ${
                        selectedClip.audioData.reversed
                          ? 'bg-rose-600 text-white'
                          : 'bg-[#252936] text-zinc-400'
                      }`}
                    >
                      {selectedClip.audioData.reversed ? 'REVERSED' : 'NORMAL'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-zinc-500 italic text-center py-4">No clip selected</div>
        )}
      </div>
    </aside>
  );
};
