import React, { useState, useEffect } from 'react';
import { Calculator, Droplets, Users, Activity, AlertTriangle, ArrowRight } from 'lucide-react';

const WaterSustainabilityCalculator = ({ initialVolume, initialArea, initialDepth, initialPopulation, autoCalculate = false }) => {
  const [inputs, setInputs] = useState({
    volume: initialVolume || '',
    area: initialArea || '',
    depth: initialDepth || '',
    population: initialPopulation || '4200'
  });
  
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  const calculateSustainability = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Use same calculation constants as volume.py
      const volume = parseFloat(inputs.volume) || 0;
      const area = parseFloat(inputs.area) || 0;
      const depth = parseFloat(inputs.depth) || 0;
      const population = parseInt(inputs.population) || 4200;
      
      // Constants from volume.py (WHO standards)
      const WATER_CONSUMPTION_PER_PERSON_PER_DAY = 100; // liters
      const EVAPORATION_RATE_MM_PER_DAY = 5; // mm/day
      const SEEPAGE_LOSS_PERCENT = 2; // 2% daily
      const SAFETY_MARGIN = 0.85; // Use only 85%
      
      // Calculate losses (same as volume.py)
      const evaporation_m3_per_day = (area * EVAPORATION_RATE_MM_PER_DAY / 1000);
      const consumption_m3_per_day = (population * WATER_CONSUMPTION_PER_PERSON_PER_DAY) / 1000;
      const seepage_m3_per_day = volume * (SEEPAGE_LOSS_PERCENT / 100);
      const total_daily_loss_m3 = consumption_m3_per_day + evaporation_m3_per_day + seepage_m3_per_day;
      
      // Usable water
      const usable_water_m3 = volume * SAFETY_MARGIN;
      
      // Days remaining
      const days_left = total_daily_loss_m3 > 0 ? Math.floor(usable_water_m3 / total_daily_loss_m3) : 999;
      
      // Depletion date
      const depletion_date = new Date();
      depletion_date.setDate(depletion_date.getDate() + days_left);
      
      // Per capita availability
      const per_capita_daily = WATER_CONSUMPTION_PER_PERSON_PER_DAY;
      
      // Stress level (same as volume.py)
      let stress_level = "LOW";
      if (per_capita_daily < 50) {
        stress_level = "CRITICAL";
      } else if (per_capita_daily < 100) {
        stress_level = "HIGH";
      } else if (per_capita_daily < 200) {
        stress_level = "MODERATE";
      }
      
      // Format results
      const data = {
        currentVolume: `${volume.toLocaleString()} m³`,
        usableVolume: `${usable_water_m3.toLocaleString()} m³`,
        daysLeft: `${days_left} days`,
        depletionDate: depletion_date.toLocaleDateString(),
        populationDisplay: population.toLocaleString(),
        perCapitaAvailability: `${per_capita_daily.toFixed(1)} L/day`,
        dailyConsumption: `${consumption_m3_per_day.toFixed(1)} m³/day`,
        evaporationLoss: `${evaporation_m3_per_day.toFixed(2)} m³/day`,
        seepageLoss: `${seepage_m3_per_day.toFixed(2)} m³/day`,
        totalDailyLoss: `${total_daily_loss_m3.toFixed(2)} m³/day`,
        stressLevel: stress_level,
        raw: {
          volume_m3: volume,
          area_m2: area,
          depth_m: depth,
          population: population,
          days_remaining: days_left,
          usable_m3: usable_water_m3,
          consumption_per_day_m3: consumption_m3_per_day,
          evaporation_per_day_m3: evaporation_m3_per_day,
          seepage_per_day_m3: seepage_m3_per_day,
          total_loss_per_day_m3: total_daily_loss_m3,
          per_capita_liters: per_capita_daily
        }
      };
      
      setResults(data);
    } catch (err) {
      setError(err.message);
      console.error('Sustainability calculation error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update inputs when props change
  useEffect(() => {
    if (initialVolume) {
      setInputs({
        volume: initialVolume || '',
        area: initialArea || '',
        depth: initialDepth || '',
        population: initialPopulation || '4200'
      });
    }
  }, [initialVolume, initialArea, initialDepth, initialPopulation]);

  // Auto-calculate on mount if autoCalculate is true and we have initial data
  useEffect(() => {
    if (autoCalculate && inputs.volume && inputs.volume !== '' && !results) {
      calculateSustainability();
    }
  }, [autoCalculate, inputs.volume, results]);

  const getStressColor = (level) => {
    switch (level) {
      case 'CRITICAL': return '#DC2626';
      case 'HIGH': return '#F59E0B';
      case 'MODERATE': return '#F59E0B';
      case 'LOW': return '#10B981';
      default: return '#1FA6C9';
    }
  };

  return (
    <div style={{ 
      background: '#fff', 
      borderRadius: 16, 
      padding: '32px', 
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      border: '1px solid #E0E9ED'
    }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{
            background: 'linear-gradient(135deg, #1FA6C9, #0A5F8C)',
            padding: 12,
            borderRadius: 12,
            display: 'flex'
          }}>
            <Calculator size={24} color="#fff" />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>
            Water Sustainability Calculator
          </h2>
        </div>
        <p style={{ color: '#5E6B73', fontSize: 14, lineHeight: 1.6 }}>
          Calculate how long your water supply will last based on volumetric data and population
        </p>
      </div>

      {/* Input Form */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)', 
        gap: 20,
        marginBottom: 24 
      }}>
        <div>
          <label style={{ 
            display: 'block', 
            fontSize: 13, 
            fontWeight: 600, 
            color: '#1A1A1A',
            marginBottom: 8 
          }}>
            Water Volume (m³)
          </label>
          <input
            type="number"
            name="volume"
            value={inputs.volume}
            onChange={handleInputChange}
            placeholder="e.g., 12400000"
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: 8,
              border: '2px solid #E0E9ED',
              fontSize: 15,
              fontFamily: 'inherit',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#1FA6C9'}
            onBlur={(e) => e.target.style.borderColor = '#E0E9ED'}
          />
        </div>

        <div>
          <label style={{ 
            display: 'block', 
            fontSize: 13, 
            fontWeight: 600, 
            color: '#1A1A1A',
            marginBottom: 8 
          }}>
            Surface Area (m²)
          </label>
          <input
            type="number"
            name="area"
            value={inputs.area}
            onChange={handleInputChange}
            placeholder="e.g., 2480000"
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: 8,
              border: '2px solid #E0E9ED',
              fontSize: 15,
              fontFamily: 'inherit'
            }}
            onFocus={(e) => e.target.style.borderColor = '#1FA6C9'}
            onBlur={(e) => e.target.style.borderColor = '#E0E9ED'}
          />
        </div>

        <div>
          <label style={{ 
            display: 'block', 
            fontSize: 13, 
            fontWeight: 600, 
            color: '#1A1A1A',
            marginBottom: 8 
          }}>
            Average Depth (m)
          </label>
          <input
            type="number"
            name="depth"
            value={inputs.depth}
            onChange={handleInputChange}
            placeholder="e.g., 5"
            step="0.1"
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: 8,
              border: '2px solid #E0E9ED',
              fontSize: 15,
              fontFamily: 'inherit'
            }}
            onFocus={(e) => e.target.style.borderColor = '#1FA6C9'}
            onBlur={(e) => e.target.style.borderColor = '#E0E9ED'}
          />
        </div>

        <div>
          <label style={{ 
            display: 'block', 
            fontSize: 13, 
            fontWeight: 600, 
            color: '#1A1A1A',
            marginBottom: 8 
          }}>
            Population Served
          </label>
          <input
            type="number"
            name="population"
            value={inputs.population}
            onChange={handleInputChange}
            placeholder="e.g., 4200"
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: 8,
              border: '2px solid #E0E9ED',
              fontSize: 15,
              fontFamily: 'inherit'
            }}
            onFocus={(e) => e.target.style.borderColor = '#1FA6C9'}
            onBlur={(e) => e.target.style.borderColor = '#E0E9ED'}
          />
        </div>
      </div>

      {/* Calculate Button */}
      <button
        onClick={calculateSustainability}
        disabled={loading || !inputs.volume}
        style={{
          width: '100%',
          padding: '14px 24px',
          background: loading ? '#9CA3AF' : 'linear-gradient(135deg, #1FA6C9, #0A5F8C)',
          color: '#fff',
          border: 'none',
          borderRadius: 10,
          fontSize: 16,
          fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: 'inherit',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          boxShadow: '0 4px 14px rgba(31, 166, 201, 0.35)',
          transition: 'all 0.3s'
        }}
        onMouseEnter={(e) => !loading && (e.target.style.transform = 'translateY(-2px)')}
        onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
      >
        {loading ? 'Calculating...' : 'Calculate Sustainability'}
        {!loading && <ArrowRight size={18} />}
      </button>

      {/* Error Message */}
      {error && (
        <div style={{
          marginTop: 20,
          padding: 16,
          background: '#FEE2E2',
          border: '1px solid #FCA5A5',
          borderRadius: 8,
          color: '#DC2626',
          fontSize: 14
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Results Section */}
      {results && (
        <div style={{ marginTop: 32, paddingTop: 32, borderTop: '2px solid #E0E9ED' }}>
          {/* Key Metrics */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: 16,
            marginBottom: 24 
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #1FA6C9, #0A5F8C)',
              padding: 20,
              borderRadius: 12,
              color: '#fff',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: 36, fontWeight: 800, marginBottom: 8 }}>
                {results.daysLeft}
              </div>
              <div style={{ fontSize: 12, opacity: 0.9, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Water Supply Duration
              </div>
            </div>

            <div style={{
              background: '#F0F9FF',
              padding: 20,
              borderRadius: 12,
              border: '2px solid #BFDBFE',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#1FA6C9', marginBottom: 8 }}>
                {results.perCapitaAvailability}
              </div>
              <div style={{ fontSize: 12, color: '#5E6B73', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Per Capita Daily
              </div>
            </div>

            <div style={{
              background: getStressColor(results.stressLevel) + '15',
              padding: 20,
              borderRadius: 12,
              border: `2px solid ${getStressColor(results.stressLevel)}40`,
              textAlign: 'center'
            }}>
              <div style={{ 
                fontSize: 18, 
                fontWeight: 700, 
                color: getStressColor(results.stressLevel),
                marginBottom: 8 
              }}>
                {results.stressLevel}
              </div>
              <div style={{ fontSize: 12, color: '#5E6B73', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Water Stress Level
              </div>
            </div>
          </div>

          {/* Detailed Metrics */}
          <div style={{
            background: '#F5F7F8',
            padding: 24,
            borderRadius: 12,
            marginBottom: 24
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: '#1A1A1A' }}>
              📊 Detailed Breakdown
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              <div>
                <div style={{ fontSize: 12, color: '#5E6B73', marginBottom: 4 }}>Daily Consumption</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#1A1A1A' }}>{results.dailyConsumption}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#5E6B73', marginBottom: 4 }}>Evaporation Loss</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#1A1A1A' }}>{results.evaporationLoss}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#5E6B73', marginBottom: 4 }}>Seepage Loss</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#1A1A1A' }}>{results.seepageLoss}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#5E6B73', marginBottom: 4 }}>Total Daily Loss</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#1A1A1A' }}>{results.totalDailyLoss}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#5E6B73', marginBottom: 4 }}>Usable Volume</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#1A1A1A' }}>{results.usableVolume}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#5E6B73', marginBottom: 4 }}>Depletion Date</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#1A1A1A' }}>{results.depletionDate}</div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          {results.recommendations && results.recommendations.length > 0 && (
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: '#1A1A1A' }}>
                💡 Recommendations
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {results.recommendations.map((rec, index) => (
                  <div 
                    key={index}
                    style={{
                      padding: 16,
                      background: rec.level === 'URGENT' ? '#FEE2E2' :
                                 rec.level === 'WARNING' ? '#FEF3C7' :
                                 rec.level === 'ACTION' ? '#DBEAFE' : '#F0FDF4',
                      border: `1px solid ${
                        rec.level === 'URGENT' ? '#FCA5A5' :
                        rec.level === 'WARNING' ? '#FCD34D' :
                        rec.level === 'ACTION' ? '#93C5FD' : '#86EFAC'
                      }`,
                      borderRadius: 8
                    }}
                  >
                    <div style={{ display: 'flex', gap: 12 }}>
                      <span style={{ fontSize: 24 }}>{rec.icon}</span>
                      <div>
                        <div style={{ 
                          fontSize: 14, 
                          fontWeight: 600, 
                          color: '#1A1A1A',
                          marginBottom: 4 
                        }}>
                          {rec.title}
                        </div>
                        <div style={{ fontSize: 13, color: '#5E6B73', lineHeight: 1.5 }}>
                          {rec.description}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WaterSustainabilityCalculator;
