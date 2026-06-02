package academicprogram

import (
	"errors"
	"strings"
)

var (
	ErrAcademicProgramNotValid = errors.New("academic program does not exist")
	ErrSemesterNotValid        = errors.New("semester must be between 1 and 8")
	ErrAreaNotValid            = errors.New("area does not exist")
	ErrSpecialityNotValid      = errors.New("speciality does not exist")
)

var validAcademicPrograms = map[string]struct{}{
	"computer science":       {},
	"software engineering":   {},
	"systems engineering":    {},
	"business administration": {},
	"psychology":             {},
}

var validAreas = map[string]struct{}{
	"technology":          {},
	"health sciences":     {},
	"social sciences":     {},
	"arts and humanities": {},
	"business":            {},
}

var validSpecialities = map[string]struct{}{
	"software engineering":   {},
	"data science":           {},
	"cybersecurity":          {},
	"artificial intelligence": {},
	"databases":              {},
	"cloud computing":        {},
	"computer networks":      {},
	"robotics":               {},
}

type AcademicProgram struct {
	program string
}

func NewAcademicProgram(program string) (*AcademicProgram, error) {
	program = normalize(program)
	if _, ok := validAcademicPrograms[program]; !ok {
		return nil, ErrAcademicProgramNotValid
	}

	return &AcademicProgram{program: program}, nil
}

func (a *AcademicProgram) Value() string {
	if a == nil {
		return ""
	}

	return a.program
}

type Semester struct {
	semester int
}

func NewSemester(semester int) (*Semester, error) {
	if semester < 1 || semester > 8 {
		return nil, ErrSemesterNotValid
	}

	return &Semester{semester: semester}, nil
}

func (s *Semester) Value() int {
	if s == nil {
		return 0
	}

	return s.semester
}

type Area struct {
	area string
}

func NewArea(area string) (*Area, error) {
	area = normalize(area)
	if _, ok := validAreas[area]; !ok {
		return nil, ErrAreaNotValid
	}

	return &Area{area: area}, nil
}

func (a *Area) Value() string {
	if a == nil {
		return ""
	}

	return a.area
}

type Speciality struct {
	speciality string
}

func NewSpeciality(speciality string) (*Speciality, error) {
	speciality = normalize(speciality)
	if _, ok := validSpecialities[speciality]; !ok {
		return nil, ErrSpecialityNotValid
	}

	return &Speciality{speciality: speciality}, nil
}

func (s *Speciality) Value() string {
	if s == nil {
		return ""
	}

	return s.speciality
}

func normalize(value string) string {
	return strings.ToLower(strings.TrimSpace(value))
}

