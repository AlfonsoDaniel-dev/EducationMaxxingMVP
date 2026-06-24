package report

import (
	"errors"
	"sync"

	"github.com/google/uuid"

	appreport "github.com/AlfonsoDaniel-dev/EducationMaxxing/src/app/report"
)

var ErrReportNotFound = errors.New("report not found")

type InMemoryReportRepository struct {
	mu   sync.RWMutex
	data map[uuid.UUID]*appreport.ReportRecord
}

func NewInMemoryReportRepository() *InMemoryReportRepository {
	return &InMemoryReportRepository{
		data: make(map[uuid.UUID]*appreport.ReportRecord),
	}
}

func (r *InMemoryReportRepository) Save(report *appreport.ReportRecord) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	record := *report
	if report.PreviousReportId != nil {
		prev := *report.PreviousReportId
		record.PreviousReportId = &prev
	}
	r.data[report.Id] = &record
	return nil
}

func (r *InMemoryReportRepository) FindById(id uuid.UUID) (*appreport.ReportRecord, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	record, ok := r.data[id]
	if !ok {
		return nil, ErrReportNotFound
	}

	return copyRecord(record), nil
}

func (r *InMemoryReportRepository) FindByStudentAndCourse(studentId, courseId uuid.UUID) ([]*appreport.ReportRecord, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	var results []*appreport.ReportRecord
	for _, record := range r.data {
		if record.StudentId == studentId && record.CourseId == courseId {
			results = append(results, copyRecord(record))
		}
	}
	return results, nil
}

func (r *InMemoryReportRepository) FindLatestByStudent(studentId uuid.UUID) (*appreport.ReportRecord, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	var latest *appreport.ReportRecord
	for _, record := range r.data {
		if record.StudentId == studentId {
			if latest == nil || record.GeneratedAt.After(latest.GeneratedAt) {
				latest = record
			}
		}
	}

	if latest == nil {
		return nil, ErrReportNotFound
	}

	return copyRecord(latest), nil
}

func (r *InMemoryReportRepository) FindAll() ([]*appreport.ReportRecord, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	results := make([]*appreport.ReportRecord, 0, len(r.data))
	for _, record := range r.data {
		results = append(results, copyRecord(record))
	}
	return results, nil
}

func copyRecord(r *appreport.ReportRecord) *appreport.ReportRecord {
	c := *r
	if r.PreviousReportId != nil {
		prev := *r.PreviousReportId
		c.PreviousReportId = &prev
	}
	return &c
}

var _ appreport.ReportRepository = &InMemoryReportRepository{}
