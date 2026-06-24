package user

type LoginInputDTO struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginOutputDTO struct {
	SessionToken string `json:"sessionToken"`
	UserId       string `json:"userId"`
	Rol          string `json:"rol"`
}

type CreateUserInputDTO struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Rol      string `json:"rol"`
	// Student-specific
	EnrollmentId    string `json:"enrollmentId"`
	AcademicProgram string `json:"academicProgram"`
	Semester        int    `json:"semester"`
	// Professor-specific
	Speciality string `json:"speciality"`
	Department string `json:"department"`
	// Admin-specific
	Area string `json:"area"`
}

type UserOutputDTO struct {
	Id    string `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
	Rol   string `json:"rol"`
}
