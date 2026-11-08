# Majakka Stylized World Map v0.4 — Dark Render Pilot

Status: **DRAFT / UI+renderer experiment**, not production world-map service.

## What changed
- Keep v0.3 Web Mercator touch pan, zoom, Home, 8 real pilot Nodes and two explicit demo Kaiku encounter coords.
- Convert fetched/cached standard OSM map tiles to 128×128 dark stylized color/height-look textures **on device**; minimize live tile GPU texture memory. No tile source or geolocation is invented.
- Replaced plain map marker pins with local-drawn faux-3D prism Beacons (Dormant, Awakened, Interference).
- Replace generic blue GPS-looking icon with a distinct avatar/signal Home anchor marked **HOME · DEMO**. Not GPS.
- Stylized ground shadow and aura under 2.5D Flintail sprite; no extra 3D models, no added backend calls.
- Preserve source attribution, viewport-only requests, small private pilot usage, 7-day visited-cache; a vector/planet source and proper licensed distribution are needed before a scaled public app.

## Known issues / honest limitations
- **Not a real vector basemap**. OSM PNG source has baked labels and its colors can shift; re-coloring/downsizing cannot guarantee complete removal of street labels, ideal road hierarchy or true building extrusion. Some labels may leave ghosting. The style is an interim test to learn desired look; do **not** market it as a full vector-tile map.
- This is an **optical 2.5D** map: 3D-like raised Beacons and block-top shading, not pitched GPU 3D terrain or guaranteed accurate building heights.
- No real GPS, real player account, encounter spawn rules, owner-authoritative Node state, Network Links, multiplayer or global tile provision.
- Tiles still depend on OSMF's public raster service; a private small pilot only. Not intended for bulk/distributed operation.
- Tile processing is on download/cache decode, not every frame. On some low-end devices this may cause a brief stutter while loading; record it in device test.
- Existing art cards are unchanged and still low-resolution prototype assets.

## Test on Android
1. Pan + zoom from Tampere toward Nokia; confirm map remains recognizable but markedly dark/stylized.
2. Verify all pins remain geographically correct and selectable; three Node demo states distinct.
3. Check HOME DEMO never claims actual GPS, even if device location is enabled.
4. FPS, startup, pan, battery/heat and tile-load stutters; compare against v0.3.
5. Check the pale labels / odd color classes at different zooms; approve the **direction** only, not final map renderer.

## Next architecture gate
Replace PNG tile processing with a licensed/self-hosted **vector-geodata renderer** (roads/water/landuse/footprints); do a bounded Tampere vector extract then measured low-memory Android draw performance. Keep a configurable rendering backend: `MapDataProvider` -> `WorldMapStyle` -> `Node/KaikuOverlay`.
