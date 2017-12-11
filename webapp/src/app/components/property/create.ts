import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Property, PropertyType, State } from 'app/models';
import { SuggestorService } from 'app/services/suggestor';
import { markAllControlsTouched } from 'app/util/forms';

@Component({
  selector: 'rem-property-create',
  template: `
  <ng-container>
    <form [formGroup]="form" novalidate>
      <div class="form-group">
        <label><strong>Name</strong></label>
        <input class="form-control" formControlName="name">
        <div class="invalid-feedback">Please enter a name for the property</div>
      </div>
      <div class="form-group">
        <label>Description</label>
        <input class="form-control" formControlName="description">
      </div>
      <div class="form-row">
        <div class="col-md-2">
          <label><strong>Type</strong></label>
          <rem-select formControlName="propType" [choices]="propTypeChoices" placeholder="Select a type"></rem-select>
        </div>
        <div class="col-md-2">
          <label><strong>County</strong></label>
          <rem-suggestor [provider]="suggestor.suggestCounties.bind(suggestor)">
            <input formControlName="county" class="form-control" placeholder="County">
          </rem-suggestor>
          <div class="invalid-feedback">Please enter the county</div>
        </div>
        <div class="col-md-2">
          <label><strong>State</strong></label>
          <rem-select formControlName="state" [choices]="stateChoices" placeholder="State"></rem-select>
        </div>
      </div>
      <div class="form-row">
        <div class="col-md-3">
          <label>PIN Numbers</label>
          <rem-set-input formControlName="pinNumbers"></rem-set-input>
          <small class="form-text text-muted">If you input PIN numbers, details on the property can be looked up and autopopulated</small>
        </div>
      </div>
    </form>
    <small class="form-text text-muted">Fields in <strong>bold</strong> are required.</small>
    <div class="d-flex flex-row py-3">
      <button class="btn btn-sm btn-outline-primary" style="margin-right: 1em;" (click)="submit()">Create</button>
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

  wasValidated: boolean = false;

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
      pinNumbers: [new Set()],
    });
  }

  submit() {
    if (!this.form.valid) {
      markAllControlsTouched(this.form);
      return;
    }
    this.create.emit(this.form.value);
  }
}
