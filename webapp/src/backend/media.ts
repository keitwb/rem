import axios, { AxiosInstance } from "axios";
import { ObjectID } from "bson";

export default class MediaUploadClient {
  private mediaUploadURL: string;
  private http: AxiosInstance;

  constructor(mediaUploadURL: string) {
    this.mediaUploadURL = mediaUploadURL.replace(/\/$/, "");
    this.http = axios.create({
      // Treat all responses as valid to reserve promise rejection for connection issues.
      validateStatus: _ => true,
      withCredentials: true,
    });
  }

  public async uploadFile(
    _id: ObjectID,
    file: File,
    metadata: { [index: string]: any },
    progressCallback?: (e: ProgressEvent) => void
  ): Promise<[any, Error]> {
    const data = new FormData();
    data.set(file.name, file);
    data.set("form-info", JSON.stringify({ [file.name]: { _id: _id.toHexString(), metadata } }));

    const resp = await this.http.put(`${this.mediaUploadURL}/media-upload`, {
      data,
      onUploadProgress: progressCallback,
    });

    if (resp.status !== 200) {
      return [null, new Error(resp.data || "Unknown error")];
    }

    return [resp.data, null];
  }
}
