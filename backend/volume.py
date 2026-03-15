import json
import requests
from shapely.geometry import shape
from shapely.ops import transform
import pyproj


# Lambda URLs
VOLUME_LAMBDA_URL = "https://qtsykkghnbzrktvuy7kmyjndn40culev.lambda-url.us-east-1.on.aws/"
SUSTAINABILITY_LAMBDA_URL = "NOT_DEPLOYED"  # Will calculate locally


def calculate_sustainability_local(volume, area, depth, population):
    """Calculate sustainability metrics locally if Lambda is not available"""
    from datetime import datetime, timedelta
    
    # Constants (WHO standards)
    WATER_CONSUMPTION_PER_PERSON_PER_DAY = 100  # liters
    EVAPORATION_RATE_MM_PER_DAY = 5  # mm/day
    SEEPAGE_LOSS_PERCENT = 2  # 2% daily
    SAFETY_MARGIN = 0.85  # Use only 85%
    
    # Calculate losses
    evaporation_m3_per_day = (area * EVAPORATION_RATE_MM_PER_DAY / 1000) if area > 0 else 0
    consumption_m3_per_day = (population * WATER_CONSUMPTION_PER_PERSON_PER_DAY) / 1000
    seepage_m3_per_day = volume * (SEEPAGE_LOSS_PERCENT / 100)
    total_daily_loss_m3 = consumption_m3_per_day + evaporation_m3_per_day + seepage_m3_per_day
    
    # Usable water
    usable_water_m3 = volume * SAFETY_MARGIN
    
    # Days remaining
    if total_daily_loss_m3 > 0:
        days_left = int(usable_water_m3 / total_daily_loss_m3)
    else:
        days_left = 999
    
    depletion_date = (datetime.now() + timedelta(days=days_left)).strftime('%Y-%m-%d')
    
    # Per capita is daily consumption per person (not total)
    per_capita_daily = WATER_CONSUMPTION_PER_PERSON_PER_DAY  # 100 L/person/day
    
    # Stress level based on WHO standards
    if per_capita_daily < 50:
        stress_level = "CRITICAL"
    elif per_capita_daily < 100:
        stress_level = "HIGH"
    elif per_capita_daily < 200:
        stress_level = "MODERATE"
    else:
        stress_level = "LOW"
    
    return {
        'currentVolume': f"{volume:,.0f} m³",
        'usableVolume': f"{usable_water_m3:,.0f} m³",
        'daysLeft': f"{days_left} days",
        'depletionDate': depletion_date,
        'population': f"{population:,}",
        'perCapitaAvailability': f"{per_capita_daily:.1f} L/day",
        'dailyConsumption': f"{consumption_m3_per_day:,.1f} m³/day",
        'evaporationLoss': f"{evaporation_m3_per_day:.2f} m³/day",
        'seepageLoss': f"{seepage_m3_per_day:.2f} m³/day",
        'totalDailyLoss': f"{total_daily_loss_m3:.2f} m³/day",
        'stressLevel': stress_level,
        'raw': {
            'volume_m3': volume,
            'area_m2': area,
            'depth_m': depth,
            'days_remaining': days_left,
            'per_capita_liters': per_capita_daily
        }
    }


def calculate_volume_from_geojson(geojson_path, depth, population=4200):

    # Load geojson
    with open(geojson_path) as f:
        data = json.load(f)

    # Convert GeoJSON geometry to shapely object
    polygon = shape(data)

    print("Polygon Coordinates (first few):")
    print(list(polygon.geoms[0].exterior.coords)[:5])

    # Convert lat/lon to meters
    project = pyproj.Transformer.from_crs(
        "EPSG:4326",
        "EPSG:32644",
        always_xy=True
    ).transform

    polygon_m = transform(project, polygon)

    # Handle MultiPolygon
    area = 0
    for poly in polygon_m.geoms:
        area += poly.area

    # Volume
    volume = area * depth

    print("\nSurface Area (sq meters):", area)
    print("Average Depth (meters):", depth)
    print("Estimated Volume (cubic meters):", volume)

    # Send data to Volume Lambda
    payload = {
        "area": area,
        "depth": depth,
        "volume": volume
    }

    response = requests.post(
        VOLUME_LAMBDA_URL,
        json=payload
    )

    print("\n=== Volume Lambda Response ===")
    print(response.text)
    
    # Calculate Water Sustainability
    print("\n=== Calculating Water Sustainability ===")
    sustainability_payload = {
        "volume": volume,
        "area": area,
        "depth": depth,
        "population": population
    }
    
    try:
        # Check if Lambda is deployed
        if SUSTAINABILITY_LAMBDA_URL and "NOT_DEPLOYED" not in SUSTAINABILITY_LAMBDA_URL:
            sustainability_response = requests.post(
                SUSTAINABILITY_LAMBDA_URL,
                json=sustainability_payload
            )
            
            if sustainability_response.status_code == 200:
                sustainability_data = sustainability_response.json()
            else:
                print(f"❌ Lambda failed, calculating locally...")
                sustainability_data = calculate_sustainability_local(volume, area, depth, population)
        else:
            print("📊 Calculating locally (Lambda not deployed)...")
            sustainability_data = calculate_sustainability_local(volume, area, depth, population)
        
        print("\n🌊 WATER SUSTAINABILITY ANALYSIS 🌊")
        print("=" * 60)
        print(f"📊 Water Volume: {sustainability_data['currentVolume']}")
        print(f"🔰 Usable Volume (85% safety): {sustainability_data['usableVolume']}")
        print(f"👥 Population Served: {sustainability_data['population']}")
        print(f"⏰ Days Until Depletion: {sustainability_data['daysLeft']}")
        print(f"📅 Estimated Depletion Date: {sustainability_data['depletionDate']}")
        print(f"💧 Per Capita Availability: {sustainability_data['perCapitaAvailability']}")
        print(f"📉 Daily Consumption: {sustainability_data['dailyConsumption']}")
        print(f"☀️ Evaporation Loss: {sustainability_data['evaporationLoss']}")
        print(f"💦 Seepage Loss: {sustainability_data['seepageLoss']}")
        print(f"📊 Total Daily Loss: {sustainability_data['totalDailyLoss']}")
        print(f"🌡️ Water Stress Level: {sustainability_data['stressLevel']}")
        print("=" * 60)
        
        if sustainability_data.get('recommendations'):
            print("\n📋 RECOMMENDATIONS:")
            for i, rec in enumerate(sustainability_data.get('recommendations', []), 1):
                print(f"\n{i}. {rec['icon']} {rec['title']} [{rec['level']}]")
                print(f"   {rec['description']}")
        
        return sustainability_data
            
    except Exception as e:
        print(f"⚠️ Error: {str(e)}")
        print("📊 Falling back to local calculation...")
        sustainability_data = calculate_sustainability_local(volume, area, depth, population)
        
        print("\n🌊 WATER SUSTAINABILITY ANALYSIS 🌊")
        print("=" * 60)
        print(f"📊 Water Volume: {sustainability_data['currentVolume']}")
        print(f"🔰 Usable Volume (85% safety): {sustainability_data['usableVolume']}")
        print(f"👥 Population Served: {sustainability_data['population']}")
        print(f"⏰ Days Until Depletion: {sustainability_data['daysLeft']}")
        print(f"📅 Estimated Depletion Date: {sustainability_data['depletionDate']}")
        print(f"💧 Per Capita Availability: {sustainability_data['perCapitaAvailability']}")
        print(f"🌡️ Water Stress Level: {sustainability_data['stressLevel']}")
        print("=" * 60)
        
        return sustainability_data


if __name__ == "__main__":
    geojson_path = "water_geofence.geojson"
    depth = 5  # meters
    population = 4200  # people served by this water body

    calculate_volume_from_geojson(geojson_path, depth, population)