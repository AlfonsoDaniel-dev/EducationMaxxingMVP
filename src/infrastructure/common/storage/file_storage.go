package storage

import (
	"crypto/sha256"
	"fmt"
	"os"
	"path/filepath"
)

type LocalFileStorage struct {
	baseDir string
}

func NewLocalFileStorage(baseDir string) *LocalFileStorage {
	return &LocalFileStorage{baseDir: baseDir}
}

func (s *LocalFileStorage) StoreFile(content []byte, filename, assignmentId, studentId string) (path, hash string, err error) {
	dir := filepath.Join(s.baseDir, assignmentId, studentId)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return "", "", fmt.Errorf("failed to create storage directory: %w", err)
	}

	fullPath := filepath.Join(dir, filename)
	if err := os.WriteFile(fullPath, content, 0644); err != nil {
		return "", "", fmt.Errorf("failed to write file: %w", err)
	}

	sum := sha256.Sum256(content)
	hash = fmt.Sprintf("%x", sum)

	return fullPath, hash, nil
}

func (s *LocalFileStorage) DeleteFile(path string) error {
	return os.Remove(path)
}

func (s *LocalFileStorage) ReadFile(path string) ([]byte, error) {
	return os.ReadFile(path)
}
