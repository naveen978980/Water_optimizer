import ee
import geemap
import json

# -----------------------------
# INITIALIZE EARTH ENGINE
# -----------------------------

try:
    ee.Initialize(project="water-geofence-project")
except Exception:
    ee.Authenticate()
    ee.Initialize(project="water-geofence-project")

# -----------------------------
# INPUT LOCATION
# -----------------------------

lat = 13.14679
lon = 80.21152

point = ee.Geometry.Point([lon, lat])
region = point.buffer(2000)

# -----------------------------
# LOAD SENTINEL IMAGE
# -----------------------------

collection = (
    ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
    .filterBounds(region)
    .filterDate("2023-01-01", "2024-12-31")
    .sort("CLOUDY_PIXEL_PERCENTAGE")
)

sentinel = collection.first()

# -----------------------------
# WATER DETECTION
# -----------------------------

ndwi = sentinel.normalizedDifference(["B3", "B8"]).rename("NDWI")

water_mask = ndwi.gt(0.1)

# -----------------------------
# VECTORIZE WATER
# -----------------------------

water_vectors = water_mask.selfMask().reduceToVectors(
    geometry=region,
    scale=10,
    geometryType="polygon",
    reducer=ee.Reducer.countEvery(),
    maxPixels=1e10
)

# -----------------------------
# VERIFY WATER EXISTS
# -----------------------------

count = water_vectors.size().getInfo()

if count == 0:
    raise Exception("No water body detected near the provided coordinate.")

# -----------------------------
# COMPUTE AREA (WITH ERROR MARGIN) — FIXED
# -----------------------------

def add_area(feature):
    geom = feature.geometry()
    # FIX 1: Pass maxError as positional arg, not keyword 'errorMargin'
    area = geom.area(1)  # 1-metre error margin
    return feature.set({"area": area})

water_with_area = water_vectors.map(add_area)

largest = water_with_area.sort("area", False).first()

# FIX 2: Convert to geodesic=False to avoid geometry operation errors
geofence = ee.Feature(largest).geometry().transform(maxError=1)

# -----------------------------
# EXPORT GEOJSON
# -----------------------------

geojson = geemap.ee_to_geojson(geofence)

with open("water_geofence.geojson", "w") as f:
    json.dump(geojson, f, indent=4)

print("GeoJSON saved → water_geofence.geojson")

# -----------------------------
# CREATE MAP
# -----------------------------

Map = geemap.Map(center=[lat, lon], zoom=15)

Map.addLayer(
    sentinel,
    {"bands": ["B4", "B3", "B2"], "min": 0, "max": 3000},
    "Satellite"
)

Map.addLayer(
    ndwi,
    {"min": -1, "max": 1, "palette": ["brown", "white", "blue"]},
    "NDWI"
)

Map.addLayer(
    water_mask.selfMask(),
    {"palette": ["blue"]},
    "Detected Water"
)

Map.addLayer(
    geofence,
    {"color": "red"},
    "Water Geofence"
)

Map.addLayer(
    point,
    {"color": "yellow"},
    "Input Coordinate"
)

# -----------------------------
# SAVE INTERACTIVE MAP
# -----------------------------

Map.to_html("water_map.html")

print("Interactive map saved → water_map.html")