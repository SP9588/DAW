# Contributing to SP Studio DAW

Thank you for contributing to SP Studio DAW!

## Development Setup
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development environment:
   ```bash
   npm run dev
   ```
4. Verify types and build:
   ```bash
   npm run lint
   npm run build
   ```

## Audio Architecture Guidelines
- Never perform blocking disk I/O or memory allocations on the real-time audio thread.
- Maintain WCAG AA accessibility and responsive dark UI themes for studio environments.
- Keep licensing clean: respect VST3/ASIO proprietary boundaries and prefer open standards such as CLAP and W3C Web Audio.
