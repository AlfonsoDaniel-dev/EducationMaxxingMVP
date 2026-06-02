package course

import (
	"errors"
	"fmt"
)

var (
	ErrCourseNameEmpty        = errors.New("course name cannot be empty")
	ErrCourseDescriptionEmpty = errors.New("course description cannot be empty")
	ErrAcademicPeriodEmpty    = errors.New("academic period cannot be empty")
	ErrStudentAlreadyEnrolled = errors.New("student is already enrolled in this course")
	ErrStudentNotFound        = errors.New("student not found in course")
)

func ErrorOnCreatingCourse(err error) error {
	return fmt.Errorf("error on creating course: %w", err)
}
