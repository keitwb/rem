FROM golang:1.11.5-stretch as builder

WORKDIR /src
COPY gocommon/ /gocommon
COPY auth/ ./

RUN CGO_ENABLED=0 go build .

FROM scratch

ENTRYPOINT ["/auth"]
COPY --from=builder /src/auth /auth
