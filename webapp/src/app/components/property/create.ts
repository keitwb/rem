import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Property, PropertyType, State } from 'app/models';
import { SuggestorService } from 'app/services/suggestor';

@Component({
  selector: 'rem-property-create',
  template: `
  <ng-container>
    <form [formGroup]="form" noValidate>
      <div class="form-group">
        <label>Name</label>
        <input class="form-control" formControlName="name">
      </div>
      <div class="form-group">
        <label>Description</label>
        <input class="form-control" formControlName="description">
      </div>
      <div class="form-group">
        <label>Type</label>
        <rem-select formControlName="propType" [choices]="propTypeChoices" placeholder="Select a type"></rem-select>
      </div>
      <div class="form-row">
        <div class="col-md-6">
          <label>County</label>
          <input formControlName="county" suggestions="suggestor.suggestCounties" class="form-control" placeholder="County">
        </div>
        <div class="col-md-6">
          <label>State</label>
          <rem-select formControlName="state" [choices]="stateChoices" placeholder="State"></rem-select>
        </div>
      </div>
    </form>
    <div class="d-flex flex-row py-3">
      <button [disabled]="form.status != 'VALID'" class="btn btn-sm btn-outline-primary" style="margin-right: 1em;" (click)="submit()">Create</button>
      <button routerLink="/properties" class="btn btn-sm btn-outline-secondary">Back</button>
    </div>
    <div class="text-danger">{{error}}</div>
    {{this.form.value | json}}
  </ng-container>
  `,
  styles: [`
  `]
})
export class PropertyCreateComponent {
  form: FormGroup;

  @Input() error: string;
  @Output() create = new EventEmitter<Property>();

  propTypeChoices: [[string, PropertyType]] = [["Land", "land"], ["Residential", "residential"], ["Commercial", "commercial"]];
  stateChoices: [[string, State]] = [["North Carolina", "NC"], ["South Carolina", "SC"]];

  constructor(private fb: FormBuilder, private suggestor: SuggestorService) {
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
