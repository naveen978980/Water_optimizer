import { Download, FlaskConical, GaugeCircle, Users, Waves, Wrench } from 'lucide-react'

function SustainabilityModeDashboard({ metrics, autonomy, qualityAgent, infraAgent, onDownloadGeoJSON }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard icon={Waves} label="Current Volume" value={metrics.currentVolume} accent="cyan" />
        <MetricCard icon={Users} label="Local Population" value={metrics.population} accent="blue" />
        <MetricCard icon={GaugeCircle} label="Evaporation Loss" value={metrics.evaporationLoss} accent="amber" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <article className="rounded-2xl border border-cyan-500/40 bg-gradient-to-br from-cyan-500/15 via-slate-900 to-slate-900 p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">The Coordinator Agent</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">Settlement Autonomy Prediction</h3>

          <div className="mt-8 text-center">
            <p className="text-sm uppercase tracking-[0.22em] text-slate-400">Estimated Survival Window</p>
            <p className="mt-2 text-7xl font-extrabold tracking-tight text-cyan-300 sm:text-8xl">{autonomy.daysLeft}</p>
            <p className="mt-2 text-slate-300">Current storage projected under dry-season demand model</p>
          </div>

          <div className="mt-8">
            <div className="mb-2 flex justify-between text-sm text-slate-300">
              <span>Capacity Remaining</span>
              <span>{autonomy.capacityPercent}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                style={{ width: `${autonomy.capacityPercent}%` }}
              />
            </div>
          </div>
        </article>

        <aside className="space-y-4">
          <article className="rounded-2xl border border-red-500/60 bg-red-500/10 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-red-200">Quality Agent</p>
            <h4 className="mt-2 flex items-center gap-2 text-lg font-semibold text-red-100">
              <FlaskConical className="h-5 w-5" />
              Water Quality Warning
            </h4>
            <p className="mt-2 text-sm text-red-100/90">{qualityAgent.message}</p>
          </article>

          <article className="rounded-2xl border border-green-500/60 bg-green-500/10 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-green-200">Infrastructure Agent</p>
            <h4 className="mt-2 flex items-center gap-2 text-lg font-semibold text-green-100">
              <Wrench className="h-5 w-5" />
              {infraAgent.title}
            </h4>
            <p className="mt-3 text-sm text-green-100/90">{infraAgent.description}</p>
            <button
              type="button"
              onClick={onDownloadGeoJSON}
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-green-400/60 bg-green-400/20 px-3 py-2 text-sm font-semibold text-green-100 transition hover:bg-green-400/30"
            >
              <Download className="h-4 w-4" />
              Download GeoJSON
            </button>
          </article>
        </aside>
      </div>
    </section>
  )
}

function MetricCard({ icon, label, value, accent }) {
  const accentMap = {
    cyan: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-200',
    blue: 'border-blue-500/40 bg-blue-500/10 text-blue-200',
    amber: 'border-amber-500/40 bg-amber-500/10 text-amber-200',
  }

  return (
    <article className={`rounded-xl border p-4 ${accentMap[accent]}`}>
      <p className="text-xs uppercase tracking-[0.18em]">{label}</p>
      <p className="mt-3 flex items-center gap-2 text-2xl font-semibold text-white">
        {icon({ className: 'h-5 w-5' })}
        {value}
      </p>
    </article>
  )
}

export default SustainabilityModeDashboard
