import * as axios from "axios";
import { ObjectID } from "bson";
import * as md5 from "js-md5";
import map from "lodash-es/map";
import toPairs from "lodash-es/toPairs";

import { ValOrErr, withErr } from "@/util/errors";
import { CollectionName, Media, MongoDoc, MongoID } from "./models";
import { ModelUpdate, patchWithObject } from "./updates";

export type SortOrder = "asc" | "desc";

interface Rel {
  refField: string;
  targetColl: string;
  role: string;
  type: string;
}

export interface CollectionRels {
  [index: string /* Collection name */]: { [index: string /* relation name */]: Rel };
}

export interface ETag {
  $oid: string;
}

interface ListParams {
  page?: number;
  pageSize?: number;
  filter?: object;
  sortBy?: string;
  sortOrder?: SortOrder;
}

export class MongoClient {
  private http: axios.AxiosInstance;

  constructor(baseURL: string) {
    this.http = axios.default.create({
      baseURL,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      timeout: 10000,
    });
  }

  public async fetchRelated<T extends MongoDoc, R extends MongoDoc>(doc: T, relName: string): Promise<R[]> {
    if (!doc._links[relName] || !doc._links[relName].href) {
      return Promise.resolve([]);
    }

    const rel = doc._links[relName];
    return (await this.http.get<R[]>(rel.href)).data;
  }

  public makeListPath(collection: string, params: ListParams): [string, URLSearchParams] {
    const orderingFlag = params.sortOrder === "asc" ? "" : "-";

    const qs = new URLSearchParams();
    qs.set("np", "");
    if (params.sortBy) {
      qs.set("sort_by", `${orderingFlag}${params.sortBy}`);
    }
    if (params.filter) {
      qs.set("filter", JSON.stringify(params.filter));
    }
    if (params.pageSize) {
      qs.set("pagesize", String(params.pageSize));
    }
    if (params.page) {
      qs.set("page", String(params.page));
    }

    return [collection, qs];
  }

  public async doListQuery<T extends MongoDoc>(collection: string, params: ListParams): Promise<T[]> {
    const [path, qs] = this.makeListPath(collection, params);

    const resp = await this.http.get<T[]>(path, {
      params: qs,
    });

    return resp.data;
  }

  // Simply grabs all of the pages of a query and concatenates all of the embedded docs into a
  // single list that is emitted from the returned Promise.  Useful if you know the list is small.
  public async getFullList<T extends MongoDoc>(
    collection: string,
    { filter, sortBy, sortOrder }: ListParams
  ): Promise<T[]> {
    let page = 1;
    const pageSize = 10;
    const results: T[] = [];

    while (true) {
      const docs = await this.doListQuery<T>(collection, { filter, sortBy, sortOrder, page, pageSize });

      if (docs.length === 0) {
        return results;
      }

      results.push(...docs);
      page++;
    }
  }

  public getOne<T extends MongoDoc>(collection: string, id: MongoID): Promise<ValOrErr<T>> {
    const path = `${collection}/${id.$oid}`;
    return withErr(this.http.get<T>(path).then(resp => resp.data));
  }

  public async create(collection: string, obj: object): Promise<ValOrErr<MongoID>> {
    const path = `${collection}`;
    const newId = { $oid: new ObjectID().toHexString() };
    const bodyObj = {
      $set: {
        ...obj,
        ...{
          _createdDate: new Date().toJSON(),
          _id: newId,
          _updates: [],
        },
      },
    };

    return withErr(this.http.post(path, JSON.stringify(bodyObj)).then(_ => newId));
  }

  public update<T extends MongoDoc>(
    collection: string,
    id: MongoID,
    etag: ETag,
    updates: ModelUpdate[]
  ): Promise<ValOrErr<T>> {
    const path = `${collection}/${id.$oid}`;
    const bodyObj = { ...updates.map(u => u.updateObj) };

    return withErr(
      this.http
        .patch<T>(path, JSON.stringify(bodyObj), {
          headers: {
            "If-Match": etag.$oid,
          },
          params: {
            checkEtag: "",
          },
        })
        .then(resp => resp.data)
    );
  }

  public getFilesForIds(idsToInclude: { [index: string]: MongoID[] }): Promise<Media[]> {
    const filter = { $or: map(toPairs(idsToInclude), ([coll, ids]) => ({ [coll]: ids })) };
    return this.getFullList<Media>(CollectionName.Media, { filter });
  }

  public async uploadFile(file: File, metadata: object): Promise<ValOrErr<Media>> {
    const [content, err] = await readFileContent(file);
    if (err) {
      return [null, err];
    }
    const checksum = md5(content);
    const existingDocs = await this.getFullList<Media>(CollectionName.Media, {
      filter: {
        $and: [{ md5: checksum }, { length: content.byteLength }],
      },
    });

    // Ignore extra docs if more than one matched.  This shouldn't
    // happen anyway if we are uploading properly.
    if (existingDocs.length > 0) {
      return this.patchFileMetadata(existingDocs[0], metadata);
    } else {
      return this.createFile<Media>(CollectionName.Media, file, metadata);
    }
  }

  public patchFileMetadata(media: Media, metadata: object): Promise<ValOrErr<Media>> {
    return this.update(CollectionName.Media, media._id, media._etag, patchWithObject(metadata));
  }

  protected async createFile<T extends MongoDoc>(
    collection: string,
    file: File,
    metadata: object
  ): Promise<ValOrErr<T>> {
    const fd = new FormData();
    fd.append("properties", JSON.stringify(metadata));
    fd.append("file", file);

    const headers = {
      "Content-Type": "multipart/form",
    };
    const resp = await this.http.post<T>(collection, fd, { headers });
    return this.fetchNew<T>(resp);
  }

  // Since RESTHeart doesn't return the new doc upon creation, go fetch it
  // based on the Location header returned.
  protected fetchNew<T extends MongoDoc>(res: axios.AxiosResponse<T>): Promise<ValOrErr<T>> {
    if (res.status !== 201) {
      return Promise.reject(`Document was not created: ${res.toString()}`);
    }

    const url = new URL(res.headers.get("Location"));
    const [id, collection] = url.pathname.split("/").reverse();
    return this.getOne<T>(collection, { $oid: id });
  }
}

function readFileContent(file: File): Promise<ValOrErr<ArrayBuffer>> {
  return withErr(
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as ArrayBuffer);
      };
      reader.onerror = error => reject(error);
      reader.readAsArrayBuffer(file);
    })
  );
}
