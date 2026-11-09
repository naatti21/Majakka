extends SceneTree

const GEO = preload("res://scripts/world_catalog.gd")

func _initialize() -> void:
    call_deferred("_run")

func _run() -> void:
    var coords := [Vector2(61.5018,23.762), Vector2(0,0),Vector2(45.0,179.9),Vector2(-70,-160.5)]
    for original in coords:
        var projected: Vector2 = GEO.project(original.x,original.y,13)
        var actual: Vector2 = GEO.unproject(projected,13)
        assert(absf(actual.x-original.x)<0.00007, "Mercator latitude round-trip (Vector2 float32)")
        assert(absf(actual.y-original.y)<0.00007, "Mercator longitude round-trip (Vector2 float32)")
    var nodes: Array[Dictionary] = GEO.pilot_nodes()
    assert(nodes.size()==8, "Pilot OSM Node catalog count changed")
    var unique_ids: Dictionary = {}
    for node in nodes:
        var key: String = node["id"]
        assert(key.begins_with("osm:"),"Pilot node must have sourced identity")
        assert(not unique_ids.has(key),"Duplicate sourced identity")
        unique_ids[key] = true
    for echo in GEO.preview_encounters():
        assert(unique_ids.has(str(echo["anchor_node"])),"Fixture encounter missing valid source anchor")
        assert(str(echo["id"]).begins_with("demo:"),"Wild encounter must be explicitly demo")
    var packed: PackedScene = load("res://scenes/world_map.tscn")
    assert(packed != null,"World Map scene missing")
    var world := packed.instantiate()
    root.add_child(world)
    await process_frame
    await process_frame
    var canvas = world.get_node_or_null("WorldMapCanvas")
    assert(canvas != null,"Missing WorldMapCanvas")
    assert(world.get_node_or_null("WorldHeader") != null,"Header missing")
    assert(world.get_node_or_null("WorldDock") != null,"Dock missing")
    assert(world.get_node_or_null("CollectionView/FlintailCard") != null,"Flintail Inventory Card missing")
    var p: Vector2 = canvas.screen_from_geo(61.50297,23.76029)
    assert(p.is_finite(),"Projected screen point invalid")
    assert(canvas.zoom == 14,"Unexpected starting zoom")
    canvas.zoom_by(2)
    assert(canvas.zoom == 16,"Zoom change broken")
    print("WORLD_MAP_SMOKE_PASS")
    quit(0)
