'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import type { CourseResponse } from '@/types'

export default function DashboardPage() {
  const [courses, setCourses] = useState<CourseResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.courses.list().then(setCourses).finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-gray-500 text-sm">Loading…</p>

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 mb-6">My Courses</h1>
      {courses.length === 0 ? (
        <p className="text-gray-500 text-sm">No courses found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/courses/${course.id}`}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition"
            >
              <p className="font-medium text-gray-900">{course.name}</p>
              <p className="text-sm text-gray-500 mt-1">{course.period}</p>
              <p className="text-xs text-gray-400 mt-3">
                {course.studentIds.length} student{course.studentIds.length !== 1 ? 's' : ''}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
