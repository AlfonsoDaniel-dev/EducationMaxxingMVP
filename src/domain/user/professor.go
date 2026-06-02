package user

type Professor struct {
	User
	Speciality *Speciality
	Department *Area
}

func NewProfessor(name string, email string, password string, speciality string, department string) (*Professor, error) {
	usr, err := NewUser(name, email, password, "professor")
	if err != nil {
		return nil, err
	}

	spec, err := NewSpeciality(speciality)
	if err != nil {
		return nil, err
	}

	area, err := NewArea(department)
	if err != nil {
		return nil, err
	}

	return &Professor{
		User:       *usr,
		Speciality: spec,
		Department: area,
	}, nil
}

func (p *Professor) GetSpeciality() string {
	if p == nil || p.Speciality == nil {
		return ""
	}

	return p.Speciality.Value()
}

func (p *Professor) SetSpeciality(speciality string) error {
	spec, err := NewSpeciality(speciality)
	if err != nil {
		return err
	}

	p.Speciality = spec
	return nil
}

func (p *Professor) GetDepartment() string {
	if p == nil || p.Department == nil {
		return ""
	}

	return p.Department.Value()
}

func (p *Professor) SetDepartment(department string) error {
	area, err := NewArea(department)
	if err != nil {
		return err
	}

	p.Department = area
	return nil
}

