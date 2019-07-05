package metrics

import (
	"net/http"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

var (
	LoginFailures = promauto.NewCounter( // nolint
		prometheus.CounterOpts{
			Name: "login_failures",
			Help: "Total number of failed login attempts (either unknown username or bad password)",
		},
	)
)

func ServeMetrics() {
	server := http.NewServeMux()
	server.Handle("/metrics", promhttp.Handler())
	_ = http.ListenAndServe(":2112", server)
}
