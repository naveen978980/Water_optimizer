import re, json

with open(r'C:\Users\navee\Desktop\aws front\tantris-aws\backend\flood_zones_map_v2.html', encoding='utf-8') as f:
    html = f.read()

features_raw = re.findall(r'geo_json_[a-f0-9]+_add\((\{"features".*?"FeatureCollection"\})\)', html, re.DOTALL)
colors = re.findall(r'"fillColor": "(#[a-f0-9]+ff?)"', html)
scores = re.findall(r'Flood Risk Score: ([0-9.]+)', html)
depths = re.findall(r'Estimated Flood Depth: ([0-9.]+) m', html)

print(f'Features: {len(features_raw)}, Colors: {len(colors)}, Scores: {len(scores)}, Depths: {len(depths)}')

zones = []
for i, feat_str in enumerate(features_raw):
    try:
        feat = json.loads(feat_str)
        coords = feat['features'][0]['geometry']['coordinates'][0]
        zones.append({
            'color': colors[i] if i < len(colors) else '#cccc00ff',
            'score': float(scores[i]) if i < len(scores) else 0,
            'depth': float(depths[i]) if i < len(depths) else 0,
            'coords': coords
        })
    except Exception as e:
        print(f'Zone {i} error: {e}')

out_path = r'C:\Users\navee\Desktop\aws front\tantris-aws\optistream\src\data\floodZones.json'
import os; os.makedirs(os.path.dirname(out_path), exist_ok=True)
with open(out_path, 'w') as f:
    json.dump(zones, f)
print(f'Wrote {len(zones)} zones to {out_path}')
