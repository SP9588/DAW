# Changelog

All notable changes to **SP Studio DAW** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-10-08

### Added
- **Core Architecture & Desktop Shell:** Decoupled multi-threaded audio architecture with WASAPI/CoreAudio/PipeWire and Web Audio Worklet runtime.
- **Multi-Track Timeline:** Non-destructive audio and MIDI arrangement lanes, SVG waveform visualizers, split tool, clip gain, and fade-in/fade-out handles.
- **Mixing Console:** Full console with volume faders, dB meters, LED ladder displays, pan controls, mute, solo, arm, and insert racks.
- **Built-in Instruments:**
  - Analog PolySynth (dual VCO, 24dB ladder filter, ADSR).
  - FM Electric Piano (Rhodes/DX7 bell operator synthesis).
  - 808 Sub Bass (pitch-glide envelope and tape saturation).
  - SP-808 Drum Sequencer (16-step matrix with swing and pattern chaining).
- **DSP Effect Processors:** 4-Band Parametric EQ, Studio Compressor, Hall Reverb, Ping-Pong Delay, Tape Saturation, and Brickwall Limiter.
- **Piano Roll & MIDI Editor:** Virtual piano keyboard, note grid, velocity lane, quantize, humanize, transpose, and harmonic chord generator.
- **Mastering Suite:** 64-band FFT spectrum analyzer, EBU R128 LUFS meter, phase correlation meter, and streaming target presets (Spotify, Apple Music, YouTube, Club).
- **Live Performance & DJ Mode:** Ableton-style quantized scene/clip launch matrix and dual DJ decks with 3-band kill EQ and crossfader.
- **Vocal Production Suite:** Real-time pitch detector, tuning display, de-esser, optical compressor, and vocal chain presets.
- **SP AI Producer:** Local heuristic music theory engine + opt-in Gemini Cloud integration with explicit user consent modal.
- **Export Engine:** Offline PCM rendering to 16/24/32-bit float WAV, MP3, stems, and `.spstudio` session format.
- **Desktop Packaging:** Windows Setup EXE (`SP-Studio-Setup.exe`), macOS DMG (`SP-Studio.dmg`), and Linux AppImage/DEB configurations.
