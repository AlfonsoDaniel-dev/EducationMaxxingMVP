package submission

import "time"

type FileUploadDTO struct {
	FileName string
	Content  []byte
	MimeType string
}

type SubmitFilesInputDTO struct {
	StudentId    string
	AssignmentId string
	Files        []FileUploadDTO
}

type FileOutputDTO struct {
	Id       string
	Name     string
	Path     string
	Hash     string
	Size     int64
	MimeType string
}

type SubmissionOutputDTO struct {
	Id                string
	StudentId         string
	AssignmentId      string
	CourseId          string
	SubmittedAt       time.Time
	Status            string
	Grade             *float64
	ConfirmationToken string
	Files             []FileOutputDTO
}

type GradeSubmissionInputDTO struct {
	SubmissionId string
	Grade        float64
}
