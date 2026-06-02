package handlers

import (
	"net/http"

	"github.com/labstack/echo/v4"

	appreport "github.com/AlfonsoDaniel-dev/EducationMaxxing/src/app/report"
	"github.com/AlfonsoDaniel-dev/EducationMaxxing/src/infrastructure/web/middleware"
)

type ReportHandler struct {
	svc *appreport.ReportService
}

func NewReportHandler(svc *appreport.ReportService) *ReportHandler {
	return &ReportHandler{svc: svc}
}

// ListAllReports godoc
// @Summary      List all reports (admin)
// @Tags         admin
// @Security     BearerAuth
// @Produce      json
// @Success      200 {array} appreport.ReportOutputDTO
// @Failure      401 {object} ErrorResponse
// @Router       /admin/reports [get]
func (h *ReportHandler) ListAllReports(c echo.Context) error {
	reports, err := h.svc.ListAllReports()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, ErrorResponse{err.Error()})
	}
	if reports == nil {
		reports = []*appreport.ReportOutputDTO{}
	}
	return c.JSON(http.StatusOK, reports)
}

// GenerateReport godoc
// @Summary      Generate academic progress report
// @Description  Generates a new report for the authenticated student in a given course
// @Tags         reports
// @Security     BearerAuth
// @Produce      json
// @Param        courseId path string true "Course ID"
// @Success      201 {object} appreport.ReportOutputDTO
// @Failure      400 {object} ErrorResponse
// @Failure      401 {object} ErrorResponse
// @Router       /courses/{courseId}/reports [post]
func (h *ReportHandler) GenerateReport(c echo.Context) error {
	studentId := c.Get(middleware.UserIdKey).(string)

	output, err := h.svc.GenerateReport(appreport.GenerateReportInputDTO{
		StudentId: studentId,
		CourseId:  c.Param("courseId"),
	})
	if err != nil {
		return c.JSON(http.StatusBadRequest, ErrorResponse{err.Error()})
	}

	return c.JSON(http.StatusCreated, output)
}

// GetReport godoc
// @Summary      Get report by ID
// @Tags         reports
// @Security     BearerAuth
// @Produce      json
// @Param        id path string true "Report ID"
// @Success      200 {object} appreport.ReportOutputDTO
// @Failure      401 {object} ErrorResponse
// @Failure      404 {object} ErrorResponse
// @Router       /reports/{id} [get]
func (h *ReportHandler) GetReport(c echo.Context) error {
	output, err := h.svc.GetReport(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusNotFound, ErrorResponse{err.Error()})
	}

	return c.JSON(http.StatusOK, output)
}

// GetMyCourseReports godoc
// @Summary      Get my reports for a course
// @Tags         reports
// @Security     BearerAuth
// @Produce      json
// @Param        courseId path string true "Course ID"
// @Success      200 {array} appreport.ReportOutputDTO
// @Failure      401 {object} ErrorResponse
// @Router       /courses/{courseId}/reports/me [get]
func (h *ReportHandler) GetMyCourseReports(c echo.Context) error {
	studentId := c.Get(middleware.UserIdKey).(string)

	output, err := h.svc.GetReportsByStudentAndCourse(studentId, c.Param("courseId"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, ErrorResponse{err.Error()})
	}

	return c.JSON(http.StatusOK, output)
}

// GetMyLatestReport godoc
// @Summary      Get my latest report
// @Tags         reports
// @Security     BearerAuth
// @Produce      json
// @Success      200 {object} appreport.ReportOutputDTO
// @Failure      401 {object} ErrorResponse
// @Failure      404 {object} ErrorResponse
// @Router       /reports/me/latest [get]
func (h *ReportHandler) GetMyLatestReport(c echo.Context) error {
	studentId := c.Get(middleware.UserIdKey).(string)

	output, err := h.svc.GetLatestReport(studentId)
	if err != nil {
		return c.JSON(http.StatusNotFound, ErrorResponse{err.Error()})
	}

	return c.JSON(http.StatusOK, output)
}
