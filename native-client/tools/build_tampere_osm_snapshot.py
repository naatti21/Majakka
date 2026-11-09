#!/usr/bin/env python3
"""One-time BUILD tool: obtain a bounded, validated OSM snapshot for Godot.

No client-side download, no live location, no fabricated geography.
Run only with explicit developer action. OSM data © OpenStreetMap contributors,
ODbL 1.0: https://www.openstreetmap.org/copyright
"""
import datetime as dt
import json
import pathlib
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

BBOX = (61.4958, 23.7508, 61.5051, 23.7765)  # south, west, north, east
CENTER = (61.5010, 23.7620)
ENDPOINTS = (
    "https://overpass.private.coffee/api/interpreter",
    "https://overpass-api.de/api/interpreter",
)
TARGET = pathlib.Path(__file__).resolve().parents[1] / "assets/maps/tampere-vector-pilot.json"
MAX_BYTES = 2_500_000
MAX_WAYS = 4000
MAX_BUILDINGS = 950

B = ",".join(map(str, BBOX))
QUERY = (
    "[out:json][timeout:40];("
    f'way[highway~"^(primary|secondary|tertiary|unclassified|residential|living_street|service|pedestrian|footway|cycleway|path)$"]({B});'
    f'way[natural=water]({B});'
    f'way[waterway~"^(riverbank|river|canal|stream)$"]({B});'
    f'way[leisure~"^(park|garden)$"]({B});'
    f'way[landuse~"^(grass|forest|recreation_ground|meadow)$"]({B});'
    f'way[building]({B});'
    ");out tags geom;"
)

def relevant(tags):
    if tags.get("highway"): return "roads"
    if tags.get("natural") == "water" or tags.get("waterway"): return "water"
    if tags.get("leisure") in ("park", "garden") or tags.get("landuse") in ("grass", "forest", "recreation_ground", "meadow"): return "park"
    if tags.get("building"): return "building"
    return ""

def fetch():
    for endpoint in ENDPOINTS:
        for attempt in range(2):
            try:
                req = urllib.request.Request(
                    endpoint,
                    data=urllib.parse.urlencode({"data": QUERY}).encode("utf-8"),
                    headers={
                        "User-Agent": "Majakka-Native-Vector-Snapshot/0.6.1 (+https://github.com/naatti21/Majakka)",
                        "Accept": "application/json",
                    },
                    method="POST",
                )
                print(f"Fetching bounded OSM pilot from {endpoint}, attempt {attempt + 1}", flush=True)
                with urllib.request.urlopen(req, timeout=75) as response:
                    blob = response.read(16_000_000)
                    if len(blob) >= 16_000_000:
                        raise ValueError("Source response too large")
                data = json.loads(blob)
                if not isinstance(data, dict) or not isinstance(data.get("elements"), list):
                    raise ValueError("Not valid Overpass JSON")
                print("Source elements:", len(data["elements"]), "OSM timestamp:", data.get("osm3s", {}).get("timestamp_osm_base"), flush=True)
                return data, endpoint
            except Exception as exc:
                print(f"Overpass attempt failed: {type(exc).__name__}: {exc}", flush=True)
                if attempt == 0: time.sleep(3)
    raise RuntimeError("Could not acquire real vector geography from either public Overpass server")

def compact(source, endpoint):
    records = []
    counts = {"roads": 0, "water": 0, "park": 0, "building": 0}
    for item in source["elements"]:
        if item.get("type") != "way" or not isinstance(item.get("geometry"), list):
            continue
        tags = item.get("tags", {})
        kind = relevant(tags)
        geom = item["geometry"]
        if not kind or not (2 <= len(geom) <= 600):
            continue
        if kind == "building" and counts["building"] >= MAX_BUILDINGS:
            continue
        try:
            geometry = [{"lat": round(float(p["lat"]), 6), "lon": round(float(p["lon"]), 6)} for p in geom]
        except (KeyError, ValueError, TypeError):
            continue
        if any(not (61.47 <= p["lat"] <= 61.53 and 23.70 <= p["lon"] <= 23.83) for p in geometry):
            continue
        kept_tags = {}
        for field in ("highway", "natural", "waterway", "leisure", "landuse", "building", "name"):
            if field in tags:
                kept_tags[field] = str(tags[field])[:75]
        records.append({"type": "way", "id": int(item["id"]), "tags": kept_tags, "geometry": geometry})
        counts[kind] += 1
        if len(records) >= MAX_WAYS:
            break
    if counts["roads"] < 65:
        raise ValueError(f"Not enough sourced roads for a real Tampere map: {counts}")
    if counts["water"] + counts["park"] < 4:
        raise ValueError(f"Water / park classes missing: {counts}")
    result = {
        "metadata": {
            "region": "Tampere center, Finland",
            "bbox_s_w_n_e": list(BBOX),
            "source": "OpenStreetMap contributors via " + endpoint,
            "license": "ODbL-1.0",
            "osm_base": source.get("osm3s", {}).get("timestamp_osm_base", ""),
            "retrieved_utc": dt.datetime.now(dt.timezone.utc).isoformat(),
            "counts": counts,
            "note": "Real sourced geometry. Bounded developer test; not complete city or public-safe waypoint catalog.",
        },
        "elements": records,
    }
    raw = json.dumps(result, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    if len(raw) > MAX_BYTES:
        raise ValueError(f"Snapshot too large: {len(raw)} bytes")
    TARGET.parent.mkdir(parents=True, exist_ok=True)
    TARGET.write_bytes(raw)
    print(f"SNAPSHOT_VALIDATED path={TARGET} bytes={len(raw)} ways={len(records)} counts={counts}", flush=True)

if __name__ == "__main__":
    source, endpoint = fetch()
    compact(source, endpoint)
