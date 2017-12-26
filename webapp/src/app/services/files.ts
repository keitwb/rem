import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import * as md5 from 'md5';
import * as _ from 'lodash';

import { MongoClient, MongoID } from './mongo';
import { Media } from 'app/models';
import { patchWithObject } from 'app/util/updates';

@Injectable()
export class FileService {
  constructor(private mongo: MongoClient) { }

  getFilesForIds(idsToInclude: {[index: string]: MongoID[]}) {
    const filter = {'$or': _.map(_.toPairs(idsToInclude), ([coll, ids]) => ({[coll]: ids}))};
    return this.mongo.getList<Media>(Media.collection, {filter});
  }

  uploadFile(file: File, metadata: object): Observable<Media> {
    return readFileContent(file).switchMap(content => {
      const checksum = md5(content);
      const existing$ = this.mongo.getList<Media>(Media.collection, {filter: {
        '$and': [
          {md5: checksum},
          {length: content.byteLength},
        ]}});

      return existing$.switchMap(docs => {
        // Ignore extra docs if more than one matched.  This shouldn't
        // happen anyway if we are uploading properly.
        return docs.length > 0
          ? this.patchMetadata(docs[0], metadata)
          : this.createNew(file, metadata);
      });
    });
  }

  private patchMetadata(media: Media, metadata: object): Observable<Media> {
    return this.mongo.update(Media.collection, media._id, media._etag, patchWithObject(metadata));
  }

  private createNew(file: File, metadata: object): Observable<Media> {
    return this.mongo.createFile(Media.collection, file, metadata);
  }
}

function readFileContent(file: File): Observable<ArrayBuffer> {
  return Observable.create(observer => {
    const reader = new FileReader();
    reader.onload = () => {
      observer.next(reader.result);
      observer.complete();
    };
    reader.onerror = (error) => Observable.throw(error);
    reader.readAsArrayBuffer(file);
  });
}
