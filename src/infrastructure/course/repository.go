package course

import (
	"errors"
	"sync"

	"github.com/google/uuid"

	appcourse "github.com/AlfonsoDaniel-dev/EducationMaxxing/src/app/course"
)

var ErrCourseNotFound = errors.New("course not found")

type InMemoryCourseRepository struct {
	mu   sync.RWMutex
	data map[uuid.UUID]*appcourse.CourseRecord
}

func NewInMemoryCourseRepository() *InMemoryCourseRepository {
	return &InMemoryCourseRepository{
		data: make(map[uuid.UUID]*appcourse.CourseRecord),
	}
}

func (r *InMemoryCourseRepository) Save(course *appcourse.CourseRecord) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	studentIds := make([]uuid.UUID, len(course.StudentIds))
	copy(studentIds, course.StudentIds)

	record := *course
	record.StudentIds = studentIds
	r.data[course.Id] = &record
	return nil
}

func (r *InMemoryCourseRepository) FindById(id uuid.UUID) (*appcourse.CourseRecord, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	record, ok := r.data[id]
	if !ok {
		return nil, ErrCourseNotFound
	}

	return copyRecord(record), nil
}

func (r *InMemoryCourseRepository) FindByProfessorId(professorId uuid.UUID) ([]*appcourse.CourseRecord, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	var results []*appcourse.CourseRecord
	for _, record := range r.data {
		if record.ProfessorId == professorId {
			results = append(results, copyRecord(record))
		}
	}
	return results, nil
}

func (r *InMemoryCourseRepository) FindByStudentId(studentId uuid.UUID) ([]*appcourse.CourseRecord, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	var results []*appcourse.CourseRecord
	for _, record := range r.data {
		for _, id := range record.StudentIds {
			if id == studentId {
				results = append(results, copyRecord(record))
				break
			}
		}
	}
	return results, nil
}

func (r *InMemoryCourseRepository) AddStudent(courseId, studentId uuid.UUID) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	record, ok := r.data[courseId]
	if !ok {
		return ErrCourseNotFound
	}

	for _, id := range record.StudentIds {
		if id == studentId {
			return nil // already enrolled — idempotent
		}
	}

	record.StudentIds = append(record.StudentIds, studentId)
	return nil
}

func (r *InMemoryCourseRepository) FindStudentsByCourse(courseId uuid.UUID) ([]uuid.UUID, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	record, ok := r.data[courseId]
	if !ok {
		return nil, ErrCourseNotFound
	}

	ids := make([]uuid.UUID, len(record.StudentIds))
	copy(ids, record.StudentIds)
	return ids, nil
}

func copyRecord(r *appcourse.CourseRecord) *appcourse.CourseRecord {
	studentIds := make([]uuid.UUID, len(r.StudentIds))
	copy(studentIds, r.StudentIds)

	c := *r
	c.StudentIds = studentIds
	return &c
}

var _ appcourse.CourseRepository = &InMemoryCourseRepository{}
