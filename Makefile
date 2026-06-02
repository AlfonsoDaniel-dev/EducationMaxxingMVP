docs:
	swag init -g cmd/main.go -o docs/ --parseDependency --parseInternal

test:
	go test ./...

test-unit:
	go test ./src/...

test-integration:
	go test ./tests/integration/...

test-race:
	go test -race ./...

test-coverage:
	go test -coverprofile=coverage.out ./...
	go tool cover -html=coverage.out -o coverage.html
