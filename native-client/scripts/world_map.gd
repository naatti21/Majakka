extends Control
## Native World Map alpha: real map tiles, real OSM-sourced pilot landmarks,
## test-only Kaiku sightings, explicit demo home anchor. Zero live backend state.

const GEO = preload("res://scripts/world_catalog.gd")
const MAP_SCENE = preload("res://scenes/world_map_canvas.tscn")
const CARD_ART = preload("res://assets/kaiku/flintail/base/card-concept.webp")
const BG := Color("071721")
const CYAN := Color("81ddd1")

var _map: MajakkaWorldMapCanvas
var _inventory: Control
var _map_tab: Button
var _inventory_tab: Button
var _status: Label
var _selection: Label
var _metrics: Label
var _card: TextureRect
var _elapsed := 0.0
var _show_inventory := false

func _ready() -> void:
    mouse_filter = Control.MOUSE_FILTER_STOP
    _create_ui()
    resized.connect(_layout_card)
    _layout_card()

func _create_ui() -> void:
    var background := ColorRect.new()
    background.color = BG
    background.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
    background.mouse_filter = Control.MOUSE_FILTER_IGNORE
    add_child(background)

    _map = MAP_SCENE.instantiate() as MajakkaWorldMapCanvas
    _map.name = "WorldMapCanvas"
    _map.anchor_right = 1.0
    _map.anchor_bottom = 1.0
    _map.offset_top = 126
    _map.offset_bottom = -294
    add_child(_map)
    _map.object_selected.connect(_on_selected)
    _map.map_status.connect(_on_status)

    _inventory = Control.new()
    _inventory.name = "CollectionView"
    _inventory.anchor_right = 1.0
    _inventory.anchor_bottom = 1.0
    _inventory.offset_top = 126
    _inventory.offset_bottom = -294
    _inventory.visible = false
    add_child(_inventory)

    var card_back := ColorRect.new()
    card_back.color = Color("0f2a35")
    card_back.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
    card_back.mouse_filter = Control.MOUSE_FILTER_IGNORE
    _inventory.add_child(card_back)
    _card = TextureRect.new()
    _card.name = "FlintailCard"
    _card.texture = CARD_ART
    _card.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
    _card.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
    _card.mouse_filter = Control.MOUSE_FILTER_IGNORE
    _inventory.add_child(_card)

    var top_panel := ColorRect.new()
    top_panel.color = Color("091b27")
    top_panel.anchor_right = 1.0
    top_panel.offset_bottom = 126
    top_panel.mouse_filter = Control.MOUSE_FILTER_IGNORE
    add_child(top_panel)
    var header := VBoxContainer.new()
    header.name = "WorldHeader"
    header.anchor_right = 1.0
    header.offset_left = 20
    header.offset_right = -18
    header.offset_top = 13
    header.offset_bottom = 116
    header.add_theme_constant_override("separation", 1)
    add_child(header)
    header.add_child(_label("MAJAKKA  /  THE LIVING WORLD", 22, CYAN))
    header.add_child(_label("VECTOR WORLD  ·  TAMPERE PILOT", 23, Color("f0f3eb")))
    _metrics = _label("FPS —", 14, Color("9abbbf"))
    header.add_child(_metrics)
    header.add_child(_label("LOCATION: DEMO HOME  ·  GPS OFF  ·  NO ACCOUNT", 12, Color("d7b786")))

    var map_controls := VBoxContainer.new()
    map_controls.name = "MapControls"
    map_controls.anchor_left = 1.0
    map_controls.anchor_right = 1.0
    map_controls.offset_left = -102
    map_controls.offset_right = -14
    map_controls.offset_top = 150
    map_controls.offset_bottom = 466
    map_controls.add_theme_constant_override("separation", 9)
    add_child(map_controls)
    var zoom_in := _button("+",map_controls,21)
    zoom_in.pressed.connect(func(): _map.zoom_by(1))
    var zoom_out := _button("−",map_controls,21)
    zoom_out.pressed.connect(func(): _map.zoom_by(-1))
    var home := _button("HOME",map_controls,14)
    home.pressed.connect(func():
        var p: Dictionary = GEO.preview_home()
        _map.center_on(float(p["lat"]), float(p["lon"]))
        _map.reset_view())
    var tilt := _button("TILT +",map_controls,14)
    tilt.pressed.connect(func(): _map.cycle_tilt())
    var retry := _button("RETRY MAP", map_controls, 13)
    retry.pressed.connect(func(): _map.retry_vector_map())

    var dock := ColorRect.new()
    dock.name = "WorldDock"
    dock.color = Color("091b27")
    dock.anchor_top = 1.0
    dock.anchor_bottom = 1.0
    dock.anchor_right = 1.0
    dock.offset_top = -294
    dock.mouse_filter = Control.MOUSE_FILTER_IGNORE
    add_child(dock)
    var dock_ui := VBoxContainer.new()
    dock_ui.anchor_top = 1.0
    dock_ui.anchor_bottom = 1.0
    dock_ui.anchor_right = 1.0
    dock_ui.offset_left = 18
    dock_ui.offset_right = -18
    dock_ui.offset_top = -284
    dock_ui.offset_bottom = -16
    dock_ui.add_theme_constant_override("separation", 9)
    add_child(dock_ui)
    _selection = _label("Tap a glowing Node or a Kaiku to inspect it.", 17, Color("f2efdf"))
    _selection.name = "SelectionLabel"
    _selection.custom_minimum_size.y = 67
    dock_ui.add_child(_selection)
    _status = _label("Preparing real vector map of Tampere…", 14, Color("9abbbf"))
    _status.name = "MapStatus"
    dock_ui.add_child(_status)
    var tabs := HBoxContainer.new()
    tabs.add_theme_constant_override("separation", 10)
    dock_ui.add_child(tabs)
    _map_tab = _button("WORLD MAP", tabs, 18)
    _inventory_tab = _button("KAIKU COLLECTION", tabs, 18)
    _map_tab.pressed.connect(func(): _set_inventory(false))
    _inventory_tab.pressed.connect(func(): _set_inventory(true))
    dock_ui.add_child(_label("NODES: OSM pilot sites  ·  KAIKU + STATUS: DEMO FIXTURES", 12, Color("dbbc88")))
    dock_ui.add_child(_label("© OpenStreetMap contributors  ·  Source tiles: OpenStreetMap", 13, Color("aac3c4")))
    dock_ui.add_child(_label("MAP: real OSM vectors · fingers: pan, pinch, orbit, tilt · GPS OFF.", 12, Color("869fa6")))
    _set_inventory(false)
    # The child map may emit its first status while the UI tree is still being
    # built (especially when cached OSM data loads instantly).
    if _map != null:
        _on_status(str(_map.get("_vector_status")))

func _label(s: String, size_px: int, color_value: Color) -> Label:
    var label := Label.new()
    label.text = s
    label.add_theme_font_size_override("font_size", size_px)
    label.add_theme_color_override("font_color", color_value)
    label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
    label.mouse_filter = Control.MOUSE_FILTER_IGNORE
    return label

func _button(s: String, parent: BoxContainer, size_px: int) -> Button:
    var b := Button.new()
    b.text = s
    b.custom_minimum_size = Vector2(0, 66)
    b.size_flags_horizontal = Control.SIZE_EXPAND_FILL
    b.add_theme_font_size_override("font_size", size_px)
    parent.add_child(b)
    return b

func _on_selected(selected: Dictionary) -> void:
    var type_id: String = str(selected.get("kind", "node"))
    if type_id == "encounter":
        _selection.text = "KAIKU ENCOUNTER · Flintail · DEMO ONLY\nTap COLLECTION to view its Animated Card."
    elif type_id == "home":
        _selection.text = "HOME ANCHOR · illustrative marker, not GPS.\nActual player position requires opt-in location."
    else:
        _selection.text = "%s · %s [PREVIEW]\nOSM: %s · Tap to inspect (actions later)" % [str(selected.get("name","Node")),str(selected.get("preview_state","Dormant")), str(selected.get("source_id",""))]

func _on_status(msg: String) -> void:
    if _status != null:
        _status.text = msg

func _set_inventory(on: bool) -> void:
    _show_inventory = on
    _map.visible = not on
    _inventory.visible = on
    _map_tab.disabled = not on
    _inventory_tab.disabled = on
    if on:
        _selection.text = "FLINTAIL · sp.flintail · fm.flintail.base\nAnimated Card concept · source artwork not yet approved"
    else:
        _selection.text = "Explore real pilot Nodes and DEMO Kaiku sightings."
    _layout_card()

func _layout_card() -> void:
    if _card == null or _inventory == null:
        return
    var area: Vector2 = _inventory.size
    if area.x < 1 or area.y < 1:
        return
    var h: float = minf(area.y * 0.90, area.x * 0.91 * 1.46)
    _card.size = Vector2(h / 1.46, h)
    _card.pivot_offset = _card.size * 0.5
    _card.position = (area - _card.size) * 0.5

func _process(delta: float) -> void:
    _elapsed += minf(delta,0.1)
    if _show_inventory and _card != null:
        _card.scale = Vector2.ONE * (1.0 + 0.009 * sin(_elapsed * 1.75))
    if int(_elapsed * 2.0) != int((_elapsed-delta)*2.0) and _metrics != null:
        _metrics.text = "FPS %d  ·  engine %.0f MB  ·  vector world · zoom %d" % [Engine.get_frames_per_second(), Performance.get_monitor(Performance.MEMORY_STATIC)/1048576.0, _map.zoom]
