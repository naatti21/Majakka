extends "res://scripts/world_map_canvas.gd"
## Majakka v0.5: a genuine 3D perspective viewport and scene, on top of
## v0.4's sourced coordinates and small-pilot OSM PNG cache.
## Ground is a flat *georeferenced* plane, NOT measured terrain or building data.
## World effects, Wild Kaiku and Node states remain labeled DEMO.

const PIXELS_PER_UNIT := 17.0
const TILE_SPAN := 256.0 / PIXELS_PER_UNIT
const MAX_VIEW_DISTANCE := 82.0
const CAMERA_ELEVATIONS := [42.0, 53.0, 64.0]
const MIN_ELEVATION := 24.0
const MAX_ELEVATION := 84.0
const MIN_CAMERA_DISTANCE := 18.0
const MAX_CAMERA_DISTANCE := 80.0

var _viewport_container: SubViewportContainer
var _render_viewport: SubViewport
var _camera: Camera3D
var _scene: Node3D
var _tile_layer: Node3D
var _marker_layer: Node3D
var _tile_meshes: Dictionary = {}
var _markers: Array[Dictionary] = []
var _tilt_index := 0
var _elevation := 42.0
var _azimuth := 0.0
var _camera_distance := 39.0
var _next_sync := 0.0
var _tile_refresh_elapsed := 0.0
var _tiles_dirty := false
var _touch_points: Dictionary = {}
var _touch_origin := Vector2.ZERO
var _touch_travel := 0.0
var _touch_had_multitouch := false
var _gesture_center := Vector2.ZERO
var _gesture_span := 0.0
var _gesture_angle := 0.0
var _mouse_pan := false
var _mouse_orbit := false
var _mouse_last := Vector2.ZERO
var _mouse_travel := 0.0

func _ready() -> void:
    _build_perspective_world()
    super._ready()
    var home: Dictionary = GEO.preview_home()
    center_on(float(home["lat"]), float(home["lon"]))
    _sync_geometry(0.0)

func _build_perspective_world() -> void:
    _viewport_container = SubViewportContainer.new()
    _viewport_container.name = "PerspectiveViewport"
    _viewport_container.stretch = true
    _viewport_container.mouse_filter = Control.MOUSE_FILTER_IGNORE
    _viewport_container.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
    add_child(_viewport_container)

    _render_viewport = SubViewport.new()
    _render_viewport.name = "World3DViewport"
    _render_viewport.size = Vector2i(720, 800) # resized to the actual map area below
    _render_viewport.render_target_update_mode = SubViewport.UPDATE_ALWAYS
    _render_viewport.transparent_bg = false
    _viewport_container.add_child(_render_viewport)

    _scene = Node3D.new()
    _scene.name = "World3D"
    _render_viewport.add_child(_scene)
    resized.connect(_match_viewport_size)
    call_deferred("_match_viewport_size")

    var environment_node := WorldEnvironment.new()
    var env := Environment.new()
    env.background_mode = Environment.BG_COLOR
    env.background_color = Color("06121e")
    env.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
    env.ambient_light_color = Color("7eafac")
    env.ambient_light_energy = 0.7
    environment_node.environment = env
    _scene.add_child(environment_node)

    var sun := DirectionalLight3D.new()
    sun.name = "WorldKeyLight"
    sun.light_color = Color("b1f0dd")
    sun.light_energy = 0.65
    sun.rotation_degrees = Vector3(-46.0, -30.0, 0.0)
    _scene.add_child(sun)

    _camera = Camera3D.new()
    _camera.name = "FollowPerspectiveCamera"
    _camera.current = true
    _camera.fov = 44.0
    _camera.near = 0.15
    _camera.far = 180.0
    _scene.add_child(_camera)
    _apply_tilt()

    _tile_layer = Node3D.new()
    _tile_layer.name = "GeoreferencedGround"
    _scene.add_child(_tile_layer)
    var base := MeshInstance3D.new()
    base.name = "DarkGroundFallback"
    var ground := PlaneMesh.new()
    ground.size = Vector2(250.0, 250.0)
    base.mesh = ground
    base.position.y = -0.35
    base.material_override = _material(Color("10232d"), false, true)
    _tile_layer.add_child(base)

    _marker_layer = Node3D.new()
    _marker_layer.name = "WorldMarkers"
    _scene.add_child(_marker_layer)
    _build_markers()

func _material(tint: Color, glowing: bool = false, unlit: bool = false) -> StandardMaterial3D:
    var mat := StandardMaterial3D.new()
    mat.albedo_color = tint
    mat.roughness = 0.48
    if glowing:
        mat.emission_enabled = true
        mat.emission = tint
        mat.emission_energy_multiplier = 1.2
    if unlit:
        mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
    return mat

func _part(parent: Node3D, mesh: Mesh, tint: Color, offset: Vector3, glow: bool = false) -> MeshInstance3D:
    var instance := MeshInstance3D.new()
    instance.mesh = mesh
    instance.position = offset
    instance.material_override = _material(tint, glow)
    parent.add_child(instance)
    return instance

func _build_markers() -> void:
    for node in GEO.pilot_nodes():
        var state: String = str(node["preview_state"])
        var tint := Color("67e9cf") if state == "Awakened" else Color("cda875")
        if state == "Interference":
            tint = Color("ae80f0")
        var anchor := Node3D.new()
        anchor.name = "NodeBeacon"
        _marker_layer.add_child(anchor)
        var plinth_mesh := CylinderMesh.new()
        plinth_mesh.top_radius = 1.05
        plinth_mesh.bottom_radius = 1.28
        plinth_mesh.height = 0.32
        plinth_mesh.radial_segments = 8
        _part(anchor, plinth_mesh, Color("173a42"), Vector3(0,0.18,0))
        var core_mesh := CylinderMesh.new()
        core_mesh.top_radius = 0.06
        core_mesh.bottom_radius = 0.42
        core_mesh.height = 2.2
        core_mesh.radial_segments = 5
        var core := _part(anchor, core_mesh, tint, Vector3(0,1.50,0), true)
        var shard_mesh := BoxMesh.new()
        shard_mesh.size = Vector3(0.28, 0.86, 0.27)
        for i in range(3):
            var angle := TAU * float(i) / 3.0
            var shard := _part(anchor, shard_mesh, tint.darkened(0.27), Vector3(cos(angle)*0.65,0.82,sin(angle)*0.65), true)
            shard.rotation.y = angle
            shard.rotation.z = 0.22
        var name_label := Label3D.new()
        name_label.text = str(node["name"])
        name_label.font_size = 21
        name_label.pixel_size = 0.009
        name_label.modulate = Color("d8f6ec")
        name_label.billboard = BaseMaterial3D.BILLBOARD_ENABLED
        name_label.position = Vector3(0,3.05,0)
        anchor.add_child(name_label)
        _markers.append({"data":node, "anchor":anchor, "core":core, "base_height":0.0})

    var kaiku_texture: Texture2D = FLINTAIL
    for encounter in GEO.preview_encounters():
        var anchor := Node3D.new()
        anchor.name = "WildKaikuDemo"
        _marker_layer.add_child(anchor)
        var sprite := PlaneMesh.new()
        sprite.orientation = PlaneMesh.FACE_Z
        sprite.size = Vector2(3.4, 2.25)
        var sprite_mesh := MeshInstance3D.new()
        sprite_mesh.mesh = sprite
        sprite_mesh.position.y = 1.30
        var sprite_mat := StandardMaterial3D.new()
        sprite_mat.albedo_texture = kaiku_texture
        sprite_mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
        sprite_mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
        sprite_mat.billboard_mode = BaseMaterial3D.BILLBOARD_ENABLED
        sprite_mat.cull_mode = BaseMaterial3D.CULL_DISABLED
        sprite_mesh.material_override = sprite_mat
        anchor.add_child(sprite_mesh)
        var foot := CylinderMesh.new()
        foot.top_radius = 0.95
        foot.bottom_radius = 0.95
        foot.height = 0.04
        foot.radial_segments = 20
        _part(anchor, foot, Color("278e86"), Vector3(0,0.03,0),true)
        _markers.append({"data":encounter,"anchor":anchor,"core":sprite_mesh,"base_height":1.30})

    var home: Dictionary = GEO.preview_home()
    var avatar := Node3D.new()
    avatar.name = "PlayerHomeDemo"
    _marker_layer.add_child(avatar)
    var ring_mesh := CylinderMesh.new()
    ring_mesh.top_radius = 1.30
    ring_mesh.bottom_radius = 1.30
    ring_mesh.height = 0.05
    ring_mesh.radial_segments = 20
    _part(avatar, ring_mesh, Color("4ab4dc"), Vector3(0,0.04,0),true)
    var body_mesh := CylinderMesh.new()
    body_mesh.top_radius = 0.20
    body_mesh.bottom_radius = 0.52
    body_mesh.height = 1.5
    body_mesh.radial_segments = 5
    _part(avatar, body_mesh, Color("9becde"), Vector3(0,0.85,0),true)
    var head_mesh := SphereMesh.new()
    head_mesh.radius = 0.28
    head_mesh.height = 0.56
    _part(avatar,head_mesh,Color("d4f3dd"),Vector3(0,1.87,0),true)
    var home_label := Label3D.new()
    home_label.text = "HOME · DEMO"
    home_label.font_size = 24
    home_label.pixel_size = 0.009
    home_label.position = Vector3(0,2.80,0)
    home_label.modulate = Color("a9e2f8")
    home_label.billboard = BaseMaterial3D.BILLBOARD_ENABLED
    avatar.add_child(home_label)
    _markers.append({"data":home,"anchor":avatar,"core":null,"base_height":0.0})

func _match_viewport_size() -> void:
    if _render_viewport == null or size.x <= 0.0 or size.y <= 0.0:
        return
    # Avoid stretching a fixed 720x800 rendering into an arbitrarily tall map.
    # Cap the longest side to protect mobile GPU memory.
    var factor := minf(1.0, 1536.0 / maxf(size.x, size.y))
    var target := Vector2i(maxi(1, roundi(size.x * factor)), maxi(1, roundi(size.y * factor)))
    if _render_viewport.size != target:
        _render_viewport.size = target
        _tiles_dirty = true

func _viewport_point(local: Vector2) -> Vector2:
    if _render_viewport == null or size.x < 1.0 or size.y < 1.0:
        return local
    return local * Vector2(_render_viewport.size) / size

func _local_point(viewport_point: Vector2) -> Vector2:
    if _render_viewport == null or _render_viewport.size.x < 1 or _render_viewport.size.y < 1:
        return viewport_point
    return viewport_point * size / Vector2(_render_viewport.size)

func _apply_tilt() -> void:
    if _camera == null:
        return
    var angle := deg_to_rad(_elevation)
    _camera.position = Vector3(
        sin(_azimuth) * _camera_distance * cos(angle),
        _camera_distance * sin(angle),
        cos(_azimuth) * _camera_distance * cos(angle)
    )
    _camera.look_at(Vector3.ZERO, Vector3.UP)

func cycle_tilt() -> void:
    # Accessible one-button fallback; two-finger drag gives continuous tilt.
    _tilt_index = (_tilt_index + 1) % CAMERA_ELEVATIONS.size()
    _elevation = CAMERA_ELEVATIONS[_tilt_index]
    _apply_tilt()
    _visible_tiles()
    _sync_geometry(0.0)

func reset_view() -> void:
    _tilt_index = 0
    _elevation = CAMERA_ELEVATIONS[0]
    _azimuth = 0.0
    _camera_distance = 39.0
    _apply_tilt()
    _visible_tiles()
    _sync_geometry(0.0)

func _ray_hit_ground(local: Vector2) -> Vector3:
    if _camera == null:
        return Vector3(INF, INF, INF)
    var screen_pos := _viewport_point(local)
    var ray_origin := _camera.project_ray_origin(screen_pos)
    var ray_direction := _camera.project_ray_normal(screen_pos)
    if ray_direction.y >= -0.001:
        return Vector3(INF, INF, INF)
    var distance := -ray_origin.y / ray_direction.y
    if distance < 0.0 or not is_finite(distance):
        return Vector3(INF, INF, INF)
    return ray_origin + ray_direction * distance

func _pan_ground(previous: Vector2, current: Vector2) -> void:
    var a := _ray_hit_ground(previous)
    var b := _ray_hit_ground(current)
    if not is_finite(a.x) or not is_finite(b.x):
        return
    var delta := Vector2(a.x - b.x, a.z - b.z) * PIXELS_PER_UNIT
    var span := GEO.world_pixels(zoom)
    _center_world += delta
    _center_world.x = fposmod(_center_world.x, span)
    _center_world.y = clampf(_center_world.y, 0.0, span)
    var coords: Vector2 = GEO.unproject(_center_world, zoom)
    center_lat = coords.x
    center_lon = coords.y
    _tiles_dirty = true
    _sync_geometry(0.0)

func _pinch_zoom(factor: float) -> void:
    if not is_finite(factor) or factor <= 0.01:
        return
    _camera_distance = clampf(_camera_distance / factor, MIN_CAMERA_DISTANCE, MAX_CAMERA_DISTANCE)
    # Match raster LOD to optical zoom. Doubling tile zoom and camera distance
    # maintains the approximate screen scale without snapping the world.
    if _camera_distance < 24.0 and zoom < GEO.MAX_ZOOM:
        _camera_distance *= 2.0
        zoom_by(1)
    elif _camera_distance > 65.0 and zoom > GEO.MIN_ZOOM:
        _camera_distance *= 0.5
        zoom_by(-1)
    _apply_tilt()
    _tiles_dirty = true

func _set_gesture_reference() -> void:
    if _touch_points.size() < 2:
        return
    var values := _touch_points.values()
    var a: Vector2 = values[0]
    var b: Vector2 = values[1]
    _gesture_center = (a + b) * 0.5
    _gesture_span = maxf(1.0, a.distance_to(b))
    _gesture_angle = (b - a).angle()

func _move_two_fingers() -> void:
    if _touch_points.size() < 2:
        return
    var values := _touch_points.values()
    var a: Vector2 = values[0]
    var b: Vector2 = values[1]
    var midpoint := (a + b) * 0.5
    var separation := maxf(1.0, a.distance_to(b))
    var angle := (b - a).angle()
    # Two fingers: pinch = zoom, twist = orbit, vertical drag = continuous pitch.
    _pinch_zoom(separation / maxf(1.0, _gesture_span))
    _azimuth = wrapf(_azimuth - wrapf(angle - _gesture_angle, -PI, PI), -PI, PI)
    _elevation = clampf(_elevation + (midpoint.y - _gesture_center.y) * 0.11, MIN_ELEVATION, MAX_ELEVATION)
    _apply_tilt()
    # Horizontal centroid motion pans; vertical motion tilts rather than panning.
    _pan_ground(_gesture_center, Vector2(midpoint.x, _gesture_center.y))
    _gesture_center = midpoint
    _gesture_span = separation
    _gesture_angle = angle
    _tiles_dirty = true

func _geo_world(lat: float, lon: float) -> Vector3:
    var point: Vector2 = GEO.project(lat, lon, zoom)
    var span: float = GEO.world_pixels(zoom)
    var dx: float = fposmod(point.x - _center_world.x + span * 0.5, span) - span * 0.5
    return Vector3(dx/PIXELS_PER_UNIT, 0.0, (point.y-_center_world.y)/PIXELS_PER_UNIT)

func screen_from_geo(lat: float, lon: float) -> Vector2:
    if _camera == null:
        return super.screen_from_geo(lat, lon)
    return _local_point(_camera.unproject_position(_geo_world(lat,lon) + Vector3(0.0,1.30,0.0)))

func _select_at(local: Vector2) -> void:
    var nearest: Dictionary = {}
    var best_dist := 58.0
    for marker in _markers:
        var anchor: Node3D = marker["anchor"]
        if _camera.is_position_behind(anchor.global_position + Vector3(0,1.0,0)):
            continue
        var screen_pos := _local_point(_camera.unproject_position(anchor.global_position + Vector3(0,1.0,0)))
        var distance: float = screen_pos.distance_to(local)
        if distance < best_dist:
            best_dist = distance
            nearest = marker["data"]
    if not nearest.is_empty():
        object_selected.emit(nearest.duplicate(true))

func _draw() -> void:
    # Actual map and Nodes are rendered by the child Camera3D/SubViewport.
    # No old flat 2D map overlay is drawn here.
    pass

func _gui_input(event: InputEvent) -> void:
    # Handle physical touch directly: do not let Android's synthesized mouse
    # events double-pan or accidentally select a Kaiku after a pinch.
    if event is InputEventScreenTouch:
        var touch := event as InputEventScreenTouch
        if touch.pressed:
            _touch_points[touch.index] = touch.position
            if _touch_points.size() == 1:
                _touch_origin = touch.position
                _touch_travel = 0.0
                _touch_had_multitouch = false
            else:
                _touch_had_multitouch = true
                _set_gesture_reference()
        else:
            var tapped := _touch_points.size() == 1 and not _touch_had_multitouch
            tapped = tapped and _touch_travel < 14.0 and _touch_origin.distance_to(touch.position) < 16.0
            _touch_points.erase(touch.index)
            if tapped:
                _select_at(touch.position)
            if _touch_points.size() == 1:
                _touch_had_multitouch = true
            elif _touch_points.size() >= 2:
                _set_gesture_reference()
            _tiles_dirty = true
        accept_event()
        return

    if event is InputEventScreenDrag:
        var drag := event as InputEventScreenDrag
        if not _touch_points.has(drag.index):
            return
        var previous: Vector2 = _touch_points[drag.index]
        _touch_points[drag.index] = drag.position
        if _touch_points.size() == 1:
            _touch_travel += previous.distance_to(drag.position)
            _pan_ground(previous, drag.position)
        else:
            _touch_had_multitouch = true
            _move_two_fingers()
        accept_event()
        return

    # Desktop debugging: left-drag pans, right-drag orbits/tilts, wheel zooms.
    if DisplayServer.is_touchscreen_available():
        return
    if event is InputEventMouseButton:
        var mouse := event as InputEventMouseButton
        if mouse.pressed and mouse.button_index == MOUSE_BUTTON_WHEEL_UP:
            zoom_by(1)
            return
        if mouse.pressed and mouse.button_index == MOUSE_BUTTON_WHEEL_DOWN:
            zoom_by(-1)
            return
        if mouse.button_index == MOUSE_BUTTON_LEFT:
            if mouse.pressed:
                _mouse_pan = true
                _mouse_last = mouse.position
                _mouse_travel = 0.0
            else:
                if _mouse_pan and _mouse_travel < 14.0:
                    _select_at(mouse.position)
                _mouse_pan = false
                _tiles_dirty = true
            accept_event()
        elif mouse.button_index == MOUSE_BUTTON_RIGHT:
            _mouse_orbit = mouse.pressed
            _mouse_last = mouse.position
            accept_event()
    elif event is InputEventMouseMotion:
        var move := event as InputEventMouseMotion
        var displacement: Vector2 = move.position - _mouse_last
        if _mouse_pan:
            _mouse_travel += displacement.length()
            _pan_ground(_mouse_last, move.position)
            accept_event()
        elif _mouse_orbit:
            _azimuth = wrapf(_azimuth - displacement.x * 0.005, -PI, PI)
            _elevation = clampf(_elevation + displacement.y * 0.13, MIN_ELEVATION, MAX_ELEVATION)
            _apply_tilt()
            _tiles_dirty = true
            accept_event()
        _mouse_last = move.position

func _visible_tiles() -> void:
    if size.x < 16.0 or size.y < 16.0 or _camera == null:
        return
    _needed.clear()
    _pending.clear()
    # Estimate ONLY the viewport's visible ground intersection. No tile prefetch.
    var bounds_min := Vector2(INF, INF)
    var bounds_max := Vector2(-INF, -INF)
    var points := [Vector2.ZERO, Vector2(size.x,0), Vector2(0,size.y), size*0.5, size, Vector2(size.x*0.5,0.0)]
    for screen_pos in points:
        var origin: Vector3 = _camera.project_ray_origin(_viewport_point(screen_pos))
        var direction: Vector3 = _camera.project_ray_normal(_viewport_point(screen_pos))
        if direction.y >= -0.01:
            continue
        var distance := -origin.y / direction.y
        var hit: Vector3 = origin + direction * minf(distance, MAX_VIEW_DISTANCE)
        hit.x = clampf(hit.x,-MAX_VIEW_DISTANCE,MAX_VIEW_DISTANCE)
        hit.z = clampf(hit.z,-MAX_VIEW_DISTANCE,MAX_VIEW_DISTANCE)
        bounds_min = bounds_min.min(Vector2(hit.x,hit.z))
        bounds_max = bounds_max.max(Vector2(hit.x,hit.z))
    if not is_finite(bounds_min.x):
        return
    var p0: Vector2 = _center_world + bounds_min * PIXELS_PER_UNIT
    var p1: Vector2 = _center_world + bounds_max * PIXELS_PER_UNIT
    var left := int(floor(p0.x/256.0))
    var right := int(floor(p1.x/256.0))
    var top := int(floor(p0.y/256.0))
    var bottom := int(floor(p1.y/256.0))
    var tile_span := 1 << zoom
    for tx in range(left,right+1):
        for ty in range(top,bottom+1):
            if ty < 0 or ty >= tile_span:
                continue
            var world_x := posmod(tx,tile_span)
            var key := _key(world_x,ty)
            _needed[key] = true
            if _textures.has(key) or _inflight.has(key):
                continue
            if _load_cache(key):
                continue
            if not _offline:
                _pending.append({"key":key,"z":zoom,"x":world_x,"y":ty})
    _dispatch()

func _process(delta: float) -> void:
    super._process(delta)
    if not visible:
        return
    _tile_refresh_elapsed += delta
    if _tiles_dirty and _tile_refresh_elapsed >= 0.10:
        _tiles_dirty = false
        _tile_refresh_elapsed = 0.0
        _visible_tiles()
    _next_sync += delta
    if _next_sync >= 0.10:
        _next_sync = 0.0
        _sync_geometry(delta)

func _sync_geometry(delta: float) -> void:
    if _camera == null or _tile_layer == null:
        return
    var needed_keys: Dictionary = {}
    for key in _needed:
        if not _textures.has(key):
            continue
        needed_keys[key] = true
        if not _tile_meshes.has(key):
            var plane := PlaneMesh.new()
            plane.size = Vector2(TILE_SPAN, TILE_SPAN)
            plane.subdivide_depth = 2
            plane.subdivide_width = 2
            var part := MeshInstance3D.new()
            part.mesh = plane
            part.name = "GroundTile"
            var surface := _material(Color.WHITE,false,true)
            surface.albedo_texture = _textures[key]
            surface.texture_filter = BaseMaterial3D.TEXTURE_FILTER_LINEAR_WITH_MIPMAPS_ANISOTROPIC
            surface.texture_repeat = BaseMaterial3D.TEXTURE_REPEAT_DISABLED
            part.material_override = surface
            _tile_layer.add_child(part)
            _tile_meshes[key] = part
        var xyz: Array = str(key).split("_")
        if xyz.size() != 3:
            continue
        var tx := int(xyz[1])
        var ty := int(xyz[2])
        var span: float = GEO.world_pixels(zoom)
        var px := fposmod(float(tx)*256.0+128.0-_center_world.x+span*0.5,span)-span*0.5
        var py := float(ty)*256.0+128.0-_center_world.y
        var tile: MeshInstance3D = _tile_meshes[key]
        tile.position = Vector3(px/PIXELS_PER_UNIT,-0.10,py/PIXELS_PER_UNIT)
    for old_key in _tile_meshes.keys():
        if not needed_keys.has(old_key):
            var old_tile: MeshInstance3D = _tile_meshes[old_key]
            old_tile.queue_free()
            _tile_meshes.erase(old_key)
    for info in _markers:
        var anchor: Node3D = info["anchor"]
        var data: Dictionary = info["data"]
        anchor.position = _geo_world(float(data["lat"]),float(data["lon"]))
        var part: Variant = info["core"]
        if part is MeshInstance3D:
            var core: MeshInstance3D = part
            core.position.y = float(info["base_height"]) + 0.055*sin(_anim_elapsed*1.8 + float(data["lat"])*17.0)
