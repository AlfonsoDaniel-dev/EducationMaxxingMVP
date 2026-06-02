package user

import (
	"strings"

	academicprogram "github.com/AlfonsoDaniel-dev/EducationMaxxing/src/domain/AcademicProgram"
)

type Name struct {
	name string
}

func NewName(name string) (*Name, error) {
	if len(name) == 0 {
		return nil, ErrNameCannotBeEmpty
	}

	return &Name{
		name: name,
	}, nil
}

type Email struct {
	Email string
}

func NewEmail(email string) (*Email, error) {
	if !strings.ContainsAny(email, "@") || email == "" {
		return nil, ErrEmailNotValid
	}
	return &Email{
		Email: email,
	}, nil
}

type Password struct {
	password string
}

func (p *Password) validatePassword(pwsString string) error {
	if len(pwsString) == 0 {
		return ErrPasswordCannotBeEmpty
	} else if len(pwsString) < 8 {
		return ErrPasswordNotLongEnough
	} else if len(pwsString) > 32 {
		return ErrPasswordTooLong
	} else {
		return nil
	}
}

func NewPassword(password string) (*Password, error) {
	if err := (&Password{}).validatePassword(password); err != nil {
		return nil, err
	}

	return &Password{
		password: password,
	}, nil
}

type Rol struct {
	rol string
}

func NewRol(rol string) (*Rol, error) {
	if rol != "admin" && rol != "student" && rol != "professor" {
		return nil, ErrRolNotValid
	}

	return &Rol{
		rol: rol,
	}, nil
}

type AcademicProgram = academicprogram.AcademicProgram
type Semester = academicprogram.Semester
type Area = academicprogram.Area
type Speciality = academicprogram.Speciality

func NewAcademicProgram(program string) (*AcademicProgram, error) {
	return academicprogram.NewAcademicProgram(program)
}

func NewSemester(semester int) (*Semester, error) {
	return academicprogram.NewSemester(semester)
}

func NewArea(area string) (*Area, error) {
	return academicprogram.NewArea(area)
}

func NewSpeciality(speciality string) (*Speciality, error) {
	return academicprogram.NewSpeciality(speciality)
}

