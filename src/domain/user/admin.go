package user

type Admin struct {
	User
	Area *Area
}

func NewAdmin(name string, email string, password string, area string) (*Admin, error) {
	usr, err := NewUser(name, email, password, "admin")
	if err != nil {
		return nil, err
	}

	adminArea, err := NewArea(area)
	if err != nil {
		return nil, err
	}

	return &Admin{
		User: *usr,
		Area: adminArea,
	}, nil
}

func (a *Admin) GetArea() string {
	if a == nil || a.Area == nil {
		return ""
	}

	return a.Area.Value()
}

func (a *Admin) SetArea(area string) error {
	adminArea, err := NewArea(area)
	if err != nil {
		return err
	}

	a.Area = adminArea
	return nil
}

