package course

type CreateCourseInputDTO struct {
	Name        string
	Description string
	Period      string
	ProfessorId string
}

type CourseOutputDTO struct {
	Id          string
	Name        string
	Description string
	Period      string
	ProfessorId string
	StudentIds  []string
}

type EnrollStudentInputDTO struct {
	CourseId  string
	StudentId string
}
