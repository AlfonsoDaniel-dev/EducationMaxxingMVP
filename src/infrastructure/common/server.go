package common

import (
	"fmt"
	"net/http"
)

type Server struct {
	mux  *http.ServeMux
	addr string
}

func NewServer(addr string) *Server {
	return &Server{
		mux:  http.NewServeMux(),
		addr: addr,
	}
}

func (s *Server) RegisterRoute(pattern string, handler http.HandlerFunc) {
	s.mux.HandleFunc(pattern, handler)
}

func (s *Server) Start() error {
	fmt.Printf("Server listening on %s\n", s.addr)
	return http.ListenAndServe(s.addr, s.mux)
}
