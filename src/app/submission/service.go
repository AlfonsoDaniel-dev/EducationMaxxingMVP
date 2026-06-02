package submission

import (
	"crypto/sha256"
	"fmt"
	"strings"

	"github.com/google/uuid"

	appassignment "github.com/AlfonsoDaniel-dev/EducationMaxxing/src/app/assignment"
	domainsubmission "github.com/AlfonsoDaniel-dev/EducationMaxxing/src/domain/submission"
)

const maxFileSizeBytes = 10 * 1024 * 1024 // 10MB

var allowedMimeTypes = map[string]struct{}{
	"application/pdf":  {},
	"image/jpeg":       {},
	"image/png":        {},
	"text/plain":       {},
	"application/msword": {},
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document": {},
}

type SubmissionService struct {
	repo             SubmissionRepository
	fileStorage      FileStoragePort
	auditLogger      AuditLogger
	assignmentLookup AssignmentLookupPort
}

func NewSubmissionService(
	repo SubmissionRepository,
	fileStorage FileStoragePort,
	auditLogger AuditLogger,
	assignmentLookup AssignmentLookupPort,
) *SubmissionService {
	return &SubmissionService{
		repo:             repo,
		fileStorage:      fileStorage,
		auditLogger:      auditLogger,
		assignmentLookup: assignmentLookup,
	}
}

func (s *SubmissionService) SubmitFiles(input SubmitFilesInputDTO) (*SubmissionOutputDTO, error) {
	if len(input.Files) == 0 {
		return nil, ErrNoFilesProvided
	}

	studentId, err := uuid.Parse(input.StudentId)
	if err != nil {
		return nil, ErrInvalidId
	}

	assignmentId, err := uuid.Parse(input.AssignmentId)
	if err != nil {
		return nil, ErrInvalidId
	}

	// Step 1: validate each file locally
	for _, f := range input.Files {
		if f.FileName == "" {
			return nil, ErrNoFilesProvided
		}
		if int64(len(f.Content)) > maxFileSizeBytes {
			return nil, ErrFileTooLarge
		}
		if _, ok := allowedMimeTypes[f.MimeType]; !ok {
			return nil, ErrFileTypeNotAllowed
		}
	}

	// Step 2: log audit attempt
	_ = s.auditLogger.LogAttempt(input.StudentId, input.AssignmentId, len(input.Files))

	// Step 3: get courseId from assignment
	assignmentRecord, err := s.assignmentLookup.FindById(assignmentId)
	if err != nil {
		return nil, appassignment.ErrAssignmentNotFound
	}

	// Step 4: store each file and collect domain File objects
	var domainFiles []*domainsubmission.File
	var fileHashes []string
	var fileRecords []*FileRecord

	for _, f := range input.Files {
		path, hash, err := s.fileStorage.StoreFile(
			f.Content, f.FileName,
			assignmentRecord.Id.String(),
			studentId.String(),
		)
		if err != nil {
			return nil, err
		}

		domainFile, err := domainsubmission.NewFile(
			f.FileName, path, hash, f.MimeType, int64(len(f.Content)),
		)
		if err != nil {
			return nil, err
		}

		domainFiles = append(domainFiles, domainFile)
		fileHashes = append(fileHashes, hash)
		fileRecords = append(fileRecords, &FileRecord{
			Id:       domainFile.Id,
			Name:     domainFile.Name,
			Path:     domainFile.Path,
			Hash:     domainFile.Hash,
			Size:     domainFile.Size,
			MimeType: domainFile.MimeType,
		})
	}

	// Step 5: build submission aggregate
	submission, err := domainsubmission.NewSubmission(studentId, assignmentId, assignmentRecord.CourseId)
	if err != nil {
		return nil, err
	}

	for _, f := range domainFiles {
		if err := submission.AddFile(f); err != nil {
			return nil, err
		}
	}

	// Step 6: compute composite hash
	compositeHash := computeCompositeHash(fileHashes)
	submission.SetHash(compositeHash)

	// Step 7: persist with pending status
	record := domainToRecord(submission)
	if err := s.repo.Save(record); err != nil {
		return nil, err
	}

	for _, fr := range fileRecords {
		if err := s.repo.AddFile(submission.Id, fr); err != nil {
			return nil, err
		}
	}

	// Step 8: validate integrity
	if !submission.ValidateHashIntegrity(compositeHash) {
		_ = s.repo.UpdateStatus(submission.Id, domainsubmission.StatusFailed.Value())
		_ = s.auditLogger.LogFailure(submission.Id.String(), "hash mismatch")
		return nil, ErrIntegrityFailed
	}

	// Step 9: confirm — update status and generate token
	token, err := uuid.NewRandom()
	if err != nil {
		return nil, err
	}
	confirmationToken := token.String()

	if err := s.repo.UpdateStatus(submission.Id, domainsubmission.StatusConfirmed.Value()); err != nil {
		return nil, err
	}
	if err := s.repo.UpdateConfirmationToken(submission.Id, confirmationToken); err != nil {
		return nil, err
	}

	_ = s.auditLogger.LogSuccess(submission.Id.String(), confirmationToken)

	// Step 10: build output DTO
	fileOutputs := make([]FileOutputDTO, len(fileRecords))
	for i, fr := range fileRecords {
		fileOutputs[i] = FileOutputDTO{
			Id:       fr.Id.String(),
			Name:     fr.Name,
			Path:     fr.Path,
			Hash:     fr.Hash,
			Size:     fr.Size,
			MimeType: fr.MimeType,
		}
	}

	return &SubmissionOutputDTO{
		Id:                submission.Id.String(),
		StudentId:         studentId.String(),
		AssignmentId:      assignmentId.String(),
		CourseId:          assignmentRecord.CourseId.String(),
		SubmittedAt:       submission.SubmittedAt,
		Status:            domainsubmission.StatusConfirmed.Value(),
		ConfirmationToken: confirmationToken,
		Files:             fileOutputs,
	}, nil
}

func (s *SubmissionService) GetSubmission(id string) (*SubmissionOutputDTO, error) {
	uid, err := uuid.Parse(id)
	if err != nil {
		return nil, ErrInvalidId
	}

	record, err := s.repo.FindById(uid)
	if err != nil {
		return nil, ErrSubmissionNotFound
	}

	files, err := s.repo.FindFilesBySubmission(uid)
	if err != nil {
		return nil, err
	}

	return recordToDTO(record, files), nil
}

func (s *SubmissionService) GradeSubmission(input GradeSubmissionInputDTO) error {
	if input.Grade < 0 || input.Grade > 100 {
		return ErrGradeOutOfRange
	}

	uid, err := uuid.Parse(input.SubmissionId)
	if err != nil {
		return ErrInvalidId
	}

	if _, err := s.repo.FindById(uid); err != nil {
		return ErrSubmissionNotFound
	}

	return s.repo.UpdateGrade(uid, input.Grade)
}

func (s *SubmissionService) GetByStudentAndCourse(studentId, courseId string) ([]*SubmissionOutputDTO, error) {
	sid, err := uuid.Parse(studentId)
	if err != nil {
		return nil, ErrInvalidId
	}

	cid, err := uuid.Parse(courseId)
	if err != nil {
		return nil, ErrInvalidId
	}

	records, err := s.repo.FindByStudentAndCourse(sid, cid)
	if err != nil {
		return nil, err
	}

	dtos := make([]*SubmissionOutputDTO, len(records))
	for i, r := range records {
		files, _ := s.repo.FindFilesBySubmission(r.Id)
		dtos[i] = recordToDTO(r, files)
	}
	return dtos, nil
}

func domainToRecord(s *domainsubmission.Submission) *SubmissionRecord {
	return &SubmissionRecord{
		Id:                s.Id,
		StudentId:         s.StudentId,
		AssignmentId:      s.AssignmentId,
		CourseId:          s.CourseId,
		SubmittedAt:       s.SubmittedAt,
		Status:            s.Status.Value(),
		Grade:             s.Grade,
		Hash:              s.Hash,
		ConfirmationToken: s.ConfirmationToken,
	}
}

func recordToDTO(r *SubmissionRecord, files []*FileRecord) *SubmissionOutputDTO {
	fileOutputs := make([]FileOutputDTO, len(files))
	for i, f := range files {
		fileOutputs[i] = FileOutputDTO{
			Id:       f.Id.String(),
			Name:     f.Name,
			Path:     f.Path,
			Hash:     f.Hash,
			Size:     f.Size,
			MimeType: f.MimeType,
		}
	}

	return &SubmissionOutputDTO{
		Id:                r.Id.String(),
		StudentId:         r.StudentId.String(),
		AssignmentId:      r.AssignmentId.String(),
		CourseId:          r.CourseId.String(),
		SubmittedAt:       r.SubmittedAt,
		Status:            r.Status,
		Grade:             r.Grade,
		ConfirmationToken: r.ConfirmationToken,
		Files:             fileOutputs,
	}
}

func computeCompositeHash(fileHashes []string) string {
	combined := strings.Join(fileHashes, "")
	sum := sha256.Sum256([]byte(combined))
	return fmt.Sprintf("%x", sum)
}
