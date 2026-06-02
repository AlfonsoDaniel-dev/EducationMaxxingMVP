// @title           EducationMaxxing API
// @version         1.0
// @description     REST API for the EducationMaxxing educational platform MVP
// @host            localhost:8080
// @BasePath        /api
// @securityDefinitions.apikey BearerAuth
// @in              header
// @name            Authorization
package main

import (
	"fmt"
	"os"

	appassignment "github.com/AlfonsoDaniel-dev/EducationMaxxing/src/app/assignment"
	appcourse "github.com/AlfonsoDaniel-dev/EducationMaxxing/src/app/course"
	appreport "github.com/AlfonsoDaniel-dev/EducationMaxxing/src/app/report"
	appsubmission "github.com/AlfonsoDaniel-dev/EducationMaxxing/src/app/submission"
	appuser "github.com/AlfonsoDaniel-dev/EducationMaxxing/src/app/user"
	"github.com/AlfonsoDaniel-dev/EducationMaxxing/src/infrastructure/common/auth"
	"github.com/AlfonsoDaniel-dev/EducationMaxxing/src/infrastructure/common/storage"
	infraassignment "github.com/AlfonsoDaniel-dev/EducationMaxxing/src/infrastructure/assignment"
	infracourse "github.com/AlfonsoDaniel-dev/EducationMaxxing/src/infrastructure/course"
	infrareport "github.com/AlfonsoDaniel-dev/EducationMaxxing/src/infrastructure/report"
	infrasubmission "github.com/AlfonsoDaniel-dev/EducationMaxxing/src/infrastructure/submission"
	infrauser "github.com/AlfonsoDaniel-dev/EducationMaxxing/src/infrastructure/user"
	"github.com/AlfonsoDaniel-dev/EducationMaxxing/src/infrastructure/web"
)

func main() {
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "dev-secret-change-in-prod"
	}

	// Infrastructure
	sessionStore   := auth.NewJWTSessionStore(jwtSecret)
	fileStorage    := storage.NewLocalFileStorage("./uploads")
	userRepo       := infrauser.NewInMemoryUserRepository()
	courseRepo     := infracourse.NewInMemoryCourseRepository()
	assignmentRepo := infraassignment.NewInMemoryAssignmentRepository()
	submissionRepo := infrasubmission.NewInMemorySubmissionRepository()
	reportRepo     := infrareport.NewInMemoryReportRepository()
	auditLogger    := &appsubmission.NoOpAuditLogger{}

	// App services
	userSvc       := appuser.NewUserService(userRepo, sessionStore)
	courseSvc     := appcourse.NewCourseService(courseRepo)
	assignmentSvc := appassignment.NewAssignmentService(assignmentRepo)
	submissionSvc := appsubmission.NewSubmissionService(submissionRepo, fileStorage, auditLogger, assignmentRepo)
	reportSvc     := appreport.NewReportService(reportRepo, assignmentRepo, submissionRepo)

	// HTTP server
	router := web.NewRouter(userSvc, courseSvc, assignmentSvc, submissionSvc, reportSvc, sessionStore)

	fmt.Println("EducationMaxxing API running on :8080")
	fmt.Println("Swagger UI: http://localhost:8080/swagger/index.html")

	if err := router.Start(":8080"); err != nil {
		panic(err)
	}
}
