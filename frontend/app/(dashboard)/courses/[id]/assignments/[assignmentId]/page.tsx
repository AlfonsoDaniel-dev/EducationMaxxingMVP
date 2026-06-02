'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import type { AssignmentResponse, SubmissionResponse } from '@/types'

export default function AssignmentPage() {
  const { id: courseId, assignmentId } = useParams<{ id: string; assignmentId: string }>()
  const [assignment, setAssignment] = useState<AssignmentResponse | null>(null)
  const [submissions, setSubmissions] = useState<SubmissionResponse[]>([])
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    api.assignments.get(assignmentId).then(setAssignment)
    api.submissions.listMine(courseId).then(setSubmissions)
  }, [assignmentId, courseId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (files.length === 0) return
    setError(''); setMessage(''); setUploading(true)
    try {
      const result = await api.submissions.submit(assignmentId, files)
      setMessage(`Submitted! Confirmation token: ${result.confirmationToken}`)
      setFiles([])
      if (inputRef.current) inputRef.current.value = ''
      api.submissions.listMine(courseId).then(setSubmissions)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed')
    } finally {
      setUploading(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)])
  }

  function removeFile(name: string) {
    setFiles(prev => prev.filter(f => f.name !== name))
  }

  function statusStyle(s: string) {
    if (s === 'confirmed') return { bg: '#EFF7EF', color: '#2D6B30', border: '#B4D8B4', label: 'Confirmed' }
    if (s === 'failed')    return { bg: '#FEF2EF', color: '#A83210', border: '#F5C4B4', label: 'Failed' }
    return                        { bg: '#FEF9EC', color: '#996B10', border: '#E8D4A4', label: 'Pending' }
  }

  if (!assignment) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--brown)' }}>
        <div className="spinner" /><span style={{ fontSize: '0.88rem' }}>Loading…</span>
      </div>
    )
  }

  const due = new Date(assignment.fechaEntrega)
  const overdue = due < new Date()
  const daysLeft = Math.ceil((due.getTime() - Date.now()) / 86400000)

  return (
    <div style={{ maxWidth: 680 }}>
      {/* Back */}
      <Link
        href={`/courses/${courseId}`}
        className="anim-fade-in delay-0"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          color: 'var(--brown)', fontSize: '0.8rem', textDecoration: 'none',
          marginBottom: 30, transition: 'color 0.15s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--terracotta)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--brown)')}
      >
        ← Back to course
      </Link>

      {/* Header */}
      <div className="anim-fade-up delay-1" style={{ marginBottom: 34 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <h1 style={{
              fontFamily: 'var(--font-fraunces)', fontSize: '1.85rem',
              fontWeight: 600, color: 'var(--forest)',
              lineHeight: 1.18, letterSpacing: '-0.022em', marginBottom: 9,
            }}>{assignment.title}</h1>
            {assignment.description && (
              <p style={{ color: 'var(--brown)', fontSize: '0.9rem', lineHeight: 1.7, maxWidth: 480 }}>
                {assignment.description}
              </p>
            )}
          </div>
          <span style={{
            flexShrink: 0,
            background: overdue ? '#FEF2EF' : daysLeft <= 2 ? '#FEF9EC' : '#EFF7EF',
            color: overdue ? '#A83210' : daysLeft <= 2 ? '#996B10' : '#2D6B30',
            border: `1px solid ${overdue ? '#F5C4B4' : daysLeft <= 2 ? '#E8D4A4' : '#B4D8B4'}`,
            borderRadius: 20, padding: '5px 14px',
            fontSize: '0.76rem', fontWeight: 700, whiteSpace: 'nowrap',
          }}>
            {overdue ? '⚠ Overdue' : daysLeft === 0 ? 'Due today' : `Due ${due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
          </span>
        </div>
      </div>

      {/* Upload card */}
      <div className="anim-fade-up delay-2" style={{
        background: 'var(--card)', border: '1.5px solid var(--sand)',
        borderRadius: 16, overflow: 'hidden', marginBottom: 28,
        boxShadow: '0 2px 10px rgba(26,44,30,0.06)',
      }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--sand)' }}>
          <h2 style={{
            fontFamily: 'var(--font-fraunces)', fontWeight: 600,
            fontSize: '1rem', color: 'var(--forest)',
          }}>Submit your work</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ padding: '24px' }}>
            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              style={{
                border: `2px dashed ${dragOver ? 'var(--terracotta)' : 'var(--sand)'}`,
                borderRadius: 12, padding: '32px 20px', textAlign: 'center',
                cursor: 'pointer', transition: 'all 0.2s',
                background: dragOver ? 'rgba(217,90,40,0.04)' : 'transparent',
                marginBottom: 14,
              }}
            >
              <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>📎</div>
              <p style={{ color: 'var(--forest)', fontWeight: 600, fontSize: '0.88rem', marginBottom: 3 }}>
                Drop files here, or click to browse
              </p>
              <p style={{ color: 'var(--brown)', fontSize: '0.78rem' }}>Any file type accepted</p>
              <input
                ref={inputRef}
                type="file"
                multiple
                onChange={(e) => setFiles(prev => [...prev, ...Array.from(e.target.files ?? [])])}
                style={{ display: 'none' }}
              />
            </div>

            {/* File list */}
            {files.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                {files.map((f) => (
                  <div key={f.name} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: 'var(--cream)', border: '1px solid var(--sand)',
                    borderRadius: 8, padding: '8px 12px',
                  }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--forest)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {f.name}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, marginLeft: 10 }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--brown)' }}>
                        {(f.size / 1024).toFixed(1)} KB
                      </span>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeFile(f.name) }}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: 'var(--sand-dark)', fontSize: '1.1rem', lineHeight: 1,
                          padding: 0, transition: 'color 0.15s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#A83210')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--sand-dark)')}
                      >×</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div style={{
                background: '#FEF2EF', border: '1px solid #F5C4B4', borderRadius: 8,
                padding: '10px 14px', fontSize: '0.84rem', color: '#A83210', marginBottom: 12,
              }}>{error}</div>
            )}
            {message && (
              <div style={{
                background: '#EFF7EF', border: '1px solid #B4D8B4', borderRadius: 8,
                padding: '10px 14px', fontSize: '0.84rem', color: '#2D6B30', marginBottom: 12,
              }}>{message}</div>
            )}

            <button
              type="submit"
              disabled={uploading || files.length === 0}
              style={{
                background: uploading || files.length === 0 ? 'var(--sand)' : 'var(--terracotta)',
                color: 'white', border: 'none', borderRadius: 10,
                padding: '11px 24px', fontSize: '0.88rem', fontWeight: 600,
                cursor: uploading || files.length === 0 ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s',
                fontFamily: 'var(--font-jakarta)',
              }}
              onMouseEnter={(e) => {
                if (!uploading && files.length > 0)
                  (e.currentTarget as HTMLButtonElement).style.background = 'var(--terracotta-hover)'
              }}
              onMouseLeave={(e) => {
                if (!uploading && files.length > 0)
                  (e.currentTarget as HTMLButtonElement).style.background = 'var(--terracotta)'
              }}
            >
              {uploading
                ? 'Uploading…'
                : files.length > 0
                  ? `Submit ${files.length} file${files.length !== 1 ? 's' : ''}`
                  : 'Submit'}
            </button>
          </div>
        </form>
      </div>

      {/* History */}
      {submissions.length > 0 && (
        <div className="anim-fade-up delay-3">
          <h2 style={{
            fontFamily: 'var(--font-fraunces)', fontWeight: 600,
            fontSize: '1rem', color: 'var(--forest)', marginBottom: 14,
          }}>Submission History</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {submissions.map((s) => {
              const st = statusStyle(s.status)
              return (
                <div key={s.id} style={{
                  background: 'var(--card)', border: '1.5px solid var(--sand)',
                  borderRadius: 12, padding: '16px 20px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{
                      background: st.bg, color: st.color,
                      border: `1px solid ${st.border}`,
                      borderRadius: 20, padding: '3px 10px',
                      fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.04em',
                    }}>{st.label}</span>
                    {s.grade != null && (
                      <span style={{
                        fontFamily: 'var(--font-fraunces)', fontWeight: 700,
                        fontSize: '1.1rem', color: 'var(--forest)',
                      }}>
                        {s.grade}
                        <span style={{ fontSize: '0.68rem', color: 'var(--brown)', fontFamily: 'var(--font-jakarta)', fontWeight: 400 }}> / 100</span>
                      </span>
                    )}
                  </div>
                  <p style={{ color: 'var(--brown)', fontSize: '0.76rem' }}>
                    {new Date(s.submittedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    {' · '}{s.files.length} file{s.files.length !== 1 ? 's' : ''}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
