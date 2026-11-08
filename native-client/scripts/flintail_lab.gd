extends Control
## Kaiku Presentation Slice v0.2. Art is CONCEPT, not canonical production asset.
## Offline only. One 2.5D sprite on map; one Inventory card loop when selected.

const MAP_ART = preload("res://assets/maps/forest-map.webp")
const CARD_ART = preload("res://assets/kaiku/flintail/base/card-concept.webp")
const IDLE_ART = preload("res://assets/kaiku/flintail/base/map-idle.webp")
const WALK_ART = preload("res://assets/kaiku/flintail/base/map-walk.webp")
const RUN_ART = preload("res://assets/kaiku/flintail/base/map-run.webp")
const REACT_ART = preload("res://assets/kaiku/flintail/base/map-react.webp")

const SPECIES_ID = "sp.flintail"
const FORM_ID = "fm.flintail.base"
const BACKGROUND = Color("06131d")
const CYAN = Color("87e5d8")

var _stage: Control
var _map_view: Control
var _inventory_view: Control
var _map_sprite: TextureRect
var _card: TextureRect
var _metrics: Label
var _subtitle: Label
var _action_button: Button
var _guardian_button: Button
var _map_button: Button
var _inventory_button: Button
var _showing_inventory := false
var _guardian := false
var _walking := false
var _react_until := 0.0
var _elapsed := 0.0
var _walk_time := 0.0
var _frame_time := 0.0
var _samples: Array[float] = []
var _heading_start: Vector2 = Vector2(0.25, 0.63)
var _heading_finish: Vector2 = Vector2(0.60, 0.52)
var _current_normalized := Vector2(0.25, 0.63)
var _returning := false
var _last_pose := ""

func _ready() -> void:
    mouse_filter = Control.MOUSE_FILTER_STOP
    _create_layout()
    resized.connect(_layout_art)
    _layout_art()
    _refresh_buttons()

func _create_layout() -> void:
    var base := ColorRect.new()
    base.color = BACKGROUND
    base.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
    base.mouse_filter = Control.MOUSE_FILTER_IGNORE
    add_child(base)

    var header := VBoxContainer.new()
    header.name = "IdentityHeader"
    header.set_anchors_preset(Control.PRESET_TOP_WIDE)
    header.offset_left = 22
    header.offset_right = -22
    header.offset_top = 24
    header.offset_bottom = 184
    header.mouse_filter = Control.MOUSE_FILTER_IGNORE
    header.add_theme_constant_override("separation", 5)
    add_child(header)
    header.add_child(_label("MAJAKKA  /  KAIKU LAB", 22, CYAN))
    header.add_child(_label("FLINTAIL", 38, Color("f1f7f2")))
    _subtitle = _label("sp.flintail  •  fm.flintail.base  •  ART STUDY", 15, Color("a8bdc4"))
    header.add_child(_subtitle)
    _metrics = _label("FPS —   •   Engine RAM —", 15, Color("d4e8dd"))
    header.add_child(_metrics)

    _stage = Control.new()
    _stage.name = "PresentationStage"
    _stage.anchor_left = 0.0
    _stage.anchor_right = 1.0
    _stage.anchor_top = 0.0
    _stage.anchor_bottom = 1.0
    _stage.offset_top = 177
    _stage.offset_bottom = -242
    _stage.mouse_filter = Control.MOUSE_FILTER_IGNORE
    add_child(_stage)

    _map_view = Control.new()
    _map_view.name = "MapPresentation"
    _map_view.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
    _map_view.mouse_filter = Control.MOUSE_FILTER_IGNORE
    _stage.add_child(_map_view)

    var background := TextureRect.new()
    background.name = "MapBackdrop"
    background.texture = MAP_ART
    background.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
    background.stretch_mode = TextureRect.STRETCH_SCALE
    background.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
    background.mouse_filter = Control.MOUSE_FILTER_IGNORE
    _map_view.add_child(background)

    _map_sprite = TextureRect.new()
    _map_sprite.name = "KaikuMapSprite"
    _map_sprite.texture = IDLE_ART
    _map_sprite.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
    _map_sprite.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
    _map_sprite.mouse_filter = Control.MOUSE_FILTER_IGNORE
    _map_view.add_child(_map_sprite)

    var map_tip := _label("WORLD MAP  •  Tap MOVE to test 2.5D", 17, CYAN)
    map_tip.position = Vector2(20, 18)
    _map_view.add_child(map_tip)

    _inventory_view = Control.new()
    _inventory_view.name = "InventoryPresentation"
    _inventory_view.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
    _inventory_view.mouse_filter = Control.MOUSE_FILTER_IGNORE
    _inventory_view.visible = false
    _stage.add_child(_inventory_view)

    var halo := ColorRect.new()
    halo.name = "CardHalo"
    halo.color = Color("102c3a")
    halo.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
    halo.mouse_filter = Control.MOUSE_FILTER_IGNORE
    _inventory_view.add_child(halo)

    _card = TextureRect.new()
    _card.name = "AnimatedCard"
    _card.texture = CARD_ART
    _card.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
    _card.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
    _card.mouse_filter = Control.MOUSE_FILTER_IGNORE
    _inventory_view.add_child(_card)

    var card_note := _label("INVENTORY  •  Animated Card concept", 17, CYAN)
    card_note.position = Vector2(20, 18)
    _inventory_view.add_child(card_note)

    var toolbar := VBoxContainer.new()
    toolbar.name = "ControlDock"
    toolbar.anchor_top = 1.0
    toolbar.anchor_bottom = 1.0
    toolbar.anchor_right = 1.0
    toolbar.offset_left = 20
    toolbar.offset_right = -20
    toolbar.offset_top = -225
    toolbar.offset_bottom = -20
    toolbar.add_theme_constant_override("separation", 12)
    add_child(toolbar)

    var modes := HBoxContainer.new()
    modes.add_theme_constant_override("separation", 12)
    toolbar.add_child(modes)
    _map_button = _button("WORLD MAP", modes)
    _map_button.pressed.connect(func(): _set_view(false))
    _inventory_button = _button("INVENTORY", modes)
    _inventory_button.pressed.connect(func(): _set_view(true))

    var actions := HBoxContainer.new()
    actions.add_theme_constant_override("separation", 12)
    toolbar.add_child(actions)
    _action_button = _button("MOVE", actions)
    _action_button.pressed.connect(_action)
    _guardian_button = _button("GUARDIAN", actions)
    _guardian_button.pressed.connect(_toggle_guardian)
    toolbar.add_child(_label("OFFLINE  •  ONE MAP SPRITE  •  ONE CARD LOOP", 15, Color("82aaa9")))
    toolbar.add_child(_label("Concept art only — canonical visual QA still required", 14, Color("a5b3b8")))

func _label(message: String, font_size: int, tint: Color) -> Label:
    var item := Label.new()
    item.text = message
    item.add_theme_font_size_override("font_size", font_size)
    item.add_theme_color_override("font_color", tint)
    item.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
    item.mouse_filter = Control.MOUSE_FILTER_IGNORE
    return item

func _button(label_text: String, parent: HBoxContainer) -> Button:
    var item := Button.new()
    item.text = label_text
    item.custom_minimum_size = Vector2(0, 70)
    item.size_flags_horizontal = Control.SIZE_EXPAND_FILL
    item.add_theme_font_size_override("font_size", 20)
    parent.add_child(item)
    return item

func _layout_art() -> void:
    if _stage == null or _map_sprite == null or _card == null:
        return
    var area := _stage.size
    if area.x < 1 or area.y < 1:
        return
    var sprite_w := clampf(area.x * 0.37, 150.0, 260.0)
    _map_sprite.size = Vector2(sprite_w, sprite_w * 0.76)
    _map_sprite.pivot_offset = _map_sprite.size * 0.5
    _position_sprite()
    var card_h := minf(area.y * 0.88, area.x * 0.84 * (537.0 / 368.0))
    _card.size = Vector2(card_h * 368.0 / 537.0, card_h)
    _card.position = (area - _card.size) * 0.5
    _card.pivot_offset = _card.size * 0.5

func _position_sprite() -> void:
    if _stage == null or _map_sprite == null:
        return
    var centre := Vector2(_stage.size.x * _current_normalized.x, _stage.size.y * _current_normalized.y)
    _map_sprite.position = centre - _map_sprite.size * 0.5

func _set_view(inventory: bool) -> void:
    _showing_inventory = inventory
    _map_view.visible = not inventory
    _inventory_view.visible = inventory
    if inventory:
        _walking = false # card loop only; map animation paused
    _refresh_buttons()

func _toggle_guardian() -> void:
    if _showing_inventory:
        return
    _guardian = not _guardian
    _walking = false
    _current_normalized = Vector2(0.76, 0.51) if _guardian else Vector2(0.25, 0.63)
    _position_sprite()
    _refresh_buttons()

func _action() -> void:
    if _showing_inventory:
        _react_until = _elapsed + 0.75  # small card pulse
        return
    if _guardian:
        return
    _walking = true
    _walk_time = 0.0
    _returning = not _returning
    _heading_start = _current_normalized
    _heading_finish = Vector2(0.23, 0.66) if _returning else Vector2(0.60, 0.52)
    _refresh_buttons()

func _refresh_buttons() -> void:
    _map_button.disabled = not _showing_inventory
    _inventory_button.disabled = _showing_inventory
    _guardian_button.disabled = _showing_inventory
    _action_button.text = "RESONATE" if _showing_inventory else "MOVE"
    _guardian_button.text = "COMPANION" if _guardian else "GUARDIAN"

func _process(delta: float) -> void:
    _elapsed += minf(delta, 0.1)
    _frame_time += delta
    if delta > 0.0:
        _samples.append(delta * 1000.0)
    if _samples.size() > 240:
        _samples.pop_front()
    if _frame_time >= 1.0:
        var memory := Performance.get_monitor(Performance.MEMORY_STATIC) / 1048576.0
        _metrics.text = "FPS %d   •   engine %.0f MB   •   2.5D" % [Engine.get_frames_per_second(), memory]
        _frame_time = 0.0
    if _showing_inventory:
        # One selected card has a subtle breathing motion. No concurrent live-3D.
        var pulse := 1.0 + 0.008 * sin(_elapsed * 1.8)
        if _elapsed < _react_until:
            pulse += 0.020 * sin(_elapsed * 21.0)
        _card.scale = Vector2.ONE * pulse
        return
    _card.scale = Vector2.ONE
    if _walking:
        _walk_time += delta
        var t := minf(1.0, _walk_time / 2.8)
        _current_normalized = _heading_start.lerp(_heading_finish, t)
        _position_sprite()
        if t >= 1.0:
            _walking = false
            _refresh_buttons()
    var new_pose := "idle"
    if _walking:
        new_pose = "run" if int(_elapsed * 4.0) % 3 == 0 else "walk"
    elif _elapsed < _react_until:
        new_pose = "react"
    if new_pose != _last_pose:
        _last_pose = new_pose
        match new_pose:
            "walk": _map_sprite.texture = WALK_ART
            "run": _map_sprite.texture = RUN_ART
            "react": _map_sprite.texture = REACT_ART
            _: _map_sprite.texture = IDLE_ART
    # Minimal bob: keep one sprite active and pause it outside map view.
    _map_sprite.rotation = 0.008 * sin(_elapsed * 2.1) if not _guardian else 0.0
