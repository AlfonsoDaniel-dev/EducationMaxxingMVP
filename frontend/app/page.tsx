'use client'

import Link from 'next/link'

// Decorative academic seal SVG
function AcademicSeal() {
  return (
    <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      {/* Outer rotating ring */}
      <circle cx="200" cy="200" r="185" stroke="#1A2C1E" strokeWidth="1" strokeDasharray="4 6" style={{ transformOrigin: '200px 200px', animation: 'sealSpin 60s linear infinite' }} />

      {/* Main border circle */}
      <circle cx="200" cy="200" r="175" stroke="#1A2C1E" strokeWidth="1.5" />

      {/* Tick marks around outer ring */}
      {Array.from({ length: 60 }).map((_, i) => {
        const angle = (i / 60) * 2 * Math.PI - Math.PI / 2
        const inner = i % 5 === 0 ? 158 : 163
        const outerR = 172
        const x1 = (200 + inner * Math.cos(angle)).toFixed(3)
        const y1 = (200 + inner * Math.sin(angle)).toFixed(3)
        const x2 = (200 + outerR * Math.cos(angle)).toFixed(3)
        const y2 = (200 + outerR * Math.sin(angle)).toFixed(3)
        return (
          <line
            key={i}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="#1A2C1E"
            strokeWidth={i % 5 === 0 ? 1.5 : 0.8}
            opacity={i % 5 === 0 ? 0.8 : 0.4}
          />
        )
      })}

      {/* Text arc — top */}
      <path id="topArc" d="M 50,200 A 150,150 0 0,1 350,200" fill="none" />
      <text fontSize="11" letterSpacing="5" fill="#1A2C1E" opacity="0.6" fontFamily="var(--font-jakarta)" fontWeight="600">
        <textPath href="#topArc" startOffset="50%" textAnchor="middle">EDUCATION MAXXING · ACADEMIC PLATFORM</textPath>
      </text>

      {/* Text arc — bottom */}
      <path id="bottomArc" d="M 50,200 A 150,150 0 0,0 350,200" fill="none" />
      <text fontSize="10" letterSpacing="4" fill="#1A2C1E" opacity="0.45" fontFamily="var(--font-jakarta)" fontWeight="500">
        <textPath href="#bottomArc" startOffset="50%" textAnchor="middle">EST. 2026 · EXCELLENCE IN LEARNING</textPath>
      </text>

      {/* Inner double circle */}
      <circle cx="200" cy="200" r="130" stroke="#1A2C1E" strokeWidth="0.8" opacity="0.35" />
      <circle cx="200" cy="200" r="122" stroke="#D95A28" strokeWidth="0.5" opacity="0.4" strokeDasharray="2 8" />

      {/* Decorative cross at top */}
      <g opacity="0.5" transform="translate(200, 72)">
        <line x1="0" y1="-6" x2="0" y2="6" stroke="#D95A28" strokeWidth="1.5" />
        <line x1="-6" y1="0" x2="6" y2="0" stroke="#D95A28" strokeWidth="1.5" />
        <circle cx="0" cy="0" r="2" fill="#D95A28" />
      </g>

      {/* Compass decorations */}
      {[0, 90, 180, 270].map((deg, i) => {
        const rad = (deg * Math.PI) / 180
        const x = (200 + 130 * Math.cos(rad - Math.PI / 2)).toFixed(3)
        const y = (200 + 130 * Math.sin(rad - Math.PI / 2)).toFixed(3)
        return (
          <g key={i} transform={`translate(${x}, ${y})`} opacity="0.5">
            <circle cx="0" cy="0" r="3" fill="none" stroke="#D95A28" strokeWidth="1" />
            <circle cx="0" cy="0" r="1" fill="#D95A28" />
          </g>
        )
      })}

      {/* Central monogram background */}
      <circle cx="200" cy="200" r="78" fill="#1A2C1E" />
      <circle cx="200" cy="200" r="72" fill="none" stroke="#D95A28" strokeWidth="0.8" opacity="0.6" />

      {/* Large E monogram */}
      <text
        x="200" y="222"
        textAnchor="middle"
        fontSize="88"
        fontFamily="var(--font-fraunces)"
        fontWeight="600"
        fill="#F7F3EC"
        letterSpacing="-2"
      >E</text>

      {/* Diagonal ornament lines */}
      <line x1="64" y1="64" x2="96" y2="96" stroke="#1A2C1E" strokeWidth="0.5" opacity="0.3" />
      <line x1="304" y1="304" x2="336" y2="336" stroke="#1A2C1E" strokeWidth="0.5" opacity="0.3" />
      <line x1="336" y1="64" x2="304" y2="96" stroke="#1A2C1E" strokeWidth="0.5" opacity="0.3" />
      <line x1="64" y1="336" x2="96" y2="304" stroke="#1A2C1E" strokeWidth="0.5" opacity="0.3" />
    </svg>
  )
}

const ROLES = [
  {
    role: 'Student',
    accent: '#5A6EA8',
    bg: '#F0F2F8',
    border: '#C4CBE0',
    description: 'Enroll in courses, submit assignments with file upload, and track your academic progress with risk indicators and grade averages.',
    features: ['Multi-course enrollment', 'File submission system', 'Progress reports'],
  },
  {
    role: 'Professor',
    accent: '#4E7052',
    bg: '#EFF7EF',
    border: '#B4D8B4',
    description: 'Create and manage your courses, publish assignments with due dates, and oversee student submissions for your academic area.',
    features: ['Course creation', 'Assignment management', 'Submission review'],
  },
  {
    role: 'Admin',
    accent: '#D95A28',
    bg: '#FEF2EF',
    border: '#F5C4B4',
    description: 'Oversee the entire platform — register students and professors, manage courses, assign faculty, and access all academic reports.',
    features: ['User registration', 'Course oversight', 'Platform-wide reports'],
  },
]

export default function LandingPage() {
  return (
    <>
      <style>{`
        @keyframes sealSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes landFadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes landFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes sealFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-12px); }
        }
        .land-d0 { animation: landFadeUp 0.7s cubic-bezier(.22,1,.36,1) both; }
        .land-d1 { animation: landFadeUp 0.7s 0.1s cubic-bezier(.22,1,.36,1) both; }
        .land-d2 { animation: landFadeUp 0.7s 0.22s cubic-bezier(.22,1,.36,1) both; }
        .land-d3 { animation: landFadeUp 0.7s 0.34s cubic-bezier(.22,1,.36,1) both; }
        .land-d4 { animation: landFadeUp 0.7s 0.46s cubic-bezier(.22,1,.36,1) both; }
        .land-d5 { animation: landFadeUp 0.7s 0.58s cubic-bezier(.22,1,.36,1) both; }
        .seal-wrap { animation: landFadeIn 1s 0.3s both, sealFloat 8s 1s ease-in-out infinite; }
        .cta-btn {
          position: relative; overflow: hidden;
          background: var(--terracotta); color: white;
          border: none; border-radius: 12px;
          padding: 14px 32px; font-size: 0.92rem;
          font-weight: 700; cursor: pointer;
          font-family: var(--font-jakarta);
          letter-spacing: 0.02em;
          text-decoration: none; display: inline-flex;
          align-items: center; gap: 8px;
          transition: transform 0.18s, box-shadow 0.18s;
        }
        .cta-btn::before {
          content: '';
          position: absolute; inset: 0;
          background: rgba(0,0,0,0.12);
          transform: translateX(-101%);
          transition: transform 0.3s cubic-bezier(.22,1,.36,1);
        }
        .cta-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(217,90,40,0.35); }
        .cta-btn:hover::before { transform: translateX(0); }
        .nav-link {
          color: var(--brown); font-size: 0.83rem;
          font-family: var(--font-jakarta);
          text-decoration: none; letter-spacing: 0.03em;
          transition: color 0.15s;
        }
        .nav-link:hover { color: var(--terracotta); }
        .role-card {
          background: var(--card); border: 1.5px solid var(--sand);
          border-radius: 18px; padding: 28px;
          transition: transform 0.22s, box-shadow 0.22s;
        }
        .role-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 36px rgba(26,44,30,0.1);
        }
        .divider-line {
          height: 1px; background: linear-gradient(90deg, transparent, var(--sand) 20%, var(--sand) 80%, transparent);
          margin: 0;
        }
        .feature-pill {
          background: var(--cream-dark); color: var(--brown);
          border-radius: 20px; padding: 3px 11px;
          font-size: 0.72rem; font-weight: 600;
          font-family: var(--font-jakarta); letter-spacing: 0.03em;
          white-space: nowrap;
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: 'var(--cream)', overflowX: 'hidden' }}>

        {/* ── Navigation ─────────────────────────────────────────── */}
        <nav style={{
          position: 'sticky', top: 0, zIndex: 50,
          background: 'rgba(247,243,236,0.9)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--sand)',
        }}>
          <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 40px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 8,
                background: 'var(--forest)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-fraunces)', fontWeight: 700,
                color: 'white', fontSize: 17,
              }}>E</div>
              <span style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 600, color: 'var(--forest)', fontSize: '0.95rem', letterSpacing: '-0.01em' }}>
                EducationMaxxing
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
              <a href="#roles" className="nav-link">Roles</a>
              <a href="#about" className="nav-link">About</a>
              <Link href="/login" className="cta-btn" style={{ padding: '8px 20px', fontSize: '0.83rem', borderRadius: 9 }}>
                Sign In →
              </Link>
            </div>
          </div>
        </nav>

        {/* ── Hero ───────────────────────────────────────────────── */}
        <section style={{ maxWidth: 1120, margin: '0 auto', padding: '80px 40px 100px', display: 'grid', gridTemplateColumns: '1fr 420px', gap: 60, alignItems: 'center' }}>

          {/* Left: copy */}
          <div>
            <div className="land-d0" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
              <div style={{ height: 1, width: 32, background: 'var(--terracotta)' }} />
              <span style={{ fontFamily: 'var(--font-jakarta)', fontSize: '0.72rem', fontWeight: 700, color: 'var(--terracotta)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                Academic Platform
              </span>
            </div>

            <h1 className="land-d1" style={{
              fontFamily: 'var(--font-fraunces)',
              fontSize: 'clamp(3rem, 5.5vw, 5.2rem)',
              fontWeight: 600,
              color: 'var(--forest)',
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
              marginBottom: 28,
            }}>
              Academic<br />
              excellence,<br />
              <em style={{ color: 'var(--terracotta)', fontStyle: 'italic' }}>digitized.</em>
            </h1>

            <p className="land-d2" style={{
              fontFamily: 'var(--font-jakarta)',
              fontSize: '1.05rem',
              color: 'var(--brown)',
              lineHeight: 1.75,
              maxWidth: 440,
              marginBottom: 40,
            }}>
              A unified platform for students, professors, and administrators.
              Submit work, track progress, manage courses — all in one place.
            </p>

            <div className="land-d3" style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              <Link href="/login" className="cta-btn">
                Enter Platform
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
              <a href="#roles" style={{ fontFamily: 'var(--font-jakarta)', fontSize: '0.86rem', color: 'var(--brown)', textDecoration: 'none', letterSpacing: '0.02em', display: 'flex', alignItems: 'center', gap: 4, transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--forest)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--brown)')}
              >
                Explore roles
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12l7 7 7-7"/>
                </svg>
              </a>
            </div>

            {/* Stats row */}
            <div className="land-d4" style={{ marginTop: 64, display: 'flex', gap: 40, borderTop: '1px solid var(--sand)', paddingTop: 28 }}>
              {[
                { n: '3', label: 'User roles' },
                { n: '∞', label: 'Courses' },
                { n: '100%', label: 'Open platform' },
              ].map(({ n, label }) => (
                <div key={label}>
                  <div style={{ fontFamily: 'var(--font-fraunces)', fontSize: '2.2rem', fontWeight: 700, color: 'var(--forest)', lineHeight: 1, letterSpacing: '-0.03em' }}>{n}</div>
                  <div style={{ fontFamily: 'var(--font-jakarta)', fontSize: '0.72rem', color: 'var(--brown)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: 4 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Seal */}
          <div className="seal-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
              width: '100%', maxWidth: 380,
              aspectRatio: '1',
              filter: 'drop-shadow(0 20px 60px rgba(26,44,30,0.12))',
            }}>
              <AcademicSeal />
            </div>
          </div>
        </section>

        <div className="divider-line" />

        {/* ── Roles section ──────────────────────────────────────── */}
        <section id="roles" style={{ maxWidth: 1120, margin: '0 auto', padding: '96px 40px' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '0.72rem', fontWeight: 700, color: 'var(--terracotta)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 14 }}>
              Who it&apos;s for
            </p>
            <h2 style={{
              fontFamily: 'var(--font-fraunces)',
              fontSize: 'clamp(2rem, 3.5vw, 3rem)',
              fontWeight: 600,
              color: 'var(--forest)',
              letterSpacing: '-0.025em',
              lineHeight: 1.1,
              maxWidth: 520,
              margin: '0 auto',
            }}>
              One platform,<br />three distinct experiences.
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {ROLES.map(({ role, accent, bg, border, description, features }, i) => (
              <div key={role} className={`role-card land-d${i + 2}`}>
                <div style={{ marginBottom: 20 }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: 44, height: 44, borderRadius: 11,
                    background: bg, border: `1.5px solid ${border}`,
                    marginBottom: 16,
                  }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: '50%',
                      background: accent, opacity: 0.85,
                    }} />
                  </div>
                  <h3 style={{
                    fontFamily: 'var(--font-fraunces)',
                    fontSize: '1.45rem', fontWeight: 600,
                    color: 'var(--forest)', letterSpacing: '-0.02em',
                    marginBottom: 10,
                  }}>{role}</h3>
                  <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '0.88rem', color: 'var(--brown)', lineHeight: 1.7 }}>
                    {description}
                  </p>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingTop: 18, borderTop: `1px solid ${border}` }}>
                  {features.map(f => (
                    <span key={f} className="feature-pill" style={{ background: bg, color: accent, border: `1px solid ${border}` }}>{f}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="divider-line" />

        {/* ── Pull quote ─────────────────────────────────────────── */}
        <section id="about" style={{ maxWidth: 1120, margin: '0 auto', padding: '96px 40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          <div>
            <div style={{ width: 3, height: 52, background: 'var(--terracotta)', borderRadius: 2, marginBottom: 28 }} />
            <blockquote style={{
              fontFamily: 'var(--font-fraunces)',
              fontSize: 'clamp(1.6rem, 2.5vw, 2.4rem)',
              fontWeight: 400,
              fontStyle: 'italic',
              color: 'var(--forest)',
              lineHeight: 1.35,
              letterSpacing: '-0.02em',
              margin: 0,
            }}>
              &ldquo;Designed for the full academic lifecycle — from enrollment to evaluation.&rdquo;
            </blockquote>
          </div>
          <div>
            <div style={{ background: 'var(--card)', border: '1.5px solid var(--sand)', borderRadius: 18, padding: '32px 28px' }}>
              <h3 style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 600, fontSize: '1.15rem', color: 'var(--forest)', marginBottom: 18, letterSpacing: '-0.015em' }}>
                Built on solid foundations
              </h3>
              {[
                { icon: '⬡', text: 'Domain-driven design with clear separation of concerns' },
                { icon: '⬡', text: 'JWT authentication — stateless, secure, reliable' },
                { icon: '⬡', text: 'Role-based access control across every route' },
                { icon: '⬡', text: 'File submission with confirmation tokens' },
                { icon: '⬡', text: 'Automated risk-indicator academic reports' },
              ].map(({ icon, text }, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, marginBottom: i < 4 ? 14 : 0, alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--terracotta)', fontSize: '0.7rem', marginTop: 4, flexShrink: 0 }}>{icon}</span>
                  <span style={{ fontFamily: 'var(--font-jakarta)', fontSize: '0.86rem', color: 'var(--brown)', lineHeight: 1.6 }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA ──────────────────────────────────────────── */}
        <section style={{ background: 'var(--forest)', margin: '0', padding: '96px 40px' }}>
          <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: 'var(--terracotta)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', fontFamily: 'var(--font-fraunces)', fontWeight: 700, color: 'white', fontSize: 22 }}>E</div>
            <h2 style={{
              fontFamily: 'var(--font-fraunces)',
              fontSize: 'clamp(2rem, 3.5vw, 3rem)',
              fontWeight: 600,
              color: '#F7F3EC',
              letterSpacing: '-0.025em',
              lineHeight: 1.1,
              marginBottom: 20,
            }}>
              Ready to begin?
            </h2>
            <p style={{ fontFamily: 'var(--font-jakarta)', fontSize: '1rem', color: 'rgba(247,243,236,0.6)', lineHeight: 1.7, marginBottom: 40 }}>
              Sign in with your institutional credentials and access your personalized academic workspace.
            </p>
            <Link href="/login" className="cta-btn" style={{ fontSize: '0.96rem', padding: '14px 36px' }}>
              Sign In to Platform
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
        </section>

        {/* ── Footer ─────────────────────────────────────────────── */}
        <footer style={{ background: '#121F15', padding: '28px 40px' }}>
          <div style={{ maxWidth: 1120, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <span style={{ fontFamily: 'var(--font-jakarta)', fontSize: '0.78rem', color: 'rgba(247,243,236,0.3)', letterSpacing: '0.03em' }}>
              © 2026 EducationMaxxing · Academic Platform
            </span>
            <Link href="/login" style={{ fontFamily: 'var(--font-jakarta)', fontSize: '0.78rem', color: 'rgba(247,243,236,0.35)', textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--terracotta)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(247,243,236,0.35)')}
            >
              Sign in →
            </Link>
          </div>
        </footer>

      </div>
    </>
  )
}
