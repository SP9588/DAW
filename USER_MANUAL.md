# SP Studio DAW — Comprehensive User Manual

> **Tagline:** Create. Record. Perform. Mix. Master.  
> **Version:** 1.0.0 Production Manual

---

## 1. Quick Start & Setup

### Launching SP Studio
SP Studio operates seamlessly both as a **high-performance Web Audio Worklet workstation** and as a **native cross-platform desktop application** (Windows, macOS, Linux).

To begin playing audio or recording:
1. Click **Play** on the transport bar (or press `Space`).
2. Your browser or native runtime will automatically initialize the low-latency audio core at **48 kHz, 24-bit**.
3. Use the **BPM** input to adjust tempo (default is 124 BPM).
4. Cycle through the timeline loop region using `L`.

---

## 2. Multi-Track Recording

SP Studio supports non-destructive audio tracking:
1. Click the **R** (Record Arm) button on any audio track (e.g. `Audio Vocal / Mic`).
2. Click the red **Record** button in the top transport bar (or press `R`).
3. Speak or sing into your microphone.
4. When finished, press `Space` or click **Stop**.
5. The audio waveform is rendered non-destructively as a new clip in the timeline.
6. In the right-hand **Inspector**, you can adjust clip gain, non-destructive fade-ins, fade-outs, or reverse the audio.

---

## 3. MIDI & Piano Roll Editing

1. Click on any MIDI or Instrument track (e.g. `FM Electric Keys`, `Jupiter PolySynth`).
2. Switch to the **Piano Roll** tab in the bottom dock or top view selector.
3. Click any key on the left virtual piano keyboard to audition tones.
4. Use the **Pencil tool** to draw notes onto the grid (notes snap automatically to 1/16).
5. Use **Generate Chords** to automatically build harmonic progressions.
6. Use **Quantize** and **Humanize** to refine timing and velocity dynamics.

---

## 4. Built-in Instruments & 808 Sequencer

- **Analog PolySynth:** Dual oscillators with saw, square, sine, triangle, Moog 24dB ladder filter, and ADSR envelope.
- **FM Electric Piano:** Dual-operator frequency modulation generating classic bell chime Rhodes tones.
- **808 Sub Bass Synth:** Pitch-swept sub-bass with tanh soft-clip overdrive.
- **SP-808 Drum Sequencer:** 16-step grid supporting Kick, Snare, Clap, Closed Hat, Open Hat, Tom, and Crash with adjustable swing.

---

## 5. Mixing & Studio Effects

1. Switch to the **Mixer** view to access precision channel strips.
2. Adjust individual track volume faders with dB readouts (`-inf` to `+6 dB`).
3. Check the real-time LED meter ladders for clipping prevention.
4. Tweak the **4-Band Parametric EQ**, **Studio Compressor**, **Algorithmic Reverb**, and **Delay** in the DSP Insert Rack.

---

## 6. Mastering & Acoustic Analysis

1. Switch to the **Mastering** workspace.
2. Watch the real-time **64-Band FFT Spectrum Analyzer** to detect acoustic resonances.
3. Monitor your **Integrated LUFS** level against streaming standards:
   - **Spotify / Tidal / YouTube:** -14 LUFS
   - **Apple Music:** -16 LUFS
   - **Club / EDM:** -9 LUFS
   - **Podcast:** -19 LUFS
4. Verify that the **Phase Correlation** meter stays positive (+0.5 to +1.0) for phase compatibility in mono.

---

## 7. Performance Mode & DJ Decks

- **Clip Matrix:** Launch scenes quantized to 1-bar musical boundaries.
- **DJ Decks A/B:** Mix two tracks with dedicated 3-band kill EQ, bi-directional filter, and central crossfader.

---

## 8. Exporting Audio & Stems

1. Click **Export** in the top transport bar.
2. Choose your format:
   - **WAV:** 16-bit, 24-bit, or 32-bit Float uncompressed PCM.
   - **MP3:** 320 kbps streaming master.
   - **Track Stems:** Soloed individual tracks for external mixing.
   - **.spstudio:** Complete session file.
3. Click **Start Export** to download your rendered master.
