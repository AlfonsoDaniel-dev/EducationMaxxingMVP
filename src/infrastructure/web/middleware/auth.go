package middleware

import (
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"

	appuser "github.com/AlfonsoDaniel-dev/EducationMaxxing/src/app/user"
)

const UserIdKey = "userId"

func JWTAuth(sessionStore appuser.SessionStore) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			header := c.Request().Header.Get("Authorization")
			if header == "" || !strings.HasPrefix(header, "Bearer ") {
				return c.JSON(http.StatusUnauthorized, map[string]string{
					"message": "missing or invalid authorization header",
				})
			}

			token := strings.TrimPrefix(header, "Bearer ")
			userId, ok := sessionStore.Get(token)
			if !ok {
				return c.JSON(http.StatusUnauthorized, map[string]string{
					"message": "invalid or expired token",
				})
			}

			c.Set(UserIdKey, userId.String())
			return next(c)
		}
	}
}
