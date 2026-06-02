'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import type { CourseResponse, AssignmentResponse } from '@/types'

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [course, setCourse] = useState<CourseResponse | null>(null)
  const [assignments, setAssignments] = useState<AssignmentResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.courses.get(id),
      api.assignments.listByCourse(id),
    ])
      .then(([c, a]) => {
        setCourse(c)
        setAssignments(a)
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <p className="text-gray-500 text-sm">Loading…</p>
  if (!course) return <p className="text-red-500 text-sm">Course not found.</p>

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900">{course.name}</h1>
      <p className="text-sm text-gray-500 mt-1">{course.description}</p>
      <p className="text-xs text-gray-400 mt-0.5">{course.period}</p>

      <h2 className="text-base font-medium text-gray-800 mt-8 mb-4">Assignments</h2>
      {assignments.length === 0 ? (
        <p className="text-gray-500 text-sm">No assignments yet.</p>
      ) : (
        <div className="space-y-3">
          {assignments.map((a) => (
            <Link
              key={a.id}
              href={`/courses/${id}/assignments/${a.id}`}
              className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-5 py-4 hover:shadow-md transition"
            >
              <div>
                <p className="font-medium text-gray-900">{a.title}</p>
                <p className="text-sm text-gray-500 line-clamp-1">{a.description}</p>
              </div>
              <span className="text-xs text-gray-400 shrink-0 ml-4">
                Due {new Date(a.fechaEntrega).toLocaleDateString()}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
