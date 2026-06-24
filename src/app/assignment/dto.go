package assignment

import "time"

type CreateAssignmentInputDTO struct {
	Title            string    `json:"title"`
	Description      string    `json:"description"`
	FechaPublicacion time.Time `json:"fechaPublicacion"`
	FechaEntrega     time.Time `json:"fechaEntrega"`
	CourseId         string    `json:"courseId"`
}

type AssignmentOutputDTO struct {
	Id               string    `json:"id"`
	Title            string    `json:"title"`
	Description      string    `json:"description"`
	FechaPublicacion time.Time `json:"fechaPublicacion"`
	FechaEntrega     time.Time `json:"fechaEntrega"`
	CourseId         string    `json:"courseId"`
}
