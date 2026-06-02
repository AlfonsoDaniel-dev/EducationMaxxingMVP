package user

type LoginInputDTO struct {
	Email    string
	Password string
}

type LoginOutputDTO struct {
	SessionToken string
	UserId       string
	Rol          string
}

type CreateUserInputDTO struct {
	Name     string
	Email    string
	Password string
	Rol      string
	// Student-specific
	EnrollmentId    string
	AcademicProgram string
	Semester        int
	// Professor-specific
	Speciality string
	Department string
	// Admin-specific
	Area string
}

type UserOutputDTO struct {
	Id    string
	Name  string
	Email string
	Rol   string
}
