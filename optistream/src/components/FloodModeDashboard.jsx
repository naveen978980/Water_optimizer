import { useEffect, useMemo, useState } from 'react'
import { Bell, CloudRain, Droplets, Siren, Timer } from 'lucide-react'
import { MapContainer, Polygon, TileLayer, Tooltip } from 'react-leaflet'
import rawZones from '../data/floodZones.json'
import { LAMBDA } from '../config/lambdaUrls'

// GeoJSON stores [lon, lat] — Leaflet Polygon needs [lat, lon]
const ZONES = rawZones.map((z, i) => ({
  id: i,
  positions: z.coords.map(([lon, lat]) => [lat, lon]),
  color: z.color.slice(0, 7),
  score: z.score,
  depth: z.depth,
  risk: z.score >= 0.75 ? 'Critical' : z.score >= 0.45 ? 'High' : z.score >= 0.25 ? 'Medium' : 'Low',
}))

const MAP_CENTER = [13.14679, 80.21152]
const GRAD = 'linear-gradient(135deg, #1FA6C9, #0A5F8C)'
const FILTERS = ['All', 'Critical', 'High', 'Medium', 'Low']

const RISK_META = {
  Critical: { color: '#ef4444', text: '#dc2626' },
  High:     { color: '#f97316', text: '#c2410c' },
  Medium:   { color: '#eab308', text: '#a16207' },
  Low:      { color: '#22c55e', text: '#15803d' },
}

function FloodModeDashboard({ liveAnalytics }) {
  const [filter, setFilter] = useState('All')
  const [weatherAlert, setWeatherAlert] = useState(null)
  const [weatherLoading, setWeatherLoading] = useState(true)

  useEffect(() => {
    fetch(LAMBDA.WEATHER_ALERT)
      .then((r) => r.json())
      .then(setWeatherAlert)
      .catch(() => setWeatherAlert({
        message: 'Heavy rainfall expected. Monitor low-lying areas and prepare for evacuation.',
        schedule: 'Updated every 6 hours',
      }))
      .finally(() => setWeatherLoading(false))
  }, [])

  const stats = useMemo(() => ({
    total: ZONES.length,
    critical: ZONES.filter((z) => z.risk === 'Critical').length,
    high:     ZONES.filter((z) => z.risk === 'High').length,
    medium:   ZONES.filter((z) => z.risk === 'Medium').length,
    low:      ZONES.filter((z) => z.risk === 'Low').length,
    maxDepth: Math.max(...ZONES.map((z) => z.depth)).toFixed(2),
    avgScore: (ZONES.reduce((s, z) => s + z.score, 0) / ZONES.length).toFixed(2),
  }), [])

  const filtered = useMemo(
    () => (filter === 'All' ? ZONES : ZONES.filter((z) => z.risk === filter)),
    [filter],
  )

  return (
    <section
      className="os-flood-layout"
      style={{
        height: 'calc(100vh - 72px)',
        padding: '20px',
        background: '#F5F7F8',
        display: 'grid',
        gridTemplateColumns: '340px 1fr',
        gap: 20,
        boxSizing: 'border-box',
      }}
    >
      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside
        className="os-flood-sidebar"
        style={{
          background: '#fff',
          borderRadius: 12,
          padding: '24px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          border: '1px solid #eef1f3',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          overflowY: 'auto',
        }}
      >
        <div>
          <p style={{ color: '#5E6B73', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.18em', fontWeight: 600 }}>
            Flood Risk Analysis
          </p>
          <h2 style={{ color: '#1A1A1A', fontSize: 20, fontWeight: 700, marginTop: 4 }}>Zone Risk Dashboard</h2>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { label: 'Total Zones', value: stats.total,    color: '#1FA6C9' },
            { label: 'Critical',    value: stats.critical, color: '#ef4444' },
            { label: 'Max Depth',   value: `${stats.maxDepth}m`, color: '#f97316' },
          ].map((s) => (
            <div key={s.label} style={{ flex: 1, background: '#F5F7F8', borderRadius: 10, padding: '12px 8px', textAlign: 'center', border: `2px solid ${s.color}33` }}>
              <p style={{ color: s.color, fontSize: 20, fontWeight: 800, lineHeight: 1 }}>{s.value}</p>
              <p style={{ color: '#5E6B73', fontSize: 11, marginTop: 4, fontWeight: 500 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Live analytics */}
        <div style={{ background: GRAD, borderRadius: 10, padding: '16px', color: '#fff' }}>
          <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.16em', fontWeight: 600, opacity: 0.85 }}>
            Live Analytics
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
            <Droplets style={{ width: 28, height: 28, opacity: 0.9 }} />
            <div>
              <p style={{ fontSize: 12, opacity: 0.85 }}>Active Flood Zones</p>
              <p style={{ fontSize: 32, fontWeight: 800, lineHeight: 1 }}>{stats.total}</p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 12 }}>
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: '8px' }}>
              <p style={{ opacity: 0.8, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Critical</p>
              <p style={{ fontWeight: 700, fontSize: 18 }}>{stats.critical}</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: '8px' }}>
              <p style={{ opacity: 0.8, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Avg Score</p>
              <p style={{ fontWeight: 700, fontSize: 18 }}>{stats.avgScore}</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: '8px' }}>
              <p style={{ opacity: 0.8, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Max Depth</p>
              <p style={{ fontWeight: 700, fontSize: 18 }}>{stats.maxDepth}m</p>
            </div>
          </div>
        </div>

        {/* Risk filter */}
        <div>
          <p style={{ color: '#5E6B73', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 600, marginBottom: 8 }}>
            Filter by Risk
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {FILTERS.map((r) => {
              const c = r === 'All' ? '#1FA6C9' : RISK_META[r].color
              const active = filter === r
              const count = r !== 'All' ? stats[r.toLowerCase()] : null
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setFilter(r)}
                  style={{
                    padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                    fontFamily: 'inherit', cursor: 'pointer',
                    border: `1.5px solid ${active ? c : '#e0e9ed'}`,
                    background: active ? c : '#fff',
                    color: active ? '#fff' : '#5E6B73',
                    transition: 'all 0.15s',
                  }}
                >
                  {r}{count != null && <span style={{ opacity: 0.8, marginLeft: 4 }}>({count})</span>}
                </button>
              )
            })}
          </div>
        </div>

        {/* Weather alert */}
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '14px' }}>
          <p style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#92400e', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 600 }}>
            <CloudRain style={{ width: 13, height: 13 }} />
            Weather Agent
          </p>
          {weatherLoading ? (
            <p style={{ color: '#b45309', fontSize: 13, marginTop: 8, opacity: 0.7 }}>Fetching forecast…</p>
          ) : (
            <>
              <p style={{ color: '#78350f', fontSize: 13, marginTop: 8, lineHeight: 1.65 }}>{weatherAlert?.message ?? 'No active weather alerts.'}</p>
              {weatherAlert?.schedule && (
                <p style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#92400e', fontSize: 12, marginTop: 6 }}>
                  <Timer style={{ width: 12, height: 12 }} />{weatherAlert.schedule}
                </p>
              )}
            </>
          )}
        </div>

        {/* Dispatch button */}
        <button
          type="button"
          style={{
            marginTop: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            background: 'linear-gradient(90deg, #ef4444, #dc2626)',
            color: '#fff',
            padding: '14px',
            borderRadius: '25px',
            fontSize: 14,
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 6px 18px rgba(239,68,68,0.28)',
            fontFamily: 'inherit',
          }}
        >
          <Siren style={{ width: 16, height: 16 }} />
          Dispatch SMS Evacuation Alerts
        </button>
      </aside>

      {/* ── Map ─────────────────────────────────────────────────────────── */}
      <div
        style={{
          borderRadius: 12,
          overflow: 'hidden',
          position: 'relative',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          border: '1px solid #eef1f3',
        }}
      >
        <MapContainer center={MAP_CENTER} zoom={14} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />
          {filtered.map((zone) => (
            <Polygon
              key={zone.id}
              positions={zone.positions}
              pathOptions={{ color: zone.color, fillColor: zone.color, fillOpacity: 0.5, weight: 2 }}
            >
              <Tooltip sticky>
                <div style={{ fontFamily: 'sans-serif', fontSize: 13, lineHeight: 1.7 }}>
                  <strong style={{ color: RISK_META[zone.risk]?.text }}>{zone.risk} Risk Zone</strong><br />
                  Risk Score: <strong>{zone.score.toFixed(2)}</strong><br />
                  Estimated Depth: <strong>{zone.depth.toFixed(2)} m</strong>
                </div>
              </Tooltip>
            </Polygon>
          ))}
        </MapContainer>

        {/* Legend */}
        <div
          style={{
            position: 'absolute',
            bottom: 20,
            right: 20,
            zIndex: 1000,
            background: '#fff',
            borderRadius: 10,
            padding: '16px 20px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
            border: '1px solid #eef1f3',
            minWidth: 220,
          }}
        >
          <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.16em', color: '#5E6B73', fontWeight: 600, marginBottom: 10 }}>Risk Level</p>
          {[
            { risk: 'Critical', label: 'Critical  ≥ 0.75' },
            { risk: 'High',     label: 'High     0.45 – 0.75' },
            { risk: 'Medium',   label: 'Medium  0.25 – 0.45' },
            { risk: 'Low',      label: 'Low      < 0.25' },
          ].map((item) => (
            <div key={item.risk} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 7, fontSize: 12, color: '#1A1A1A' }}>
              <span style={{ width: 12, height: 12, borderRadius: 3, background: RISK_META[item.risk].color, flexShrink: 0 }} />
              {item.label}
            </div>
          ))}
          <div style={{ borderTop: '1px solid #eef1f3', marginTop: 10, paddingTop: 10 }}>
            <p style={{ fontSize: 11, color: '#5E6B73' }}>Showing <strong style={{ color: '#1A1A1A' }}>{filtered.length}</strong> / {ZONES.length} zones</p>
          </div>
        </div>

        {/* Live feed badge */}
        <div
          style={{
            position: 'absolute',
            top: 16,
            left: 16,
            zIndex: 1000,
            background: '#fff',
            borderRadius: 8,
            padding: '8px 14px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.09)',
            border: '1px solid #eef1f3',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 13,
            color: '#1A1A1A',
          }}
        >
          <Bell style={{ width: 15, height: 15, color: '#1FA6C9' }} />
          Live Feed: Real-time
        </div>
      </div>
    </section>
  )
}

export default FloodModeDashboard

