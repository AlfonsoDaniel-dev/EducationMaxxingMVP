package report

import "time"

type GenerateReportInputDTO struct {
	StudentId string `json:"studentId"`
	CourseId  string `json:"courseId"`
}

type ReportOutputDTO struct {
	Id               string    `json:"id"`
	StudentId        string    `json:"studentId"`
	CourseId         string    `json:"courseId"`
	Promedio         float64   `json:"promedio"`
	PorcentajeAvance float64   `json:"porcentajeAvance"`
	IndicadorRiesgo  string    `json:"indicadorRiesgo"`
	GeneratedAt      time.Time `json:"generatedAt"`
	PreviousReportId *string   `json:"previousReportId"`
}
