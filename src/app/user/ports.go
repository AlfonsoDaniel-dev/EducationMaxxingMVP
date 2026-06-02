package user

import (
	"errors"

	"github.com/google/uuid"
)

var (
	ErrInvalidId         = errors.New("invalid id format")
	ErrUserNotFound      = errors.New("user not found")
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrSessionNotFound   = errors.New("session not found")
)

type UserRepository interface {
	FindById(id uuid.UUID) (*UserRecord, error)
	FindByEmail(email string) (*UserRecord, error)
	Save(user *UserRecord) error
}

type SessionStore interface {
	Create(userId uuid.UUID) (string, error)
	Get(token string) (uuid.UUID, bool)
	Delete(token string)
}

type UserRecord struct {
	Id       uuid.UUID
	Name     string
	Email    string
	Password string
	Rol      string
}
