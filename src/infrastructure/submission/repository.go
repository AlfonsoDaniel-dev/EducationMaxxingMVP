package submission

import (
	"errors"
	"sync"

	"github.com/google/uuid"

	appsubmission "github.com/AlfonsoDaniel-dev/EducationMaxxing/src/app/submission"
	appreport "github.com/AlfonsoDaniel-dev/EducationMaxxing/src/app/report"
)

var ErrSubmissionNotFound = errors.New("submission not found")

type InMemorySubmissionRepository struct {
	mu    sync.RWMutex
	data  map[uuid.UUID]*appsubmission.SubmissionRecord
	files map[uuid.UUID][]*appsubmission.FileRecord
}

func NewInMemorySubmissionRepository() *InMemorySubmissionRepository {
	return &InMemorySubmissionRepository{
		data:  make(map[uuid.UUID]*appsubmission.SubmissionRecord),
		files: make(map[uuid.UUID][]*appsubmission.FileRecord),
	}
}

func (r *InMemorySubmissionRepository) Save(submission *appsubmission.SubmissionRecord) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	record := *submission
	r.data[submission.Id] = &record
	return nil
}

func (r *InMemorySubmissionRepository) FindById(id uuid.UUID) (*appsubmission.SubmissionRecord, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	record, ok := r.data[id]
	if !ok {
		return nil, ErrSubmissionNotFound
	}

	return copyRecord(record), nil
}

func (r *InMemorySubmissionRepository) FindByStudentAndAssignment(studentId, assignmentId uuid.UUID) (*appsubmission.SubmissionRecord, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	for _, record := range r.data {
		if record.StudentId == studentId && record.AssignmentId == assignmentId {
			return copyRecord(record), nil
		}
	}
	return nil, ErrSubmissionNotFound
}

func (r *InMemorySubmissionRepository) FindByStudentAndCourse(studentId, courseId uuid.UUID) ([]*appsubmission.SubmissionRecord, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	var results []*appsubmission.SubmissionRecord
	for _, record := range r.data {
		if record.StudentId == studentId && record.CourseId == courseId {
			results = append(results, copyRecord(record))
		}
	}
	return results, nil
}

func (r *InMemorySubmissionRepository) UpdateStatus(id uuid.UUID, status string) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	record, ok := r.data[id]
	if !ok {
		return ErrSubmissionNotFound
	}

	record.Status = status
	return nil
}

func (r *InMemorySubmissionRepository) UpdateGrade(id uuid.UUID, grade float64) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	record, ok := r.data[id]
	if !ok {
		return ErrSubmissionNotFound
	}

	record.Grade = &grade
	return nil
}

func (r *InMemorySubmissionRepository) UpdateConfirmationToken(id uuid.UUID, token string) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	record, ok := r.data[id]
	if !ok {
		return ErrSubmissionNotFound
	}

	record.ConfirmationToken = token
	return nil
}

func (r *InMemorySubmissionRepository) AddFile(submissionId uuid.UUID, file *appsubmission.FileRecord) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	fileCopy := *file
	r.files[submissionId] = append(r.files[submissionId], &fileCopy)
	return nil
}

func (r *InMemorySubmissionRepository) FindFilesBySubmission(submissionId uuid.UUID) ([]*appsubmission.FileRecord, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	files := r.files[submissionId]
	result := make([]*appsubmission.FileRecord, len(files))
	for i, f := range files {
		copy := *f
		result[i] = &copy
	}
	return result, nil
}

func copyRecord(r *appsubmission.SubmissionRecord) *appsubmission.SubmissionRecord {
	c := *r
	if r.Grade != nil {
		grade := *r.Grade
		c.Grade = &grade
	}
	return &c
}

// InMemorySubmissionRepository satisfies both SubmissionRepository and
// SubmissionQueryPort via Go's structural typing — same FindByStudentAndCourse signature.
var _ appsubmission.SubmissionRepository = &InMemorySubmissionRepository{}
var _ appreport.SubmissionQueryPort = &InMemorySubmissionRepository{}
