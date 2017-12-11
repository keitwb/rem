import { Component, Input, Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/operator/concat';
import * as _ from 'lodash';

import { MongoDoc, MongoID, MongoClient } from 'app/services/mongo';
import { Media, CollectionName } from 'app/models';

@Component({
  selector: 'rem-media-list',
  template: `
    <ul>
      <li *ngFor="let file of mediaFiles | async">{{ file.filename }}</li>
    </ul>
  `,
  styles: [`
  `]
})
@Injectable()
export class MediaListComponent {
  @Input() idsToInclude: {[key: string]: MongoID[]}
  mediaFiles: Observable<Media>

  constructor(private mongo: MongoClient) {}

  ngOnChanges() {
    this.mediaFiles = Observable.concat(..._.map(_.toPairs(this.idsToInclude), ([coll, ids]) =>
      this.mongo.streamList<Media>(coll, {filter: {
        [`linked_${coll}`]: ids,
      }})[1]));
  }
}
