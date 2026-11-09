extends "res://scripts/perspective_world_canvas.gd"
## Majakka World v0.6: experimental VECTORIZED OSM pilot ground, NOT raster tiles.
## Godot Camera3D, Nodes, Kaiku, and player remain independent 3D layers.
## Small user-triggered/first-run online Overpass pilot only; not a game tile service.
## Real OSM geometries are cached locally, never invented from painted pixels.

const PILOT_ORIGIN := Vector2(61.5010, 23.7620)
const PILOT_ZOOM := 13
const MAX_ELEMENTS := 4300
const MAX_GEOMETRY_POINTS := 150000
const CACHE_PATH := "user://majakka_tampere_vector_v06.json"
const CACHE_TTL := 7 * 24 * 3600
const OVERPASS_HOSTS := [
    "https://overpass.private.coffee/api/interpreter",
    "https://overpass-api.de/api/interpreter"
]
const PILOT_BBOX := "61.493,23.744,61.509,23.785"
const PALETTE := {
    "water": Color("153d50"),
    "park": Color("17443e"),
    "building": Color("263d47"),
    "water_line": Color("246178"),
    "main": Color("72918d"),
    "local": Color("4d7270"),
    "foot": Color("47655f")
}
const LAYER_Y := {
    "water": -0.22,
    "park": -0.18,
    "building": -0.135,
    "water_line": -0.10,
    "main": -0.06,
    "local": -0.055,
    "foot": -0.045
}
const WIDTH := {"water_line": 1.6, "main": 0.65, "local": 0.36, "foot": 0.16}

var _vector_layer: Node3D
var _labels_layer: Control
var _request: HTTPRequest
var _request_index := 0
var _elements_loaded := 0
var _features_loaded := 0
var _vector_status := "Vector map preparing…"
var _load_failed := false
var _loading_vector := false
var _street_labels: Array[Dictionary] = []
var _label_elapsed := 0.0
var _data_ready := false

func _ready() -> void:
    # Parent builds camera and game-owned 3D items. Override _visible_tiles()
    # prevents the old PNG tile downloader from running.
    super._ready()
    _vector_layer = Node3D.new()
    _vector_layer.name = "OSMVectorBasemap"
    _tile_layer.add_child(_vector_layer)
    _labels_layer = Control.new()
    _labels_layer.name = "ScreenAlignedStreetLabels"
    _labels_layer.mouse_filter = Control.MOUSE_FILTER_IGNORE
    _labels_layer.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
    add_child(_labels_layer)
    _load_vector_cache_or_fetch()

func _visible_tiles() -> void:
    # No raster tile downloads. The vector ground remains at global reference
    # geography and is transformed when zoom/pan changes.
    pass

func zoom_by(change: int) -> void:
    super.zoom_by(change)
    # Keep the vector layer and its screen labels geographically correct on
    # immediate zoom calls (buttons/tests), not only the next idle frame.
    _sync_geometry(0.0)

func center_on(lat: float, lon: float) -> void:
    super.center_on(lat, lon)
    _sync_geometry(0.0)


func retry_vector_map() -> void:
    if _loading_vector:
        return
    _request_index = 0
    _start_download()

func _set_vector_status(message: String) -> void:
    _vector_status = message
    map_status.emit(message)

func _load_vector_cache_or_fetch() -> void:
    # Headless CI must not require internet or query community Overpass servers.
    if DisplayServer.get_name() == "headless":
        _set_vector_status("VECTOR WORLD · offline smoke test")
        return
    if FileAccess.file_exists(CACHE_PATH):
        var age := int(Time.get_unix_time_from_system()) - int(FileAccess.get_modified_time(CACHE_PATH))
        if age <= CACHE_TTL:
            var cached := FileAccess.get_file_as_string(CACHE_PATH)
            if _consume_json(cached):
                _set_vector_status("VECTOR WORLD · %d real OSM features · cached" % _features_loaded)
                return
    _start_download()

func _query() -> String:
    var b := PILOT_BBOX
    return "[out:json][timeout:25];(" + \
        "way[highway~\"^(primary|secondary|tertiary|unclassified|residential|living_street|service|pedestrian|footway|cycleway|path)$\"](" + b + ");" + \
        "way[natural=water](" + b + ");" + \
        "way[building](" + b + ");" + \
        "way[waterway~\"^(riverbank|river|canal|stream)$\"](" + b + ");" + \
        "way[leisure~\"^(park|garden)$\"](" + b + ");" + \
        "way[landuse~\"^(grass|forest|recreation_ground|meadow)$\"](" + b + ");" + \
        ");out tags geom;"

func _start_download() -> void:
    if _request != null:
        _request.queue_free()
        _request = null
    if _request_index >= OVERPASS_HOSTS.size():
        _loading_vector = false
        _load_failed = true
        _set_vector_status("Vector data unavailable · tap RETRY MAP · no fake roads drawn")
        return
    _loading_vector = true
    _load_failed = false
    _set_vector_status("VECTOR WORLD · loading real Tampere OSM geometry…")
    _request = HTTPRequest.new()
    _request.name = "VectorDataRequest"
    _request.timeout = 40.0
    add_child(_request)
    _request.request_completed.connect(_on_data_loaded)
    var url: String = str(OVERPASS_HOSTS[_request_index]) + "?data=" + _query().uri_encode()
    var err := _request.request(url, PackedStringArray(["Accept: application/json", "User-Agent: MajakkaNativeVectorPilot/0.6 (+https://github.com/naatti21/Majakka)"]))
    if err != OK:
        _request_index += 1
        call_deferred("_start_download")

func _on_data_loaded(result: int, response_code: int, _headers: PackedStringArray, body: PackedByteArray) -> void:
    if _request != null:
        _request.queue_free()
        _request = null
    var good := result == HTTPRequest.RESULT_SUCCESS and response_code == 200
    # Limit payload: this experiment does not download a whole city database.
    if good and body.size() > 0 and body.size() < 7000000:
        var json_text := body.get_string_from_utf8()
        good = _consume_json(json_text)
        if good:
            var output := FileAccess.open(CACHE_PATH, FileAccess.WRITE)
            if output != null:
                output.store_string(json_text)
                output.close()
    if good:
        _loading_vector = false
        _set_vector_status("VECTOR WORLD · %d OSM features · 3D game markers" % _features_loaded)
    else:
        _request_index += 1
        call_deferred("_start_download")

func _category(tags: Dictionary, geo: Array) -> String:
    var highway := str(tags.get("highway", ""))
    var natural := str(tags.get("natural", ""))
    var waterway := str(tags.get("waterway", ""))
    var leisure := str(tags.get("leisure", ""))
    var landuse := str(tags.get("landuse", ""))
    var closed := geo.size() >= 4
    if closed:
        var first: Dictionary = geo[0]
        var last: Dictionary = geo[geo.size() - 1]
        closed = absf(float(first.get("lat", 0)) - float(last.get("lat", 1))) < 0.00000001
        closed = closed and absf(float(first.get("lon", 0)) - float(last.get("lon", 1))) < 0.00000001
    if closed and tags.has("building"):
        return "building"
    if closed and (natural == "water" or waterway == "riverbank"):
        return "water"
    if closed and (leisure == "park" or leisure == "garden" or landuse in ["grass", "forest", "recreation_ground", "meadow"]):
        return "park"
    if waterway in ["river", "canal", "stream"]:
        return "water_line"
    if highway in ["primary", "secondary", "tertiary"]:
        return "main"
    if highway in ["unclassified", "residential", "living_street", "service", "pedestrian"]:
        return "local"
    if highway in ["footway", "cycleway", "path"]:
        return "foot"
    return ""

func _to_local(pt: Dictionary) -> Vector2:
    var source := GEO.project(float(pt.get("lat", 0)), float(pt.get("lon", 0)), PILOT_ZOOM)
    var origin := GEO.project(PILOT_ORIGIN.x, PILOT_ORIGIN.y, PILOT_ZOOM)
    return (source - origin) / PIXELS_PER_UNIT

func _make_surface(kind: String, tool: SurfaceTool, has_geometry: bool) -> void:
    if not has_geometry:
        return
    var instance := MeshInstance3D.new()
    instance.name = "Vector_" + kind
    instance.mesh = tool.commit()
    var tint: Color = PALETTE[kind]
    var material := StandardMaterial3D.new()
    material.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
    material.albedo_color = tint
    material.cull_mode = BaseMaterial3D.CULL_DISABLED
    material.roughness = 1.0
    instance.material_override = material
    _vector_layer.add_child(instance)

func _append_line(tool: SurfaceTool, coordinates: Array, width: float, y: float) -> int:
    var segments := 0
    for i in range(1, coordinates.size()):
        var a := _to_local(coordinates[i - 1])
        var b := _to_local(coordinates[i])
        var dir := b - a
        if dir.length() < 0.00005 or dir.length() > 170.0:
            continue
        if absf(a.x) > 280.0 or absf(a.y) > 280.0 or absf(b.x) > 280.0 or absf(b.y) > 280.0:
            continue
        var normal := Vector2(-dir.y, dir.x).normalized() * width * 0.5
        var p0 := a + normal
        var p1 := a - normal
        var p2 := b + normal
        var p3 := b - normal
        # Mesh culling is disabled. The three vertices always make a real quad,
        # not a screen-space raster line.
        for p in [p0, p2, p1, p2, p3, p1]:
            tool.add_vertex(Vector3(p.x, y, p.y))
        segments += 1
    return segments

func _append_polygon(tool: SurfaceTool, coords: Array, y: float) -> int:
    if coords.size() < 4 or coords.size() > 420:
        return 0
    var points := PackedVector2Array()
    # Closed rings repeat their first point; remove duplicate final point.
    for i in range(coords.size() - 1):
        var xy := _to_local(coords[i])
        if absf(xy.x) > 280.0 or absf(xy.y) > 280.0:
            return 0
        points.append(xy)
    if points.size() < 3:
        return 0
    var indexes := Geometry2D.triangulate_polygon(points)
    if indexes.size() < 3:
        return 0
    for index in indexes:
        var v := points[index]
        tool.add_vertex(Vector3(v.x, y, v.y))
    return indexes.size() / 3

func _consume_json(raw: String) -> bool:
    var parser := JSON.new()
    if parser.parse(raw) != OK or not (parser.data is Dictionary):
        return false
    var data: Dictionary = parser.data
    if not (data.get("elements", null) is Array):
        return false
    var elements: Array = data["elements"]
    if elements.size() < 20 or elements.size() > MAX_ELEMENTS:
        return false
    # Parse into geometry only after validating the bounded response.
    var total_points := 0
    var counters := {}
    var tools := {}
    for kind in PALETTE.keys():
        var t := SurfaceTool.new()
        t.begin(Mesh.PRIMITIVE_TRIANGLES)
        tools[kind] = t
        counters[kind] = 0
    var names := {}
    var new_label_data: Array[Dictionary] = []
    for raw_item in elements:
        if not (raw_item is Dictionary):
            continue
        var item: Dictionary = raw_item
        var geom: Array = item.get("geometry", [])
        var tags: Dictionary = item.get("tags", {})
        if geom.size() < 2:
            continue
        total_points += geom.size()
        if total_points > MAX_GEOMETRY_POINTS:
            return false
        var kind := _category(tags, geom)
        if kind == "":
            continue
        var count := 0
        if kind in ["water", "park", "building"]:
            count = _append_polygon(tools[kind], geom, float(LAYER_Y[kind]))
        else:
            count = _append_line(tools[kind], geom, float(WIDTH[kind]), float(LAYER_Y[kind]))
        if count <= 0:
            continue
        counters[kind] += count
        # Labels are always screen-aligned, never burned into the tilted ground.
        if kind in ["main", "local"] and new_label_data.size() < 45:
            var name := str(tags.get("name", "")).strip_edges()
            if not name.is_empty() and not names.has(name):
                names[name] = true
                var middle: Dictionary = geom[geom.size() / 2]
                new_label_data.append({"name": name, "lat": float(middle["lat"]), "lon": float(middle["lon"])})
    if counters["main"] + counters["local"] + counters["foot"] < 20:
        return false
    if _vector_layer == null:
        return false
    for child in _vector_layer.get_children():
        child.queue_free()
    for kind in PALETTE.keys():
        _make_surface(kind, tools[kind], counters[kind] > 0)
    _street_labels = new_label_data
    _create_screen_labels()
    _elements_loaded = elements.size()
    _features_loaded = 0
    for n in counters.values():
        _features_loaded += int(n)
    _data_ready = true
    _sync_geometry(0.0)
    return true

func _create_screen_labels() -> void:
    if _labels_layer == null:
        return
    for old in _labels_layer.get_children():
        old.queue_free()
    for entry in _street_labels:
        var label := Label.new()
        label.text = str(entry["name"])
        label.add_theme_font_size_override("font_size", 13)
        label.add_theme_color_override("font_color", Color("b2ceca"))
        label.add_theme_color_override("font_outline_color", Color("06121b"))
        label.add_theme_constant_override("outline_size", 3)
        label.mouse_filter = Control.MOUSE_FILTER_IGNORE
        _labels_layer.add_child(label)
        entry["label"] = label

func _update_screen_labels() -> void:
    if _camera == null or _labels_layer == null:
        return
    var shown: Array[Vector2] = []
    var count := 0
    for entry in _street_labels:
        var label: Label = entry.get("label")
        if label == null:
            continue
        var geo_position := _geo_world(float(entry["lat"]), float(entry["lon"]))
        var screen := screen_from_geo(float(entry["lat"]), float(entry["lon"]))
        var valid := zoom >= 13 and not _camera.is_position_behind(geo_position)
        valid = valid and screen.x > 15 and screen.y > 10 and screen.x < size.x - 110 and screen.y < size.y - 25
        for previous in shown:
            if valid and previous.distance_to(screen) < 105.0:
                valid = false
                break
        valid = valid and count < 14
        label.visible = valid
        if valid:
            label.position = screen + Vector2(7, -7)
            shown.append(screen)
            count += 1

func _sync_geometry(delta: float) -> void:
    if _camera == null:
        return
    # Reposition game-owned 3D elements from actual latitude/longitude.
    for info in _markers:
        var anchor: Node3D = info["anchor"]
        var data: Dictionary = info["data"]
        anchor.position = _geo_world(float(data["lat"]), float(data["lon"]))
        var animated: Variant = info["core"]
        if animated is MeshInstance3D:
            animated.position.y = float(info["base_height"]) + 0.055 * sin(_anim_elapsed * 1.8 + float(data["lat"]) * 17.0)
    if _vector_layer != null:
        var center := GEO.project(PILOT_ORIGIN.x, PILOT_ORIGIN.y, zoom)
        var world_span := GEO.world_pixels(zoom)
        var dx := fposmod(center.x - _center_world.x + world_span * 0.5, world_span) - world_span * 0.5
        var factor := pow(2.0, float(zoom - PILOT_ZOOM))
        _vector_layer.scale = Vector3(factor, 1.0, factor)
        _vector_layer.position = Vector3(dx / PIXELS_PER_UNIT, 0, (center.y - _center_world.y) / PIXELS_PER_UNIT)
    _label_elapsed += delta
    if _label_elapsed >= 0.15 or delta == 0.0:
        _label_elapsed = 0.0
        _update_screen_labels()
