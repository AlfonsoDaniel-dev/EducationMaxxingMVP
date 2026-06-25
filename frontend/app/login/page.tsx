'use client'

import { useState, useSyncExternalStore } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { setToken } from '@/lib/auth'

const subscribe = () => () => {}
const getClientSnapshot = () => true
const getServerSnapshot = () => false

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const mounted = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.auth.login(email, password)
      setToken(res.sessionToken)
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) {
    return <div style={{ minHeight: '100vh', background: 'var(--cream)' }} />
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>

      {/* ── Left panel ── */}
      <div style={{
        display: 'none',
        background: 'var(--forest)',
        position: 'relative',
        overflow: 'hidden',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '48px',
        width: '44%',
        flexShrink: 0,
      }} className="lg-panel">
        <style>{`
          @media (min-width: 1024px) { .lg-panel { display: flex !important; } }
        `}</style>

        {/* Decorative rings */}
        {[[-80, -80, 340], [-30, -30, 220], [null, -120, 400]].map(([top, right, size], i) => (
          <div key={i} style={{
            position: 'absolute',
            top: top !== null ? `${top}px` : 'auto',
            bottom: top === null ? '-120px' : 'auto',
            right: right !== null ? `${right}px` : 'auto',
            left: top === null ? '-80px' : 'auto',
            width: `${size}px`, height: `${size}px`,
            borderRadius: '50%',
            border: i < 2 ? `1px solid rgba(255,255,255,${i === 0 ? 0.07 : 0.05})` : 'none',
            background: i === 2 ? 'rgba(217,90,40,0.10)' : 'none',
          }} />
        ))}

        {/* Logo mark */}
        <div className="anim-fade-in delay-0">
          <div style={{
            width: 42, height: 42, borderRadius: 11,
            background: 'var(--terracotta)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-fraunces)', fontWeight: 700,
            color: 'white', fontSize: 19,
          }}>E</div>
        </div>

        {/* Headline */}
        <div className="anim-fade-up delay-1">
          <h1 style={{
            fontFamily: 'var(--font-fraunces)',
            fontSize: 'clamp(2.6rem, 3.5vw, 3.6rem)',
            fontWeight: 600, color: 'white',
            lineHeight: 1.08, letterSpacing: '-0.025em',
            marginBottom: 20,
          }}>
            Education<br />
            <em style={{ color: 'var(--terracotta)', fontStyle: 'italic' }}>Maxxing</em>
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.5)',
            fontSize: '0.95rem', lineHeight: 1.75,
            maxWidth: 270,
            fontFamily: 'var(--font-jakarta)',
          }}>
            Every course, every grade, every deadline — tracked and in your hands.
          </p>
        </div>

        {/* Footer */}
        <div className="anim-fade-in delay-3" style={{
          color: 'rgba(255,255,255,0.25)', fontSize: '0.72rem', letterSpacing: '0.08em',
        }}>
          ACADEMIC PLATFORM · UNIVERSIDAD
        </div>
      </div>

      {/* ── Right panel / form ── */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px', background: 'var(--cream)',
      }}>
        <div style={{ width: '100%', maxWidth: 360 }}>

          {/* Mobile logo */}
          <div className="anim-fade-in delay-0" style={{ marginBottom: 36 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 9,
                background: 'var(--terracotta)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-fraunces)', fontWeight: 700,
                color: 'white', fontSize: 16,
              }}>E</div>
              <span style={{
                fontFamily: 'var(--font-fraunces)', fontWeight: 600,
                fontSize: '1.05rem', color: 'var(--forest)',
              }}>EducationMaxxing</span>
            </div>
          </div>

          <div className="anim-fade-up delay-1" style={{ marginBottom: 32 }}>
            <h2 style={{
              fontFamily: 'var(--font-fraunces)',
              fontSize: '1.9rem', fontWeight: 600,
              color: 'var(--forest)', lineHeight: 1.15,
              letterSpacing: '-0.02em', marginBottom: 6,
            }}>Welcome back</h2>
            <p style={{ color: 'var(--brown)', fontSize: '0.88rem' }}>
              Sign in to continue your studies
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="anim-fade-up delay-2" style={{ marginBottom: 16 }} suppressHydrationWarning>
              <label style={{
                display: 'block', fontSize: '0.72rem', fontWeight: 700,
                color: 'var(--forest)', marginBottom: 8,
                letterSpacing: '0.08em', textTransform: 'uppercase',
              }}>Email</label>
              <input
                suppressHydrationWarning
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@university.edu"
                style={{
                  width: '100%', border: '1.5px solid var(--sand)',
                  borderRadius: 10, padding: '11px 15px',
                  fontSize: '0.92rem', background: 'var(--card)',
                  color: 'var(--forest)', outline: 'none',
                  transition: 'border-color 0.2s',
                  fontFamily: 'var(--font-jakarta)',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--terracotta)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--sand)')}
              />
            </div>

            <div className="anim-fade-up delay-3" style={{ marginBottom: 6 }} suppressHydrationWarning>
              <label style={{
                display: 'block', fontSize: '0.72rem', fontWeight: 700,
                color: 'var(--forest)', marginBottom: 8,
                letterSpacing: '0.08em', textTransform: 'uppercase',
              }}>Password</label>
              <input
                suppressHydrationWarning
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{
                  width: '100%', border: '1.5px solid var(--sand)',
                  borderRadius: 10, padding: '11px 15px',
                  fontSize: '0.92rem', background: 'var(--card)',
                  color: 'var(--forest)', outline: 'none',
                  transition: 'border-color 0.2s',
                  fontFamily: 'var(--font-jakarta)',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--terracotta)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--sand)')}
              />
            </div>

            {error && (
              <div className="anim-fade-in delay-0" style={{
                background: '#FEF2EF', border: '1px solid #F5C4B4',
                borderRadius: 8, padding: '10px 14px',
                marginTop: 14, marginBottom: 4,
                fontSize: '0.84rem', color: '#A83210',
              }}>{error}</div>
            )}

            <div className="anim-fade-up delay-4" style={{ marginTop: 26 }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  background: loading ? 'var(--sand-dark)' : 'var(--terracotta)',
                  color: 'white', border: 'none', borderRadius: 10,
                  padding: '12px 24px', fontSize: '0.92rem', fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s',
                  fontFamily: 'var(--font-jakarta)',
                  letterSpacing: '0.01em',
                }}
                onMouseEnter={(e) => {
                  if (!loading) (e.currentTarget.style.background = 'var(--terracotta-hover)')
                }}
                onMouseLeave={(e) => {
                  if (!loading) (e.currentTarget.style.background = 'var(--terracotta)')
                }}
              >
                {loading ? 'Signing in…' : 'Sign in →'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
