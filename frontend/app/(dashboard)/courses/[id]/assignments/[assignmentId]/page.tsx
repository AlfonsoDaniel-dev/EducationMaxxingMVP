'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { api, downloadFile } from '@/lib/api'
import { useUser } from '@/lib/user-context'
import type { AssignmentResponse, SubmissionResponse, FileResponse } from '@/types'

// ─── shared styles ────────────────────────────────────────────────────────────

const card: React.CSSProperties = {
  background: 'var(--card)', border: '1.5px solid var(--sand)',
  borderRadius: 16, overflow: 'hidden', marginBottom: 28,
  boxShadow: '0 2px 10px rgba(26,44,30,0.06)',
}
const cardHeader: React.CSSProperties = {
  padding: '18px 24px', borderBottom: '1px solid var(--sand)',
}
const cardTitle: React.CSSProperties = {
  fontFamily: 'var(--font-fraunces)', fontWeight: 600,
  fontSize: '1rem', color: 'var(--forest)',
}

function statusStyle(s: string) {
  if (s === 'confirmed') return { bg: '#EFF7EF', color: '#2D6B30', border: '#B4D8B4', label: 'Confirmed' }
  if (s === 'failed')    return { bg: '#FEF2EF', color: '#A83210', border: '#F5C4B4', label: 'Failed' }
  return                        { bg: '#FEF9EC', color: '#996B10', border: '#E8D4A4', label: 'Pending' }
}

function Badge({ label, bg, color, border }: { label: string; bg: string; color: string; border: string }) {
  return (
    <span style={{
      background: bg, color, border: `1px solid ${border}`,
      borderRadius: 20, padding: '3px 10px',
      fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.04em',
    }}>{label}</span>
  )
}

// ─── professor view ───────────────────────────────────────────────────────────

function FileRow({ file }: { file: FileResponse }) {
  const [busy, setBusy] = useState(false)

  async function handleDownload() {
    setBusy(true)
    try { await downloadFile(file.id, file.name) } finally { setBusy(false) }
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: 'var(--cream)', border: '1px solid var(--sand)',
      borderRadius: 8, padding: '8px 12px',
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--forest)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {file.name}
        </p>
        <p style={{ fontSize: '0.7rem', color: 'var(--brown)' }}>
          {(file.size / 1024).toFixed(1)} KB · {file.mimeType}
        </p>
      </div>
      <button
        onClick={handleDownload}
        disabled={busy}
        style={{
          background: busy ? 'var(--sand)' : 'var(--forest)', color: 'white',
          border: 'none', borderRadius: 8, padding: '6px 12px',
          fontSize: '0.75rem', fontWeight: 600, cursor: busy ? 'not-allowed' : 'pointer',
          flexShrink: 0, marginLeft: 12, transition: 'background 0.15s',
          fontFamily: 'var(--font-jakarta)',
        }}
        onMouseEnter={(e) => { if (!busy) (e.currentTarget as HTMLButtonElement).style.background = 'var(--terracotta)' }}
        onMouseLeave={(e) => { if (!busy) (e.currentTarget as HTMLButtonElement).style.background = 'var(--forest)' }}
      >
        {busy ? '…' : 'Download'}
      </button>
    </div>
  )
}

function SubmissionRow({ submission, onGraded }: { submission: SubmissionResponse; onGraded: () => void }) {
  const [open, setOpen] = useState(false)
  const [grade, setGrade] = useState(submission.grade != null ? String(submission.grade) : '')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const st = statusStyle(submission.status)

  async function handleGrade(e: React.FormEvent) {
    e.preventDefault()
    const g = parseFloat(grade)
    if (isNaN(g) || g < 0 || g > 100) { setSaveError('Grade must be 0–100'); return }
    setSaveError(''); setSaving(true)
    try {
      await api.submissions.grade(submission.id, g)
      onGraded()
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save grade')
    } finally {
      setSaving(false)
    }
  }

  const shortId = submission.studentId.slice(0, 8)

  return (
    <div style={{
      background: 'var(--card)', border: '1.5px solid var(--sand)',
      borderRadius: 12, overflow: 'hidden', transition: 'border-color 0.15s',
    }}>
      {/* Row header — always visible */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', width: '100%', gap: 14,
          background: 'none', border: 'none', cursor: 'pointer',
          padding: '15px 20px', textAlign: 'left',
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--forest)', marginBottom: 2 }}>
            Student <span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{shortId}…</span>
          </p>
          <p style={{ fontSize: '0.74rem', color: 'var(--brown)' }}>
            {new Date(submission.submittedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            {' · '}{submission.files.length} file{submission.files.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <Badge {...st} />
          {submission.grade != null && (
            <span style={{
              fontFamily: 'var(--font-fraunces)', fontWeight: 700,
              fontSize: '1rem', color: 'var(--forest)',
            }}>
              {submission.grade}
              <span style={{ fontSize: '0.65rem', color: 'var(--brown)', fontFamily: 'var(--font-jakarta)', fontWeight: 400 }}>/100</span>
            </span>
          )}
          <span style={{ color: 'var(--sand-dark)', fontSize: '0.8rem', transition: 'transform 0.2s', display: 'inline-block', transform: open ? 'rotate(180deg)' : 'none' }}>▾</span>
        </div>
      </button>

      {/* Expanded content */}
      {open && (
        <div style={{ borderTop: '1px solid var(--sand)', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Files */}
          {submission.files.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--forest)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 2 }}>Files</p>
              {submission.files.map(f => <FileRow key={f.id} file={f} />)}
            </div>
          ) : (
            <p style={{ fontSize: '0.82rem', color: 'var(--brown)' }}>No files attached.</p>
          )}

          {/* Grade form */}
          <form onSubmit={handleGrade} style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--forest)', letterSpacing: '0.06em', textTransform: 'uppercase', flexBasis: '100%', marginBottom: 4 }}>
              Grade
            </p>
            <input
              type="number" min={0} max={100} step={0.1}
              value={grade} onChange={e => setGrade(e.target.value)}
              placeholder="0–100"
              style={{
                width: 100, border: '1.5px solid var(--sand)', borderRadius: 8,
                padding: '8px 12px', fontSize: '0.85rem', background: 'var(--cream-50)',
                color: 'var(--forest)', fontFamily: 'var(--font-jakarta)',
              }}
              onFocus={e => (e.target.style.borderColor = 'var(--terracotta)')}
              onBlur={e => (e.target.style.borderColor = 'var(--sand)')}
            />
            <button
              type="submit" disabled={saving}
              style={{
                background: saving ? 'var(--sand)' : 'var(--terracotta)', color: 'white',
                border: 'none', borderRadius: 8, padding: '8px 16px',
                fontSize: '0.82rem', fontWeight: 600,
                cursor: saving ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-jakarta)',
              }}
            >{saving ? 'Saving…' : 'Save grade'}</button>
            {saveError && <p style={{ fontSize: '0.78rem', color: '#A83210', flexBasis: '100%' }}>{saveError}</p>}
          </form>
        </div>
      )}
    </div>
  )
}

function ProfessorView({ assignmentId, totalStudents }: { assignmentId: string; totalStudents: number }) {
  const [submissions, setSubmissions] = useState<SubmissionResponse[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    api.submissions.listByAssignment(assignmentId)
      .then(setSubmissions)
      .finally(() => setLoading(false))
  }, [assignmentId])

  useEffect(() => { load() }, [load])

  return (
    <div className="anim-fade-up delay-2" style={card}>
      <div style={{ ...cardHeader, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={cardTitle}>Submissions</h2>
        {!loading && (
          <span style={{ fontSize: '0.78rem', color: 'var(--brown)' }}>
            {submissions.length} of {totalStudents} student{totalStudents !== 1 ? 's' : ''} submitted
          </span>
        )}
      </div>

      <div style={{ padding: 20 }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--brown)' }}>
            <div className="spinner" /><span style={{ fontSize: '0.85rem' }}>Loading submissions…</span>
          </div>
        ) : submissions.length === 0 ? (
          <div style={{
            border: '1.5px dashed var(--sand)', borderRadius: 12,
            padding: '32px 20px', textAlign: 'center',
          }}>
            <p style={{ color: 'var(--brown)', fontSize: '0.88rem' }}>No submissions yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {submissions.map(s => (
              <SubmissionRow key={s.id} submission={s} onGraded={load} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── student view ─────────────────────────────────────────────────────────────

function StudentView({ assignmentId, courseId }: { assignmentId: string; courseId: string }) {
  const [submissions, setSubmissions] = useState<SubmissionResponse[]>([])
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const loadHistory = useCallback(() => {
    api.submissions.listMine(courseId).then(setSubmissions)
  }, [courseId])

  useEffect(() => { loadHistory() }, [loadHistory])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (files.length === 0) return
    setError(''); setMessage(''); setUploading(true)
    try {
      const result = await api.submissions.submit(assignmentId, files)
      setMessage(`Submitted! Confirmation: ${result.confirmationToken}`)
      setFiles([])
      if (inputRef.current) inputRef.current.value = ''
      loadHistory()
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

  return (
    <>
      {/* Upload card */}
      <div className="anim-fade-up delay-2" style={card}>
        <div style={cardHeader}>
          <h2 style={cardTitle}>Submit your work</h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ padding: 24 }}>
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
              <p style={{ color: 'var(--brown)', fontSize: '0.78rem' }}>PDF, images, Word documents — max 10 MB each</p>
              <input
                ref={inputRef} type="file" multiple
                onChange={(e) => setFiles(prev => [...prev, ...Array.from(e.target.files ?? [])])}
                style={{ display: 'none' }}
              />
            </div>

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
                      <span style={{ fontSize: '0.72rem', color: 'var(--brown)' }}>{(f.size / 1024).toFixed(1)} KB</span>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeFile(f.name) }}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: 'var(--sand-dark)', fontSize: '1.1rem', lineHeight: 1, padding: 0,
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#A83210')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--sand-dark)')}
                      >×</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {error && <div style={{ background: '#FEF2EF', border: '1px solid #F5C4B4', borderRadius: 8, padding: '10px 14px', fontSize: '0.84rem', color: '#A83210', marginBottom: 12 }}>{error}</div>}
            {message && <div style={{ background: '#EFF7EF', border: '1px solid #B4D8B4', borderRadius: 8, padding: '10px 14px', fontSize: '0.84rem', color: '#2D6B30', marginBottom: 12 }}>{message}</div>}

            <button
              type="submit"
              disabled={uploading || files.length === 0}
              style={{
                background: uploading || files.length === 0 ? 'var(--sand)' : 'var(--terracotta)',
                color: 'white', border: 'none', borderRadius: 10,
                padding: '11px 24px', fontSize: '0.88rem', fontWeight: 600,
                cursor: uploading || files.length === 0 ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s', fontFamily: 'var(--font-jakarta)',
              }}
              onMouseEnter={(e) => { if (!uploading && files.length > 0) (e.currentTarget as HTMLButtonElement).style.background = 'var(--terracotta-hover)' }}
              onMouseLeave={(e) => { if (!uploading && files.length > 0) (e.currentTarget as HTMLButtonElement).style.background = 'var(--terracotta)' }}
            >
              {uploading ? 'Uploading…' : files.length > 0 ? `Submit ${files.length} file${files.length !== 1 ? 's' : ''}` : 'Submit'}
            </button>
          </div>
        </form>
      </div>

      {/* History */}
      {submissions.length > 0 && (
        <div className="anim-fade-up delay-3">
          <h2 style={{ ...cardTitle, marginBottom: 14 }}>Submission History</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {submissions.map((s) => {
              const st = statusStyle(s.status)
              return (
                <div key={s.id} style={{
                  background: 'var(--card)', border: '1.5px solid var(--sand)',
                  borderRadius: 12, padding: '16px 20px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Badge {...st} />
                    {s.grade != null && (
                      <span style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--forest)' }}>
                        {s.grade}<span style={{ fontSize: '0.68rem', color: 'var(--brown)', fontFamily: 'var(--font-jakarta)', fontWeight: 400 }}> / 100</span>
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
    </>
  )
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function AssignmentPage() {
  const { id: courseId, assignmentId } = useParams<{ id: string; assignmentId: string }>()
  const user = useUser()
  const [assignment, setAssignment] = useState<AssignmentResponse | null>(null)
  const [totalStudents, setTotalStudents] = useState(0)

  useEffect(() => {
    api.assignments.get(assignmentId).then(setAssignment)
    api.courses.get(courseId).then(c => setTotalStudents(c.studentIds.length))
  }, [assignmentId, courseId])

  if (!assignment) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--brown)' }}>
        <div className="spinner" /><span style={{ fontSize: '0.88rem' }}>Loading…</span>
      </div>
    )
  }

  const isProfessor = user?.rol === 'professor'
  const due = new Date(assignment.fechaEntrega)
  const overdue = due < new Date()
  // This value is presentation-only. Keeping it local avoids changing backend data.
  // eslint-disable-next-line react-hooks/purity
  const daysLeft = Math.ceil((due.getTime() - Date.now()) / 86400000)

  return (
    <div style={{ maxWidth: 680 }}>
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

      {isProfessor
        ? <ProfessorView assignmentId={assignmentId} totalStudents={totalStudents} />
        : <StudentView assignmentId={assignmentId} courseId={courseId} />
      }
    </div>
  )
}
