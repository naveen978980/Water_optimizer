import { Waves, LifeBuoy, ShieldAlert, Sprout } from 'lucide-react'

const navItems = [
  { id: 'citizen', label: 'Citizen Portal', icon: LifeBuoy },
  { id: 'flood', label: 'Flood Mode', icon: ShieldAlert },
  { id: 'sustainability', label: 'Sustainability Mode', icon: Sprout },
]

function NavigationBar({ activeView, onChange }) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/90 bg-slate-950/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-cyan-500/20 p-2 text-cyan-300">
            <Waves className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">AI-GIS Hydrology Platform</p>
            <h1 className="text-lg font-semibold text-slate-100">OptiStream</h1>
          </div>
        </div>

        <nav className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {navItems.map((item) => {
            const Icon = item.icon
            const selected = activeView === item.id

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChange(item.id)}
                className={`inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                  selected
                    ? 'border-cyan-400/60 bg-cyan-400/15 text-cyan-200 shadow-[0_0_22px_rgba(6,182,212,0.2)]'
                    : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500 hover:text-slate-100'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            )
          })}
        </nav>
      </div>
    </header>
  )
}

export default NavigationBar
