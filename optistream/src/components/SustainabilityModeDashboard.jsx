import { Download, FlaskConical, GaugeCircle, Users, Waves, Wrench } from 'lucide-react'
import WaterSustainabilityCalculator from './WaterSustainabilityCalculator'

const GRAD = 'linear-gradient(135deg, #1FA6C9, #0A5F8C)'

function MetricCard({ icon: Icon, label, value, color }) {
  return (
    <article
      style={{
        background: '#fff',
        borderRadius: 12,
        padding: '22px 24px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
        border: '1px solid #eef1f3',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            background: `${color}18`,
            borderRadius: 8,
            padding: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon style={{ width: 18, height: 18, color }} />
        </div>
        <p style={{ color: '#5E6B73', fontSize: 13, fontWeight: 500 }}>{label}</p>
      </div>
      <p style={{ color: '#1A1A1A', fontSize: 26, fontWeight: 700 }}>{value}</p>
    </article>
  )
}

function SustainabilityModeDashboard({ metrics, autonomy, qualityAgent, infraAgent, onDownloadGeoJSON, waterSustainability }) {
  console.log('🎨 SustainabilityModeDashboard render:', { metrics, autonomy, qualityAgent, infraAgent, waterSustainability });
  
  // Extract volumetric data from metrics if available
  const extractVolumeData = () => {
    if (!metrics) return { volume: '', area: '', depth: '', population: '4200' };
    
    // Use raw numeric values if available, otherwise parse formatted strings
    const volumeStr = String(metrics.volume || metrics.currentVolume?.replace(/[^\d.]/g, '') || '');
    const areaStr = String(metrics.area || metrics.surfaceArea?.replace(/[^\d.]/g, '') || '');
    const depthStr = String(metrics.depth || '');
    const populationStr = String(metrics.populationNum || metrics.population?.replace(/[^\d]/g, '') || '4200');
    
    console.log('📦 Extracted volume data:', { volumeStr, areaStr, depthStr, populationStr });
    
    return {
      volume: volumeStr,
      area: areaStr,
      depth: depthStr,
      population: populationStr
    };
  };

  const volumeData = extractVolumeData();
  const hasData = volumeData.volume !== '' && volumeData.volume !== '0';
  
  // Get stress level color
  const getStressColor = (level) => {
    const levelStr = String(level || '').toUpperCase();
    switch (levelStr) {
      case 'CRITICAL': return '#DC2626';
      case 'HIGH': return '#F59E0B';
      case 'MODERATE': return '#3B82F6';
      case 'LOW': return '#10B981';
      default: return '#1FA6C9';
    }
  };
  
  // Print to PDF function
  const handlePrintPDF = () => {
    window.print();
  };
  
  return (
    <section style={{ background: '#F5F7F8', padding: '40px 0', minHeight: 'calc(100vh - 72px)' }}>
      <div style={{ padding: '0 32px' }}>

        {/* ── Metric cards ─────────────────────────────────────────────── */}
        <div className="os-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 24 }}>
          <MetricCard icon={Waves} label="Current Volume" value={metrics?.currentVolume ?? '—'} color="#1FA6C9" />
          <MetricCard icon={Users} label="Local Population" value={metrics?.population ?? '—'} color="#1B8FA8" />
          <MetricCard icon={GaugeCircle} label="Evaporation Loss" value={metrics?.evaporationLoss ?? '—'} color="#0A5F8C" />
        </div>

        {/* ── Additional Sustainability Metrics (from volume.py) ───────── */}
        {waterSustainability && (
          <div className="os-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            <article style={{
              background: '#fff',
              borderRadius: 10,
              padding: '18px 20px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
              border: '1px solid #eef1f3',
            }}>
              <p style={{ color: '#5E6B73', fontSize: 12, fontWeight: 500, marginBottom: 8 }}>Daily Consumption</p>
              <p style={{ color: '#1A1A1A', fontSize: 20, fontWeight: 700 }}>{waterSustainability.dailyConsumption ?? '—'}</p>
            </article>
            
            <article style={{
              background: '#fff',
              borderRadius: 10,
              padding: '18px 20px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
              border: '1px solid #eef1f3',
            }}>
              <p style={{ color: '#5E6B73', fontSize: 12, fontWeight: 500, marginBottom: 8 }}>Seepage Loss</p>
              <p style={{ color: '#1A1A1A', fontSize: 20, fontWeight: 700 }}>{waterSustainability.seepageLoss ?? '—'}</p>
            </article>
            
            <article style={{
              background: '#fff',
              borderRadius: 10,
              padding: '18px 20px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
              border: '1px solid #eef1f3',
            }}>
              <p style={{ color: '#5E6B73', fontSize: 12, fontWeight: 500, marginBottom: 8 }}>Per Capita Daily</p>
              <p style={{ color: '#1A1A1A', fontSize: 20, fontWeight: 700 }}>{waterSustainability.perCapitaAvailability ?? '—'}</p>
            </article>
            
            <article style={{
              background: waterSustainability.stressLevel ? `${getStressColor(waterSustainability.stressLevel)}15` : '#fff',
              borderRadius: 10,
              padding: '18px 20px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
              border: `1px solid ${waterSustainability.stressLevel ? getStressColor(waterSustainability.stressLevel) + '40' : '#eef1f3'}`,
            }}>
              <p style={{ color: '#5E6B73', fontSize: 12, fontWeight: 500, marginBottom: 8 }}>Stress Level</p>
              <p style={{ 
                color: waterSustainability.stressLevel ? getStressColor(waterSustainability.stressLevel) : '#1A1A1A', 
                fontSize: 20, 
                fontWeight: 700 
              }}>
                {waterSustainability.stressLevel ?? '—'}
              </p>
            </article>
          </div>
        )}

        {/* ── Lower grid ───────────────────────────────────────────────── */}
        <div className="os-sustain-lower" style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.7fr', gap: 20 }}>

          {/* Autonomy card */}
          <article
            style={{
              background: GRAD,
              borderRadius: 12,
              padding: '36px',
              boxShadow: '0 10px 30px rgba(31,166,201,0.22)',
              color: '#fff',
            }}
          >
            <p
              style={{
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: '0.2em',
                fontWeight: 600,
                opacity: 0.82,
              }}
            >
              The Coordinator Agent
            </p>
            <h3 style={{ fontSize: 22, fontWeight: 600, marginTop: 8 }}>Settlement Autonomy Prediction</h3>

            <div style={{ textAlign: 'center', marginTop: 36 }}>
              <p
                style={{
                  fontSize: 12,
                  textTransform: 'uppercase',
                  letterSpacing: '0.2em',
                  opacity: 0.72,
                }}
              >
                Estimated Survival Window
              </p>
              <p
                style={{
                  fontSize: 76,
                  fontWeight: 800,
                  lineHeight: 1.1,
                  marginTop: 8,
                  letterSpacing: '-2px',
                }}
              >
                {autonomy?.daysLeft ?? '—'}
              </p>
              <p style={{ fontSize: 14, opacity: 0.76, marginTop: 8 }}>
                Projected under dry-season demand model
              </p>
            </div>

            {/* Capacity bar */}
            <div style={{ marginTop: 36 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 13,
                  opacity: 0.88,
                  marginBottom: 8,
                }}
              >
                <span>Capacity Remaining</span>
                <span>{autonomy?.capacityPercent ?? 0}%</span>
              </div>
              <div
                style={{
                  height: 8,
                  borderRadius: '25px',
                  background: 'rgba(255,255,255,0.22)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    borderRadius: '25px',
                    background: '#fff',
                    width: `${autonomy?.capacityPercent ?? 0}%`,
                    transition: 'width 1s ease',
                  }}
                />
              </div>
            </div>
          </article>

          {/* Agent cards */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Quality agent */}
            <article
              style={{
                background: '#fff',
                borderRadius: 12,
                padding: '24px',
                border: '1px solid #fee2e2',
                boxShadow: '0 4px 16px rgba(239,68,68,0.06)',
                flex: 1,
              }}
            >
              <p
                style={{
                  color: '#dc2626',
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: '0.16em',
                  fontWeight: 600,
                }}
              >
                Quality Agent
              </p>
              <h4
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  color: '#1A1A1A',
                  fontSize: 16,
                  fontWeight: 600,
                  margin: '10px 0',
                }}
              >
                <FlaskConical style={{ width: 18, height: 18, color: '#dc2626' }} />
                Water Quality Warning
              </h4>
              <p style={{ color: '#5E6B73', fontSize: 13, lineHeight: 1.65 }}>{qualityAgent?.message ?? '—'}</p>
            </article>

            {/* Infra agent */}
            <article
              style={{
                background: '#fff',
                borderRadius: 12,
                padding: '24px',
                border: '1px solid #bbf7d0',
                boxShadow: '0 4px 16px rgba(34,197,94,0.05)',
                flex: 1,
              }}
            >
              <p
                style={{
                  color: '#16a34a',
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: '0.16em',
                  fontWeight: 600,
                }}
              >
                Infrastructure Agent
              </p>
              <h4
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  color: '#1A1A1A',
                  fontSize: 16,
                  fontWeight: 600,
                  margin: '10px 0',
                }}
              >
                <Wrench style={{ width: 18, height: 18, color: '#16a34a' }} />
                {infraAgent?.title ?? '—'}
              </h4>
              <p style={{ color: '#5E6B73', fontSize: 13, lineHeight: 1.65 }}>{infraAgent?.description ?? ''}</p>
              <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handlePrintPDF}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    background: GRAD,
                    color: '#fff',
                    padding: '10px 18px',
                    borderRadius: '25px',
                    fontSize: 13,
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    boxShadow: '0 4px 12px rgba(31,166,201,0.28)',
                  }}
                >
                  <Download style={{ width: 14, height: 14 }} />
                  Print PDF
                </button>
                <button
                  type="button"
                  onClick={onDownloadGeoJSON}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    background: '#fff',
                    color: '#1FA6C9',
                    padding: '10px 18px',
                    borderRadius: '25px',
                    fontSize: 13,
                    fontWeight: 600,
                    border: '2px solid #1FA6C9',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  <Download style={{ width: 14, height: 14 }} />
                  GeoJSON
                </button>
              </div>
            </article>
          </aside>
        </div>

        {/* ── Water Sustainability Calculator ─────────────────────────── */}
        <div style={{ marginTop: 32 }}>
          <WaterSustainabilityCalculator 
            initialVolume={volumeData.volume}
            initialArea={volumeData.area}
            initialDepth={volumeData.depth}
            initialPopulation={volumeData.population}
            autoCalculate={hasData}
          />
        </div>
      </div>
    </section>
  )
}

export default SustainabilityModeDashboard

