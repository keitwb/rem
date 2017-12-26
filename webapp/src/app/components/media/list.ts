import { Component, Input, Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/operator/concat';

import { MongoDoc, MongoID, MongoClient } from 'app/services/mongo';
import { Media, CollectionName } from 'app/models';

@Component({
  selector: 'rem-media-list',
  template: `
    <ul class="list-unstyled">
      <li *ngFor="let file of media"><a href="{{file._links['rh:data'].href}}">{{ file.filename }} - </a></li>
    </ul>
  `,
  styles: [`
  `]
})
@Injectable()
export class MediaListComponent {
  @Input() media: Media[];

  constructor(private mongo: MongoClient) {}

}
