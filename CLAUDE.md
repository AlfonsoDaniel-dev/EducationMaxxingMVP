# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**EducationMaxxingMVP** is a backend service for an educational platform written in Go. It implements a domain-driven design (DDD) architecture with value objects for data validation and business logic encapsulation.

## Common Commands

```bash
# Build the project
go build ./...

# Run tests
go test ./...

# Run tests with verbose output
go test -v ./...

# Run a specific test
go test -v ./src/domain/user -run TestNamePattern

# Format code
go fmt ./...

# Lint code (requires golangci-lint)
golangci-lint run ./...

# Get dependencies
go mod download
go mod tidy
```

## Architecture

The codebase follows **Domain-Driven Design** with a clear separation of concerns:

### Directory Structure

```
src/domain/
├── user/           # User domain with value objects and user types
│   ├── types.go    # Value objects: Name, Email, Password, Rol
│   ├── user.go     # Base User aggregate
│   ├── student.go  # Student specialization (extends User)
│   ├── professor.go # Professor specialization (extends User)
│   ├── admin.go    # Admin specialization (extends User)
│   └── errors.go   # User domain errors
└── AcademicProgram/ # Academic structures domain
    └── types.go     # Value objects: AcademicProgram, Semester, Area, Speciality
```

### Key Patterns

**Value Objects**: Encapsulate validation and provide type safety
- Always validated at construction via `New*` functions
- Validation includes normalization (whitelist checking, trimming)
- All value objects provide getter methods with nil safety
- Examples: `NewName()`, `NewEmail()`, `NewPassword()`, `NewRol()`

**User Specialization**: Uses composition/embedding to extend base User
- `Student`: Has EnrollmentId, AcademicProgram, Semester
- `Professor`: Has Speciality, Department (Area)
- `Admin`: Has Area
- All inherit User fields (Id, Name, Email, Password, Rol)

**Validation Rules**:
- Name: Cannot be empty
- Email: Must contain "@"
- Password: 8-32 characters
- Rol: Must be "admin", "student", or "professor"
- Semester: 1-8 range
- AcademicProgram: Validated against predefined list (computer science, software engineering, etc.)
- Area: Validated against predefined list (technology, health sciences, etc.)
- Speciality: Validated against predefined list (software engineering, data science, cybersecurity, etc.)

**Error Handling**: Each domain has its own error set defined in `errors.go`. Use specific error types for validation failures.

## Development Notes

- UUID generation is used for user IDs via `github.com/google/uuid`
- Value objects are normalized (lowercase, trimmed) before validation
- Nil-safe getters are implemented for all user properties
- Setter methods exist for mutable properties and return errors for invalid values
- The project is in early stages with no main entry point yet (cmd/ is empty)