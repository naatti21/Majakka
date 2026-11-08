extends RefCounted
## Pure geographic projection and SOURCE-LINKED pilot catalogue.
## Coordinates below were imported from Majakka's existing pilot-sites.js (main).
## They are place indicators; they do not grant permissions or assert accessibility.

const MAX_LAT := 85.05112878
const TILE_PX := 256.0
const MIN_ZOOM := 10
const MAX_ZOOM := 16

static func project(lat: float, lon: float, zoom: int) -> Vector2:
    var clamped_lat: float = clampf(lat, -MAX_LAT, MAX_LAT)
    var radians: float = deg_to_rad(clamped_lat)
    var scale: float = TILE_PX * pow(2.0, float(zoom))
    return Vector2((lon + 180.0) / 360.0 * scale,
        (1.0 - log(tan(radians) + 1.0 / cos(radians)) / PI) * 0.5 * scale)

static func unproject(world: Vector2, zoom: int) -> Vector2:
    var scale: float = TILE_PX * pow(2.0, float(zoom))
    var lon: float = world.x / scale * 360.0 - 180.0
    var n: float = PI * (1.0 - 2.0 * world.y / scale)
    var lat: float = rad_to_deg(atan(sinh(n)))
    return Vector2(lat, lon)

static func world_pixels(zoom: int) -> float:
    return TILE_PX * pow(2.0, float(zoom))

static func pilot_nodes() -> Array[Dictionary]:
    return [
        {"id":"osm:way/23704451", "source_id":"way/23704451", "name":"Museokeskus Vapriikki", "lat":61.50297, "lon":23.76029, "kind":"culture", "preview_state":"Awakened"},
        {"id":"osm:way/88874701", "source_id":"way/88874701", "name":"Tampereen tuomiokirkko", "lat":61.50249, "lon":23.76985, "kind":"history", "preview_state":"Dormant"},
        {"id":"osm:way/680725378", "source_id":"way/680725378", "name":"Näsinneula", "lat":61.50496, "lon":23.74329, "kind":"history", "preview_state":"Interference"},
        {"id":"osm:way/88360590", "source_id":"way/88360590", "name":"Sara Hildénin taidemuseo", "lat":61.50516, "lon":23.74078, "kind":"art", "preview_state":"Dormant"},
        {"id":"osm:node/4868406530", "source_id":"node/4868406530", "name":"Muumimuseo", "lat":61.49607, "lon":23.78290, "kind":"culture", "preview_state":"Dormant"},
        {"id":"osm:node/10087202868", "source_id":"node/10087202868", "name":"Hatanpään kartano", "lat":61.48339, "lon":23.75085, "kind":"history", "preview_state":"Dormant"},
        {"id":"osm:way/87736814", "source_id":"way/87736814", "name":"Nokian kirkko", "lat":61.47981, "lon":23.53205, "kind":"history", "preview_state":"Dormant"},
        {"id":"osm:way/1336202931", "source_id":"way/1336202931", "name":"Hinttalan kotiseutumuseo", "lat":61.48050, "lon":23.52848, "kind":"culture", "preview_state":"Dormant"},
    ]

static func preview_encounters() -> Array[Dictionary]:
    # FIXTURE ONLY: anchored to source-linked pilot nodes, not live wild spawns.
    return [
        {"id":"demo:flintail-vapriikki", "species_id":"sp.flintail", "form_id":"fm.flintail.base", "name":"Flintail · Demo Encounter", "lat":61.50345, "lon":23.75825, "anchor_node":"osm:way/23704451", "kind":"encounter"},
        {"id":"demo:flintail-moomin", "species_id":"sp.flintail", "form_id":"fm.flintail.base", "name":"Flintail · Demo Encounter", "lat":61.49660, "lon":23.78225, "anchor_node":"osm:node/4868406530", "kind":"encounter"},
    ]

static func preview_home() -> Dictionary:
    # Illustrative position only; NEVER identify this coordinate as the player's real GPS.
    return {"id":"demo:home", "name":"Demo Home Anchor", "lat":61.49780, "lon":23.76140, "kind":"home"}
