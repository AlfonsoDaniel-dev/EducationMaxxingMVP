package course

import (
	"errors"

	"github.com/google/uuid"
)

var (
	ErrInvalidId    = errors.New("invalid id format")
	ErrCourseNotFound = errors.New("course not found")
)

type CourseRepository interface {
	Save(course *CourseRecord) error
	FindById(id uuid.UUID) (*CourseRecord, error)
	FindAll() ([]*CourseRecord, error)
	FindByProfessorId(professorId uuid.UUID) ([]*CourseRecord, error)
	FindByStudentId(studentId uuid.UUID) ([]*CourseRecord, error)
	AddStudent(courseId, studentId uuid.UUID) error
	UpdateProfessor(courseId, professorId uuid.UUID) error
	FindStudentsByCourse(courseId uuid.UUID) ([]uuid.UUID, error)
}

type CourseRecord struct {
	Id          uuid.UUID
	Name        string
	Description string
	Period      string
	ProfessorId uuid.UUID
	StudentIds  []uuid.UUID
}
