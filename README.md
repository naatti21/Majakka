# MAJAKKA — First Light v0.2

> Restore the Light. Reconnect the World.

An English-first, mobile-first local-only experiment in a calm location-inspired game.

## What's playable

- Tampere as the **real OpenFreeMap basemap** when online; stylized local fallback when the map provider or MapLibre CDN is unavailable. Three hand-placed **fictional game nodes** on approximate public-space locations. **No GPS**.
- A movable **simulated sonde**: select a node, then **Simulate walk to node**. Nearness improves reception and effectiveness; distant echoes remain audible.
- Automatically gather **Lumen** on first/renewed visits; collect a smaller amount through **Rest & gather**, without moving.
- Spend Lumen to **attune** a node. A near pulse contributes more than a distant pulse from an already discovered node.
- Contributions are pending until **Advance delayed world pulse** is pressed. Three awakened nodes form three threads and one visible **resonance field** with a gentle harmonic motif.
- Local journal and saved progress (IndexedDB, with localStorage fallback); sound optional; own progress persists without daily logins.

## Test the core loop

1. Select **River Current** → **Simulate walk to node** → **Send a clear pulse**.
2. Select **Quiet Square**, then repeat.
3. Select **Southern Lantern**, then repeat.
4. Choose **Advance delayed world pulse**. The three nodes connect, and the area fills with harmonic light.
5. Reload the page: v0.2 First Light progress remains saved (where storage is allowed).
6. Try **Rest & gather** without walking, muted sound, and a second pulse after doing nothing. No progress is lost.

## Tech

Static GitHub / Cloudflare Pages site: `index.html`, `styles.css`, `core.js`, `app.js`, `sw.js`, `manifest.webmanifest` and `assets`. No build command; output directory `.`. No Supabase, auth, telemetry or location permissions.

Real-map background uses **MapLibre GL JS 5.10.0** from jsDelivr and **OpenFreeMap Fiord** style. Those external resources need connectivity. They are not precached for offline. Browser fallback map and the local game engine remain usable offline after the app shell is cached. Attribution is visible on the map.

## Run tests

`node --test tests/core.test.mjs`

`core.js` isolates game rules and can be tested without a browser.

## Explicit limitations

- **Simulated only:** walking is a button, not GPS. Nobody else's position or activity is present; field awakening demonstrates the *appearance* of delayed community changes but is calculated from local demo actions.
- Node positions are manually placed approximate demonstration points, not verified public Points of Interest or seeded global locations.
- True multiplayer must use independent-person thresholds, anti-abuse, rate limits, privacy-preserving aggregation, and delayed publication before public fields or links are enabled.
- The online map provider and mobile device behavior need verification on the deployed URL; local browser tests use the fallback because automated navigation to local URLs was blocked by environment policy.
- v0.1 data remains under the separate `game` IndexedDB key. v0.2 uses `firstLight` and does not destroy the earlier save.

## Privacy

All progress stays on this device. No geolocation API is used. The optional map provider receives the map tile requests of the sample Tampere area when connected; see the provider's privacy policy. No private safe-space coordinates are used or shared.

No Ingress-style factions, no streaks, no activity-based loss, no competitive leaderboards.


## v0.3 — Perimeter HUD + Interference Trial (25 Oct 2026)

- Node actions appear as narrow edge buttons and compact bottom information, leaving the map center usable.
- One **local-only** violet interference zone gradually broadens its visual disturbance. It never deletes earned discoveries or world charge.
- Stabilize once per simulated world pulse: spend 2 Lumen **or** solve an optional symbol-sequence challenge. Challenge length increases by local signal level; node decode is free at most once per node per cycle.
- Three separated contributions restore the zone and grant one non-repeatable +3 Lumen reward. Demo does **not** simulate multiple real players or location tracking.
- Small ↻ button advances the artificial world pulse; reset clears the local trial state. Existing Harmony and Memory views remain optional.

**Not implemented:** actual GPS proximity, background travel recording, remote shared pool, player-safe publish thresholds, server-side anti-cheat, real moving corruption. These remain design and security gates, not implied live functions.
