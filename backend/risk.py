import rasterio
import numpy as np
import folium
from rasterio.windows import Window
from skimage.measure import label
from shapely.geometry import MultiPoint
import branca.colormap as cm

# -----------------------------
# INPUT LOCATION
# -----------------------------
lat = 13.14679
lon = 80.21152

# -----------------------------
# LOAD AND CROP DEM
# -----------------------------
with rasterio.open("dem.tif") as src:

    row, col = src.index(lon, lat)

    radius = 200

    window = Window(col-radius, row-radius, radius*2, radius*2)

    dem = src.read(1, window=window).astype("float32")

    transform = src.window_transform(window)

# remove invalid values
dem[dem < -100] = np.nan

# -----------------------------
# TERRAIN ANALYSIS
# -----------------------------
dx, dy = np.gradient(dem)

slope = np.sqrt(dx**2 + dy**2)

low_elev = np.nanpercentile(dem, 40)

risk = (dem < low_elev) & (slope < 1)

print("Risk cells:", np.sum(risk))

# -----------------------------
# GROUP INTO ZONES
# -----------------------------
labels = label(risk)

zones = []

for zone_id in np.unique(labels):

    if zone_id == 0:
        continue

    rows, cols = np.where(labels == zone_id)

    if len(rows) < 30:
        continue

    coords = []
    depths = []

    for r, c in zip(rows, cols):

        x = transform[2] + c * transform[0]
        y = transform[5] + r * transform[4]

        coords.append((x, y))

        depth = low_elev - dem[r, c]
        depths.append(depth)

    avg_depth = float(np.mean(depths))

    score = min(1.0, len(rows)/150)

    zones.append((coords, avg_depth, score))

# -----------------------------
# CREATE MAP
# -----------------------------
m = folium.Map(location=[lat, lon], zoom_start=14)

folium.Marker([lat, lon], popup="Lake").add_to(m)

colormap = cm.LinearColormap(
    ['green','yellow','red'],
    vmin=0,
    vmax=1
)

# -----------------------------
# DRAW ZONES
# -----------------------------
for coords, depth, score in zones:

    poly = MultiPoint(coords).convex_hull

    color = colormap(score)

    tooltip = f"""
Flood Risk Score: {score:.2f}
Estimated Flood Depth: {depth:.2f} m
"""

    folium.GeoJson(
        data=poly.__geo_interface__,
        style_function=lambda x, col=color: {
            "fillColor": col,
            "color": col,
            "weight": 2,
            "fillOpacity": 0.5
        },
        tooltip=tooltip
    ).add_to(m)

colormap.caption = "Flood Risk Level"
colormap.add_to(m)

m.save("flood_zones_map_v2.html")

print("Map saved → flood_zones_map_v2.html")