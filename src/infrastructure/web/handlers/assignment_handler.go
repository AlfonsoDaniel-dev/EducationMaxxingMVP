package handlers

import (
	"net/http"
	"time"

	"github.com/labstack/echo/v4"

	appassignment "github.com/AlfonsoDaniel-dev/EducationMaxxing/src/app/assignment"
)

type AssignmentHandler struct {
	svc *appassignment.AssignmentService
}

func NewAssignmentHandler(svc *appassignment.AssignmentService) *AssignmentHandler {
	return &AssignmentHandler{svc: svc}
}

type createAssignmentRequest struct {
	Title            string    `json:"title"`
	Description      string    `json:"description"`
	FechaPublicacion time.Time `json:"fechaPublicacion"`
	FechaEntrega     time.Time `json:"fechaEntrega"`
}

// CreateAssignment godoc
// @Summary      Create assignment
// @Description  Create a new assignment for a course
// @Tags         assignments
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        courseId path string               true "Course ID"
// @Param        body     body createAssignmentRequest true "Assignment data"
// @Success      201 {object} appassignment.AssignmentOutputDTO
// @Failure      400 {object} ErrorResponse
// @Failure      401 {object} ErrorResponse
// @Router       /courses/{courseId}/assignments [post]
func (h *AssignmentHandler) CreateAssignment(c echo.Context) error {
	var req createAssignmentRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, ErrorResponse{"invalid request body"})
	}

	output, err := h.svc.CreateAssignment(appassignment.CreateAssignmentInputDTO{
		Title:            req.Title,
		Description:      req.Description,
		FechaPublicacion: req.FechaPublicacion,
		FechaEntrega:     req.FechaEntrega,
		CourseId:         c.Param("courseId"),
	})
	if err != nil {
		return c.JSON(http.StatusBadRequest, ErrorResponse{err.Error()})
	}

	return c.JSON(http.StatusCreated, output)
}

// ListAssignments godoc
// @Summary      List assignments by course
// @Tags         assignments
// @Security     BearerAuth
// @Produce      json
// @Param        courseId path string true "Course ID"
// @Success      200 {array} appassignment.AssignmentOutputDTO
// @Failure      401 {object} ErrorResponse
// @Router       /courses/{courseId}/assignments [get]
func (h *AssignmentHandler) ListAssignments(c echo.Context) error {
	output, err := h.svc.ListByCourse(c.Param("courseId"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, ErrorResponse{err.Error()})
	}

	return c.JSON(http.StatusOK, output)
}

// GetAssignment godoc
// @Summary      Get assignment by ID
// @Tags         assignments
// @Security     BearerAuth
// @Produce      json
// @Param        id path string true "Assignment ID"
// @Success      200 {object} appassignment.AssignmentOutputDTO
// @Failure      401 {object} ErrorResponse
// @Failure      404 {object} ErrorResponse
// @Router       /assignments/{id} [get]
func (h *AssignmentHandler) GetAssignment(c echo.Context) error {
	output, err := h.svc.GetAssignment(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusNotFound, ErrorResponse{err.Error()})
	}

	return c.JSON(http.StatusOK, output)
}
