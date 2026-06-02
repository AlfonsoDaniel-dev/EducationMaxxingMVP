package assignment

import (
	"errors"
	"sync"

	"github.com/google/uuid"

	appassignment "github.com/AlfonsoDaniel-dev/EducationMaxxing/src/app/assignment"
	appreport "github.com/AlfonsoDaniel-dev/EducationMaxxing/src/app/report"
)

var ErrAssignmentNotFound = errors.New("assignment not found")

type InMemoryAssignmentRepository struct {
	mu   sync.RWMutex
	data map[uuid.UUID]*appassignment.AssignmentRecord
}

func NewInMemoryAssignmentRepository() *InMemoryAssignmentRepository {
	return &InMemoryAssignmentRepository{
		data: make(map[uuid.UUID]*appassignment.AssignmentRecord),
	}
}

func (r *InMemoryAssignmentRepository) Save(assignment *appassignment.AssignmentRecord) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	record := *assignment
	r.data[assignment.Id] = &record
	return nil
}

func (r *InMemoryAssignmentRepository) FindById(id uuid.UUID) (*appassignment.AssignmentRecord, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	record, ok := r.data[id]
	if !ok {
		return nil, ErrAssignmentNotFound
	}

	copy := *record
	return &copy, nil
}

func (r *InMemoryAssignmentRepository) FindByCourseId(courseId uuid.UUID) ([]*appassignment.AssignmentRecord, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	var results []*appassignment.AssignmentRecord
	for _, record := range r.data {
		if record.CourseId == courseId {
			copy := *record
			results = append(results, &copy)
		}
	}
	return results, nil
}

// Compile-time interface satisfaction checks.
// InMemoryAssignmentRepository satisfies both AssignmentRepository and
// AssignmentQueryPort via Go's structural typing — same FindByCourseId signature.
var _ appassignment.AssignmentRepository = &InMemoryAssignmentRepository{}
var _ appreport.AssignmentQueryPort = &InMemoryAssignmentRepository{}
