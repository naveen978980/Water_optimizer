import { Droplets, Home, LifeBuoy, Map, ShieldAlert, Sprout } from 'lucide-react'
import { THEMES } from '../config/themes'

const navItems = [
  { id: 'home',           label: 'Home',            icon: Home },
  { id: 'citizen',        label: 'Citizen Portal',  icon: LifeBuoy },
  { id: 'flood',          label: 'Flood Risk',      icon: ShieldAlert },
  { id: 'watermap',       label: 'Water Map',       icon: Map },
  { id: 'sustainability', label: 'Sustainability',  icon: Sprout },
]

function NavigationBar({ activeView, onChange, season = 'monsoon' }) {
  const T = THEMES[season]

  const handleNav = (id) => {
    onChange(id)
  }

  return (
    <header
      className="os-header"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 30,
        background: '#fff',
        boxShadow: '0 2px 20px rgba(0,0,0,0.07)',
        borderBottom: '1px solid #e8eef1',
      }}
    >
      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <div
        className="os-nav-inner"
        style={{
          padding: '0 clamp(16px, 5vw, 32px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 'clamp(56px, 10vw, 72px)',
        }}
      >
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 2vw, 12px)' }}>
          <div
            style={{
              background: T.gradNav,
              borderRadius: 'clamp(8px, 2vw, 12px)',
              padding: 'clamp(6px, 1.5vw, 8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Droplets style={{ width: 'clamp(16px, 3vw, 20px)', height: 'clamp(16px, 3vw, 20px)', color: '#fff' }} />
          </div>
          <div>
            <p
              className="os-brand-subtitle"
              style={{
                color: '#5E6B73',
                fontSize: 'clamp(8px, 1.8vw, 10px)',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                fontWeight: 500,
                lineHeight: 1,
              }}
            >
              AI-GIS Hydrology Platform
            </p>
            <h1 style={{ color: '#1A1A1A', fontWeight: 700, fontSize: 'clamp(14px, 3vw, 17px)', lineHeight: 1.3, marginTop: '2px' }}>
              OptiStream
            </h1>
          </div>
        </div>

        {/* Desktop nav - hidden on mobile */}
        <nav className="os-nav-links" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {navItems.map((item) => {
            const Icon = item.icon
            const selected = activeView === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNav(item.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  padding: 'clamp(8px, 1.5vw, 10px) clamp(14px, 3vw, 20px)',
                  borderRadius: '25px',
                  fontSize: 'clamp(12px, 2vw, 14px)',
                  fontWeight: 500,
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  transition: 'all 0.18s',
                  border: selected ? 'none' : '1px solid #dce7eb',
                  background: selected ? T.gradNav : 'transparent',
                  color: selected ? '#fff' : '#5E6B73',
                  boxShadow: selected ? `0 4px 14px ${T.btnGlow}` : 'none',
                }}
              >
                <Icon style={{ width: 15, height: 15 }} />
                {item.label}
              </button>
            )
          })}
        </nav>

        {/* Desktop auth buttons - hidden on mobile */}
        <div className="os-auth-btns" style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button
            type="button"
            onClick={() => handleNav('login')}
            style={{
              padding: 'clamp(7px, 1.5vw, 9px) clamp(16px, 3vw, 22px)',
              borderRadius: '25px',
              fontSize: 'clamp(12px, 2vw, 14px)',
              fontWeight: 500,
              fontFamily: 'inherit',
              cursor: 'pointer',
              border: `1.5px solid ${T.primary}`,
              background: 'transparent',
              color: T.primary,
              transition: 'all 0.18s',
            }}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => handleNav('signup')}
            style={{
              padding: 'clamp(7px, 1.5vw, 9px) clamp(16px, 3vw, 22px)',
              borderRadius: '25px',
              fontSize: 'clamp(12px, 2vw, 14px)',
              fontWeight: 600,
              fontFamily: 'inherit',
              cursor: 'pointer',
              border: 'none',
              background: T.gradNav,
              color: '#fff',
              boxShadow: `0 4px 14px ${T.btnGlow}`,
              transition: 'all 0.18s',
            }}
          >
            Sign Up
          </button>
        </div>

        {/* Mobile auth buttons - compact version */}
        <div className="os-auth-btns-mobile" style={{ display: 'none', gap: 6, flexShrink: 0 }}>
          <button
            type="button"
            onClick={() => handleNav('login')}
            style={{
              padding: '8px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 500,
              fontFamily: 'inherit',
              cursor: 'pointer',
              border: `1.5px solid ${T.primary}`,
              background: 'transparent',
              color: T.primary,
              transition: 'all 0.18s',
            }}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => handleNav('signup')}
            style={{
              padding: '8px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 600,
              fontFamily: 'inherit',
              cursor: 'pointer',
              border: 'none',
              background: T.gradNav,
              color: '#fff',
              boxShadow: `0 4px 14px ${T.btnGlow}`,
              transition: 'all 0.18s',
            }}
          >
            Signup
          </button>
        </div>
      </div>
    </header>
  )
}

export default NavigationBar
