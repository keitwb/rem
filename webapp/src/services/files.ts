import { Observable } from 'rxjs/Observable';
import * as md5 from 'md5';
import map from 'lodash-es/map';
import toPairs from 'lodash-es/toPairs';

import * as mongo from './mongo';
import { Media } from '@/models';
import { patchWithObject } from '@/util/updates';

export function getFilesForIds(idsToInclude: {[index: string]: mongo.MongoID[]}): Observable<Media[]> {
  const filter = {'$or': map(toPairs(idsToInclude), ([coll, ids]) => ({[coll]: ids}))};
  return mongo.getFullList<Media>(Media.collection, {filter});
}

export function uploadFile(file: File, metadata: object): Observable<Media> {
  return readFileContent(file).switchMap(content => {
    const checksum = md5(content);
    const existing$ = mongo.getFullList<Media>(Media.collection, {filter: {
      '$and': [
        {md5: checksum},
        {length: content.byteLength},
      ]}});

    return existing$.switchMap(docs => {
      // Ignore extra docs if more than one matched.  This shouldn't
      // happen anyway if we are uploading properly.
      return docs.length > 0
        ? patchMetadata(docs[0], metadata)
        : createNew(file, metadata);
    });
  });
}

export function patchMetadata(media: Media, metadata: object): Observable<Media> {
  return mongo.update(Media.collection, media._id, media._etag, patchWithObject(metadata));
}

function createNew(file: File, metadata: object): Observable<Media> {
  return mongo.createFile(Media.collection, file, metadata);
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
