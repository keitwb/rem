import * as md5 from "js-md5";
import map from "lodash-es/map";
import toPairs from "lodash-es/toPairs";

import { CollectionName, Media } from "@/model/models";
import { patchWithObject } from "@/model/updates";
import * as mongo from "./mongo";

export class FilesClient {
  private readonly mongoClient: mongo.MongoClient;

  constructor(mongoClient: mongo.MongoClient) {
    this.mongoClient = mongoClient;
  }

  public getFilesForIds(idsToInclude: { [index: string]: mongo.MongoID[] }): Promise<Media[]> {
    const filter = { $or: map(toPairs(idsToInclude), ([coll, ids]) => ({ [coll]: ids })) };
    return mongoClient.getFullList<Media>(CollectionName.Media, { filter });
  }

  public uploadFile(file: File, metadata: object): Promise<Media> {
    return readFileContent(file).switchMap(content => {
      const checksum = md5(content);
      const existing$ = mongo.getFullList<Media>(CollectionName.Media, {
        filter: {
          $and: [{ md5: checksum }, { length: content.byteLength }],
        },
      });

      return existing$.switchMap(docs => {
        // Ignore extra docs if more than one matched.  This shouldn't
        // happen anyway if we are uploading properly.
        return docs.length > 0 ? patchMetadata(docs[0], metadata) : createNew(file, metadata);
      });
    });
  }

  public patchMetadata(media: Media, metadata: object): Observable<Media> {
    return this.mongoClient.update(CollectionName.Media, media._id, media._etag, patchWithObject(metadata));
  }

  public createNew(file: File, metadata: object): Promise<Media> {
    return this.mongoClient.createFile(CollectionName.Media, file, metadata);
  }

  private readFileContent(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.onerror = error => reject(error);
      reader.readAsArrayBuffer(file);
    });
  }
}
