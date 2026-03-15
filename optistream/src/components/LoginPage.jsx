import { useState, useEffect } from 'react'
import { Droplets, Eye, EyeOff, Lock, Mail, ArrowLeft, Home } from 'lucide-react'
import { useSignInWithEmailAndPassword } from 'react-firebase-hooks/auth'
import { auth } from '../config/firebase'
import { useUser, useUserActions } from '../store/userStore.jsx'

const GRAD = 'linear-gradient(135deg, #1FA6C9 0%, #0A5F8C 100%)'

function InputField({ icon: Icon, type, placeholder, value, onChange, rightSlot }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        border: '1.5px solid #d0dde3',
        borderRadius: 10,
        padding: '0 16px',
        background: '#f8fafb',
        transition: 'border-color 0.2s',
      }}
      onFocus={(e) => (e.currentTarget.style.borderColor = '#1FA6C9')}
      onBlur={(e) => (e.currentTarget.style.borderColor = '#d0dde3')}
    >
      <Icon style={{ width: 17, height: 17, color: '#1FA6C9', flexShrink: 0 }} />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={{
          flex: 1,
          border: 'none',
          background: 'transparent',
          outline: 'none',
          fontSize: 15,
          color: '#1A1A1A',
          padding: '14px 0',
          fontFamily: 'inherit',
        }}
      />
      {rightSlot}
    </div>
  )
}

function LoginPage({ onNavigate }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('public')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Firebase hooks
  const [signInWithEmailAndPassword, user, firebaseLoading, firebaseError] = useSignInWithEmailAndPassword(auth)
  const { setUid } = useUserActions()

  // Handle successful Firebase login
  useEffect(() => {
    if (user?.user) {
      const firebaseUid = user.user.uid
      setUid(firebaseUid)
      console.log('Login successful:', { uid: firebaseUid, email, role })
      setLoading(false)
      // Navigate after successful login
      setTimeout(() => onNavigate('home'), 500)
    }
  }, [user])

  // Handle Firebase errors
  useEffect(() => {
    if (firebaseError) {
      console.error('Firebase login error:', firebaseError)
      let errorMessage = 'Login failed. Please try again.'
      if (firebaseError.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email.'
      } else if (firebaseError.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password.'
      } else if (firebaseError.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.'
      } else if (firebaseError.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.'
      }
      setError(errorMessage)
      setLoading(false)
    }
  }, [firebaseError])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password || !role) { setError('Please fill in all fields.'); return }
    setError(null)
    setLoading(true)
    
    try {
      // Sign in with Firebase
      await signInWithEmailAndPassword(email, password)
    } catch (err) {
      console.error('Login error:', err)
      setError('An unexpected error occurred.')
      setLoading(false)
    }
  }

  return (
    <>
    {/* Navigation Bar */}
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 30,
        background: '#fff',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        borderBottom: '1px solid #e8eef1',
      }}
    >
      <div
        style={{
          padding: '0 clamp(16px, 5vw, 32px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 'clamp(56px, 10vw, 68px)',
          maxWidth: '100%',
        }}
      >
        {/* Back Button */}
        <button
          onClick={() => onNavigate('home')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 16px',
            borderRadius: '20px',
            border: '1.5px solid #e0e9ed',
            background: '#fff',
            color: '#1FA6C9',
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontFamily: 'inherit',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f0f9ff'
            e.currentTarget.style.borderColor = '#1FA6C9'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#fff'
            e.currentTarget.style.borderColor = '#e0e9ed'
          }}
        >
          <ArrowLeft style={{ width: 16, height: 16 }} />
          <span className="back-text">Back</span>
        </button>

        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 2vw, 12px)' }}>
          <div
            style={{
              background: GRAD,
              borderRadius: 'clamp(8px, 2vw, 12px)',
              padding: 'clamp(6px, 1.5vw, 8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Droplets style={{ width: 'clamp(16px, 3vw, 20px)', height: 'clamp(16px, 3vw, 20px)', color: '#fff' }} />
          </div>
          <h1 style={{ color: '#1A1A1A', fontWeight: 700, fontSize: 'clamp(14px, 3vw, 17px)', lineHeight: 1.3 }}>
            OptiStream
          </h1>
        </div>

        {/* Home Button */}
        <button
          onClick={() => onNavigate('home')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: '1.5px solid #e0e9ed',
            background: '#fff',
            color: '#5E6B73',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f0f9ff'
            e.currentTarget.style.color = '#1FA6C9'
            e.currentTarget.style.borderColor = '#1FA6C9'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#fff'
            e.currentTarget.style.color = '#5E6B73'
            e.currentTarget.style.borderColor = '#e0e9ed'
          }}
        >
          <Home style={{ width: 18, height: 18 }} />
        </button>
      </div>
    </header>

    <div
      className="auth-page-container"
      style={{
        minHeight: 'calc(100vh - 68px)',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      {/* ── Left panel – brand ─────────────────────────────────────────── */}
      <div
        className="auth-brand-panel"
        style={{
          background: GRAD,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '60px 48px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* decorative circles */}
        <div style={{ position: 'absolute', top: -140, left: -140, width: 500, height: 500, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -100, right: -100, width: 360, height: 360, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 400 }}>
          {/* Logo */}
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.18)', borderRadius: 20, width: 72, height: 72, marginBottom: 28 }}>
            <Droplets style={{ width: 36, height: 36, color: '#fff' }} />
          </div>

          <h1 style={{ color: '#fff', fontSize: 42, fontWeight: 800, lineHeight: 1.15, marginBottom: 16, letterSpacing: '-1px' }}>
            Welcome back to<br />
            <span style={{ fontFamily: "'Pacifico', cursive", fontWeight: 400, fontSize: 38 }}>OptiStream</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: 16, lineHeight: 1.75, marginBottom: 48 }}>
            Your AI-GIS hydrology platform for real-time flood monitoring and water sustainability intelligence.
          </p>

          {/* Feature pills */}
          {['🌊 Live Flood Maps', '🛡️ Citizen Reporting', '🌱 Sustainability Insights'].map((f) => (
            <div
              key={f}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                margin: '5px 6px',
                background: 'rgba(255,255,255,0.14)',
                border: '1px solid rgba(255,255,255,0.26)',
                borderRadius: 25,
                padding: '8px 20px',
                color: '#fff',
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              {f}
            </div>
          ))}

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginTop: 56, borderTop: '1px solid rgba(255,255,255,0.22)', paddingTop: 36 }}>
            {[['3+', 'Locations'], ['4,200', 'Citizens'], ['21', 'Days Forecasted']].map(([n, l]) => (
              <div key={l}>
                <p style={{ color: '#fff', fontSize: 28, fontWeight: 800, lineHeight: 1 }}>{n}</p>
                <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 5 }}>{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel – form ─────────────────────────────────────────── */}
      <div
        className="auth-form-panel"
        style={{
          background: '#fff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '60px 48px',
        }}
      >
        <div className="auth-form-content" style={{ width: '100%', maxWidth: 420 }}>
          <p style={{ color: '#1FA6C9', fontSize: 12, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 10 }}>
            Sign In
          </p>
          <h2 style={{ color: '#1A1A1A', fontSize: 30, fontWeight: 700, lineHeight: 1.2, marginBottom: 8 }}>
            Log in to your account
          </h2>
          <p style={{ color: '#5E6B73', fontSize: 15, marginBottom: 36 }}>
            Don't have an account?{' '}
            <button
              onClick={() => onNavigate('signup')}
              style={{ color: '#1FA6C9', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, fontFamily: 'inherit', textDecoration: 'underline' }}
            >
              Sign up free
            </button>
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Role Selection */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <label style={{ color: '#1A1A1A', fontSize: 13, fontWeight: 600 }}>Login as</label>
              <div style={{ display: 'flex', gap: 12 }}>
                <label
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '14px 16px',
                    border: `2px solid ${role === 'public' ? '#1FA6C9' : '#d0dde3'}`,
                    borderRadius: 10,
                    background: role === 'public' ? '#f0f9ff' : '#f8fafb',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <input
                    type="radio"
                    name="role"
                    value="public"
                    checked={role === 'public'}
                    onChange={(e) => setRole(e.target.value)}
                    style={{ accentColor: '#1FA6C9', width: 16, height: 16, cursor: 'pointer' }}
                  />
                  <div>
                    <p style={{ color: '#1A1A1A', fontSize: 14, fontWeight: 600, lineHeight: 1 }}>👤 Public</p>
                    <p style={{ color: '#5E6B73', fontSize: 11, marginTop: 3 }}>Citizen user</p>
                  </div>
                </label>
                <label
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '14px 16px',
                    border: `2px solid ${role === 'officer' ? '#1FA6C9' : '#d0dde3'}`,
                    borderRadius: 10,
                    background: role === 'officer' ? '#f0f9ff' : '#f8fafb',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <input
                    type="radio"
                    name="role"
                    value="officer"
                    checked={role === 'officer'}
                    onChange={(e) => setRole(e.target.value)}
                    style={{ accentColor: '#1FA6C9', width: 16, height: 16, cursor: 'pointer' }}
                  />
                  <div>
                    <p style={{ color: '#1A1A1A', fontSize: 14, fontWeight: 600, lineHeight: 1 }}>🏛️ Govt Officer</p>
                    <p style={{ color: '#5E6B73', fontSize: 11, marginTop: 3 }}>Official access</p>
                  </div>
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ color: '#1A1A1A', fontSize: 13, fontWeight: 600 }}>Email Address</label>
              <InputField
                icon={Mail}
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ color: '#1A1A1A', fontSize: 13, fontWeight: 600 }}>Password</label>
                <button type="button" style={{ color: '#1FA6C9', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                  Forgot password?
                </button>
              </div>
              <InputField
                icon={Lock}
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                rightSlot={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#5E6B73', display: 'flex', alignItems: 'center' }}
                  >
                    {showPassword
                      ? <EyeOff style={{ width: 17, height: 17 }} />
                      : <Eye style={{ width: 17, height: 17 }} />}
                  </button>
                }
              />
            </div>

            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '11px 14px', color: '#dc2626', fontSize: 13 }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 8,
                background: loading ? '#a8d8e8' : GRAD,
                color: '#fff',
                padding: '15px',
                borderRadius: 25,
                fontSize: 15,
                fontWeight: 700,
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                boxShadow: loading ? 'none' : '0 6px 20px rgba(31,166,201,0.38)',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              {loading && (
                <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
              )}
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '28px 0' }}>
            <div style={{ flex: 1, height: 1, background: '#e8eef1' }} />
            <span style={{ color: '#5E6B73', fontSize: 13 }}>or continue with</span>
            <div style={{ flex: 1, height: 1, background: '#e8eef1' }} />
          </div>

          {/* Social buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[['G', 'Google'], ['A', 'Amazon']].map(([letter, label]) => (
              <button
                key={label}
                type="button"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '12px',
                  borderRadius: 25,
                  border: '1.5px solid #d0dde3',
                  background: '#fff',
                  color: '#1A1A1A',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                <span style={{ fontWeight: 700, color: '#1FA6C9' }}>{letter}</span>
                {label}
              </button>
            ))}
          </div>

          <p style={{ marginTop: 36, textAlign: 'center', color: '#5E6B73', fontSize: 12, lineHeight: 1.7 }}>
            By signing in, you agree to our{' '}
            <span style={{ color: '#1FA6C9', cursor: 'pointer' }}>Terms of Service</span> and{' '}
            <span style={{ color: '#1FA6C9', cursor: 'pointer' }}>Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>

    {/* Responsive CSS */}
    <style>{`
      /* Mobile Layout */
      @media (max-width: 768px) {
        .back-text {
          display: none;
        }

        .auth-page-container {
          grid-template-columns: 1fr !important;
          grid-template-rows: auto 1fr !important;
          min-height: calc(100vh - 56px) !important;
        }

        .auth-brand-panel {
          padding: 32px 24px !important;
          min-height: auto !important;
        }

        .auth-brand-panel h1 {
          font-size: 28px !important;
          margin-bottom: 12px !important;
        }

        .auth-brand-panel h1 span {
          font-size: 26px !important;
        }

        .auth-brand-panel p {
          font-size: 14px !important;
          margin-bottom: 24px !important;
        }

        .auth-brand-panel > div:last-child > div:last-child {
          display: none !important;
        }

        .auth-form-panel {
          padding: 32px 24px !important;
        }

        .auth-form-content {
          max-width: 100% !important;
        }

        .auth-form-content h2 {
          font-size: 24px !important;
        }

        /* Hide "Back" text on mobile, show only icon */
        header button span:not(.lucide) {
          display: none;
        }
      }

      /* Extra small mobile */
      @media (max-width: 480px) {
        .auth-brand-panel {
          padding: 24px 16px !important;
        }

        .auth-brand-panel h1 {
          font-size: 24px !important;
        }

        .auth-brand-panel h1 span {
          font-size: 22px !important;
        }

        .auth-form-panel {
          padding: 24px 16px !important;
        }

        .auth-form-content h2 {
          font-size: 22px !important;
        }

        .auth-form-content form {
          gap: 14px !important;
        }
      }
    `}</style>
    </>
  )
}

export default LoginPage
