package report

import (
	"errors"
	"time"

	"github.com/google/uuid"

	appassignment "github.com/AlfonsoDaniel-dev/EducationMaxxing/src/app/assignment"
	appsubmission "github.com/AlfonsoDaniel-dev/EducationMaxxing/src/app/submission"
)

var (
	ErrInvalidId      = errors.New("invalid id format")
	ErrReportNotFound = errors.New("report not found")
	ErrNoAssignments  = errors.New("no assignments found for this course")
)

type ReportRepository interface {
	Save(report *ReportRecord) error
	FindById(id uuid.UUID) (*ReportRecord, error)
	FindByStudentAndCourse(studentId, courseId uuid.UUID) ([]*ReportRecord, error)
	FindLatestByStudent(studentId uuid.UUID) (*ReportRecord, error)
}

// AssignmentQueryPort is a narrow read interface satisfied by the assignment
// infrastructure repository without creating import cycles.
type AssignmentQueryPort interface {
	FindByCourseId(courseId uuid.UUID) ([]*appassignment.AssignmentRecord, error)
}

// SubmissionQueryPort is a narrow read interface satisfied by the submission
// infrastructure repository without creating import cycles.
type SubmissionQueryPort interface {
	FindByStudentAndCourse(studentId, courseId uuid.UUID) ([]*appsubmission.SubmissionRecord, error)
}

type ReportRecord struct {
	Id               uuid.UUID
	StudentId        uuid.UUID
	CourseId         uuid.UUID
	Promedio         float64
	PorcentajeAvance float64
	IndicadorRiesgo  string
	GeneratedAt      time.Time
	PreviousReportId *uuid.UUID
}
