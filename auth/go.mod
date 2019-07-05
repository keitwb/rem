module github.com/keitwb/rem/auth

replace github.com/keitwb/rem/gocommon => ../gocommon

require (
	github.com/codahale/hdrhistogram v0.0.0-20161010025455-3a0bb77429bd // indirect
	github.com/davecgh/go-spew v1.1.1
	github.com/go-http-utils/logger v0.0.0-20161128092850-f3a42dcdeae6
	github.com/json-iterator/go v1.1.7
	github.com/julienschmidt/httprouter v1.3.0
	github.com/keitwb/rem/gocommon v0.0.0
	github.com/mongodb/mongo-go-driver v1.1.1
	github.com/opentracing-contrib/go-stdlib v0.0.0-20190519235532-cf7a6c988dc9
	github.com/opentracing/opentracing-go v1.1.0
	github.com/pkg/errors v0.8.1 // indirect
	github.com/prometheus/client_golang v0.9.2
	github.com/sirupsen/logrus v1.4.2
	github.com/uber-go/atomic v1.4.0 // indirect
	github.com/uber/jaeger-client-go v2.15.1-0.20190203041652-3231c1a9c595+incompatible
	github.com/uber/jaeger-lib v2.0.0+incompatible
	go.mongodb.org/mongo-driver v1.1.1
	go.uber.org/atomic v1.4.0 // indirect
	golang.org/x/crypto v0.0.0-20191002192127-34f69633bfdc
)

go 1.13
