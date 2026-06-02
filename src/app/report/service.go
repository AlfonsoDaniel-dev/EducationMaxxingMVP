package report

import (
	"github.com/google/uuid"

	domainreport "github.com/AlfonsoDaniel-dev/EducationMaxxing/src/domain/report"
)

type ReportService struct {
	repo            ReportRepository
	assignmentQuery AssignmentQueryPort
	submissionQuery SubmissionQueryPort
}

func NewReportService(
	repo ReportRepository,
	assignmentQuery AssignmentQueryPort,
	submissionQuery SubmissionQueryPort,
) *ReportService {
	return &ReportService{
		repo:            repo,
		assignmentQuery: assignmentQuery,
		submissionQuery: submissionQuery,
	}
}

func (s *ReportService) GenerateReport(input GenerateReportInputDTO) (*ReportOutputDTO, error) {
	studentId, err := uuid.Parse(input.StudentId)
	if err != nil {
		return nil, ErrInvalidId
	}

	courseId, err := uuid.Parse(input.CourseId)
	if err != nil {
		return nil, ErrInvalidId
	}

	// Total assignments in the course
	assignments, err := s.assignmentQuery.FindByCourseId(courseId)
	if err != nil {
		return nil, err
	}
	if len(assignments) == 0 {
		return nil, ErrNoAssignments
	}

	// Confirmed submissions for the student in this course
	submissions, err := s.submissionQuery.FindByStudentAndCourse(studentId, courseId)
	if err != nil {
		return nil, err
	}

	var confirmed int
	var gradeSum float64
	var gradedCount int

	for _, sub := range submissions {
		if sub.Status == "confirmed" {
			confirmed++
			if sub.Grade != nil {
				gradeSum += *sub.Grade
				gradedCount++
			}
		}
	}

	porcentajeAvance := (float64(confirmed) / float64(len(assignments))) * 100

	var promedio float64
	if gradedCount > 0 {
		promedio = gradeSum / float64(gradedCount)
	}

	// Link to previous report if one exists
	var previousReportId *uuid.UUID
	previous, err := s.repo.FindLatestByStudent(studentId)
	if err == nil && previous != nil {
		previousReportId = &previous.Id
	}

	academicReport, err := domainreport.NewAcademicReport(
		studentId, courseId, promedio, porcentajeAvance, previousReportId,
	)
	if err != nil {
		return nil, err
	}

	record := &ReportRecord{
		Id:               academicReport.Id,
		StudentId:        academicReport.StudentId,
		CourseId:         academicReport.CourseId,
		Promedio:         academicReport.Promedio,
		PorcentajeAvance: academicReport.PorcentajeAvance,
		IndicadorRiesgo:  academicReport.IndicadorRiesgo.Value(),
		GeneratedAt:      academicReport.GeneratedAt,
		PreviousReportId: academicReport.PreviousReportId,
	}

	if err := s.repo.Save(record); err != nil {
		return nil, err
	}

	return recordToDTO(record), nil
}

func (s *ReportService) GetReport(id string) (*ReportOutputDTO, error) {
	uid, err := uuid.Parse(id)
	if err != nil {
		return nil, ErrInvalidId
	}

	record, err := s.repo.FindById(uid)
	if err != nil {
		return nil, ErrReportNotFound
	}

	return recordToDTO(record), nil
}

func (s *ReportService) GetLatestReport(studentId string) (*ReportOutputDTO, error) {
	uid, err := uuid.Parse(studentId)
	if err != nil {
		return nil, ErrInvalidId
	}

	record, err := s.repo.FindLatestByStudent(uid)
	if err != nil {
		return nil, ErrReportNotFound
	}

	return recordToDTO(record), nil
}

func (s *ReportService) GetReportsByStudentAndCourse(studentId, courseId string) ([]*ReportOutputDTO, error) {
	sid, err := uuid.Parse(studentId)
	if err != nil {
		return nil, ErrInvalidId
	}

	cid, err := uuid.Parse(courseId)
	if err != nil {
		return nil, ErrInvalidId
	}

	records, err := s.repo.FindByStudentAndCourse(sid, cid)
	if err != nil {
		return nil, err
	}

	dtos := make([]*ReportOutputDTO, len(records))
	for i, r := range records {
		dtos[i] = recordToDTO(r)
	}
	return dtos, nil
}

func recordToDTO(r *ReportRecord) *ReportOutputDTO {
	var prevId *string
	if r.PreviousReportId != nil {
		s := r.PreviousReportId.String()
		prevId = &s
	}

	return &ReportOutputDTO{
		Id:               r.Id.String(),
		StudentId:        r.StudentId.String(),
		CourseId:         r.CourseId.String(),
		Promedio:         r.Promedio,
		PorcentajeAvance: r.PorcentajeAvance,
		IndicadorRiesgo:  r.IndicadorRiesgo,
		GeneratedAt:      r.GeneratedAt,
		PreviousReportId: prevId,
	}
}
