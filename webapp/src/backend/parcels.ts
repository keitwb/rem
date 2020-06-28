import axios, { AxiosInstance } from "axios";

import { ParcelDatum } from "@/model/models.gen";

export class ParcelDataClient {
  private gisBaseURL: string;
  private http: AxiosInstance;

  constructor(gisBaseURL: string) {
    this.gisBaseURL = gisBaseURL.replace(/\/$/, "");
    this.http = axios.create({
      // Treat all responses as valid to reserve promise rejection for connection issues.
      validateStatus: _ => true,
      withCredentials: true,
    });
  }

  public async getParcelInfo(state: string, county: string, pinNumber: string): Promise<[ParcelDatum, Error]> {
    const resp = await this.http.get(`${this.gisBaseURL}/v1/parcel/${state}/${county}/${pinNumber}`);
    if (resp.status === 200) {
      return [resp.data, null];
    }
    return [null, new Error((resp.data || {}).error || "Unknown error")];
  }
}
