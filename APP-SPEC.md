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


### Living World v0.5 constraints (25 Oct 2026)

- LIVE permission only on user gesture, for a bounded foreground 12-minute session.
- First sufficiently accurate fix defines three *virtual* private, unverified game coordinates and one local rift (no POI validation). They do not persist on device or server, are not safe walking directions and vanish on STOP.
- Node contribution: near action costs 2 Lumen and contributes 2, farther action costs 3 and contributes 1. Both allow an optional decode substitute. Only one contribution to a node per world pulse. Awaken target 2. Three awakened nodes form one persistent-for-session geometric field.
- Rift: two contributions across separate pulse cycles; one reward and permanently clear within the trial. Pulses dim nodes visually while unresolved but do not delete previous successes.
- Resource economy: six collectible preview spark points per session (requires actual proximity), pre-existing scans and movement echoes; shared device-local daily ceiling of 12 earned Lumen including milestones. No geo info stored with aggregate counts.
- Milestone counters are local-only. No authoritative anti-cheat or actual multiplayer until backend and privacy audit.


### v0.6 multi-day field contract

Stable virtual-node fields repeat in Web Mercator zoom-14 cells; distinct neighborhoods yield distinct locally saved state. Saved region entries are SHA-256 salted, keyed by coarse location, not raw coordinates, but are still sensitive location-derived fingerprints. Local-only, erase through Memory. No contact with a Majakka central game backend, no background GPS, no navigation to unverified virtual node spots. Contributing when far is possible; never tell players to enter private/unsafe places. User chooses each node link, and each link rises from the beacon in an arcing, soft and organic 3D ribbon. Use brief shared-key ambient event cues, opt-in audio, optional haptics and multiple challenge modalities. A 90-second wall-clock cooldown gates world pulses for test integrity, not real server security. Metrics are aggregate counts only and copyable for user/Work review. Continue only after multi-day real-world user evaluation.


### v0.6.1 location and accessible rhythm

In each stable regional cell, virtual public-looking signals are intentionally **not real POIs** and must be distributed around the cell using a deterministic seed, not the current GPS fix. Other cells' lights may appear dimly but cannot be tapped into rewards. Remote progression is slower and rate-limited (20 h per node); close GPS improves signal without forcing travel to unsafe or private coordinates. Previous saved local field contribution states survive the update even if coordinates of virtual points move. Rhythm puzzles must be usable with sound off, include a visible timing target and a time-free option without Lumen cost, and must not require vibration. Offline/closed-PWA movement tracking and shared multiplayer are still unimplemented.


### v0.7.0 Local discovery density and motion economy

Twelve stable locally seeded nodes per current region, old three persisted, additional nine well separated. Harmony is a cycle of any three awake connected nodes, not a twelve-node completion checklist. Glimmers visible anywhere in the player's local vicinity carry no tap-to-collect action. LIVE Lumen can only be credited from the foreground 70m validated walking accumulator in any direction. Scan, field completion and node/veil taps grant no free Lumen. Reject noisy fixes, implausible jumps, driving-speed fixes; prefer conservative movement accounting. Daily earnings capped at 36; player inventory capped at existing 12, and the PWA does not track in background. Verify accessibility of signals and smartphone battery/accuracy in multi-day real walking trials; the app must not route players toward unsafe/unknown or private locations.
