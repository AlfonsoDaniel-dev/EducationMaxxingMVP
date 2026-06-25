'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { useUser } from '@/lib/user-context'
import type { CourseResponse, UserResponse, ReportResponse } from '@/types'

const ACCENTS = ['#D95A28', '#4E7052', '#B8862A', '#5A6EA8', '#A85A6E']

// ── Admin Dashboard ────────────────────────────────────────────────
function AdminDashboard() {
  const [students, setStudents] = useState<UserResponse[]>([])
  const [professors, setProfessors] = useState<UserResponse[]>([])
  const [courses, setCourses] = useState<CourseResponse[]>([])
  const [reports, setReports] = useState<ReportResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.admin.listUsers('student'),
      api.admin.listUsers('professor'),
      api.admin.listAllCourses(),
      api.admin.listAllReports(),
    ]).then(([s, p, c, r]) => {
      setStudents(s); setProfessors(p); setCourses(c); setReports(r)
    }).finally(() => setLoading(false))
  }, [])

  const stats = [
    { label: 'Students',   value: students.length,   color: '#5A6EA8', href: '/users?role=student' },
    { label: 'Professors', value: professors.length,  color: '#4E7052', href: '/users?role=professor' },
    { label: 'Courses',    value: courses.length,     color: '#B8862A', href: '/courses' },
    { label: 'Reports',    value: reports.length,     color: '#D95A28', href: '/reports' },
  ]

  return (
    <div>
      <div className="anim-fade-up delay-0" style={{ marginBottom: 44 }}>
        <p style={{ color: 'var(--brown)', fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 }}>Admin</p>
        <h1 style={{ fontFamily: 'var(--font-fraunces)', fontSize: 'clamp(2rem, 3vw, 2.6rem)', fontWeight: 600, color: 'var(--forest)', lineHeight: 1.12, letterSpacing: '-0.025em' }}>
          Platform Overview
        </h1>
      </div>

      {/* Stats grid */}
      <div className="anim-fade-up delay-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16, marginBottom: 44 }}>
        {stats.map(({ label, value, color, href }) => (
          <Link key={label} href={href} style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'var(--card)', border: '1.5px solid var(--sand)',
              borderRadius: 14, padding: '20px 22px',
              borderTop: `3px solid ${color}`,
              transition: 'box-shadow 0.2s, transform 0.2s',
              boxShadow: '0 2px 8px rgba(26,44,30,0.05)',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(26,44,30,0.1)'
              ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(26,44,30,0.05)'
              ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
            }}
            >
              <div style={{ fontFamily: 'var(--font-fraunces)', fontSize: loading ? '1.5rem' : '2.2rem', fontWeight: 700, color: 'var(--forest)', lineHeight: 1, marginBottom: 6 }}>
                {loading ? '—' : value}
              </div>
              <div style={{ color: 'var(--brown)', fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.04em' }}>{label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="anim-fade-up delay-2" style={{ marginBottom: 36 }}>
        <h2 style={{ fontFamily: 'var(--font-fraunces)', fontSize: '1.2rem', fontWeight: 600, color: 'var(--forest)', marginBottom: 16 }}>Quick Actions</h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { label: 'Register Student',   href: '/users?create=student',   color: '#5A6EA8' },
            { label: 'Register Professor', href: '/users?create=professor',  color: '#4E7052' },
            { label: 'View All Reports',   href: '/reports',                 color: '#D95A28' },
            { label: 'Manage Courses',     href: '/courses',                 color: '#B8862A' },
          ].map(({ label, href, color }) => (
            <Link key={label} href={href} style={{
              display: 'inline-block', textDecoration: 'none',
              background: `${color}12`, color,
              border: `1.5px solid ${color}30`,
              borderRadius: 10, padding: '9px 18px',
              fontSize: '0.85rem', fontWeight: 600,
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = `${color}22`)}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = `${color}12`)}
            >{label}</Link>
          ))}
        </div>
      </div>

      {/* Recent students */}
      {!loading && students.length > 0 && (
        <div className="anim-fade-up delay-3">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h2 style={{ fontFamily: 'var(--font-fraunces)', fontSize: '1.2rem', fontWeight: 600, color: 'var(--forest)' }}>Recent Students</h2>
            <Link href="/users?role=student" style={{ color: 'var(--terracotta)', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}>View all →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {students.slice(0, 5).map((s) => (
              <div key={s.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: 'var(--card)', border: '1.5px solid var(--sand)',
                borderRadius: 10, padding: '12px 16px',
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                  background: '#5A6EA820', border: '1.5px solid #5A6EA840',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-fraunces)', fontWeight: 700,
                  color: '#5A6EA8', fontSize: '0.75rem',
                }}>{s.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--forest)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name}</div>
                  <div style={{ color: 'var(--brown)', fontSize: '0.76rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.email}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Professor Dashboard ────────────────────────────────────────────
function ProfessorDashboard() {
  const [courses, setCourses] = useState<CourseResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.courses.list().then(setCourses).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--brown)' }}>
      <div className="spinner" /><span style={{ fontSize: '0.88rem' }}>Loading…</span>
    </div>
  )

  return (
    <div>
      <div className="anim-fade-up delay-0" style={{ marginBottom: 44 }}>
        <p style={{ color: 'var(--brown)', fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 }}>Professor</p>
        <h1 style={{ fontFamily: 'var(--font-fraunces)', fontSize: 'clamp(2rem, 3vw, 2.6rem)', fontWeight: 600, color: 'var(--forest)', lineHeight: 1.12, letterSpacing: '-0.025em' }}>My Courses</h1>
      </div>

      <div className="anim-fade-up delay-1" style={{ marginBottom: 28 }}>
        <Link href="/courses" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'var(--terracotta)', color: 'white',
          borderRadius: 10, padding: '9px 18px',
          fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none',
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--terracotta-hover)')}
        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--terracotta)')}
        >+ Create New Course</Link>
      </div>

      {courses.length === 0 ? (
        <div className="anim-fade-up delay-2" style={{ background: 'var(--card)', border: '1.5px dashed var(--sand)', borderRadius: 16, padding: '52px 32px', textAlign: 'center' }}>
          <p style={{ color: 'var(--brown)', fontSize: '0.95rem' }}>No courses yet. Create your first one!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 20 }}>
          {courses.map((course, i) => {
            const accent = ACCENTS[i % ACCENTS.length]
            return (
              <Link key={course.id} href={`/courses/${course.id}`} className={`anim-fade-up delay-${Math.min(i + 2, 7)}`}
                style={{ display: 'block', textDecoration: 'none', background: 'var(--card)', border: '1.5px solid var(--sand)', borderRadius: 14, overflow: 'hidden', transition: 'box-shadow 0.22s, transform 0.22s', boxShadow: '0 2px 8px rgba(26,44,30,0.06)' }}
                onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = '0 10px 30px rgba(26,44,30,0.13)'; el.style.transform = 'translateY(-3px)' }}
                onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = '0 2px 8px rgba(26,44,30,0.06)'; el.style.transform = 'translateY(0)' }}
              >
                <div style={{ height: 5, background: accent }} />
                <div style={{ padding: '22px 24px' }}>
                  <h3 style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 600, fontSize: '1.08rem', color: 'var(--forest)', lineHeight: 1.3, marginBottom: 8 }}>{course.name}</h3>
                  {course.description && <p style={{ color: 'var(--brown)', fontSize: '0.83rem', lineHeight: 1.55, marginBottom: 16, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{course.description}</p>}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ display: 'inline-block', background: `${accent}18`, color: accent, border: `1px solid ${accent}30`, borderRadius: 20, padding: '3px 10px', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em' }}>{course.period}</span>
                    <span style={{ color: 'var(--sand-dark)', fontSize: '0.76rem' }}>{course.studentIds.length} student{course.studentIds.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Student Dashboard ──────────────────────────────────────────────
function StudentDashboard() {
  const [courses, setCourses] = useState<CourseResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.courses.list().then(setCourses).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--brown)' }}>
      <div className="spinner" /><span style={{ fontSize: '0.88rem' }}>Loading your courses…</span>
    </div>
  )

  return (
    <div>
      <div className="anim-fade-up delay-0" style={{ marginBottom: 44 }}>
        <p style={{ color: 'var(--brown)', fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 }}>This semester</p>
        <h1 style={{ fontFamily: 'var(--font-fraunces)', fontSize: 'clamp(2rem, 3vw, 2.6rem)', fontWeight: 600, color: 'var(--forest)', lineHeight: 1.12, letterSpacing: '-0.025em' }}>My Courses</h1>
      </div>
      {courses.length === 0 ? (
        <div className="anim-fade-up delay-1" style={{ background: 'var(--card)', border: '1.5px dashed var(--sand)', borderRadius: 16, padding: '52px 32px', textAlign: 'center' }}>
          <p style={{ color: 'var(--brown)', fontSize: '0.95rem' }}>You haven&apos;t been enrolled in any courses yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 20 }}>
          {courses.map((course, i) => {
            const accent = ACCENTS[i % ACCENTS.length]
            return (
              <Link key={course.id} href={`/courses/${course.id}`} className={`anim-fade-up delay-${Math.min(i + 1, 7)}`}
                style={{ display: 'block', textDecoration: 'none', background: 'var(--card)', border: '1.5px solid var(--sand)', borderRadius: 14, overflow: 'hidden', transition: 'box-shadow 0.22s, transform 0.22s', boxShadow: '0 2px 8px rgba(26,44,30,0.06)' }}
                onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = '0 10px 30px rgba(26,44,30,0.13)'; el.style.transform = 'translateY(-3px)' }}
                onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = '0 2px 8px rgba(26,44,30,0.06)'; el.style.transform = 'translateY(0)' }}
              >
                <div style={{ height: 5, background: accent }} />
                <div style={{ padding: '22px 24px' }}>
                  <h3 style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 600, fontSize: '1.08rem', color: 'var(--forest)', lineHeight: 1.3, marginBottom: 8 }}>{course.name}</h3>
                  {course.description && <p style={{ color: 'var(--brown)', fontSize: '0.83rem', lineHeight: 1.55, marginBottom: 16, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{course.description}</p>}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ display: 'inline-block', background: `${accent}18`, color: accent, border: `1px solid ${accent}30`, borderRadius: 20, padding: '3px 10px', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em' }}>{course.period}</span>
                    <span style={{ color: 'var(--sand-dark)', fontSize: '0.76rem' }}>{course.studentIds.length} enrolled</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Root ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const user = useUser()
  if (!user) return null

  if (user.rol === 'admin')     return <AdminDashboard />
  if (user.rol === 'professor') return <ProfessorDashboard />
  return <StudentDashboard />
}
