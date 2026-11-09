# Majakka Native World v0.6 — true vector ground (Tampere pilot)

**Date:** 2026-11-09  
**Status:** Experimental / developer draft. **Not an approved visual build.**  
**Starting point:** v0.5.1 Godot 4.7.2 free-camera branch. Does **not** change deployed PWA/main.

## This version actually changes the map renderer

Prior versions recolored 256px OSM PNG tiles using pixel-classification heuristics, then stretched those textures across 3D ground. The result was rejected on Android.

- v0.6 does **not** download PNG map tiles or paint roads from colors.
- For one small central Tampere pilot it requests genuine OpenStreetMap **way geometries** from an Overpass API endpoint, **once on first run**. These are real geographic coordinates, not hardcoded or screen-drawn imaginary roads. Query bounds: lat 61.493–61.509, lon 23.744–23.785.
- The app parses ways tagged as highway, natural water, waterway, park, forest, grass etc., then builds **untextured, unlit Godot ground triangle meshes** for categories. The same Camera3D controls the map and keeps game-owned Nodes/Kaiku/player markers separate.
- Road text labels are regular screen-facing 2D UI labels projected from georeferenced positions; they are **never painted onto tilted terrain**.
- Overpass response is stored locally under `user://majakka_tampere_vector_v06.json` for up to 7 days, and there is a manual RETRY MAP control.
- Failed or unavailable OSM data is shown honestly as a network/data error with an empty background. There is **no fake map generation** and no automatic fallback to the rejected raster appearance.
- Public Overpass is only used as a **small private experiment**. Do not ship this client as a public globally scaling real-time data pipeline: rate limits, freshness, caching, licence obligations, planet extracts, runtime validation and provider economics need an independent production solution.

## Attribution

© OpenStreetMap contributors (ODbL). Features are downloaded from OSM through a public Overpass endpoint and transformed into render meshes. Proper notice, attribution, ODbL derived-database analysis and provider terms must be evaluated before production distribution. Pilot query has no user GPS input; coordinates are fixed to central Tampere.

https://www.openstreetmap.org/copyright  
https://wiki.openstreetmap.org/wiki/Overpass_API

## Technical structure

- `scripts/vector_world_canvas.gd`: new **vector-only** Godot renderer. It inherits the camera and owned game markers from `perspective_world_canvas.gd`, but **overrides the tile discovery method to disable raster downloads** and replaces textured ground with real triangulated road and area geometry.
- `scenes/world_map_canvas.tscn`: loads the vector renderer.
- `scripts/world_map.gd`: map-specific header/legends, manual retry, camera instructions.
- `tests/vector_map_smoke.gd`: offline deterministic parser and mesh smoke fixture; the synthetic fixture is **not** rendered on mobile. Existing world/projection/camera tests remain.
- `.github/workflows/native-kaiku-android.yml`: compiles and runs all tests, exports an Android debug APK.

## Acceptance conditions (not yet passed)

1. Godot 4.7.2 loads and compiles script, full native CI, debug APK export.
2. **Physical Android test:** vector source actually downloads on the user device (or cache works), correctly renders streets, parks and water. The user judges the look, not just an FPS number.
3. Maps are visually clean while rotating and zooming. No distorted/baked text; Node/Kaiku overlays stay anchored to actual geographic points.
4. Offline re-open shows cached geography when available. Error state works honestly when not.
5. Measure FPS, resident texture/mesh memory, stutter and thermal changes.
6. If ground geometry works but misses lakes (for example complex OSM multipolygons), improve OSM relation handling and/or use a proper vector-tile provider; **never fake missing features**.

## Known experimental limitations

- Overpass ways only: complex relations/multipolygons and holes are not rendered; large parks/water extents can be incomplete. Shoreline coverage **not guaranteed**. This is a narrowly scoped architecture proof, not a complete city basemap.
- Fetch requires internet. Server limits may refuse requests, and on-device mobile certificate/access performance is unverified.
- Old pilot Nodes and Flintail markers are demo fixtures and not live encounters.
- No buildings modelled. Elevation and 3D urban infrastructure intentionally not implemented.
- Camera gestures were added in v0.5.1 but require real Android confirmation.
- A temporary heading `VECTOR WORLD` is a developer label, not a final brand UI.

**Next:** get the baseline Android screenshot and first proper visual feedback before deciding provider/renderer upgrades. This is intentionally a developer branch until approval.
