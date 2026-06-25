package submission

import (
	"errors"
	"time"

	"github.com/google/uuid"

	appassignment "github.com/AlfonsoDaniel-dev/EducationMaxxing/src/app/assignment"
)

var (
	ErrInvalidId          = errors.New("invalid id format")
	ErrSubmissionNotFound = errors.New("submission not found")
	ErrFileTooLarge       = errors.New("file exceeds maximum allowed size of 10MB")
	ErrFileTypeNotAllowed = errors.New("file type is not allowed")
	ErrNoFilesProvided    = errors.New("at least one file must be provided")
	ErrIntegrityFailed    = errors.New("submission integrity check failed")
	ErrGradeOutOfRange    = errors.New("grade must be between 0 and 100")
)

type SubmissionRepository interface {
	Save(submission *SubmissionRecord) error
	FindById(id uuid.UUID) (*SubmissionRecord, error)
	FindByStudentAndAssignment(studentId, assignmentId uuid.UUID) (*SubmissionRecord, error)
	FindByStudentAndCourse(studentId, courseId uuid.UUID) ([]*SubmissionRecord, error)
	FindByAssignmentId(assignmentId uuid.UUID) ([]*SubmissionRecord, error)
	FindFileById(fileId uuid.UUID) (*FileRecord, error)
	UpdateStatus(id uuid.UUID, status string) error
	UpdateGrade(id uuid.UUID, grade float64) error
	UpdateConfirmationToken(id uuid.UUID, token string) error
	AddFile(submissionId uuid.UUID, file *FileRecord) error
	FindFilesBySubmission(submissionId uuid.UUID) ([]*FileRecord, error)
}

type FileStoragePort interface {
	StoreFile(content []byte, filename, assignmentId, studentId string) (path, hash string, err error)
	DeleteFile(path string) error
	ReadFile(path string) ([]byte, error)
}

// AssignmentLookupPort is a narrow read interface so SubmissionService can
// retrieve the CourseId for a given assignment without coupling to the full
// AssignmentRepository.
type AssignmentLookupPort interface {
	FindById(id uuid.UUID) (*appassignment.AssignmentRecord, error)
}

type AuditLogger interface {
	LogAttempt(studentId, assignmentId string, fileCount int) error
	LogFailure(submissionId, reason string) error
	LogSuccess(submissionId, token string) error
}

// NoOpAuditLogger is a no-op implementation of AuditLogger for the MVP.
type NoOpAuditLogger struct{}

func (n *NoOpAuditLogger) LogAttempt(studentId, assignmentId string, fileCount int) error {
	return nil
}
func (n *NoOpAuditLogger) LogFailure(submissionId, reason string) error { return nil }
func (n *NoOpAuditLogger) LogSuccess(submissionId, token string) error  { return nil }

type SubmissionRecord struct {
	Id                uuid.UUID
	StudentId         uuid.UUID
	AssignmentId      uuid.UUID
	CourseId          uuid.UUID
	SubmittedAt       time.Time
	Status            string
	Grade             *float64
	Hash              string
	ConfirmationToken string
}

type FileRecord struct {
	Id       uuid.UUID
	Name     string
	Path     string
	Hash     string
	Size     int64
	MimeType string
}
