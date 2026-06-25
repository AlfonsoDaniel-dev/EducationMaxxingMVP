'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { useUser } from '@/lib/user-context'
import type { ReportResponse, RiskLevel } from '@/types'

const RISK: Record<RiskLevel, { label: string; color: string; bg: string; border: string; ring: string; emoji: string }> = {
  low:    { label: 'On Track',    color: '#2D6B30', bg: '#EFF7EF', border: '#B4D8B4', ring: '#4E7052', emoji: '✓' },
  medium: { label: 'Needs Focus', color: '#996B10', bg: '#FEF9EC', border: '#E8D4A4', ring: '#B8862A', emoji: '!' },
  high:   { label: 'At Risk',     color: '#A83210', bg: '#FEF2EF', border: '#F5C4B4', ring: '#D95A28', emoji: '⚠' },
}

function StudentReportHeader() {
  return (
    <div className="anim-fade-up delay-0" style={{ marginBottom: 40 }}>
      <p style={{ color: 'var(--brown)', fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 }}>Academic</p>
      <h1 style={{ fontFamily: 'var(--font-fraunces)', fontSize: '2.3rem', fontWeight: 600, color: 'var(--forest)', letterSpacing: '-0.025em' }}>My Progress</h1>
    </div>
  )
}

// ── Admin: all reports list ────────────────────────────────────────
function AdminReports() {
  const [reports, setReports] = useState<ReportResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.admin.listAllReports().then(setReports).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--brown)' }}>
      <div className="spinner" /><span style={{ fontSize: '0.88rem' }}>Loading…</span>
    </div>
  )

  return (
    <div>
      <div className="anim-fade-up delay-0" style={{ marginBottom: 40 }}>
        <p style={{ color: 'var(--brown)', fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 }}>Admin</p>
        <h1 style={{ fontFamily: 'var(--font-fraunces)', fontSize: '2.3rem', fontWeight: 600, color: 'var(--forest)', letterSpacing: '-0.025em' }}>All Reports</h1>
      </div>

      {reports.length === 0 ? (
        <div className="anim-fade-up delay-1" style={{ background: 'var(--card)', border: '1.5px dashed var(--sand)', borderRadius: 16, padding: '52px 32px', textAlign: 'center' }}>
          <p style={{ color: 'var(--brown)', fontSize: '0.95rem' }}>No reports generated yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {reports.map((report, i) => {
            const risk = RISK[report.indicadorRiesgo as RiskLevel] ?? RISK.medium
            return (
              <div key={report.id} className={`anim-fade-up delay-${Math.min(i + 1, 7)}`} style={{ background: 'var(--card)', border: '1.5px solid var(--sand)', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ height: 3, background: risk.ring }} />
                <div style={{ padding: '16px 22px', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ background: risk.bg, color: risk.color, border: `1px solid ${risk.border}`, borderRadius: 20, padding: '2px 10px', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.04em' }}>{risk.emoji} {risk.label}</span>
                      <span style={{ color: 'var(--sand-dark)', fontSize: '0.72rem' }}>
                        {new Date(report.generatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <div style={{ color: 'var(--brown)', fontSize: '0.76rem', fontFamily: 'var(--font-jakarta)' }}>
                      Student: <span style={{ color: 'var(--forest)', fontWeight: 600 }}>{report.studentId.slice(0, 8)}…</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 28, flexShrink: 0 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 700, fontSize: '1.4rem', color: 'var(--forest)', lineHeight: 1 }}>
                        {report.promedio > 0 ? report.promedio.toFixed(1) : '—'}
                      </div>
                      <div style={{ color: 'var(--brown)', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: 2 }}>Grade</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 700, fontSize: '1.4rem', color: 'var(--forest)', lineHeight: 1 }}>
                        {report.porcentajeAvance.toFixed(0)}%
                      </div>
                      <div style={{ color: 'var(--brown)', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: 2 }}>Progress</div>
                    </div>
                  </div>

                  {/* Mini progress bar */}
                  <div style={{ width: 120, flexShrink: 0 }}>
                    <div style={{ height: 5, background: 'var(--sand)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: risk.ring, borderRadius: 3, width: `${Math.min(100, report.porcentajeAvance)}%`, transition: 'width 0.8s ease' }} />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Student: my latest report ──────────────────────────────────────
function StudentReport() {
  const [report, setReport] = useState<ReportResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    api.reports.latestMine().then(setReport).catch(() => setNotFound(true)).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--brown)' }}>
      <div className="spinner" /><span style={{ fontSize: '0.88rem' }}>Loading…</span>
    </div>
  )

  if (notFound || !report) return (
    <div>
      <StudentReportHeader />
      <div className="anim-fade-up delay-1" style={{ background: 'var(--card)', border: '1.5px dashed var(--sand)', borderRadius: 16, padding: '52px 32px', textAlign: 'center' }}>
        <p style={{ color: 'var(--brown)', fontSize: '0.95rem', marginBottom: 6 }}>No reports generated yet.</p>
        <p style={{ color: 'var(--sand-dark)', fontSize: '0.82rem' }}>Reports are generated automatically as you submit assignments.</p>
      </div>
    </div>
  )

  const risk = RISK[report.indicadorRiesgo as RiskLevel] ?? RISK.medium
  const progress = Math.min(100, Math.max(0, report.porcentajeAvance))
  const RADIUS = 52
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS
  const strokeOffset = CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE

  return (
    <div style={{ maxWidth: 560 }}>
      <StudentReportHeader />
      <div className="anim-fade-up delay-1" style={{ background: 'var(--card)', border: '1.5px solid var(--sand)', borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 20px rgba(26,44,30,0.07)' }}>
        <div style={{ background: risk.bg, borderBottom: `1px solid ${risk.border}`, padding: '18px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ background: risk.border, color: risk.color, borderRadius: 20, padding: '4px 14px', fontSize: '0.76rem', fontWeight: 700, letterSpacing: '0.05em' }}>{risk.emoji} {risk.label}</span>
          <span style={{ color: 'var(--brown)', fontSize: '0.73rem' }}>{new Date(report.generatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
        </div>
        <div style={{ padding: '32px 28px', display: 'flex', alignItems: 'center', gap: 36, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <svg width="128" height="128" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="64" cy="64" r={RADIUS} fill="none" stroke="var(--sand)" strokeWidth="8" />
              <circle cx="64" cy="64" r={RADIUS} fill="none" stroke={risk.ring} strokeWidth="8" strokeDasharray={CIRCUMFERENCE} strokeDashoffset={strokeOffset} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1.1s cubic-bezier(.22,1,.36,1)' }} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 700, fontSize: '1.55rem', color: 'var(--forest)', lineHeight: 1 }}>{progress.toFixed(0)}%</span>
              <span style={{ color: 'var(--brown)', fontSize: '0.62rem', marginTop: 2 }}>progress</span>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <div style={{ marginBottom: 26 }}>
              <p style={{ color: 'var(--brown)', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Average Grade</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontFamily: 'var(--font-fraunces)', fontWeight: 700, fontSize: '3.2rem', color: 'var(--forest)', lineHeight: 1 }}>{report.promedio > 0 ? report.promedio.toFixed(1) : '—'}</span>
                {report.promedio > 0 && <span style={{ color: 'var(--brown)', fontSize: '0.88rem' }}>/100</span>}
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                <p style={{ color: 'var(--brown)', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Completion</p>
                <span style={{ color: 'var(--forest)', fontSize: '0.76rem', fontWeight: 600 }}>{progress.toFixed(1)}%</span>
              </div>
              <div style={{ height: 6, background: 'var(--sand)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: risk.ring, borderRadius: 3, width: `${progress}%`, transition: 'width 1.1s cubic-bezier(.22,1,.36,1)' }} />
              </div>
            </div>
          </div>
        </div>
        {report.previousReportId && (
          <div style={{ borderTop: '1px solid var(--sand)', padding: '12px 28px', color: 'var(--sand-dark)', fontSize: '0.76rem' }}>↑ Updated from a previous report</div>
        )}
      </div>
    </div>
  )
}

export default function ReportsPage() {
  const user = useUser()
  if (!user) return null
  if (user.rol === 'admin') return <AdminReports />
  return <StudentReport />
}
