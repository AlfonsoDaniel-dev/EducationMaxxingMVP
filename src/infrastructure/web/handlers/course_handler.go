package handlers

import (
	"net/http"

	"github.com/labstack/echo/v4"

	appcourse "github.com/AlfonsoDaniel-dev/EducationMaxxing/src/app/course"
	"github.com/AlfonsoDaniel-dev/EducationMaxxing/src/infrastructure/web/middleware"
)

type CourseHandler struct {
	svc *appcourse.CourseService
}

func NewCourseHandler(svc *appcourse.CourseService) *CourseHandler {
	return &CourseHandler{svc: svc}
}

type enrollRequest struct {
	StudentId string `json:"studentId"`
}

type assignProfessorRequest struct {
	ProfessorId string `json:"professorId"`
}

// ListAllCourses godoc
// @Summary      List all courses (admin)
// @Tags         admin
// @Security     BearerAuth
// @Produce      json
// @Success      200 {array} appcourse.CourseOutputDTO
// @Failure      401 {object} ErrorResponse
// @Router       /admin/courses [get]
func (h *CourseHandler) ListAllCourses(c echo.Context) error {
	courses, err := h.svc.ListAllCourses()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, ErrorResponse{err.Error()})
	}
	if courses == nil {
		courses = []*appcourse.CourseOutputDTO{}
	}
	return c.JSON(http.StatusOK, courses)
}

// AdminCreateCourse godoc
// @Summary      Create course (admin)
// @Description  Admin creates a course and assigns it to a professor
// @Tags         admin
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        body body appcourse.CreateCourseInputDTO true "Course data (professorId required)"
// @Success      201 {object} appcourse.CourseOutputDTO
// @Failure      400 {object} ErrorResponse
// @Failure      401 {object} ErrorResponse
// @Router       /admin/courses [post]
func (h *CourseHandler) AdminCreateCourse(c echo.Context) error {
	var input appcourse.CreateCourseInputDTO
	if err := c.Bind(&input); err != nil {
		return c.JSON(http.StatusBadRequest, ErrorResponse{"invalid request body"})
	}
	if input.ProfessorId == "" {
		return c.JSON(http.StatusBadRequest, ErrorResponse{"professorId is required"})
	}

	output, err := h.svc.CreateCourse(input)
	if err != nil {
		return c.JSON(http.StatusBadRequest, ErrorResponse{err.Error()})
	}

	return c.JSON(http.StatusCreated, output)
}

// AdminAssignProfessor godoc
// @Summary      Assign professor to course (admin)
// @Tags         admin
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        id   path string                 true "Course ID"
// @Param        body body assignProfessorRequest true "Professor ID"
// @Success      200 {object} map[string]string
// @Failure      400 {object} ErrorResponse
// @Failure      401 {object} ErrorResponse
// @Router       /admin/courses/{id}/professor [put]
func (h *CourseHandler) AdminAssignProfessor(c echo.Context) error {
	var req assignProfessorRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, ErrorResponse{"invalid request body"})
	}

	if err := h.svc.AssignProfessor(c.Param("id"), req.ProfessorId); err != nil {
		return c.JSON(http.StatusBadRequest, ErrorResponse{err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "professor assigned"})
}

// CreateCourse godoc
// @Summary      Create course
// @Description  Create a new course (professorId taken from JWT)
// @Tags         courses
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        body body appcourse.CreateCourseInputDTO true "Course data"
// @Success      201 {object} appcourse.CourseOutputDTO
// @Failure      400 {object} ErrorResponse
// @Failure      401 {object} ErrorResponse
// @Router       /courses [post]
func (h *CourseHandler) CreateCourse(c echo.Context) error {
	var input appcourse.CreateCourseInputDTO
	if err := c.Bind(&input); err != nil {
		return c.JSON(http.StatusBadRequest, ErrorResponse{"invalid request body"})
	}

	input.ProfessorId = c.Get(middleware.UserIdKey).(string)

	output, err := h.svc.CreateCourse(input)
	if err != nil {
		return c.JSON(http.StatusBadRequest, ErrorResponse{err.Error()})
	}

	return c.JSON(http.StatusCreated, output)
}

// GetCourse godoc
// @Summary      Get course by ID
// @Tags         courses
// @Security     BearerAuth
// @Produce      json
// @Param        id path string true "Course ID"
// @Success      200 {object} appcourse.CourseOutputDTO
// @Failure      401 {object} ErrorResponse
// @Failure      404 {object} ErrorResponse
// @Router       /courses/{id} [get]
func (h *CourseHandler) GetCourse(c echo.Context) error {
	output, err := h.svc.GetCourse(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusNotFound, ErrorResponse{err.Error()})
	}

	return c.JSON(http.StatusOK, output)
}

// ListCourses godoc
// @Summary      List my courses
// @Description  Returns courses for the authenticated user (by professor or student role)
// @Tags         courses
// @Security     BearerAuth
// @Produce      json
// @Success      200 {array} appcourse.CourseOutputDTO
// @Failure      401 {object} ErrorResponse
// @Router       /courses [get]
func (h *CourseHandler) ListCourses(c echo.Context) error {
	userId := c.Get(middleware.UserIdKey).(string)

	// Try professor first, fall back to student
	courses, err := h.svc.ListCoursesByProfessor(userId)
	if err != nil || len(courses) == 0 {
		courses, err = h.svc.ListCoursesByStudent(userId)
		if err != nil {
			return c.JSON(http.StatusOK, []*appcourse.CourseOutputDTO{})
		}
	}

	return c.JSON(http.StatusOK, courses)
}

// EnrollStudent godoc
// @Summary      Enroll student in course
// @Tags         courses
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        id   path string        true "Course ID"
// @Param        body body enrollRequest true "Student ID"
// @Success      200 {object} map[string]string
// @Failure      400 {object} ErrorResponse
// @Failure      401 {object} ErrorResponse
// @Router       /courses/{id}/enroll [post]
func (h *CourseHandler) EnrollStudent(c echo.Context) error {
	var req enrollRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, ErrorResponse{"invalid request body"})
	}

	err := h.svc.EnrollStudent(appcourse.EnrollStudentInputDTO{
		CourseId:  c.Param("id"),
		StudentId: req.StudentId,
	})
	if err != nil {
		return c.JSON(http.StatusBadRequest, ErrorResponse{err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "student enrolled"})
}
