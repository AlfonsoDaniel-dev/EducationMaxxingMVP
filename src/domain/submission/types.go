package submission

import (
	"time"

	"github.com/google/uuid"
)

type SubmissionStatus string

const (
	StatusPending   SubmissionStatus = "pending"
	StatusConfirmed SubmissionStatus = "confirmed"
	StatusFailed    SubmissionStatus = "failed"
)

func NewSubmissionStatus(s string) (SubmissionStatus, error) {
	switch SubmissionStatus(s) {
	case StatusPending, StatusConfirmed, StatusFailed:
		return SubmissionStatus(s), nil
	default:
		return "", ErrInvalidSubmissionStatus
	}
}

func (s SubmissionStatus) Value() string {
	return string(s)
}

func (s SubmissionStatus) IsValid() bool {
	switch s {
	case StatusPending, StatusConfirmed, StatusFailed:
		return true
	}
	return false
}

type File struct {
	Id       uuid.UUID
	Name     string
	Path     string
	Hash     string
	Size     int64
	MimeType string
}

func NewFile(name, path, hash, mimeType string, size int64) (*File, error) {
	if name == "" {
		return nil, ErrorOnCreatingFile(ErrFileNameEmpty)
	}
	if path == "" {
		return nil, ErrorOnCreatingFile(ErrFilePathEmpty)
	}
	if size <= 0 {
		return nil, ErrorOnCreatingFile(ErrFileSizeZero)
	}

	id, err := uuid.NewRandom()
	if err != nil {
		return nil, err
	}

	return &File{
		Id:       id,
		Name:     name,
		Path:     path,
		Hash:     hash,
		Size:     size,
		MimeType: mimeType,
	}, nil
}

func (f *File) GetId() uuid.UUID {
	if f == nil {
		return uuid.Nil
	}
	return f.Id
}

func (f *File) GetName() string {
	if f == nil {
		return ""
	}
	return f.Name
}

func (f *File) GetPath() string {
	if f == nil {
		return ""
	}
	return f.Path
}

func (f *File) GetHash() string {
	if f == nil {
		return ""
	}
	return f.Hash
}

func (f *File) GetSize() int64 {
	if f == nil {
		return 0
	}
	return f.Size
}

func (f *File) GetMimeType() string {
	if f == nil {
		return ""
	}
	return f.MimeType
}

type Submission struct {
	Id                uuid.UUID
	StudentId         uuid.UUID
	AssignmentId      uuid.UUID
	CourseId          uuid.UUID
	SubmittedAt       time.Time
	Status            SubmissionStatus
	Grade             *float64
	Files             []*File
	Hash              string
	ConfirmationToken string
}

func NewSubmission(studentId, assignmentId, courseId uuid.UUID) (*Submission, error) {
	id, err := uuid.NewRandom()
	if err != nil {
		return nil, err
	}

	return &Submission{
		Id:           id,
		StudentId:    studentId,
		AssignmentId: assignmentId,
		CourseId:     courseId,
		SubmittedAt:  time.Now(),
		Status:       StatusPending,
		Files:        []*File{},
	}, nil
}

func (s *Submission) GetId() uuid.UUID {
	if s == nil {
		return uuid.Nil
	}
	return s.Id
}

func (s *Submission) GetStatus() SubmissionStatus {
	if s == nil {
		return ""
	}
	return s.Status
}

func (s *Submission) SetStatus(status SubmissionStatus) error {
	if !status.IsValid() {
		return ErrInvalidSubmissionStatus
	}
	s.Status = status
	return nil
}

func (s *Submission) GetGrade() *float64 {
	if s == nil {
		return nil
	}
	return s.Grade
}

func (s *Submission) SetGrade(grade float64) error {
	if grade < 0 || grade > 100 {
		return ErrGradeOutOfRange
	}
	s.Grade = &grade
	return nil
}

func (s *Submission) GetFiles() []*File {
	if s == nil {
		return nil
	}
	return s.Files
}

func (s *Submission) AddFile(file *File) error {
	if file == nil {
		return ErrFileNameEmpty
	}
	s.Files = append(s.Files, file)
	return nil
}

func (s *Submission) GetHash() string {
	if s == nil {
		return ""
	}
	return s.Hash
}

func (s *Submission) SetHash(hash string) {
	s.Hash = hash
}

func (s *Submission) GetConfirmationToken() string {
	if s == nil {
		return ""
	}
	return s.ConfirmationToken
}

func (s *Submission) SetConfirmationToken(token string) {
	s.ConfirmationToken = token
}

func (s *Submission) IsConfirmed() bool {
	if s == nil {
		return false
	}
	return s.Status == StatusConfirmed
}

func (s *Submission) ValidateHashIntegrity(expectedHash string) bool {
	return s.Hash == expectedHash
}
