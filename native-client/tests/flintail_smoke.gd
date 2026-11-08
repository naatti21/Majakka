extends SceneTree
## Headless smoke test: view IDs + project scene creation. No Android frame-rate claims.
func _initialize() -> void:
    call_deferred("_run")
func _run() -> void:
    var packed: PackedScene = load("res://scenes/flintail_lab.tscn")
    assert(packed != null, "Flintail scene missing")
    var main = packed.instantiate()
    root.add_child(main)
    await process_frame
    await process_frame
    assert(main.get_node_or_null("IdentityHeader") != null, "Header not found")
    assert(main.get_node_or_null("PresentationStage/MapPresentation/KaikuMapSprite") != null, "Map sprite not found")
    assert(main.get_node_or_null("PresentationStage/InventoryPresentation/AnimatedCard") != null, "Card not found")
    print("FLINTAIL_SMOKE_PASS")
    quit(0)
