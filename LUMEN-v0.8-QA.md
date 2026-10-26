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
