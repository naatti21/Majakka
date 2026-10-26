# MAJAKKA v0.8 — Personal Lumen Field | Android QA

This is a **local-only prototype**, not a released shared-world feature. Test on a trusted, safe walking route; do not chase Lumen into roads, restricted property or unsafe places.

## Expected behavior
- Start **◎ LIVE** voluntarily; the foreground 12-minute GPS limit remains.
- 2D shows a subtle, player-specific haze of **three sizes** of Lumen specks, anchored to coordinates rather than spawned at the player's location.
- A directional player arrow and a **30 m collection ring** appear at a valid GPS position. In 2D the arrow indicates movement direction after an accepted movement fix; when stationary, direction is not independently measured.
- The 3D map shows separate personal particles, a metric collection ring and a physical arrow. In 3D, the arrow points in the **map camera's viewing direction**.
- First precise fix and valid walking steps can automatically collect nearby Lumen; **no taps** needed. Poor GPS accuracy (>35 m), implausible jumps, and repeated collections do not pay rewards.
- Small / medium / large particles yield **1 / 2 / 3** Lumen before balance and daily caps. A claimed particle vanishes until the local calendar day changes. General distance-based Lumen rewards are disabled.
- Pan the map: the field must stay attached to geography, not move as a cloud around the marker.
- Stop LIVE, background the PWA, then restart: geolocation stops as before; the same device sees the same field positions, and today's claimed particles remain unavailable.
- Test moving from one coarse node region to another; Lumen generation must be continuous and must not depend on node positions.
- Test 3D → 2D → 3D and low signal; 2D map and core node mechanics should remain functional.
- Pan the 3D map far away from the GPS marker: Lumen should regenerate around the **viewed area**, without moving the player or collecting remotely. Rotate the camera: the player arrow should follow camera viewing direction.
- Run `node --test tests/lumen-core.test.mjs` and existing repository tests for logic regression.

## Privacy and constraints
The local seed identifies a **browser installation**, not a signed-in player across devices. No new backend, shared Lumen synchronization, GPS trail or geolocation upload has been added. Claimed virtual particle IDs are stored locally for the current date. This is pseudonymous local data, not a strong anonymization guarantee. Third-party map tile providers can infer the viewed region.

Physical GPS tests, battery/performance on Android, 3D rendering and accessibility remain **unverified** until device QA. OpenAutoAtlas is still not connected to LIVE. This draft is not production-ready.

## Auto Atlas v0.8.1 — node coverage and visuals (draft)

The old 12 LIVE virtual nodes remain **playable** with their previous resonance, threads and field progress. They now use four differentiated sculptural node silhouettes in 2D and 3D. An **additional Auto Atlas preview layer** fills map browsing worldwide, even in DEMO without GPS:
- 1 km selection radius, maximum 24 real candidates, minimum 125 m candidate spacing, round-robin between art / history / nature / culture.
- Exclude explicit private, military, restricted, school, hazardous-status and incompatible-access POIs. All remaining POIs are nonetheless **remote-only**: OSM tagging is NOT pedestrian routing or on-site safety verification.
- In sparse areas generate at least six **fictional Echo markers**, located on a globally fixed deterministic coordinate grid. These are not real-world targets.
- 2D markers have distinct art/history/nature/culture prism shapes, subtle rings, and tap-to-read provenance; optional 3D renders colored physical extrusions, facets and bases anchored to real map coordinates.
- '✦ Find places' requests nearby OpenStreetMap points **only on tap**, sending the approximate current viewed area to public Overpass. 12-second timeout; no more than one request per two minutes; read-only, max 400 source elements per request; no personal GPS trail persisted. This public endpoint is **for low-volume private testing only**, not for general release.
- Overture Places *global batch provider* and OSM walking-network route safety checks are **not yet connected**; loading those reliably will require a prepared area dataset / controlled service. Do not describe these as already implemented.
- Auto Atlas POI and extra Echo markers are **preview/discovery markers only**. They do not yet take part in attunement / weave / saving / multiplayer. The old 12 LIVE nodes remain functional.

### Mobile QA
1. In ordinary DEMO without granting GPS, pan 2D over Tampere and then another district: six Echo silhouettes should appear, stable when revisiting the same coordinates.
2. Switch 3D; verify new shapes have physical world scale (no pixel-constant poles). Pan/rotate map and tap Echo. Ensure 2D still works after returning.
3. Click ✦ Find places: approve the explicit query knowingly; inspect candidate count, labels, remote-only warning and 2-minute cooldown. If Overpass fails, Echo layer must remain.
4. Start LIVE on a safe route: legacy 12 playable nodes, Lumen, 30 m pickup ring and directional marker must still work; extra public POIs must not offer directions.
5. Reload PWA on Android and verify v0.8.1 assets are active; look for UI/button collisions at narrow screen sizes and performance issues.

**Status:** Code-level syntax and selector smoke checks passed. Actual Android GPS/3D/Overpass network tests are not verified. Main branch intentionally remains unchanged.
