extends "res://scripts/world_map_canvas.gd"
## Majakka v0.5: a genuine 3D perspective viewport and scene, on top of
## v0.4's sourced coordinates and small-pilot OSM PNG cache.
## Ground is a flat *georeferenced* plane, NOT measured terrain or building data.
## World effects, Wild Kaiku and Node states remain labeled DEMO.

const PIXELS_PER_UNIT := 17.0
const TILE_SPAN := 256.0 / PIXELS_PER_UNIT
const MAX_VIEW_DISTANCE := 82.0
const CAMERA_ELEVATIONS := [42.0, 53.0, 64.0]

var _viewport_container: SubViewportContainer
var _render_viewport: SubViewport
var _camera: Camera3D
var _scene: Node3D
var _tile_layer: Node3D
var _marker_layer: Node3D
var _tile_meshes: Dictionary = {}
var _markers: Array[Dictionary] = []
var _tilt_index := 0
var _next_sync := 0.0

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
    _render_viewport.size = Vector2i(720, 800)
    _render_viewport.render_target_update_mode = SubViewport.UPDATE_ALWAYS
    _render_viewport.transparent_bg = false
    _viewport_container.add_child(_render_viewport)

    _scene = Node3D.new()
    _scene.name = "World3D"
    _render_viewport.add_child(_scene)

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

func _apply_tilt() -> void:
    if _camera == null:
        return
    var angle: float = deg_to_rad(CAMERA_ELEVATIONS[_tilt_index])
    var distance := 39.0
    _camera.position = Vector3(0, distance * sin(angle), distance * cos(angle))
    _camera.look_at(Vector3.ZERO, Vector3.UP)

func cycle_tilt() -> void:
    _tilt_index = (_tilt_index + 1) % CAMERA_ELEVATIONS.size()
    _apply_tilt()
    _visible_tiles()
    _sync_geometry(0.0)

func _geo_world(lat: float, lon: float) -> Vector3:
    var point: Vector2 = GEO.project(lat, lon, zoom)
    var span: float = GEO.world_pixels(zoom)
    var dx: float = fposmod(point.x - _center_world.x + span * 0.5, span) - span * 0.5
    return Vector3(dx/PIXELS_PER_UNIT, 0.0, (point.y-_center_world.y)/PIXELS_PER_UNIT)

func screen_from_geo(lat: float, lon: float) -> Vector2:
    if _camera == null:
        return super.screen_from_geo(lat, lon)
    return _camera.unproject_position(_geo_world(lat,lon) + Vector3(0.0,1.30,0.0))

func _select_at(local: Vector2) -> void:
    var nearest: Dictionary = {}
    var best_dist := 58.0
    for marker in _markers:
        var anchor: Node3D = marker["anchor"]
        if _camera.is_position_behind(anchor.global_position + Vector3(0,1.0,0)):
            continue
        var screen_pos := _camera.unproject_position(anchor.global_position + Vector3(0,1.0,0))
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
    # Inherit v0.4's drag, tap, wheel and Android mouse emulation.
    super._gui_input(event)
    if event is InputEventMouseMotion or event is InputEventMouseButton:
        _sync_geometry(0.0)

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
        var origin: Vector3 = _camera.project_ray_origin(screen_pos)
        var direction: Vector3 = _camera.project_ray_normal(screen_pos)
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
