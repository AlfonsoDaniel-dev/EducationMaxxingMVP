package assignment

import "time"

type CreateAssignmentInputDTO struct {
	Title            string
	Description      string
	FechaPublicacion time.Time
	FechaEntrega     time.Time
	CourseId         string
}

type AssignmentOutputDTO struct {
	Id               string
	Title            string
	Description      string
	FechaPublicacion time.Time
	FechaEntrega     time.Time
	CourseId         string
}
