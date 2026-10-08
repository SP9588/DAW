/**
 * SP Studio DAW - Core Type System
 * Professional Digital Audio Workstation Engine Types
 */

export type SampleRate = 44100 | 48000 | 88200 | 96000 | 176400 | 192000;
export type BitDepth = 16 | 24 | 32;
export type BufferSize = 64 | 128 | 256 | 512 | 1024 | 2048;

export interface AudioDeviceConfig {
  inputDeviceId: string;
  outputDeviceId: string;
  sampleRate: SampleRate;
  bufferSize: BufferSize;
  bitDepth: BitDepth;
  inputMonitoring: boolean;
  latencyCompensationMs: number;
  driverType: 'WASAPI' | 'CoreAudio' | 'ALSA/PipeWire' | 'WebAudio';
}

export interface MidiNote {
  id: string;
  note: number; // 0 - 127 (60 is C4)
  startBeat: number;
  durationBeats: number;
  velocity: number; // 0 - 127
  selected?: boolean;
}

export interface MidiCCEvent {
  cc: number;
  beat: number;
  value: number;
}

export interface AudioClipData {
  buffer?: AudioBuffer;
  waveformPeaks: number[]; // pre-computed min/max peak decimation for 60fps rendering
  durationSeconds: number;
  sampleRate: number;
  gain: number; // 0.0 to 2.0
  fadeIn: number; // in beats
  fadeOut: number; // in beats
  pitchShiftSemi: number;
  timeStretchRatio: number;
  reversed: boolean;
  loop: boolean;
  sourceName?: string;
  blobUrl?: string;
}

export type ClipType = 'audio' | 'midi';

export interface Clip {
  id: string;
  trackId: string;
  name: string;
  type: ClipType;
  startBeat: number;
  durationBeats: number;
  offsetBeats: number;
  color: string;
  audioData?: AudioClipData;
  notes?: MidiNote[];
  ccEvents?: MidiCCEvent[];
  selected?: boolean;
}

export type TrackType = 'audio' | 'instrument' | 'midi' | 'drum' | 'aux' | 'master';

export interface AutomationPoint {
  beat: number;
  value: number; // Normalized 0.0 - 1.0 or specific scale
}

export interface AutomationLane {
  id: string;
  parameter: 'volume' | 'pan' | 'cutoff' | 'resonance' | 'sendA' | 'sendB' | 'reverbMix';
  pluginId?: string;
  mode: 'read' | 'write' | 'touch' | 'latch' | 'off';
  points: AutomationPoint[];
  enabled: boolean;
}

export interface InstrumentConfig {
  id: string;
  type: 'polysynth' | 'fmpiano' | 'sub808' | 'drummachine' | 'sampler' | 'pad';
  name: string;
  presetName: string;
  params: {
    // Synth params
    osc1Wave?: 'sawtooth' | 'square' | 'sine' | 'triangle';
    osc2Wave?: 'sawtooth' | 'square' | 'sine' | 'triangle';
    osc2Detune?: number; // cents
    oscMix?: number; // 0 - 1
    filterCutoff?: number; // Hz (20 - 20000)
    filterResonance?: number; // Q (0.1 - 20)
    attack?: number; // s (0.001 - 5)
    decay?: number; // s (0.01 - 5)
    sustain?: number; // 0 - 1
    release?: number; // s (0.01 - 5)
    glide?: number; // s (0 - 1)
    lfoRate?: number;
    lfoDepth?: number;
    // Drum machine params
    kickTone?: number;
    kickDecay?: number;
    snareSnap?: number;
    hatDecay?: number;
    swing?: number;
    pattern?: boolean[][]; // 8 instruments x 16 steps
  };
}

export interface EffectPlugin {
  id: string;
  type: 'eq' | 'compressor' | 'reverb' | 'delay' | 'chorus' | 'saturation' | 'limiter';
  name: string;
  enabled: boolean;
  params: {
    // EQ
    lowGain?: number; // dB
    midGain?: number;
    midFreq?: number; // Hz
    highGain?: number;
    hpCutoff?: number;
    // Compressor
    threshold?: number; // dB (-60 to 0)
    ratio?: number; // 1 to 20
    attack?: number; // s (0.001 to 0.5)
    release?: number; // s (0.01 to 1)
    knee?: number;
    // Reverb
    decayTime?: number; // s (0.2 to 10)
    preDelay?: number; // ms
    roomSize?: number; // 0 to 1
    damping?: number;
    wetDry?: number; // 0 to 1
    // Delay
    delayTime?: number; // s or synced beats
    feedback?: number; // 0 to 0.95
    pingPong?: boolean;
    // Saturation
    drive?: number; // 0 to 10
    tone?: number;
    // Chorus
    rate?: number;
    depth?: number;
  };
}

export interface Track {
  id: string;
  name: string;
  type: TrackType;
  color: string;
  volume: number; // 0.0 to 1.5 (1.0 = 0dB)
  pan: number; // -1.0 to 1.0 (0 = center)
  mute: boolean;
  solo: boolean;
  armed: boolean;
  monitoring: 'auto' | 'in' | 'off';
  inputChannel: string;
  outputBus: string;
  instrument?: InstrumentConfig;
  effects: EffectPlugin[];
  clips: Clip[];
  automation: AutomationLane[];
  expanded?: boolean;
  meterPeakL?: number;
  meterPeakR?: number;
}

export interface TransportState {
  isPlaying: boolean;
  isRecording: boolean;
  isPaused: boolean;
  isLooping: boolean;
  metronomeEnabled: boolean;
  countInEnabled: boolean;
  punchInEnabled: boolean;
  punchOutEnabled: boolean;
  preRollBars: number;
  currentBeat: number;
  loopStartBeat: number;
  loopEndBeat: number;
  bpm: number;
  timeSignature: [number, number]; // [4, 4]
}

export interface ProjectMetadata {
  id: string;
  title: string;
  artist: string;
  genre: string;
  bpm: number;
  timeSignature: [number, number];
  createdAt: number;
  updatedAt: number;
  version: string;
  notes?: string;
}

export interface ProjectData {
  metadata: ProjectMetadata;
  tracks: Track[];
  masterVolume: number;
  masterPan: number;
  masterEffects: EffectPlugin[];
  tempo: number;
  loopRange: [number, number];
}

export interface MeterData {
  peakL: number;
  peakR: number;
  rmsL: number;
  rmsR: number;
  lufsIntegrated: number;
  lufsShortTerm: number;
  truePeak: number;
  dynamicRange: number;
  phaseCorrelation: number;
}

export type ViewMode = 'arrangement' | 'mixer' | 'pianoroll' | 'performance' | 'mastering' | 'vocal';

export interface PerformanceCell {
  id: string;
  trackId: string;
  sceneIndex: number;
  clipName: string;
  isPlaying: boolean;
  isQueued: boolean;
  color: string;
  type: 'synth' | 'drums' | 'bass' | 'vocal' | 'pad';
}

export interface DJDeckState {
  trackName: string;
  artist: string;
  isPlaying: boolean;
  bpm: number;
  pitch: number; // -8% to +8%
  currentBeat: number;
  cueBeat: number;
  loopActive: boolean;
  loopLength: number; // in beats (1, 2, 4, 8, 16)
  volume: number;
  eqHigh: number; // dB (-24 to +6)
  eqMid: number;
  eqLow: number;
  filter: number; // -1 (LPF) to 0 (off) to 1 (HPF)
  syncActive: boolean;
  hotCues: (number | null)[]; // 4 hot cue positions in beats
}
