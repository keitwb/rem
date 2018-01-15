import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Observable }        from 'rxjs/Observable';
import { Subscription }      from 'rxjs/Subscription';
import 'rxjs/add/operator/partition';
import * as uuid from 'uuid/v4';
import { ObjectID } from 'bson';

import { Property, PropertyType } from 'app/models';
import { MongoDoc, MongoClient }               from 'app/services/index';

@Component({
  selector: 'rem-new-property',
  template: `
  <rem-property-create (create)="submit($event)" [error]="error">
  </rem-property-create>
  `,
  styles: [` `]
})
export class NewPropertyComponent {
  error: string;

  constructor(private mongo: MongoClient, private router: Router) { }

  ngOnInit() {
  }

  complete(docId: string) {
    this.router.navigate([`/properties/${docId}`]);
  }

  ngOnDestroy() {
  }

  submit(model: Property) {
    this.mongo.create(Property.collection, model)
      .subscribe(
        newId => { this.complete(newId.$oid); },
        err => { this.error = err.text(); });
  }
}
