import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Property, PropertyType } from 'app/models';

@Component({
  selector: 'rem-property-create',
  template: `
  <ng-container>
    <form [formGroup]="form" noValidate>
      <div class="form-group">
        <label class="center-block">Name:
          <input class="form-control" formControlName="name">
        </label>
      </div>
      <div class="form-group">
        <label class="center-block">Description:
          <input class="form-control" formControlName="description">
        </label>
      </div>
      <div class="form-group">
        <label class="center-block">Type:
          <rem-select formControlName="propType" [choices]="propTypeChoices" placeholder="Select a type"></rem-select>
        </label>
      </div>
      <div class="row">
        <div class="col-md-3">
          <label>County:</label>
          <input formControlName="county" class="form-control" placeholder="County">
        </div>
        <div class="col-md-3">
          <label>State:</label>
          <input formControlName="state" class="form-control" placeholder="State">
        </div>
      </div>
    </form>
    <div class="d-flex flex-row">
      <button [disabled]="form.status != 'VALID'" class="btn btn-sm btn-outline-primary" (click)="submit()">Create</button>&nbsp;
      <button routerLink="/properties" class="btn btn-sm btn-outline-secondary">Back</button>
    </div>
    <div class="text-danger">{{error}}</div>
    {{this.form.value | json}}
  </ng-container>
  `,
  styles: [` `]
})
export class PropertyCreateComponent {
  form: FormGroup;

  @Input() error: string;
  @Output() create = new EventEmitter<Property>();

  propTypeChoices: [[string, PropertyType]] = [["Land", "land"], ["Residential", "residential"], ["Commercial", "commercial"]];

  constructor(private fb: FormBuilder) {
    this.createForm();
  }

  createForm() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: '',
      propType: ['', Validators.required],
      county: ['', Validators.required],
      state: ['', Validators.required],
    });
  }

  submit() {
    this.create.emit(this.form.value);
  }
}
