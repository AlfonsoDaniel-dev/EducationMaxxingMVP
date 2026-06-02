package user

type Student struct {
	User
	EnrollmentId     string
	AcademicProgram  *AcademicProgram
	Semester         *Semester
}

func NewStudent(name string, email string, password string, enrollmentId string, academicProgram string, semester int) (*Student, error) {
	usr, err := NewUser(name, email, password, "student")
	if err != nil {
		return nil, err
	}

	program, err := NewAcademicProgram(academicProgram)
	if err != nil {
		return nil, err
	}

	sem, err := NewSemester(semester)
	if err != nil {
		return nil, err
	}
	
	return  &Student{
		User:            *usr,
		EnrollmentId:    enrollmentId,
		AcademicProgram: program,
		Semester:        sem,
	}, nil
}

func (s *Student) GetEnrollmentId() string {
	if s == nil {
		return ""
	}

	return s.EnrollmentId
}

func (s *Student) SetEnrollmentId(enrollmentId string) {
	if s == nil {
		return
	}

	s.EnrollmentId = enrollmentId
}

func (s *Student) GetAcademicProgram() string {
	if s == nil || s.AcademicProgram == nil {
		return ""
	}

	return s.AcademicProgram.Value()
}

func (s *Student) SetAcademicProgram(academicProgram string) error {
	program, err := NewAcademicProgram(academicProgram)
	if err != nil {
		return err
	}

	s.AcademicProgram = program
	return nil
}

func (s *Student) GetSemester() int {
	if s == nil || s.Semester == nil {
		return 0
	}

	return s.Semester.Value()
}

func (s *Student) SetSemester(semester int) error {
	sem, err := NewSemester(semester)
	if err != nil {
		return err
	}

	s.Semester = sem
	return nil
}
