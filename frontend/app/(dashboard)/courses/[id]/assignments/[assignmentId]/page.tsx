'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
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
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    api.assignments.get(assignmentId).then(setAssignment)
    api.submissions.listMine(courseId).then(setSubmissions)
  }, [assignmentId, courseId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (files.length === 0) return
    setError('')
    setMessage('')
    setUploading(true)
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

  if (!assignment) return <p className="text-gray-500 text-sm">Loading…</p>

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold text-gray-900">{assignment.title}</h1>
      <p className="text-sm text-gray-500 mt-1">{assignment.description}</p>
      <p className="text-xs text-gray-400 mt-1">
        Due: {new Date(assignment.fechaEntrega).toLocaleDateString()}
      </p>

      <div className="mt-8 bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-base font-medium text-gray-800 mb-4">Submit Files</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            ref={inputRef}
            type="file"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
            className="block w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:font-medium hover:file:bg-blue-100"
          />
          {files.length > 0 && (
            <ul className="text-xs text-gray-500 space-y-0.5">
              {files.map((f) => <li key={f.name}>• {f.name} ({(f.size / 1024).toFixed(1)} KB)</li>)}
            </ul>
          )}
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {message && <p className="text-green-600 text-sm">{message}</p>}
          <button
            type="submit"
            disabled={uploading || files.length === 0}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {uploading ? 'Uploading…' : 'Submit'}
          </button>
        </form>
      </div>

      {submissions.length > 0 && (
        <div className="mt-6">
          <h2 className="text-base font-medium text-gray-800 mb-3">My Submissions</h2>
          <div className="space-y-3">
            {submissions.map((s) => (
              <div key={s.id} className="bg-white border border-gray-200 rounded-xl px-5 py-4">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    s.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                    s.status === 'failed' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>{s.status}</span>
                  {s.grade != null && (
                    <span className="text-sm font-semibold text-gray-700">Grade: {s.grade}</span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(s.submittedAt).toLocaleString()} · {s.files.length} file{s.files.length !== 1 ? 's' : ''}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
