package auth

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"

	appuser "github.com/AlfonsoDaniel-dev/EducationMaxxing/src/app/user"
)

type claims struct {
	UserId string `json:"sub"`
	jwt.RegisteredClaims
}

type JWTSessionStore struct {
	secret []byte
}

func NewJWTSessionStore(secret string) *JWTSessionStore {
	return &JWTSessionStore{secret: []byte(secret)}
}

func (s *JWTSessionStore) Create(userId uuid.UUID) (string, error) {
	c := claims{
		UserId: userId.String(),
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, c)
	return token.SignedString(s.secret)
}

func (s *JWTSessionStore) Get(tokenStr string) (uuid.UUID, bool) {
	token, err := jwt.ParseWithClaims(tokenStr, &claims{}, func(t *jwt.Token) (any, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, jwt.ErrSignatureInvalid
		}
		return s.secret, nil
	})
	if err != nil || !token.Valid {
		return uuid.Nil, false
	}

	c, ok := token.Claims.(*claims)
	if !ok {
		return uuid.Nil, false
	}

	userId, err := uuid.Parse(c.UserId)
	if err != nil {
		return uuid.Nil, false
	}

	return userId, true
}

// Delete is a no-op — JWTs are stateless. The client is responsible for
// discarding the token on logout.
func (s *JWTSessionStore) Delete(_ string) {}

var _ appuser.SessionStore = &JWTSessionStore{}
