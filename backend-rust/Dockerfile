FROM rust:1.75-alpine AS builder

RUN apk add --no-cache musl-dev

WORKDIR /app

COPY Cargo.toml Cargo.lock ./

COPY src ./src

RUN cargo build --release

FROM alpine:latest AS serve

RUN apk --no-cache add ca-certificates

WORKDIR /root/

COPY --from=builder /app/target/release/backend-rust ./app

EXPOSE 8000

CMD ["./app"]