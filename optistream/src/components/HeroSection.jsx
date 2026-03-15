import { Button as TdButton } from 'tdesign-react'
import { THEMES } from '../config/themes'

const features = [
  {
    icon: '🌊',
    title: 'Flood Command Centre',
    desc: 'Live gauge monitoring, bathtub inundation maps, and automated SMS evacuation alerts — all in one command dashboard.',
  },
  {
    icon: '🛡️',
    title: 'Citizen Sensor Network',
    desc: 'Crowd-sourced photo uploads with AI GPS verification and water-level extraction, rewarded with trust scores.',
  },
  {
    icon: '🌱',
    title: 'Sustainability Autonomy',
    desc: 'Settlement-level dry-season survival window predictions with quality agent and infrastructure prescription.',
  },
]

const bulletFeatures = [
  'AI Gauge Reading with ±6 m GPS lock',
  'Bathtub inundation depth model (3 risk tiers)',
  'EventBridge weather model re-checks every 20 min',
  'Automated SMS evacuation dispatch',
  'GeoJSON infrastructure prescription download',
]

const integrations = ['AWS Lambda', 'EventBridge', 'OpenStreetMap', 'CPCB India', 'Leaflet JS', 'React']

const stats = [
  { num: '3+', label: 'Locations Monitored' },
  { num: '4,200', label: 'Citizens Protected' },
  { num: '12.4 M', label: 'Litres Tracked' },
]

function Checkmark({ grad }) {
  return (
    <span
      style={{
        width: 20,
        height: 20,
        borderRadius: '50%',
        background: grad,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        marginTop: 2,
      }}
    >
      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}

function HeroSection({ onGetStarted, season = 'monsoon', onSeasonChange }) {
  const T = THEMES[season]
  const GRAD = T.grad
  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section
        style={{
          background: GRAD,
          padding: '100px 0 80px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* decorative circles */}
        <div
          style={{
            position: 'absolute',
            top: '-120px',
            right: '-120px',
            width: 560,
            height: 560,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.07)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-80px',
            left: '-80px',
            width: 360,
            height: 360,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            padding: '0 32px',
            textAlign: 'center',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <span
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.28)',
              color: '#fff',
              borderRadius: '25px',
              padding: '6px 22px',
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: '0.08em',
              display: 'inline-block',
              marginBottom: 28,
            }}
          >
            AI-Powered Hydrology Platform
          </span>

          <h1
            style={{
              color: '#fff',
              fontSize: 64,
              fontWeight: 700,
              lineHeight: 1.1,
              marginBottom: 24,
              letterSpacing: '-1px',
            }}
          >
            Intelligent Water
            <br />
            <span
              style={{
                fontFamily: "'Pacifico', cursive",
                fontWeight: 400,
                fontSize: 58,
                lineHeight: 1.3,
              }}
            >
              Management
            </span>
            <br />
            for Every Community
          </h1>

          <p
            style={{
              color: 'rgba(255,255,255,0.88)',
              fontSize: 18,
              lineHeight: 1.75,
              maxWidth: 560,
              margin: '0 auto 32px',
            }}
          >
            Real-time flood monitoring, citizen reporting, and AI-driven sustainability insights — all powered by AWS
            Lambda.
          </p>

          {/* ── Season theme toggle ─────────────────────────────────── */}
          <div style={{ marginBottom: 10 }}>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14 }}>
              Choose Season Theme
            </p>
            <div style={{ display: 'inline-flex', gap: 10, background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(8px)', borderRadius: 50, padding: '6px 8px', marginBottom: 40 }}>
              {/* Dry Season button */}
              <div style={{ 
                '--td-brand-color': season === 'dry' ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0)', 
                '--td-brand-color-hover': 'rgba(255,255,255,0.95)', 
                '--td-brand-color-active': '#fff', 
                '--td-brand-color-focus': 'rgba(255,255,255,0.95)',
                opacity: season === 'dry' ? 1 : 0.6,
                transition: 'opacity 0.3s ease'
              }}>
                <TdButton
                  theme="primary"
                  variant={season === 'dry' ? 'base' : 'outline'}
                  shape="round"
                  size="large"
                  onClick={() => {
                    onSeasonChange?.('dry');
                    onGetStarted?.('sustainability');
                  }}
                  style={{
                    fontFamily: 'inherit',
                    fontWeight: season === 'dry' ? 700 : 500,
                    fontSize: 15,
                    color: season === 'dry' ? THEMES.dry.primary : 'rgba(255,255,255,0.78)',
                    minWidth: 148,
                    letterSpacing: '0.01em',
                  }}
                >
                  ☀️ Dry Season
                </TdButton>
              </div>
              {/* Monsoon button */}
              <div style={{ 
                '--td-brand-color': season === 'monsoon' ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0)', 
                '--td-brand-color-hover': 'rgba(255,255,255,0.95)', 
                '--td-brand-color-active': '#fff', 
                '--td-brand-color-focus': 'rgba(255,255,255,0.95)',
                opacity: season === 'monsoon' ? 1 : 0.6,
                transition: 'opacity 0.3s ease'
              }}>
                <TdButton
                  theme="primary"
                  variant={season === 'monsoon' ? 'base' : 'outline'}
                  shape="round"
                  size="large"
                  onClick={() => {
                    onSeasonChange?.('monsoon');
                    onGetStarted?.('citizen');
                  }}
                  style={{
                    fontFamily: 'inherit',
                    fontWeight: season === 'monsoon' ? 700 : 500,
                    fontSize: 15,
                    color: season === 'monsoon' ? THEMES.monsoon.primary : 'rgba(255,255,255,0.78)',
                    minWidth: 148,
                    letterSpacing: '0.01em',
                  }}
                >
                  🌧️ Monsoon
                </TdButton>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => onGetStarted(season === 'monsoon' ? 'flood' : 'sustainability')}
              style={{
                background: '#fff',
                color: '#fff',
                padding: '14px 38px',
                borderRadius: '25px',
                fontSize: 16,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                fontFamily: 'inherit',
              }}
            >
              {season === 'monsoon' ? '🌊 View Flood Map' : '🌱 View Sustainability'}
            </button>
            <button
              onClick={() => onGetStarted('flood')}
              style={{
                background: 'transparent',
                color: '#fff',
                padding: '14px 38px',
                borderRadius: '25px',
                fontSize: 16,
                fontWeight: 500,
                border: '2px solid rgba(255,255,255,0.55)',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              View Flood Map →
            </button>
          </div>

          {/* Stats row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 40,
              maxWidth: 600,
              margin: '64px auto 0',
              borderTop: '1px solid rgba(255,255,255,0.22)',
              paddingTop: 40,
            }}
          >
            {stats.map((s) => (
              <div key={s.label}>
                <p style={{ color: '#fff', fontSize: 38, fontWeight: 800, lineHeight: 1 }}>{s.num}</p>
                <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 14, marginTop: 6 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY OPTISTREAM CARDS ────────────────────────────────────────── */}
      <section style={{ background: '#F5F7F8', padding: '100px 0' }}>
        <div style={{ padding: '0 32px' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <p
              style={{
                color: T.primary,
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                marginBottom: 12,
              }}
            >
              Why OptiStream
            </p>
            <h2 style={{ color: '#1A1A1A', fontSize: 36, fontWeight: 600, lineHeight: 1.2 }}>
              Water intelligence at your fingertips
            </h2>
            <p style={{ color: '#5E6B73', fontSize: 16, lineHeight: 1.7, maxWidth: 480, margin: '16px auto 0' }}>
              From real-time gauge readings to AI-powered sustainability predictions, OptiStream unifies every layer of
              water data.
            </p>
          </div>

          <div className="os-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {features.map((card, i) => (
              <div
                key={card.title}
                style={{
                  background: T.cardGrads[i],
                  borderRadius: 12,
                  padding: 40,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.10)',
                  color: '#fff',
                }}
              >
                <div style={{ fontSize: 38, marginBottom: 20 }}>{card.icon}</div>
                <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>{card.title}</h3>
                <p style={{ fontSize: 15, lineHeight: 1.68, opacity: 0.88 }}>{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRODUCT SECTION (2-col) ─────────────────────────────────────── */}
      <section style={{ background: '#fff', padding: '100px 0' }}>
        <div
          className="os-grid-2-product os-section-pad"
          style={{
            padding: '0 32px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 80,
            alignItems: 'center',
          }}
        >
          {/* Left — visual */}
          <div style={{ position: 'relative' }}>
            <div
              style={{
                borderRadius: 12,
                overflow: 'hidden',
                background: GRAD,
                aspectRatio: '4/3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 24px 60px rgba(31,166,201,0.30)',
              }}
            >
              <div style={{ textAlign: 'center', color: '#fff' }}>
                <div style={{ fontSize: 80, marginBottom: 16 }}>🗺️</div>
                <p style={{ fontSize: 20, fontWeight: 600 }}>Live GIS Flood Map</p>
                <p style={{ fontSize: 14, opacity: 0.8, marginTop: 8 }}>Chennai · Kuthambakkam · Cooum River</p>
              </div>
            </div>
            {/* floating badge */}
            <div
              style={{
                position: 'absolute',
                bottom: -20,
                right: -20,
                background: '#fff',
                borderRadius: 12,
                padding: '14px 22px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                border: '1px solid #eef1f3',
              }}
            >
              <p style={{ color: '#5E6B73', fontSize: 11, fontWeight: 500 }}>Last Updated</p>
              <p style={{ color: T.primary, fontSize: 20, fontWeight: 700 }}>09:22 IST</p>
            </div>
          </div>

          {/* Right — bullets */}
          <div>
            <p
              style={{
                color: T.primary,
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                marginBottom: 12,
              }}
            >
              Real-Time Intelligence
            </p>
            <h2 style={{ color: '#1A1A1A', fontSize: 36, fontWeight: 600, lineHeight: 1.2, marginBottom: 20 }}>
              GIS-powered flood risk at every scale
            </h2>
            <p style={{ color: '#5E6B73', fontSize: 16, lineHeight: 1.75, marginBottom: 36 }}>
              From street-level inundation depth to settlement-wide sustainability forecasts, OptiStream unifies sensor
              data, satellite imagery, and AI models.
            </p>

            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 18 }}>
              {bulletFeatures.map((feat) => (
                <li key={feat} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, color: '#1A1A1A', fontSize: 15, lineHeight: 1.5 }}>
                <Checkmark grad={GRAD} />
                  {feat}
                </li>
              ))}
            </ul>

            <button
              onClick={() => onGetStarted('flood')}
              style={{
                marginTop: 40,
                background: GRAD,
                color: '#fff',
                padding: '14px 34px',
                borderRadius: '25px',
                fontSize: 15,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                boxShadow: `0 6px 18px ${T.btnGlow}`,
                fontFamily: 'inherit',
              }}
            >
              Open Flood Map
            </button>
          </div>
        </div>
      </section>

      {/* ── INTEGRATIONS LOGO SECTION ───────────────────────────────────── */}
      <section style={{ background: '#F5F7F8', padding: '80px 0' }}>
        <div style={{ padding: '0 32px', textAlign: 'center' }}>
          <p
            style={{
              color: '#5E6B73',
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              marginBottom: 48,
            }}
          >
            Integrated With
          </p>
          <div className="os-grid-6" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 20, alignItems: 'center' }}>
            {integrations.map((name) => (
              <div
                key={name}
                style={{
                  color: '#7C8B92',
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  padding: '20px 10px',
                  background: '#fff',
                  borderRadius: 8,
                  textAlign: 'center',
                  border: '1px solid #e4edf0',
                }}
              >
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section
        style={{
          background: GRAD,
          padding: '100px 0',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              "url('https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1600&q=60')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.12,
          }}
        />
        <div
          style={{
            padding: '0 32px',
            textAlign: 'center',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <h2
            style={{
              color: '#fff',
              fontSize: 42,
              fontWeight: 700,
              lineHeight: 1.2,
              marginBottom: 20,
            }}
          >
            Ready to protect your community
            <br />
            from water crisis?
          </h2>
          <p
            style={{
              color: 'rgba(255,255,255,0.88)',
              fontSize: 18,
              lineHeight: 1.75,
              maxWidth: 480,
              margin: '0 auto 40px',
            }}
          >
            Join thousands of citizens, engineers, and city planners using OptiStream to stay ahead of floods and
            droughts.
          </p>
          <button
            onClick={() => onGetStarted(season === 'monsoon' ? 'flood' : 'sustainability')}
            style={{
              background: '#fff',
              color: T.primary,
              padding: '16px 44px',
              borderRadius: '25px',
              fontSize: 16,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
              fontFamily: 'inherit',
            }}
          >
            {season === 'monsoon' ? '🌊 Open Flood Map' : '🌱 Open Sustainability'}
          </button>
        </div>
      </section>
    </>
  )
}

export default HeroSection
