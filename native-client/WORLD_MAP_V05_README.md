# Majakka Native World Map v0.5 — Perspective Pilot

**Status: DRAFT / real Godot Camera3D proof-of-concept. Not production geometry.**

## What is different from v0.4
- Actual SubViewport + Camera3D, orbital camera with **42° above the horizon** starting elevation; tap TILT to cycle 42° → 53° → 64°. The viewpoint is no longer a top-down 2D draw.
- Existing sourced Web Mercator pilot geography is projected onto tiled XZ floor meshes and rendered in perspective. The dark styled OSM PNG tile cache is reused.
- All eight existing sourced pilot Nodes are 3D plinths, faceted Beacon cores and shard props; preview state affects color only.
- One 3D demo avatar marker, not actual GPS; two lightweight billboard Flintail demo encounters, not realtime animal meshes.
- Geographic map panning/zooming and Node tapping remain; hit testing now projects 3D anchor points through the Camera3D.
- No new server operations, location permissions, encounter rewards or gameplay state writes. Offline *visited* tile cache remains.

## Critical limits
- **Ground has real georeferencing, but is flat.** Buildings, roads, elevation, sidewalks and vegetation are still pixels in the raster floor. This is not yet the full stylized vector-based living city (and should not be called one).
- OSM standard raster labels baked into source tiles may appear flattened on the ground. Next gate is a licensed vector footprint/road/landuse extract and real world-space extrusions.
- Public OSM tile usage is **small private pilot only**; not suitable as an unmetered gaming CDN. Attribution remains in World UI.
- Perspective requires more GPU work than v0.4. Test FPS, thermal effects, map touch interaction, beacon alignment, and tile-loading artifacts on the physical Android phone.
- The `DEMO HOME` label is a fixed preview position and must NEVER be presented as the device's live location. No GPS permission or location server upload.
- Flintail art and collection card are still concept assets, not approved final species art.

## Acceptance
1. Godot 4.7.2 import, legacy smoke tests plus `perspective_map_smoke.gd`, debug APK export.
2. Physical Android test: see the tilted world, drag map, zoom, click Nodes and Kaiku, change camera tilt; no missing patches during normal panning.
3. Compare immersion versus v0.4 and record FPS / memory / battery; if target fails, adjust 3D view complexity before expanding.
4. Only after this camera feel is approved, begin georeferenced *vector* city roads/buildings/water and reusable 3D Node assets.
