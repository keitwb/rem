package internal

import (
	"github.com/keitwb/rem/gocommon"
	"golang.org/x/crypto/bcrypt"
)

func checkPassword(password string, user *gocommon.User) bool {
	if user.PasswordHashed == nil {
		return false
	}

	return bcrypt.CompareHashAndPassword([]byte(*user.PasswordHashed), []byte(password)) == nil
}

func setPassword(password string, user *gocommon.User) error {
	hashed, err := bcrypt.GenerateFromPassword([]byte(password), 15)
	if err != nil {
		return err
	}

	hashedStr := string(hashed)
	user.PasswordHashed = &hashedStr

	return nil
}
