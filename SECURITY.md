# Security Policy

## Supported Versions
| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Security Principles in SP Studio DAW
1. **Offline-First & Zero Silent Uploads:** No user recordings, project tracks, or MIDI data are transmitted over the network without explicit user opt-in.
2. **Safe Project Parsing:** Project files (`.spstudio`) are parsed as strictly validated JSON. Arbitrary executable scripts or native code execution inside project packages is explicitly blocked.
3. **Plugin Sandboxing:** Foreign third-party plugins (CLAP / VST3) run in isolated child processes with crash isolation boundaries.
4. **Reporting a Vulnerability:** Contact security@spstudio.audio. We respond within 48 hours.
