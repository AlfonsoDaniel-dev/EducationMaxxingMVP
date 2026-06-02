'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { ReportResponse, RiskLevel } from '@/types'

const riskConfig: Record<RiskLevel, { label: string; color: string; bg: string }> = {
  high:   { label: 'High Risk',   color: 'text-red-700',    bg: 'bg-red-50 border-red-200' },
  medium: { label: 'Medium Risk', color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200' },
  low:    { label: 'Low Risk',    color: 'text-green-700',  bg: 'bg-green-50 border-green-200' },
}

export default function ReportsPage() {
  const [report, setReport] = useState<ReportResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    api.reports
      .latestMine()
      .then(setReport)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-gray-500 text-sm">Loading…</p>
  if (notFound || !report) {
    return (
      <div>
        <h1 className="text-xl font-semibold text-gray-900 mb-4">Academic Progress</h1>
        <p className="text-gray-500 text-sm">No reports generated yet.</p>
      </div>
    )
  }

  const risk = riskConfig[report.indicadorRiesgo]

  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Academic Progress</h1>

      <div className={`rounded-xl border p-6 ${risk.bg}`}>
        <div className="flex items-center justify-between mb-4">
          <span className={`text-sm font-semibold ${risk.color}`}>{risk.label}</span>
          <span className="text-xs text-gray-400">
            {new Date(report.generatedAt).toLocaleDateString()}
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Progress</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  report.indicadorRiesgo === 'low' ? 'bg-green-500' :
                  report.indicadorRiesgo === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${report.porcentajeAvance}%` }}
              />
            </div>
            <p className="text-right text-xs text-gray-500 mt-1">
              {report.porcentajeAvance.toFixed(1)}%
            </p>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Average Grade</span>
            <span className="font-semibold text-gray-900">
              {report.promedio > 0 ? report.promedio.toFixed(1) : '—'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
