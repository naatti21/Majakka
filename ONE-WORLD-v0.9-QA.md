# MAJAKKA One World v0.9 — Mobile acceptance checks
Status: development branch only; no production or shared multiplayer release.

## Expected online behavior
- With a usable network, open the app: one real street-map world, no LIVE/DEMO/offline mode toggle. The world is browsable before granting GPS permission.
- Tap **⌖ Locate me** (or automatically start if already granted): avatar is positioned at current GPS location, but manually browsing elsewhere must not teleport the avatar or prevent action.
- Open an arbitrary world region by panning 2D: virtual nodes appear, remain world-anchored, and stay interactive from the couch. Activate/Decode and link using the same rules as at the node in person.
- Switch to 3D, rotate/pan across a region boundary, select a node, return to 2D. The same viewed region and progress must survive the switch.
- Press **◉ Position on** to pause location updates. The world, visible nodes, progress and interactions remain. Resume with Locate me.
- **✧ Channel Lumen** without walking. 2 Lumen with 120-second cooldown, subject to same daily award cap. Movement-based 30 m pickup still works with valid GPS fixes.
- App goes to background: GPS watch stops (no saved trail). Returning to foreground may resume if permission was previously granted; otherwise map stays usable online.
- Toggle airplane mode while app is open: show **CONNECTION REQUIRED**, not a fake offline street map or playable offline level. Reconnect: restore the same currently viewed online world and private progress.
- The old 12-minute countdown and simulator walk must be absent. There should be no "LIVE" or "LOCAL DEMO" game-mode badge.
- **Note**: node actions are **not synced between two devices yet**. This should be reported as a missing backend, not a test failure.

## Engineering checks
- Run `node --test tests/unified-world.test.mjs tests/atlas-core.test.mjs tests/lumen-core.test.mjs tests/living-core.test.mjs tests/scene-geometry.test.mjs`.
- Confirm the service worker uses network-only same-origin requests and deletes old `majakka-*` caches during activation.
- Verify no reinitialization of the selected region when GPS is paused; changing the viewed region must persist previous private progress.
- Check phone screen width down to 320 px for overlap between Locate me / Find places / Channel Lumen / node actions / bottom navigation.
- Check real map, GPU use and battery on Android. Source-level parse and smoke tests are not substitutes for device QA.

## Explicit limitations
The UI says connected prototype, because basemap and optional POI discovery use the network. The node-state backend does not yet exist. No actual cross-user sync, verified world ownership, geolocation trail storage or secure event validation is implied.
