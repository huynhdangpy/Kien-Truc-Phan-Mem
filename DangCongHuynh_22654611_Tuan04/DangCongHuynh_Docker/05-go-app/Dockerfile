FROM golang:1.22 AS builder

WORKDIR /app
COPY go.mod ./
COPY main.go ./
RUN go build -o hello-go main.go

FROM debian:bookworm-slim
WORKDIR /app
COPY --from=builder /app/hello-go ./hello-go
CMD ["./hello-go"]
