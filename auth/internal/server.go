package internal

import (
	"errors"
	"net/http"
	"time"

	"github.com/go-http-utils/logger"
	"github.com/julienschmidt/httprouter"
	"github.com/keitwb/rem/auth/internal/metrics"
	"github.com/keitwb/rem/gocommon"
	"github.com/opentracing-contrib/go-stdlib/nethttp"
	"github.com/opentracing/opentracing-go"
	"github.com/sirupsen/logrus"
)

// Server handles all of the auth requests
type Server struct {
	http.Server
	userCache *UserCache
}

const unauthorizedMsg = "Incorrect username or password"
const (
	sessionCookieName = "sessionid"
	// Session cookies last for 30 days
	sessionCookieMaxAge = 60 * 60 * 24 * 30
)

// NewServer creates a new server that handles auth requests
func NewServer(userCache *UserCache) *Server {
	router := httprouter.New()
	s := &Server{
		Server: http.Server{
			Addr: ":8080",
			Handler: logger.DefaultHandler(nethttp.Middleware(opentracing.GlobalTracer(), router,
				nethttp.OperationNameFunc(func(r *http.Request) string {
					return r.Method + " " + r.URL.Path
				}))),
		},
		userCache: userCache,
	}

	router.POST("/login", s.handleLogin)
	router.POST("/logout", s.handleLogout)
	router.POST("/set-password", s.handleSetPassword)
	router.GET("/verify", s.handleVerify)

	return s
}

func (s *Server) handleLogin(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	var data struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}

	err := json.NewDecoder(r.Body).Decode(&data)
	r.Body.Close()

	if err != nil {
		writeJSONError(w, "bad input", 400)
		return
	}

	user, err := s.userCache.Get(data.Username)
	if err != nil {
		logrus.WithError(err).Error("Could not fetch user")
		writeJSONError(w, "Error looking up username", 500)

		return
	}

	if user == nil || user.Disabled || !checkPassword(data.Password, user) {
		metrics.LoginFailures.Inc()
		writeJSONError(w, unauthorizedMsg, 403)

		return
	}

	sid, err := generateSessionID()
	if err != nil {
		logrus.WithError(err).Error("Could not generate session id")
		writeJSONError(w, err.Error(), 500)

		return
	}

	if err := AddSessionID(s.userCache.userColl, user, sid); err != nil {
		writeJSONError(w, err.Error(), 500)
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     sessionCookieName,
		Value:    sid,
		MaxAge:   sessionCookieMaxAge,
		Path:     "/",
		HttpOnly: true,
	})
	writeJSON(w, map[string]interface{}{
		"userId": user.ID.Hex(),
	}, 200)
}

func (s *Server) handleLogout(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	user, err := s.getUserFromSession(r)
	if err != nil {
		writeJSONError(w, err.Error(), 403)
		return
	}

	if err := RemoveSessions(s.userCache.userColl, user); err != nil {
		logrus.WithError(err).Error("couldn't delete session")
		writeJSONError(w, "Problem deleting session: "+err.Error(), 500)

		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     sessionCookieName,
		Value:    "",
		Path:     "/",
		Expires:  time.Time{},
		HttpOnly: true,
	})

	writeJSON(w, map[string]interface{}{"message": "Logged out"}, 200)
}

func (s *Server) getUserFromSession(r *http.Request) (*gocommon.User, error) {
	sessionID := determineSessionID(r)
	if sessionID == "" {
		return nil, errors.New("no session id in request")
	}

	user, err := s.userCache.GetBySessionID(sessionID)
	if err != nil {
		return nil, errors.New("session id not active")
	}

	return user, nil
}

func (s *Server) handleVerify(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	user, err := s.getUserFromSession(r)
	if err != nil {
		writeJSONError(w, err.Error(), 403)
		return
	}

	if user.Disabled {
		writeJSONError(w, "User disabled", 403)
		return
	}

	writeJSON(w, map[string]interface{}{
		"userId": user.ID.Hex(),
	}, 200)
}

func determineSessionID(r *http.Request) string {
	for _, cookie := range r.Cookies() {
		if cookie.Name == sessionCookieName {
			return cookie.Value
		}
	}

	return ""
}

func (s *Server) handleSetPassword(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	user, err := s.getUserFromSession(r)
	if err != nil {
		writeJSONError(w, err.Error(), 403)
		return
	}

	var data struct {
		NewPassword string `json:"newPassword"`
	}

	err = json.NewDecoder(r.Body).Decode(&data)

	r.Body.Close()

	if err != nil {
		writeJSONError(w, err.Error(), 400)
		return
	}

	if err := setPassword(data.NewPassword, user); err != nil {
		writeJSONError(w, "Could not set password", 500)
		return
	}
}
