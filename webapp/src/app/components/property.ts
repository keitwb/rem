import { Component, OnInit, OnChanges, Input, EventEmitter, Output } from '@angular/core';
import { Router, ActivatedRoute, Params }                            from '@angular/router';
import { Observable }                                                from 'rxjs/Observable';
import { Store }                                                     from '@ngrx/store';

import { MongoDoc }   from 'app/services/mongo';
import { AppState }   from 'app/store/reducers';
import { Property }   from 'app/models';
import * as selectors from 'app/store/selectors';
import * as updates   from 'app/services/updates';

@Component({
  selector:    'rem-property',
  templateUrl: './property.html',
  //styles:   []
})
export class PropertyComponent {
  @Input() property: MongoDoc<Property>;
  @Output() update = new EventEmitter<{doc: MongoDoc<Property>, update: updates.ModelUpdate}>();

  save(update: [string, any]) {
    this.update.emit({
      doc: this.property,
      update: updates.set(update[0], update[1]),
    });
  }
}

