export type Rol = 'admin' | 'student' | 'professor'
export type RiskLevel = 'high' | 'medium' | 'low'
export type SubmissionStatus = 'pending' | 'confirmed' | 'failed'

export interface LoginResponse {
  sessionToken: string
  userId: string
  rol: Rol
}

export interface UserResponse {
  id: string
  name: string
  email: string
  rol: Rol
}

export interface CourseResponse {
  id: string
  name: string
  description: string
  period: string
  professorId: string
  studentIds: string[]
}

export interface AssignmentResponse {
  id: string
  title: string
  description: string
  fechaPublicacion: string
  fechaEntrega: string
  courseId: string
}

export interface FileResponse {
  id: string
  name: string
  path: string
  hash: string
  size: number
  mimeType: string
}

export interface SubmissionResponse {
  id: string
  studentId: string
  assignmentId: string
  courseId: string
  submittedAt: string
  status: SubmissionStatus
  grade: number | null
  confirmationToken: string
  files: FileResponse[]
}

export interface ReportResponse {
  id: string
  studentId: string
  courseId: string
  promedio: number
  porcentajeAvance: number
  indicadorRiesgo: RiskLevel
  generatedAt: string
  previousReportId: string | null
}

export interface CreateCourseInput {
  name: string
  description: string
  period: string
}

export interface CreateAssignmentInput {
  title: string
  description: string
  fechaPublicacion: string
  fechaEntrega: string
}

export interface CreateUserInput {
  name: string
  email: string
  password: string
  rol: Rol
  enrollmentId?: string
  academicProgram?: string
  semester?: number
  speciality?: string
  department?: string
  area?: string
}
