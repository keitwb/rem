package internal

import (
	"net/http"

	jsoniter "github.com/json-iterator/go"
	"github.com/sirupsen/logrus"
)

var json = jsoniter.ConfigCompatibleWithStandardLibrary // nolint

func writeJSONError(rw http.ResponseWriter, errMsg string, statusCode int) {
	writeJSON(rw, map[string]interface{}{
		"error": errMsg,
	}, statusCode)
}

func writeJSON(rw http.ResponseWriter, data map[string]interface{}, statusCode int) {
	jsonBytes, err := json.Marshal(data)
	if err != nil {
		writeJSONError(rw, "could not marshal response, see server logs", 500)
		return
	}

	rw.Header().Set("Content-Type", "application/json")
	rw.WriteHeader(statusCode)
	_, err = rw.Write(jsonBytes)

	if err != nil {
		logrus.WithError(err).Error("Could not write response")
	}
}
