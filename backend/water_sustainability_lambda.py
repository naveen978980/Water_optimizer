import json
import os
from datetime import datetime, timedelta

def lambda_handler(event, context):
    """
    Calculate water sustainability metrics based on volumetric data and population
    """
    
    # Handle CORS preflight
    if event.get('requestContext', {}).get('http', {}).get('method') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
            },
            'body': ''
        }
    
    try:
        # Parse request body
        body = json.loads(event.get('body', '{}'))
        
        # Input parameters
        water_volume_m3 = float(body.get('volume', 0))  # cubic meters
        area_m2 = float(body.get('area', 0))  # square meters
        depth_m = float(body.get('depth', 0))  # meters
        population = int(body.get('population', 4200))  # default from dashboard
        
        # Constants (WHO standards and environmental factors)
        WATER_CONSUMPTION_PER_PERSON_PER_DAY = 100  # liters (WHO basic access standard)
        EVAPORATION_RATE_MM_PER_DAY = 5  # mm/day (typical for Indian climate)
        SEEPAGE_LOSS_PERCENT = 2  # 2% daily seepage loss
        SAFETY_MARGIN = 0.85  # Use only 85% of available water
        
        # Calculate daily evaporation loss (cubic meters)
        evaporation_m3_per_day = (area_m2 * EVAPORATION_RATE_MM_PER_DAY / 1000) if area_m2 > 0 else 0
        
        # Calculate daily consumption (cubic meters)
        consumption_m3_per_day = (population * WATER_CONSUMPTION_PER_PERSON_PER_DAY) / 1000
        
        # Calculate daily seepage loss (cubic meters)
        seepage_m3_per_day = water_volume_m3 * (SEEPAGE_LOSS_PERCENT / 100)
        
        # Total daily loss
        total_daily_loss_m3 = consumption_m3_per_day + evaporation_m3_per_day + seepage_m3_per_day
        
        # Usable water volume (with safety margin)
        usable_water_m3 = water_volume_m3 * SAFETY_MARGIN
        
        # Calculate days until depletion
        if total_daily_loss_m3 > 0:
            days_left = int(usable_water_m3 / total_daily_loss_m3)
        else:
            days_left = 999  # Infinite if no consumption
        
        # Calculate depletion date
        depletion_date = (datetime.now() + timedelta(days=days_left)).strftime('%Y-%m-%d')
        
        # Calculate per capita availability (liters per person per day)
        per_capita_availability = (usable_water_m3 * 1000) / population if population > 0 else 0
        
        # Determine water stress level
        if per_capita_availability < 50:
            stress_level = "CRITICAL"
            stress_color = "#DC2626"
        elif per_capita_availability < 100:
            stress_level = "HIGH"
            stress_color = "#F59E0B"
        elif per_capita_availability < 200:
            stress_level = "MODERATE"
            stress_color = "#F59E0B"
        else:
            stress_level = "LOW"
            stress_color = "#10B981"
        
        # Calculate sustainability metrics
        response_data = {
            # Main metrics
            "daysLeft": f"{days_left} days",
            "depletionDate": depletion_date,
            "currentVolume": f"{water_volume_m3:,.0f} m³",
            "usableVolume": f"{usable_water_m3:,.0f} m³",
            
            # Population metrics
            "population": f"{population:,}",
            "perCapitaAvailability": f"{per_capita_availability:.1f} L/day",
            "dailyConsumption": f"{consumption_m3_per_day:,.1f} m³/day",
            
            # Loss metrics
            "evaporationLoss": f"{evaporation_m3_per_day:.2f} m³/day",
            "seepageLoss": f"{seepage_m3_per_day:.2f} m³/day",
            "totalDailyLoss": f"{total_daily_loss_m3:.2f} m³/day",
            
            # Stress assessment
            "stressLevel": stress_level,
            "stressColor": stress_color,
            
            # Raw values for calculations
            "raw": {
                "volume_m3": water_volume_m3,
                "usable_m3": usable_water_m3,
                "area_m2": area_m2,
                "depth_m": depth_m,
                "days_remaining": days_left,
                "consumption_per_day_m3": consumption_m3_per_day,
                "evaporation_per_day_m3": evaporation_m3_per_day,
                "seepage_per_day_m3": seepage_m3_per_day,
                "total_loss_per_day_m3": total_daily_loss_m3,
                "per_capita_liters": per_capita_availability
            },
            
            # Recommendations
            "recommendations": generate_recommendations(
                days_left,
                stress_level,
                per_capita_availability,
                consumption_m3_per_day
            )
        }
        
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
                'Content-Type': 'application/json'
            },
            'body': json.dumps(response_data)
        }
        
    except Exception as e:
        print(f"Error calculating sustainability: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
            },
            'body': json.dumps({
                'error': str(e),
                'message': 'Failed to calculate water sustainability'
            })
        }


def generate_recommendations(days_left, stress_level, per_capita, consumption):
    """Generate actionable recommendations based on water situation"""
    recommendations = []
    
    if days_left < 30:
        recommendations.append({
            "level": "URGENT",
            "icon": "🚨",
            "title": "Critical Water Shortage",
            "description": f"Only {days_left} days of water remaining. Implement immediate conservation measures."
        })
    elif days_left < 60:
        recommendations.append({
            "level": "WARNING",
            "icon": "⚠️",
            "title": "Water Supply Running Low",
            "description": "Consider water rationing and alternative sources."
        })
    else:
        recommendations.append({
            "level": "INFO",
            "icon": "✅",
            "title": "Water Supply Adequate",
            "description": f"Sufficient water for {days_left} days under current conditions."
        })
    
    if stress_level == "CRITICAL":
        recommendations.append({
            "level": "URGENT",
            "icon": "💧",
            "title": "Per Capita Below WHO Minimum",
            "description": f"Only {per_capita:.0f}L per person per day. WHO minimum is 50L."
        })
    
    if stress_level in ["HIGH", "CRITICAL"]:
        recommendations.append({
            "level": "ACTION",
            "icon": "🔧",
            "title": "Implement Conservation",
            "description": "Reduce consumption by 20-30% through rationing and awareness."
        })
        recommendations.append({
            "level": "ACTION",
            "icon": "🌊",
            "title": "Explore Alternative Sources",
            "description": "Investigate rainwater harvesting, groundwater recharge, or water tanker supply."
        })
    
    # Always include evaporation mitigation
    recommendations.append({
        "level": "INFO",
        "icon": "☀️",
        "title": "Reduce Evaporation Loss",
        "description": "Use floating covers or increase water depth to minimize evaporation."
    })
    
    return recommendations
