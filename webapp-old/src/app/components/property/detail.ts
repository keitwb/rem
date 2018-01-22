import { Component, Input, EventEmitter, Output } from '@angular/core';

import { Property, Lease, Note, Media } from 'app/models';
import { MongoDoc, MongoID }            from 'app/services/mongo';
import * as updates                     from 'app/util/updates';

@Component({
  selector:    'rem-property',
  templateUrl: './detail.html',
  //styles:   []
})
export class PropertyComponent {
  @Input() property: Property;
  @Input() media: Media[];
  @Input() notes: Note[];
  @Input() leases: Lease[];
  @Output() update = new EventEmitter<{doc: Property, update: updates.ModelUpdate}>();

  save(propName: string, value: any) {
    this.update.emit({
      doc: this.property,
      update: updates.set(propName, value),
    });
  }
}

