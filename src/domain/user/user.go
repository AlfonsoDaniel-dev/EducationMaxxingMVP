package user

import (
	"github.com/google/uuid"
	"strings"
)

type User struct {
	Id       uuid.UUID
	Name     *Name
	Email    *Email
	Password *Password
	Rol      *Rol
}

func NewUser(name string, email string, password string, rol string) (*User, error) {
	
	usrId, err := uuid.NewRandom()
	if err != nil {
		return nil, err
	}
	
	UsrName, err := NewName(name)
	if err != nil {
		return nil, err
	}
	
	UsrEmail, err := NewEmail(email)
	if err != nil {
		return nil, ErrorOnCreatingUser(err)
	}
	
	UsrPassword, err := NewPassword(password)
	if err != nil {
		return nil, ErrorOnCreatingUser(err)
	}
	
	UsrRol, err := NewRol(strings.ToLower(rol))
	if err != nil {
		return nil, ErrorOnCreatingUser(err)
	}
	
	return &User{
		Id:      usrId,
		Name:    UsrName,
		Email:   UsrEmail,
		Password: UsrPassword,
		Rol:     UsrRol,
	}, nil
}

func (u *User) GetId() uuid.UUID {
	if u == nil {
		return uuid.Nil
	}

	return u.Id
}

func (u *User) GetName() string {
	if u == nil || u.Name == nil {
		return ""
	}

	return u.Name.name
}

func (u *User) SetName(name string) error {
	usrName, err := NewName(name)
	if err != nil {
		return err
	}

	u.Name = usrName
	return nil
}

func (u *User) GetEmail() string {
	if u == nil || u.Email == nil {
		return ""
	}

	return u.Email.Email
}

func (u *User) SetEmail(email string) error {
	usrEmail, err := NewEmail(email)
	if err != nil {
		return err
	}

	u.Email = usrEmail
	return nil
}

func (u *User) GetPassword() string {
	if u == nil || u.Password == nil {
		return ""
	}

	return u.Password.password
}

func (u *User) SetPassword(password string) error {
	usrPassword, err := NewPassword(password)
	if err != nil {
		return err
	}

	u.Password = usrPassword
	return nil
}

func (u *User) GetRol() string {
	if u == nil || u.Rol == nil {
		return ""
	}

	return u.Rol.rol
}

func (u *User) SetRol(rol string) error {
	usrRol, err := NewRol(strings.ToLower(rol))
	if err != nil {
		return err
	}

	u.Rol = usrRol
	return nil
}

