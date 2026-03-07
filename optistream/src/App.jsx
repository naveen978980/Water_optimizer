import { useMemo, useState } from 'react'
import CitizenPortal from './components/CitizenPortal'
import FloodModeDashboard from './components/FloodModeDashboard'
import NavigationBar from './components/NavigationBar'
import SustainabilityModeDashboard from './components/SustainabilityModeDashboard'

function App() {
  const [activeView, setActiveView] = useState('citizen')

  // Mock API data and state hooks until AWS backend endpoints are ready.
  const [locations] = useState([
    { id: 'chennai-central', label: 'Chennai Central Basin' },
    { id: 'kuthambakkam', label: 'Kuthambakkam Lake Cluster' },
    { id: 'cooum-river', label: 'Cooum River Corridor' },
  ])

  const [selectedLocation, setSelectedLocation] = useState(locations[1].id)

  const gaugeByLocation = useMemo(
    () => ({
      'chennai-central': { currentGauge: '2.6m', trend: 'Rising 0.2m / 3h', lastUpdated: '09:15 IST' },
      kuthambakkam: { currentGauge: '3.2m', trend: 'Rising 0.4m / 3h', lastUpdated: '09:22 IST' },
      'cooum-river': { currentGauge: '1.9m', trend: 'Stable', lastUpdated: '09:17 IST' },
    }),
    [],
  )

  const [citizenProfile] = useState({
    greeting: 'Welcome, Citizen #4092',
    trustScore: '4.8/5 Stars',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=180&q=80',
  })

  const [mission] = useState({
    title: 'Kuthambakkam Lake Monitor',
    status: 'Pre-Monsoon Alert Active',
    bounty: '+50 Water Points',
  })

  const [uploadResultTemplate] = useState({
    level: '3.2m',
    location: 'Kuthambakkam Gauge Station (GPS lock ±6m)',
  })

  const [weatherAlert] = useState({
    message: 'Heavy Rain Expected in 48 hrs. EventBridge Re-check scheduled.',
    schedule: 'Next weather model refresh in 20 minutes',
  })

  const [floodZones] = useState([
    {
      id: 'zone-yellow',
      stroke: '#facc15',
      fill: '#fde047',
      coordinates: [
        [13.0868, 80.263],
        [13.0877, 80.275],
        [13.0791, 80.2792],
        [13.0769, 80.2688],
      ],
    },
    {
      id: 'zone-orange',
      stroke: '#f97316',
      fill: '#fb923c',
      coordinates: [
        [13.0762, 80.2624],
        [13.0731, 80.2734],
        [13.0675, 80.2711],
        [13.0697, 80.2598],
      ],
    },
    {
      id: 'zone-red',
      stroke: '#ef4444',
      fill: '#f87171',
      coordinates: [
        [13.0914, 80.2861],
        [13.087, 80.295],
        [13.0792, 80.2915],
        [13.0817, 80.281],
      ],
    },
  ])

  const [sustainabilityMetrics] = useState({
    currentVolume: '12.4M Liters',
    population: '4,200',
    evaporationLoss: '4% Daily',
  })

  const [autonomy] = useState({
    daysLeft: '21 DAYS',
    capacityPercent: 30,
  })

  const [qualityAgent] = useState({
    message: 'High Turbidity Detected. TDS exceeds CPCB limits. Verdict: NON-POTABLE.',
  })

  const [infraAgent] = useState({
    title: 'Pit Creation Recommended',
    description:
      'Optimal Recharge Site Detected. Slope: 2.4%, Soil: Clay. Prescription: Construct 20m x 20m Farm Pond to extend autonomy by +8 Days.',
  })

  const handleDownloadGeoJSON = () => {
    const geoJson = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {
            recommendation: 'Farm Pond',
            slope: '2.4%',
            soil: 'Clay',
            impact: '+8 Days',
          },
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [80.2569, 13.0912],
                [80.2603, 13.0912],
                [80.2603, 13.0881],
                [80.2569, 13.0881],
                [80.2569, 13.0912],
              ],
            ],
          },
        },
      ],
    }

    const blob = new Blob([JSON.stringify(geoJson, null, 2)], { type: 'application/geo+json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'optistream-recharge-site.geojson'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const renderActiveView = () => {
    if (activeView === 'flood') {
      return (
        <FloodModeDashboard
          locations={locations}
          selectedLocation={selectedLocation}
          onLocationChange={setSelectedLocation}
          liveAnalytics={gaugeByLocation[selectedLocation]}
          weatherAlert={weatherAlert}
          floodZones={floodZones}
        />
      )
    }

    if (activeView === 'sustainability') {
      return (
        <SustainabilityModeDashboard
          metrics={sustainabilityMetrics}
          autonomy={autonomy}
          qualityAgent={qualityAgent}
          infraAgent={infraAgent}
          onDownloadGeoJSON={handleDownloadGeoJSON}
        />
      )
    }

    return <CitizenPortal profile={citizenProfile} mission={mission} uploadResultTemplate={uploadResultTemplate} />
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <NavigationBar activeView={activeView} onChange={setActiveView} />
      <main>{renderActiveView()}</main>
    </div>
  )
}

export default App
