import { AlertTriangle, Bell, Droplets, Siren, Timer } from 'lucide-react'
import { MapContainer, Polygon, TileLayer } from 'react-leaflet'

const mapCenter = [13.0827, 80.2707]

function FloodModeDashboard({ locations, selectedLocation, onLocationChange, liveAnalytics, weatherAlert, floodZones }) {
  return (
    <section className="h-[calc(100vh-92px)] p-4 sm:p-6 lg:p-8">
      <div className="grid h-full gap-4 lg:grid-cols-[360px_1fr]">
        <aside className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Flood Command Center</p>
            <h2 className="mt-1 text-xl font-semibold text-white">Wet Season Operations</h2>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-950/70 p-3">
            <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-slate-400">Location</label>
            <select
              value={selectedLocation}
              onChange={(event) => onLocationChange(event.target.value)}
              className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-500"
            >
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.label}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-xl border border-cyan-500/40 bg-cyan-500/10 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-200">Live Analytics</p>
            <p className="mt-3 text-sm text-cyan-100">Current AI Gauge Reading</p>
            <p className="mt-2 flex items-end gap-2 text-3xl font-semibold text-white">
              <Droplets className="h-7 w-7 text-cyan-300" />
              {liveAnalytics.currentGauge}
            </p>
            <p className="mt-1 text-xs text-cyan-100/80">Trend: {liveAnalytics.trend}</p>
          </div>

          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">
            <p className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-amber-200">
              <AlertTriangle className="h-4 w-4" />
              Weather Agent
            </p>
            <p className="mt-3 text-sm text-amber-100">{weatherAlert.message}</p>
            <p className="mt-2 flex items-center gap-2 text-xs text-amber-200/90">
              <Timer className="h-4 w-4" />
              {weatherAlert.schedule}
            </p>
          </div>

          <button
            type="button"
            className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/40 bg-red-500/20 px-4 py-3 text-sm font-semibold text-red-100 transition hover:bg-red-500/30"
          >
            <Siren className="h-4 w-4" />
            Dispatch SMS Evacuation Alerts
          </button>
        </aside>

        <div className="relative overflow-hidden rounded-2xl border border-slate-800">
          <MapContainer center={mapCenter} zoom={13} className="h-full w-full">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {floodZones.map((zone) => (
              <Polygon
                key={zone.id}
                positions={zone.coordinates}
                pathOptions={{
                  color: zone.stroke,
                  fillColor: zone.fill,
                  fillOpacity: 0.45,
                  weight: 1,
                }}
              />
            ))}
          </MapContainer>

          <div className="absolute bottom-4 right-4 z-[1000] w-72 rounded-xl border border-slate-700 bg-slate-950/90 p-4 shadow-xl shadow-black/40">
            <p className="mb-3 text-xs uppercase tracking-[0.2em] text-slate-300">Bathtub Inundation Depth</p>
            <ul className="space-y-2 text-sm text-slate-100">
              <li className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-yellow-400" />
                Yellow: 0-0.5m Walkable
              </li>
              <li className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-orange-500" />
                Orange: 0.5-1.5m Dangerous
              </li>
              <li className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-500" />
                Red: 1.5m+ Critical
              </li>
            </ul>
          </div>

          <div className="absolute left-4 top-4 z-[1000] rounded-lg border border-slate-700 bg-slate-950/90 px-3 py-2 text-xs text-slate-200">
            <p className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-cyan-300" />
              Live Feed: {liveAnalytics.lastUpdated}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FloodModeDashboard
