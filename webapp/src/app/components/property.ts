import { Component, OnInit, OnChanges, Input } from '@angular/core';
import { FormControl, FormBuilder, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute, Params }      from '@angular/router';
import { Observable }        from 'rxjs/Observable';
import 'rxjs/add/operator/switchMap';

import { AppStore } from 'app/store';
import { Property } from 'app/models';

@Component({
  selector:    'property',
  templateUrl: './property.component.html',
  styles:   [
  ]
})
export class PropertyComponent implements OnInit, OnChanges {
  @Input() property$: Observable<Property>;
  editing: boolean = false;
  propForm: FormGroup;

  constructor(private route: ActivatedRoute,
              private fb: FormBuilder,
              private store: AppStore) {
    this.editing = false;

    this.propForm = this.fb.group({
        name: '',
    });
  }

  ngOnChanges() {

  }

  ngOnInit() {
    this.route.params
      .switchMap((params: Params) => this.getProperty(this.route.params['id']))
      .subscribe((prop: Property) => this.property = prop );

  }

  toggleEdit() {
    this.editing = !this.editing;
  }

  onSubmit() {
      // Save property to server
      // Go to view of the property
  }

}

