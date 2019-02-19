package internal

import (
	"context"
	"sync"
	"time"

	"github.com/davecgh/go-spew/spew"
	"github.com/keitwb/rem/gocommon"
	"github.com/mongodb/mongo-go-driver/bson"
	"github.com/mongodb/mongo-go-driver/bson/primitive"
	"github.com/mongodb/mongo-go-driver/mongo"
	"github.com/sirupsen/logrus"
)

const sessionIDField = "sessionIDs"

// UserCache is a cache of the set of users in Mongo.  It is thread-safe.
type UserCache struct {
	sync.Mutex
	userColl        *mongo.Collection
	userByName      map[string]*gocommon.User
	userByID        map[primitive.ObjectID]*gocommon.User
	userBySessionID map[string]*gocommon.User
}

// NewUserCache creates a user cache that can be used to get users and will
func NewUserCache(userColl *mongo.Collection) *UserCache {
	return &UserCache{
		userColl:        userColl,
		userByName:      make(map[string]*gocommon.User),
		userByID:        make(map[primitive.ObjectID]*gocommon.User),
		userBySessionID: make(map[string]*gocommon.User),
	}
}

type changeDoc struct {
	FullDocument  *gocommon.User
	OperationType string
	DocumentKey   *primitive.ObjectID
}

// StartWatcher will start a change stream for users so that changes (e.g. login/logout) will be
// distributed to all instances of this service.
func (uc *UserCache) StartWatcher() error {
	changeStream, err := uc.userColl.Watch(context.Background(), nil)
	if err != nil {
		return err
	}

	go func() {
		for {
			ok := changeStream.Next(context.Background())
			if !ok {
				logrus.WithError(changeStream.Err()).Error("Could not get changes to user, trying again...")
				continue
			}

			var change changeDoc
			err := changeStream.Decode(&change)
			if err != nil {
				logrus.WithError(err).Error("Could not decode user from Mongo")
				continue
			}

			uc.processChangeToUser(&change)
		}
	}()
	return nil
}

func (uc *UserCache) processChangeToUser(change *changeDoc) {
	switch change.OperationType {
	case "insert":
		// We can't have subscribed to a user that has just been inserted.
		return
	case "update", "replace":
		user := change.FullDocument
		if user == nil {
			logrus.Errorf("User %s doesn't have a username", user.ID)
			return
		}

		logrus.WithField("_id", user.ID).Debug("User changed in Mongo")

		uc.Lock()
		defer uc.Unlock()

		if uc.userByName[user.Username] == nil {
			return
		}

		uc.replaceUser(user)
	case "delete":
		if change.DocumentKey == nil {
			logrus.WithField("change", spew.Sdump(change)).Errorf("User delete change event didn't have documentKey")
			return
		}

		uc.Lock()
		defer uc.Unlock()

		uc.removeUserByID(*change.DocumentKey)
	case "drop", "rename", "dropDatabase", "invalidate":
		// A drop or rename of the user collection is pretty catastrophic
		panic("cannot continue with users collection: " + change.OperationType)
	}
}

// Must hold lock
func (uc *UserCache) replaceUser(user *gocommon.User) {
	uc.removeUserByID(user.ID)

	uc.userByID[user.ID] = user
	uc.userByName[user.Username] = user
	for _, sid := range user.SessionIDs {
		uc.userBySessionID[sid] = user
	}
}

// Must hold lock
func (uc *UserCache) removeUserByID(id primitive.ObjectID) {
	user := uc.userByID[id]
	if user == nil {
		// If nil, this user wasn't subscribed to.
		return
	}

	logrus.WithField("user_id", id).Debug("Removing user from cache")

	delete(uc.userByID, id)
	delete(uc.userByName, user.Username)
	for _, sid := range user.SessionIDs {
		delete(uc.userBySessionID, sid)
	}
}

// GetBySessionID returns a cached user if present, or else looks up the user by session id in Mongo
func (uc *UserCache) GetBySessionID(sessionID string) (*gocommon.User, error) {
	uc.Lock()
	if user := uc.userBySessionID[sessionID]; user != nil {
		uc.Unlock()
		return user, nil
	}
	uc.Unlock()

	user, err := fetchUserBySessionID(uc.userColl, sessionID)
	if err != nil {
		return nil, err
	}

	uc.Lock()
	defer uc.Unlock()
	uc.replaceUser(user)

	return user, nil
}

// Get a user by username, returning the local cached version if present.  If the username doesn't
// correspond to a user, nil is returned for both return values.
func (uc *UserCache) Get(username string) (*gocommon.User, error) {
	uc.Lock()
	user := uc.userByName[username]
	uc.Unlock()

	if user != nil {
		return user, nil
	}

	user, err := getFromMongo(uc.userColl, username)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, err
	}

	uc.Lock()
	defer uc.Unlock()

	uc.replaceUser(user)

	return user, nil
}

func getFromMongo(userColl *mongo.Collection, username string) (*gocommon.User, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 7*time.Second)
	res := userColl.FindOne(ctx, bson.D{{"username", username}})
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
