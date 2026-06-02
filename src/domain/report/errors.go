package report

import (
	"errors"
	"fmt"
)

var (
	ErrInvalidRiskLevel          = errors.New("invalid risk level")
	ErrInvalidProgressPercentage = errors.New("progress percentage must be between 0 and 100")
	ErrNegativeAverage           = errors.New("average grade cannot be negative")
)

func ErrorOnCreatingReport(err error) error {
	return fmt.Errorf("error on creating report: %w", err)
}
