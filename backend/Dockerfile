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
# Use the chromedp/headless-shell image which already bundles a supported Chrome binary.
FROM chromedp/headless-shell:latest

# Run as a non-root user.
RUN useradd -r -u 65532 -g nogroup appuser
USER appuser

# Copy the compiled binary from the builder stage
COPY --from=builder /main /app/main

# Point chromedp at the headless-shell binary shipped with this image.
ENV CHROMEDP_EXEC_PATH=/headless-shell/headless-shell

# Expose the port app runs on
EXPOSE 8081

# Run the binary
ENTRYPOINT ["/app/main"]
