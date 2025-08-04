FROM golang:1.22-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./

RUN go mod download

COPY . .

RUN go build -o app main.go

FROM alpine:latest AS serve

WORKDIR /root/

COPY --from=builder /app/app .

EXPOSE 8080

CMD ["./app"]