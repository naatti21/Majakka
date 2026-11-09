# MAJAKKA — Native World v0.6: vector map quality gate

**Date:** 2026-11-09  
**Status:** SUUNNITELTU / EI VIELÄ TOTEUTETTU.  
**Triggered by:** user Android screenshot of v0.5.1 and explicit visual rejection on 2026-11-09.

## 1. Decision

**REJECTED:** v0.5/v0.5.1's raster recoloring technique as the final world renderer. v0.5.1's Godot compilation, headless smoke tests, and debug APK export passed, but physical Android *visual acceptance failed*. PR [#14](https://github.com/naatti21/Majakka/pull/14) closed without merging. The camera gesture algorithms may be retained for further tests, not automatically declared mobile-validated.

**APPROVED DESIGN DIRECTION:**
- The game-world basemap must be legible, clear, visually coherent, location-accurate and fast on mobile.
- Native 3D is for **game-owned objects**: Nodes, Kaiku and player, not hand-modelled buildings.
- The basemap is a geographical surface, not a 3D city simulation. It may use flat (or later gently graded) polygon data and 2D footprint patterns rather than individually modelled building meshes.
- Keep free camera orbit / tilt / pan / zoom as a feature; decouple camera state from physical GPS/player position.
- Keep the existing approved Flintail identity/presentation pipeline.

## 2. Verified why the old renderer looks bad

Actual v0.5 Godot scripts under `native-client/` on branch `feature/native-perspective-world-v05`:
- `world_map_canvas.gd` downloads 256px **OpenStreetMap Standard raster PNG tiles**, with labels permanently baked into pixels.
- `map_style.gd` categorizes individual raster pixels using a few RGB thresholds (water / grass / road / building / land) and produces blocky colors. v0.5 sampled 128px; v0.5.1 preserved 256px but **the RGB classification and raster distortion remained**.
- `perspective_world_canvas.gd` places each raster texture onto a 3D ground plane and tilts the camera. Oblique viewing magnifies low-res textures and bakes sideways text, with dense pixel noise in the distance.
- The game-owned 3D Beacons and billboard Flintail are present but visually detached from the flat, noisy map.

**Lesson:** Changing filtering, downsampling or textures alone cannot meet the quality bar. Reject the *raster-recolor-to-perspective* approach, not the goal of an interactive real-world map.

## 3. New renderer contract

### Basemap

A stylized rendering from **actual geospatial vector data**:
- **water** → clean dark-blue filled polygon;
- **parks/greenspace** → subdued dark-teal polygon;
- **land/urban ground** → nearly uniform muted dark substrate;
- **roads/paths** → clean connected lines with width hierarchy; no raster pixel extraction;
- **building footprints** → optional simple 2D silhouettes or omit for early quality test; never hand-build individual 3D houses;
- **labels** → clear screen-oriented overlay with zoom thresholds, not baked into angled ground texture.

Use real source IDs/georeferencing. Do not invent or procedurally fabricate Tampere roads or buildings. Separately validate real source availability/licensing and link to attribution.

### Game assets

3D Node and Kaiku remain separate scene layers from the basemap. Identity and motion are managed independently of map-data loading. Reuse existing preview fixtures but mark them DEMO; no claims about live POIs or real GPS.

### Camera

User-centered viewing with finger gestures (drag pan; two-finger pinch, twist, vertical tilt); keep a meaningful low-angle limit to avoid showing unrendered horizon and a HOME reset. No accidental Node taps on pinch. Touch input may reuse v0.5.1 code only after tests.

### Performance

Measure on the actual Android device:
- **target 60 FPS** in representative city view, with realistic fallback for weaker devices; record frame-time distribution, not just a single FPS readout;
- no texture/geometry churn or missing tiles during dragging;
- clear roads and water at normal and oblique camera angles;
- no illegible text on the terrain;
- RAM and thermal behavior after repeated pans and zooms.

## 4. Architecture spike before full implementation

**Option A (first proof of concept):** Godot-native vector rendering of a **real, bounded Tampere extract** (roads, paths, water, green area; optional 2D building footprints) into low-cost colored ground meshes. This keeps the existing Godot 3D camera and game objects in one scene and avoids platform-specific map/engine integration. Start with a documented vector extract and exact georeferencing; make data pipeline repeatable and suitable for later vector tiles. Do not misuse one-off hardcoded coordinates as a world solution.

**Option B (fallback investigation):** MapLibre Native Android SDK for map rendering, with a carefully tested Godot 3D presentation layer. SDK provides vector map tools, but **integrating two renderers, camera transforms, touch, and Android lifecycle is nontrivial**. A standalone Android MapLibre pilot may verify map quality, but is not a drop-in replacement for the Godot scene.

**Possible scalable data source:** Protomaps / PMTiles (vector basemap derived from OSM), with a controlled Tampere area extract. PMTiles is an archive/storage format, **not a ready-to-render Godot vector scene**. Protomaps basemap has ODbL/OSM-attribution obligations. No automatic hotlinking of public planet download for a game. Alternatively, other licensed vector datasets/providers can be benchmarked.

Source reading:
- https://docs.protomaps.com/basemaps/downloads
- https://github.com/protomaps/basemaps
- https://makewithmaplibre.com/sdks/maplibre-native-android-sdk/
- https://docs.godotengine.org/en/latest/tutorials/platform/android/embedding_in_android_projects.html

No architecture chosen as a permanent commitment before a measured mobile spike.

## 5. Acceptance experiment — compact Tampere pilot

1. Capture the original v0.5.1 screenshot as the **rejected baseline**. Its visual result is not a quality target.
2. Build one real-geography vector pilot around Tampere central water/bridge/road/park features. Clearly distinguish source geometry from game fixtures.
3. Use readable night colors without image-threshold recoloring and with vector road continuity.
4. Overlay one existing Node 3D Beacon, one Flintail prototype and demo home; confirm alignment and click/hit testing across zoom/pan/orbit.
5. Demonstrate free mobile camera without labels lying sideways on the ground; reasonable viewpoint near the horizon.
6. Gate on *real-device screenshot and interaction*, not CI smoke pass alone. **If it still resembles pixel mush, do not add Kaiku modeling or monetization/UI features to hide it.**
7. Keep experimental code on a branch; do not merge to main without explicit quality acceptance.

## 6. Project status semantics

- **REJECTED:** v0.5.1 raster palette/flat-texture visual treatment, user test 2026-11-09.
- **REUSABLE, NOT APPROVED AS UX:** v0.5.1 input/camera code.
- **APPROVED:** focus on excellent map and game-owned 3D objects, not 3D house reconstruction.
- **OPEN:** vector feed, extraction workflow, renderer choice, mobile performance, full-world tile distribution.
- **NOT IMPLEMENTED:** v0.6 vector prototype at time of this document.

Continue from [PROJECT-HANDOFF.md](../PROJECT-HANDOFF.md) and [Flintail pipeline](KAIKU-FLINTAIL-VISUAL-PIPELINE-v0.1.md).
