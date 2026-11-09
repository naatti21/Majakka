class_name MajakkaWorldMapCanvas
extends Control
## Majakka stylized dark map v0.4: real OSM tile geography, custom palette and Beacon layer. No SDK or backend.
## Only current viewport is fetched on user interaction; no prefetch or bulk downloads.
## Do NOT use OSMF public tiles for scaled production without a suitable provider.

signal object_selected(data: Dictionary)
signal map_status(message: String)

const GEO = preload("res://scripts/world_catalog.gd")
const MAP_STYLE = preload("res://scripts/map_style.gd")
const FLINTAIL = preload("res://assets/kaiku/flintail/base/map-idle.webp")
const MAP_TILE_PX := 256.0
const CACHE_DIR := "user://majakka_map_cache"
const CACHE_TTL_SECS := 7 * 24 * 3600
const MAX_MEMORY_TILES := 28
const MAX_DISK_TILES := 160
const MAX_CONCURRENT := 2
const UA := "MajakkaKaikuLab/0.4 (+https://github.com/naatti21/Majakka)"

var zoom := 13
var center_lat := 61.5018
var center_lon := 23.7620
var _center_world := Vector2.ZERO
var _textures: Dictionary = {}
var _memory_order: Array[String] = []
var _pending: Array[Dictionary] = []
var _inflight: Dictionary = {}
var _needed: Dictionary = {}
var _dragging := false
var _drag_origin := Vector2.ZERO
var _last_pointer := Vector2.ZERO
var _drag_distance := 0.0
var _anim_elapsed := 0.0
var _redraw_elapsed := 0.0
var _offline := false
var _completed_downloads := 0
var _loaded_count := 0
var _default_provider := "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
var _tile_template := ""

func _ready() -> void:
    mouse_filter = Control.MOUSE_FILTER_STOP
    clip_contents = true
    _center_world = GEO.project(center_lat, center_lon, zoom)
    _tile_template = str(ProjectSettings.get_setting("majakka/map/tile_url", _default_provider))
    _offline = DisplayServer.get_name() == "headless"
    DirAccess.make_dir_recursive_absolute(ProjectSettings.globalize_path(CACHE_DIR))
    resized.connect(_visible_tiles)
    _visible_tiles()

func center_on(lat: float, lon: float) -> void:
    center_lat = clampf(lat, -GEO.MAX_LAT, GEO.MAX_LAT)
    center_lon = clampf(lon, -180.0, 180.0)
    _center_world = GEO.project(center_lat, center_lon, zoom)
    _visible_tiles()
    queue_redraw()

func zoom_by(change: int) -> void:
    var next_zoom: int = clampi(zoom + change, GEO.MIN_ZOOM, GEO.MAX_ZOOM)
    if next_zoom == zoom:
        return
    var current_geo: Vector2 = GEO.unproject(_center_world, zoom)
    zoom = next_zoom
    _center_world = GEO.project(current_geo.x, current_geo.y, zoom)
    _visible_tiles()
    queue_redraw()

func screen_from_geo(lat: float, lon: float) -> Vector2:
    var geo_world: Vector2 = GEO.project(lat, lon, zoom)
    var span: float = GEO.world_pixels(zoom)
    var delta_x: float = fposmod(geo_world.x - _center_world.x + span * 0.5, span) - span * 0.5
    return Vector2(delta_x + size.x * 0.5, geo_world.y - _center_world.y + size.y * 0.5)

func _process(delta: float) -> void:
    _anim_elapsed += minf(delta, 0.1)
    _redraw_elapsed += delta
    if _redraw_elapsed >= 0.10 and visible:
        _redraw_elapsed = 0.0
        queue_redraw()

func _gui_input(event: InputEvent) -> void:
    if event is InputEventMouseButton:
        var mouse := event as InputEventMouseButton
        if mouse.button_index == MOUSE_BUTTON_WHEEL_UP and mouse.pressed:
            zoom_by(1)
            accept_event()
            return
        if mouse.button_index == MOUSE_BUTTON_WHEEL_DOWN and mouse.pressed:
            zoom_by(-1)
            accept_event()
            return
        if mouse.button_index == MOUSE_BUTTON_LEFT:
            if mouse.pressed:
                _dragging = true
                _drag_origin = mouse.position
                _last_pointer = mouse.position
                _drag_distance = 0.0
            else:
                if _dragging:
                    _dragging = false
                    if _drag_distance < 14.0:
                        _select_at(mouse.position)
                    else:
                        _visible_tiles()
                _drag_distance = 0.0
            accept_event()
    elif event is InputEventMouseMotion and _dragging:
        var motion := event as InputEventMouseMotion
        var movement: Vector2 = motion.position - _last_pointer
        _last_pointer = motion.position
        _drag_distance += movement.length()
        var world_span: float = GEO.world_pixels(zoom)
        _center_world -= movement
        _center_world.x = fposmod(_center_world.x, world_span)
        _center_world.y = clampf(_center_world.y, 0.0, world_span)
        var current: Vector2 = GEO.unproject(_center_world, zoom)
        center_lat = current.x
        center_lon = current.y
        queue_redraw()
        accept_event()

func _select_at(local: Vector2) -> void:
    var nearest: Dictionary = {}
    var best_dist := 46.0
    var all_markers: Array[Dictionary] = GEO.preview_encounters() + GEO.pilot_nodes() + [GEO.preview_home()]
    for marker in all_markers:
        var marker_position: Vector2 = screen_from_geo(float(marker["lat"]), float(marker["lon"]))
        var dist := marker_position.distance_to(local)
        if dist < best_dist:
            best_dist = dist
            nearest = marker
    if not nearest.is_empty():
        object_selected.emit(nearest.duplicate(true))

func _visible_tiles() -> void:
    if size.x < 16.0 or size.y < 16.0:
        return
    _needed.clear()
    _pending.clear()
    var p0: Vector2 = _center_world - size * 0.5
    var p1: Vector2 = _center_world + size * 0.5
    var left: int = int(floor(p0.x / MAP_TILE_PX))
    var right: int = int(floor(p1.x / MAP_TILE_PX))
    var top: int = int(floor(p0.y / MAP_TILE_PX))
    var bottom: int = int(floor(p1.y / MAP_TILE_PX))
    var span: int = 1 << zoom
    for tx in range(left, right + 1):
        for ty in range(top, bottom + 1):
            if ty < 0 or ty >= span:
                continue
            var normalized_x: int = posmod(tx, span)
            var key := _key(normalized_x, ty)
            _needed[key] = true
            if _textures.has(key) or _inflight.has(key):
                continue
            if _load_cache(key):
                continue
            if not _offline:
                _pending.append({"key": key, "z": zoom, "x": normalized_x, "y": ty})
    _dispatch()
    queue_redraw()

func _key(x: int, y: int) -> String:
    return "%d_%d_%d" % [zoom, x, y]

func _cache_path(key: String) -> String:
    return "%s/%s.png" % [CACHE_DIR, key]

func _load_cache(key: String) -> bool:
    var path := _cache_path(key)
    if not FileAccess.file_exists(path):
        return false
    var age: int = int(Time.get_unix_time_from_system()) - int(FileAccess.get_modified_time(path))
    if age > CACHE_TTL_SECS:
        return false
    var bytes: PackedByteArray = FileAccess.get_file_as_bytes(path)
    return _decode_and_store(key, bytes)

func _decode_and_store(key: String, bytes: PackedByteArray) -> bool:
    if bytes.is_empty() or bytes.size() > 750000:
        return false
    var img := Image.new()
    if img.load_png_from_buffer(bytes) != OK:
        return false
    if img.get_width() != 256 or img.get_height() != 256:
        return false
    _textures[key] = ImageTexture.create_from_image(MAP_STYLE.stylize(img))
    _memory_order.erase(key)
    _memory_order.append(key)
    # 3D perspective may need more than 28 tiles at once. Evicting a tile
    # still inside the viewport causes repeated cache reloads and missing patches.
    # Retain the current visible set; old regions are evicted on next movement.
    var required_capacity: int = maxi(MAX_MEMORY_TILES, _needed.size() + 8)
    var protected_checks := 0
    while _memory_order.size() > required_capacity:
        var oldest: String = _memory_order.pop_front()
        if _needed.has(oldest):
            _memory_order.append(oldest)
            protected_checks += 1
            if protected_checks >= _memory_order.size():
                break
        else:
            _textures.erase(oldest)
            protected_checks = 0
    _loaded_count += 1
    queue_redraw()
    return true

func _dispatch() -> void:
    if _offline:
        map_status.emit("MAP: offline preview / cached tiles only")
        return
    while _inflight.size() < MAX_CONCURRENT and not _pending.is_empty():
        var job: Dictionary = _pending.pop_front()
        var key: String = job["key"]
        if not _needed.has(key) or _textures.has(key):
            continue
        var request := HTTPRequest.new()
        request.timeout = 9.0
        add_child(request)
        _inflight[key] = request
        var url: String = _tile_template.replace("{z}", str(job["z"]))
        url = url.replace("{x}", str(job["x"]))
        url = url.replace("{y}", str(job["y"]))
        request.request_completed.connect(func(result: int, code: int, _headers: PackedStringArray, body: PackedByteArray) -> void:
            _tile_completed(key, request, result, code, body))
        var err: Error = request.request(url, PackedStringArray(["User-Agent: " + UA, "Accept: image/png"]))
        if err != OK:
            _inflight.erase(key)
            request.queue_free()
    map_status.emit("WORLD MAP · %d resident tiles · %d fetching" % [_textures.size(), _inflight.size()])

func _tile_completed(key: String, request: HTTPRequest, result: int, code: int, body: PackedByteArray) -> void:
    _inflight.erase(key)
    request.queue_free()
    if result == HTTPRequest.RESULT_SUCCESS and code == 200 and _decode_and_store(key, body):
        var file := FileAccess.open(_cache_path(key), FileAccess.WRITE)
        if file != null:
            file.store_buffer(body)
            file.close()
            _completed_downloads += 1
            if _completed_downloads % 24 == 0:
                _trim_disk_cache()
    elif not _needed.is_empty():
        map_status.emit("Map tiles unavailable · check connection")
    _dispatch()

func _trim_disk_cache() -> void:
    var files: PackedStringArray = DirAccess.get_files_at(CACHE_DIR)
    if files.size() <= MAX_DISK_TILES:
        return
    var entries: Array[Dictionary] = []
    for name in files:
        if not name.ends_with(".png"):
            continue
        entries.append({"name": name, "modified": FileAccess.get_modified_time(CACHE_DIR + "/" + name)})
    entries.sort_custom(func(a: Dictionary, b: Dictionary) -> bool:
        return int(a["modified"]) < int(b["modified"]))
    for i in range(maxi(0, entries.size() - MAX_DISK_TILES)):
        DirAccess.remove_absolute(ProjectSettings.globalize_path(CACHE_DIR + "/" + str(entries[i]["name"])))

func _draw() -> void:
    draw_rect(Rect2(Vector2.ZERO, size), Color("0a1821"))
    _draw_tiles()
    _draw_markers()
    # A persistent attribution is also presented by WorldMap UI above the bottom dock.

func _draw_tiles() -> void:
    var p0: Vector2 = _center_world - size * 0.5
    var p1: Vector2 = _center_world + size * 0.5
    var left: int = int(floor(p0.x / MAP_TILE_PX))
    var right: int = int(floor(p1.x / MAP_TILE_PX))
    var top: int = int(floor(p0.y / MAP_TILE_PX))
    var bottom: int = int(floor(p1.y / MAP_TILE_PX))
    var span: int = 1 << zoom
    for tx in range(left, right + 1):
        for ty in range(top, bottom + 1):
            if ty < 0 or ty >= span:
                continue
            var key := _key(posmod(tx, span), ty)
            var tile_rect := Rect2(Vector2(tx * MAP_TILE_PX, ty * MAP_TILE_PX) - p0, Vector2(256,256))
            if _textures.has(key):
                draw_texture_rect(_textures[key], tile_rect, false, Color.WHITE)
            else:
                draw_rect(tile_rect, Color("081620"))
                draw_rect(tile_rect, Color("15303d"), false, 1.0)
    draw_rect(Rect2(Vector2.ZERO, size), Color(0.01, 0.025, 0.05, 0.14))
    # Screen-local vignette accents, not fabricated geography.
    draw_line(Vector2(0, 0), Vector2(size.x, 0), Color("345761"), 1.0)

func _draw_markers() -> void:
    # Layers are kept separate from map geography and do not change Node IDs.
    for node in GEO.pilot_nodes():
        var pos: Vector2 = screen_from_geo(float(node["lat"]), float(node["lon"]))
        if not Rect2(Vector2(-100,-110), size + Vector2(200,220)).has_point(pos):
            continue
        _draw_beacon(pos, node)
    for encounter in GEO.preview_encounters():
        var pos: Vector2 = screen_from_geo(float(encounter["lat"]), float(encounter["lon"]))
        if Rect2(Vector2(-90,-90),size + Vector2(180,180)).has_point(pos):
            _draw_wild_kaiku(pos)
    var home: Dictionary = GEO.preview_home()
    var spot: Vector2 = screen_from_geo(float(home["lat"]), float(home["lon"]))
    if Rect2(Vector2(-80,-80),size + Vector2(160,160)).has_point(spot):
        _draw_home_marker(spot)

func _draw_beacon(pos: Vector2, node: Dictionary) -> void:
    var state: String = str(node["preview_state"])
    var tint := Color("72f2dd") if state == "Awakened" else Color("c6a876")
    if state == "Interference":
        tint = Color("cf86f3")
    var time_shift := sin(_anim_elapsed * 1.75 + pos.x * 0.009)
    var pulse := 0.84 + 0.12 * time_shift
    # Elevated floor with sidewall: a lightweight isometric impression.
    draw_ellipse(pos + Vector2(0, 22), 39.0, 12.0, Color(0, 0, 0, 0.30))
    draw_colored_polygon(PackedVector2Array([
        pos + Vector2(-24,13), pos + Vector2(0,24),
        pos + Vector2(24,13), pos + Vector2(24,24),
        pos + Vector2(0,34), pos + Vector2(-24,24)]), Color("071b24"))
    draw_colored_polygon(PackedVector2Array([
        pos + Vector2(-24,13), pos + Vector2(0,2),
        pos + Vector2(24,13), pos + Vector2(0,24)]), Color("1e3e48"))
    draw_arc(pos + Vector2(0,15), 28, 0.0, TAU, 36, Color(tint.r,tint.g,tint.b,0.18 * pulse), 8.0, true)
    draw_arc(pos + Vector2(0,15), 28, -0.2, 3.7, 28, Color(tint.r,tint.g,tint.b,0.66), 1.8, true)
    # Prism with three planar faces. Animation changes only height and glow.
    var float_y := time_shift * 2.0
    var apex := pos + Vector2(0, -28 + float_y)
    var left := pos + Vector2(-11, -2 + float_y)
    var right := pos + Vector2(11, -2 + float_y)
    var lower := pos + Vector2(0, 13 + float_y)
    draw_colored_polygon(PackedVector2Array([apex,left,lower,pos + Vector2(-2,-1+float_y)]), tint.darkened(0.48))
    draw_colored_polygon(PackedVector2Array([apex,pos + Vector2(-2,-1+float_y),lower,right]), tint.darkened(0.15))
    draw_colored_polygon(PackedVector2Array([apex,right,pos + Vector2(1,-2+float_y)]), tint.lightened(0.23))
    draw_line(apex, pos + Vector2(0,13+float_y), Color(0.83,0.99,0.97,0.48), 1.2, true)
    if state == "Awakened":
        draw_line(pos + Vector2(-3,-30),pos + Vector2(-3,-63),Color(tint.r,tint.g,tint.b,0.24 * pulse),6.0,true)
        draw_line(pos + Vector2(-3,-30),pos + Vector2(-3,-63),Color(tint.r,tint.g,tint.b,0.33 * pulse),1.5,true)
    if zoom >= 13:
        var label_text: String = str(node["name"])
        draw_string_outline(ThemeDB.fallback_font,pos + Vector2(23,-1),label_text,HORIZONTAL_ALIGNMENT_LEFT,-1,13,3,Color("04101b"))
        draw_string(ThemeDB.fallback_font,pos + Vector2(23,-1),label_text,HORIZONTAL_ALIGNMENT_LEFT,-1,13,Color("cde8dd"))

func _draw_wild_kaiku(pos: Vector2) -> void:
    var bob := sin(_anim_elapsed * 2.0 + pos.x * 0.023) * 2.5
    var width := 89.0 if zoom >= 13 else 61.0
    draw_ellipse(pos + Vector2(0,18), 28, 9, Color(0,0,0,0.34))
    draw_arc(pos + Vector2(0,12),27,0,TAU,32,Color(0.18,0.83,0.75,0.48),2.0,true)
    draw_texture_rect(FLINTAIL,Rect2(pos + Vector2(-width*0.5,-width*0.82+bob),Vector2(width,width*0.86)),false)
    if zoom >= 13:
        draw_string_outline(ThemeDB.fallback_font,pos+Vector2(-33,37),"WILD · DEMO",HORIZONTAL_ALIGNMENT_LEFT,-1,12,2,Color("06121b"))
        draw_string(ThemeDB.fallback_font,pos+Vector2(-33,37),"WILD · DEMO",HORIZONTAL_ALIGNMENT_LEFT,-1,12,Color("a0e4d6"))

func _draw_home_marker(pos: Vector2) -> void:
    var bob := sin(_anim_elapsed*1.8)*2.0
    draw_ellipse(pos+Vector2(0,22),31.0,11.0,Color(0,0,0,0.40))
    draw_arc(pos+Vector2(0,15),26,0,TAU,32,Color(0.28,0.68,1.0,0.54),2.0,true)
    # Tiny avatar projection + facing arrow; orientation is DEMO, not compass.
    draw_circle(pos+Vector2(0,-10+bob),7.2,Color("9bd9f5"))
    draw_colored_polygon(PackedVector2Array([
        pos+Vector2(-12,-2+bob),pos+Vector2(12,-2+bob),
        pos+Vector2(9,12+bob),pos+Vector2(-9,12+bob)]),Color("28658b"))
    draw_colored_polygon(PackedVector2Array([
        pos+Vector2(0,-30+bob),pos+Vector2(8,-20+bob),
        pos+Vector2(-8,-20+bob)]),Color("6bd3f6"))
    draw_string_outline(ThemeDB.fallback_font,pos+Vector2(24,3),"HOME · DEMO",HORIZONTAL_ALIGNMENT_LEFT,-1,13,3,Color("07121b"))
    draw_string(ThemeDB.fallback_font,pos+Vector2(24,3),"HOME · DEMO",HORIZONTAL_ALIGNMENT_LEFT,-1,13,Color("b7e8f7"))
