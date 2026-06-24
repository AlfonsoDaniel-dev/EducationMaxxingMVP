'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import { clearToken, isAuthenticated } from '@/lib/auth'
import { UserContext } from '@/lib/user-context'
import type { UserResponse } from '@/types'

function IconGrid() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
}
function IconBook() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
}
function IconChart() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>
}
function IconUsers() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
}
function IconLogout() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
}

function navLinksForRole(rol: string) {
  if (rol === 'admin') {
    return [
      { href: '/dashboard', label: 'Overview',  icon: <IconGrid /> },
      { href: '/users',     label: 'Users',     icon: <IconUsers /> },
      { href: '/courses',   label: 'Courses',   icon: <IconBook /> },
      { href: '/reports',   label: 'Reports',   icon: <IconChart /> },
    ]
  }
  if (rol === 'professor') {
    return [
      { href: '/dashboard', label: 'Dashboard', icon: <IconGrid /> },
      { href: '/courses',   label: 'Courses',   icon: <IconBook /> },
    ]
  }
  // student
  return [
    { href: '/dashboard', label: 'Dashboard',   icon: <IconGrid /> },
    { href: '/courses',   label: 'Courses',     icon: <IconBook /> },
    { href: '/reports',   label: 'My Progress', icon: <IconChart /> },
  ]
}

// Role accent colors for the sidebar top strip
const roleAccent: Record<string, string> = {
  admin:     '#D95A28',
  professor: '#4E7052',
  student:   '#5A6EA8',
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<UserResponse | null>(null)

  useEffect(() => {
    if (!isAuthenticated()) { router.push('/login'); return }
    api.auth.me().then(setUser).catch(() => {
      clearToken()
      router.push('/login')
    })
  }, [router])

  async function handleLogout() {
    await api.auth.logout().catch(() => {})
    clearToken()
    router.push('/login')
  }

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream)' }}>
        <div className="spinner" />
      </div>
    )
  }

  const navLinks = navLinksForRole(user.rol)
  const initials = user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  const accent = roleAccent[user.rol] ?? 'var(--terracotta)'

  return (
    <UserContext.Provider value={user}>
      <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--cream)' }}>

        {/* ── Sidebar ── */}
        <aside style={{
          width: 244, flexShrink: 0,
          background: 'var(--forest)',
          display: 'flex', flexDirection: 'column',
          position: 'fixed', top: 0, left: 0, bottom: 0,
          zIndex: 100,
        }}>
          {/* Role accent strip */}
          <div style={{ height: 3, background: accent }} />

          {/* Brand */}
          <div style={{ padding: '22px 22px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 9,
                background: accent, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-fraunces)', fontWeight: 700,
                color: 'white', fontSize: 17,
              }}>E</div>
              <div>
                <div style={{
                  fontFamily: 'var(--font-fraunces)', fontWeight: 600,
                  color: 'white', fontSize: '0.88rem', lineHeight: 1.25,
                }}>EducationMaxxing</div>
                <div style={{
                  color: 'rgba(255,255,255,0.38)', fontSize: '0.66rem',
                  letterSpacing: '0.07em', textTransform: 'capitalize',
                }}>{user.rol}</div>
              </div>
            </div>
          </div>

          <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '0 18px 12px' }} />

          {/* Nav */}
          <nav style={{ flex: 1, padding: '4px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {navLinks.map(({ href, label, icon }, i) => {
              const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
              return (
                <Link
                  key={href}
                  href={href}
                  className={`anim-slide-right delay-${i + 1}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 9,
                    padding: '9px 12px', borderRadius: 8,
                    textDecoration: 'none', transition: 'background 0.15s',
                    background: active ? `${accent}28` : 'transparent',
                    color: active ? 'white' : 'rgba(255,255,255,0.52)',
                    fontSize: '0.855rem', fontWeight: active ? 600 : 400,
                    fontFamily: 'var(--font-jakarta)',
                    borderLeft: `2px solid ${active ? accent : 'transparent'}`,
                    marginLeft: 2,
                  }}
                  onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)' }}
                  onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                >
                  <span style={{ opacity: active ? 1 : 0.65, display: 'flex' }}>{icon}</span>
                  {label}
                </Link>
              )
            })}
          </nav>

          {/* User + Logout */}
          <div style={{ padding: '14px 16px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                background: `${accent}30`, border: `1.5px solid ${accent}70`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-fraunces)', fontWeight: 700,
                color: accent, fontSize: '0.75rem',
              }}>{initials}</div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ color: 'white', fontSize: '0.78rem', fontWeight: 600, fontFamily: 'var(--font-jakarta)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.67rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'rgba(255,255,255,0.32)', fontSize: '0.75rem',
                fontFamily: 'var(--font-jakarta)', padding: '3px 0',
                transition: 'color 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.32)')}
            >
              <IconLogout /> Sign out
            </button>
          </div>
        </aside>

        {/* ── Main ── */}
        <main style={{ marginLeft: 244, flex: 1, padding: '44px 52px', minHeight: '100vh' }}>
          {children}
        </main>
      </div>
    </UserContext.Provider>
  )
}
