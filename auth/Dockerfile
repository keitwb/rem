FROM golang:1.11.5-stretch as builder

WORKDIR /src
COPY auth/go.* ./
# Need this to download modules
COPY gocommon/ /gocommon
RUN CGO_ENABLED=0 go mod download

COPY auth/ ./

RUN CGO_ENABLED=0 go build .

FROM scratch

ENTRYPOINT ["/auth"]
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=builder /src/auth /auth
