extends SceneTree

func _initialize() -> void:
    call_deferred("_run")

func _run() -> void:
    var scene: PackedScene = load("res://scenes/world_map.tscn")
    assert(scene != null, "World scene missing")
    var world: Control = scene.instantiate()
    root.add_child(world)
    await process_frame
    await process_frame
    var map = world.get_node_or_null("WorldMapCanvas")
    assert(map != null, "Perspective map missing")
    var camera = map.get_node_or_null("PerspectiveViewport/World3DViewport/World3D/FollowPerspectiveCamera")
    assert(camera is Camera3D, "Native 3D camera missing")
    var marker_layer = map.get_node_or_null("PerspectiveViewport/World3DViewport/World3D/WorldMarkers")
    assert(marker_layer is Node3D, "3D markers missing")
    assert(marker_layer.get_child_count() == 11, "Expected eight sourced Nodes, two demo Kaiku and one Demo Home")
    assert(map.has_method("cycle_tilt"), "Perspective tilt unavailable")
    var before: Vector3 = camera.position
    map.cycle_tilt()
    assert(camera.position.distance_to(before) > 0.1, "Tilt has no effect")
    var point: Vector2 = map.screen_from_geo(61.50297,23.76029)
    assert(point.is_finite(), "3D camera geographic projection invalid")
    map.zoom_by(1)
    assert(map.zoom == 14, "Perspective zoom broken")
    print("PERSPECTIVE_MAP_SMOKE_PASS")
    quit(0)
