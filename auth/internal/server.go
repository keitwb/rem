package internal

import (
	"encoding/json"
	"net/http"

	"github.com/go-http-utils/logger"
	"github.com/julienschmidt/httprouter"
	"github.com/opentracing-contrib/go-stdlib/nethttp"
	"github.com/opentracing/opentracing-go"
	"github.com/sirupsen/logrus"
)

// Server handles all of the auth requests
type Server struct {
	http.Server
	userCache *UserCache
}

const unauthorizedMsg = "Unauthorized"
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
	router.GET("/auth", s.handleAuth)
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
		w.WriteHeader(400)
		w.Write([]byte(err.Error()))
		return
	}

	user, err := s.userCache.Get(data.Username)
	if err != nil {
		logrus.WithError(err).Error("Could not fetch user")
		w.WriteHeader(500)
		w.Write([]byte("Error looking up username"))
		return
	}

	if user == nil || user.Disabled || !checkPassword(data.Password, user) {
		w.WriteHeader(403)
		w.Write([]byte(unauthorizedMsg))
		return
	}

	sid, err := generateSessionID()
	if err != nil {
		logrus.WithError(err).Error("Could not generate session id")
		w.WriteHeader(500)
		w.Write([]byte(err.Error()))
		return
	}

	if err := AddSessionID(s.userCache.userColl, user, sid); err != nil {
		w.WriteHeader(500)
		w.Write([]byte(err.Error()))
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     sessionCookieName,
		Value:    sid,
		MaxAge:   sessionCookieMaxAge,
		HttpOnly: true,
	})
	w.WriteHeader(200)
	w.Write([]byte("Logged in"))
}

func (s *Server) handleLogout(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	sessionID := determineSessionID(r)
	if sessionID == "" {
		w.WriteHeader(403)
		w.Write([]byte("No session id in request"))
		return
	}

	user, err := s.userCache.GetBySessionID(sessionID)
	if err != nil {
		w.WriteHeader(403)
		w.Write([]byte("Session id not active"))
		return
	}

	if err := RemoveSessions(s.userCache.userColl, user); err != nil {
		logrus.WithError(err).Error("couldn't delete session")
		w.WriteHeader(500)
		w.Write([]byte("Problem deleting session: " + err.Error()))
		return
	}

	w.WriteHeader(200)
	w.Write([]byte("Logged out"))
}

func (s *Server) handleAuth(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	sessionID := determineSessionID(r)
	if sessionID == "" {
		w.WriteHeader(403)
		w.Write([]byte("No session id in request"))
		return
	}

	user, err := s.userCache.GetBySessionID(sessionID)
	if err != nil {
		w.WriteHeader(403)
		w.Write([]byte("Session id not active"))
		return
	}

	if user.Disabled {
		w.WriteHeader(403)
		w.Write([]byte("User disabled"))
		return
	}

	w.WriteHeader(200)
	w.Write([]byte("Valid session"))
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
	//	var data struct {
	//		NewPassword string `json:"newPassword"`
	//	}
	//	err := json.NewDecoder(r.Body).Decode(&data)
	//	r.Body.Close()
	//	if err != nil {
	//		w.WriteHeader(400)
	//		w.Write([]byte(err.Error()))
	//		return
	//	}
	//
	//	if err := setPassword(data.NewPassword, user); err != nil {
	//		w.WriteHeader(500)
	//		w.Write([]byte("Could not set password"))
	//		return
	//	}

}
