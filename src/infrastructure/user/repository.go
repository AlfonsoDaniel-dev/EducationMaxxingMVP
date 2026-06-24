package user

import (
	"errors"
	"sync"

	"github.com/google/uuid"

	appuser "github.com/AlfonsoDaniel-dev/EducationMaxxing/src/app/user"
)

var ErrUserNotFound = errors.New("user not found")

type InMemoryUserRepository struct {
	mu      sync.RWMutex
	data    map[uuid.UUID]*appuser.UserRecord
	byEmail map[string]uuid.UUID
}

func NewInMemoryUserRepository() *InMemoryUserRepository {
	return &InMemoryUserRepository{
		data:    make(map[uuid.UUID]*appuser.UserRecord),
		byEmail: make(map[string]uuid.UUID),
	}
}

func (r *InMemoryUserRepository) Save(user *appuser.UserRecord) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	copy := *user
	r.data[user.Id] = &copy
	r.byEmail[user.Email] = user.Id
	return nil
}

func (r *InMemoryUserRepository) FindById(id uuid.UUID) (*appuser.UserRecord, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	record, ok := r.data[id]
	if !ok {
		return nil, ErrUserNotFound
	}

	copy := *record
	return &copy, nil
}

func (r *InMemoryUserRepository) FindByEmail(email string) (*appuser.UserRecord, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	id, ok := r.byEmail[email]
	if !ok {
		return nil, ErrUserNotFound
	}

	record, ok := r.data[id]
	if !ok {
		return nil, ErrUserNotFound
	}

	copy := *record
	return &copy, nil
}

func (r *InMemoryUserRepository) FindAll() ([]*appuser.UserRecord, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	results := make([]*appuser.UserRecord, 0, len(r.data))
	for _, record := range r.data {
		c := *record
		results = append(results, &c)
	}
	return results, nil
}

func (r *InMemoryUserRepository) FindByRole(role string) ([]*appuser.UserRecord, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	var results []*appuser.UserRecord
	for _, record := range r.data {
		if record.Rol == role {
			c := *record
			results = append(results, &c)
		}
	}
	return results, nil
}

var _ appuser.UserRepository = &InMemoryUserRepository{}
