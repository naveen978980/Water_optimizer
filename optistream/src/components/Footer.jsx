import { Droplets } from 'lucide-react'

const footerLinks = [
  {
    title: 'Platform',
    links: ['Citizen Portal', 'Flood Command', 'Sustainability', 'GIS Maps'],
  },
  {
    title: 'Resources',
    links: ['Documentation', 'API Reference', 'Data Sources', 'Open Data'],
  },
  {
    title: 'Company',
    links: ['About', 'Blog', 'Careers', 'Contact'],
  },
]

const socialIcons = ['𝕏', 'in', 'gh']

function Footer() {
  return (
    <footer style={{ background: '#1B8FA8', padding: '60px 0 0' }}>
      <div style={{ padding: '0 32px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.6fr 1fr 1fr 1fr',
            gap: 40,
            paddingBottom: 48,
          }}
        >
          {/* Brand block */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div
                style={{
                  background: 'rgba(255,255,255,0.18)',
                  borderRadius: 10,
                  padding: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Droplets style={{ color: '#fff', width: 20, height: 20 }} />
              </div>
              <span style={{ color: '#fff', fontSize: 20, fontWeight: 700 }}>OptiStream</span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 14, lineHeight: 1.75, maxWidth: 240 }}>
              AI-GIS Hydrology Platform for real-time flood monitoring and sustainability intelligence across South
              Asia.
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              {socialIcons.map((icon) => (
                <div
                  key={icon}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}
                >
                  {icon}
                </div>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {footerLinks.map((col) => (
            <div key={col.title}>
              <h4
                style={{
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: 20,
                }}
              >
                {col.title}
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      style={{
                        color: 'rgba(255,255,255,0.7)',
                        fontSize: 14,
                        textDecoration: 'none',
                        transition: 'color 0.15s',
                      }}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: '1px solid rgba(255,255,255,0.18)',
            padding: '22px 0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>© 2026 OptiStream. All rights reserved.</p>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>
            Built with ❤️ for water resilience in South Asia
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
