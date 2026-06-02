package handlers

import (
	"io"
	"net/http"

	"github.com/labstack/echo/v4"

	appsubmission "github.com/AlfonsoDaniel-dev/EducationMaxxing/src/app/submission"
	"github.com/AlfonsoDaniel-dev/EducationMaxxing/src/infrastructure/web/middleware"
)

type SubmissionHandler struct {
	svc *appsubmission.SubmissionService
}

func NewSubmissionHandler(svc *appsubmission.SubmissionService) *SubmissionHandler {
	return &SubmissionHandler{svc: svc}
}

type gradeRequest struct {
	Grade float64 `json:"grade"`
}

// SubmitFiles godoc
// @Summary      Submit files for an assignment
// @Description  Upload one or more files as a submission. Uses multipart/form-data.
// @Tags         submissions
// @Security     BearerAuth
// @Accept       multipart/form-data
// @Produce      json
// @Param        assignmentId path  string true  "Assignment ID"
// @Param        files        formData file true "Files to submit"
// @Success      201 {object} appsubmission.SubmissionOutputDTO
// @Failure      400 {object} ErrorResponse
// @Failure      401 {object} ErrorResponse
// @Router       /assignments/{assignmentId}/submissions [post]
func (h *SubmissionHandler) SubmitFiles(c echo.Context) error {
	studentId := c.Get(middleware.UserIdKey).(string)
	assignmentId := c.Param("assignmentId")

	form, err := c.MultipartForm()
	if err != nil {
		return c.JSON(http.StatusBadRequest, ErrorResponse{"invalid multipart form"})
	}

	files := form.File["files"]
	if len(files) == 0 {
		return c.JSON(http.StatusBadRequest, ErrorResponse{"at least one file must be provided"})
	}

	var uploads []appsubmission.FileUploadDTO
	for _, fh := range files {
		f, err := fh.Open()
		if err != nil {
			return c.JSON(http.StatusBadRequest, ErrorResponse{"failed to read file: " + fh.Filename})
		}
		defer f.Close()

		content, err := io.ReadAll(f)
		if err != nil {
			return c.JSON(http.StatusBadRequest, ErrorResponse{"failed to read file content: " + fh.Filename})
		}

		mimeType := fh.Header.Get("Content-Type")
		if mimeType == "" {
			mimeType = "application/octet-stream"
		}

		uploads = append(uploads, appsubmission.FileUploadDTO{
			FileName: fh.Filename,
			Content:  content,
			MimeType: mimeType,
		})
	}

	output, err := h.svc.SubmitFiles(appsubmission.SubmitFilesInputDTO{
		StudentId:    studentId,
		AssignmentId: assignmentId,
		Files:        uploads,
	})
	if err != nil {
		return c.JSON(http.StatusBadRequest, ErrorResponse{err.Error()})
	}

	return c.JSON(http.StatusCreated, output)
}

// GetSubmission godoc
// @Summary      Get submission by ID
// @Tags         submissions
// @Security     BearerAuth
// @Produce      json
// @Param        id path string true "Submission ID"
// @Success      200 {object} appsubmission.SubmissionOutputDTO
// @Failure      401 {object} ErrorResponse
// @Failure      404 {object} ErrorResponse
// @Router       /submissions/{id} [get]
func (h *SubmissionHandler) GetSubmission(c echo.Context) error {
	output, err := h.svc.GetSubmission(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusNotFound, ErrorResponse{err.Error()})
	}

	return c.JSON(http.StatusOK, output)
}

// GradeSubmission godoc
// @Summary      Grade a submission
// @Description  Assign a grade (0-100) to a confirmed submission
// @Tags         submissions
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        id   path string       true "Submission ID"
// @Param        body body gradeRequest true "Grade"
// @Success      200 {object} map[string]string
// @Failure      400 {object} ErrorResponse
// @Failure      401 {object} ErrorResponse
// @Router       /submissions/{id}/grade [put]
func (h *SubmissionHandler) GradeSubmission(c echo.Context) error {
	var req gradeRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, ErrorResponse{"invalid request body"})
	}

	err := h.svc.GradeSubmission(appsubmission.GradeSubmissionInputDTO{
		SubmissionId: c.Param("id"),
		Grade:        req.Grade,
	})
	if err != nil {
		return c.JSON(http.StatusBadRequest, ErrorResponse{err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "submission graded"})
}

// GetMySubmissions godoc
// @Summary      Get my submissions for a course
// @Tags         submissions
// @Security     BearerAuth
// @Produce      json
// @Param        courseId path string true "Course ID"
// @Success      200 {array} appsubmission.SubmissionOutputDTO
// @Failure      401 {object} ErrorResponse
// @Router       /courses/{courseId}/submissions/me [get]
func (h *SubmissionHandler) GetMySubmissions(c echo.Context) error {
	studentId := c.Get(middleware.UserIdKey).(string)

	output, err := h.svc.GetByStudentAndCourse(studentId, c.Param("courseId"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, ErrorResponse{err.Error()})
	}

	return c.JSON(http.StatusOK, output)
}
