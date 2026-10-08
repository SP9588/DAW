# SP Studio DAW — System Architecture & Technical Specifications

> **Tagline:** Create. Record. Perform. Mix. Master.  
> **Classification:** Professional Cross-Platform Digital Audio Workstation  
> **Author & Architect:** SP Studio Audio Engineering Group  
> **Document Version:** 1.0.0 (Production Architecture)

---

## 1. Executive Architecture Summary

SP Studio DAW is engineered as a high-performance, low-latency, modular digital audio workstation designed for modern multi-core computing architectures. The platform adopts an **asymmetric decoupled processing model**:

1. **Audio Real-Time Thread (C++ / Rust / WebAudio AudioWorklet Core):**
   - Zero-allocation audio callback loop.
   - Lock-free SPSC (Single Producer Single Consumer) ring buffers for inter-thread communication.
   - Non-blocking real-time DSP execution with deterministic latency ($\le 2.9\text{ ms}$ at 128 samples / 44.1 kHz).
   - Audio thread NEVER performs file I/O, memory allocation, network access, or GUI synchronization.

2. **Application & DSP Scheduling Engine (TypeScript / Rust / Native Bridge):**
   - Sample-accurate MIDI & automation event dispatching.
   - Multi-track mixing graph with dynamic dependency resolution.
   - Background audio decoding, waveform peak caching, and offline multi-threaded export rendering.

3. **Desktop Presentation & Interaction Layer (React 19 / TypeScript / Tailwind CSS / Tauri):**
   - 60/120 FPS hardware-accelerated canvas and SVG renderers for arrangement waveforms, spectral displays, and meters.
   - State management decoupled from audio frame rate via double-buffered telemetry channels.
   - Cross-platform desktop targets: **Windows (x64/ARM64)**, **macOS (Universal / Apple Silicon & Intel)**, and **Linux (AppImage / DEB)**.

---

## 2. Desktop & Native Engine Abstraction

```
+-------------------------------------------------------------------------+
|                         SP Studio DAW UI (React)                        |
|   Transport | Arrangement | Mixer | Piano Roll | DSP | AI Producer     |
+-----------------------------------+-------------------------------------+
                                    | IPC / Event Bridge
+-----------------------------------v-------------------------------------+
|                      Desktop Runtime Shell (Tauri / Rust)                |
|   Native Windowing | File System I/O | Hotkeys | Device Enumeration     |
+-----------------------------------+-------------------------------------+
                                    |
          +-------------------------+-------------------------+
          |                                                   |
+---------v---------------------------+   +-------------------v-----------+
|    Native Low-Latency Audio Core    |   |     Web Audio Engine (PWA/    |
|             (Rust / C++)            |   |     Preview Fallback Core)    |
+-------------------------------------+   +-------------------------------+
| Windows: WASAPI Exclusive & ASIO    |   | AudioContext / AudioWorklet   |
| macOS: Core Audio Real-Time Workgroup|  | ScriptProcessor Fallback       |
| Linux: ALSA / JACK / PipeWire       |   | Web MIDI API Access           |
+-------------------------------------+   +-------------------------------+
```

### Native Driver Layer Specifics
- **Windows:** WASAPI Exclusive mode provides low-latency output without third-party drivers. ASIO 2.3+ is supported via dynamic DLL loading to accommodate professional multi-channel interfaces.
- **macOS:** Core Audio AudioUnit v2/v3 HAL integration with `os_workgroup` thread priority promotion to guarantee deadline compliance on macOS 12+.
- **Linux:** Native PipeWire and JACK client interfaces allow low-latency integration into Linux professional audio ecosystems.

---

## 3. Technology & Licensing Constraints for a Commercial DAW

Commercial DAW software must navigate strict licensing frameworks:

1. **Steinberg VST3 SDK:**
   - Steinberg licenses the VST3 SDK under dual licensing (Proprietary or GPLv3).
   - **Commercial Implementation Rule:** Commercial proprietary DAWs must obtain the Steinberg VST3 Agreement or utilize the **CLAP (Clever Audio Plugin) Open Standard** (MIT license, no royalty or restrictive licensing obligations). SP Studio implements native CLAP plugin architecture with a VST3 compatibility bridge wrapper.
2. **ASIO Licensing (Steinberg):**
   - Steinberg's ASIO SDK cannot be redistributed under GPL. It requires acceptance of the Steinberg ASIO Developer Agreement. For open and cross-platform distribution, WASAPI (Windows) and Core Audio (macOS) are the primary out-of-the-box drivers, with ASIO enabled via end-user driver binding.
3. **Audio Codecs (MP3, AAC, FLAC, WAV, OGG):**
   - WAV (PCM) and AIFF are unencumbered container formats.
   - FLAC and Ogg Vorbis are open standards with permissive licenses (BSD/Xiph).
   - MP3 patents expired in 2017, permitting royalty-free LAME-compatible PCM encoding.
4. **AI & Data Privacy:**
   - User audio recordings and MIDI project contents must never be uploaded without explicit opt-in confirmation. SP Studio embeds a local heuristic music theory engine for instant offline composition, with Gemini Cloud assistance isolated behind explicit consent modals.

---

## 4. The `.spstudio` Project File Format

A `.spstudio` project is a human-readable JSON schema or zipped package (for "Collect All and Save" bundles):

```json
{
  "formatVersion": "1.0.0",
  "meta": {
    "title": "Neon Horizon",
    "artist": "Producer",
    "bpm": 124,
    "timeSignature": [4, 4],
    "sampleRate": 48000,
    "bitDepth": 24,
    "createdAt": 1742080000000,
    "updatedAt": 1742083600000
  },
  "master": {
    "volume": 0.85,
    "pan": 0.0,
    "effects": [...]
  },
  "tracks": [
    {
      "id": "trk_1",
      "name": "Analog Bass",
      "type": "synth",
      "color": "#38bdf8",
      "volume": 0.8,
      "pan": 0.0,
      "mute": false,
      "solo": false,
      "armed": false,
      "instrument": {
        "type": "synth",
        "preset": "Sub Punch 808",
        "parameters": {...}
      },
      "effects": [...],
      "clips": [...],
      "automation": [...]
    }
  ]
}
```

---

## 5. Non-Destructive Audio Engine Workflow

- Original recorded and imported audio files remain read-only on disk.
- Region edits (Cut, Split, Slip, Trim, Fade-in, Fade-out, Clip Gain, Time-stretch) manipulate offset and duration metadata pointers rather than mutating source PCM sample buffers.
- Offline destructive processes (Normalize, Reverse) generate new timestamped cache files in the project's `/.spstudio_cache/` directory.
