package main

import (
	"context"
	"io"
	"net/http"
	"os"
	"time"

	"github.com/keitwb/rem/auth/internal"
	"github.com/keitwb/rem/gocommon"
	"github.com/mongodb/mongo-go-driver/mongo"
	"github.com/mongodb/mongo-go-driver/mongo/options"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"github.com/sirupsen/logrus"
	"github.com/uber/jaeger-client-go/config"
	"github.com/uber/jaeger-lib/metrics/prometheus"
)

func getenv(name, defaultVal string) string {
	if val, ok := os.LookupEnv(name); ok {
		return val
	}
	return defaultVal
}

func main() {
	if os.Getenv("TRACING_ENABLED") == "true" {
		closer, err := initTracer()
		if err != nil {
			panic("Could not initialize tracing and metrics: " + err.Error())
		}
		defer closer.Close()
	}

	initMetrics()

	mongoURL := os.Getenv("MONGO_URI")
	if mongoURL == "" {
		panic("MONGO_URI not specified")
	}

	opt := options.Client()
	opt.SetSingle(true)
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	client, err := mongo.Connect(ctx, mongoURL, opt)
	cancel()
	if err != nil {
		panic("could not connect to Mongo server: " + err.Error())
	}
	logrus.WithField("mongoURL", mongoURL).Info("Connected to Mongo")

	userCache := internal.NewUserCache(client.Database(getenv("MONGO_DATABASE", "rem")).Collection(string(gocommon.Users)))
	userCache.StartWatcher()

	server := internal.NewServer(userCache)
	if err = server.ListenAndServe(); err != http.ErrServerClosed {
		panic("server closed unexpectedly: " + err.Error())
	}
}

func initTracer() (io.Closer, error) {
	metricsFactory := prometheus.New()
	conf, err := config.FromEnv()
	if err != nil {
		return nil, err
	}
	return conf.InitGlobalTracer("auth", config.Metrics(metricsFactory))
}

func initMetrics() {
	http.Handle("/metrics", promhttp.Handler())
	go http.ListenAndServe(":2112", nil)
}
