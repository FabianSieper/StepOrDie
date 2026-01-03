# --- STAGE 1: Build ---
FROM golang:1.25-bookworm AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy dependency files first to leverage Docker caching
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest of the source code
COPY . .

# Build the binary
# CGO_ENABLED=0 creates a statically linked binary (required for 'scratch' or 'distroless')
RUN CGO_ENABLED=0 GOOS=linux go build -o /main ./main.go

# --- STAGE 2: Runtime ---
# 'distroless' is more secure than Alpine and includes CA certificates for HTTPS
FROM gcr.io/distroless/static-debian12:nonroot

# Copy the compiled binary from the builder stage
COPY --from=builder /main /main

# Expose the port app runs on
EXPOSE 8080

# Run the binary
CMD ["/main"]