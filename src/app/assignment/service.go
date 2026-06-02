package assignment

import (
	"github.com/google/uuid"

	domainassignment "github.com/AlfonsoDaniel-dev/EducationMaxxing/src/domain/assignment"
)

type AssignmentService struct {
	repo AssignmentRepository
}

func NewAssignmentService(repo AssignmentRepository) *AssignmentService {
	return &AssignmentService{repo: repo}
}

func (s *AssignmentService) CreateAssignment(input CreateAssignmentInputDTO) (*AssignmentOutputDTO, error) {
	courseId, err := uuid.Parse(input.CourseId)
	if err != nil {
		return nil, ErrInvalidId
	}

	assignment, err := domainassignment.NewAssignment(
		input.Title, input.Description,
		input.FechaPublicacion, input.FechaEntrega,
		courseId,
	)
	if err != nil {
		return nil, err
	}

	record := domainToRecord(assignment)
	if err := s.repo.Save(record); err != nil {
		return nil, err
	}

	return recordToDTO(record), nil
}

func (s *AssignmentService) GetAssignment(id string) (*AssignmentOutputDTO, error) {
	uid, err := uuid.Parse(id)
	if err != nil {
		return nil, ErrInvalidId
	}

	record, err := s.repo.FindById(uid)
	if err != nil {
		return nil, ErrAssignmentNotFound
	}

	return recordToDTO(record), nil
}

func (s *AssignmentService) ListByCourse(courseId string) ([]*AssignmentOutputDTO, error) {
	uid, err := uuid.Parse(courseId)
	if err != nil {
		return nil, ErrInvalidId
	}

	records, err := s.repo.FindByCourseId(uid)
	if err != nil {
		return nil, err
	}

	dtos := make([]*AssignmentOutputDTO, len(records))
	for i, r := range records {
		dtos[i] = recordToDTO(r)
	}
	return dtos, nil
}

func domainToRecord(a *domainassignment.Assignment) *AssignmentRecord {
	return &AssignmentRecord{
		Id:               a.Id,
		Title:            a.GetTitle(),
		Description:      a.GetDescription(),
		FechaPublicacion: a.GetFechaPublicacion(),
		FechaEntrega:     a.GetFechaEntrega(),
		CourseId:         a.CourseId,
	}
}

func recordToDTO(r *AssignmentRecord) *AssignmentOutputDTO {
	return &AssignmentOutputDTO{
		Id:               r.Id.String(),
		Title:            r.Title,
		Description:      r.Description,
		FechaPublicacion: r.FechaPublicacion,
		FechaEntrega:     r.FechaEntrega,
		CourseId:         r.CourseId.String(),
	}
}
