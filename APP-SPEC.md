# MAJAKKA — APP-SPEC

**Version:** First Light v0.2 (2026-10-24)  
**Project:** independent `naatti21/Majakka`  
**Shared engineering basis:** Äppejä App Engineering Playbook v1.9.2. No playbook change required.  
**Product language:** English. Development notes may be Finnish.

## Purpose

**Restore the Light. Reconnect the World.** A quiet location-inspired game: players influence publicly located nodes and an anonymous mycelium-like network; the world develops slowly and responds through light and music. No factions or forced activity.

## Non-negotiable principles

- One shared world, one personal discovery layer, five strictly private sanctuaries (home, work, three choices) in the **future** real-game concept. Sanctuaries are never public or linked to public nodes.
- No live revelation of individual player positions or journeys. Public links require sufficient distinct contributions and delayed aggregate publication; delaying alone is not sufficient for privacy.
- A node can dim but not die. Rest/inactivity never deletes progress. Distant participation and couch play are meaningful.
- Different levels of interaction: distant echo, passive encounter, deliberate attunement. Power expressed mainly through light, sound, and node state instead of competitive counters.
- Coherent generative audio: each area shares a musical palette; never play dozens of node melodies simultaneously. Audio is optional.
- Be visually polished: premium dark cartography, restrained amber/cyan glow, organic threads, subtle feedback.

## v0.2 implemented

- Static PWA shell, responsive interface, local IndexedDB saved state; standalone game logic `core.js`.
- MapLibre GL JS plus OpenFreeMap Fiord **online map** with local fallback.
- Three fictional demonstration nodes at approximate Tampere downtown coordinates. They do not represent an automated or validated POI selection algorithm.
- Simulated walking and geographic proximity (near, faint, distant) with visible reception bars.
- Lumen gained at node visits (per node per simulated pulse), capped, and from an at-home rest action (once per simulated pulse). No forced GPS permission.
- Spending Lumen creates pending charge; a local delayed pulse applies it. Once all three nodes awaken, a triangular harmony field and three links become visible. Never confuse this simulation with real shared-player progress.
- Small, bounded harmonized Web Audio chimes instead of repetitive dial tasks. No audio required to make progress.

## Not implemented

- Real GPS, native background travel, safe-space UI and local-coordinate security enforcement.
- Real POI discovery, cross-region gameplay, true shared-world service, account identity, anti-spoofing, threshold-based node/link aggregation.
- Deep audio composition, extended game-loop diversity, remote backup, cross-device sync, production privacy review, accessibility/device performance sign-off.

## Build and release

- GitHub Pages or Cloudflare Pages static publishing: output directory `.`; no build step.
- `node --test tests/core.test.mjs` runs pure rules tests.
- Shared Playbook remains canonical; Majakka design specifics live here. Delta updates preferred over duplicate playbooks.

## Next quality gates

1. Actual Android PWA test on deployed URL; inspect online real-map tiles, text and click hit targets, and offline shell.
2. Validate whether the first field awakening actually feels like interacting with Tampere geography; collect qualitative feedback.
3. Decide if collecting and spending Lumen is interesting for more than a few minutes; don't add many minigames to mask a weak loop.
4. Model anonymity, cross-user aggregation, protected areas, rate-limits and location abuse before implementing any real shared world.


### v0.3.1 — Live Field test gate (25 Oct 2026)

Optional browser geolocation only, 12-minute foreground session with manual stop. No saved track, no real generated POIs, no multiplayer or shared contributions, and Tampere demo nodes hidden during live mode. At most two scan and three conservative movement Lumen rewards per session, subject to accuracy, cooldown and speed gates. Requires secure context, permission and live map tile delivery. Browser E2E and actual Android field test remain open. Keep future real POI safety and privacy architecture separate from this test.


### v0.4.0 3D prototype contract

2D raster remains the dependable default and can be restored instantly. Opt-in 3D uses tilted/rotating vector tiles with optional terrain and building extrusions, simulated node depth and colored harmony fields. Any third-party failure restores 2D without deleting state. LIVE mode contains only temporary preview lights around user location until safe real public nodes and shared state are designed and implemented. User-facing copy must not claim true live multiplayer.


### v0.4.1 depth corrections

Optional 3D node effects use meter-based GeoJSON geometry and native map extrusion layers, not fixed-pixel floating HTML billboards. The beacon's ground ring and pillar must scale with camera altitude and pitch. Floating ambient particles may be subtle but should not misrepresent demo lights as real POIs. One-finger tilt is intentionally limited to a labelled right-edge touch rail so that default map panning stays reliable. Maintain immediate 2D fallback and no persistent location tracking.
