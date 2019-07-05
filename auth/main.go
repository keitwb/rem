package main

import (
	"context"
	"io"
	"net/http"
	"os"
	"time"

	"github.com/keitwb/rem/auth/internal"
	"github.com/keitwb/rem/auth/internal/metrics"
	"github.com/keitwb/rem/gocommon"
	"github.com/sirupsen/logrus"
	"github.com/uber/jaeger-client-go/config"
	"github.com/uber/jaeger-lib/metrics/prometheus"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
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

	go metrics.ServeMetrics()

	mongoURL := os.Getenv("MONGO_URI")
	if mongoURL == "" {
		panic("MONGO_URI not specified")
	}

	opt := options.Client()
	//opt.SetSingle(true)
	opt.SetConnectTimeout(15 * time.Second)
	opt.ApplyURI(mongoURL)

	client, err := mongo.Connect(context.Background(), opt)
	if err != nil {
		panic("could not connect to Mongo server: " + err.Error())
	}

	logrus.WithField("mongoURL", mongoURL).Info("Connected to Mongo")

	dbName := getenv("MONGO_DATABASE", "rem")

	logrus.Infof("Using database %s", dbName)

	userCache := internal.NewUserCache(client.Database(dbName).Collection(string(gocommon.Users)))
	if err := userCache.StartWatcher(); err != nil {
		panic("could not watch users: " + err.Error())
	}

	server := internal.NewServer(userCache)

	logrus.Infof("Listening on %s", server.Addr)

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
