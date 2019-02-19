# Auth service

This is a simple authentication/authorization service that is used to login the user, issue a token,
and verify that token for the backend ingress.

It is written in Go to provide low latency for token verification and uses [Go
modules](https://github.com/golang/go/wiki/Modules).
