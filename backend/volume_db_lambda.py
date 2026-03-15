import json
from datetime import datetime, timedelta

def lambda_handler(event, context):
    """
    Return volumetric data with sustainability calculations
    Based on volume.py local calculations
    """
    
    # Handle CORS preflight
    if event.get('requestContext', {}).get('http', {}).get('method') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET, OPTIONS'
            },
            'body': ''
        }
    
    try:
        # Water body data from your volume.py calculation
        volume = 3401500  # cubic meters
        area = 680300     # square meters
        depth = 5         # meters
        population = 4200 # people
        
        # Constants (WHO standards) - same as volume.py
        WATER_CONSUMPTION_PER_PERSON_PER_DAY = 100  # liters
        EVAPORATION_RATE_MM_PER_DAY = 5  # mm/day
        SEEPAGE_LOSS_PERCENT = 2  # 2% daily
        SAFETY_MARGIN = 0.85  # Use only 85%
        
        # Calculate losses (same as volume.py)
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
        per_capita_daily = WATER_CONSUMPTION_PER_PERSON_PER_DAY
        
        # Stress level
        if per_capita_daily < 50:
            stress_level = "CRITICAL"
        elif per_capita_daily < 100:
            stress_level = "HIGH"
        elif per_capita_daily < 200:
            stress_level = "MODERATE"
        else:
            stress_level = "LOW"
        
        # Return data in format expected by frontend
        response_data = {
            # Raw values for calculations
            'volume': volume,
            'volume_m3': volume,
            'area': area,
            'area_m2': area,
            'depth': depth,
            'depth_m': depth,
            'population': population,
            
            # Formatted display values
            'currentVolume': f"{volume:,.0f} m³",
            'usableVolume': f"{usable_water_m3:,.0f} m³",
            'daysLeft': f"{days_left} days",
            'depletionDate': depletion_date,
            'populationDisplay': f"{population:,}",
            'perCapitaAvailability': f"{per_capita_daily:.1f} L/day",
            'dailyConsumption': f"{consumption_m3_per_day:,.1f} m³/day",
            'evaporationLoss': f"{evaporation_m3_per_day:.2f} m³/day",
            'seepageLoss': f"{seepage_m3_per_day:.2f} m³/day",
            'totalDailyLoss': f"{total_daily_loss_m3:.2f} m³/day",
            'stressLevel': stress_level,
            
            # Raw numbers for calculator
            'raw': {
                'volume_m3': volume,
                'area_m2': area,
                'depth_m': depth,
                'population': population,
                'days_remaining': days_left,
                'usable_m3': usable_water_m3,
                'consumption_per_day_m3': consumption_m3_per_day,
                'evaporation_per_day_m3': evaporation_m3_per_day,
                'seepage_per_day_m3': seepage_m3_per_day,
                'total_loss_per_day_m3': total_daily_loss_m3,
                'per_capita_liters': per_capita_daily
            }
        }
        
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Content-Type': 'application/json'
            },
            'body': json.dumps(response_data)
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET, OPTIONS'
            },
            'body': json.dumps({
                'error': str(e),
                'message': 'Failed to fetch volume data'
            })
        }
