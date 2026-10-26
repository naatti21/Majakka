# MAJAKKA — ONE WORLD v0.9 / Product & engineering contract
Status: draft; front-end implementation, not a launched multiplayer system. Date: 2026-10-26.

## Non-negotiable product behavior
1. Only **one geographically anchored connected world**. No LIVE / DEMO / offline game modes. **2D/3D are camera views**, not different worlds.
2. The player avatar represents the **actual GPS location**, if permission is granted. A player on their couch stays shown at home while independently browsing any place on the map.
3. **Full remote agency:** walking and stationary players can attune, decode, weave, stabilize and contribute to the same public nodes. Identical costs, resulting charge and community significance. Movement is never required for core progression.
4. A personal, world-stable, different-sized Lumen haze appears over the world. The 30 m player-local pickup radius provides optional ambient collection; a stationary player can also channel Lumen. Player-specific rewards must have fair daily limits, independent of travel.
5. Auto Atlas must distribute nodes across the world using deterministic real candidate selection (balanced art/history/nature/culture, <=24 candidate POIs per 1 km area, >=125 m separation, access/privacy filters), backed by at least six fictional Echo signals in sparse areas. Unsafe/unverified POIs are **remote-only**. Never recommend unsafe physical travel.
6. A real shared world means **server-authoritative** node state and contributions; client-side storage is not a substitute. Delayed aggregates are preferable to broadcasting other players' GPS positions.

## This prototype currently implements
- One online-facing map, remote nodal actions (for twelve virtual signal positions per coarse map region), unified 2D/3D navigation, permissioned/foreground-only GPS optional.
- Local-only saved progress; no real remote player synchronization. Per-device Lumen field, stationary channel, daily reward limit.
- Atlas Echo and candidate POI visual discovery. POI previews are not authoritative node actions.
- Network-only service worker, no offline shell or mock geography gameplay.

## Required next backend milestone (NOT done)
- Stable global node registry: deterministic ID, source metadata, type, geographic anchor, access-validation status, active/remote-only policy, version.
- Node state ledger: communal resonance, pending contributions, pulse/distribution policy and revision number. No action mutates state until validated and committed server-side.
- Contribution endpoint: authenticated or bounded pseudonymous identity, idempotency key, per-user limits, Lumen balance checked atomically, cooldown and anti-abuse. Physical presence must **not** be a prerequisite for node actions.
- Privacy: never publish or store user GPS trails or home coordinates. Map camera region and node interaction metadata should be minimized and retained under a published policy. Other users only see delayed aggregated changes.
- Personal progress and Lumen rewards must survive device changes under account identity or optional user-owned sync; avoid contradictory local/cloud balances.
- Server-side ingest/index for verified OSM/Overture candidates rather than direct public Overpass scraping on each client. Caching, attribution, access tagging, max density, and global reproducibility required.
- Real-time or incremental world subscriptions scoped to viewed cells, with safe throttling and stale-state conflict resolution. The client must clearly show pending vs committed effects.
- Security/privacy/permission tests and actual mobile acceptance testing before deploying multiplayer.

## Acceptance scenario
A player in Tampere stays physically at home (GPS avatar at home) and pans the camera to another region; there they open a node, spend two Lumen, and submit an attunement. A second player physically walking near the same node can submit the same action at the same cost. After server validation and the defined world pulse, both clients render an identical updated node state and connected field, without revealing either player's coordinates.

The current v0.9 branch passes this scenario **only through locally simulated independent actions**. Shared persistence and observation by a second player are explicitly a subsequent engineering milestone.
