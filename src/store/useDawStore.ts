/**
 * SP Studio DAW - Primary State Store & Reactive Controller
 * Manages project configuration, tracks, clips, automation, mixer channels,
 * transport loop timing, undo/redo history, and workspace modes.
 */

import { useState, useEffect } from 'react';
import {
  Track,
  Clip,
  TransportState,
  ProjectMetadata,
  ProjectData,
  ViewMode,
  AudioDeviceConfig,
  EffectPlugin,
  DJDeckState,
  PerformanceCell,
} from '../types/daw';
import { AudioEngine } from '../audio/AudioEngine';

// Default starter project factory
const createDefaultTracks = (): Track[] => [
  {
    id: 'trk_drums',
    name: '808 Drum Sequencer',
    type: 'drum',
    color: '#f43f5e', // Rose
    volume: 0.9,
    pan: 0.0,
    mute: false,
    solo: false,
    armed: false,
    monitoring: 'auto',
    inputChannel: 'Input 1-2',
    outputBus: 'Master',
    instrument: {
      id: 'inst_drums',
      type: 'drummachine',
      name: 'SP-808 Groove Kit',
      presetName: 'Trap Classic 808',
      params: {
        swing: 15,
        pattern: [
          // Kick: beats 1, 1.75, 3
          [true, false, false, false, false, false, true, false, true, false, false, false, false, false, false, false],
          // Snare: beats 2, 4
          [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
          // Clap
          [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false],
          // Closed Hat: 16th notes
          [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, true],
          // Open Hat: offbeats
          [false, false, true, false, false, false, true, false, false, false, true, false, false, false, true, false],
          // Tom
          [false, false, false, false, false, false, false, false, false, false, false, false, false, true, true, false],
          // Crash
          [true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
        ],
      },
    },
    effects: [
      {
        id: 'fx_drum_eq',
        type: 'eq',
        name: 'Punch EQ',
        enabled: true,
        params: { lowGain: 3.5, midGain: -2.0, highGain: 2.0 },
      },
      {
        id: 'fx_drum_comp',
        type: 'compressor',
        name: 'Glue Compressor',
        enabled: true,
        params: { threshold: -16, ratio: 4, attack: 0.01, release: 0.1 },
      },
    ],
    clips: [
      {
        id: 'clip_drums_1',
        trackId: 'trk_drums',
        name: 'Main Beat A',
        type: 'midi',
        startBeat: 0,
        durationBeats: 8,
        offsetBeats: 0,
        color: '#f43f5e',
        notes: [
          { id: 'n1', note: 36, startBeat: 0, durationBeats: 0.5, velocity: 120 }, // Kick
          { id: 'n2', note: 38, startBeat: 2, durationBeats: 0.5, velocity: 110 }, // Snare
          { id: 'n3', note: 36, startBeat: 3.5, durationBeats: 0.5, velocity: 115 }, // Kick
          { id: 'n4', note: 38, startBeat: 6, durationBeats: 0.5, velocity: 112 }, // Snare
        ],
      },
      {
        id: 'clip_drums_2',
        trackId: 'trk_drums',
        name: 'Main Beat B (Fill)',
        type: 'midi',
        startBeat: 8,
        durationBeats: 8,
        offsetBeats: 0,
        color: '#f43f5e',
        notes: [
          { id: 'n5', note: 36, startBeat: 0, durationBeats: 0.5, velocity: 120 },
          { id: 'n6', note: 38, startBeat: 2, durationBeats: 0.5, velocity: 110 },
          { id: 'n7', note: 42, startBeat: 4, durationBeats: 0.25, velocity: 100 },
          { id: 'n8', note: 42, startBeat: 6, durationBeats: 0.25, velocity: 110 },
        ],
      },
    ],
    automation: [],
  },
  {
    id: 'trk_bass',
    name: 'Analog Sub 808',
    type: 'instrument',
    color: '#06b6d4', // Cyan
    volume: 0.85,
    pan: 0.0,
    mute: false,
    solo: false,
    armed: false,
    monitoring: 'auto',
    inputChannel: 'MIDI All',
    outputBus: 'Master',
    instrument: {
      id: 'inst_bass',
      type: 'sub808',
      name: 'Sub Overdrive 808',
      presetName: 'Deep Glide Sub',
      params: {
        attack: 0.01,
        decay: 0.8,
        sustain: 0.2,
        release: 0.1,
      },
    },
    effects: [
      {
        id: 'fx_bass_sat',
        type: 'saturation',
        name: 'Tape Drive',
        enabled: true,
        params: { drive: 4 },
      },
    ],
    clips: [
      {
        id: 'clip_bass_1',
        trackId: 'trk_bass',
        name: '808 Groove C-G-Am-F',
        type: 'midi',
        startBeat: 0,
        durationBeats: 16,
        offsetBeats: 0,
        color: '#06b6d4',
        notes: [
          { id: 'b1', note: 36, startBeat: 0, durationBeats: 3.5, velocity: 120 }, // C1
          { id: 'b2', note: 43, startBeat: 4, durationBeats: 3.5, velocity: 115 }, // G1
          { id: 'b3', note: 45, startBeat: 8, durationBeats: 3.5, velocity: 118 }, // A1
          { id: 'b4', note: 41, startBeat: 12, durationBeats: 3.5, velocity: 115 }, // F1
        ],
      },
    ],
    automation: [],
  },
  {
    id: 'trk_keys',
    name: 'FM Electric Keys',
    type: 'instrument',
    color: '#8b5cf6', // Violet
    volume: 0.8,
    pan: -0.2,
    mute: false,
    solo: false,
    armed: false,
    monitoring: 'auto',
    inputChannel: 'MIDI All',
    outputBus: 'Master',
    instrument: {
      id: 'inst_keys',
      type: 'fmpiano',
      name: 'Neo Tine Bell MK-II',
      presetName: 'Velvet Suitcase',
      params: {},
    },
    effects: [
      {
        id: 'fx_keys_chorus',
        type: 'chorus',
        name: 'Stereo Dimension',
        enabled: true,
        params: { rate: 1.2, depth: 0.4 },
      },
      {
        id: 'fx_keys_reverb',
        type: 'reverb',
        name: 'Silk Room',
        enabled: true,
        params: { wetDry: 0.28, decayTime: 2.4 },
      },
    ],
    clips: [
      {
        id: 'clip_keys_1',
        trackId: 'trk_keys',
        name: 'Neo Chords (Cmaj9 - G13 - Am9 - Fmaj7)',
        type: 'midi',
        startBeat: 0,
        durationBeats: 16,
        offsetBeats: 0,
        color: '#8b5cf6',
        notes: [
          // Cmaj9 (C, E, G, B, D)
          { id: 'k1', note: 60, startBeat: 0, durationBeats: 3.8, velocity: 85 },
          { id: 'k2', note: 64, startBeat: 0, durationBeats: 3.8, velocity: 80 },
          { id: 'k3', note: 67, startBeat: 0, durationBeats: 3.8, velocity: 82 },
          { id: 'k4', note: 71, startBeat: 0, durationBeats: 3.8, velocity: 88 },
          // G13
          { id: 'k5', note: 59, startBeat: 4, durationBeats: 3.8, velocity: 86 },
          { id: 'k6', note: 62, startBeat: 4, durationBeats: 3.8, velocity: 82 },
          { id: 'k7', note: 65, startBeat: 4, durationBeats: 3.8, velocity: 84 },
          { id: 'k8', note: 69, startBeat: 4, durationBeats: 3.8, velocity: 85 },
          // Am9
          { id: 'k9', note: 57, startBeat: 8, durationBeats: 3.8, velocity: 86 },
          { id: 'k10', note: 60, startBeat: 8, durationBeats: 3.8, velocity: 82 },
          { id: 'k11', note: 64, startBeat: 8, durationBeats: 3.8, velocity: 84 },
          { id: 'k12', note: 67, startBeat: 8, durationBeats: 3.8, velocity: 85 },
          // Fmaj7
          { id: 'k13', note: 53, startBeat: 12, durationBeats: 3.8, velocity: 86 },
          { id: 'k14', note: 57, startBeat: 12, durationBeats: 3.8, velocity: 82 },
          { id: 'k15', note: 60, startBeat: 12, durationBeats: 3.8, velocity: 84 },
          { id: 'k16', note: 64, startBeat: 12, durationBeats: 3.8, velocity: 85 },
        ],
      },
    ],
    automation: [],
  },
  {
    id: 'trk_lead',
    name: 'Analog Poly Synth',
    type: 'instrument',
    color: '#38bdf8', // Sky Blue
    volume: 0.75,
    pan: 0.25,
    mute: false,
    solo: false,
    armed: false,
    monitoring: 'auto',
    inputChannel: 'MIDI All',
    outputBus: 'Master',
    instrument: {
      id: 'inst_lead',
      type: 'polysynth',
      name: 'Jupiter Poly Lead',
      presetName: 'Sunset Arp',
      params: {
        osc1Wave: 'sawtooth',
        osc2Wave: 'square',
        osc2Detune: 8,
        filterCutoff: 3800,
        filterResonance: 3.5,
        attack: 0.04,
        decay: 0.3,
        sustain: 0.5,
        release: 0.4,
      },
    },
    effects: [
      {
        id: 'fx_lead_delay',
        type: 'delay',
        name: 'Ping-Pong Echo',
        enabled: true,
        params: { delayTime: 0.35, feedback: 0.45 },
      },
    ],
    clips: [
      {
        id: 'clip_lead_1',
        trackId: 'trk_lead',
        name: 'Arp Motif',
        type: 'midi',
        startBeat: 4,
        durationBeats: 12,
        offsetBeats: 0,
        color: '#38bdf8',
        notes: [
          { id: 'l1', note: 72, startBeat: 4, durationBeats: 0.75, velocity: 95 },
          { id: 'l2', note: 74, startBeat: 5, durationBeats: 0.75, velocity: 90 },
          { id: 'l3', note: 76, startBeat: 6, durationBeats: 0.75, velocity: 100 },
          { id: 'l4', note: 79, startBeat: 7, durationBeats: 1.0, velocity: 105 },
          { id: 'l5', note: 81, startBeat: 8, durationBeats: 0.75, velocity: 95 },
          { id: 'l6', note: 79, startBeat: 9, durationBeats: 0.75, velocity: 90 },
          { id: 'l7', note: 76, startBeat: 10, durationBeats: 0.75, velocity: 88 },
          { id: 'l8', note: 74, startBeat: 11, durationBeats: 1.0, velocity: 92 },
        ],
      },
    ],
    automation: [],
  },
  {
    id: 'trk_vocal',
    name: 'Audio Vocal / Mic',
    type: 'audio',
    color: '#eab308', // Amber
    volume: 0.85,
    pan: 0.0,
    mute: false,
    solo: false,
    armed: false,
    monitoring: 'auto',
    inputChannel: 'Input 1 (Mic)',
    outputBus: 'Master',
    effects: [
      {
        id: 'fx_vocal_eq',
        type: 'eq',
        name: 'Vocal Clarity Air',
        enabled: true,
        params: { hpCutoff: 100, lowGain: -1.5, midGain: 1.2, highGain: 2.8 },
      },
      {
        id: 'fx_vocal_comp',
        type: 'compressor',
        name: 'Optical Vocal Leveler',
        enabled: true,
        params: { threshold: -20, ratio: 3.5, attack: 0.02, release: 0.25 },
      },
      {
        id: 'fx_vocal_reverb',
        type: 'reverb',
        name: 'Vocal Lush Plate',
        enabled: true,
        params: { wetDry: 0.22, decayTime: 2.8 },
      },
    ],
    clips: [
      {
        id: 'clip_vocal_1',
        trackId: 'trk_vocal',
        name: 'Lead Vocal Hook Take 1',
        type: 'audio',
        startBeat: 8,
        durationBeats: 8,
        offsetBeats: 0,
        color: '#eab308',
        audioData: {
          durationSeconds: 3.87,
          sampleRate: 48000,
          gain: 1.0,
          fadeIn: 0.25,
          fadeOut: 0.5,
          pitchShiftSemi: 0,
          timeStretchRatio: 1.0,
          reversed: false,
          loop: false,
          sourceName: 'Lead_Vocal_Take1.wav',
          waveformPeaks: [
            0.1, 0.2, 0.4, 0.6, 0.75, 0.82, 0.65, 0.4, 0.2, 0.35, 0.55, 0.88, 0.95, 0.72, 0.45, 0.3,
            0.15, 0.38, 0.62, 0.8, 0.7, 0.5, 0.3, 0.25, 0.45, 0.68, 0.9, 0.84, 0.6, 0.35, 0.2, 0.1,
          ],
        },
      },
    ],
    automation: [],
  },
];

const defaultMetadata: ProjectMetadata = {
  id: 'prj_neon_horizon',
  title: 'Neon Horizon — SP Studio Master',
  artist: 'Santosh Prasad',
  genre: 'Synthwave / Melodic Electronic',
  bpm: 124,
  timeSignature: [4, 4],
  createdAt: Date.now() - 3600000,
  updatedAt: Date.now(),
  version: '1.0.0',
  notes: 'Session master for SP Studio DAW demonstration. Features 808 kit, FM Rhodes, Jupiter PolySynth, and Vocal Take.',
};

const defaultAudioConfig: AudioDeviceConfig = {
  inputDeviceId: 'default',
  outputDeviceId: 'default',
  sampleRate: 48000,
  bufferSize: 256,
  bitDepth: 24,
  inputMonitoring: true,
  latencyCompensationMs: 0,
  driverType: 'WebAudio',
};

const defaultDJDecks: { deckA: DJDeckState; deckB: DJDeckState } = {
  deckA: {
    trackName: 'Midnight Drive (Original Mix)',
    artist: 'SP Sound Collective',
    isPlaying: false,
    bpm: 124,
    pitch: 0,
    currentBeat: 0,
    cueBeat: 0,
    loopActive: false,
    loopLength: 4,
    volume: 1.0,
    eqHigh: 0,
    eqMid: 0,
    eqLow: 0,
    filter: 0,
    syncActive: true,
    hotCues: [0, 16, 32, 64],
  },
  deckB: {
    trackName: 'Cyber Sunset (Club Dub)',
    artist: 'Vapor Waveform',
    isPlaying: false,
    bpm: 124,
    pitch: 0,
    currentBeat: 0,
    cueBeat: 0,
    loopActive: false,
    loopLength: 8,
    volume: 1.0,
    eqHigh: 0,
    eqMid: 0,
    eqLow: 0,
    filter: 0,
    syncActive: false,
    hotCues: [0, 8, 24, 48],
  },
};

// Global Store State Singleton to preserve state across views
let globalState = {
  metadata: defaultMetadata,
  tracks: createDefaultTracks(),
  selectedTrackId: 'trk_drums',
  selectedClipId: 'clip_drums_1',
  activeView: 'arrangement' as ViewMode,
  bottomTab: 'mixer' as 'mixer' | 'pianoroll' | 'instruments' | 'effects' | 'dj',
  sidebarTab: 'browser' as 'browser' | 'plugins' | 'templates' | 'files',
  showInspector: true,
  zoomLevel: 1.0, // pixels per beat scale factor
  gridSnap: '1/16' as '1/4' | '1/8' | '1/16' | '1/32' | 'off',
  history: [] as Track[][],
  historyIndex: -1,
  audioConfig: defaultAudioConfig,
  masterVolume: 0.85,
  masterPan: 0.0,
  djDecks: defaultDJDecks,
  crossfader: 0.0, // -1 (A) to +1 (B)
  transport: {
    isPlaying: false,
    isRecording: false,
    isPaused: false,
    isLooping: true,
    metronomeEnabled: false,
    countInEnabled: false,
    punchInEnabled: false,
    punchOutEnabled: false,
    preRollBars: 1,
    currentBeat: 0,
    loopStartBeat: 0,
    loopEndBeat: 16,
    bpm: 124,
    timeSignature: [4, 4] as [number, number],
  } as TransportState,
};

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

// Playhead Animation Clock
let playbackInterval: number | null = null;
let lastTimestamp = 0;

export function useDawStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const handleUpdate = () => setTick((t) => t + 1);
    listeners.add(handleUpdate);
    return () => {
      listeners.delete(handleUpdate);
    };
  }, []);

  const state = globalState;

  // Actions
  const setTracks = (updater: (prev: Track[]) => Track[]) => {
    // Save to history for undo
    if (globalState.history.length > 30) {
      globalState.history.shift();
    }
    globalState.history.push(JSON.parse(JSON.stringify(globalState.tracks)));
    globalState.tracks = updater(globalState.tracks);
    notify();
  };

  const undo = () => {
    if (globalState.history.length > 0) {
      const prevTracks = globalState.history.pop()!;
      globalState.tracks = prevTracks;
      notify();
    }
  };

  const setSelectedTrackId = (id: string) => {
    globalState.selectedTrackId = id;
    notify();
  };

  const setSelectedClipId = (id: string) => {
    globalState.selectedClipId = id;
    notify();
  };

  const setActiveView = (view: ViewMode) => {
    globalState.activeView = view;
    notify();
  };

  const setBottomTab = (tab: 'mixer' | 'pianoroll' | 'instruments' | 'effects' | 'dj') => {
    globalState.bottomTab = tab;
    notify();
  };

  const setSidebarTab = (tab: 'browser' | 'plugins' | 'templates' | 'files') => {
    globalState.sidebarTab = tab;
    notify();
  };

  const toggleInspector = () => {
    globalState.showInspector = !globalState.showInspector;
    notify();
  };

  const setZoomLevel = (zoom: number) => {
    globalState.zoomLevel = Math.max(0.4, Math.min(zoom, 3.0));
    notify();
  };

  const setGridSnap = (snap: '1/4' | '1/8' | '1/16' | '1/32' | 'off') => {
    globalState.gridSnap = snap;
    notify();
  };

  const setMasterVolume = (val: number) => {
    globalState.masterVolume = val;
    AudioEngine.getInstance().setMasterVolume(val);
    notify();
  };

  const setMasterPan = (val: number) => {
    globalState.masterPan = val;
    notify();
  };

  const updateTrackVolume = (trackId: string, volume: number) => {
    setTracks((tracks) =>
      tracks.map((t) => (t.id === trackId ? { ...t, volume } : t))
    );
    AudioEngine.getInstance().updateTrackVolume(trackId, volume);
  };

  const updateTrackPan = (trackId: string, pan: number) => {
    setTracks((tracks) =>
      tracks.map((t) => (t.id === trackId ? { ...t, pan } : t))
    );
    AudioEngine.getInstance().updateTrackPan(trackId, pan);
  };

  const toggleTrackMute = (trackId: string) => {
    setTracks((tracks) =>
      tracks.map((t) => (t.id === trackId ? { ...t, mute: !t.mute } : t))
    );
  };

  const toggleTrackSolo = (trackId: string) => {
    setTracks((tracks) => {
      const target = tracks.find((t) => t.id === trackId);
      const newSolo = !target?.solo;
      return tracks.map((t) => (t.id === trackId ? { ...t, solo: newSolo } : t));
    });
  };

  const toggleTrackArm = (trackId: string) => {
    setTracks((tracks) =>
      tracks.map((t) => (t.id === trackId ? { ...t, armed: !t.armed } : t))
    );
  };

  const setBpm = (bpm: number) => {
    const clampedBpm = Math.max(40, Math.min(280, Math.round(bpm)));
    globalState.transport.bpm = clampedBpm;
    globalState.metadata.bpm = clampedBpm;
    notify();
  };

  const setTimeSignature = (sig: [number, number]) => {
    globalState.transport.timeSignature = sig;
    globalState.metadata.timeSignature = sig;
    notify();
  };

  const setPlayheadBeat = (beat: number) => {
    globalState.transport.currentBeat = Math.max(0, beat);
    notify();
  };

  const setLoopRange = (start: number, end: number) => {
    globalState.transport.loopStartBeat = Math.max(0, start);
    globalState.transport.loopEndBeat = Math.max(start + 1, end);
    notify();
  };

  const toggleLoop = () => {
    globalState.transport.isLooping = !globalState.transport.isLooping;
    notify();
  };

  const toggleMetronome = () => {
    globalState.transport.metronomeEnabled = !globalState.transport.metronomeEnabled;
    notify();
  };

  // Playback control
  const startPlayback = async () => {
    const engine = AudioEngine.getInstance();
    await engine.init(globalState.audioConfig.sampleRate);

    globalState.transport.isPlaying = true;
    globalState.transport.isPaused = false;
    lastTimestamp = performance.now();

    if (playbackInterval) cancelAnimationFrame(playbackInterval);

    let lastBeatInteger = Math.floor(globalState.transport.currentBeat);

    const step = (timestamp: number) => {
      if (!globalState.transport.isPlaying) return;

      const deltaSeconds = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;

      const beatsPerSecond = globalState.transport.bpm / 60;
      let newBeat = globalState.transport.currentBeat + deltaSeconds * beatsPerSecond;

      // Metronome tick
      const curInt = Math.floor(newBeat);
      if (curInt !== lastBeatInteger) {
        if (globalState.transport.metronomeEnabled) {
          const isDownbeat = curInt % globalState.transport.timeSignature[0] === 0;
          engine.playMetronomeTick(isDownbeat);
        }

        // Audition / trigger current active clips notes at beat transitions
        triggerLiveNotesAtBeat(curInt, engine);
        lastBeatInteger = curInt;
      }

      // Loop handling
      if (globalState.transport.isLooping && newBeat >= globalState.transport.loopEndBeat) {
        newBeat = globalState.transport.loopStartBeat;
        lastBeatInteger = Math.floor(newBeat);
      }

      globalState.transport.currentBeat = newBeat;
      notify();
      playbackInterval = requestAnimationFrame(step);
    };

    playbackInterval = requestAnimationFrame(step);
    notify();
  };

  const stopPlayback = () => {
    globalState.transport.isPlaying = false;
    globalState.transport.isPaused = false;
    globalState.transport.isRecording = false;
    if (playbackInterval) {
      cancelAnimationFrame(playbackInterval);
      playbackInterval = null;
    }
    notify();
  };

  const pausePlayback = () => {
    globalState.transport.isPlaying = false;
    globalState.transport.isPaused = true;
    if (playbackInterval) {
      cancelAnimationFrame(playbackInterval);
      playbackInterval = null;
    }
    notify();
  };

  const togglePlay = () => {
    if (globalState.transport.isPlaying) {
      pausePlayback();
    } else {
      startPlayback();
    }
  };

  // Recording
  const startRecording = async () => {
    const engine = AudioEngine.getInstance();
    const success = await engine.startMicrophoneRecording();
    if (success) {
      globalState.transport.isRecording = true;
      startPlayback();
    }
  };

  const stopRecording = async () => {
    const engine = AudioEngine.getInstance();
    stopPlayback();
    const recResult = await engine.stopMicrophoneRecording();
    if (recResult) {
      // Find armed track or default to vocal track
      const armedTrack = globalState.tracks.find((t) => t.armed) || globalState.tracks.find((t) => t.type === 'audio');
      if (armedTrack) {
        const newClip: Clip = {
          id: `clip_rec_${Date.now()}`,
          trackId: armedTrack.id,
          name: `Recording Take #${armedTrack.clips.length + 1}`,
          type: 'audio',
          startBeat: Math.floor(globalState.transport.currentBeat),
          durationBeats: Math.max(2, Math.round(recResult.buffer.duration * (globalState.transport.bpm / 60))),
          offsetBeats: 0,
          color: armedTrack.color,
          audioData: {
            buffer: recResult.buffer,
            waveformPeaks: recResult.peaks,
            durationSeconds: recResult.buffer.duration,
            sampleRate: recResult.buffer.sampleRate,
            gain: 1.0,
            fadeIn: 0.1,
            fadeOut: 0.2,
            pitchShiftSemi: 0,
            timeStretchRatio: 1.0,
            reversed: false,
            loop: false,
            blobUrl: URL.createObjectURL(recResult.blob),
            sourceName: `LiveTake_${new Date().toLocaleTimeString()}.wav`,
          },
        };

        setTracks((tracks) =>
          tracks.map((t) => (t.id === armedTrack.id ? { ...t, clips: [...t.clips, newClip] } : t))
        );
        setSelectedClipId(newClip.id);
      }
    }
  };

  // DJ and Crossfader controls
  const setCrossfader = (val: number) => {
    globalState.crossfader = Math.max(-1, Math.min(1, val));
    notify();
  };

  const updateDJDeck = (deck: 'deckA' | 'deckB', updates: Partial<DJDeckState>) => {
    globalState.djDecks[deck] = { ...globalState.djDecks[deck], ...updates };
    notify();
  };

  // Add new track
  const addTrack = (type: Track['type']) => {
    const colors: Record<Track['type'], string> = {
      audio: '#eab308',
      instrument: '#38bdf8',
      midi: '#a855f7',
      drum: '#f43f5e',
      aux: '#10b981',
      master: '#6366f1',
    };

    const newId = `trk_${Date.now()}`;
    const newTrack: Track = {
      id: newId,
      name: `New ${type.toUpperCase()} Track ${globalState.tracks.length + 1}`,
      type,
      color: colors[type] || '#38bdf8',
      volume: 0.8,
      pan: 0.0,
      mute: false,
      solo: false,
      armed: false,
      monitoring: 'auto',
      inputChannel: type === 'audio' ? 'Input 1 (Mic)' : 'MIDI All',
      outputBus: 'Master',
      instrument:
        type === 'instrument'
          ? {
              id: `inst_${newId}`,
              type: 'polysynth',
              name: 'Poly Synth',
              presetName: 'Warm Pad',
              params: { osc1Wave: 'sawtooth', osc2Wave: 'triangle' },
            }
          : undefined,
      effects: [],
      clips: [],
      automation: [],
    };

    setTracks((tracks) => [...tracks, newTrack]);
    setSelectedTrackId(newId);
  };

  const deleteTrack = (trackId: string) => {
    setTracks((tracks) => tracks.filter((t) => t.id !== trackId));
    if (globalState.selectedTrackId === trackId && globalState.tracks.length > 0) {
      globalState.selectedTrackId = globalState.tracks[0].id;
    }
  };

  // Clip manipulation
  const addClip = (trackId: string, clip: Clip) => {
    setTracks((tracks) =>
      tracks.map((t) => (t.id === trackId ? { ...t, clips: [...t.clips, clip] } : t))
    );
  };

  const deleteClip = (clipId: string) => {
    setTracks((tracks) =>
      tracks.map((t) => ({ ...t, clips: t.clips.filter((c) => c.id !== clipId) }))
    );
  };

  // Save / Load Project
  const exportProjectJson = (): string => {
    const projectData: ProjectData = {
      metadata: { ...globalState.metadata, updatedAt: Date.now() },
      tracks: globalState.tracks,
      masterVolume: globalState.masterVolume,
      masterPan: globalState.masterPan,
      masterEffects: [],
      tempo: globalState.transport.bpm,
      loopRange: [globalState.transport.loopStartBeat, globalState.transport.loopEndBeat],
    };
    return JSON.stringify(projectData, null, 2);
  };

  const importProjectJson = (jsonStr: string): boolean => {
    try {
      const data: ProjectData = JSON.parse(jsonStr);
      if (data.tracks && Array.isArray(data.tracks)) {
        globalState.metadata = data.metadata || defaultMetadata;
        globalState.tracks = data.tracks;
        globalState.transport.bpm = data.tempo || 124;
        globalState.masterVolume = data.masterVolume ?? 0.85;
        if (data.loopRange) {
          globalState.transport.loopStartBeat = data.loopRange[0];
          globalState.transport.loopEndBeat = data.loopRange[1];
        }
        notify();
        return true;
      }
      return false;
    } catch (e) {
      console.error('Failed to parse .spstudio project JSON:', e);
      return false;
    }
  };

  return {
    state,
    setTracks,
    undo,
    setSelectedTrackId,
    setSelectedClipId,
    setActiveView,
    setBottomTab,
    setSidebarTab,
    toggleInspector,
    setZoomLevel,
    setGridSnap,
    setMasterVolume,
    setMasterPan,
    updateTrackVolume,
    updateTrackPan,
    toggleTrackMute,
    toggleTrackSolo,
    toggleTrackArm,
    setBpm,
    setTimeSignature,
    setPlayheadBeat,
    setLoopRange,
    toggleLoop,
    toggleMetronome,
    startPlayback,
    stopPlayback,
    pausePlayback,
    togglePlay,
    startRecording,
    stopRecording,
    setCrossfader,
    updateDJDeck,
    addTrack,
    deleteTrack,
    addClip,
    deleteClip,
    exportProjectJson,
    importProjectJson,
  };
}

/**
 * Triggers synth or drum events when the transport cursor crosses a beat
 */
function triggerLiveNotesAtBeat(beat: number, engine: AudioEngine) {
  const tracks = globalState.tracks;

  for (const track of tracks) {
    if (track.mute) continue;

    // Check Drum Machine step patterns
    if (track.type === 'drum' && track.instrument?.params.pattern) {
      const stepInMeasure = (beat * 4) % 16;
      const pattern = track.instrument.params.pattern;
      const drumTypes = ['kick', 'snare', 'clap', 'hihat', 'openhat', 'tom', 'crash'];
      pattern.forEach((row, rowIndex) => {
        if (row[stepInMeasure] && drumTypes[rowIndex]) {
          engine.playDrum(drumTypes[rowIndex], 105);
        }
      });
    }

    // Check MIDI clips
    for (const clip of track.clips) {
      if (clip.type === 'midi' && clip.notes) {
        const localBeat = beat - clip.startBeat;
        for (const note of clip.notes) {
          if (Math.abs(note.startBeat - localBeat) < 0.25) {
            if (track.instrument?.type === 'sub808') {
              engine.play808Bass(note.note, note.velocity, 0.6);
            } else if (track.instrument?.type === 'fmpiano') {
              engine.playFmPiano(note.note, note.velocity, 0.7);
            } else {
              engine.playPolySynth(note.note, note.velocity, 0.5, track.instrument?.params);
            }
          }
        }
      }
    }
  }
}
