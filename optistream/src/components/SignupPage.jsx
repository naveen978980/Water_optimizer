import { useState, useEffect } from 'react'
import { Droplets, Eye, EyeOff, Lock, Mail, User, ArrowLeft, Home } from 'lucide-react'
import { useCreateUserWithEmailAndPassword } from 'react-firebase-hooks/auth'
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

function PasswordStrength({ password }) {
  const score = [/.{8,}/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((r) => r.test(password)).length
  const levels = [
    { label: 'Weak',    color: '#ef4444' },
    { label: 'Fair',    color: '#f97316' },
    { label: 'Good',    color: '#eab308' },
    { label: 'Strong',  color: '#22c55e' },
  ]
  if (!password) return null
  const level = levels[score - 1] ?? levels[0]
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
        {levels.map((l, i) => (
          <div
            key={l.label}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 4,
              background: i < score ? level.color : '#e0e9ed',
              transition: 'background 0.3s',
            }}
          />
        ))}
      </div>
      <p style={{ color: level.color, fontSize: 12, fontWeight: 500 }}>{level.label} password</p>
    </div>
  )
}

function SignupPage({ onNavigate }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', role: 'public' })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Firebase hooks
  const [createUserWithEmailAndPassword, user, firebaseLoading, firebaseError] = useCreateUserWithEmailAndPassword(auth)
  const { setUid } = useUserActions()
  const { uid } = useUser()

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  // Handle successful Firebase signup
  useEffect(() => {
    if (user?.user) {
      const firebaseUid = user.user.uid
      setUid(firebaseUid)
      console.log('Signup successful:', { uid: firebaseUid, email: form.email, name: form.name, role: form.role })
      
      // Optional: Send user data to your backend/database
      // fetch('/api/user', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ uid: firebaseUid, email: form.email, name: form.name, role: form.role })
      // }).catch(err => console.error('Error saving user data:', err))
      
      setLoading(false)
      // Navigate after successful signup
      setTimeout(() => onNavigate('home'), 500)
    }
  }, [user])

  // Handle Firebase errors
  useEffect(() => {
    if (firebaseError) {
      console.error('Firebase signup error:', firebaseError)
      let errorMessage = 'Signup failed. Please try again.'
      if (firebaseError.code === 'auth/email-already-in-use') {
        errorMessage = 'Email already in use. Please login instead.'
      } else if (firebaseError.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Use at least 6 characters.'
      } else if (firebaseError.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.'
      }
      setError(errorMessage)
      setLoading(false)
    }
  }, [firebaseError])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password || !form.confirm || !form.role) {
      setError('Please fill in all fields.'); return
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.'); return
    }
    if (!agreed) {
      setError('Please accept the Terms of Service.'); return
    }
    setError(null)
    setLoading(true)
    
    try {
      // Create Firebase user
      await createUserWithEmailAndPassword(form.email, form.password)
    } catch (err) {
      console.error('Signup error:', err)
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
      {/* ── Left panel – form ─────────────────────────────────────────── */}
      <div
        className="auth-form-panel"
        style={{
          background: '#fff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '60px 48px',
          overflowY: 'auto',
        }}
      >
        <div className="auth-form-content" style={{ width: '100%', maxWidth: 420 }}>
          <p style={{ color: '#1FA6C9', fontSize: 12, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 10 }}>
            Create Account
          </p>
          <h2 style={{ color: '#1A1A1A', fontSize: 30, fontWeight: 700, lineHeight: 1.2, marginBottom: 8 }}>
            Join OptiStream today
          </h2>
          <p style={{ color: '#5E6B73', fontSize: 15, marginBottom: 36 }}>
            Already have an account?{' '}
            <button
              onClick={() => onNavigate('login')}
              style={{ color: '#1FA6C9', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, fontFamily: 'inherit', textDecoration: 'underline' }}
            >
              Sign in
            </button>
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Role Selection */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <label style={{ color: '#1A1A1A', fontSize: 13, fontWeight: 600 }}>Register as</label>
              <div style={{ display: 'flex', gap: 12 }}>
                <label
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '14px 16px',
                    border: `2px solid ${form.role === 'public' ? '#1FA6C9' : '#d0dde3'}`,
                    borderRadius: 10,
                    background: form.role === 'public' ? '#f0f9ff' : '#f8fafb',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <input
                    type="radio"
                    name="role"
                    value="public"
                    checked={form.role === 'public'}
                    onChange={set('role')}
                    style={{ accentColor: '#1FA6C9', width: 16, height: 16, cursor: 'pointer' }}
                  />
                  <div>
                    <p style={{ color: '#1A1A1A', fontSize: 14, fontWeight: 600, lineHeight: 1 }}>👤 Public</p>
                    <p style={{ color: '#5E6B73', fontSize: 11, marginTop: 3 }}>Citizen account</p>
                  </div>
                </label>
                <label
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '14px 16px',
                    border: `2px solid ${form.role === 'officer' ? '#1FA6C9' : '#d0dde3'}`,
                    borderRadius: 10,
                    background: form.role === 'officer' ? '#f0f9ff' : '#f8fafb',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <input
                    type="radio"
                    name="role"
                    value="officer"
                    checked={form.role === 'officer'}
                    onChange={set('role')}
                    style={{ accentColor: '#1FA6C9', width: 16, height: 16, cursor: 'pointer' }}
                  />
                  <div>
                    <p style={{ color: '#1A1A1A', fontSize: 14, fontWeight: 600, lineHeight: 1 }}>🏛️ Govt Officer</p>
                    <p style={{ color: '#5E6B73', fontSize: 11, marginTop: 3 }}>Official account</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Full name */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ color: '#1A1A1A', fontSize: 13, fontWeight: 600 }}>Full Name</label>
              <InputField
                icon={User}
                type="text"
                placeholder="Your full name"
                value={form.name}
                onChange={set('name')}
              />
            </div>

            {/* Email */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ color: '#1A1A1A', fontSize: 13, fontWeight: 600 }}>Email Address</label>
              <InputField
                icon={Mail}
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={set('email')}
              />
            </div>

            {/* Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ color: '#1A1A1A', fontSize: 13, fontWeight: 600 }}>Password</label>
              <InputField
                icon={Lock}
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                value={form.password}
                onChange={set('password')}
                rightSlot={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#5E6B73', display: 'flex', alignItems: 'center' }}
                  >
                    {showPassword ? <EyeOff style={{ width: 17, height: 17 }} /> : <Eye style={{ width: 17, height: 17 }} />}
                  </button>
                }
              />
              <PasswordStrength password={form.password} />
            </div>

            {/* Confirm password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ color: '#1A1A1A', fontSize: 13, fontWeight: 600 }}>Confirm Password</label>
              <InputField
                icon={Lock}
                type={showConfirm ? 'text' : 'password'}
                placeholder="Repeat your password"
                value={form.confirm}
                onChange={set('confirm')}
                rightSlot={
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#5E6B73', display: 'flex', alignItems: 'center' }}
                  >
                    {showConfirm ? <EyeOff style={{ width: 17, height: 17 }} /> : <Eye style={{ width: 17, height: 17 }} />}
                  </button>
                }
              />
              {form.confirm && form.password !== form.confirm && (
                <p style={{ color: '#ef4444', fontSize: 12, fontWeight: 500 }}>Passwords do not match</p>
              )}
            </div>

            {/* Terms */}
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                style={{ marginTop: 3, accentColor: '#1FA6C9', width: 15, height: 15, flexShrink: 0 }}
              />
              <span style={{ color: '#5E6B73', fontSize: 13, lineHeight: 1.6 }}>
                I agree to the{' '}
                <span style={{ color: '#1FA6C9', cursor: 'pointer' }}>Terms of Service</span> and{' '}
                <span style={{ color: '#1FA6C9', cursor: 'pointer' }}>Privacy Policy</span>
              </span>
            </label>

            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '11px 14px', color: '#dc2626', fontSize: 13 }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 4,
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
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '28px 0' }}>
            <div style={{ flex: 1, height: 1, background: '#e8eef1' }} />
            <span style={{ color: '#5E6B73', fontSize: 13 }}>or sign up with</span>
            <div style={{ flex: 1, height: 1, background: '#e8eef1' }} />
          </div>

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
        </div>
      </div>

      {/* ── Right panel – brand ────────────────────────────────────────── */}
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
        <div style={{ position: 'absolute', top: -160, right: -160, width: 520, height: 520, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -100, left: -100, width: 380, height: 380, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 400 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.18)', borderRadius: 20, width: 72, height: 72, marginBottom: 28 }}>
            <Droplets style={{ width: 36, height: 36, color: '#fff' }} />
          </div>

          <h2 style={{ color: '#fff', fontSize: 38, fontWeight: 800, lineHeight: 1.2, marginBottom: 16, letterSpacing: '-0.5px' }}>
            Start protecting your community
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: 16, lineHeight: 1.75, marginBottom: 48 }}>
            Join thousands of citizens and engineers using OptiStream to monitor floods and manage water sustainability.
          </p>

          {/* Benefit cards */}
          {[
            { icon: '🌊', title: 'Real-Time Monitoring', desc: 'Live gauge data updated every few minutes from Lambda.' },
            { icon: '🛡️', title: 'Earn Trust Points', desc: 'Upload gauge photos and build your citizen trust score.' },
            { icon: '🌱', title: 'Sustainability Reports', desc: 'AI-driven settlement autonomy and infrastructure prescriptions.' },
          ].map((item) => (
            <div
              key={item.title}
              style={{
                display: 'flex',
                gap: 16,
                textAlign: 'left',
                background: 'rgba(255,255,255,0.10)',
                border: '1px solid rgba(255,255,255,0.20)',
                borderRadius: 12,
                padding: '18px 20px',
                marginBottom: 14,
              }}
            >
              <span style={{ fontSize: 26, lineHeight: 1, flexShrink: 0 }}>{item.icon}</span>
              <div>
                <p style={{ color: '#fff', fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{item.title}</p>
                <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 13, lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            </div>
          ))}
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
          grid-template-rows: 1fr auto !important;
          min-height: calc(100vh - 56px) !important;
        }

        .auth-brand-panel {
          padding: 32px 24px !important;
          min-height: auto !important;
          order: 2 !important;
        }

        .auth-form-panel {
          padding: 32px 24px !important;
          order: 1 !important;
        }

        .auth-brand-panel h2 {
          font-size: 26px !important;
          margin-bottom: 12px !important;
        }

        .auth-brand-panel p {
          font-size: 14px !important;
          margin-bottom: 24px !important;
        }

        .auth-brand-panel > div:last-child > div:last-child {
          display: none !important;
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

        .auth-brand-panel h2 {
          font-size: 22px !important;
        }

        .auth-form-panel {
          padding: 24px 16px !important;
        }

        .auth-form-content h2 {
          font-size: 22px !important;
        }

        .auth-form-content form {
          gap: 12px !important;
        }
      }
    `}</style>
    </>
  )
}

export default SignupPage
