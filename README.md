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
