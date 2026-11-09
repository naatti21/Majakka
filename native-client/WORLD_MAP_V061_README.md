# MAJAKKA Native v0.6.1 — offline vector pilot (Android QA)

**Status:** prototype / GitHub branch only; **not user-accepted**.
**Failure prompting revision:** Android screenshot on 2026-11-09 shows all 3D game markers but a completely empty ground with "VECTOR WORLD · loading real Tampere OSM geometry…". That is a hard fail despite 60 FPS.

## Root issue and fixed contract

v0.6 attempted to download thousands of OSM ways directly from public Overpass at **app startup**, then convert all geometries before first draw. A timeout, large response, rate-limit or parse validation fail left the map blank. The screenshot alone cannot prove which upstream failure happened. Godot CI only tested a synthetic in-memory geometry fixture and did not test that **real map data shipped**.

v0.6.1:
- Bundles a **real sourced and validated OpenStreetMap Tampere vector snapshot** into `res://assets/maps/tampere-vector-pilot.json`; no on-device Overpass request.
- JSON is created through a repeatable build-time `native-client/tools/build_tampere_osm_snapshot.py` using one small bounded Overpass query **on CI only** and source attribution. A dedicated GitHub workflow commits the generated snapshot to the development branch.
- Android asset export filter includes `assets/maps/*.json` explicitly.
- The map is parsed and drawn on startup, online **or offline**; RELOAD MAP only rereads bundled data. The old raster tile renderer remains disabled.
- CI fails if there is no bundled JSON, insufficient real sourced features, or the source-derived mesh layer doesn't render. The previous build falsely passed while providing no basemap.
- Existing 3D game-owned Node/Kaiku/demo player layers and free-camera controls remain separate.
- Labels stay screen-aligned, not baked into angled map textures.

## Visual QA

1. **Launch with airplane mode enabled:** named roads and dark-green/water polygons should be visible immediately. If data is missing, app prints a clear error and CI should have failed.
2. Turn on internet and retry; visual result should not change (the same fixed dataset is bundled).
3. Pan, zoom, orbit/tilt; map needs to follow without running into a missing-data spinner.
4. Check which Tampere roads and riverbank segments are missing. OSM way snapshots alone do not include multipolygon relations and cannot be treated as a complete city basemap.
5. Game elements should remain geographically aligned. Verify memory, FPS, labels and power consumption on real phone.

## Data governance

- Source: © OpenStreetMap contributors (ODbL-1.0), delivered via a one-time bounded Overpass POST. `metadata` in JSON records source URL, OSM replication timestamp, retrieval time and counts.
- Snapshot is development-only and small: near Tampere central district; not suitable as a worldwide offline map product.
- Generator validates minimum sourced roads, parks/water, file size and maximum sampled building outlines. No fabricated geography, and no user GPS is collected by this map.
- Build is **blocked** if the snapshot generation fails. Do not ship a blank map.
- This does **not** implement relation multipolygons, public POI validation, backend state or live player positions.

**Source map quality** (actual Android screenshot) remains a separate acceptance gate. Do not merge to main.
