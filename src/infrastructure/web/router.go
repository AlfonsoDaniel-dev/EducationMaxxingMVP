package web

import (
	"github.com/labstack/echo/v4"
	echomiddleware "github.com/labstack/echo/v4/middleware"
	echoswagger "github.com/swaggo/echo-swagger"

	appassignment "github.com/AlfonsoDaniel-dev/EducationMaxxing/src/app/assignment"
	appcourse "github.com/AlfonsoDaniel-dev/EducationMaxxing/src/app/course"
	appreport "github.com/AlfonsoDaniel-dev/EducationMaxxing/src/app/report"
	appsubmission "github.com/AlfonsoDaniel-dev/EducationMaxxing/src/app/submission"
	appuser "github.com/AlfonsoDaniel-dev/EducationMaxxing/src/app/user"
	_ "github.com/AlfonsoDaniel-dev/EducationMaxxing/docs"
	"github.com/AlfonsoDaniel-dev/EducationMaxxing/src/infrastructure/web/handlers"
	webmiddleware "github.com/AlfonsoDaniel-dev/EducationMaxxing/src/infrastructure/web/middleware"
)

type Router struct {
	echo *echo.Echo
}

func NewRouter(
	userSvc *appuser.UserService,
	courseSvc *appcourse.CourseService,
	assignmentSvc *appassignment.AssignmentService,
	submissionSvc *appsubmission.SubmissionService,
	reportSvc *appreport.ReportService,
	sessionStore appuser.SessionStore,
) *Router {
	e := echo.New()
	e.HideBanner = true

	e.Use(echomiddleware.Logger())
	e.Use(echomiddleware.Recover())
	e.Use(echomiddleware.CORSWithConfig(echomiddleware.CORSConfig{
		AllowOrigins: []string{"http://localhost:3000"},
		AllowMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders: []string{"Authorization", "Content-Type", "Accept"},
	}))

	// Swagger UI — public
	e.GET("/swagger/*", echoswagger.WrapHandler)

	// Handlers
	userH       := handlers.NewUserHandler(userSvc)
	courseH     := handlers.NewCourseHandler(courseSvc)
	assignmentH := handlers.NewAssignmentHandler(assignmentSvc)
	submissionH := handlers.NewSubmissionHandler(submissionSvc)
	reportH     := handlers.NewReportHandler(reportSvc)

	authMiddleware := webmiddleware.JWTAuth(sessionStore)

	api := e.Group("/api")

	// Public auth routes
	api.POST("/auth/login", userH.Login)

	// Protected routes
	protected := api.Group("", authMiddleware)

	protected.POST("/auth/logout", userH.Logout)
	protected.GET("/auth/me", userH.Me)
	protected.POST("/users", userH.CreateUser)

	protected.POST("/courses", courseH.CreateCourse)
	protected.GET("/courses", courseH.ListCourses)
	protected.GET("/courses/:id", courseH.GetCourse)
	protected.POST("/courses/:id/enroll", courseH.EnrollStudent)

	protected.POST("/courses/:courseId/assignments", assignmentH.CreateAssignment)
	protected.GET("/courses/:courseId/assignments", assignmentH.ListAssignments)
	protected.GET("/assignments/:id", assignmentH.GetAssignment)

	protected.POST("/assignments/:assignmentId/submissions", submissionH.SubmitFiles)
	protected.GET("/submissions/:id", submissionH.GetSubmission)
	protected.PUT("/submissions/:id/grade", submissionH.GradeSubmission)
	protected.GET("/courses/:courseId/submissions/me", submissionH.GetMySubmissions)

	protected.POST("/courses/:courseId/reports", reportH.GenerateReport)
	protected.GET("/reports/:id", reportH.GetReport)
	protected.GET("/courses/:courseId/reports/me", reportH.GetMyCourseReports)
	protected.GET("/reports/me/latest", reportH.GetMyLatestReport)

	return &Router{echo: e}
}

func (r *Router) Start(addr string) error {
	return r.echo.Start(addr)
}
