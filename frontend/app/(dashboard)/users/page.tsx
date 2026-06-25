'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { api } from '@/lib/api'
import type { UserResponse, CourseResponse } from '@/types'

const ACADEMIC_PROGRAMS = [
  'computer science', 'software engineering', 'systems engineering',
  'business administration', 'psychology',
]
const AREAS = [
  'technology', 'health sciences', 'social sciences', 'arts and humanities', 'business',
]
const SPECIALITIES = [
  'software engineering', 'data science', 'cybersecurity', 'artificial intelligence',
  'databases', 'cloud computing', 'computer networks', 'robotics',
]

type CreateMode = 'student' | 'professor' | null

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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  )
}

export default function UsersPage() {
  const searchParams = useSearchParams()
  const roleFilter = searchParams.get('role') ?? ''
  const createParam = searchParams.get('create') as CreateMode

  const [students, setStudents] = useState<UserResponse[]>([])
  const [professors, setProfessors] = useState<UserResponse[]>([])
  const [courses, setCourses] = useState<CourseResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [createMode, setCreateMode] = useState<CreateMode>(createParam)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  // Enroll state
  const [enrollStudentId, setEnrollStudentId] = useState('')
  const [enrollCourseId, setEnrollCourseId] = useState('')
  const [enrollMsg, setEnrollMsg] = useState('')
  const [enrollError, setEnrollError] = useState('')

  // Form state
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    enrollmentId: '', academicProgram: ACADEMIC_PROGRAMS[0], semester: '1',
    speciality: SPECIALITIES[0], department: AREAS[0],
  })

  function loadUsers() {
    Promise.all([
      api.admin.listUsers('student'),
      api.admin.listUsers('professor'),
      api.admin.listAllCourses(),
    ]).then(([s, p, c]) => {
      setStudents(s); setProfessors(p); setCourses(c)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { loadUsers() }, [])

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })) }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setSuccess(''); setSubmitting(true)
    try {
      const base = { name: form.name, email: form.email, password: form.password, rol: createMode! }
      const extra = createMode === 'student'
        ? { enrollmentId: form.enrollmentId, academicProgram: form.academicProgram, semester: parseInt(form.semester) }
        : { speciality: form.speciality, department: form.department }
      await api.users.create({ ...base, ...extra } as Parameters<typeof api.users.create>[0])
      setSuccess(`${createMode === 'student' ? 'Student' : 'Professor'} registered successfully!`)
      setForm({ name: '', email: '', password: '', enrollmentId: '', academicProgram: ACADEMIC_PROGRAMS[0], semester: '1', speciality: SPECIALITIES[0], department: AREAS[0] })
      setCreateMode(null)
      loadUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleEnroll(e: React.FormEvent) {
    e.preventDefault()
    setEnrollError(''); setEnrollMsg('')
    try {
      await api.courses.enroll(enrollCourseId, enrollStudentId)
      setEnrollMsg('Student enrolled successfully!')
      setEnrollStudentId(''); setEnrollCourseId('')
      loadUsers()
    } catch (err) {
      setEnrollError(err instanceof Error ? err.message : 'Enrollment failed')
    }
  }

  const displayStudents = roleFilter === 'professor' ? [] : students
  const displayProfessors = roleFilter === 'student' ? [] : professors

  function UserCard({ u, color }: { u: UserResponse; color: string }) {
    const initials = u.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--card)', border: '1.5px solid var(--sand)', borderRadius: 10, padding: '12px 16px' }}>
        <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: `${color}18`, border: `1.5px solid ${color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-fraunces)', fontWeight: 700, color, fontSize: '0.78rem' }}>{initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--forest)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.name}</div>
          <div style={{ color: 'var(--brown)', fontSize: '0.76rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.email}</div>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="anim-fade-up delay-0" style={{ marginBottom: 36 }}>
        <p style={{ color: 'var(--brown)', fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 }}>Admin</p>
        <h1 style={{ fontFamily: 'var(--font-fraunces)', fontSize: '2.3rem', fontWeight: 600, color: 'var(--forest)', letterSpacing: '-0.025em' }}>User Management</h1>
      </div>

      {/* Action buttons */}
      <div className="anim-fade-up delay-1" style={{ display: 'flex', gap: 10, marginBottom: 32, flexWrap: 'wrap' }}>
        {[
          { mode: 'student' as CreateMode,   label: '+ Register Student',   color: '#5A6EA8' },
          { mode: 'professor' as CreateMode,  label: '+ Register Professor', color: '#4E7052' },
        ].map(({ mode, label, color }) => (
          <button key={mode} onClick={() => setCreateMode(createMode === mode ? null : mode)}
            style={{
              background: createMode === mode ? color : `${color}12`,
              color: createMode === mode ? 'white' : color,
              border: `1.5px solid ${color}40`, borderRadius: 10,
              padding: '9px 18px', fontSize: '0.85rem', fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'var(--font-jakarta)',
            }}
          >{label}</button>
        ))}
      </div>

      {/* Feedback */}
      {success && <div className="anim-fade-in delay-0" style={{ background: '#EFF7EF', border: '1px solid #B4D8B4', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: '0.86rem', color: '#2D6B30' }}>{success}</div>}
      {error   && <div className="anim-fade-in delay-0" style={{ background: '#FEF2EF', border: '1px solid #F5C4B4', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: '0.86rem', color: '#A83210' }}>{error}</div>}

      {/* Create form */}
      {createMode && (
        <div className="anim-fade-up delay-0" style={{ background: 'var(--card)', border: '1.5px solid var(--sand)', borderRadius: 16, padding: '28px', marginBottom: 36, boxShadow: '0 4px 20px rgba(26,44,30,0.07)' }}>
          <h2 style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 600, fontSize: '1.15rem', color: 'var(--forest)', marginBottom: 24 }}>
            {createMode === 'student' ? 'Register New Student' : 'Register New Professor'}
          </h2>
          <form onSubmit={handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16, marginBottom: 20 }}>
              <Field label="Full Name">
                <input style={inputStyle} value={form.name} onChange={e => set('name', e.target.value)} required placeholder="Jane Doe"
                  onFocus={e => (e.target.style.borderColor = 'var(--terracotta)')} onBlur={e => (e.target.style.borderColor = 'var(--sand)')} />
              </Field>
              <Field label="Email">
                <input style={inputStyle} type="email" value={form.email} onChange={e => set('email', e.target.value)} required placeholder="jane@university.edu"
                  onFocus={e => (e.target.style.borderColor = 'var(--terracotta)')} onBlur={e => (e.target.style.borderColor = 'var(--sand)')} />
              </Field>
              <Field label="Password">
                <input style={inputStyle} type="password" value={form.password} onChange={e => set('password', e.target.value)} required placeholder="Min. 8 characters"
                  onFocus={e => (e.target.style.borderColor = 'var(--terracotta)')} onBlur={e => (e.target.style.borderColor = 'var(--sand)')} />
              </Field>

              {createMode === 'student' ? (<>
                <Field label="Enrollment ID">
                  <input style={inputStyle} value={form.enrollmentId} onChange={e => set('enrollmentId', e.target.value)} required placeholder="A12345678"
                    onFocus={e => (e.target.style.borderColor = 'var(--terracotta)')} onBlur={e => (e.target.style.borderColor = 'var(--sand)')} />
                </Field>
                <Field label="Academic Program">
                  <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.academicProgram} onChange={e => set('academicProgram', e.target.value)}>
                    {ACADEMIC_PROGRAMS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                  </select>
                </Field>
                <Field label="Semester">
                  <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.semester} onChange={e => set('semester', e.target.value)}>
                    {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
              </>) : (<>
                <Field label="Speciality">
                  <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.speciality} onChange={e => set('speciality', e.target.value)}>
                    {SPECIALITIES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </Field>
                <Field label="Department">
                  <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.department} onChange={e => set('department', e.target.value)}>
                    {AREAS.map(a => <option key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</option>)}
                  </select>
                </Field>
              </>)}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" disabled={submitting} style={{ background: submitting ? 'var(--sand)' : 'var(--terracotta)', color: 'white', border: 'none', borderRadius: 10, padding: '10px 22px', fontSize: '0.88rem', fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-jakarta)', transition: 'background 0.15s' }}
                onMouseEnter={e => { if (!submitting) (e.currentTarget as HTMLButtonElement).style.background = 'var(--terracotta-hover)' }}
                onMouseLeave={e => { if (!submitting) (e.currentTarget as HTMLButtonElement).style.background = 'var(--terracotta)' }}
              >{submitting ? 'Registering…' : `Register ${createMode === 'student' ? 'Student' : 'Professor'}`}</button>
              <button type="button" onClick={() => setCreateMode(null)} style={{ background: 'transparent', color: 'var(--brown)', border: '1.5px solid var(--sand)', borderRadius: 10, padding: '10px 18px', fontSize: '0.88rem', cursor: 'pointer', fontFamily: 'var(--font-jakarta)' }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Enroll student in course */}
      <div className="anim-fade-up delay-2" style={{ background: 'var(--card)', border: '1.5px solid var(--sand)', borderRadius: 16, padding: '24px 28px', marginBottom: 36 }}>
        <h2 style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 600, fontSize: '1.1rem', color: 'var(--forest)', marginBottom: 18 }}>Enroll Student in Course</h2>
        <form onSubmit={handleEnroll}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14, marginBottom: 14 }}>
            <Field label="Student">
              <select style={{ ...inputStyle, cursor: 'pointer' }} value={enrollStudentId} onChange={e => setEnrollStudentId(e.target.value)} required>
                <option value="">Select student…</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </Field>
            <Field label="Course">
              <select style={{ ...inputStyle, cursor: 'pointer' }} value={enrollCourseId} onChange={e => setEnrollCourseId(e.target.value)} required>
                <option value="">Select course…</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.name} ({c.period})</option>)}
              </select>
            </Field>
          </div>
          {enrollMsg   && <div style={{ background: '#EFF7EF', border: '1px solid #B4D8B4', borderRadius: 8, padding: '8px 12px', marginBottom: 12, fontSize: '0.83rem', color: '#2D6B30' }}>{enrollMsg}</div>}
          {enrollError && <div style={{ background: '#FEF2EF', border: '1px solid #F5C4B4', borderRadius: 8, padding: '8px 12px', marginBottom: 12, fontSize: '0.83rem', color: '#A83210' }}>{enrollError}</div>}
          <button type="submit" style={{ background: '#5A6EA812', color: '#5A6EA8', border: '1.5px solid #5A6EA840', borderRadius: 10, padding: '9px 20px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-jakarta)', transition: 'background 0.15s' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#5A6EA822')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = '#5A6EA812')}
          >Enroll Student</button>
        </form>
      </div>

      {/* User lists */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--brown)' }}><div className="spinner" /><span style={{ fontSize: '0.88rem' }}>Loading users…</span></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: roleFilter ? '1fr' : 'repeat(auto-fill, minmax(340px, 1fr))', gap: 32 }}>
          {(!roleFilter || roleFilter === 'student') && (
            <div className="anim-fade-up delay-3">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <h2 style={{ fontFamily: 'var(--font-fraunces)', fontSize: '1.1rem', fontWeight: 600, color: 'var(--forest)' }}>
                  Students <span style={{ fontSize: '0.78rem', color: 'var(--brown)', fontFamily: 'var(--font-jakarta)', fontWeight: 400 }}>({displayStudents.length})</span>
                </h2>
              </div>
              {displayStudents.length === 0 ? (
                <div style={{ background: 'var(--card)', border: '1.5px dashed var(--sand)', borderRadius: 12, padding: '28px', textAlign: 'center' }}>
                  <p style={{ color: 'var(--brown)', fontSize: '0.88rem' }}>No students registered yet.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {displayStudents.map(u => <UserCard key={u.id} u={u} color="#5A6EA8" />)}
                </div>
              )}
            </div>
          )}

          {(!roleFilter || roleFilter === 'professor') && (
            <div className="anim-fade-up delay-4">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <h2 style={{ fontFamily: 'var(--font-fraunces)', fontSize: '1.1rem', fontWeight: 600, color: 'var(--forest)' }}>
                  Professors <span style={{ fontSize: '0.78rem', color: 'var(--brown)', fontFamily: 'var(--font-jakarta)', fontWeight: 400 }}>({displayProfessors.length})</span>
                </h2>
              </div>
              {displayProfessors.length === 0 ? (
                <div style={{ background: 'var(--card)', border: '1.5px dashed var(--sand)', borderRadius: 12, padding: '28px', textAlign: 'center' }}>
                  <p style={{ color: 'var(--brown)', fontSize: '0.88rem' }}>No professors registered yet.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {displayProfessors.map(u => <UserCard key={u.id} u={u} color="#4E7052" />)}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
