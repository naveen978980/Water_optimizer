import { useState } from 'react'
import { Camera, CheckCircle2, Upload, XCircle } from 'lucide-react'

const GRAD = 'linear-gradient(135deg, #1FA6C9, #0A5F8C)'

function CitizenPortal({ profile, mission, uploadUrl, waterBodyUploadUrl }) {
  // ── Gauge image upload state ──────────────────────────────────────
  const [selectedFile, setSelectedFile] = useState(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [result, setResult] = useState(null)
  const [uploadError, setUploadError] = useState(null)

  // ── Water body image upload state ─────────────────────────────────
  const [selectedWaterFile, setSelectedWaterFile] = useState(null)
  const [waterVerifying, setWaterVerifying] = useState(false)
  const [waterResult, setWaterResult] = useState(null)
  const [waterError, setWaterError] = useState(null)

  const onUpload = async () => {
    // 🔍 1️⃣ Check if file is selected
    console.log('=== GAUGE IMAGE UPLOAD DEBUG START ===')
    console.log('1️⃣ Selected file:', selectedFile)
    
    if (!selectedFile) {
      console.log('❌ No file selected')
      return
    }
    
    setResult(null)
    setUploadError(null)
    setIsVerifying(true)
    
    try {
      let base64Image
      let filename

      console.log('2️⃣ Using uploaded file:', selectedFile.name, selectedFile.type, selectedFile.size, 'bytes')
      
      // Use uploaded file
      base64Image = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => {
            console.log('3️⃣ Base64 full string (first 100 chars):', reader.result.substring(0, 100))
            const base64Only = reader.result.split(',')[1]
            console.log('3️⃣ Base64 cleaned (first 100 chars):', base64Only.substring(0, 100))
            console.log('3️⃣ Base64 length:', base64Only.length, 'characters')
            resolve(base64Only)
          }
          reader.onerror = (err) => {
            console.error('❌ FileReader error:', err)
            reject(err)
          }
          reader.readAsDataURL(selectedFile)
        })
      filename = selectedFile.name

      // 🔍 4️⃣ Check request payload
      const payload = { image: base64Image, filename, folder: 'g' }
      console.log('4️⃣ Sending payload:', {
        filename: payload.filename,
        folder: payload.folder,
        imageLength: payload.image.length,
        imagePreview: payload.image.substring(0, 100) + '...'
      })
      console.log('4️⃣ Upload URL:', uploadUrl)

      // 🔍 5️⃣ Check fetch request
      console.log('5️⃣ Making POST request to Lambda...')
      const res = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      
      console.log('5️⃣ Response status:', res.status, res.statusText)
      console.log('5️⃣ Response headers:', Object.fromEntries(res.headers.entries()))
      
      const data = await res.json()
      console.log('5️⃣ Lambda response data:', data)
      
      if (!res.ok) {
        console.error('❌ Lambda error response:', data)
        throw new Error(data.error ?? `Server error: ${res.status}`)
      }
      
      console.log('✅ Upload successful!')
      setResult({
        level: data.water_level ? `${data.water_level}m` : (data.level ?? 'Verified'),
        gaugePosition: data.gauge_position, // 0-1 range (e.g., 0.93)
        scaleMin: data.scale_min,
        scaleMax: data.scale_max,
        location: data.location ?? 'GPS lock confirmed',
        imageName: filename,
        verifiedAt: data.verifiedAt ?? new Date().toLocaleTimeString(),
        message: data.message,
        alertSent: data.alert_sent,
        status: data.status
      })
      
    } catch (err) {
      console.error('❌ Upload error:', err)
      console.error('❌ Error message:', err.message)
      console.error('❌ Error stack:', err.stack)
      setUploadError(err.message ?? 'Upload failed. Please check your connection and try again.')
    } finally {
      setIsVerifying(false)
      console.log('=== GAUGE IMAGE UPLOAD DEBUG END ===')
    }
  }

  const onWaterUpload = async () => {
    if (!selectedWaterFile) return
    setWaterResult(null)
    setWaterError(null)
    setWaterVerifying(true)
    try {
      const base64Image = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result.split(',')[1])
        reader.onerror = reject
        reader.readAsDataURL(selectedWaterFile)
      })
      const res = await fetch(waterBodyUploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image, filename: selectedWaterFile.name, type: 'water_body' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? `Server error: ${res.status}`)
      setWaterResult({
        area: data.area_m2 ?? data.area ?? null,
        depth: data.depth_m ?? data.depth ?? null,
        volume: data.volume_m3 ?? data.volume ?? null,
        imageName: selectedWaterFile.name,
        processedAt: data.processedAt ?? new Date().toLocaleTimeString(),
        message: data.message,
      })
    } catch (err) {
      setWaterError(err.message ?? 'Upload failed. Please check your connection and try again.')
    } finally {
      setWaterVerifying(false)
    }
  }

  return (
    <section style={{ background: '#F5F7F8', padding: '60px 0', minHeight: 'calc(100vh - 72px)' }}>
      <div style={{ padding: '0 32px' }}>

        {/* ── Profile card ───────────────────────────────────────────────── */}
        <div
          style={{
            background: '#fff',
            borderRadius: 12,
            padding: 28,
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            border: '1px solid #eef1f3',
          }}
        >
          {/* Header row */}
          <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <img
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid #d0ecf4',
                }}
                src={profile?.avatarUrl ?? ''}
                alt="Citizen avatar"
              />
              <div>
                <p style={{ color: '#5E6B73', fontSize: 13 }}>Welcome back</p>
                <h2 style={{ color: '#1A1A1A', fontSize: 17, fontWeight: 600, marginTop: 2 }}>
                  {profile?.greeting ?? '—'}
                </h2>
              </div>
            </div>
          </div>

          {/* ── Upload sections ────────────────────────────────────────── */}
          <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="os-upload-grid">

            {/* ── Gauge Image upload ── */}
            <div style={{ background: '#f8fafb', borderRadius: 12, padding: 20, border: '1.5px solid #d0ecf4' }}>
            <h4
              style={{
                color: '#1A1A1A',
                fontSize: 13,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                marginBottom: 6,
              }}
            >
              Gauge Image
            </h4>
            <p style={{ color: '#5E6B73', fontSize: 13, lineHeight: 1.65, marginBottom: 14 }}>
              Upload a river gauge photo (JPEG) or paste an image URL for AI water-level extraction and GPS verification.
            </p>

            {/* File Upload */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: 12,
                alignItems: 'start',
              }}
            >
                <label
                  style={{
                    display: 'block',
                    border: '1.5px dashed #c4d9e0',
                    borderRadius: 10,
                    background: '#f8fafb',
                    padding: '12px 14px',
                    cursor: 'pointer',
                  }}
                >
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 7,
                      color: '#5E6B73',
                      fontSize: 13,
                      marginBottom: 7,
                    }}
                  >
                    <Camera style={{ width: 15, height: 15 }} />
                    Select JPEG Photo
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    style={{ fontSize: 13, color: '#5E6B73', width: '100%' }}
                  />
                </label>

                <button
                  type="button"
                  onClick={onUpload}
                  disabled={isVerifying || !selectedFile}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    justifyContent: 'center',
                    background: GRAD,
                    color: '#fff',
                    padding: '13px 24px',
                    borderRadius: '25px',
                    fontSize: 14,
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    opacity: isVerifying || !selectedFile ? 0.65 : 1,
                    whiteSpace: 'nowrap',
                    fontFamily: 'inherit',
                    boxShadow: '0 4px 14px rgba(31,166,201,0.30)',
                  }}
                >
                  {isVerifying ? (
                    <span
                      className="os-spinner"
                      style={{ display: 'inline-block', width: 15, height: 15, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%' }}
                    />
                  ) : (
                    <Upload style={{ width: 15, height: 15 }} />
                  )}
                  {isVerifying ? 'Processing…' : 'Upload'}
                </button>
              </div>

            {isVerifying && (
              <div
                style={{
                  marginTop: 14,
                  background: '#e6f7fb',
                  border: '1px solid #aadeed',
                  borderRadius: 10,
                  padding: '12px 16px',
                  color: '#1B8FA8',
                  fontSize: 14,
                }}
              >
                AI Verifying GPS &amp; Extracting Water Level…
              </div>
            )}

            {uploadError && (
              <div
                style={{
                  marginTop: 14,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: 10,
                  padding: '12px 16px',
                  color: '#dc2626',
                  fontSize: 14,
                }}
              >
                <XCircle style={{ width: 16, height: 16, flexShrink: 0 }} />
                {uploadError}
              </div>
            )}

            {result && (
              <div
                style={{
                  marginTop: 14,
                  background: '#f0fdf4',
                  border: '1px solid #86efac',
                  borderRadius: 10,
                  padding: '20px',
                }}
              >
                {/* Title */}
                <p style={{ color: '#15803d', fontSize: 14, fontWeight: 700, textAlign: 'center', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  WATER LEVEL READING
                </p>
                
                {/* Model Output Display */}
                <div style={{ 
                  background: '#dcfce7', 
                  borderRadius: 8, 
                  padding: '16px',
                  marginBottom: 16
                }}>
                  {/* Scale Range */}
                  {result.scaleMin !== undefined && result.scaleMax !== undefined && (
                    <div style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #86efac' }}>
                      <p style={{ color: '#15803d', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Scale Range:</p>
                      <p style={{ color: '#15803d', fontSize: 20, fontWeight: 800 }}>
                        {result.scaleMin}m - {result.scaleMax}m
                      </p>
                    </div>
                  )}
                  
                  {/* Water Line Position */}
                  {result.gaugePosition !== undefined && (
                    <div style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #86efac' }}>
                      <p style={{ color: '#15803d', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Water Line Position:</p>
                      <p style={{ color: '#15803d', fontSize: 20, fontWeight: 800 }}>
                        {(result.gaugePosition * 100).toFixed(1)}% from top ({result.gaugePosition})
                      </p>
                    </div>
                  )}
                  
                  {/* Estimated Water Level */}
                  {result.level && (
                    <div>
                      <p style={{ color: '#15803d', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Estimated Water Level:</p>
                      <p style={{ color: '#15803d', fontSize: 28, fontWeight: 800 }}>
                        {result.level}
                      </p>
                    </div>
                  )}
                </div>

                {/* Alert Status */}
                {result.status === 'high' && (
                  <div style={{ 
                    background: '#fee2e2', 
                    border: '1px solid #fca5a5',
                    borderRadius: 8, 
                    padding: '12px',
                    marginBottom: 12,
                    textAlign: 'center'
                  }}>
                    <p style={{ color: '#dc2626', fontSize: 14, fontWeight: 700 }}>
                      ⚠️ HIGH ALERT
                    </p>
                  </div>
                )}
                
                {/* Success Message */}
                <p style={{ color: '#15803d', fontSize: 14, fontWeight: 600, textAlign: 'center' }}>
                  ✓ Image uploaded successfully
                </p>
                
                {/* SNS Alert */}
                {result.alertSent && (
                  <p style={{ color: '#ea580c', fontSize: 13, fontWeight: 600, textAlign: 'center', marginTop: 8 }}>
                    🚨 SNS Alert Sent
                  </p>
                )}
              </div>
            )}
            </div>{/* end gauge card */}

            {/* ── Water Body Image upload ── */}
            <div style={{ background: '#f0f9ff', borderRadius: 12, padding: 20, border: '1.5px solid #7dd3fc' }}>
              <h4 style={{ color: '#1A1A1A', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 6 }}>
                Water Body Image
              </h4>
              <p style={{ color: '#5E6B73', fontSize: 13, lineHeight: 1.65, marginBottom: 14 }}>
                Upload a satellite or drone image (JPEG) to map water body boundaries and estimate volume.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, alignItems: 'start' }}>
                <label style={{ display: 'block', border: '1.5px dashed #7dd3fc', borderRadius: 10, background: '#fff', padding: '12px 14px', cursor: 'pointer' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 7, color: '#5E6B73', fontSize: 13, marginBottom: 7 }}>
                    <Camera style={{ width: 15, height: 15 }} />
                    Select JPEG Photo
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg"
                    onChange={(e) => setSelectedWaterFile(e.target.files?.[0] || null)}
                    style={{ fontSize: 13, color: '#5E6B73', width: '100%' }}
                  />
                </label>
                <button
                  type="button"
                  onClick={onWaterUpload}
                  disabled={waterVerifying || !selectedWaterFile}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center',
                    background: 'linear-gradient(135deg, #0ea5e9, #0369a1)',
                    color: '#fff', padding: '13px 20px', borderRadius: '25px',
                    fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer',
                    opacity: waterVerifying || !selectedWaterFile ? 0.65 : 1,
                    whiteSpace: 'nowrap', fontFamily: 'inherit',
                    boxShadow: '0 4px 14px rgba(14,165,233,0.30)',
                  }}
                >
                  {waterVerifying ? (
                    <span className="os-spinner" style={{ display: 'inline-block', width: 15, height: 15, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%' }} />
                  ) : (
                    <Upload style={{ width: 15, height: 15 }} />
                  )}
                  {waterVerifying ? 'Analysing…' : 'Analyse'}
                </button>
              </div>

              {waterVerifying && (
                <div style={{ marginTop: 12, background: '#e0f2fe', border: '1px solid #7dd3fc', borderRadius: 10, padding: '12px 16px', color: '#0369a1', fontSize: 13 }}>
                  Detecting water boundaries…
                </div>
              )}
              {waterError && (
                <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 16px', color: '#dc2626', fontSize: 13 }}>
                  <XCircle style={{ width: 16, height: 16, flexShrink: 0 }} />{waterError}
                </div>
              )}
              {waterResult && (
                <div style={{ marginTop: 12, background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10, padding: '14px', display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <p style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#15803d', fontWeight: 600, fontSize: 14 }}>
                    <CheckCircle2 style={{ width: 16, height: 16 }} />
                    Water Body Detected
                  </p>
                  {waterResult.area != null && <p style={{ color: '#16a34a', fontSize: 13 }}>Surface Area: <strong>{Number(waterResult.area).toLocaleString()} m²</strong></p>}
                  {waterResult.depth != null && <p style={{ color: '#16a34a', fontSize: 13 }}>Avg Depth: <strong>{waterResult.depth} m</strong></p>}
                  {waterResult.volume != null && <p style={{ color: '#16a34a', fontSize: 13 }}>Est. Volume: <strong>{Number(waterResult.volume).toLocaleString()} m³</strong></p>}
                  {waterResult.message && <p style={{ color: '#15803d', fontSize: 13, fontWeight: 600 }}>✓ {waterResult.message}</p>}
                  <p style={{ color: '#16a34a', fontSize: 12, opacity: 0.8 }}>Image: {waterResult.imageName} · {waterResult.processedAt}</p>
                </div>
              )}
            </div>{/* end water body card */}

          </div>{/* end upload grid */}
        </div>
      </div>
    </section>
  )
}

export default CitizenPortal