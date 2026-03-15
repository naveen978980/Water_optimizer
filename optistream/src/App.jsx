import { useCallback, useEffect, useState } from 'react'
import CitizenPortal from './components/CitizenPortal'
import FloodModeDashboard from './components/FloodModeDashboard'
import Footer from './components/Footer'
import HeroSection from './components/HeroSection'
import LoginPage from './components/LoginPage'
import MobileBottomNav from './components/MobileBottomNav'
import NavigationBar from './components/NavigationBar'
import SignupPage from './components/SignupPage'
import SustainabilityModeDashboard from './components/SustainabilityModeDashboard'
import WaterBodyMap from './components/WaterBodyMap'
import { LAMBDA } from './config/lambdaUrls'
import { THEMES } from './config/themes'

async function apiFetch(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`API ${res.status}: ${url}`)
  return res.json()
}

// Helper to match volume data by location
function getLocationVolumeData(volumeData, locationId) {
  if (!volumeData) return null;
  
  console.log('🔍 getLocationVolumeData called with:', { volumeData, locationId });
  
  // If volumeData is an object with direct properties
  if (volumeData.volume || volumeData.volume_m3 || volumeData.area || volumeData.area_m2) {
    console.log('✅ Found direct volume properties');
    return volumeData;
  }
  
  // If volumeData has a body property (Lambda response)
  if (volumeData.body) {
    try {
      const parsed = typeof volumeData.body === 'string' ? JSON.parse(volumeData.body) : volumeData.body;
      console.log('✅ Parsed body:', parsed);
      return getLocationVolumeData(parsed, locationId);
    } catch (e) {
      console.error('❌ Failed to parse body:', e);
    }
  }
  
  // If volumeData is an array, find by location
  if (Array.isArray(volumeData)) {
    console.log('✅ volumeData is array, length:', volumeData.length);
    const match = volumeData.find(v => 
      v.location === locationId || 
      v.location_id === locationId || 
      v.id === locationId
    );
    const result = match || volumeData[0];
    console.log('✅ Array match result:', result);
    return result;
  }
  
  // If volumeData has nested structure
  if (volumeData.locations && Array.isArray(volumeData.locations)) {
    console.log('✅ Found locations array');
    const match = volumeData.locations.find(v => 
      v.location === locationId || 
      v.location_id === locationId || 
      v.id === locationId
    );
    return match || volumeData.locations[0];
  }
  
  // If volumeData has a data property
  if (volumeData.data) {
    console.log('✅ Found data property');
    return getLocationVolumeData(volumeData.data, locationId);
  }
  
  // If volumeData has an Items property (DynamoDB)
  if (volumeData.Items && Array.isArray(volumeData.Items)) {
    console.log('✅ Found DynamoDB Items');
    const match = volumeData.Items.find(v => 
      v.location === locationId || 
      v.location_id === locationId || 
      v.id === locationId
    );
    return match || volumeData.Items[0];
  }
  
  console.log('⚠️ No matching pattern found, returning original data');
  return volumeData;
}

function App() {
  const [activeView, setActiveView] = useState('home')
  const [season, setSeason] = useState('monsoon')

  // ── Shared ──────────────────────────────────────────────────────────────
  const [locations, setLocations] = useState([])
  const [selectedLocation, setSelectedLocation] = useState(null)

  // ── Flood view ──────────────────────────────────────────────────────────
  const [gaugeData, setGaugeData] = useState(null)
  const [weatherAlert, setWeatherAlert] = useState(null)
  const [floodZones, setFloodZones] = useState([])

  // ── Citizen view ────────────────────────────────────────────────────────
  const [citizenProfile, setCitizenProfile] = useState(null)
  const [mission, setMission] = useState(null)

  // ── Sustainability view ─────────────────────────────────────────────────
  const [sustainabilityMetrics, setSustainabilityMetrics] = useState({
    currentVolume: 'Loading...',
    population: 'Loading...',
    evaporationLoss: 'Loading...',
    volume: 0,
    area: 0,
    depth: 0,
    populationNum: 4200
  })
  const [autonomy, setAutonomy] = useState({
    daysLeft: 'Loading...',
    capacityPercent: 0
  })
  const [qualityAgent, setQualityAgent] = useState({
    message: 'Loading water quality data...'
  })

  const [infraAgent, setInfraAgent] = useState({
    title: 'Infrastructure Assessment',
    description: 'Loading infrastructure data...'
  })
  const [waterSustainability, setWaterSustainability] = useState(null)
  const [volumeData, setVolumeData] = useState(null)

  // ── Fetch volumetric data from database ──────────────────────────────────
  useEffect(() => {
    const fetchVolumeData = async () => {
      try {
        // Check if WATER_SUSTAINABILITY Lambda is configured
        const isSustainabilityConfigured = LAMBDA.WATER_SUSTAINABILITY && 
                                           !LAMBDA.WATER_SUSTAINABILITY.includes('YOUR_') &&
                                           !LAMBDA.WATER_SUSTAINABILITY.includes('LAMBDA_URL_HERE');
        
        const response = await fetch(LAMBDA.VOLUME_DB);
        if (response.ok) {
          const data = await response.json();
          console.log('📊 Volume data from DB:', data);
          setVolumeData(data);
          
          // Match data to selected location
          const locationData = getLocationVolumeData(data, selectedLocation);
          
          console.log('📍 Location-matched volume data:', locationData);
          
          // Use pre-calculated data from volume.py (via VOLUME_DB Lambda)
          if (locationData) {
            console.log('📊 Using volume.py pre-calculated data');
            
            // Extract raw numeric values
            const volume = parseFloat(locationData.volume || locationData.volume_m3 || 0);
            const area = parseFloat(locationData.area || locationData.area_m2 || 0);
            const depth = parseFloat(locationData.depth || locationData.depth_m || 5);
            const population = parseInt(locationData.population || 4200);
            
            console.log('🔢 Extracted values:', { volume, area, depth, population });
            
            // Check if locationData already has pre-calculated sustainability metrics
            if (locationData.daysLeft || locationData.raw) {
              // Use pre-calculated data from volume.py Lambda
              console.log('✅ Using pre-calculated sustainability from volume.py');
              
              setWaterSustainability(locationData);
              
              // Extract days value (could be "40 days" or raw number)
              const daysValue = locationData.raw?.days_remaining || 
                               parseInt(String(locationData.daysLeft).match(/\d+/)?.[0] || 0);
              
              setAutonomy({
                daysLeft: locationData.daysLeft || `${daysValue} days`,
                capacityPercent: Math.min(100, Math.round((daysValue / 365) * 100))
              });
              
              // Use formatted strings from volume.py calculation
              setSustainabilityMetrics({
                currentVolume: locationData.currentVolume || `${(volume / 1000000).toFixed(2)} M m³`,
                population: locationData.populationDisplay || population.toLocaleString(),
                evaporationLoss: locationData.evaporationLoss || `${(area * 0.005 / 1000).toFixed(2)} m³/day`,
                volume: volume,
                area: area,
                depth: depth,
                populationNum: population
              });
              
              console.log('✅ Metrics set from volume.py:', {
                currentVolume: locationData.currentVolume,
                daysLeft: locationData.daysLeft,
                stressLevel: locationData.stressLevel
              });
            } else if (volume > 0) {
              // Fall back to basic display if no pre-calculated data
              console.warn('⚠️ No pre-calculated data, showing basic metrics');
              
              setSustainabilityMetrics({
                currentVolume: `${(volume / 1000000).toFixed(2)} M m³`,
                population: population.toLocaleString(),
                evaporationLoss: `${(area * 0.005 / 1000).toFixed(2)} m³/day`,
                volume: volume,
                area: area,
                depth: depth,
                populationNum: population
              });
              
              setAutonomy({
                daysLeft: '—',
                capacityPercent: 75
              });
            } else {
              console.warn('⚠️ No valid volume data found (volume is 0 or missing)');
              console.warn('⚠️ LocationData received:', locationData);
              
              // Try to show whatever data we have
              const hasAnyData = area > 0 || depth > 0 || population > 0;
              
              if (hasAnyData) {
                setSustainabilityMetrics({
                  currentVolume: volume > 0 ? `${(volume / 1000000).toFixed(2)} M m³` : 'Not available',
                  population: population > 0 ? population.toLocaleString() : 'Not available',
                  evaporationLoss: area > 0 ? `${(area * 0.005 / 1000).toFixed(2)} m³/day` : 'Not available',
                  volume: volume,
                  area: area,
                  depth: depth,
                  populationNum: population
                });
                setAutonomy({
                  daysLeft: 'Data incomplete',
                  capacityPercent: 0
                });
              } else {
                // No data available
                console.log('ℹ️ No volume data available from database');
                
                setSustainabilityMetrics({
                  currentVolume: 'Not available',
                  population: 'Not available',
                  evaporationLoss: 'Not available',
                  volume: 0,
                  area: 0,
                  depth: 0,
                  populationNum: 0
                });
                setAutonomy({
                  daysLeft: 'Not available',
                  capacityPercent: 0
                });
              }
            }
          }
        }
      } catch (error) {
        console.error('❌ Error fetching volume data:', error);
        
        // Use local volume.py calculation data as fallback
        console.log('📊 Using local volume.py calculation data');
        
        const fallbackData = {
          volume: 3401500,
          area: 680300,
          depth: 5,
          population: 4200,
          currentVolume: '3,401,500 m³',
          usableVolume: '2,891,275 m³',
          daysLeft: '40 days',
          depletionDate: '2026-04-17',
          populationDisplay: '4,200',
          perCapitaAvailability: '100.0 L/day',
          dailyConsumption: '420.0 m³/day',
          evaporationLoss: '3401.50 m³/day',
          seepageLoss: '68030.00 m³/day',
          totalDailyLoss: '71851.50 m³/day',
          stressLevel: 'MODERATE',
          raw: {
            volume_m3: 3401500,
            area_m2: 680300,
            depth_m: 5,
            population: 4200,
            days_remaining: 40,
            usable_m3: 2891275,
            consumption_per_day_m3: 420.0,
            evaporation_per_day_m3: 3401.50,
            seepage_per_day_m3: 68030.00,
            total_loss_per_day_m3: 71851.50,
            per_capita_liters: 100.0
          }
        };
        
        setWaterSustainability(fallbackData);
        
        setSustainabilityMetrics({
          currentVolume: '3.40 M m³',
          population: '4,200',
          evaporationLoss: '3.40 m³/day',
          volume: 3401500,
          area: 680300,
          depth: 5,
          populationNum: 4200
        });
        
        setAutonomy({
          daysLeft: '40 days',
          capacityPercent: 11  // 40/365 * 100 ≈ 11%
        });
      }
    };
    
    fetchVolumeData();
  }, [selectedLocation]); // Re-fetch when location changes

  // ── On mount: fetch all static data from Lambda ─────────────────────────
  useEffect(() => {
    apiFetch(LAMBDA.LOCATIONS).then((data) => {
      setLocations(data)
      if (data.length > 0) setSelectedLocation(data[0].id)
    }).catch(err => console.error('Error fetching locations:', err))
    
    apiFetch(LAMBDA.CITIZEN_PROFILE).then(setCitizenProfile).catch(err => console.error('Error fetching citizen profile:', err))
    apiFetch(LAMBDA.MISSION).then(setMission).catch(err => console.error('Error fetching mission:', err))
    apiFetch(LAMBDA.WEATHER_ALERT).then(setWeatherAlert).catch(err => console.error('Error fetching weather:', err))
    apiFetch(LAMBDA.FLOOD_ZONES).then(setFloodZones).catch(err => console.error('Error fetching flood zones:', err))
    
    // Fetch quality and infra agents with defaults
    apiFetch(LAMBDA.QUALITY_AGENT).then(setQualityAgent).catch(err => {
      console.error('Error fetching quality agent:', err)
      setQualityAgent({ message: 'Monitoring water quality parameters...' })
    })
    apiFetch(LAMBDA.INFRA_AGENT).then(setInfraAgent).catch(err => {
      console.error('Error fetching infra agent:', err)
      setInfraAgent({ title: 'Infrastructure Assessment', description: 'Analyzing water infrastructure needs...' })
    })
  }, [])

  // ── Re-fetch gauge whenever selected location changes ────────────────────
  useEffect(() => {
    if (!selectedLocation) return
    setGaugeData(null)
    apiFetch(`${LAMBDA.GAUGE}?location=${selectedLocation}`).then(setGaugeData)
  }, [selectedLocation])

  // ── GeoJSON download uses data returned by the infra Lambda ─────────────
  const handleDownloadGeoJSON = useCallback(() => {
    if (!infraAgent?.geojson) return
    const blob = new Blob([JSON.stringify(infraAgent.geojson, null, 2)], { type: 'application/geo+json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'optistream-recharge-site.geojson'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [infraAgent])

  const renderActiveView = () => {
    if (activeView === 'login') return <LoginPage onNavigate={setActiveView} />
    if (activeView === 'signup') return <SignupPage onNavigate={setActiveView} />

    if (activeView === 'home') {
      return (
        <>
          <HeroSection onGetStarted={setActiveView} season={season} onSeasonChange={setSeason} />
          <Footer />
        </>
      )
    }

    if (activeView === 'flood') {
      return (
        <FloodModeDashboard
          locations={locations}
          selectedLocation={selectedLocation}
          onLocationChange={setSelectedLocation}
          liveAnalytics={gaugeData}
          weatherAlert={weatherAlert}
          floodZones={floodZones}
        />
      )
    }

    if (activeView === 'watermap') return <WaterBodyMap />

    if (activeView === 'sustainability') {
      return (
        <SustainabilityModeDashboard
          metrics={sustainabilityMetrics}
          autonomy={autonomy}
          qualityAgent={qualityAgent}
          infraAgent={infraAgent}
          waterSustainability={waterSustainability}
          onDownloadGeoJSON={handleDownloadGeoJSON}
        />
      )
    }

    return <CitizenPortal profile={citizenProfile} mission={mission} uploadUrl={LAMBDA.GAUGE_UPLOAD} waterBodyUploadUrl={LAMBDA.WATER_BODY_UPLOAD} />
  }

  if (activeView === 'login' || activeView === 'signup') {
    return <main style={{ fontFamily: "'Poppins', sans-serif" }}>{renderActiveView()}</main>
  }

  return (
    <div style={{ minHeight: '100vh', background: THEMES[season].bg, fontFamily: "'Poppins', sans-serif", display: 'flex', flexDirection: 'column' }}>
      <NavigationBar activeView={activeView} onChange={setActiveView} season={season} />
      <main style={{ flex: 1, paddingBottom: 'max(70px, env(safe-area-inset-bottom))' }}>{renderActiveView()}</main>
      <MobileBottomNav activeView={activeView} onChange={setActiveView} season={season} />
    </div>
  )
}

export default App
