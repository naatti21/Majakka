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
    assert(map.zoom == 15, "Perspective zoom broken")
    var initial_camera_position: Vector3 = camera.position
    # Touch tests use the same screen-event classes delivered on Android.
    var finger_a := InputEventScreenTouch.new()
    finger_a.index = 0
    finger_a.position = Vector2(180, 250)
    finger_a.pressed = true
    map._gui_input(finger_a)
    var finger_b := InputEventScreenTouch.new()
    finger_b.index = 1
    finger_b.position = Vector2(350, 250)
    finger_b.pressed = true
    map._gui_input(finger_b)
    var orbit := InputEventScreenDrag.new()
    orbit.index = 1
    orbit.position = Vector2(395, 280)
    map._gui_input(orbit)
    assert(camera.position.distance_to(initial_camera_position) > 0.05, "Two-finger orbit/tilt did not move camera")
    finger_b.pressed = false
    finger_b.position = orbit.position
    map._gui_input(finger_b)
    finger_a.pressed = false
    map._gui_input(finger_a)
    # Restore a predictable camera without resetting geographic zoom.
    map.reset_view()
    assert(camera.position.distance_to(Vector3(0, 39.0 * sin(deg_to_rad(42.0)), 39.0 * cos(deg_to_rad(42.0)))) < 0.1, "Camera HOME reset incorrect")
    var before_center: Vector2 = Vector2(map.center_lat, map.center_lon)
    finger_a.pressed = true
    finger_a.position = Vector2(250, 300)
    map._gui_input(finger_a)
    var pan := InputEventScreenDrag.new()
    pan.index = 0
    pan.position = Vector2(285, 300)
    map._gui_input(pan)
    var after_center: Vector2 = Vector2(map.center_lat, map.center_lon)
    assert(after_center.distance_to(before_center) > 0.0000001, "One-finger pan did not change map center")
    finger_a.pressed = false
    finger_a.position = pan.position
    map._gui_input(finger_a)
    assert(map.screen_from_geo(61.50297, 23.76029).is_finite(), "Geo projection failed after gestures")
    print("PERSPECTIVE_MAP_SMOKE_PASS")
    quit(0)
