import axios, { AxiosInstance } from "axios";

import { UserLogin } from "@/model/auth";

export class AuthManager {
  private authBaseURL: string;
  private http: AxiosInstance;

  constructor(authBaseURL: string) {
    this.authBaseURL = authBaseURL.replace(/\/$/, "");
    this.http = axios.create({
      // Treat all responses as valid to reserve promise rejection for connection issues.
      validateStatus: _ => true,
      withCredentials: true,
    });
  }

  public async currentUserLogin(): Promise<[UserLogin, Error]> {
    const resp = await this.http.get(`${this.authBaseURL}/verify`);
    if (resp.status === 200) {
      if (!(resp.data || {}).userId) {
        return [null, new Error("no userId found in auth response")];
      }
      return [{ userId: resp.data.userId }, null];
    }
    return [null, new Error((resp.data || {}).error || "Unknown error")];
  }

  public async login(username: string, password: string): Promise<[UserLogin, Error]> {
    // The response should set a cookie that contains the session token.
    const resp = await this.http.post(`${this.authBaseURL}/login`, {
      username,
      password,
    });

    if (resp.status >= 400) {
      let err = "Unknown error";
      if (resp.data) {
        err = resp.data.error;
      }

      return [null, new Error(err)];
    }

    if (!(resp.data || {}).userId) {
      return [null, new Error("UserID not found in response")];
    }

    return [{ userId: resp.data.userId }, null];
  }

  public async logout(): Promise<Error> {
    const resp = await this.http.post(`${this.authBaseURL}/logout`);
    if (resp.status >= 400) {
      let err = "Could not logout";
      if (resp.data) {
        err = resp.data.error;
      }
      return new Error(err);
    }

    location.reload();
  }
}
