package report

import "time"

type GenerateReportInputDTO struct {
	StudentId string
	CourseId  string
}

type ReportOutputDTO struct {
	Id               string
	StudentId        string
	CourseId         string
	Promedio         float64
	PorcentajeAvance float64
	IndicadorRiesgo  string
	GeneratedAt      time.Time
	PreviousReportId *string
}
