# Arquitectura del sistema EducationMaxxingMVP

Este documento describe la arquitectura backend del sistema para facilitar la creación manual de un diagrama. El proyecto sigue una arquitectura por capas con estilo DDD/hexagonal: las reglas del dominio están aisladas, los servicios de aplicación coordinan casos de uso, la infraestructura implementa persistencia, autenticación, almacenamiento y HTTP, y `cmd/main.go` realiza la composición inicial.

## Leyenda de colores sugerida

| Color | Capa / componente | Uso visual recomendado |
| --- | --- | --- |
| Azul | Entrada HTTP / Web | Rutas, handlers, middleware y Swagger |
| Verde | Aplicación | Servicios, DTOs, puertos e interfaces |
| Amarillo | Dominio | Entidades, value objects y errores de negocio |
| Morado | Infraestructura | Repositorios, almacenamiento local, JWT y adaptadores externos |
| Gris | Arranque / composición | `cmd/main.go`, configuración y wiring de dependencias |
| Rojo | Persistencia física temporal | Directorio `uploads/` con archivos enviados por estudiantes |

## Vista general por capas

### 1. Capa de arranque y composición

Ubicación: `cmd/main.go`

Responsabilidad:
- Lee la configuración mínima del entorno, principalmente `JWT_SECRET`.
- Crea las implementaciones concretas de infraestructura.
- Crea los servicios de aplicación inyectando repositorios, almacenamiento y autenticación.
- Registra el router HTTP.
- Siembra un usuario administrador inicial.
- Levanta el servidor en `:8080`.

Módulos principales:
- `main`
- `auth.NewJWTSessionStore`
- `storage.NewLocalFileStorage`
- `infrauser.NewInMemoryUserRepository`
- `infracourse.NewInMemoryCourseRepository`
- `infraassignment.NewInMemoryAssignmentRepository`
- `infrasubmission.NewInMemorySubmissionRepository`
- `infrareport.NewInMemoryReportRepository`
- `web.NewRouter`

Relaciones:
- `cmd/main.go` llama a infraestructura para crear adaptadores concretos.
- `cmd/main.go` llama a aplicación para crear servicios.
- `cmd/main.go` llama a web para construir el router.
- `cmd/main.go` depende de todas las capas, pero solo para composición inicial.

### 2. Capa HTTP / Web

Ubicación: `src/infrastructure/web`

Responsabilidad:
- Expone la API REST usando Echo.
- Aplica middleware de autenticación JWT.
- Traduce requests HTTP a DTOs de aplicación.
- Traduce respuestas y errores de aplicación a JSON.
- Sirve Swagger UI.

Módulos principales:
- `router.go`
  - Define rutas públicas y protegidas.
  - Agrupa rutas bajo `/api`.
  - Expone Swagger en `/swagger/*`.
- `middleware/auth.go`
  - `JWTAuth`
  - Extrae `Authorization: Bearer <token>`.
  - Valida el token usando `SessionStore`.
  - Inserta `userId` en el contexto HTTP.
- `handlers/user_handler.go`
  - `Login`
  - `Logout`
  - `Me`
  - `CreateUser`
  - `ListUsers`
- `handlers/course_handler.go`
  - `CreateCourse`
  - `AdminCreateCourse`
  - `AdminAssignProfessor`
  - `GetCourse`
  - `ListCourses`
  - `ListAllCourses`
  - `EnrollStudent`
- `handlers/assignment_handler.go`
  - `CreateAssignment`
  - `ListAssignments`
  - `GetAssignment`
- `handlers/submission_handler.go`
  - `SubmitFiles`
  - `GetSubmission`
  - `GradeSubmission`
  - `ListByAssignment`
  - `ServeFile`
  - `GetMySubmissions`
- `handlers/report_handler.go`
  - `GenerateReport`
  - `GetReport`
  - `GetMyCourseReports`
  - `GetMyLatestReport`
  - `ListAllReports`
- `handlers/errors.go`
  - `ErrorResponse`

Relaciones:
- Router llama a handlers.
- Handlers llaman a servicios de aplicación.
- Middleware usa `SessionStore` para validar sesión.
- Handlers dependen de DTOs de aplicación.

### 3. Capa de aplicación

Ubicación: `src/app`

Responsabilidad:
- Implementa casos de uso del sistema.
- Orquesta entidades de dominio, repositorios y servicios externos.
- Define DTOs de entrada/salida.
- Define puertos que la infraestructura debe implementar.
- Mantiene la lógica de flujo entre módulos, sin depender de HTTP.

Módulo `src/app/user`
- `UserService`
  - `Login`
  - `Logout`
  - `GetCurrentUser`
  - `GetUserById`
  - `CreateUser`
  - `ListUsers`
- DTOs:
  - `LoginInputDTO`
  - `LoginOutputDTO`
  - `CreateUserInputDTO`
  - `UserOutputDTO`
- Puertos:
  - `UserRepository`
  - `SessionStore`
- Registro:
  - `UserRecord`

Módulo `src/app/course`
- `CourseService`
  - `CreateCourse`
  - `GetCourse`
  - `ListCoursesByProfessor`
  - `ListCoursesByStudent`
  - `ListAllCourses`
  - `AssignProfessor`
  - `EnrollStudent`
- DTOs:
  - `CreateCourseInputDTO`
  - `CourseOutputDTO`
  - `EnrollStudentInputDTO`
- Puerto:
  - `CourseRepository`
- Registro:
  - `CourseRecord`

Módulo `src/app/assignment`
- `AssignmentService`
  - `CreateAssignment`
  - `GetAssignment`
  - `ListByCourse`
- DTOs:
  - `CreateAssignmentInputDTO`
  - `AssignmentOutputDTO`
- Puerto:
  - `AssignmentRepository`
- Registro:
  - `AssignmentRecord`

Módulo `src/app/submission`
- `SubmissionService`
  - `SubmitFiles`
  - `GetSubmission`
  - `GradeSubmission`
  - `GetByStudentAndCourse`
  - `ListByAssignment`
  - `ServeFile`
- DTOs:
  - `FileUploadDTO`
  - `SubmitFilesInputDTO`
  - `FileOutputDTO`
  - `SubmissionOutputDTO`
  - `GradeSubmissionInputDTO`
- Puertos:
  - `SubmissionRepository`
  - `FileStoragePort`
  - `AssignmentLookupPort`
  - `AuditLogger`
- Registros:
  - `SubmissionRecord`
  - `FileRecord`
- Implementación auxiliar:
  - `NoOpAuditLogger`

Módulo `src/app/report`
- `ReportService`
  - `GenerateReport`
  - `ListAllReports`
  - `GetReport`
  - `GetLatestReport`
  - `GetReportsByStudentAndCourse`
- DTOs:
  - `GenerateReportInputDTO`
  - `ReportOutputDTO`
- Puertos:
  - `ReportRepository`
  - `AssignmentQueryPort`
  - `SubmissionQueryPort`
- Registro:
  - `ReportRecord`

Relaciones:
- Servicios de aplicación llaman a entidades/value objects del dominio para validar reglas.
- Servicios de aplicación usan puertos, no implementaciones concretas.
- Infraestructura implementa los puertos definidos por aplicación.
- `SubmissionService` usa `AssignmentLookupPort` para obtener el `CourseId` de una tarea.
- `ReportService` usa `AssignmentQueryPort` y `SubmissionQueryPort` para calcular avance, promedio y riesgo.

### 4. Capa de dominio

Ubicación: `src/domain`

Responsabilidad:
- Contiene entidades, value objects, constructores y errores de negocio.
- Valida invariantes del sistema.
- No depende de HTTP, infraestructura ni servicios de aplicación.

Módulo `src/domain/user`
- Entidad base:
  - `User`
- Especializaciones:
  - `Student`
  - `Professor`
  - `Admin`
- Value objects:
  - `Name`
  - `Email`
  - `Password`
  - `Rol`
- Alias hacia dominio académico:
  - `AcademicProgram`
  - `Semester`
  - `Area`
  - `Speciality`
- Constructores:
  - `NewUser`
  - `NewStudent`
  - `NewProfessor`
  - `NewAdmin`
  - `NewName`
  - `NewEmail`
  - `NewPassword`
  - `NewRol`

Módulo `src/domain/AcademicProgram`
- Value objects:
  - `AcademicProgram`
  - `Semester`
  - `Area`
  - `Speciality`
- Reglas:
  - Programa académico debe pertenecer a una lista permitida.
  - Semestre debe estar entre 1 y 8.
  - Área debe pertenecer a una lista permitida.
  - Especialidad debe pertenecer a una lista permitida.

Módulo `src/domain/course`
- Entidad:
  - `Course`
- Value objects:
  - `CourseName`
  - `CourseDescription`
  - `AcademicPeriod`
- Comportamientos:
  - `AddStudent`
  - `RemoveStudent`
  - `HasStudent`

Módulo `src/domain/assignment`
- Entidad:
  - `Assignment`
- Value objects:
  - `AssignmentTitle`
  - `AssignmentDescription`
  - `PublicationDate`
  - `DeliveryDate`
- Regla principal:
  - La fecha de entrega debe ser posterior a la fecha de publicación.

Módulo `src/domain/submission`
- Entidades:
  - `Submission`
  - `File`
- Value object / enum:
  - `SubmissionStatus`
- Estados:
  - `pending`
  - `confirmed`
  - `failed`
- Comportamientos:
  - `AddFile`
  - `SetGrade`
  - `SetStatus`
  - `ValidateHashIntegrity`
  - `IsConfirmed`

Módulo `src/domain/report`
- Entidad:
  - `AcademicReport`
- Value object / enum:
  - `RiskLevel`
- Estados:
  - `high`
  - `medium`
  - `low`
- Regla principal:
  - `DetermineRiskLevel`
  - Avance menor a 60% genera riesgo alto.
  - Avance entre 60% y 75% genera riesgo medio.
  - Avance mayor a 75% genera riesgo bajo.

Relaciones:
- Aplicación llama a dominio.
- Dominio no llama a aplicación.
- Dominio no conoce repositorios, HTTP ni almacenamiento.

### 5. Capa de infraestructura

Ubicación: `src/infrastructure`

Responsabilidad:
- Implementa los puertos definidos por la capa de aplicación.
- Contiene detalles técnicos: memoria, archivos locales, JWT y servidor HTTP.

Repositorios en memoria:
- `src/infrastructure/user/repository.go`
  - `InMemoryUserRepository`
  - Implementa `app/user.UserRepository`.
  - Guarda usuarios en `map[uuid.UUID]*UserRecord`.
  - Mantiene índice por email.
- `src/infrastructure/course/repository.go`
  - `InMemoryCourseRepository`
  - Implementa `app/course.CourseRepository`.
  - Guarda cursos y alumnos inscritos.
- `src/infrastructure/assignment/repository.go`
  - `InMemoryAssignmentRepository`
  - Implementa `app/assignment.AssignmentRepository`.
  - También cumple `app/report.AssignmentQueryPort`.
- `src/infrastructure/submission/repository.go`
  - `InMemorySubmissionRepository`
  - Implementa `app/submission.SubmissionRepository`.
  - También cumple `app/report.SubmissionQueryPort`.
  - Guarda submissions y archivos asociados.
- `src/infrastructure/report/repository.go`
  - `InMemoryReportRepository`
  - Implementa `app/report.ReportRepository`.
  - Permite buscar reportes por estudiante, curso y último reporte.

Autenticación:
- `src/infrastructure/common/auth/jwt_session.go`
  - `JWTSessionStore`
  - Implementa `app/user.SessionStore`.
  - Genera y valida JWT con HS256.
  - Expiración actual: 24 horas.
- `src/infrastructure/common/auth/session.go`
  - `SessionStore`
  - Implementación alternativa en memoria con tokens UUID.

Almacenamiento:
- `src/infrastructure/common/storage/file_storage.go`
  - `LocalFileStorage`
  - Implementa `app/submission.FileStoragePort`.
  - Guarda archivos en `uploads/{assignmentId}/{studentId}/{filename}`.
  - Calcula hash SHA-256 del contenido.
  - Lee archivos para descarga.

Servidor común:
- `src/infrastructure/common/server.go`
  - `Server`
  - Envoltorio simple sobre `http.ServeMux`.
  - Actualmente no es el servidor principal usado por `cmd/main.go`, porque el router activo usa Echo.

Relaciones:
- Infraestructura implementa interfaces de aplicación.
- Infraestructura de autenticación es usada por middleware y `UserService`.
- Infraestructura de almacenamiento es usada por `SubmissionService`.
- Repositorios son usados por servicios de aplicación.

### 6. Documentación OpenAPI

Ubicación: `docs`

Responsabilidad:
- Contiene documentación Swagger generada.
- Expone el contrato HTTP de la API.

Módulos principales:
- `docs/docs.go`
- `docs/swagger.json`
- `docs/swagger.yaml`

Relaciones:
- `cmd/main.go` importa `docs` indirectamente mediante `router.go`.
- `router.go` sirve Swagger UI usando `echo-swagger`.
- Los handlers contienen anotaciones `godoc` que generan estos archivos.

## Flechas de comunicación entre capas

Representar estas flechas en el diagrama:

1. Cliente HTTP -> Router Echo
   - Etiqueta: `envía request HTTP`

2. Router Echo -> Middleware JWT
   - Etiqueta: `aplica autenticación`

3. Middleware JWT -> JWTSessionStore
   - Etiqueta: `valida token`

4. Router Echo -> Handler correspondiente
   - Etiqueta: `despacha ruta`

5. Handler -> Servicio de aplicación
   - Etiqueta: `llama caso de uso`

6. Servicio de aplicación -> Dominio
   - Etiqueta: `crea/valida entidades y value objects`

7. Servicio de aplicación -> Puerto de repositorio
   - Etiqueta: `depende de interfaz`

8. Repositorio en memoria -> Puerto de repositorio
   - Etiqueta: `implementa`

9. Servicio de aplicación -> Repositorio en memoria
   - Etiqueta: `usa implementación inyectada`

10. SubmissionService -> FileStoragePort
    - Etiqueta: `guarda/lee archivos`

11. LocalFileStorage -> uploads/
    - Etiqueta: `escribe/lee archivo físico`

12. UserService -> SessionStore
    - Etiqueta: `crea sesión`

13. JWTSessionStore -> SessionStore
    - Etiqueta: `implementa`

14. ReportService -> AssignmentQueryPort
    - Etiqueta: `consulta tareas del curso`

15. ReportService -> SubmissionQueryPort
    - Etiqueta: `consulta entregas del estudiante`

16. InMemoryAssignmentRepository -> AssignmentQueryPort
    - Etiqueta: `implementa`

17. InMemorySubmissionRepository -> SubmissionQueryPort
    - Etiqueta: `implementa`

18. cmd/main.go -> Infraestructura
    - Etiqueta: `construye adaptadores`

19. cmd/main.go -> Servicios de aplicación
    - Etiqueta: `inyecta dependencias`

20. cmd/main.go -> Router Echo
    - Etiqueta: `registra API`

## Flujos principales para representar

### Flujo de autenticación

1. Cliente llama `POST /api/auth/login`.
2. `UserHandler.Login` recibe email y password.
3. `UserService.Login` busca usuario por email usando `UserRepository`.
4. `InMemoryUserRepository` devuelve `UserRecord`.
5. `UserService` compara password.
6. `JWTSessionStore` genera token JWT.
7. Handler responde `LoginOutputDTO`.

Flechas:
- Cliente -> UserHandler: `envía credenciales`
- UserHandler -> UserService: `llama Login`
- UserService -> UserRepository: `busca por email`
- UserService -> SessionStore: `crea token`
- JWTSessionStore -> UserService: `retorna JWT`

### Flujo de creación de curso

1. Cliente autenticado llama `POST /api/courses`.
2. `JWTAuth` obtiene el `userId`.
3. `CourseHandler.CreateCourse` toma el profesor desde el JWT.
4. `CourseService.CreateCourse` crea entidad `Course`.
5. Dominio valida nombre, descripción y periodo.
6. `CourseRepository.Save` persiste el curso en memoria.
7. Handler responde `CourseOutputDTO`.

Flechas:
- Handler -> CourseService: `llama CreateCourse`
- CourseService -> dominio course: `crea Course`
- CourseService -> CourseRepository: `guarda curso`
- InMemoryCourseRepository -> CourseRepository: `implementa`

### Flujo de entrega de tarea

1. Cliente autenticado llama `POST /api/assignments/{assignmentId}/submissions`.
2. `SubmissionHandler.SubmitFiles` lee multipart form.
3. Handler transforma archivos a `FileUploadDTO`.
4. `SubmissionService.SubmitFiles` valida tamaño y MIME type.
5. `SubmissionService` consulta assignment para obtener `CourseId`.
6. `LocalFileStorage` guarda cada archivo en `uploads/`.
7. Dominio crea `File` y `Submission`.
8. `SubmissionService` calcula hash compuesto.
9. `SubmissionRepository.Save` guarda submission.
10. `SubmissionRepository.AddFile` guarda metadata de archivos.
11. Servicio confirma la entrega y genera token de confirmación.
12. Handler responde `SubmissionOutputDTO`.

Flechas:
- SubmissionHandler -> SubmissionService: `llama SubmitFiles`
- SubmissionService -> AssignmentLookupPort: `consulta tarea`
- SubmissionService -> FileStoragePort: `almacena archivo`
- LocalFileStorage -> uploads/: `escribe archivo`
- SubmissionService -> dominio submission: `crea Submission y File`
- SubmissionService -> SubmissionRepository: `guarda submission y archivos`

### Flujo de calificación

1. Cliente autenticado llama `PUT /api/submissions/{id}/grade`.
2. `SubmissionHandler.GradeSubmission` recibe calificación.
3. `SubmissionService.GradeSubmission` valida rango 0-100.
4. `SubmissionRepository.FindById` confirma que existe.
5. `SubmissionRepository.UpdateGrade` actualiza la calificación.

Flechas:
- SubmissionHandler -> SubmissionService: `llama GradeSubmission`
- SubmissionService -> SubmissionRepository: `consulta y actualiza calificación`

### Flujo de generación de reporte

1. Cliente autenticado llama `POST /api/courses/{courseId}/reports`.
2. `ReportHandler.GenerateReport` usa `userId` del JWT como estudiante.
3. `ReportService.GenerateReport` consulta tareas del curso.
4. `ReportService` consulta entregas del estudiante en ese curso.
5. Calcula porcentaje de avance.
6. Calcula promedio de entregas calificadas.
7. Busca el reporte anterior más reciente.
8. Dominio crea `AcademicReport` y calcula riesgo.
9. `ReportRepository.Save` guarda el reporte.
10. Handler responde `ReportOutputDTO`.

Flechas:
- ReportHandler -> ReportService: `llama GenerateReport`
- ReportService -> AssignmentQueryPort: `obtiene total de tareas`
- ReportService -> SubmissionQueryPort: `obtiene entregas confirmadas`
- ReportService -> dominio report: `calcula riesgo académico`
- ReportService -> ReportRepository: `guarda reporte`

## Diagrama textual sugerido

```text
[Cliente HTTP]
      |
      | envía request HTTP
      v
[Capa Web / HTTP - Azul]
  Router Echo
  Middleware JWT
  UserHandler
  CourseHandler
  AssignmentHandler
  SubmissionHandler
  ReportHandler
      |
      | llama caso de uso
      v
[Capa de Aplicación - Verde]
  UserService
  CourseService
  AssignmentService
  SubmissionService
  ReportService
  DTOs
  Ports / Interfaces
      |
      | crea/valida entidades
      v
[Capa de Dominio - Amarillo]
  User, Student, Professor, Admin
  Course
  Assignment
  Submission, File
  AcademicReport
  Value Objects y errores
      ^
      |
      | implementa puertos / provee persistencia y servicios técnicos
      |
[Capa de Infraestructura - Morado]
  InMemoryUserRepository
  InMemoryCourseRepository
  InMemoryAssignmentRepository
  InMemorySubmissionRepository
  InMemoryReportRepository
  JWTSessionStore
  LocalFileStorage
      |
      | escribe/lee archivo físico
      v
[uploads/ - Rojo]

[cmd/main.go - Gris]
      |
      | construye adaptadores e inyecta dependencias
      v
[Web + Aplicación + Infraestructura]
```

## Observaciones importantes para el diagrama

- La dependencia principal va de fuera hacia dentro: HTTP -> Aplicación -> Dominio.
- El dominio no depende de infraestructura.
- La aplicación define interfaces, y la infraestructura las implementa.
- `cmd/main.go` puede dibujarse aparte como el componente que conecta todo.
- `docs/` puede representarse como componente auxiliar conectado al Router Echo con la etiqueta `sirve documentación Swagger`.
- `uploads/` debe representarse como almacenamiento físico temporal usado solo por `LocalFileStorage`.
- Aunque existen rutas etiquetadas como admin, en la arquitectura actual la protección visible es autenticación JWT; no hay una capa clara de autorización por rol en el middleware.
