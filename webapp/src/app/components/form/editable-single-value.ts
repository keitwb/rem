import { Component, ElementRef, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import * as _ from 'lodash';

@Component({
  selector: 'rem-editable-single-value',
  template: `
    <div (mouseenter)="showEditButton=true" (mouseleave)="showEditButton=false">
      <div *ngIf="editing" (keyup.enter)="save(selectbox.value)">
        <rem-select #selectbox [value]="value" [choices]="valueChoices"></rem-select>
        <button type="button" class="btn btn-link btn-sm px-0 mx-0" (click)="save(selectbox.value)">Save</button>
      </div>
      <div class="d-flex" *ngIf="!editing">
        <div #content [class.border]="showEditButton" style="padding-right: 30px;" *ngIf="!editing">
          <span>{{displayFor(value)}}</span>
        </div>
        <button class="btn btn-link btn-sm px-0 my-0" (click)="toggleEditing()" style="margin-left: -30px;" *ngIf="showEditButton">Edit</button>
      </div>
    </div>
  `,
})
export class EditableSingleValueComponent {
  @Input() value: string;
  @Input() valueChoices: [string, string][];
  @Output() edit = new EventEmitter<any>();

  editing: boolean;
  showEditButton: boolean;

  displayFor(val: string) {
    const match = _.find(this.valueChoices, ([d, v]) => v === val);
    if (match) {
      return match[0];
    }
    throw new Error(`No display value found for ${val}`);
  }

  get selectSize() {
    return Math.min(5, this.valueChoices.length);
  }

  save(value: string) {
    if (this.value !== value) {
      this.edit.emit(value);
    }
    this.toggleEditing();
  }

  toggleEditing() {
    this.editing = !this.editing;
  }
}
