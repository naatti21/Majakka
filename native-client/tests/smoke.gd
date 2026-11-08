extends SceneTree
## Headless logic smoke. It cannot validate Android performance or rendering quality.

func _init() -> void:
    call_deferred("_check")

func _check() -> void:
    var scene: PackedScene = load("res://scenes/main.tscn")
    if scene == null:
        push_error("Main scene did not load")
        quit(1)
        return
    var lab := scene.instantiate()
    root.add_child(lab)
    await process_frame
    var creature: PrismitePreview = lab.get_node_or_null("Prismite") as PrismitePreview
    if creature == null:
        push_error("Prismite not present")
        quit(1)
        return
    var first_state: Dictionary = creature.get_debug_state()
    if first_state.get("species") != "prismite" or first_state.get("satellites") != 4:
        push_error("Invalid baseline Kaiku")
        quit(1)
        return
    creature.set_ink_mode(true)
    creature.set_guardian_mode(true)
    creature.set_low_detail(true)
    creature.react()
    var after: Dictionary = creature.get_debug_state()
    if after.get("form") != "ink_study" or not after.get("guardian") or not after.get("low_detail"):
        push_error("Preview controls did not update state")
        quit(1)
        return
    print("PASS: Majakka Native v0.1 headless logic smoke")
    quit(0)
