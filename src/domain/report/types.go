package report

import (
	"time"

	"github.com/google/uuid"
)

type RiskLevel string

const (
	RiskHigh   RiskLevel = "high"
	RiskMedium RiskLevel = "medium"
	RiskLow    RiskLevel = "low"
)

func NewRiskLevel(s string) (RiskLevel, error) {
	switch RiskLevel(s) {
	case RiskHigh, RiskMedium, RiskLow:
		return RiskLevel(s), nil
	default:
		return "", ErrInvalidRiskLevel
	}
}

func (r RiskLevel) Value() string {
	return string(r)
}

// DetermineRiskLevel encodes the business rule for academic risk assessment.
// < 60% → high, 60–75% → medium, > 75% → low
func DetermineRiskLevel(porcentajeAvance float64) RiskLevel {
	if porcentajeAvance < 60.0 {
		return RiskHigh
	} else if porcentajeAvance <= 75.0 {
		return RiskMedium
	}
	return RiskLow
}

type AcademicReport struct {
	Id               uuid.UUID
	StudentId        uuid.UUID
	CourseId         uuid.UUID
	Promedio         float64
	PorcentajeAvance float64
	IndicadorRiesgo  RiskLevel
	GeneratedAt      time.Time
	PreviousReportId *uuid.UUID
}

func NewAcademicReport(studentId, courseId uuid.UUID, promedio, porcentajeAvance float64, previousReportId *uuid.UUID) (*AcademicReport, error) {
	if porcentajeAvance < 0 || porcentajeAvance > 100 {
		return nil, ErrInvalidProgressPercentage
	}
	if promedio < 0 {
		return nil, ErrNegativeAverage
	}

	id, err := uuid.NewRandom()
	if err != nil {
		return nil, err
	}

	return &AcademicReport{
		Id:               id,
		StudentId:        studentId,
		CourseId:         courseId,
		Promedio:         promedio,
		PorcentajeAvance: porcentajeAvance,
		IndicadorRiesgo:  DetermineRiskLevel(porcentajeAvance),
		GeneratedAt:      time.Now(),
		PreviousReportId: previousReportId,
	}, nil
}

func (r *AcademicReport) GetId() uuid.UUID {
	if r == nil {
		return uuid.Nil
	}
	return r.Id
}

func (r *AcademicReport) GetStudentId() uuid.UUID {
	if r == nil {
		return uuid.Nil
	}
	return r.StudentId
}

func (r *AcademicReport) GetCourseId() uuid.UUID {
	if r == nil {
		return uuid.Nil
	}
	return r.CourseId
}

func (r *AcademicReport) GetPromedio() float64 {
	if r == nil {
		return 0
	}
	return r.Promedio
}

func (r *AcademicReport) GetPorcentajeAvance() float64 {
	if r == nil {
		return 0
	}
	return r.PorcentajeAvance
}

func (r *AcademicReport) GetIndicadorRiesgo() RiskLevel {
	if r == nil {
		return ""
	}
	return r.IndicadorRiesgo
}

func (r *AcademicReport) GetGeneratedAt() time.Time {
	if r == nil {
		return time.Time{}
	}
	return r.GeneratedAt
}

func (r *AcademicReport) GetPreviousReportId() *uuid.UUID {
	if r == nil {
		return nil
	}
	return r.PreviousReportId
}
