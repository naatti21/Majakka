extends SceneTree
## Colorized map validates that sourced tile geometry is preserved in-place,
## independent of the renderer/network and with bounded texture size.
const STYLE = preload("res://scripts/map_style.gd")
func _initialize() -> void:
    call_deferred("_run")
func _run() -> void:
    var source := Image.create(256, 256, false, Image.FORMAT_RGBA8)
    source.fill(Color(0.63, 0.77, 0.86))
    var result: Image = STYLE.stylize(source)
    assert(result.get_width() == 256 and result.get_height() == 256, "Map must retain full native tile resolution")
    assert(result.has_mipmaps(), "Oblique ground tiles must have mipmaps")
    var water: Color = result.get_pixel(128, 128)
    assert(water.b > water.r and water.b > water.g, "Water color not preserved")
    assert(STYLE.is_green(Color(0.60, 0.80, 0.58)), "Green geography detection")
    assert(STYLE.is_road(Color(0.97, 0.90, 0.68)), "Road geography detection")
    assert(not STYLE.is_road(Color(0.62,0.78,0.85)), "Water not classified as road")
    var scene: PackedScene = load("res://scenes/world_map.tscn")
    assert(scene != null, "World Map scene missing")
    var world := scene.instantiate()
    root.add_child(world)
    await process_frame
    await process_frame
    var canvas := world.get_node_or_null("WorldMapCanvas")
    assert(canvas != null, "Map canvas missing")
    assert(canvas.zoom == 14, "Georeferenced zoom changed")
    print("MAP_STYLE_SMOKE_PASS")
    quit(0)
