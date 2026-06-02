package assignment

import (
	"strings"
	"time"

	"github.com/google/uuid"
)

type AssignmentTitle struct {
	title string
}

func NewAssignmentTitle(title string) (*AssignmentTitle, error) {
	title = strings.TrimSpace(title)
	if title == "" {
		return nil, ErrAssignmentTitleEmpty
	}
	return &AssignmentTitle{title: title}, nil
}

func (a *AssignmentTitle) Value() string {
	if a == nil {
		return ""
	}
	return a.title
}

type AssignmentDescription struct {
	description string
}

func NewAssignmentDescription(description string) (*AssignmentDescription, error) {
	description = strings.TrimSpace(description)
	if description == "" {
		return nil, ErrAssignmentDescriptionEmpty
	}
	return &AssignmentDescription{description: description}, nil
}

func (a *AssignmentDescription) Value() string {
	if a == nil {
		return ""
	}
	return a.description
}

type PublicationDate struct {
	date time.Time
}

func NewPublicationDate(date time.Time) (*PublicationDate, error) {
	if date.IsZero() {
		return nil, ErrPublicationDateZero
	}
	return &PublicationDate{date: date}, nil
}

func (p *PublicationDate) Value() time.Time {
	if p == nil {
		return time.Time{}
	}
	return p.date
}

type DeliveryDate struct {
	date time.Time
}

func NewDeliveryDate(date time.Time) (*DeliveryDate, error) {
	if date.IsZero() {
		return nil, ErrDeliveryDateZero
	}
	return &DeliveryDate{date: date}, nil
}

func (d *DeliveryDate) Value() time.Time {
	if d == nil {
		return time.Time{}
	}
	return d.date
}

type Assignment struct {
	Id               uuid.UUID
	Title            *AssignmentTitle
	Description      *AssignmentDescription
	FechaPublicacion *PublicationDate
	FechaEntrega     *DeliveryDate
	CourseId         uuid.UUID
}

func NewAssignment(title, description string, publicationDate, deliveryDate time.Time, courseId uuid.UUID) (*Assignment, error) {
	if !deliveryDate.After(publicationDate) {
		return nil, ErrDeliveryDateBeforePublish
	}

	id, err := uuid.NewRandom()
	if err != nil {
		return nil, err
	}

	assignmentTitle, err := NewAssignmentTitle(title)
	if err != nil {
		return nil, ErrorOnCreatingAssignment(err)
	}

	assignmentDesc, err := NewAssignmentDescription(description)
	if err != nil {
		return nil, ErrorOnCreatingAssignment(err)
	}

	pubDate, err := NewPublicationDate(publicationDate)
	if err != nil {
		return nil, ErrorOnCreatingAssignment(err)
	}

	delDate, err := NewDeliveryDate(deliveryDate)
	if err != nil {
		return nil, ErrorOnCreatingAssignment(err)
	}

	return &Assignment{
		Id:               id,
		Title:            assignmentTitle,
		Description:      assignmentDesc,
		FechaPublicacion: pubDate,
		FechaEntrega:     delDate,
		CourseId:         courseId,
	}, nil
}

func (a *Assignment) GetId() uuid.UUID {
	if a == nil {
		return uuid.Nil
	}
	return a.Id
}

func (a *Assignment) GetTitle() string {
	if a == nil || a.Title == nil {
		return ""
	}
	return a.Title.Value()
}

func (a *Assignment) SetTitle(title string) error {
	t, err := NewAssignmentTitle(title)
	if err != nil {
		return err
	}
	a.Title = t
	return nil
}

func (a *Assignment) GetDescription() string {
	if a == nil || a.Description == nil {
		return ""
	}
	return a.Description.Value()
}

func (a *Assignment) SetDescription(description string) error {
	d, err := NewAssignmentDescription(description)
	if err != nil {
		return err
	}
	a.Description = d
	return nil
}

func (a *Assignment) GetFechaPublicacion() time.Time {
	if a == nil || a.FechaPublicacion == nil {
		return time.Time{}
	}
	return a.FechaPublicacion.Value()
}

func (a *Assignment) GetFechaEntrega() time.Time {
	if a == nil || a.FechaEntrega == nil {
		return time.Time{}
	}
	return a.FechaEntrega.Value()
}

func (a *Assignment) GetCourseId() uuid.UUID {
	if a == nil {
		return uuid.Nil
	}
	return a.CourseId
}
