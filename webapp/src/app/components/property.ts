import { Component, OnInit, OnChanges, Input } from '@angular/core';
import { FormControl, FormBuilder, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import 'rxjs/add/operator/switchMap';

import { PropertyService } from './property-service';
import { Property } from './models';

@Component({
  selector: 'property',
  templateUrl: './property.component.html',
  styleUrls: ['./property.component.css']
})
export class PropertyComponent implements OnInit, OnChanges {
  @Input() property: Property;
  editing: boolean = false;
  propForm: FormGroup;

  constructor(private route: ActivatedRoute,
              private fb: FormBuilder,
              private service: PropertyService) {
    this.editing = false;

    this.propForm = this.fb.group({
        name: '',
    });
  }

  ngOnChanges() {

  }

  ngOnInit() {
    this.route.params
      .switchMap((params: Params) => this.service.getProperty(this.route.params['id']))
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

