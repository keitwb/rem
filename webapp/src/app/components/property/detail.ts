import { Component, Input, EventEmitter, Output } from '@angular/core';

import { Property }   from 'app/models';
import { MongoDoc }   from 'app/services/index';
import * as updates   from 'app/services/updates';

@Component({
  selector:    'rem-property',
  templateUrl: './detail.html',
  //styles:   []
})
export class PropertyComponent {
  @Input() property: MongoDoc<Property>;
  @Output() update = new EventEmitter<{doc: MongoDoc<Property>, update: updates.ModelUpdate}>();

  propTypeValues = [
    ["commercial", "Commercial"],
    ["residential", "Residential"],
    ["land", "Land"],
  ];

  save(propName: string, value: any) {
    this.update.emit({
      doc: this.property,
      update: updates.set(propName, value),
    });
  }
}

