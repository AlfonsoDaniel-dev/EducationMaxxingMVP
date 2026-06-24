'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { useUser } from '@/lib/user-context'
import type { CourseResponse, UserResponse } from '@/types'

const ACCENTS = ['#D95A28', '#4E7052', '#B8862A', '#5A6EA8', '#A85A6E']

const inputStyle: React.CSSProperties = {
  width: '100%', border: '1.5px solid var(--sand)', borderRadius: 10,
  padding: '10px 14px', fontSize: '0.88rem', background: 'var(--cream-50)',
  color: 'var(--forest)', outline: 'none', fontFamily: 'var(--font-jakarta)',
  transition: 'border-color 0.2s',
}
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'var(--forest)',
  marginBottom: 6, letterSpacing: '0.08em', textTransform: 'uppercase',
}

// ── Professor: create course for themselves ────────────────────────
function CreateCourseForm({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [period, setPeriod] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setSubmitting(true)
    try {
      await api.courses.create({ name, description, period })
      setName(''); setDescription(''); setPeriod('')
      setOpen(false)
      onCreated()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create course')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ marginBottom: 28 }}>
      {!open ? (
        <button onClick={() => setOpen(true)} style={{
          background: 'var(--terracotta)', color: 'white', border: 'none',
          borderRadius: 10, padding: '9px 18px', fontSize: '0.85rem', fontWeight: 600,
          cursor: 'pointer', fontFamily: 'var(--font-jakarta)', transition: 'background 0.15s',
        }}
        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'var(--terracotta-hover)')}
        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'var(--terracotta)')}
        >+ Create Course</button>
      ) : (
        <div style={{ background: 'var(--card)', border: '1.5px solid var(--sand)', borderRadius: 16, padding: '24px 28px', boxShadow: '0 4px 20px rgba(26,44,30,0.07)' }}>
          <h3 style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 600, fontSize: '1.05rem', color: 'var(--forest)', marginBottom: 20 }}>New Course</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={labelStyle}>Course Name</label>
                <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Data Structures"
                  onFocus={e => (e.target.style.borderColor = 'var(--terracotta)')} onBlur={e => (e.target.style.borderColor = 'var(--sand)')} />
              </div>
              <div>
                <label style={labelStyle}>Period</label>
                <input style={inputStyle} value={period} onChange={e => setPeriod(e.target.value)} required placeholder="e.g. 2026-1"
                  onFocus={e => (e.target.style.borderColor = 'var(--terracotta)')} onBlur={e => (e.target.style.borderColor = 'var(--sand)')} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Description</label>
                <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 72 }} value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description…"
                  onFocus={e => (e.target.style.borderColor = 'var(--terracotta)')} onBlur={e => (e.target.style.borderColor = 'var(--sand)')} />
              </div>
            </div>
            {error && <div style={{ background: '#FEF2EF', border: '1px solid #F5C4B4', borderRadius: 8, padding: '8px 12px', marginBottom: 12, fontSize: '0.83rem', color: '#A83210' }}>{error}</div>}
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" disabled={submitting} style={{ background: submitting ? 'var(--sand)' : 'var(--terracotta)', color: 'white', border: 'none', borderRadius: 10, padding: '9px 20px', fontSize: '0.85rem', fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-jakarta)' }}>
                {submitting ? 'Creating…' : 'Create Course'}
              </button>
              <button type="button" onClick={() => setOpen(false)} style={{ background: 'transparent', color: 'var(--brown)', border: '1.5px solid var(--sand)', borderRadius: 10, padding: '9px 16px', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'var(--font-jakarta)' }}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

// ── Admin: create course and assign professor ──────────────────────
function AdminCreateCourseForm({ professors, onCreated }: { professors: UserResponse[]; onCreated: () => void }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [period, setPeriod] = useState('')
  const [professorId, setProfessorId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!professorId) { setError('Select a professor'); return }
    setError(''); setSubmitting(true)
    try {
      await api.admin.createCourse({ name, description, period, professorId })
      setName(''); setDescription(''); setPeriod(''); setProfessorId('')
      setOpen(false)
      onCreated()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create course')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ marginBottom: 28 }}>
      {!open ? (
        <button onClick={() => setOpen(true)} style={{
          background: 'var(--terracotta)', color: 'white', border: 'none',
          borderRadius: 10, padding: '9px 18px', fontSize: '0.85rem', fontWeight: 600,
          cursor: 'pointer', fontFamily: 'var(--font-jakarta)', transition: 'background 0.15s',
        }}
        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'var(--terracotta-hover)')}
        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'var(--terracotta)')}
        >+ Create Course</button>
      ) : (
        <div style={{ background: 'var(--card)', border: '1.5px solid var(--sand)', borderRadius: 16, padding: '24px 28px', boxShadow: '0 4px 20px rgba(26,44,30,0.07)' }}>
          <h3 style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 600, fontSize: '1.05rem', color: 'var(--forest)', marginBottom: 20 }}>New Course</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={labelStyle}>Course Name</label>
                <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Data Structures"
                  onFocus={e => (e.target.style.borderColor = 'var(--terracotta)')} onBlur={e => (e.target.style.borderColor = 'var(--sand)')} />
              </div>
              <div>
                <label style={labelStyle}>Period</label>
                <input style={inputStyle} value={period} onChange={e => setPeriod(e.target.value)} required placeholder="e.g. 2026-1"
                  onFocus={e => (e.target.style.borderColor = 'var(--terracotta)')} onBlur={e => (e.target.style.borderColor = 'var(--sand)')} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Description</label>
                <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 72 }} value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description…"
                  onFocus={e => (e.target.style.borderColor = 'var(--terracotta)')} onBlur={e => (e.target.style.borderColor = 'var(--sand)')} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Assign Professor</label>
                <select
                  style={{ ...inputStyle, appearance: 'none' }}
                  value={professorId} onChange={e => setProfessorId(e.target.value)} required
                  onFocus={e => (e.target.style.borderColor = 'var(--terracotta)')} onBlur={e => (e.target.style.borderColor = 'var(--sand)')}
                >
                  <option value="">Select a professor…</option>
                  {professors.map(p => (
                    <option key={p.id} value={p.id}>{p.name} — {p.email}</option>
                  ))}
                </select>
              </div>
            </div>
            {error && <div style={{ background: '#FEF2EF', border: '1px solid #F5C4B4', borderRadius: 8, padding: '8px 12px', marginBottom: 12, fontSize: '0.83rem', color: '#A83210' }}>{error}</div>}
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" disabled={submitting} style={{ background: submitting ? 'var(--sand)' : 'var(--terracotta)', color: 'white', border: 'none', borderRadius: 10, padding: '9px 20px', fontSize: '0.85rem', fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-jakarta)' }}>
                {submitting ? 'Creating…' : 'Create & Assign'}
              </button>
              <button type="button" onClick={() => setOpen(false)} style={{ background: 'transparent', color: 'var(--brown)', border: '1.5px solid var(--sand)', borderRadius: 10, padding: '9px 16px', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'var(--font-jakarta)' }}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

// ── Admin: reassign professor to existing course ───────────────────
function AssignProfessorInline({ course, professors, onDone }: { course: CourseResponse; professors: UserResponse[]; onDone: () => void }) {
  const [open, setOpen] = useState(false)
  const [professorId, setProfessorId] = useState(course.professorId)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    if (!professorId || professorId === course.professorId) { setOpen(false); return }
    setSaving(true); setError('')
    try {
      await api.admin.assignProfessor(course.id, professorId)
      setOpen(false)
      onDone()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed')
    } finally {
      setSaving(false)
    }
  }

  const currentProf = professors.find(p => p.id === course.professorId)

  if (!open) return (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(true) }}
      style={{
        background: 'transparent', color: 'var(--brown)',
        border: '1px solid var(--sand)', borderRadius: 7,
        padding: '4px 10px', fontSize: '0.7rem',
        cursor: 'pointer', fontFamily: 'var(--font-jakarta)',
        transition: 'border-color 0.15s, color 0.15s', flexShrink: 0,
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--terracotta)'; (e.currentTarget as HTMLElement).style.color = 'var(--terracotta)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--sand)'; (e.currentTarget as HTMLElement).style.color = 'var(--brown)' }}
    >
      {currentProf ? `Prof: ${currentProf.name.split(' ')[0]}` : 'Assign Prof'}
    </button>
  )

  return (
    <div
      onClick={e => { e.preventDefault(); e.stopPropagation() }}
      style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}
    >
      <select
        style={{ border: '1.5px solid var(--terracotta)', borderRadius: 8, padding: '5px 10px', fontSize: '0.78rem', color: 'var(--forest)', background: 'white', fontFamily: 'var(--font-jakarta)', outline: 'none' }}
        value={professorId} onChange={e => setProfessorId(e.target.value)}
      >
        {professors.map(p => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>
      <button onClick={handleSave} disabled={saving} style={{ background: 'var(--terracotta)', color: 'white', border: 'none', borderRadius: 7, padding: '5px 12px', fontSize: '0.75rem', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-jakarta)' }}>
        {saving ? '…' : 'Save'}
      </button>
      <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brown)', fontSize: '1.1rem', lineHeight: 1, padding: '2px 4px' }}>×</button>
      {error && <span style={{ fontSize: '0.72rem', color: '#A83210' }}>{error}</span>}
    </div>
  )
}

export default function CoursesPage() {
  const user = useUser()
  const [courses, setCourses] = useState<CourseResponse[]>([])
  const [professors, setProfessors] = useState<UserResponse[]>([])
  const [loading, setLoading] = useState(true)
  const isAdmin = user?.rol === 'admin'

  function loadCourses() {
    const fetch = isAdmin ? api.admin.listAllCourses() : api.courses.list()
    fetch.then(setCourses).finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!user) return
    loadCourses()
    if (isAdmin) {
      api.admin.listUsers('professor').then(setProfessors).catch(() => {})
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--brown)' }}>
      <div className="spinner" /><span style={{ fontSize: '0.88rem' }}>Loading…</span>
    </div>
  )

  return (
    <div>
      <div className="anim-fade-up delay-0" style={{ marginBottom: 36 }}>
        <p style={{ color: 'var(--brown)', fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 }}>
          {isAdmin ? 'All Courses' : 'Browse'}
        </p>
        <h1 style={{ fontFamily: 'var(--font-fraunces)', fontSize: '2.3rem', fontWeight: 600, color: 'var(--forest)', letterSpacing: '-0.025em' }}>
          {isAdmin ? 'Course Catalog' : user?.rol === 'professor' ? 'My Courses' : 'Courses'}
        </h1>
      </div>

      {/* Professor: create own course */}
      {user?.rol === 'professor' && (
        <div className="anim-fade-up delay-1">
          <CreateCourseForm onCreated={loadCourses} />
        </div>
      )}

      {/* Admin: create course with professor */}
      {isAdmin && (
        <div className="anim-fade-up delay-1">
          <AdminCreateCourseForm professors={professors} onCreated={loadCourses} />
        </div>
      )}

      {courses.length === 0 ? (
        <div className="anim-fade-up delay-2" style={{ background: 'var(--card)', border: '1.5px dashed var(--sand)', borderRadius: 16, padding: '52px 32px', textAlign: 'center' }}>
          <p style={{ color: 'var(--brown)', fontSize: '0.95rem' }}>
            {user?.rol === 'professor' ? 'No courses yet. Create your first one!' : 'No courses found.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {courses.map((course, i) => {
            const accent = ACCENTS[i % ACCENTS.length]
            return (
              <div key={course.id} className={`anim-fade-up delay-${Math.min(i + 2, 7)}`} style={{ position: 'relative' }}>
                <Link
                  href={`/courses/${course.id}`}
                  style={{
                    display: 'flex', textDecoration: 'none',
                    background: 'var(--card)', border: '1.5px solid var(--sand)',
                    borderRadius: 12, overflow: 'hidden',
                    transition: 'box-shadow 0.2s, transform 0.18s',
                    boxShadow: '0 1px 4px rgba(26,44,30,0.05)',
                  }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = '0 6px 20px rgba(26,44,30,0.1)'; el.style.transform = 'translateX(4px)' }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = '0 1px 4px rgba(26,44,30,0.05)'; el.style.transform = 'translateX(0)' }}
                >
                  <div style={{ width: 5, background: accent, flexShrink: 0 }} />
                  <div style={{ padding: '18px 22px', flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 600, fontSize: '1rem', color: 'var(--forest)', marginBottom: 4 }}>{course.name}</h3>
                    {course.description && <p style={{ color: 'var(--brown)', fontSize: '0.83rem', lineHeight: 1.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{course.description}</p>}
                  </div>
                  <div style={{ padding: '18px 22px 18px 0', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                    <span style={{ color: 'var(--sand-dark)', fontSize: '0.76rem' }}>{course.studentIds.length} enrolled</span>
                    <span style={{ background: `${accent}15`, color: accent, border: `1px solid ${accent}28`, borderRadius: 20, padding: '3px 11px', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em' }}>{course.period}</span>
                    {isAdmin && (
                      <AssignProfessorInline course={course} professors={professors} onDone={loadCourses} />
                    )}
                  </div>
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
