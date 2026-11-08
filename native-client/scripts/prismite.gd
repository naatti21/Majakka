extends Node3D
class_name PrismitePreview
## Prismite v0.1: a genuinely 3D, procedural Kaiku assembled entirely from local meshes.
## No external assets, download, login, runtime shaders or network calls.

var ink_mode: bool = false
var guardian_mode: bool = false
var low_detail: bool = false
var _time: float = 0.0
var _reaction: float = 0.0
var _core: MeshInstance3D
var _satellites: Array[Node3D] = []
var _ring: MeshInstance3D
var _sparks: Array[MeshInstance3D] = []
var _body_mat: StandardMaterial3D
var _accent_mat: StandardMaterial3D
var _dark_mat: StandardMaterial3D

func _ready() -> void:
    name = "Prismite"
    _body_mat = _material(Color("69dec1"), Color("2fffc9"), 0.55)
    _accent_mat = _material(Color("d9f5df"), Color("60ffe1"), 0.35)
    _dark_mat = _material(Color("203a4a"), Color("174757"), 0.2)

    _core = _shard("ResonanceCore", Vector3.ZERO, Vector3(0.8, 1.12, 0.75), _body_mat)
    var nucleus := _shard("Nucleus", Vector3(0, 0.04, 0.22), Vector3(0.35, 0.47, 0.27), _accent_mat)
    nucleus.rotation.z = 0.18

    # Different silhouettes at different angles; not a symmetrical crystal ball.
    _make_satellite(0, Vector3(1.12, 0.18, 0.0), Vector3(0.38, 0.72, 0.32), 0.38)
    _make_satellite(1, Vector3(-1.05, -0.08, 0.26), Vector3(0.48, 0.60, 0.36), -0.52)
    _make_satellite(2, Vector3(0.16, 0.92, -0.13), Vector3(0.22, 0.44, 0.23), 0.30)
    _make_satellite(3, Vector3(-0.10, -0.93, 0.08), Vector3(0.25, 0.37, 0.21), -0.21)

    _ring = MeshInstance3D.new()
    _ring.name = "ResonanceHalo"
    var torus := TorusMesh.new()
    torus.inner_radius = 1.18
    torus.outer_radius = 1.23
    torus.rings = 24
    torus.ring_segments = 5
    _ring.mesh = torus
    _ring.material_override = _accent_mat
    _ring.rotation.x = 0.68
    add_child(_ring)

    for i in range(12):
        var sparkle := _shard("Spark_%02d" % i, Vector3.ZERO, Vector3(0.06, 0.12, 0.07), _accent_mat)
        _sparks.append(sparkle)
    set_ink_mode(false)

func _material(base: Color, glow: Color, energy: float) -> StandardMaterial3D:
    var material := StandardMaterial3D.new()
    material.albedo_color = base
    material.metallic = 0.15
    material.roughness = 0.37
    material.emission_enabled = true
    material.emission = glow
    material.emission_energy_multiplier = energy
    material.cull_mode = BaseMaterial3D.CULL_DISABLED
    return material

func _make_satellite(index: int, at: Vector3, scale_value: Vector3, z_rot: float) -> void:
    var pivot := Node3D.new()
    pivot.name = "Satellite_%d" % index
    pivot.position = at
    add_child(pivot)
    var mesh := _shard("Shard", Vector3.ZERO, scale_value, _body_mat if index % 2 == 0 else _dark_mat)
    # Parent the mesh to a moving pivot without rebuilding geometry.
    mesh.reparent(pivot)
    mesh.rotation.z = z_rot
    _satellites.append(pivot)

func _shard(mesh_name: String, at: Vector3, dimensions: Vector3, material: Material) -> MeshInstance3D:
    var mesh_node := MeshInstance3D.new()
    mesh_node.name = mesh_name
    mesh_node.mesh = _octahedron()
    mesh_node.material_override = material
    mesh_node.position = at
    mesh_node.scale = dimensions
    add_child(mesh_node)
    return mesh_node

func _octahedron() -> ArrayMesh:
    # Eight triangles, planar faces, six vertices. The shape remains legible at 64px.
    var vertices := [
        Vector3(0, 0.5, 0), Vector3(0, -0.5, 0),
        Vector3(-0.5, 0, 0), Vector3(0.5, 0, 0),
        Vector3(0, 0, -0.5), Vector3(0, 0, 0.5)
    ]
    var triangles := [
        [0, 5, 3], [0, 3, 4], [0, 4, 2], [0, 2, 5],
        [1, 3, 5], [1, 4, 3], [1, 2, 4], [1, 5, 2]
    ]
    var tool := SurfaceTool.new()
    tool.begin(Mesh.PRIMITIVE_TRIANGLES)
    for triangle in triangles:
        for index in triangle:
            tool.add_vertex(vertices[index])
    tool.generate_normals()
    return tool.commit()

func _process(delta: float) -> void:
    _time += delta
    if _reaction > 0.0:
        _reaction = maxf(0.0, _reaction - delta)
    var pulse := sin(_time * 2.6)
    var reaction_boost := sin(_reaction * 14.0) * _reaction * 0.22
    position.y = (0.18 if guardian_mode else 0.65) + (0.03 if guardian_mode else 0.11) * sin(_time * 1.65) + reaction_boost
    _core.rotation.y = _time * (0.22 if guardian_mode else 0.34)
    _core.scale = Vector3(0.8, 1.12, 0.75) * (1.0 + 0.018 * pulse)
    for i in range(_satellites.size()):
        var satellite := _satellites[i]
        satellite.position.y += sin(_time * (1.3 + i * 0.16)) * delta * 0.04
        satellite.rotation.y = _time * (0.24 if i % 2 == 0 else -0.31)
    _ring.rotation.y += delta * (0.22 if guardian_mode else 0.45)
    _ring.visible = not low_detail
    for i in range(_sparks.size()):
        var angle := TAU * float(i) / float(_sparks.size()) + _time * 0.24
        _sparks[i].position = Vector3(cos(angle) * 1.72, sin(angle * 1.5) * 0.30, sin(angle) * 1.05)
        _sparks[i].visible = not low_detail and not guardian_mode

func set_ink_mode(enabled: bool) -> void:
    ink_mode = enabled
    if _body_mat == null:
        return
    if enabled:
        # Deliberately only an INK MATERIAL STUDY, not a fully custom toon shader.
        _body_mat.albedo_color = Color("e8dbc5")
        _body_mat.emission = Color("e8a87c")
        _body_mat.emission_energy_multiplier = 0.14
        _body_mat.metallic = 0.0
        _accent_mat.albedo_color = Color("e66d72")
        _accent_mat.emission = Color("ff6f79")
        _dark_mat.albedo_color = Color("201e31")
        _dark_mat.emission = Color("413247")
    else:
        _body_mat.albedo_color = Color("69dec1")
        _body_mat.emission = Color("2fffc9")
        _body_mat.emission_energy_multiplier = 0.55
        _body_mat.metallic = 0.15
        _accent_mat.albedo_color = Color("d9f5df")
        _accent_mat.emission = Color("60ffe1")
        _dark_mat.albedo_color = Color("203a4a")
        _dark_mat.emission = Color("174757")

func set_guardian_mode(enabled: bool) -> void:
    guardian_mode = enabled
    if _ring != null:
        _ring.scale = Vector3(1.13, 1.0, 1.13) if enabled else Vector3.ONE

func set_low_detail(enabled: bool) -> void:
    low_detail = enabled
    if _ring != null:
        _ring.visible = not enabled
    for sparkle in _sparks:
        sparkle.visible = not enabled

func react() -> void:
    _reaction = 1.0

func get_debug_state() -> Dictionary:
    return {"species": "prismite", "form": "ink_study" if ink_mode else "luminous", "guardian": guardian_mode, "low_detail": low_detail, "satellites": _satellites.size()}
