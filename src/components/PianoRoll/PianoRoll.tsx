/**
 * SP Studio DAW - Piano Roll & MIDI Editor
 * Interactive virtual piano keyboard, sample-accurate note grid,
 * velocity lane, quantization, transposition, and musical chord generator.
 */

import React, { useState, useRef } from 'react';
import {
  Music,
  Pencil,
  MousePointer,
  Trash2,
  Wand2,
  Volume2,
  ArrowUpDown,
  Sparkles,
  Plus,
} from 'lucide-react';
import { useDawStore } from '../../store/useDawStore';
import { AudioEngine } from '../../audio/AudioEngine';
import { MidiNote, Clip } from '../../types/daw';

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const PianoRoll: React.FC = () => {
  const { state, setTracks, setSelectedClipId } = useDawStore();
  const [tool, setTool] = useState<'draw' | 'select' | 'erase'>('draw');
  const [selectedScale, setSelectedScale] = useState<'major' | 'minor' | 'pentatonic' | 'dorian'>('minor');

  // Currently selected track and active MIDI clip
  const currentTrack = state.tracks.find((t) => t.id === state.selectedTrackId);
  const midiClips = currentTrack?.clips.filter((c) => c.type === 'midi') || [];
  const activeClip = midiClips.find((c) => c.id === state.selectedClipId) || midiClips[0];

  // Piano keys range (C2 to C6, notes 36 to 84)
  const lowestNote = 36;
  const highestNote = 84;
  const totalNotes = highestNote - lowestNote + 1;
  const totalBeats = activeClip ? activeClip.durationBeats : 16;
  const pixelsPerBeat = 45;
  const noteRowHeight = 20;

  // Audition note sound
  const auditionNote = (noteNumber: number) => {
    const engine = AudioEngine.getInstance();
    engine.init();
    if (currentTrack?.instrument?.type === 'sub808') {
      engine.play808Bass(noteNumber, 110, 0.5);
    } else if (currentTrack?.instrument?.type === 'fmpiano') {
      engine.playFmPiano(noteNumber, 90, 0.6);
    } else {
      engine.playPolySynth(noteNumber, 100, 0.4, currentTrack?.instrument?.params);
    }
  };

  // Click on grid to add/remove note
  const handleGridClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!activeClip) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const clickedBeat = Math.floor((clickX / pixelsPerBeat) * 4) / 4; // snap to 1/16
    const clickedNoteIndex = Math.floor(clickY / noteRowHeight);
    const clickedNote = highestNote - clickedNoteIndex;

    const existingNote = activeClip.notes?.find(
      (n) => n.note === clickedNote && Math.abs(n.startBeat - clickedBeat) < 0.25
    );

    if (existingNote) {
      if (tool === 'erase' || tool === 'draw') {
        // Remove note
        setTracks((tracks) =>
          tracks.map((t) =>
            t.id === currentTrack?.id
              ? {
                  ...t,
                  clips: t.clips.map((c) =>
                    c.id === activeClip.id
                      ? { ...c, notes: c.notes?.filter((n) => n.id !== existingNote.id) }
                      : c
                  ),
                }
              : t
          )
        );
      }
    } else if (tool === 'draw') {
      // Add new note
      auditionNote(clickedNote);
      const newNote: MidiNote = {
        id: `note_${Date.now()}`,
        note: clickedNote,
        startBeat: clickedBeat,
        durationBeats: 1.0,
        velocity: 100,
      };

      setTracks((tracks) =>
        tracks.map((t) =>
          t.id === currentTrack?.id
            ? {
                ...t,
                clips: t.clips.map((c) =>
                  c.id === activeClip.id
                    ? { ...c, notes: [...(c.notes || []), newNote] }
                    : c
                ),
              }
            : t
        )
      );
    }
  };

  // Quantize notes to nearest 1/16 beat
  const quantizeNotes = () => {
    if (!activeClip) return;
    setTracks((tracks) =>
      tracks.map((t) =>
        t.id === currentTrack?.id
          ? {
              ...t,
              clips: t.clips.map((c) =>
                c.id === activeClip.id
                  ? {
                      ...c,
                      notes: c.notes?.map((n) => ({
                        ...n,
                        startBeat: Math.round(n.startBeat * 4) / 4,
                      })),
                    }
                  : c
              ),
            }
          : t
      )
    );
  };

  // Humanize notes
  const humanizeNotes = () => {
    if (!activeClip) return;
    setTracks((tracks) =>
      tracks.map((t) =>
        t.id === currentTrack?.id
          ? {
              ...t,
              clips: t.clips.map((c) =>
                c.id === activeClip.id
                  ? {
                      ...c,
                      notes: c.notes?.map((n) => ({
                        ...n,
                        velocity: Math.max(60, Math.min(127, n.velocity + Math.floor(Math.random() * 16 - 8))),
                        startBeat: Math.max(0, n.startBeat + (Math.random() * 0.04 - 0.02)),
                      })),
                    }
                  : c
              ),
            }
          : t
      )
    );
  };

  // Transpose notes
  const transposeNotes = (semitones: number) => {
    if (!activeClip) return;
    setTracks((tracks) =>
      tracks.map((t) =>
        t.id === currentTrack?.id
          ? {
              ...t,
              clips: t.clips.map((c) =>
                c.id === activeClip.id
                  ? {
                      ...c,
                      notes: c.notes?.map((n) => ({
                        ...n,
                        note: Math.max(24, Math.min(108, n.note + semitones)),
                      })),
                    }
                  : c
              ),
            }
          : t
      )
    );
  };

  // Generate chord progression
  const generateChordProgression = () => {
    if (!activeClip) return;
    // Classic progression (i - VI - III - VII in C minor: Cm, Ab, Eb, Bb)
    const progressionChords = [
      [48, 51, 55, 60], // Cm
      [44, 48, 51, 56], // Ab
      [51, 55, 58, 63], // Eb
      [46, 50, 53, 58], // Bb
    ];

    const generatedNotes: MidiNote[] = [];
    progressionChords.forEach((chord, chordIdx) => {
      chord.forEach((pitch, pIdx) => {
        generatedNotes.push({
          id: `chord_${chordIdx}_${pIdx}_${Date.now()}`,
          note: pitch,
          startBeat: chordIdx * 4,
          durationBeats: 3.8,
          velocity: 90 + Math.floor(Math.random() * 10),
        });
      });
    });

    setTracks((tracks) =>
      tracks.map((t) =>
        t.id === currentTrack?.id
          ? {
              ...t,
              clips: t.clips.map((c) =>
                c.id === activeClip.id ? { ...c, notes: generatedNotes } : c
              ),
            }
          : t
      )
    );
  };

  return (
    <div className="h-full bg-[#121419] border-t border-[#232732] flex flex-col select-none text-xs overflow-hidden">
      {/* Piano Roll Toolbar */}
      <div className="h-9 bg-[#171920] border-b border-[#242832] px-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold text-zinc-300">
            <Music className="w-3.5 h-3.5 text-cyan-400" />
            <span>PIANO ROLL</span>
          </div>

          {/* Active Clip Selector */}
          {midiClips.length > 0 && (
            <select
              value={activeClip?.id}
              onChange={(e) => setSelectedClipId(e.target.value)}
              className="bg-[#1c1f26] border border-[#2b303c] rounded px-2 py-0.5 text-xs text-cyan-300 focus:outline-none"
            >
              {midiClips.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}

          {/* Tool Palette */}
          <div className="flex items-center gap-1 bg-[#1e212b] p-0.5 rounded border border-[#2c3240]">
            <button
              onClick={() => setTool('draw')}
              className={`p-1 rounded transition-colors ${
                tool === 'draw' ? 'bg-cyan-500 text-black' : 'text-zinc-400 hover:text-white'
              }`}
              title="Draw Note (Pencil)"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTool('erase')}
              className={`p-1 rounded transition-colors ${
                tool === 'erase' ? 'bg-rose-500 text-white' : 'text-zinc-400 hover:text-white'
              }`}
              title="Erase Note"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Quantize, Transpose, Musical Assistant */}
        <div className="flex items-center gap-2">
          <button
            onClick={quantizeNotes}
            className="px-2 py-1 bg-[#1f232c] hover:bg-[#2b303c] text-zinc-200 rounded border border-[#2c3240] transition-colors"
            title="Quantize to 1/16"
          >
            Quantize
          </button>
          <button
            onClick={humanizeNotes}
            className="px-2 py-1 bg-[#1f232c] hover:bg-[#2b303c] text-zinc-200 rounded border border-[#2c3240] transition-colors"
            title="Humanize Velocity & Timing"
          >
            Humanize
          </button>
          <div className="flex items-center gap-1 bg-[#1f232c] rounded border border-[#2c3240] px-1">
            <span className="text-[10px] text-zinc-400">Octave:</span>
            <button
              onClick={() => transposeNotes(-12)}
              className="px-1 text-zinc-300 hover:text-white"
            >
              -12
            </button>
            <button
              onClick={() => transposeNotes(12)}
              className="px-1 text-zinc-300 hover:text-white"
            >
              +12
            </button>
          </div>
          <button
            onClick={generateChordProgression}
            className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium rounded shadow transition-all"
            title="Generate Harmonized Chord Progression"
          >
            <Wand2 className="w-3 h-3" />
            <span>Generate Chords</span>
          </button>
        </div>
      </div>

      {/* Piano Roll Grid & Keyboard Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Piano Keyboard Keys Column */}
        <div className="w-20 bg-[#16181f] border-r border-[#262a34] flex flex-col overflow-y-auto shrink-0 select-none">
          {Array.from({ length: totalNotes }).map((_, idx) => {
            const noteNumber = highestNote - idx;
            const noteName = NOTE_NAMES[noteNumber % 12];
            const octave = Math.floor(noteNumber / 12) - 1;
            const isBlack = noteName.includes('#');

            return (
              <div
                key={noteNumber}
                onClick={() => auditionNote(noteNumber)}
                className={`h-5 border-b border-[#212530] flex items-center justify-between px-2 cursor-pointer transition-colors ${
                  isBlack
                    ? 'bg-[#1e2028] text-zinc-400 hover:bg-[#2c303c]'
                    : 'bg-[#2a2e3a] text-white hover:bg-[#383d4c]'
                }`}
                style={{ height: `${noteRowHeight}px` }}
              >
                <span className="text-[9px] font-mono font-bold">
                  {noteName}
                  {octave}
                </span>
                {noteName === 'C' && (
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                )}
              </div>
            );
          })}
        </div>

        {/* Note Grid */}
        <div className="flex-1 overflow-x-auto overflow-y-auto relative bg-[#0e1014] daw-piano-roll-grid">
          <div
            onClick={handleGridClick}
            className="relative cursor-crosshair"
            style={{
              width: `${totalBeats * pixelsPerBeat}px`,
              height: `${totalNotes * noteRowHeight}px`,
            }}
          >
            {/* Horizontal pitch guides */}
            {Array.from({ length: totalNotes }).map((_, idx) => {
              const noteNumber = highestNote - idx;
              const isBlack = NOTE_NAMES[noteNumber % 12].includes('#');
              return (
                <div
                  key={idx}
                  className={`absolute left-0 right-0 border-b ${
                    isBlack ? 'bg-black/20 border-[#1a1c22]' : 'border-[#20232c]'
                  }`}
                  style={{
                    top: `${idx * noteRowHeight}px`,
                    height: `${noteRowHeight}px`,
                  }}
                />
              );
            })}

            {/* Vertical Bar Lines */}
            {Array.from({ length: totalBeats / 4 }).map((_, bIdx) => (
              <div
                key={bIdx}
                className="absolute top-0 bottom-0 border-l border-zinc-700/40 pointer-events-none"
                style={{ left: `${bIdx * 4 * pixelsPerBeat}px` }}
              />
            ))}

            {/* MIDI Notes */}
            {activeClip?.notes?.map((n) => {
              const noteY = (highestNote - n.note) * noteRowHeight;
              const noteX = n.startBeat * pixelsPerBeat;
              const noteWidth = Math.max(12, n.durationBeats * pixelsPerBeat);

              return (
                <div
                  key={n.id}
                  className="absolute rounded-sm border border-cyan-200/40 shadow-sm flex items-center px-1 text-[9px] font-mono font-bold text-black truncate select-none z-10"
                  style={{
                    top: `${noteY + 1}px`,
                    left: `${noteX}px`,
                    width: `${noteWidth}px`,
                    height: `${noteRowHeight - 2}px`,
                    backgroundColor: currentTrack?.color || '#38bdf8',
                  }}
                >
                  {NOTE_NAMES[n.note % 12]}
                  {Math.floor(n.note / 12) - 1}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
