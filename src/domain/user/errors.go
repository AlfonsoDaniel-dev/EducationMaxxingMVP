package user

import (
	"errors"
	"fmt"
)

var (
	ErrNameCannotBeEmpty     = errors.New("error cannot be empty")
	ErrEmailNotValid         = errors.New("email string not valid")
	ErrPasswordCannotBeEmpty = errors.New("password cannot be empty")
	ErrPasswordNotLongEnough = errors.New("password must be 8 char at least")
	ErrPasswordTooLong       = errors.New("password cannot be longer than 32 chars")
	ErrRolNotValid           = errors.New("Rol does not exist")
)

func ErrorOnCreatingUser(err error) error {
	errStr := fmt.Sprintf("Error on creating User: %v", err)

	return errors.New(errStr)
}
