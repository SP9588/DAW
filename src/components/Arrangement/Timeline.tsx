/**
 * SP Studio DAW - Arrangement Timeline & Multi-Track Audio Editor
 * High-performance non-destructive audio/MIDI clip arrangement, waveform
 * rendering, loop cycle ruler, playhead scrubbing, and grid snapping.
 */

import React, { useRef, useState, useEffect } from 'react';
import {
  Volume2,
  Mic,
  Music,
  Sliders,
  Scissors,
  Copy,
  Trash2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Lock,
  ChevronDown,
  ChevronRight,
  Disc,
} from 'lucide-react';
import { useDawStore } from '../../store/useDawStore';
import { Track, Clip } from '../../types/daw';

export const Timeline: React.FC = () => {
  const {
    state,
    setPlayheadBeat,
    setLoopRange,
    setSelectedTrackId,
    setSelectedClipId,
    updateTrackVolume,
    updateTrackPan,
    toggleTrackMute,
    toggleTrackSolo,
    toggleTrackArm,
    setZoomLevel,
    setGridSnap,
    setTracks,
    deleteTrack,
  } = useDawStore();

  const timelineContainerRef = useRef<HTMLDivElement>(null);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [draggedClip, setDraggedClip] = useState<{ clip: Clip; startX: number; origBeat: number } | null>(null);

  // Pixels per beat based on zoom
  const pixelsPerBeat = 40 * state.zoomLevel;
  const totalBeats = 64; // Display up to 64 beats (16 bars of 4/4)

  // Scrubbing handling
  const handleTimelineMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineContainerRef.current) return;
    const rect = timelineContainerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left + timelineContainerRef.current.scrollLeft;
    const clickedBeat = Math.max(0, clickX / pixelsPerBeat);
    setPlayheadBeat(clickedBeat);
    setIsScrubbing(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isScrubbing && timelineContainerRef.current) {
      const rect = timelineContainerRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left + timelineContainerRef.current.scrollLeft;
      const clickedBeat = Math.max(0, clickX / pixelsPerBeat);
      setPlayheadBeat(clickedBeat);
    }

    if (draggedClip && timelineContainerRef.current) {
      const deltaX = e.clientX - draggedClip.startX;
      const deltaBeats = deltaX / pixelsPerBeat;
      let newBeat = Math.max(0, draggedClip.origBeat + deltaBeats);

      // Snap to grid
      if (state.gridSnap !== 'off') {
        const snapDiv = state.gridSnap === '1/4' ? 1 : state.gridSnap === '1/8' ? 0.5 : 0.25;
        newBeat = Math.round(newBeat / snapDiv) * snapDiv;
      }

      setTracks((tracks) =>
        tracks.map((t) => ({
          ...t,
          clips: t.clips.map((c) =>
            c.id === draggedClip.clip.id ? { ...c, startBeat: newBeat } : c
          ),
        }))
      );
    }
  };

  const handleMouseUp = () => {
    setIsScrubbing(false);
    setDraggedClip(null);
  };

  // Split selected clip at playhead
  const splitClipAtPlayhead = () => {
    const playhead = state.transport.currentBeat;
    const activeTrack = state.tracks.find((t) => t.id === state.selectedTrackId);
    if (!activeTrack) return;

    const targetClip = activeTrack.clips.find(
      (c) => playhead > c.startBeat && playhead < c.startBeat + c.durationBeats
    );
    if (!targetClip) return;

    const firstDuration = playhead - targetClip.startBeat;
    const secondDuration = targetClip.durationBeats - firstDuration;

    const clip1: Clip = {
      ...targetClip,
      durationBeats: firstDuration,
    };

    const clip2: Clip = {
      ...targetClip,
      id: `clip_${Date.now()}`,
      name: `${targetClip.name} (Part 2)`,
      startBeat: playhead,
      durationBeats: secondDuration,
      offsetBeats: targetClip.offsetBeats + firstDuration,
    };

    setTracks((tracks) =>
      tracks.map((t) =>
        t.id === activeTrack.id
          ? { ...t, clips: [...t.clips.filter((c) => c.id !== targetClip.id), clip1, clip2] }
          : t
      )
    );
  };

  return (
    <div
      className="flex-1 flex flex-col bg-[#111317] select-none overflow-hidden relative"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Arrangement Toolbar: Snap, Zoom, Edit Tools */}
      <div className="h-9 bg-[#171920] border-b border-[#242832] flex items-center justify-between px-3 text-xs shrink-0">
        <div className="flex items-center gap-3">
          {/* Editing Tools */}
          <div className="flex items-center gap-1 bg-[#1d2028] p-0.5 rounded border border-[#2b303c]">
            <button
              onClick={splitClipAtPlayhead}
              className="p-1 text-zinc-300 hover:text-white hover:bg-[#282d3a] rounded transition-colors flex items-center gap-1 text-[11px]"
              title="Split Clip at Playhead (S)"
            >
              <Scissors className="w-3.5 h-3.5 text-cyan-400" />
              <span>Split</span>
            </button>
          </div>

          {/* Grid Snap Selector */}
          <div className="flex items-center gap-1.5 text-zinc-400">
            <span className="text-[10px] uppercase font-mono">Snap:</span>
            <select
              value={state.gridSnap}
              onChange={(e) => setGridSnap(e.target.value as any)}
              className="bg-[#1c1f26] border border-[#2b303c] rounded px-1.5 py-0.5 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="1/4">1/4 Beat</option>
              <option value="1/8">1/8 Beat</option>
              <option value="1/16">1/16 Beat (Bar)</option>
              <option value="1/32">1/32 Triplet</option>
              <option value="off">Off (Free)</option>
            </select>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-[#1d2028] border border-[#2b303c] rounded p-0.5">
            <button
              onClick={() => setZoomLevel(state.zoomLevel - 0.2)}
              className="p-1 text-zinc-400 hover:text-white hover:bg-[#282d3a] rounded"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] text-zinc-400 font-mono px-1">
              {Math.round(state.zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel(state.zoomLevel + 0.2)}
              className="p-1 text-zinc-400 hover:text-white hover:bg-[#282d3a] rounded"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Track Headers & Timeline Grid Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Track Headers Column */}
        <div className="w-56 bg-[#16181e] border-r border-[#242832] flex flex-col shrink-0 z-10 shadow-lg">
          {/* Header spacer aligned with ruler */}
          <div className="h-7 border-b border-[#242832] bg-[#14161a] px-3 flex items-center justify-between text-[10px] text-zinc-400 uppercase font-mono tracking-wider">
            <span>TRACK LIST</span>
            <span>{state.tracks.length} ACTIVE</span>
          </div>

          {/* Track Headers List */}
          <div className="flex-1 overflow-y-auto">
            {state.tracks.map((track) => (
              <div
                key={track.id}
                onClick={() => setSelectedTrackId(track.id)}
                className={`h-20 border-b border-[#232732] px-2.5 py-1.5 flex flex-col justify-between cursor-pointer transition-colors relative ${
                  state.selectedTrackId === track.id ? 'bg-[#20242e]' : 'hover:bg-[#1a1d24]'
                }`}
              >
                {/* Left Color Accent Strip */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1"
                  style={{ backgroundColor: track.color }}
                />

                {/* Top Row: Track Name & Type */}
                <div className="flex items-center justify-between pl-1.5">
                  <div className="flex items-center gap-1.5 truncate">
                    {track.type === 'drum' ? (
                      <Disc className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    ) : track.type === 'audio' ? (
                      <Mic className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    ) : (
                      <Music className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    )}
                    <span className="font-semibold text-xs text-zinc-200 truncate">
                      {track.name}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteTrack(track.id);
                    }}
                    className="text-zinc-500 hover:text-rose-400 p-0.5 rounded transition-colors"
                    title="Delete Track"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                {/* Middle Row: Mute, Solo, Record Arm */}
                <div className="flex items-center justify-between pl-1.5 text-[10px] font-mono font-bold">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTrackMute(track.id);
                      }}
                      className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                        track.mute ? 'bg-amber-600 text-white' : 'bg-[#282d38] text-zinc-400 hover:text-zinc-200'
                      }`}
                      title="Mute Track (M)"
                    >
                      M
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTrackSolo(track.id);
                      }}
                      className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                        track.solo ? 'bg-blue-600 text-white' : 'bg-[#282d38] text-zinc-400 hover:text-zinc-200'
                      }`}
                      title="Solo Track (S)"
                    >
                      S
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTrackArm(track.id);
                      }}
                      className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                        track.armed ? 'bg-rose-600 text-white' : 'bg-[#282d38] text-zinc-400 hover:text-rose-400'
                      }`}
                      title="Arm Track for Recording (R)"
                    >
                      R
                    </button>
                  </div>

                  {/* Volume Slider */}
                  <div className="flex items-center gap-1.5 w-24">
                    <Volume2 className="w-3 h-3 text-zinc-500" />
                    <input
                      type="range"
                      min="0"
                      max="1.5"
                      step="0.01"
                      value={track.volume}
                      onChange={(e) => {
                        e.stopPropagation();
                        updateTrackVolume(track.id, parseFloat(e.target.value));
                      }}
                      className="w-full h-1 bg-[#282d38] accent-cyan-400 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Bottom Row: Pan & Input Info */}
                <div className="flex items-center justify-between pl-1.5 text-[9px] text-zinc-400 font-mono">
                  <span>{track.inputChannel}</span>
                  <div className="flex items-center gap-1">
                    <span>PAN:</span>
                    <input
                      type="range"
                      min="-1"
                      max="1"
                      step="0.05"
                      value={track.pan}
                      onChange={(e) => {
                        e.stopPropagation();
                        updateTrackPan(track.id, parseFloat(e.target.value));
                      }}
                      className="w-12 h-1 bg-[#282d38] accent-cyan-400 cursor-pointer"
                    />
                    <span>{track.pan === 0 ? 'C' : track.pan > 0 ? `R${Math.round(track.pan * 50)}` : `L${Math.round(-track.pan * 50)}`}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Grid & Audio/MIDI Clips Lane */}
        <div
          ref={timelineContainerRef}
          className="flex-1 flex flex-col overflow-x-auto overflow-y-auto bg-[#101216] relative daw-grid-pattern"
          style={{ backgroundSize: `${pixelsPerBeat * 4}px 80px` }}
        >
          {/* Time & Bar Ruler Header */}
          <div
            className="h-7 border-b border-[#242832] bg-[#14161a] sticky top-0 z-20 flex items-center cursor-pointer select-none"
            style={{ width: `${totalBeats * pixelsPerBeat}px` }}
            onMouseDown={handleTimelineMouseDown}
          >
            {/* Loop Cycle Region Highlight */}
            {state.transport.isLooping && (
              <div
                className="absolute top-0 bottom-0 bg-blue-500/20 border-t-2 border-b-2 border-blue-400 z-10 pointer-events-none"
                style={{
                  left: `${state.transport.loopStartBeat * pixelsPerBeat}px`,
                  width: `${(state.transport.loopEndBeat - state.transport.loopStartBeat) * pixelsPerBeat}px`,
                }}
              >
                <div className="text-[9px] text-blue-300 font-mono px-1 font-semibold">CYCLE LOOP</div>
              </div>
            )}

            {/* Bar Markers */}
            {Array.from({ length: totalBeats / 4 }).map((_, barIdx) => {
              const barBeat = barIdx * 4;
              return (
                <div
                  key={barIdx}
                  className="absolute flex items-end h-full pb-1 border-l border-[#2e3340] pl-1 font-mono text-[10px] text-zinc-400"
                  style={{ left: `${barBeat * pixelsPerBeat}px` }}
                >
                  <span className="font-bold text-zinc-300">{barIdx + 1}</span>
                </div>
              );
            })}
          </div>

          {/* Draggable Playhead Scrubber Cursor Line */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-cyan-400 z-30 pointer-events-none shadow-[0_0_8px_rgba(34,211,238,0.8)]"
            style={{
              left: `${state.transport.currentBeat * pixelsPerBeat}px`,
              height: `${state.tracks.length * 80 + 28}px`,
            }}
          >
            <div className="w-3 h-3 bg-cyan-400 rotate-45 -ml-[5px] -mt-1 shadow-md" />
          </div>

          {/* Track Clip Lanes */}
          <div className="relative" style={{ width: `${totalBeats * pixelsPerBeat}px` }}>
            {state.tracks.map((track) => (
              <div
                key={track.id}
                className="h-20 border-b border-[#1c1f26] relative flex items-center px-1"
              >
                {/* Clips Container */}
                {track.clips.map((clip) => {
                  const clipLeft = clip.startBeat * pixelsPerBeat;
                  const clipWidth = clip.durationBeats * pixelsPerBeat;

                  return (
                    <div
                      key={clip.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedClipId(clip.id);
                        setSelectedTrackId(track.id);
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setDraggedClip({
                          clip,
                          startX: e.clientX,
                          origBeat: clip.startBeat,
                        });
                      }}
                      className={`absolute top-1.5 bottom-1.5 rounded-md border shadow-md flex flex-col justify-between overflow-hidden cursor-move transition-shadow ${
                        state.selectedClipId === clip.id
                          ? 'border-white shadow-lg ring-1 ring-white/50'
                          : 'border-black/40 hover:border-white/60'
                      }`}
                      style={{
                        left: `${clipLeft}px`,
                        width: `${clipWidth}px`,
                        backgroundColor: `${track.color}22`,
                        borderColor: track.color,
                      }}
                    >
                      {/* Clip Header Label */}
                      <div
                        className="px-1.5 py-0.5 text-[10px] font-semibold text-white truncate flex items-center justify-between"
                        style={{ backgroundColor: `${track.color}99` }}
                      >
                        <span className="truncate">{clip.name}</span>
                        <span className="text-[8px] opacity-80 uppercase font-mono">
                          {clip.type}
                        </span>
                      </div>

                      {/* Waveform Visualization for Audio Clips */}
                      {clip.type === 'audio' && clip.audioData && (
                        <div className="flex-1 flex items-center px-1 py-0.5">
                          <svg className="w-full h-8" preserveAspectRatio="none" viewBox="0 0 100 40">
                            {clip.audioData.waveformPeaks.map((peak, pIdx) => {
                              const x = (pIdx / clip.audioData!.waveformPeaks.length) * 100;
                              const h = Math.max(3, peak * 36);
                              return (
                                <rect
                                  key={pIdx}
                                  x={x}
                                  y={20 - h / 2}
                                  width="1.8"
                                  height={h}
                                  fill={track.color}
                                  rx="0.5"
                                  opacity="0.85"
                                />
                              );
                            })}
                          </svg>
                        </div>
                      )}

                      {/* Mini Note Preview for MIDI Clips */}
                      {clip.type === 'midi' && clip.notes && (
                        <div className="flex-1 relative mx-1 my-0.5 bg-black/20 rounded">
                          {clip.notes.map((n) => {
                            const noteX = (n.startBeat / clip.durationBeats) * 100;
                            const noteW = Math.max(2, (n.durationBeats / clip.durationBeats) * 100);
                            const noteY = 100 - ((n.note - 36) / 48) * 100;
                            return (
                              <div
                                key={n.id}
                                className="absolute h-1.5 rounded-sm opacity-90"
                                style={{
                                  left: `${noteX}%`,
                                  width: `${noteW}%`,
                                  top: `${Math.max(0, Math.min(85, noteY))}%`,
                                  backgroundColor: track.color,
                                }}
                              />
                            );
                          })}
                        </div>
                      )}

                      {/* Clip Bottom Handle info */}
                      <div className="px-1 py-0.5 text-[8px] text-zinc-300 font-mono flex justify-between bg-black/40">
                        <span>{clip.durationBeats}b</span>
                        <span>Gain: {clip.audioData ? `${clip.audioData.gain}x` : '0dB'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
