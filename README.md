# MAJAKKA — Playable Prototype v0.1

**Status:** local, synthetic, English-language gameplay test. **Not a released location game.**  
**Design:** Restore the Light · Reconnect the World.  
**Engineering guide:** App Engineering Playbook v1.9.2.

## How to run / publish

This first version is deliberately **static** to fit an already configured Cloudflare Pages site: no build command, no npm, no backend, no GPS, no tracking. Publish all files at the repository root; configure Pages build command **empty / none** and output directory **`.`** (repository root). GitHub Pages also works from the root. Visit the Pages URL after deployment. For local development: `python3 -m http.server 8000` from this folder and open `http://localhost:8000`.

## Features

- Three simulated map regions: Harbor District, Stillwater and North Pines (22 public nodes).
- Selectable nodes and three small challenges: Echo Sequence (memory), Pattern Logic, Phase Alignment.
- Sound is opt-in; visual gameplay works in silence.
- Private lighthouse marker (no public links); no actual sanctuary coordinates or location processing.
- Simulated delayed pulses change node brightness and public-public connections (never real-time multiplayer).
- Local journal, progress and area selection stored in IndexedDB with explicit reset.
- Offline PWA application shell with a local service worker.

## Main limitations

- **Not real geo-data, multiplayer, travel echo or server-side cooldown**. "World pulse" is an accelerated local demonstration and does not represent other players.
- Puzzle mechanics are **hypotheses**, not a proven retention loop; all feedback is welcome.
- Offline availability begins after one complete successful HTTPS/localhost load and service-worker installation.
- No analytics, account, network calls, external fonts, map tiles or data uploads.

## QA

Run `python3 -m http.server 8000` and visit app. Test selection in each region, all three challenge types, refresh persistence, sound off, simulated pulses, offline reload after the app has been cached, reset, mobile widths 320–430px, and keyboard navigation. Run `node --test tests/core.test.mjs` and `node --check app.js` and `node --check sw.js`. Full device QA is pending.

## Files

- `index.html` interface
- `styles.css` layout and visual language
- `app.js` state and minigames
- `sw.js` offline shell
- `assets/mark.svg`, `assets/icon-192.png`, `assets/icon-512.png` icons
- `manifest.webmanifest` install metadata
- `APP-SPEC.md` product constraints
- `QA_REPORT.md` explicit test evidence and limitations

## Architectural decision

No Vite/TypeScript yet: single-file static JS is intentional for this vertical slice and avoids an unneeded build step for an empty repo. Future modular TS conversion is conditional on proven loop quality, not a precondition to first player test.
