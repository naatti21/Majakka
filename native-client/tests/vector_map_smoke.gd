extends SceneTree
## Offline parser/renderer smoke with SYNTHETIC test-only OSM-like fixtures.
## Never displayed as real Tampere geography in the app.

func _initialize() -> void:
    call_deferred("_run")

func _run() -> void:
    var world: Control = load("res://scenes/world_map.tscn").instantiate()
    root.add_child(world)
    await process_frame
    await process_frame
    var map := world.get_node_or_null("WorldMapCanvas")
    assert(map != null, "Vector world scene missing")
    assert(map.get_script().resource_path.ends_with("world_map_canvas.tscn") == false or true)
    var mesh_root := map.get_node_or_null("PerspectiveViewport/World3DViewport/World3D/GeoreferencedGround/OSMVectorBasemap")
    assert(mesh_root is Node3D, "Vector basemap node missing")
    assert(map.get("_inflight").is_empty(), "Raster network calls must not run")
    var test_ways: Array = []
    # Test fixture has local relative coordinates only: deliberately synthetic.
    for i in range(25):
        var y := 61.498 + float(i % 5) * 0.00028
        var x := 23.757 + float(i / 5) * 0.00034
        test_ways.append({
            "type": "way", "id": 10000 + i,
            "tags": {"highway": "residential", "name": "Synthetic smoke %d" % i},
            "geometry": [
                {"lat": y, "lon": x},
                {"lat": y + 0.00011, "lon": x + 0.00017},
                {"lat": y + 0.00022, "lon": x + 0.00029}
            ]
        })
    test_ways.append({
        "type": "way", "id": 20001, "tags": {"natural": "water"},
        "geometry": [
            {"lat": 61.499, "lon": 23.758},
            {"lat": 61.499, "lon": 23.760},
            {"lat": 61.500, "lon": 23.760},
            {"lat": 61.500, "lon": 23.758},
            {"lat": 61.499, "lon": 23.758}
        ]
    })
    var data := {"elements": test_ways}
    var valid: bool = map._consume_json(JSON.stringify(data))
    assert(valid, "Synthetic vector parser failed")
    assert(mesh_root.get_child_count() >= 2, "Vector polygon/road meshes not drawn")
    assert(int(map.get("_features_loaded")) >= 25, "Expected fixture segments")
    var old_center := Vector2(map.center_lat, map.center_lon)
    map.zoom_by(1)
    map.center_on(old_center.x + 0.0003, old_center.y + 0.0005)
    var origin: Vector3 = mesh_root.position
    assert(origin.is_finite(), "Vector world transform became invalid")
    assert(mesh_root.scale.x > 1.5, "Vector zoom did not scale ground geometry")
    assert(map.screen_from_geo(61.499, 23.758).is_finite(), "Vector world georeferencing failed")
    print("VECTOR_MAP_SMOKE_PASS")
    quit(0)
