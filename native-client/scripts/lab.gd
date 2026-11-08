extends Node3D
## Native vertical-slice A: rendering/input/telemetry only. Absolutely no MMO backend.
const PRISMITE_SCRIPT = preload("res://scripts/prismite.gd")

var _creature: PrismitePreview
var _metrics: Label
var _status: Label
var _form_button: Button
var _guardian_button: Button
var _quality_button: Button
var _sample_ms: Array[float] = []
var _seconds: float = 0.0
var _ink: bool = false
var _guardian: bool = false
var _low: bool = false

func _ready() -> void:
    _setup_scene()
    _setup_ui()

func _setup_scene() -> void:
    var environment := WorldEnvironment.new()
    var world := Environment.new()
    world.background_mode = Environment.BG_COLOR
    world.background_color = Color("081520")
    world.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
    world.ambient_light_color = Color("abc5c7")
    world.ambient_light_energy = 0.48
    environment.environment = world
    add_child(environment)

    var camera := Camera3D.new()
    camera.name = "PreviewCamera"
    camera.position = Vector3(0, 1.15, 6.1)
    camera.fov = 48.0
    add_child(camera)
    camera.look_at(Vector3(0, 0.6, 0), Vector3.UP)
    camera.current = true

    var key_light := DirectionalLight3D.new()
    key_light.name = "KeyLight"
    key_light.rotation_degrees = Vector3(-38, -34, 0)
    key_light.light_energy = 1.05
    key_light.shadow_enabled = false # mobile performance baseline
    add_child(key_light)

    var platform := MeshInstance3D.new()
    platform.name = "DisplayPlinth"
    var plinth_mesh := CylinderMesh.new()
    plinth_mesh.top_radius = 2.02
    plinth_mesh.bottom_radius = 2.17
    plinth_mesh.height = 0.13
    plinth_mesh.radial_segments = 32
    platform.mesh = plinth_mesh
    var plinth_material := StandardMaterial3D.new()
    plinth_material.albedo_color = Color("182c39")
    plinth_material.metallic = 0.25
    plinth_material.roughness = 0.45
    platform.material_override = plinth_material
    platform.position = Vector3(0, -0.42, 0)
    add_child(platform)

    _creature = PRISMITE_SCRIPT.new()
    _creature.name = "Prismite"
    add_child(_creature)

func _setup_ui() -> void:
    var canvas := CanvasLayer.new()
    canvas.name = "HUD"
    add_child(canvas)
    var root := Control.new()
    root.name = "SafeFrame"
    root.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
    root.mouse_filter = Control.MOUSE_FILTER_IGNORE # allow 3D swipe outside buttons
    canvas.add_child(root)

    var top_margin := MarginContainer.new()
    top_margin.anchor_right = 1.0
    top_margin.offset_left = 24
    top_margin.offset_top = 34
    top_margin.offset_right = -24
    top_margin.offset_bottom = 260
    top_margin.mouse_filter = Control.MOUSE_FILTER_IGNORE
    root.add_child(top_margin)
    var top := VBoxContainer.new()
    top.add_theme_constant_override("separation", 8)
    top_margin.add_child(top)
    top.add_child(_label("MAJAKKA / KAIKU LAB", 22, Color("8bdcc8")))
    top.add_child(_label("PRISMITE", 42, Color("f0f8ee")))
    top.add_child(_label("SHARDFORMS  •  NATIVE PROTOTYPE v0.1", 17, Color("c2d3d3")))
    _metrics = _label("Measuring device...", 17, Color("d6e5df"))
    top.add_child(_metrics)
    top.add_child(_label("Swipe to rotate  ·  Buttons to test interactions", 17, Color("829ca8")))

    var bottom_margin := MarginContainer.new()
    bottom_margin.anchor_top = 1.0
    bottom_margin.anchor_right = 1.0
    bottom_margin.anchor_bottom = 1.0
    bottom_margin.offset_left = 22
    bottom_margin.offset_top = -310
    bottom_margin.offset_right = -22
    bottom_margin.offset_bottom = -32
    root.add_child(bottom_margin)
    var panel := PanelContainer.new()
    var style := StyleBoxFlat.new()
    style.bg_color = Color(0.055, 0.11, 0.15, 0.92)
    style.set_corner_radius_all(24)
    style.content_margin_left = 20
    style.content_margin_right = 20
    style.content_margin_top = 20
    style.content_margin_bottom = 20
    panel.add_theme_stylebox_override("panel", style)
    bottom_margin.add_child(panel)
    var bottom := VBoxContainer.new()
    bottom.add_theme_constant_override("separation", 10)
    panel.add_child(bottom)
    _status = _label("Luminous Form | Companion Preview", 19, Color("c6ebe0"))
    bottom.add_child(_status)

    var first_row := HBoxContainer.new()
    first_row.add_theme_constant_override("separation", 10)
    bottom.add_child(first_row)
    _form_button = _button("INK FORM", first_row)
    _form_button.pressed.connect(_toggle_form)
    var react_button := _button("REACT", first_row)
    react_button.pressed.connect(_react)

    var second_row := HBoxContainer.new()
    second_row.add_theme_constant_override("separation", 10)
    bottom.add_child(second_row)
    _guardian_button = _button("GUARDIAN", second_row)
    _guardian_button.pressed.connect(_toggle_guardian)
    _quality_button = _button("LOW DETAIL", second_row)
    _quality_button.pressed.connect(_toggle_quality)
    bottom.add_child(_label("OFFLINE • NO ACCOUNT • NO SERVER COST", 15, Color("7fa798")))

func _label(value: String, font_size: int, color: Color) -> Label:
    var label := Label.new()
    label.text = value
    label.add_theme_font_size_override("font_size", font_size)
    label.add_theme_color_override("font_color", color)
    label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
    return label

func _button(title: String, parent: HBoxContainer) -> Button:
    var button := Button.new()
    button.text = title
    button.custom_minimum_size = Vector2(0, 76)
    button.size_flags_horizontal = Control.SIZE_EXPAND_FILL
    button.add_theme_font_size_override("font_size", 19)
    parent.add_child(button)
    return button

func _toggle_form() -> void:
    _ink = not _ink
    _creature.set_ink_mode(_ink)
    _form_button.text = "LUMINOUS" if _ink else "INK FORM"
    _refresh_status()

func _toggle_guardian() -> void:
    _guardian = not _guardian
    _creature.set_guardian_mode(_guardian)
    _guardian_button.text = "COMPANION" if _guardian else "GUARDIAN"
    _refresh_status()

func _toggle_quality() -> void:
    _low = not _low
    _creature.set_low_detail(_low)
    _quality_button.text = "FULL DETAIL" if _low else "LOW DETAIL"
    _refresh_status()

func _react() -> void:
    _creature.react()

func _refresh_status() -> void:
    var form_name := "Ink Study" if _ink else "Luminous Form"
    var use_name := "Node Guardian" if _guardian else "Companion Preview"
    var detail_name := "Low Detail" if _low else "Full Detail"
    _status.text = "%s  |  %s  |  %s" % [form_name, use_name, detail_name]

func _unhandled_input(event: InputEvent) -> void:
    if event is InputEventScreenDrag:
        _creature.rotate_y(-event.relative.x * 0.009)
    elif event is InputEventMouseMotion and Input.is_mouse_button_pressed(MOUSE_BUTTON_LEFT):
        _creature.rotate_y(-event.relative.x * 0.009)

func _process(delta: float) -> void:
    if _metrics == null or delta <= 0.0:
        return
    _seconds += delta
    _sample_ms.append(delta * 1000.0)
    if _sample_ms.size() > 240:
        _sample_ms.pop_front()
    if _seconds < 1.0 or _sample_ms.is_empty():
        return
    _seconds = 0.0
    var ordered := _sample_ms.duplicate()
    ordered.sort()
    var p95_index := mini(ordered.size() - 1, int(ceil(ordered.size() * 0.95)) - 1)
    var p95_ms: float = ordered[p95_index]
    var engine_memory_mb: float = float(Performance.get_monitor(Performance.MEMORY_STATIC)) / 1048576.0
    var fps := Engine.get_frames_per_second()
    _metrics.text = "FPS %d   ·   p95 %.1f ms   ·   engine %.0f MB" % [fps, p95_ms, engine_memory_mb]
