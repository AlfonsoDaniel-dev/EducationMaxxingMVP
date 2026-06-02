package course

import (
	"strings"

	"github.com/google/uuid"
)

type CourseName struct {
	name string
}

func NewCourseName(name string) (*CourseName, error) {
	name = strings.TrimSpace(name)
	if name == "" {
		return nil, ErrCourseNameEmpty
	}
	return &CourseName{name: name}, nil
}

func (c *CourseName) Value() string {
	if c == nil {
		return ""
	}
	return c.name
}

type CourseDescription struct {
	description string
}

func NewCourseDescription(description string) (*CourseDescription, error) {
	description = strings.TrimSpace(description)
	if description == "" {
		return nil, ErrCourseDescriptionEmpty
	}
	return &CourseDescription{description: description}, nil
}

func (c *CourseDescription) Value() string {
	if c == nil {
		return ""
	}
	return c.description
}

type AcademicPeriod struct {
	period string
}

func NewAcademicPeriod(period string) (*AcademicPeriod, error) {
	period = strings.TrimSpace(period)
	if period == "" {
		return nil, ErrAcademicPeriodEmpty
	}
	return &AcademicPeriod{period: period}, nil
}

func (a *AcademicPeriod) Value() string {
	if a == nil {
		return ""
	}
	return a.period
}

type Course struct {
	Id          uuid.UUID
	Name        *CourseName
	Description *CourseDescription
	Period      *AcademicPeriod
	ProfessorId uuid.UUID
	StudentIds  []uuid.UUID
}

func NewCourse(name, description, period string, professorId uuid.UUID) (*Course, error) {
	id, err := uuid.NewRandom()
	if err != nil {
		return nil, err
	}

	courseName, err := NewCourseName(name)
	if err != nil {
		return nil, ErrorOnCreatingCourse(err)
	}

	courseDesc, err := NewCourseDescription(description)
	if err != nil {
		return nil, ErrorOnCreatingCourse(err)
	}

	academicPeriod, err := NewAcademicPeriod(period)
	if err != nil {
		return nil, ErrorOnCreatingCourse(err)
	}

	return &Course{
		Id:          id,
		Name:        courseName,
		Description: courseDesc,
		Period:      academicPeriod,
		ProfessorId: professorId,
		StudentIds:  []uuid.UUID{},
	}, nil
}

func (c *Course) GetId() uuid.UUID {
	if c == nil {
		return uuid.Nil
	}
	return c.Id
}

func (c *Course) GetName() string {
	if c == nil || c.Name == nil {
		return ""
	}
	return c.Name.Value()
}

func (c *Course) SetName(name string) error {
	n, err := NewCourseName(name)
	if err != nil {
		return err
	}
	c.Name = n
	return nil
}

func (c *Course) GetDescription() string {
	if c == nil || c.Description == nil {
		return ""
	}
	return c.Description.Value()
}

func (c *Course) SetDescription(description string) error {
	d, err := NewCourseDescription(description)
	if err != nil {
		return err
	}
	c.Description = d
	return nil
}

func (c *Course) GetPeriod() string {
	if c == nil || c.Period == nil {
		return ""
	}
	return c.Period.Value()
}

func (c *Course) SetPeriod(period string) error {
	p, err := NewAcademicPeriod(period)
	if err != nil {
		return err
	}
	c.Period = p
	return nil
}

func (c *Course) GetProfessorId() uuid.UUID {
	if c == nil {
		return uuid.Nil
	}
	return c.ProfessorId
}

func (c *Course) GetStudentIds() []uuid.UUID {
	if c == nil {
		return nil
	}
	return c.StudentIds
}

func (c *Course) HasStudent(studentId uuid.UUID) bool {
	for _, id := range c.StudentIds {
		if id == studentId {
			return true
		}
	}
	return false
}

func (c *Course) AddStudent(studentId uuid.UUID) error {
	if c.HasStudent(studentId) {
		return ErrStudentAlreadyEnrolled
	}
	c.StudentIds = append(c.StudentIds, studentId)
	return nil
}

func (c *Course) RemoveStudent(studentId uuid.UUID) error {
	for i, id := range c.StudentIds {
		if id == studentId {
			c.StudentIds = append(c.StudentIds[:i], c.StudentIds[i+1:]...)
			return nil
		}
	}
	return ErrStudentNotFound
}
