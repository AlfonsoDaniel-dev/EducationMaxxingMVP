'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import { useUser } from '@/lib/user-context'
import type { CourseResponse, AssignmentResponse } from '@/types'

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

function CreateAssignmentForm({ courseId, onCreated }: { courseId: string; onCreated: () => void }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [pubDate, setPubDate] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setSubmitting(true)
    try {
      await api.assignments.create(courseId, {
        title,
        description,
        fechaPublicacion: new Date(pubDate).toISOString(),
        fechaEntrega: new Date(dueDate).toISOString(),
      })
      setTitle(''); setDescription(''); setPubDate(''); setDueDate('')
      setOpen(false)
      onCreated()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create assignment')
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return (
    <button
      onClick={() => setOpen(true)}
      style={{
        background: 'var(--terracotta)', color: 'white', border: 'none',
        borderRadius: 10, padding: '9px 18px', fontSize: '0.85rem', fontWeight: 600,
        cursor: 'pointer', fontFamily: 'var(--font-jakarta)', transition: 'background 0.15s',
        marginBottom: 18,
      }}
      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'var(--terracotta-hover)')}
      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'var(--terracotta)')}
    >+ New Assignment</button>
  )

  return (
    <div style={{
      background: 'var(--card)', border: '1.5px solid var(--sand)',
      borderRadius: 16, padding: '24px 28px', marginBottom: 18,
      boxShadow: '0 4px 20px rgba(26,44,30,0.07)',
    }}>
      <h3 style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 600, fontSize: '1.05rem', color: 'var(--forest)', marginBottom: 20 }}>
        New Assignment
      </h3>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14, marginBottom: 14 }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Title</label>
            <input
              style={inputStyle} value={title} onChange={e => setTitle(e.target.value)} required
              placeholder="e.g. Lab Report 1"
              onFocus={e => (e.target.style.borderColor = 'var(--terracotta)')}
              onBlur={e => (e.target.style.borderColor = 'var(--sand)')}
            />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Description</label>
            <textarea
              style={{ ...inputStyle, resize: 'vertical', minHeight: 72 }}
              value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Instructions, requirements…"
              onFocus={e => (e.target.style.borderColor = 'var(--terracotta)')}
              onBlur={e => (e.target.style.borderColor = 'var(--sand)')}
            />
          </div>
          <div>
            <label style={labelStyle}>Publish Date</label>
            <input
              type="datetime-local" style={inputStyle}
              value={pubDate} onChange={e => setPubDate(e.target.value)} required
              onFocus={e => (e.target.style.borderColor = 'var(--terracotta)')}
              onBlur={e => (e.target.style.borderColor = 'var(--sand)')}
            />
          </div>
          <div>
            <label style={labelStyle}>Due Date</label>
            <input
              type="datetime-local" style={inputStyle}
              value={dueDate} onChange={e => setDueDate(e.target.value)} required
              onFocus={e => (e.target.style.borderColor = 'var(--terracotta)')}
              onBlur={e => (e.target.style.borderColor = 'var(--sand)')}
            />
          </div>
        </div>
        {error && (
          <div style={{ background: '#FEF2EF', border: '1px solid #F5C4B4', borderRadius: 8, padding: '8px 12px', marginBottom: 12, fontSize: '0.83rem', color: '#A83210' }}>
            {error}
          </div>
        )}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="submit" disabled={submitting}
            style={{
              background: submitting ? 'var(--sand)' : 'var(--terracotta)', color: 'white',
              border: 'none', borderRadius: 10, padding: '9px 20px',
              fontSize: '0.85rem', fontWeight: 600,
              cursor: submitting ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-jakarta)',
            }}
          >{submitting ? 'Creating…' : 'Create Assignment'}</button>
          <button
            type="button" onClick={() => setOpen(false)}
            style={{
              background: 'transparent', color: 'var(--brown)',
              border: '1.5px solid var(--sand)', borderRadius: 10,
              padding: '9px 16px', fontSize: '0.85rem',
              cursor: 'pointer', fontFamily: 'var(--font-jakarta)',
            }}
          >Cancel</button>
        </div>
      </form>
    </div>
  )
}

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const user = useUser()
  const [course, setCourse] = useState<CourseResponse | null>(null)
  const [assignments, setAssignments] = useState<AssignmentResponse[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(() => {
    Promise.all([api.courses.get(id), api.assignments.listByCourse(id)])
      .then(([c, a]) => { setCourse(c); setAssignments(a) })
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => { loadData() }, [loadData])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--brown)' }}>
        <div className="spinner" />
        <span style={{ fontSize: '0.88rem' }}>Loading…</span>
      </div>
    )
  }
  if (!course) return (
    <p style={{ color: '#A83210', fontSize: '0.9rem' }}>Course not found.</p>
  )

  const isProfessor = user?.rol === 'professor'

  function dueStatus(dateStr: string) {
    const due = new Date(dateStr)
    const now = new Date()
    const days = Math.ceil((due.getTime() - now.getTime()) / 86400000)
    if (days < 0) return { label: 'Overdue', bg: '#FEF2EF', color: '#A83210', border: '#F5C4B4' }
    if (days === 0) return { label: 'Due today', bg: '#FEF9EC', color: '#996B10', border: '#E8D4A4' }
    if (days <= 3) return { label: `${days}d left`, bg: '#FEF9EC', color: '#996B10', border: '#E8D4A4' }
    return { label: `${days}d left`, bg: '#EFF7EF', color: '#2D6B30', border: '#B4D8B4' }
  }

  return (
    <div>
      {/* Back */}
      <Link
        href="/courses"
        className="anim-fade-in delay-0"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          color: 'var(--brown)', fontSize: '0.8rem', textDecoration: 'none',
          marginBottom: 30, transition: 'color 0.15s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--terracotta)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--brown)')}
      >
        ← Back to courses
      </Link>

      {/* Course header */}
      <div className="anim-fade-up delay-1" style={{ marginBottom: 40 }}>
        <span style={{
          display: 'inline-block', background: 'var(--cream-dark)',
          color: 'var(--brown)', borderRadius: 20,
          padding: '3px 12px', fontSize: '0.72rem', fontWeight: 700,
          letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 12,
        }}>{course.period}</span>
        <h1 style={{
          fontFamily: 'var(--font-fraunces)', fontSize: '2rem',
          fontWeight: 600, color: 'var(--forest)',
          lineHeight: 1.18, letterSpacing: '-0.025em', marginBottom: 10,
        }}>{course.name}</h1>
        {course.description && (
          <p style={{ color: 'var(--brown)', fontSize: '0.92rem', lineHeight: 1.7, maxWidth: 580 }}>
            {course.description}
          </p>
        )}
        <p style={{ marginTop: 10, color: 'var(--sand-dark)', fontSize: '0.78rem' }}>
          {course.studentIds.length} student{course.studentIds.length !== 1 ? 's' : ''} enrolled
        </p>
      </div>

      {/* Assignments section */}
      <div className="anim-fade-up delay-2" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <h2 style={{
          fontFamily: 'var(--font-fraunces)', fontSize: '1.25rem',
          fontWeight: 600, color: 'var(--forest)',
        }}>Assignments</h2>
        <span style={{ color: 'var(--sand-dark)', fontSize: '0.78rem' }}>
          {assignments.length} total
        </span>
      </div>

      {/* Professor: create assignment */}
      {isProfessor && (
        <div className="anim-fade-up delay-3">
          <CreateAssignmentForm courseId={id} onCreated={loadData} />
        </div>
      )}

      {assignments.length === 0 ? (
        <div className="anim-fade-up delay-3" style={{
          background: 'var(--card)', border: '1.5px dashed var(--sand)',
          borderRadius: 14, padding: '40px 28px', textAlign: 'center',
        }}>
          <p style={{ color: 'var(--brown)', fontSize: '0.9rem' }}>
            {isProfessor ? 'No assignments yet. Create the first one above.' : 'No assignments yet.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {assignments.map((a, i) => {
            const status = dueStatus(a.fechaEntrega)
            const due = new Date(a.fechaEntrega)
            return (
              <Link
                key={a.id}
                href={`/courses/${id}/assignments/${a.id}`}
                className={`anim-fade-up delay-${Math.min(i + 3, 7)}`}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  textDecoration: 'none', gap: 16,
                  background: 'var(--card)', border: '1.5px solid var(--sand)',
                  borderRadius: 12, padding: '17px 22px',
                  transition: 'box-shadow 0.2s, border-color 0.2s',
                  boxShadow: '0 1px 4px rgba(26,44,30,0.05)',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement
                  el.style.borderColor = 'var(--terracotta)'
                  el.style.boxShadow = '0 4px 16px rgba(26,44,30,0.1)'
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement
                  el.style.borderColor = 'var(--sand)'
                  el.style.boxShadow = '0 1px 4px rgba(26,44,30,0.05)'
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontFamily: 'var(--font-jakarta)', fontWeight: 600,
                    fontSize: '0.92rem', color: 'var(--forest)', marginBottom: 3,
                  }}>{a.title}</p>
                  {a.description && (
                    <p style={{
                      color: 'var(--brown)', fontSize: '0.8rem', lineHeight: 1.5,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>{a.description}</p>
                  )}
                </div>
                <div style={{ flexShrink: 0, textAlign: 'right' }}>
                  <span style={{
                    display: 'inline-block',
                    background: status.bg, color: status.color,
                    border: `1px solid ${status.border}`,
                    borderRadius: 20, padding: '3px 11px',
                    fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.03em',
                  }}>{status.label}</span>
                  <p style={{ color: 'var(--sand-dark)', fontSize: '0.7rem', marginTop: 4 }}>
                    {due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
