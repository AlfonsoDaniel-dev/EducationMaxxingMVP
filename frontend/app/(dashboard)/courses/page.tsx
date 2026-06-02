'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import type { CourseResponse } from '@/types'

export default function CoursesPage() {
  const [courses, setCourses] = useState<CourseResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.courses.list().then(setCourses).finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-gray-500 text-sm">Loading…</p>

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Courses</h1>
      {courses.length === 0 ? (
        <p className="text-gray-500 text-sm">No courses found.</p>
      ) : (
        <div className="space-y-3">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/courses/${course.id}`}
              className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-5 py-4 hover:shadow-md transition"
            >
              <div>
                <p className="font-medium text-gray-900">{course.name}</p>
                <p className="text-sm text-gray-500">{course.description}</p>
              </div>
              <span className="text-xs text-gray-400 shrink-0 ml-4">{course.period}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
