import { Component, Input, EventEmitter, Output } from '@angular/core';

import { Property, Lease, Note }   from 'app/models';
import { MongoDoc, MongoID }   from 'app/services/mongo';
import * as updates   from 'app/services/updates';

@Component({
  selector:    'rem-property',
  templateUrl: './detail.html',
  //styles:   []
})
export class PropertyComponent {
  @Input() property: Property;
  @Output() update = new EventEmitter<{doc: Property, update: updates.ModelUpdate}>();

  mediaLinks: {[index: string]: MongoID[]};

  propTypeValues = [
    ["commercial", "Commercial"],
    ["residential", "Residential"],
    ["land", "Land"],
  ];

  ngOnChanges() {
    if (this.property) {
      this.mediaLinks = {
        [Property.collection]: [this.property._id],
        [Lease.collection]: this.property.leases,
        [Note.collection]: this.property.notes,
      };
    }
  }

  save(propName: string, value: any) {
    this.update.emit({
      doc: this.property,
      update: updates.set(propName, value),
    });
  }
}

