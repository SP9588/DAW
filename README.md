# SP Studio DAW

> **Tagline:** Create. Record. Perform. Mix. Master.  
> **Platform:** Professional Cross-Platform Digital Audio Workstation  
> **Targets:** Windows 10/11, macOS, Linux, and Modern Web Audio

---

## Overview

**SP Studio DAW** is a digital audio workstation built for musicians, producers, audio engineers, sound designers, and vocalists. It merges low-latency DSP synthesis, multi-track recording, non-destructive waveform editing, an interactive piano roll, an algorithmic drum sequencer, a full mixing console, a dedicated mastering suite, live scene performance triggers, and DJ decks into a unified, responsive interface.

---

## Key Features

- **Multi-Track Timeline:** Non-destructive audio and MIDI clips with real-time waveform rendering, split, slip editing, gain adjustment, and fade handles.
- **Low-Latency Audio Core:** Web Audio AudioWorklet & native driver support (WASAPI Exclusive, Core Audio, PipeWire) supporting 44.1 kHz to 192 kHz at 24-bit / 32-bit float.
- **Built-in Instruments:**
  - Dual-VCO Analog PolySynth with resonant 24dB ladder filter and ADSR.
  - Dual-Operator FM Electric Piano (Rhodes / DX7 bell timbre).
  - 808 Sub Bass Synth with pitch-glide envelope and tape saturation.
  - SP-808 Drum Machine with 16-step pattern sequencer and swing.
- **Studio DSP Effects:**
  - 4-Band Parametric EQ with real-time interactive curve display.
  - Studio Dynamics Compressor with gain reduction meter.
  - Algorithmic Stereo Room Reverb.
  - Stereo Ping-Pong Delay with tempo sync.
  - Analog Tape Drive Saturation.
  - Master Lookahead Brickwall Limiter.
- **Mixer Console:** Full channel strips with dB volume faders, LED peak meters, pan knobs, mute, solo, arm, and insert racks.
- **Piano Roll & MIDI:** Note drawing, selection, eraser, velocity editing, quantization, humanization, octave transposition, and chord progression generation.
- **Mastering Suite:** 64-band FFT spectrum analyzer, EBU R128 LUFS loudness meter, phase correlation meter, and streaming target presets (Spotify, Apple Music, YouTube, Club).
- **Live Performance & DJ Mode:** Clip matrix scene launcher and dual DJ decks with 3-band kill EQ, filter sweeps, and central crossfader.
- **SP AI Producer:** Offline local music theory assistant and optional Gemini Cloud integration with strict user consent safeguards.
- **Export Engine:** Offline rendering to 16/24/32-bit WAV, MP3, individual track stems, and `.spstudio` session bundles.

---

## Build & Run Instructions

### Development Server
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Native Desktop Packaging (Tauri / Electron)
```bash
# Windows Setup EXE
npx tauri build --target x86_64-pc-windows-msvc

# macOS Universal DMG
npx tauri build --target universal-apple-darwin

# Linux AppImage / DEB
npx tauri build --target x86_64-unknown-linux-gnu
```
Output artifacts are saved in `/dist/installers/`.
