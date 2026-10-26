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


## Live field trial — v0.3.1 (foreground only)

A new **◎ LIVE** button enables a voluntary 12-minute GPS test through the browser. Nothing requests location before the user taps this control. On a fresh fix the map follows the user's location and draws a local sonde marker. The Tampere demo nodes, rift and field are hidden while live mode is active to avoid presenting simulated locations as real-world sites. Tap **■ STOP** to end early. Switching apps / hiding the page also ends the location watcher. A later visit never restarts it automatically.

**✧ Scan** offers up to two modest Lumen gains per live session with a cooldown; slow movement may offer up to three more, subject to accuracy, distance, time and speed gates. These are test economics, not live public-world contributions. No GPS coordinate or trail is saved to IndexedDB/localStorage, and no coordinates are sent to a Majakka game server. The third-party map tile provider can infer the viewed region from tile requests. Location stays in RAM during this short trial; only the existing Lumen balance can change. No real public nodes or GPS-backed visits are implemented. GPS needs HTTPS and browser permission. If map tiles fail, the location experience is incomplete.

Run `node --test tests/live-core.test.mjs` for the pure GPS distance and reward gating tests. Real-device permission and map tracking are **not yet verified**.


## v0.3.2 — Real map reliability fix

MapLibre now loads before application initialization (`defer` instead of an asynchronous race). If the primary CDN fails, the client tries a separate script CDN. OpenFreeMap Fiord is preferred; if a map style does not become ready, OpenFreeMap Liberty is tried. A visible map-loading/error indicator offers a retry rather than silently leaving the fictitious Tampere fallback. The optional LIVE trial will recenter to the real GPS position when the map finishes loading, including if GPS became available first. The map-center control follows the live position in LIVE mode and returns to the Tampere sample scene only in DEMO mode. No coordinates are persisted or sent to a Majakka backend. The map tile provider receives the visible map region; this remains a third-party network dependency. Note: rendering requires WebGL and live map tiles; offline fallback is explicitly not a geographically accurate street map.


## v0.3.3 — Foreground GPS map interaction fixes

Live map now centers on the first accepted GPS position **once per opted-in session**, with no automatic following after that. Dragging before the first fix cancels even initial centering; tap the existing target (⌖) to explicitly recenter. Stopping LIVE does not jump the map back to Tampere: the target restores the demonstration view. Starting LIVE resets Harmony/Memory to World, and showing either panel later temporarily hides overlapping GPS readout/Scan controls. GPS info is shortened for a small screen. This fixes issues reported during the first real Android test.


## v0.3.4 — restore last field-verified map configuration

The previous GPS/HUD modification was rolled back after the user reported the map stopped loading. Restored live-field.js and live-field.css exactly from v0.3.2 (commit 900db89). All other v0.3.2 files remain in place. Service-worker cache version bumped to force a new app-shell installation. The previous recurring follow and Harmony overlap are known open issues; real-world map loading takes priority. **Phone retest required.**


## v0.3.5 — Street map boot repair

After the Android map showed **Loading geographic map…** indefinitely, the map implementation was replaced with a self-contained first-party raster map renderer (`raster-map.js`) using *only on-screen* OpenStreetMap Standard raster tiles. Map JS and WebGL are no longer loaded from external CDNs. The map provides drag, pinch/scroll zoom, projection for node overlays, panning, and map events for LIVE GPS. Tiles are requested directly by the browser; they follow the normal HTTP cache and are not preloaded or included in PWA cache. This is a temporary low-volume testing approach, not yet a scale-ready basemap contract.

Map boot starts **before** IndexedDB initialization. The PWA shell changes to network-first for HTML/CSS/JS, and the HTML references local assets using a new build query to avoid previous service-worker cached files from mixing old and new versions. Device GPS track handling and live cooldown logic remain untouched. The map has a tile-load error after 12 seconds rather than an infinite loading label. Any future production map provider will need explicit licensing and capacity review.


## v0.3.6 — Nocturne visual pass (25 Oct 2026)

A self-contained `nocturne.css` applies Majakka's original dark, desaturated identity to the still-working OSM raster map. The heavy pink motorway and green forest colors are suppressed by a grayscale treatment. Demo nodes gain light-footprints, a soft vertical light column, and a lifted core through CSS-only **2.5D** layering; restored nodes are warmer and interference areas violet. This is inspired by general game-lighting principles, **not a reproduction of Baseline or Ingress**. Existing raster map code, GPS location tracking, Lumen, game state and persistence remain unchanged. Map labels necessarily share the same filter as raster tiles. A configurable vector map style would later give precise control over road, park and water colors. **Android appearance and performance after update await phone QA.**


## v0.4.0 — Optional Perspective Trial

A left-side **3D** button opens an experimental, isolated MapLibre GL JS v6.15 perspective map with tilt and rotation, using OpenFreeMap Fiord, optional Mapterhorn terrain, soft extruded buildings (when the vector source allows), and Majakka's original glowing 3D-inspired node markers. Tap **2D** to return immediately to the working locally rendered raster map. A failed/slow 3D module automatically returns to 2D after 24 seconds; the original 2D map engine is never unloaded. 3D WebGL and remote CDN/vector/DEM services require network support.

Existing Tampere sample nodes, links, and harmony field are projected into the 3D test scene. In LIVE, nearby beams and Lumen glints are **temporary visual fixtures**, NOT actual public POIs or persistent multiplayer content. GPS goes only into memory in a same-origin frame and is never stored as a trail. Source-attribution appears through the 3D map provider's controls. Browser and device tests of 3D are still open.


## v0.4.1 — Scale-true beacons and one-finger tilt

The first Android field review confirmed that map pitch/rotation creates the intended sense of a world, but HTML marker columns appeared visually disconnected and retained pixel dimensions while the map zoomed. The optional 3D scene now uses GeoJSON-grounded rings and meter-sized, MapLibre `fill-extrusion` light volumes. Their actual size/perspective follows the map and landscape. Light cores, map-hugging glints and transparent touch targets are rendered in vector map layers. Players can activate the new **↕ TILT** touch rail with one vertical finger gesture; one-finger dragging elsewhere still pans normally, while two fingers continue to rotate and zoom. 2D mode and its offline fallback remain unchanged. This is a lightweight first pass, not a realistic volumetric-light simulation. Preview lights are not public nodes.


## v0.5.0 — Living World preview

Opt-in **LIVE** GPS (12 minutes) now anchors a **single-session local fictional world** near the first accurate location fix: three virtual light nodes, one interference veil and six Lumen sparks. All virtual coordinates are *ephemeral in RAM* and reset on STOP/background; they are **not verified POIs, real destinations or multiplayer**, and the game must never direct anyone to physically enter a location without independent safety verification. Nodes can be attuned with near/far Lumen cost or a simple optional memory decode. Each world pulse settles contributions. Three awakened nodes create a harmonic field. The interference veil dims nearby nodes and expands its shaded area until two separate pulse contributions clear it. Local achievement counts, dates, and a **shared 12 Lumen/day cap** persist on this device, without storing origin coordinates or GPS paths. Existing LIVE Scan and movement rewards use the same cap so restarting the trial cannot refill endlessly. No server, geolocation upload, or proximity claim is made. 2D and optional 3D show the same ephemeral node layout and progress.


## v0.6.0 — Three-day Living Field trial (25 Oct 2026)

**What changed:** The prior ten-minute simulated-reset loop was not engaging in actual Android testing. This field trial uses **stable approximate 600–900 m geographic cells** (Web Mercator z14), so restarting LIVE near the same area regenerates the *same* virtual nodes. Progress for each cell persists across app opens and days. A different cell such as another part of town has its own progress. GPS follows only while the user opts into a bounded foreground session: there is **no reliable tracking while PWA is closed/backgrounded**. Avoid interacting while walking in traffic or driving.

**Privacy:** Raw positions and routes are not stored. The device stores a random private salt plus salted SHA-256 fingerprints of coarse grid cells, and progress per fingerprint in localStorage. These fingerprints ARE derived from approximate visited areas, could be linked to coarse locations by someone with access to all local device data, and are not proof of anonymity. Nothing is uploaded to a Majakka server. Users can clear regional state and the location-free test diary from **Memory → Clear local fields**; the existing wider game progress remains separate. The chosen map tile provider still sees viewed areas as tile requests.

**Gameplay:** Players may now choose to weave specific links after awakening both endpoint nodes. All three actual links plus three awake nodes are needed to complete the first harmonic field (resolved on the next world pulse); a link is not a ground line. A 90-second real-time cooldown between local world pulses prevents instant button-spam completion. Optional challenge types rotate among visual phase alignment, shared-frequency deduction and a self-timed three-beat cadence; players may instead spend Lumen. This is a prototype of different mechanics, not a mature game system. The 3D scene draws soft, meter-scaled wandering aerial mycelium via MapLibre fill extrusions above the node tops. The 2D fallback uses gentle curved links and a translucent harmonic region.

**Feedback:** A new D-minor-pentatonic WebAudio motif system signals collecting, attuning, weaving, harmonizing and interference outcomes without dozens of overlapping sounds. Audio follows existing sound opt-in; vibration can be disabled via Memory → Vibe. **Memory → Copy field report** copies per-day aggregate play counts (no location data) to analyze in ChatGPT Work. LIVE scanning and movement keep the same daily Lumen cap. No real public node locations, verified POIs or shared multiplayer are claimed.

**QA caveat:** Source and pure-game checks completed; phone QA of sound, haptics, 3D floating arcs and multi-day retention is still required. Work/cloud browser can check navigation/layout and simulated scenarios but cannot substitute for real GPS movement or Android vibration.


## v0.6.1 — Dispersed map and silent rhythm repair

This fixes two issues from the first multi-day field test. First, the previous three nodes spawned in the same compact ~200-m cluster around every cell center. The same three-node pattern appeared in each neighborhood and was too easy to tap through. Each existing stable cell now has a distinct deterministic, rotated constellation with three nodes roughly **300–750 m** from its center and generally **500+ m** apart. Up to eight dim silhouettes from adjacent regions appear without being activated by tapping; moving to those regions can open their own fields. They remain purely virtual points, **not validated places or safe navigation destinations**. Cell identifiers and saved progress schema are unchanged; previously saved contributions survive, but virtual node positions move under the revised layout.

Second, an ordinary home session may still contribute a weak remote attunement, but repeated distant contributions to the *same node* require a **20-hour settlement window**. Physically near (within 85 m and acceptable GPS accuracy) attunements continue to work sooner; no physical visit is mandatory for eventual remote progress. This is a **client-side test mechanic**, not server-enforced antifarming.

The rhythm decoding challenge now has a visually moving scan marker and highlighted center hit window, with three separate correctly timed taps and persistent visible count. **Audio and haptics are not required.** It also offers an **untimed pattern-reading alternative** without a Lumen penalty for users who cannot or do not want to perform a timing task. The existing other decoding modalities remain. The light positions are reproducible from the map cell seed; no new GPS logging, route database, or location upload has been added.


## v0.7.0 — Distributed Nodes & Walking Lumen

**Motivation:** The player's Android field test showed too few actionable nodes and energy tied to nearby points. v0.7 raises each stable private-region field from **3 to 12 activatable virtual nodes** (the original first three retain their IDs/positions and saved charge). Nine additional seeded beacons are separated by at least 135m and scattered in multiple directions, while eight dim signals from neighboring regions still indicate that the world continues. The map zooms out on first LIVE GPS fix to make a broader section of the neighborhood visible. These are NOT verified POIs or recommended walking destinations; do not seek access to private/unsafe places.

**Walking energy:** Lumen is collected *automatically* from roughly 70m of sufficiently reliable movement **in any direction** while the user explicitly runs the foreground GPS LIVE trial. The new pure `walk-energy.js` accumulates short accepted GPS segments, ignores small GPS jitter, large jumps, implausible speed and low precision, and retains neither travel coordinates nor a route. Position and incomplete progress are session RAM only. Driving is not an intended earning method; GPS estimates are imperfect, so this is a test model rather than tamper-resistant pedometry. The device-local per-day earned ceiling is now 36 Lumen; the existing sonde's 12-Lumen capacity still applies. No Lumen is minted by Scan, tapping decorative specks, awakening a field or clearing a veil. Scan remains visual only. Ambient glimmers now follow the player's area, purely decoratively, not as pick-ups.

**Local graph:** A harmonic field may form around **any triangle of three awake, deliberately connected nodes**; the full 12-node network is not a prerequisite. Multiple real triangular connections appear as curved polygons in 2D and geographic 3D fields. 3D polygon count and rendered aerial links have practical caps to preserve mobile performance. Earlier v0.6.x stored arrays of length 3 are expanded safely to 12 while preserving the first three nodes' contribution, pending charge and links. This does not implement server-shared multiplayer or background route tracking. Real device testing of GPS drift, walking sensitivity, battery life, and visual layout remains necessary.


## Node Atlas v0.1 — vetted real-world anchors (design spike, NOT live)

The longer-term Majakka map will combine manually reviewed public-interest anchors, player-nominated places, and fully fictional remote-play Echoes. Review [docs/NODE-ATLAS-v0.1.md](docs/NODE-ATLAS-v0.1.md) for eligible place categories, safety and public pedestrian-access requirements, park entrance placement, provenance/ODbL constraints, photography rights and EXIF removal, moderation/appeals, privacy and rollout gates. `node-atlas-policy.js` is a **pure local triage module** for candidate screening. It NEVER approves or publishes content and is deliberately not loaded by the existing v0.7 LIVE map. Test with `node --test tests/node-atlas-policy.test.mjs` where Node is available. Future players will be able to submit **local photo drafts first**, then nominate publicly only after moderated backend governance is in place. The current 12 fictional region nodes remain explicitly experimental.


## Node Atlas 0B — OSM review laboratory (26 Oct 2026)

A separate public GitHub Pages URL, [Node Atlas review](./atlas-review.html), displays a dark 2D raster map with a user-triggered and rate-limited Overpass search for **real but UNVERIFIED** OpenStreetMap POIs in a 1.2 km radius. It uses the previously added conservative Node Atlas safety policy; returns pending/rejected categories, original OSM links, geographic notes and a non-public, copyable JSON review report. All local review decisions are ephemeral memory; no GPS API, photo uploads, auto-publishing, account system or backend. Core v0.7 LIVE gameplay and map are intentionally unchanged. **No approved Majakka physical node dataset exists yet.** Consult [Node Atlas 0B field guide](./docs/NODE-ATLAS-0B-REVIEW.md) and [Node Atlas v0.1 rules](./docs/NODE-ATLAS-v0.1.md).

Node Atlas imports OpenStreetMap point, way and relation records and treats a way/relation's center as an approximate candidate position, **never as an automatically verified public entrance**. Requests are manual (no map-pan auto-fetch), capped by area/result count and spaced out to respect community servers. Maps and public Overpass do receive the selected area as part of those explicit network requests. OSM attribution/ODbL and any derived-database obligations require further production review.

Read [tests/atlas-import.test.mjs](./tests/atlas-import.test.mjs) for importer tests. Device network, third-party provider CORS, first real OSM candidate list and visual Android QA are still open.
