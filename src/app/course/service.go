package course

import (
	"github.com/google/uuid"

	domaincourse "github.com/AlfonsoDaniel-dev/EducationMaxxing/src/domain/course"
)

type CourseService struct {
	repo CourseRepository
}

func NewCourseService(repo CourseRepository) *CourseService {
	return &CourseService{repo: repo}
}

func (s *CourseService) CreateCourse(input CreateCourseInputDTO) (*CourseOutputDTO, error) {
	professorId, err := uuid.Parse(input.ProfessorId)
	if err != nil {
		return nil, ErrInvalidId
	}

	course, err := domaincourse.NewCourse(input.Name, input.Description, input.Period, professorId)
	if err != nil {
		return nil, err
	}

	record := domainToRecord(course)
	if err := s.repo.Save(record); err != nil {
		return nil, err
	}

	return recordToDTO(record), nil
}

func (s *CourseService) GetCourse(id string) (*CourseOutputDTO, error) {
	uid, err := uuid.Parse(id)
	if err != nil {
		return nil, ErrInvalidId
	}

	record, err := s.repo.FindById(uid)
	if err != nil {
		return nil, ErrCourseNotFound
	}

	return recordToDTO(record), nil
}

func (s *CourseService) ListCoursesByProfessor(professorId string) ([]*CourseOutputDTO, error) {
	uid, err := uuid.Parse(professorId)
	if err != nil {
		return nil, ErrInvalidId
	}

	records, err := s.repo.FindByProfessorId(uid)
	if err != nil {
		return nil, err
	}

	return recordsToDTOs(records), nil
}

func (s *CourseService) ListCoursesByStudent(studentId string) ([]*CourseOutputDTO, error) {
	uid, err := uuid.Parse(studentId)
	if err != nil {
		return nil, ErrInvalidId
	}

	records, err := s.repo.FindByStudentId(uid)
	if err != nil {
		return nil, err
	}

	return recordsToDTOs(records), nil
}

func (s *CourseService) ListAllCourses() ([]*CourseOutputDTO, error) {
	records, err := s.repo.FindAll()
	if err != nil {
		return nil, err
	}
	return recordsToDTOs(records), nil
}

func (s *CourseService) AssignProfessor(courseId, professorId string) error {
	cid, err := uuid.Parse(courseId)
	if err != nil {
		return ErrInvalidId
	}
	pid, err := uuid.Parse(professorId)
	if err != nil {
		return ErrInvalidId
	}
	return s.repo.UpdateProfessor(cid, pid)
}

func (s *CourseService) EnrollStudent(input EnrollStudentInputDTO) error {
	courseId, err := uuid.Parse(input.CourseId)
	if err != nil {
		return ErrInvalidId
	}

	studentId, err := uuid.Parse(input.StudentId)
	if err != nil {
		return ErrInvalidId
	}

	return s.repo.AddStudent(courseId, studentId)
}

func domainToRecord(c *domaincourse.Course) *CourseRecord {
	studentIds := make([]uuid.UUID, len(c.StudentIds))
	copy(studentIds, c.StudentIds)

	return &CourseRecord{
		Id:          c.Id,
		Name:        c.GetName(),
		Description: c.GetDescription(),
		Period:      c.GetPeriod(),
		ProfessorId: c.ProfessorId,
		StudentIds:  studentIds,
	}
}

func recordToDTO(r *CourseRecord) *CourseOutputDTO {
	studentIds := make([]string, len(r.StudentIds))
	for i, id := range r.StudentIds {
		studentIds[i] = id.String()
	}

	return &CourseOutputDTO{
		Id:          r.Id.String(),
		Name:        r.Name,
		Description: r.Description,
		Period:      r.Period,
		ProfessorId: r.ProfessorId.String(),
		StudentIds:  studentIds,
	}
}

func recordsToDTOs(records []*CourseRecord) []*CourseOutputDTO {
	dtos := make([]*CourseOutputDTO, len(records))
	for i, r := range records {
		dtos[i] = recordToDTO(r)
	}
	return dtos
}
