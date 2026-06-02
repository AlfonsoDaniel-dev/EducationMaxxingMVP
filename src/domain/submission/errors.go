package submission

import (
	"errors"
	"fmt"
)

var (
	ErrInvalidSubmissionStatus = errors.New("invalid submission status")
	ErrFileNameEmpty           = errors.New("file name cannot be empty")
	ErrFilePathEmpty           = errors.New("file path cannot be empty")
	ErrFileSizeZero            = errors.New("file size must be greater than zero")
	ErrHashMismatch            = errors.New("file hash does not match expected value")
	ErrGradeOutOfRange         = errors.New("grade must be between 0 and 100")
)

func ErrorOnCreatingSubmission(err error) error {
	return fmt.Errorf("error on creating submission: %w", err)
}

func ErrorOnCreatingFile(err error) error {
	return fmt.Errorf("error on creating file: %w", err)
}
