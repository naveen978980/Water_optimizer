import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import { LAMBDA } from '../config/lambdaUrls'
import { Download } from 'lucide-react'

// ── Extracted from water_map.html (geemap / Google Earth Engine export) ──────
const MAP_CENTER = [13.14679, 80.21152]
const MAP_ZOOM = 15

const GEE_LAYERS = [
  {
    id: 'satellite',
    name: 'Satellite',
    emoji: '🛰️',
    color: '#6366f1',
    desc: 'Google Earth Engine true-colour satellite imagery',
    url: 'https://earthengine.googleapis.com/v1/projects/water-geofence-project/maps/af23412b82492155f76640244f7cf774-97005fe27b2c1a0d87dcbe097ea6519c/tiles/{z}/{x}/{y}',
    defaultOn: true,
  },
  {
    id: 'ndwi',
    name: 'NDWI',
    emoji: '💧',
    color: '#0ea5e9',
    desc: 'Normalised Difference Water Index — blue = high water content',
    url: 'https://earthengine.googleapis.com/v1/projects/water-geofence-project/maps/fec16e5f7069c80979371e3079c61000-ffec0c1c3d364c0a828dff2eeccc7da0/tiles/{z}/{x}/{y}',
    defaultOn: true,
  },
  {
    id: 'detected_water',
    name: 'Detected Water',
    emoji: '🌊',
    color: '#1FA6C9',
    desc: 'Binary water / non-water mask derived from NDWI threshold',
    url: 'https://earthengine.googleapis.com/v1/projects/water-geofence-project/maps/e45b4e8a6053f6fbf97fed215bb158be-cd2b44c4fcd768991020a434005a58be/tiles/{z}/{x}/{y}',
    defaultOn: true,
  },
  {
    id: 'water_geofence',
    name: 'Water Geofence',
    emoji: '📍',
    color: '#f97316',
    desc: 'Buffered geofence boundary around the detected water region',
    url: 'https://earthengine.googleapis.com/v1/projects/water-geofence-project/maps/bdf03681e42d0e81a9d9fc04757fc2f2-c433c4e1655a099f33b093964ac21579/tiles/{z}/{x}/{y}',
    defaultOn: true,
  },
  {
    id: 'input_coord',
    name: 'Input Coordinate',
    emoji: '🎯',
    color: '#ef4444',
    desc: 'Source coordinate used to seed the water-body detection',
    url: 'https://earthengine.googleapis.com/v1/projects/water-geofence-project/maps/0d61623675361623b7c172dbc1a0fdef-989cca8252dcd05dd050bcdc8fa51c28/tiles/{z}/{x}/{y}',
    defaultOn: true,
  },
]

const GRAD = 'linear-gradient(135deg, #1FA6C9 0%, #0A5F8C 100%)'

function LayerToggle({ layer, visible, onToggle }) {
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        cursor: 'pointer',
        padding: '10px 12px',
        borderRadius: 10,
        border: `1.5px solid ${visible ? layer.color + '55' : '#eef1f3'}`,
        background: visible ? layer.color + '0d' : '#fafafa',
        transition: 'all 0.18s',
      }}
    >
      <input
        type="checkbox"
        checked={visible}
        onChange={onToggle}
        style={{ marginTop: 3, accentColor: layer.color, width: 15, height: 15, flexShrink: 0 }}
      />
      <div>
        <p style={{ color: '#1A1A1A', fontSize: 13, fontWeight: 600, lineHeight: 1.2 }}>
          <span style={{ marginRight: 5 }}>{layer.emoji}</span>
          {layer.name}
        </p>
        <p style={{ color: '#5E6B73', fontSize: 11, marginTop: 3, lineHeight: 1.5 }}>{layer.desc}</p>
      </div>
    </label>
  )
}

function WaterBodyMap() {
  const initialState = Object.fromEntries(GEE_LAYERS.map((l) => [l.id, l.defaultOn]))
  const [visible, setVisible] = useState(initialState)
  const [volumeData, setVolumeData] = useState(null)
  const [loading, setLoading] = useState(true)

  const toggle = (id) => setVisible((prev) => ({ ...prev, [id]: !prev[id] }))

  const activeCount = Object.values(visible).filter(Boolean).length

  // Fetch volume data from Lambda
  useEffect(() => {
    const fetchVolumeData = async () => {
      try {
        console.log('🗺️ Fetching volume data for map visualization...')
        const response = await fetch(LAMBDA.VOLUME_DB)
        const data = await response.json()
        console.log('🗺️ Volume data received:', data)

        // Handle different response formats
        let parsed = data
        if (data.body) {
          parsed = typeof data.body === 'string' ? JSON.parse(data.body) : data.body
        }
        if (parsed.Items && Array.isArray(parsed.Items)) {
          parsed = parsed.Items[0] // Use first item
        }
        if (Array.isArray(parsed)) {
          parsed = parsed[0] // Use first item
        }

        setVolumeData(parsed)
        console.log('✅ Volume data set:', parsed)
      } catch (error) {
        console.error('❌ Error fetching volume data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchVolumeData()
  }, [])

  // Extract values from volumeData
  const extractValue = (data, keys) => {
    if (!data) return null
    for (const key of keys) {
      if (data[key] !== undefined && data[key] !== null) return data[key]
    }
    return null
  }

  const volume = extractValue(volumeData, ['volume', 'volume_m3', 'volume_cubic_meters', 'waterVolume', 'total_volume'])
  const area = extractValue(volumeData, ['area', 'area_m2', 'surface_area', 'surfaceArea'])
  const depth = extractValue(volumeData, ['depth', 'depth_m', 'avg_depth', 'average_depth'])
  const population = extractValue(volumeData, ['population', 'people', 'served_population', 'local_population'])
  const geojson = extractValue(volumeData, ['geometry', 'geojson', 'geoJson', 'geo', 'coordinates'])

  // Download GeoJSON function
  const downloadGeoJSON = () => {
    if (!geojson) {
      alert('No GeoJSON data available to download')
      return
    }

    const geoJsonObject = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {
            volume_m3: volume,
            area_m2: area,
            depth_m: depth,
            population: population,
          },
          geometry: typeof geojson === 'string' ? JSON.parse(geojson) : geojson,
        },
      ],
    }

    const dataStr = JSON.stringify(geoJsonObject, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `water-body-${new Date().toISOString().split('T')[0]}.geojson`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <section
        className="water-map-container"
        style={{
          height: 'calc(100vh - 72px)',
          padding: '20px',
          background: '#F5F7F8',
          display: 'grid',
          gridTemplateColumns: '320px 1fr',
          gap: 20,
          boxSizing: 'border-box',
        }}
      >
        {/* ── Sidebar ─────────────────────────────────────────────────────── */}
        <aside
          className="water-map-sidebar"
          style={{
            background: '#fff',
            borderRadius: 12,
            padding: '22px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            border: '1px solid #eef1f3',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            overflowY: 'auto',
          }}
        >
        {/* Header */}
        <div>
          <p
            style={{
              color: '#5E6B73',
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
              fontWeight: 600,
            }}
          >
            GEE Water Analysis
          </p>
          <h2 style={{ color: '#1A1A1A', fontSize: 20, fontWeight: 700, marginTop: 4 }}>
            Water Body Detection Map
          </h2>
          <p style={{ color: '#5E6B73', fontSize: 13, marginTop: 6, lineHeight: 1.6 }}>
            Google Earth Engine layers showing where water can enter, detected water bodies, NDWI index, and geofenced
            flood entry regions near Chennai.
          </p>
        </div>

        {/* Active layer badge */}
        <div
          style={{
            background: GRAD,
            borderRadius: 10,
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <span style={{ fontSize: 28 }}>🌊</span>
          <div>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: 500 }}>Active Layers</p>
            <p style={{ color: '#fff', fontSize: 24, fontWeight: 800, lineHeight: 1 }}>
              {activeCount}
              <span style={{ fontSize: 13, fontWeight: 400, marginLeft: 6, opacity: 0.8 }}>/ {GEE_LAYERS.length}</span>
            </p>
          </div>
        </div>

        {/* Volume Data Metrics */}
        {loading ? (
          <div
            style={{
              background: '#fff3cd',
              border: '1px solid #ffc107',
              borderRadius: 10,
              padding: '12px 14px',
            }}
          >
            <p style={{ color: '#856404', fontSize: 12, textAlign: 'center' }}>Loading volume data...</p>
          </div>
        ) : volumeData && (volume || area || depth || population) ? (
          <div
            style={{
              background: '#fff',
              border: '1.5px solid #1FA6C9',
              borderRadius: 10,
              padding: '14px 16px',
            }}
          >
            <p style={{ color: '#0A5F8C', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>
              📊 Water Body Data
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {volume && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#5E6B73', fontSize: 11 }}>Volume:</span>
                  <span style={{ color: '#1A1A1A', fontSize: 12, fontWeight: 600 }}>
                    {(volume / 1_000_000).toFixed(2)} M m³
                  </span>
                </div>
              )}
              {area && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#5E6B73', fontSize: 11 }}>Area:</span>
                  <span style={{ color: '#1A1A1A', fontSize: 12, fontWeight: 600 }}>
                    {(area / 1_000_000).toFixed(2)} M m²
                  </span>
                </div>
              )}
              {depth && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#5E6B73', fontSize: 11 }}>Depth:</span>
                  <span style={{ color: '#1A1A1A', fontSize: 12, fontWeight: 600 }}>{depth.toFixed(2)} m</span>
                </div>
              )}
              {population && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#5E6B73', fontSize: 11 }}>Population:</span>
                  <span style={{ color: '#1A1A1A', fontSize: 12, fontWeight: 600 }}>
                    {population.toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {geojson && (
              <button
                onClick={downloadGeoJSON}
                style={{
                  marginTop: 12,
                  width: '100%',
                  background: GRAD,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 14px',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  transition: 'transform 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <Download size={14} />
                Download GeoJSON
              </button>
            )}
          </div>
        ) : null}

        {/* Layer toggles */}
        <div>
          <p
            style={{
              color: '#5E6B73',
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              fontWeight: 600,
              marginBottom: 10,
            }}
          >
            Toggle Layers
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {GEE_LAYERS.map((layer) => (
              <LayerToggle
                key={layer.id}
                layer={layer}
                visible={visible[layer.id]}
                onToggle={() => toggle(layer.id)}
              />
            ))}
          </div>
        </div>

        {/* Info card */}
        <div
          style={{
            marginTop: 'auto',
            background: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: 10,
            padding: '12px 14px',
          }}
        >
          <p style={{ color: '#0369a1', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
            📡 Data Source
          </p>
          <p style={{ color: '#0369a1', fontSize: 11, lineHeight: 1.6 }}>
            Layers served via Google Earth Engine tile API from project{' '}
            <code style={{ background: '#e0f2fe', borderRadius: 4, padding: '1px 4px', fontSize: 10 }}>
              water-geofence-project
            </code>
            . Center: 13.147°N, 80.212°E (Chennai region).
          </p>
        </div>
      </aside>

      {/* ── Map ─────────────────────────────────────────────────────────── */}
      <div
        className="water-map-main"
        style={{
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          border: '1px solid #eef1f3',
          position: 'relative',
        }}
      >
        <MapContainer
          center={MAP_CENTER}
          zoom={MAP_ZOOM}
          style={{ width: '100%', height: '100%' }}
          scrollWheelZoom={true}
        >
          {/* OpenStreetMap base */}
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            maxZoom={24}
          />

          {/* GEE overlay layers — rendered only when toggled on */}
          {GEE_LAYERS.map((layer) =>
            visible[layer.id] ? (
              <TileLayer
                key={layer.id}
                url={layer.url}
                attribution="Google Earth Engine"
                maxZoom={24}
                opacity={0.85}
              />
            ) : null
          )}

          {/* Water Body GeoJSON Layer */}
          {geojson && (
            <GeoJSON
              data={typeof geojson === 'string' ? JSON.parse(geojson) : geojson}
              style={{
                color: '#1FA6C9',
                weight: 3,
                fillColor: '#1FA6C9',
                fillOpacity: 0.3,
              }}
            />
          )}
        </MapContainer>

        {/* Floating legend */}
        <div
          style={{
            position: 'absolute',
            bottom: 20,
            right: 20,
            zIndex: 1000,
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(8px)',
            borderRadius: 10,
            padding: '12px 16px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            border: '1px solid #eef1f3',
            minWidth: 160,
          }}
        >
          <p style={{ color: '#1A1A1A', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>
            Legend
          </p>
          {GEE_LAYERS.filter((l) => visible[l.id]).map((layer) => (
            <div key={layer.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 3,
                  background: layer.color,
                  flexShrink: 0,
                }}
              />
              <span style={{ color: '#1A1A1A', fontSize: 12 }}>{layer.name}</span>
            </div>
          ))}
          {activeCount === 0 && (
            <p style={{ color: '#5E6B73', fontSize: 11, fontStyle: 'italic' }}>No layers active</p>
          )}
        </div>
      </div>
    </section>

    {/* Responsive CSS */}
    <style>{`
      /* Mobile Layout - Map at bottom half */
      @media (max-width: 768px) {
        .water-map-container {
          display: flex !important;
          flex-direction: column !important;
          height: calc(100vh - 56px) !important;
          padding: 12px !important;
          gap: 12px !important;
        }

        .water-map-sidebar {
          flex: 0 0 auto !important;
          max-height: 45vh !important;
          padding: 14px !important;
          gap: 10px !important;
          overflow-y: auto !important;
          border-radius: 8px !important;
        }

        .water-map-sidebar h2 {
          font-size: 16px !important;
          margin-top: 2px !important;
        }

        .water-map-sidebar p {
          font-size: 11px !important;
        }

        /* Compact metrics on mobile */
        .water-map-sidebar > div:first-child p:first-child {
          font-size: 9px !important;
        }

        .water-map-sidebar > div:first-child p:last-child {
          font-size: 11px !important;
          line-height: 1.4 !important;
        }

        /* Smaller active layer badge */
        .water-map-sidebar > div:nth-child(2) {
          padding: 8px 12px !important;
        }

        .water-map-sidebar > div:nth-child(2) span {
          font-size: 20px !important;
        }

        .water-map-sidebar > div:nth-child(2) p:first-child {
          font-size: 9px !important;
        }

        .water-map-sidebar > div:nth-child(2) p:last-child {
          font-size: 18px !important;
        }

        /* Compact layer toggles */
        .water-map-sidebar label {
          padding: 6px 8px !important;
          gap: 6px !important;
          border-radius: 6px !important;
        }

        .water-map-sidebar label p:first-of-type {
          font-size: 11px !important;
        }

        .water-map-sidebar label p:last-of-type {
          font-size: 9px !important;
          margin-top: 1px !important;
        }

        .water-map-sidebar label input[type="checkbox"] {
          width: 14px !important;
          height: 14px !important;
        }

        /* Map takes bottom half */
        .water-map-main {
          flex: 1 1 auto !important;
          min-height: 50vh !important;
          border-radius: 8px !important;
        }

        /* Smaller floating legend on mobile */
        .water-map-main > div:last-child {
          bottom: 10px !important;
          right: 10px !important;
          padding: 8px 10px !important;
          border-radius: 6px !important;
          min-width: 120px !important;
        }

        .water-map-main > div:last-child p {
          font-size: 9px !important;
          margin-bottom: 6px !important;
        }

        .water-map-main > div:last-child > div {
          margin-bottom: 3px !important;
        }

        .water-map-main > div:last-child > div span {
          font-size: 10px !important;
        }

        .water-map-main > div:last-child > div > div:first-child {
          width: 10px !important;
          height: 10px !important;
        }

        /* Hide info card on mobile to save space */
        .water-map-sidebar > div:last-child {
          display: none !important;
        }

        /* Compact download button */
        .water-map-sidebar button {
          padding: 8px 10px !important;
          font-size: 11px !important;
        }
      }

      /* Extra small mobile */
      @media (max-width: 480px) {
        .water-map-container {
          padding: 8px !important;
          gap: 8px !important;
        }

        .water-map-sidebar {
          padding: 10px !important;
          gap: 8px !important;
        }

        .water-map-sidebar h2 {
          font-size: 14px !important;
        }
      }

      /* Tablet */
      @media (min-width: 769px) and (max-width: 1024px) {
        .water-map-container {
          grid-template-columns: 280px 1fr !important;
          padding: 16px !important;
        }

        .water-map-sidebar {
          padding: 16px !important;
        }
      }
    `}</style>
    </>
  )
}

export default WaterBodyMap
