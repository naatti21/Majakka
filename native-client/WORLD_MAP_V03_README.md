# Majakka Native World Map v0.3 — Android map pilot

## Actual working surface (not a screenshot or static map)
- Godot `Control` + geographic Web Mercator projection (`world_catalog.gd`).
- Pan by touch, pinch-independent +/- zoom, HOME recenter; tap real sourced landmark, synthetic Kaiku encounter, or illustrative home marker.
- Map tiles fetched only for the **current viewport** using OSMF standard tiles in this *small private developer prototype*, conditional on live network. Distinct User-Agent and clear OSM attribution. 7-day persistent cache of **visited** tiles only. No bulk download, offline preload, geocoding, route-finding, GPS request, map-camera economic boost, or backend world state.
- Eight source-linked pilot nodes (names, OSM ids, approximate coordinates) imported from existing repo `pilot-sites.js`. Their display statuses are **fixtures**; NO authority or world modification.
- Two artificial Flintail sightings from source-linked nodes. No real location proof or prizes. Their `id` starts `demo:`.
- Player icon is **Demo Home Anchor**, not user GPS; no permission requested or user location stored.
- Current Flintail 2.5D sprite and Inventory card from v0.2 are kept for presentation testing.
- Frame rate, engine RAM, explicit UI notices for provenance, GPS and offline caching.

## Map tile rules and cost
Public OSMF tiles are not a production-scale CDN. This lab sends at most two requests concurrently, fetches only viewport tiles after pan/zoom (no prefetch), caches locally for at least 7 days and retains at most 160 visited files, displays credit and identifies itself with user-agent. Avoid large-scale testers with this provider. Before public alpha, replace tile provider with one under a suitable licence and measured budget; `majakka/map/tile_url` project setting supports switching templates. OSM map data != free public tile hosting.

## Security, safety, scope
- Map-camera motion has NO effect on player action location.
- Pilot OSM points may not be publicly accessible and are not turn-by-turn navigation targets.
- No server-authoritative status, Guardian deployment, inventory persistence or authentication.
- Engine memory monitor excludes full GPU texture residency; evaluate on physical phone.
- Initial build expects network and Android Internet permission. Previously *visited* cached tiles may be shown without a connection, but no offline map package or download functionality exists.
- Future live GPS is strictly opt-in with clear state; absence of permission retains free home-region gameplay.

## Tests
`godot --headless --path native-client --editor --import --quit`
`godot --headless --path native-client --script res://tests/world_map_smoke.gd`
`godot --headless --path native-client --export-debug Android build/majakka-kaiku-lab-debug.apk`

## Not done
No player GPS, saved camera location, seasonal wild spawn service, global POIs, Guild, real Network fields, player avatar animation or production-ready Kaiku art. PR remains draft until Android screenshot and touch controls checked.
