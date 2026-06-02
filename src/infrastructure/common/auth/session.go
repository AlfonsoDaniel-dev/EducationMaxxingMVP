package auth

import (
	"sync"

	"github.com/google/uuid"
)

type SessionStore struct {
	mu       sync.RWMutex
	sessions map[string]uuid.UUID
}

func NewSessionStore() *SessionStore {
	return &SessionStore{
		sessions: make(map[string]uuid.UUID),
	}
}

func (s *SessionStore) Create(userId uuid.UUID) (string, error) {
	token, err := uuid.NewRandom()
	if err != nil {
		return "", err
	}

	s.mu.Lock()
	defer s.mu.Unlock()
	s.sessions[token.String()] = userId

	return token.String(), nil
}

func (s *SessionStore) Get(token string) (uuid.UUID, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	userId, ok := s.sessions[token]
	return userId, ok
}

func (s *SessionStore) Delete(token string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	delete(s.sessions, token)
}
