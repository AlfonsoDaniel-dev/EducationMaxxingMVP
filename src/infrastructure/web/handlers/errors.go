package handlers

// ErrorResponse is the standard error shape returned by all API endpoints.
type ErrorResponse struct {
	Message string `json:"message"`
}
