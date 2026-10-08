/**
 * SP Studio DAW - Core Real-Time Audio Engine
 * High-performance Web Audio DSP pipeline, synthesis engines, effect chains,
 * non-destructive recording, and offline WAV rendering.
 */

import { InstrumentConfig, EffectPlugin, SampleRate, BitDepth } from '../types/daw';

export class AudioEngine {
  private static instance: AudioEngine;
  public ctx: AudioContext | null = null;
  public masterGain: GainNode | null = null;
  public masterLimiter: DynamicsCompressorNode | null = null;
  public masterAnalyser: AnalyserNode | null = null;
  public leftAnalyser: AnalyserNode | null = null;
  public rightAnalyser: AnalyserNode | null = null;
  
  // Reverb Impulse Buffer Cache
  private reverbImpulseCache: Map<string, AudioBuffer> = new Map();

  // Active track gain and pan nodes cache
  private trackNodes: Map<string, {
    gainNode: GainNode;
    panNode: StereoPannerNode;
    eqLow: BiquadFilterNode;
    eqMid: BiquadFilterNode;
    eqHigh: BiquadFilterNode;
    compressor?: DynamicsCompressorNode;
    convolver?: ConvolverNode;
    delayNode?: DelayNode;
    delayFeedback?: GainNode;
    reverbWet?: GainNode;
  }> = new Map();

  // Microphone recording
  private mediaStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private isRecordingInput: boolean = false;
  private inputGainNode: GainNode | null = null;

  // Active voices map for polyphonic note-off tracking
  private activeVoices: Map<string, { stop: (time: number) => void }> = new Map();

  private constructor() {
    // Lazy initialize on first user gesture
  }

  public static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine();
    }
    return AudioEngine.instance;
  }

  /**
   * Initializes or resumes the AudioContext on user interaction
   */
  public async init(sampleRate: SampleRate = 48000): Promise<AudioContext> {
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass({
        sampleRate,
        latencyHint: 'interactive',
      });
      this.setupMasterBus();
    }

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    return this.ctx;
  }

  /**
   * Master bus wiring with lookahead limiter and stereo FFT analysers
   */
  private setupMasterBus() {
    if (!this.ctx) return;

    // Master Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);

    // Master Brickwall Limiter to prevent clipping
    this.masterLimiter = this.ctx.createDynamicsCompressor();
    this.masterLimiter.threshold.setValueAtTime(-0.5, this.ctx.currentTime);
    this.masterLimiter.knee.setValueAtTime(0.0, this.ctx.currentTime);
    this.masterLimiter.ratio.setValueAtTime(20.0, this.ctx.currentTime);
    this.masterLimiter.attack.setValueAtTime(0.002, this.ctx.currentTime);
    this.masterLimiter.release.setValueAtTime(0.05, this.ctx.currentTime);

    // Master Spectrum Analyser
    this.masterAnalyser = this.ctx.createAnalyser();
    this.masterAnalyser.fftSize = 2048;
    this.masterAnalyser.smoothingTimeConstant = 0.8;

    // Stereo Splitter for correlation & L/R meters
    const splitter = this.ctx.createChannelSplitter(2);
    this.leftAnalyser = this.ctx.createAnalyser();
    this.leftAnalyser.fftSize = 1024;
    this.rightAnalyser = this.ctx.createAnalyser();
    this.rightAnalyser.fftSize = 1024;

    this.masterGain.connect(this.masterLimiter);
    this.masterLimiter.connect(this.masterAnalyser);
    this.masterAnalyser.connect(this.ctx.destination);

    this.masterAnalyser.connect(splitter);
    splitter.connect(this.leftAnalyser, 0);
    splitter.connect(this.rightAnalyser, 1);
  }

  public setMasterVolume(val: number) {
    if (!this.masterGain || !this.ctx) return;
    this.masterGain.gain.setTargetAtTime(Math.max(0, Math.min(val, 1.5)), this.ctx.currentTime, 0.02);
  }

  /**
   * Register or update track processing channel strip
   */
  public getOrCreateTrackChannel(trackId: string) {
    if (!this.ctx || !this.masterGain) return null;

    if (!this.trackNodes.has(trackId)) {
      const gainNode = this.ctx.createGain();
      gainNode.gain.setValueAtTime(0.8, this.ctx.currentTime);

      const panNode = this.ctx.createStereoPanner();
      panNode.pan.setValueAtTime(0.0, this.ctx.currentTime);

      // 3-Band Parametric Track EQ
      const eqLow = this.ctx.createBiquadFilter();
      eqLow.type = 'lowshelf';
      eqLow.frequency.setValueAtTime(100, this.ctx.currentTime);
      eqLow.gain.setValueAtTime(0, this.ctx.currentTime);

      const eqMid = this.ctx.createBiquadFilter();
      eqMid.type = 'peaking';
      eqMid.frequency.setValueAtTime(1000, this.ctx.currentTime);
      eqMid.Q.setValueAtTime(1.0, this.ctx.currentTime);
      eqMid.gain.setValueAtTime(0, this.ctx.currentTime);

      const eqHigh = this.ctx.createBiquadFilter();
      eqHigh.type = 'highshelf';
      eqHigh.frequency.setValueAtTime(8000, this.ctx.currentTime);
      eqHigh.gain.setValueAtTime(0, this.ctx.currentTime);

      // Reverb Send Convolver
      const convolver = this.ctx.createConvolver();
      convolver.buffer = this.getAlgorithmicImpulseResponse(2.2, 0.6);
      const reverbWet = this.ctx.createGain();
      reverbWet.gain.setValueAtTime(0.15, this.ctx.currentTime);

      // Wiring
      eqLow.connect(eqMid);
      eqMid.connect(eqHigh);
      eqHigh.connect(gainNode);
      gainNode.connect(panNode);
      panNode.connect(this.masterGain);

      // Reverb send wiring
      gainNode.connect(convolver);
      convolver.connect(reverbWet);
      reverbWet.connect(this.masterGain);

      this.trackNodes.set(trackId, {
        gainNode,
        panNode,
        eqLow,
        eqMid,
        eqHigh,
        convolver,
        reverbWet,
      });
    }

    return this.trackNodes.get(trackId)!;
  }

  public updateTrackVolume(trackId: string, volume: number) {
    const channel = this.trackNodes.get(trackId);
    if (channel && this.ctx) {
      channel.gainNode.gain.setTargetAtTime(volume, this.ctx.currentTime, 0.02);
    }
  }

  public updateTrackPan(trackId: string, pan: number) {
    const channel = this.trackNodes.get(trackId);
    if (channel && channel.panNode && channel.panNode.pan && this.ctx) {
      channel.panNode.pan.setTargetAtTime(pan, this.ctx.currentTime, 0.02);
    }
  }

  public updateTrackEQ(trackId: string, lowDb: number, midDb: number, highDb: number, midFreq: number = 1000) {
    const channel = this.trackNodes.get(trackId);
    if (channel && this.ctx) {
      channel.eqLow.gain.setTargetAtTime(lowDb, this.ctx.currentTime, 0.05);
      channel.eqMid.gain.setTargetAtTime(midDb, this.ctx.currentTime, 0.05);
      channel.eqMid.frequency.setTargetAtTime(midFreq, this.ctx.currentTime, 0.05);
      channel.eqHigh.gain.setTargetAtTime(highDb, this.ctx.currentTime, 0.05);
    }
  }

  /**
   * Metronome click sound generator
   */
  public playMetronomeTick(isAccent: boolean) {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(isAccent ? 1400 : 900, now);

    gain.gain.setValueAtTime(isAccent ? 0.35 : 0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + (isAccent ? 0.06 : 0.04));

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.07);
  }

  // ==========================================
  // REAL-TIME SYNTHESIS & INSTRUMENT ENGINES
  // ==========================================

  /**
   * 1. Analog Polyphonic Synthesizer
   */
  public playPolySynth(
    noteNumber: number,
    velocity: number = 100,
    durationSec: number = 0.5,
    config?: InstrumentConfig['params'],
    destNode?: AudioNode
  ) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const freq = 440 * Math.pow(2, (noteNumber - 69) / 12);
    const velFactor = velocity / 127;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    // Waveform setup
    osc1.type = (config?.osc1Wave as OscillatorType) || 'sawtooth';
    osc2.type = (config?.osc2Wave as OscillatorType) || 'square';
    osc1.frequency.setValueAtTime(freq, now);
    osc2.frequency.setValueAtTime(freq, now);
    osc2.detune.setValueAtTime(config?.osc2Detune ?? 7, now); // 7 cents detune for rich analog chorusing

    // Filter ADSR setup
    filter.type = 'lowpass';
    const cutoff = config?.filterCutoff ?? 3200;
    const resonance = config?.filterResonance ?? 4;
    filter.frequency.setValueAtTime(cutoff * 0.4, now);
    filter.frequency.exponentialRampToValueAtTime(Math.min(cutoff * 1.5, 18000), now + (config?.attack ?? 0.05));
    filter.frequency.exponentialRampToValueAtTime(cutoff, now + (config?.attack ?? 0.05) + (config?.decay ?? 0.2));
    filter.Q.setValueAtTime(resonance, now);

    // Amp ADSR setup
    const attack = config?.attack ?? 0.02;
    const decay = config?.decay ?? 0.2;
    const sustain = (config?.sustain ?? 0.6) * velFactor;
    const release = config?.release ?? 0.25;

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(velFactor * 0.4, now + attack);
    gain.gain.exponentialRampToValueAtTime(Math.max(sustain * 0.4, 0.0001), now + attack + decay);

    const stopTime = now + Math.max(durationSec, attack + decay);
    gain.gain.setValueAtTime(gain.gain.value, stopTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, stopTime + release);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);

    const target = destNode || this.masterGain;
    if (target) gain.connect(target);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(stopTime + release + 0.05);
    osc2.stop(stopTime + release + 0.05);
  }

  /**
   * 2. FM Electric Piano (Rhodes/DX7 bell style)
   */
  public playFmPiano(
    noteNumber: number,
    velocity: number = 100,
    durationSec: number = 0.8,
    destNode?: AudioNode
  ) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const carrierFreq = 440 * Math.pow(2, (noteNumber - 69) / 12);
    const velFactor = velocity / 127;

    // Carrier
    const carrier = this.ctx.createOscillator();
    carrier.type = 'sine';
    carrier.frequency.setValueAtTime(carrierFreq, now);

    // Modulator
    const modulator = this.ctx.createOscillator();
    modulator.type = 'sine';
    modulator.frequency.setValueAtTime(carrierFreq * 2.0, now); // 2:1 ratio for electric chime

    const modGain = this.ctx.createGain();
    const modulationIndex = 600 * velFactor;
    modGain.gain.setValueAtTime(modulationIndex, now);
    modGain.gain.exponentialRampToValueAtTime(10, now + 0.4);

    modulator.connect(modGain);
    modGain.connect(carrier.frequency);

    const masterNoteGain = this.ctx.createGain();
    masterNoteGain.gain.setValueAtTime(0.001, now);
    masterNoteGain.gain.exponentialRampToValueAtTime(0.35 * velFactor, now + 0.015);
    masterNoteGain.gain.exponentialRampToValueAtTime(0.12 * velFactor, now + 0.3);
    masterNoteGain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec + 0.2);

    carrier.connect(masterNoteGain);
    const target = destNode || this.masterGain;
    if (target) masterNoteGain.connect(target);

    modulator.start(now);
    carrier.start(now);
    modulator.stop(now + durationSec + 0.3);
    carrier.stop(now + durationSec + 0.3);
  }

  /**
   * 3. 808 Sub Bass Synth with saturation
   */
  public play808Bass(
    noteNumber: number,
    velocity: number = 110,
    durationSec: number = 0.9,
    destNode?: AudioNode
  ) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    // Map to low bass octave (approx 30Hz - 90Hz)
    const baseFreq = 440 * Math.pow(2, ((noteNumber % 24 + 24) - 69) / 12);
    const velFactor = velocity / 127;

    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    // Pitch sweep attack for classic punchy 808 kick/bass transient
    osc.frequency.setValueAtTime(baseFreq * 2.2, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq, now + 0.045);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.6 * velFactor, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

    // Warm soft-clipping waveshaper
    const shaper = this.ctx.createWaveShaper();
    shaper.curve = this.makeDistortionCurve(15) as any;
    shaper.oversample = '4x';

    osc.connect(gain);
    gain.connect(shaper);
    const target = destNode || this.masterGain;
    if (target) shaper.connect(target);

    osc.start(now);
    osc.stop(now + durationSec + 0.05);
  }

  /**
   * 4. Synthesized Drum Kit (Kick, Snare, Clap, Hi-hat, Open-hat, Tom, Crash, Perc)
   */
  public playDrum(type: string, velocity: number = 100, destNode?: AudioNode) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const vel = velocity / 127;
    const target = destNode || this.masterGain;
    if (!target) return;

    switch (type.toLowerCase()) {
      case 'kick': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(42, now + 0.08);

        gain.gain.setValueAtTime(0.9 * vel, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(target);
        osc.start(now);
        osc.stop(now + 0.36);
        break;
      }
      case 'snare': {
        // Tonal body
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        osc.frequency.setValueAtTime(185, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.05);
        oscGain.gain.setValueAtTime(0.4 * vel, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        // Noise snap
        const noise = this.createNoiseBufferNode(0.2);
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(2400, now);
        filter.Q.setValueAtTime(1.5, now);
        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.6 * vel, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        osc.connect(oscGain);
        oscGain.connect(target);
        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(target);

        osc.start(now);
        noise.start(now);
        osc.stop(now + 0.16);
        noise.stop(now + 0.21);
        break;
      }
      case 'clap': {
        // 3 bursts of noise
        for (let i = 0; i < 3; i++) {
          const t = now + i * 0.012;
          const noise = this.createNoiseBufferNode(0.08);
          const filter = this.ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(1800, t);
          filter.Q.setValueAtTime(1.2, t);
          const g = this.ctx.createGain();
          g.gain.setValueAtTime(0.45 * vel, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + (i === 2 ? 0.22 : 0.025));

          noise.connect(filter);
          filter.connect(g);
          g.connect(target);
          noise.start(t);
          noise.stop(t + (i === 2 ? 0.23 : 0.03));
        }
        break;
      }
      case 'hihat': {
        const noise = this.createNoiseBufferNode(0.06);
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(8500, now);
        const g = this.ctx.createGain();
        g.gain.setValueAtTime(0.4 * vel, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        noise.connect(filter);
        filter.connect(g);
        g.connect(target);
        noise.start(now);
        noise.stop(now + 0.06);
        break;
      }
      case 'openhat': {
        const noise = this.createNoiseBufferNode(0.35);
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(7000, now);
        const g = this.ctx.createGain();
        g.gain.setValueAtTime(0.35 * vel, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

        noise.connect(filter);
        filter.connect(g);
        g.connect(target);
        noise.start(now);
        noise.stop(now + 0.35);
        break;
      }
      case 'tom': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(75, now + 0.18);
        gain.gain.setValueAtTime(0.6 * vel, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gain);
        gain.connect(target);
        osc.start(now);
        osc.stop(now + 0.26);
        break;
      }
      case 'crash': {
        const noise = this.createNoiseBufferNode(1.4);
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(4500, now);
        const g = this.ctx.createGain();
        g.gain.setValueAtTime(0.5 * vel, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 1.3);

        noise.connect(filter);
        filter.connect(g);
        g.connect(target);
        noise.start(now);
        noise.stop(now + 1.35);
        break;
      }
      default:
        // Perc fallback
        this.playDrum('hihat', velocity, destNode);
    }
  }

  // ==========================================
  // MICROPHONE & LINE-IN RECORDING
  // ==========================================

  public async startMicrophoneRecording(): Promise<boolean> {
    try {
      await this.init();
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          autoGainControl: false,
          noiseSuppression: false,
        },
      });

      this.recordedChunks = [];
      const options = { mimeType: 'audio/webm' };
      this.mediaRecorder = new MediaRecorder(this.mediaStream, MediaRecorder.isTypeSupported('audio/webm') ? options : undefined);

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          this.recordedChunks.push(e.data);
        }
      };

      this.mediaRecorder.start(100);
      this.isRecordingInput = true;
      return true;
    } catch (err) {
      console.error('Microphone access failed:', err);
      return false;
    }
  }

  public async stopMicrophoneRecording(): Promise<{ blob: Blob; buffer: AudioBuffer; peaks: number[] } | null> {
    if (!this.mediaRecorder || !this.isRecordingInput) return null;

    return new Promise((resolve) => {
      this.mediaRecorder!.onstop = async () => {
        this.isRecordingInput = false;
        const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
        
        // Stop stream tracks
        if (this.mediaStream) {
          this.mediaStream.getTracks().forEach((track) => track.stop());
          this.mediaStream = null;
        }

        try {
          const arrayBuffer = await blob.arrayBuffer();
          const audioBuffer = await this.ctx!.decodeAudioData(arrayBuffer);
          const peaks = this.extractWaveformPeaks(audioBuffer, 120);
          resolve({ blob, buffer: audioBuffer, peaks });
        } catch (e) {
          console.error('Decoding audio buffer error:', e);
          resolve(null);
        }
      };

      if (this.mediaRecorder) {
        this.mediaRecorder.stop();
      }
    });
  }

  /**
   * Fast peak decimation for responsive 60fps canvas waveform visualizers
   */
  public extractWaveformPeaks(buffer: AudioBuffer, numPeaks: number = 100): number[] {
    const rawData = buffer.getChannelData(0);
    const step = Math.floor(rawData.length / numPeaks);
    const peaks: number[] = [];

    for (let i = 0; i < numPeaks; i++) {
      let max = 0;
      const start = i * step;
      for (let j = 0; j < step; j++) {
        const val = Math.abs(rawData[start + j] || 0);
        if (val > max) max = val;
      }
      peaks.push(Math.min(max, 1.0));
    }
    return peaks;
  }

  // ==========================================
  // REAL-TIME AUDIO TELEMETRY & METERS
  // ==========================================

  public getMeterTelemetry(): {
    peakL: number;
    peakR: number;
    rmsL: number;
    rmsR: number;
    lufsIntegrated: number;
    phaseCorrelation: number;
  } {
    if (!this.masterAnalyser || !this.leftAnalyser || !this.rightAnalyser) {
      return {
        peakL: 0,
        peakR: 0,
        rmsL: 0,
        rmsR: 0,
        lufsIntegrated: -70,
        phaseCorrelation: 1.0,
      };
    }

    const bufL = new Float32Array(this.leftAnalyser.fftSize);
    const bufR = new Float32Array(this.rightAnalyser.fftSize);
    this.leftAnalyser.getFloatTimeDomainData(bufL);
    this.rightAnalyser.getFloatTimeDomainData(bufR);

    let peakL = 0;
    let peakR = 0;
    let sumSqL = 0;
    let sumSqR = 0;
    let dotProduct = 0;

    for (let i = 0; i < bufL.length; i++) {
      const sL = bufL[i];
      const sR = bufR[i];
      if (Math.abs(sL) > peakL) peakL = Math.abs(sL);
      if (Math.abs(sR) > peakR) peakR = Math.abs(sR);
      sumSqL += sL * sL;
      sumSqR += sR * sR;
      dotProduct += sL * sR;
    }

    const rmsL = Math.sqrt(sumSqL / bufL.length);
    const rmsR = Math.sqrt(sumSqR / bufR.length);
    const combinedRms = (rmsL + rmsR) / 2;

    // Approximate integrated LUFS via K-weighted equivalent RMS curve
    const lufs = combinedRms > 0.00001 ? Math.max(-70, 20 * Math.log10(combinedRms) - 0.691) : -70;

    const denom = Math.sqrt(sumSqL * sumSqR);
    const phaseCorrelation = denom > 0.00001 ? Math.max(-1, Math.min(1, dotProduct / denom)) : 1.0;

    return {
      peakL,
      peakR,
      rmsL,
      rmsR,
      lufsIntegrated: Math.round(lufs * 10) / 10,
      phaseCorrelation: Math.round(phaseCorrelation * 100) / 100,
    };
  }

  public getSpectrumBins(bins: number = 64): Uint8Array {
    if (!this.masterAnalyser) return new Uint8Array(bins);
    const freqData = new Uint8Array(this.masterAnalyser.frequencyBinCount);
    this.masterAnalyser.getByteFrequencyData(freqData);

    const step = Math.floor(freqData.length / bins);
    const result = new Uint8Array(bins);
    for (let i = 0; i < bins; i++) {
      result[i] = freqData[i * step] || 0;
    }
    return result;
  }

  // ==========================================
  // OFFLINE WAV EXPORT ENGINE
  // ==========================================

  /**
   * Generates a pristine PCM WAV Blob from raw AudioBuffer or synthetic mixdown
   */
  public exportAudioBufferToWavBlob(audioBuffer: AudioBuffer, bitDepth: BitDepth = 24): Blob {
    const numChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const numSamples = audioBuffer.length;
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = numSamples * blockAlign;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    // RIFF chunk descriptor
    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    this.writeString(view, 8, 'WAVE');

    // fmt sub-chunk
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
    view.setUint16(20, bitDepth === 32 ? 3 : 1, true); // 1 = PCM, 3 = IEEE Float
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);

    // data sub-chunk
    this.writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);

    // Interleave channels & encode PCM
    const channels: Float32Array[] = [];
    for (let c = 0; c < numChannels; c++) {
      channels.push(audioBuffer.getChannelData(c));
    }

    let offset = 44;
    for (let i = 0; i < numSamples; i++) {
      for (let c = 0; c < numChannels; c++) {
        let sample = channels[c][i];
        sample = Math.max(-1, Math.min(1, sample)); // hard clamp

        if (bitDepth === 16) {
          view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
          offset += 2;
        } else if (bitDepth === 24) {
          const s = sample < 0 ? sample * 0x800000 : sample * 0x7fffff;
          view.setUint8(offset, s & 0xff);
          view.setUint8(offset + 1, (s >> 8) & 0xff);
          view.setUint8(offset + 2, (s >> 16) & 0xff);
          offset += 3;
        } else if (bitDepth === 32) {
          view.setFloat32(offset, sample, true);
          offset += 4;
        }
      }
    }

    return new Blob([buffer], { type: 'audio/wav' });
  }

  // ==========================================
  // HELPER DSP UTILITIES
  // ==========================================

  private writeString(view: DataView, offset: number, str: string) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  }

  private createNoiseBufferNode(durationSec: number): AudioBufferSourceNode {
    const bufferSize = this.ctx!.sampleRate * durationSec;
    const buffer = this.ctx!.createBuffer(1, bufferSize, this.ctx!.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx!.createBufferSource();
    noise.buffer = buffer;
    return noise;
  }

  private makeDistortionCurve(amount: number): Float32Array {
    const k = typeof amount === 'number' ? amount : 50;
    const nSamples = 44100;
    const curve = new Float32Array(nSamples);
    const deg = Math.PI / 180;
    for (let i = 0; i < nSamples; ++i) {
      const x = (i * 2) / nSamples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  /**
   * Generates a smooth algorithmic room/hall impulse response
   */
  private getAlgorithmicImpulseResponse(decaySec: number, damping: number): AudioBuffer {
    const cacheKey = `${decaySec}_${damping}`;
    if (this.reverbImpulseCache.has(cacheKey)) {
      return this.reverbImpulseCache.get(cacheKey)!;
    }

    const rate = this.ctx ? this.ctx.sampleRate : 48000;
    const length = rate * decaySec;
    const impulse = this.ctx!.createBuffer(2, length, rate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const envelope = Math.pow(1 - i / length, damping * 3);
      left[i] = (Math.random() * 2 - 1) * envelope;
      right[i] = (Math.random() * 2 - 1) * envelope;
    }

    this.reverbImpulseCache.set(cacheKey, impulse);
    return impulse;
  }
}
