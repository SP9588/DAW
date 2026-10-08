# SP Studio DAW — Third-Party Licenses & IP Compliance

SP Studio DAW is designed with strict adherence to intellectual property standards, open-source compliance, and clean commercial separation.

---

## 1. Core Frameworks & Libraries

| Dependency | Purpose | Upstream License | Commercial Compatibility |
| :--- | :--- | :--- | :--- |
| **React** | Component Architecture | MIT License | Fully Permissive (Proprietary Allowed) |
| **TypeScript** | Type Safety & Tooling | Apache 2.0 | Permissive |
| **Tailwind CSS** | Design System & Utility Styling | MIT License | Permissive |
| **Lucide Icons** | DAW Vector Icons | ISC License | Permissive |
| **Motion** | Fluid UI Transitions & Hardware Animation | MIT License | Permissive |
| **Vite** | Bundler & Developer Server | MIT License | Permissive |
| **Web Audio API** | AudioContext & AudioWorklet Standard | W3C Community / Standard | Royalty-free open standard |
| **Web MIDI API** | Hardware Controller Input / Output | W3C Recommendation | Royalty-free open standard |
| **@google/genai** | Optional AI Producer Assistant | Apache 2.0 | Permissive (Opt-in with user consent) |

---

## 2. Audio Plugin & Driver Standards Compliance

### Clever Audio Plugin (CLAP)
- **Standard:** Free and open-source plugin API standard developed by u-he and Bitwig.
- **License:** MIT License.
- **Integration:** Fully native and unrestricted in commercial proprietary products without royalties or non-disclosure agreements.

### Steinberg VST® 3 SDK
- **Notice:** VST is a registered trademark of Steinberg Media Technologies GmbH.
- **Compliance Policy:** SP Studio provides an open plugin hosting abstraction layer. Third-party VST3 plugin bridging can be activated under the Steinberg VST3 Agreement without contaminating the core proprietary DAW codebase.

### Steinberg ASIO™ Driver Interface
- **Notice:** ASIO is a trademark and software of Steinberg Media Technologies GmbH.
- **Compliance Policy:** Low-latency Windows support uses Microsoft WASAPI Exclusive Mode as default. ASIO support is provided via dynamic runtime linking to user-installed hardware manufacturer drivers.

---

## 3. Sample & Audio Content Policy
- All factory demo samples and synthesizer wavetables embedded in SP Studio are synthesized algorithmically at runtime via real-time DSP mathematical generators (sine, saw, pulse, pink/white noise, FM modulation, and Karplus-Strong physical modeling) or licensed under CC0 Public Domain.
- No copyrighted commercial sample libraries are redistributed.
