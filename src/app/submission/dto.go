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
	Id       string `json:"id"`
	Name     string `json:"name"`
	Path     string `json:"path"`
	Hash     string `json:"hash"`
	Size     int64  `json:"size"`
	MimeType string `json:"mimeType"`
}

type SubmissionOutputDTO struct {
	Id                string          `json:"id"`
	StudentId         string          `json:"studentId"`
	AssignmentId      string          `json:"assignmentId"`
	CourseId          string          `json:"courseId"`
	SubmittedAt       time.Time       `json:"submittedAt"`
	Status            string          `json:"status"`
	Grade             *float64        `json:"grade"`
	ConfirmationToken string          `json:"confirmationToken"`
	Files             []FileOutputDTO `json:"files"`
}

type GradeSubmissionInputDTO struct {
	SubmissionId string  `json:"submissionId"`
	Grade        float64 `json:"grade"`
}
