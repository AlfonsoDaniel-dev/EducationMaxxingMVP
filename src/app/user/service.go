package user

import (
	"github.com/google/uuid"

	domainuser "github.com/AlfonsoDaniel-dev/EducationMaxxing/src/domain/user"
)

type UserService struct {
	repo         UserRepository
	sessionStore SessionStore
}

func NewUserService(repo UserRepository, sessionStore SessionStore) *UserService {
	return &UserService{repo: repo, sessionStore: sessionStore}
}

func (s *UserService) Login(input LoginInputDTO) (*LoginOutputDTO, error) {
	record, err := s.repo.FindByEmail(input.Email)
	if err != nil {
		return nil, ErrInvalidCredentials
	}

	if record.Password != input.Password {
		return nil, ErrInvalidCredentials
	}

	token, err := s.sessionStore.Create(record.Id)
	if err != nil {
		return nil, err
	}

	return &LoginOutputDTO{
		SessionToken: token,
		UserId:       record.Id.String(),
		Rol:          record.Rol,
	}, nil
}

func (s *UserService) Logout(sessionToken string) error {
	s.sessionStore.Delete(sessionToken)
	return nil
}

func (s *UserService) GetCurrentUser(sessionToken string) (*UserOutputDTO, error) {
	userId, ok := s.sessionStore.Get(sessionToken)
	if !ok {
		return nil, ErrSessionNotFound
	}

	record, err := s.repo.FindById(userId)
	if err != nil {
		return nil, ErrUserNotFound
	}

	return recordToDTO(record), nil
}

func (s *UserService) GetUserById(id string) (*UserOutputDTO, error) {
	uid, err := uuid.Parse(id)
	if err != nil {
		return nil, ErrInvalidId
	}

	record, err := s.repo.FindById(uid)
	if err != nil {
		return nil, ErrUserNotFound
	}

	return recordToDTO(record), nil
}

func (s *UserService) CreateUser(input CreateUserInputDTO) (*UserOutputDTO, error) {
	var record *UserRecord

	switch input.Rol {
	case "student":
		student, err := domainuser.NewStudent(
			input.Name, input.Email, input.Password,
			input.EnrollmentId, input.AcademicProgram, input.Semester,
		)
		if err != nil {
			return nil, err
		}
		record = &UserRecord{
			Id:       student.Id,
			Name:     student.GetName(),
			Email:    student.GetEmail(),
			Password: student.GetPassword(),
			Rol:      student.GetRol(),
		}

	case "professor":
		professor, err := domainuser.NewProfessor(
			input.Name, input.Email, input.Password,
			input.Speciality, input.Department,
		)
		if err != nil {
			return nil, err
		}
		record = &UserRecord{
			Id:       professor.Id,
			Name:     professor.GetName(),
			Email:    professor.GetEmail(),
			Password: professor.GetPassword(),
			Rol:      professor.GetRol(),
		}

	case "admin":
		admin, err := domainuser.NewAdmin(
			input.Name, input.Email, input.Password, input.Area,
		)
		if err != nil {
			return nil, err
		}
		record = &UserRecord{
			Id:       admin.Id,
			Name:     admin.GetName(),
			Email:    admin.GetEmail(),
			Password: admin.GetPassword(),
			Rol:      admin.GetRol(),
		}

	default:
		return nil, domainuser.ErrRolNotValid
	}

	if err := s.repo.Save(record); err != nil {
		return nil, err
	}

	return recordToDTO(record), nil
}

func (s *UserService) ListUsers(role string) ([]*UserOutputDTO, error) {
	var records []*UserRecord
	var err error
	if role == "" {
		records, err = s.repo.FindAll()
	} else {
		records, err = s.repo.FindByRole(role)
	}
	if err != nil {
		return nil, err
	}

	dtos := make([]*UserOutputDTO, len(records))
	for i, r := range records {
		dtos[i] = recordToDTO(r)
	}
	return dtos, nil
}

func recordToDTO(r *UserRecord) *UserOutputDTO {
	return &UserOutputDTO{
		Id:    r.Id.String(),
		Name:  r.Name,
		Email: r.Email,
		Rol:   r.Rol,
	}
}
