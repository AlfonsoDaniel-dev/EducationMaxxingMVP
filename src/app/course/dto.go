package course

type CreateCourseInputDTO struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Period      string `json:"period"`
	ProfessorId string `json:"professorId"`
}

type CourseOutputDTO struct {
	Id          string   `json:"id"`
	Name        string   `json:"name"`
	Description string   `json:"description"`
	Period      string   `json:"period"`
	ProfessorId string   `json:"professorId"`
	StudentIds  []string `json:"studentIds"`
}

type EnrollStudentInputDTO struct {
	CourseId  string `json:"courseId"`
	StudentId string `json:"studentId"`
}
