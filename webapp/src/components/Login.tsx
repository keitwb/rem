import React, { useState } from "react";
import useForm from "react-hook-form";

import { AuthManager } from "@/backend/auth";
import { UserLogin } from "@/model/auth";

import styles from "./Login.css";

interface FormData {
  username: string;
  password: string;
}

interface Props {
  authManager: AuthManager;
  onLoggedIn: (ul: UserLogin) => void;
}

export default function Login(props: Props) {
  const [errorMsg, setErrorMsg] = useState<string>("Please log in to continue.");
  const { register, handleSubmit } = useForm<FormData>();

  const tryLogin = async ({ username, password }: FormData) => {
    setErrorMsg("");
    const [userLogin, err] = await props.authManager.login(username, password);
    if (err) {
      setErrorMsg(err.message);
      return;
    }
    props.onLoggedIn(userLogin);
  };

  return (
    <>
      <form className={styles.form} onSubmit={handleSubmit(tryLogin)}>
        <div className={styles.error}>{errorMsg}</div>
        <div>
          <label htmlFor="username">Username</label>
          <input type="text" name="username" ref={register} />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input type="password" name="password" ref={register} />
        </div>
        <button type="submit">Login</button>
      </form>
    </>
  );
}
