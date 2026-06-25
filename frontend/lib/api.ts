import { getToken } from './auth'
import type {
  LoginResponse,
  UserResponse,
  CourseResponse,
  AssignmentResponse,
  SubmissionResponse,
  ReportResponse,
  CreateCourseInput,
  AdminCreateCourseInput,
  CreateAssignmentInput,
  CreateUserInput,
} from '@/types'

const BASE = process.env.NEXT_PUBLIC_API_URL

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()

  const headers: Record<string, string> = {
    ...(options.body && !(options.body instanceof FormData)
      ? { 'Content-Type': 'application/json' }
      : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> ?? {}),
  }

  const res = await fetch(`${BASE}${path}`, { ...options, headers })

  if (!res.ok) {
    const text = await res.text()
    let message = text
    try {
      message = JSON.parse(text).message ?? text
    } catch {
      // use raw text
    }
    throw new Error(message)
  }

  return res.json() as Promise<T>
}

export async function downloadFile(fileId: string, fileName: string): Promise<void> {
  const token = getToken()
  const res = await fetch(`${BASE}/files/${fileId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!res.ok) throw new Error('Failed to download file')
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
  URL.revokeObjectURL(url)
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    logout: () => request<{ message: string }>('/auth/logout', { method: 'POST' }),
    me: () => request<UserResponse>('/auth/me'),
  },

  users: {
    create: (data: CreateUserInput) =>
      request<UserResponse>('/users', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  courses: {
    list: () => request<CourseResponse[]>('/courses'),
    get: (id: string) => request<CourseResponse>(`/courses/${id}`),
    create: (data: CreateCourseInput) =>
      request<CourseResponse>('/courses', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    enroll: (courseId: string, studentId: string) =>
      request<{ message: string }>(`/courses/${courseId}/enroll`, {
        method: 'POST',
        body: JSON.stringify({ studentId }),
      }),
  },

  assignments: {
    listByCourse: (courseId: string) =>
      request<AssignmentResponse[]>(`/courses/${courseId}/assignments`),
    get: (id: string) => request<AssignmentResponse>(`/assignments/${id}`),
    create: (courseId: string, data: CreateAssignmentInput) =>
      request<AssignmentResponse>(`/courses/${courseId}/assignments`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  submissions: {
    submit: (assignmentId: string, files: File[]) => {
      const form = new FormData()
      files.forEach((f) => form.append('files', f))
      return request<SubmissionResponse>(
        `/assignments/${assignmentId}/submissions`,
        { method: 'POST', body: form },
      )
    },
    get: (id: string) => request<SubmissionResponse>(`/submissions/${id}`),
    grade: (submissionId: string, grade: number) =>
      request<{ message: string }>(`/submissions/${submissionId}/grade`, {
        method: 'PUT',
        body: JSON.stringify({ grade }),
      }),
    listMine: (courseId: string) =>
      request<SubmissionResponse[]>(`/courses/${courseId}/submissions/me`),
    listByAssignment: (assignmentId: string) =>
      request<SubmissionResponse[]>(`/assignments/${assignmentId}/submissions`),
  },

  reports: {
    generate: (courseId: string) =>
      request<ReportResponse>(`/courses/${courseId}/reports`, { method: 'POST' }),
    get: (id: string) => request<ReportResponse>(`/reports/${id}`),
    listMine: (courseId: string) =>
      request<ReportResponse[]>(`/courses/${courseId}/reports/me`),
    latestMine: () => request<ReportResponse>('/reports/me/latest'),
  },

  admin: {
    listUsers: (role?: string) =>
      request<UserResponse[]>(`/admin/users${role ? `?role=${role}` : ''}`),
    listAllReports: () => request<ReportResponse[]>('/admin/reports'),
    listAllCourses: () => request<CourseResponse[]>('/admin/courses'),
    createCourse: (data: AdminCreateCourseInput) =>
      request<CourseResponse>('/admin/courses', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    assignProfessor: (courseId: string, professorId: string) =>
      request<{ message: string }>(`/admin/courses/${courseId}/professor`, {
        method: 'PUT',
        body: JSON.stringify({ professorId }),
      }),
  },
}
