package handlers

import (
	"net/http"

	"github.com/labstack/echo/v4"

	appuser "github.com/AlfonsoDaniel-dev/EducationMaxxing/src/app/user"
	"github.com/AlfonsoDaniel-dev/EducationMaxxing/src/infrastructure/web/middleware"
)

type UserHandler struct {
	svc *appuser.UserService
}

func NewUserHandler(svc *appuser.UserService) *UserHandler {
	return &UserHandler{svc: svc}
}

type loginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// Login godoc
// @Summary      Login
// @Description  Authenticate a user and return a JWT token
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        body body loginRequest true "Credentials"
// @Success      200 {object} appuser.LoginOutputDTO
// @Failure      400 {object} ErrorResponse
// @Failure      401 {object} ErrorResponse
// @Router       /auth/login [post]
func (h *UserHandler) Login(c echo.Context) error {
	var req loginRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, ErrorResponse{"invalid request body"})
	}

	output, err := h.svc.Login(appuser.LoginInputDTO{
		Email:    req.Email,
		Password: req.Password,
	})
	if err != nil {
		return c.JSON(http.StatusUnauthorized, ErrorResponse{err.Error()})
	}

	return c.JSON(http.StatusOK, output)
}

// Logout godoc
// @Summary      Logout
// @Description  Invalidate the current session (client must discard the token)
// @Tags         auth
// @Security     BearerAuth
// @Produce      json
// @Success      200 {object} map[string]string
// @Failure      401 {object} ErrorResponse
// @Router       /auth/logout [post]
func (h *UserHandler) Logout(c echo.Context) error {
	// JWT is stateless — the session store Delete is a no-op.
	// The client is responsible for discarding the token.
	return c.JSON(http.StatusOK, map[string]string{"message": "logged out"})
}

// Me godoc
// @Summary      Get current user
// @Description  Returns the authenticated user's profile
// @Tags         auth
// @Security     BearerAuth
// @Produce      json
// @Success      200 {object} appuser.UserOutputDTO
// @Failure      401 {object} ErrorResponse
// @Failure      404 {object} ErrorResponse
// @Router       /auth/me [get]
func (h *UserHandler) Me(c echo.Context) error {
	userId := c.Get(middleware.UserIdKey).(string)

	output, err := h.svc.GetUserById(userId)
	if err != nil {
		return c.JSON(http.StatusNotFound, ErrorResponse{err.Error()})
	}

	return c.JSON(http.StatusOK, output)
}

// ListUsers godoc
// @Summary      List users
// @Description  List all users, optionally filtered by role (admin only)
// @Tags         admin
// @Security     BearerAuth
// @Produce      json
// @Param        role query string false "Filter by role (student|professor)"
// @Success      200 {array} appuser.UserOutputDTO
// @Failure      401 {object} ErrorResponse
// @Router       /admin/users [get]
func (h *UserHandler) ListUsers(c echo.Context) error {
	role := c.QueryParam("role")
	users, err := h.svc.ListUsers(role)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, ErrorResponse{err.Error()})
	}
	if users == nil {
		users = []*appuser.UserOutputDTO{}
	}
	return c.JSON(http.StatusOK, users)
}

// CreateUser godoc
// @Summary      Create user
// @Description  Create a new user (admin, student, or professor)
// @Tags         users
// @Security     BearerAuth
// @Accept       json
// @Produce      json
// @Param        body body appuser.CreateUserInputDTO true "User data"
// @Success      201 {object} appuser.UserOutputDTO
// @Failure      400 {object} ErrorResponse
// @Failure      401 {object} ErrorResponse
// @Router       /users [post]
func (h *UserHandler) CreateUser(c echo.Context) error {
	var input appuser.CreateUserInputDTO
	if err := c.Bind(&input); err != nil {
		return c.JSON(http.StatusBadRequest, ErrorResponse{"invalid request body"})
	}

	output, err := h.svc.CreateUser(input)
	if err != nil {
		return c.JSON(http.StatusBadRequest, ErrorResponse{err.Error()})
	}

	return c.JSON(http.StatusCreated, output)
}
