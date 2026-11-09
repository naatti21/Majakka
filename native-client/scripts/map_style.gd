extends RefCounted
## Majakka dark map style prototype.
## Incoming PNG map tiles retain original georeferencing, but are turned into
## a low-cost palette/relief representation. This is intentionally NOT vector
## data or a claim of a complete label-free geographic basemap.

const OUTPUT_SIZE := 256
const SEA := Color(0.035, 0.119, 0.178)
const PARK := Color(0.043, 0.183, 0.157)
const BUILDING := Color(0.103, 0.178, 0.219)
const ROAD := Color(0.27, 0.40, 0.41)
const LAND := Color(0.055, 0.102, 0.132)

static func is_water(color: Color) -> bool:
    return color.b - color.r > 0.055 and color.b - color.g > 0.025 and color.b > 0.55

static func is_green(color: Color) -> bool:
    return color.g - color.r > 0.035 and color.g - color.b > 0.015 and color.g > 0.46

static func is_road(color: Color) -> bool:
    return color.r > 0.83 and color.g > 0.77 and color.b > 0.56 and color.r - color.b > 0.115

static func is_building(color: Color) -> bool:
    return color.r > 0.53 and color.r < 0.92 and color.g > 0.48 and absf(color.r - color.g) < 0.14 and color.r - color.b > 0.035 and color.r - color.b < 0.21

static func palette_color(color: Color) -> Color:
    if is_water(color):
        return SEA
    if is_green(color):
        return PARK
    if is_road(color):
        return ROAD
    if is_building(color):
        return BUILDING
    return LAND

static func stylize(source: Image) -> Image:
    # v0.5.1: preserve ALL native source pixels. The previous 128px downsample
    # permanently destroyed 75% of map detail before the 3D renderer saw it.
    # This is an interim raster fix; a licensed vector basemap is still needed.
    var sample: Image = source.duplicate()
    if sample.get_width() != OUTPUT_SIZE or sample.get_height() != OUTPUT_SIZE:
        sample.resize(OUTPUT_SIZE, OUTPUT_SIZE, Image.INTERPOLATE_BILINEAR)
    sample.convert(Image.FORMAT_RGB8)
    var out: Image = Image.create(OUTPUT_SIZE, OUTPUT_SIZE, false, Image.FORMAT_RGBA8)
    for y in range(OUTPUT_SIZE):
        for x in range(OUTPUT_SIZE):
            var original: Color = sample.get_pixel(x, y)
            var mapped: Color = palette_color(original)
            # A subtle top edge and bottom shade suggest raised blocks on
            # building-colored map geometry. No camera-dependent geometry is added.
            if is_building(original):
                if y > 0 and not is_building(sample.get_pixel(x, y - 1)):
                    mapped = Color(0.25, 0.43, 0.45)
                elif x < OUTPUT_SIZE - 1 and not is_building(sample.get_pixel(x + 1, y)):
                    mapped = Color(0.045, 0.103, 0.138)
            out.set_pixel(x, y, mapped)
    out.generate_mipmaps() # filter distant oblique tiles without hard nearest-neighbor blocks
    return out
