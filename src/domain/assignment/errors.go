package assignment

import (
	"errors"
	"fmt"
)

var (
	ErrAssignmentTitleEmpty       = errors.New("assignment title cannot be empty")
	ErrAssignmentDescriptionEmpty = errors.New("assignment description cannot be empty")
	ErrPublicationDateZero        = errors.New("publication date cannot be zero")
	ErrDeliveryDateZero           = errors.New("delivery date cannot be zero")
	ErrDeliveryDateBeforePublish  = errors.New("delivery date must be after publication date")
)

func ErrorOnCreatingAssignment(err error) error {
	return fmt.Errorf("error on creating assignment: %w", err)
}
