package assignment

import (
	"errors"
	"time"

	"github.com/google/uuid"
)

var (
	ErrInvalidId         = errors.New("invalid id format")
	ErrAssignmentNotFound = errors.New("assignment not found")
)

type AssignmentRepository interface {
	Save(assignment *AssignmentRecord) error
	FindById(id uuid.UUID) (*AssignmentRecord, error)
	FindByCourseId(courseId uuid.UUID) ([]*AssignmentRecord, error)
}

type AssignmentRecord struct {
	Id               uuid.UUID
	Title            string
	Description      string
	FechaPublicacion time.Time
	FechaEntrega     time.Time
	CourseId         uuid.UUID
}
