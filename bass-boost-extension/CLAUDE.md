# Bass Boost Extension

Chrome extension (Manifest V3) for audio enhancement on any website — YouTube, Spotify, Netflix, etc.

## Tech Stack

- Vanilla JavaScript, HTML, CSS — zero dependencies, no build step
- Chrome Extension Manifest V3
- Web Audio API (BiquadFilter, DynamicsCompressor, AnalyserNode)
- Chrome Storage API (sync & local)

## Architecture

```
manifest.json      → Extension config, permissions, content script injection
content.js         → Audio processing engine (injected into web pages)
background.js      → Service worker for license management & messaging
popup.html         → UI markup (inline CSS, 340×640px popup)
popup.js           → UI logic, settings, i18n, visualizer, license flow
icons/             → Extension icons (16, 48, 128px)
```

### Audio Signal Chain

```
MediaElementSource → Bass Filters (4x) → EQ Filters (10x) → Fidelity Filters (10x)
  → AnalyserNode → Loudness Gain → Master Gain → Destination
  (optional: Compressor for Night Mode)
```

### Message Types

| Message | Direction | Purpose |
|---------|-----------|---------|
| `BOOM_UPDATE` | popup → content | Send settings to audio engine |
| `BOOM_GET_FFT` | popup → content | Request FFT data for visualizer |
| `BB_UNLOCKED` | background → popup | License activation from external page |

## Features

- **Bass Boost**: 4-stage cascade (30–180Hz), 0–20dB (free: max 8dB)
- **10-Band EQ**: 32Hz–16kHz, 6 presets (Flat, Bass+, Treble+, Vocal, Club, Rock)
- **Fidelity Engine**: Auto-corrects frequency imbalance via FFT analysis (Pro)
- **Night Mode**: Dynamic compression (-24dB threshold, 4:1 ratio)
- **Loudness Boost**: 0–100% gain
- **Visualizer**: 48-bar spectrum analyzer on canvas (45fps)
- **i18n**: English & Indonesian

## Monetization

- Free tier: bass boost ≤ 8dB, EQ & fidelity disabled
- Pro tier: unlocked via donation code (Saweria)
- License bound to device UUID (generated on install)

### Backend API Endpoints (external)

- `POST /generate-code` — Generate donation code
- `POST /redeem-code` — Activate Pro license
- `GET /check-code` — Silent license check
- `POST /start-trial` — 3-day trial code
- `/donate` — Donation landing page

## Development

No build step. Load as unpacked extension in `chrome://extensions` with Developer Mode enabled.
