package internal

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"time"

	"github.com/keitwb/rem/gocommon"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

const sessionByteLen = 256 / 8

// Generates a base64 encoded session id using the system's secure RNG
func generateSessionID() (string, error) {
	bs := make([]byte, sessionByteLen)
	if _, err := rand.Read(bs); err != nil {
		return "", err
	}

	return base64.StdEncoding.EncodeToString(bs), nil
}

// RemoveSessions removes all active sessions for a user
func RemoveSessions(userColl *mongo.Collection, user *gocommon.User) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	res, err := userColl.UpdateOne(ctx, bson.D{{"_id", user.ID}}, bson.D{{"$unset", bson.D{{sessionIDField, ""}}}})

	cancel()

	if err != nil {
		return err
	} else if res.MatchedCount != 1 {
		return errors.New("no user with given id")
	}

	return nil
}

// AddSessionID adds a session ID to the given user's user document.
func AddSessionID(userColl *mongo.Collection, user *gocommon.User, sessionID string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	res, err := userColl.UpdateOne(ctx, bson.D{{"_id", user.ID}}, bson.D{{"$push", bson.D{{sessionIDField, sessionID}}}})

	cancel()

	if err != nil {
		return err
	} else if res.MatchedCount != 1 {
		return errors.New("no user with given id")
	}

	return nil
}

func fetchUserBySessionID(userColl *mongo.Collection, sessionID string) (*gocommon.User, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 7*time.Second)
	res := userColl.FindOne(ctx, bson.D{{sessionIDField, sessionID}})

	cancel()

	if res.Err() != nil {
		return nil, res.Err()
	}

	var user gocommon.User
	if err := res.Decode(&user); err != nil {
		return nil, err
	}

	return &user, nil
}
