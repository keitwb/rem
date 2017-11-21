import { Component, ElementRef, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import * as _ from 'lodash';

@Component({
  selector: 'rem-editable-text',
  template: `
    <div class="d-flex d-flex-row position-relative" (mouseenter)="showEditButton=true" (mouseleave)="showEditButton=false">
      <div *ngIf="editing" class="d-flex flex-row position-absolute" style="z-index:9999;" [delayClickOutsideInit]="true" (clickOutside)="toggleEditing()">
        <input type="text"
          class="form-control border"
          alwaysfocus
          [class.border-danger]="!!error"
          value="{{value}}"
          placeholder="{{placeholder}}"
          (keyup.escape)="toggleEditing()"
          (keyup.enter)="doSave(textinput.value)"
          style="width: 300px"
          #textinput />
        <div class="text-danger bg-light p-1" *ngIf="!!error">{{error}}</div>
        <button type="button" class="btn btn-link btn-sm px-0 mx-0" (click)="doSave(textinput.value)">Save</button>
      </div>
      <div class="d-flex flex-row position-relative" *ngIf="!editing">
        <div *ngIf="value">
          <h3 *ngIf="elm=='h3'">{{value}}</h3>
          <span *ngIf="elm=='span' || !elm">{{value}}</span>
        </div>
        <div *ngIf="showEditButton" class="position-absolute border w-100 h-100"></div>
        <button class="btn btn-link btn-sm px-0 py-0 my-0 position-absolute" style="z-index: 9999; background-color:rgba(255,255,255,0.8); top: 0;" [style.transform]="this.value || this.placeholder ? 'translateY(-100%)' : ''" (click)="toggleEditing()" *ngIf="showEditButton || (!value && !placeholder)">Edit</button>
        <div class="font-italic text-muted" *ngIf="!value && placeholder">{{placeholder}}</div>
      </div>
    </div>
  `,
})
export class EditableTextComponent<T> {
  @Input() value: T;
  @Input() elm: string;
  @Input() placeholder: string;
  @Input() validator: TextValidator;
  @Input() valType: "string" | "float" | "integer";
  @Output() edit = new EventEmitter<any>();

  @ViewChild('textinput') input: ElementRef;

  editing: boolean;
  showEditButton: boolean;
  error: string;

  doSave(text: string) {
    if (this.validator) {
      const [valid, error] = this.validator(text);
      if (!valid) {
        this.error = error;
        return;
      }
    }

    var val: any;
    if (text.length == 0) {
      val = null;
    } else if (this.valType === "float" || this.valType === "integer") {
      const num = _.toNumber(text);
      if (this.valType === "integer" && !_.isInteger(num)) {
        this.error = "Input must be a round number";
        return;
      } else if (this.valType === "float" && !_.isFinite(num)) {
        this.error = "Input must be a number";
        return;
      }
      val = num;
    } else {
      val = text;
    }

    this.edit.emit(val);
    this.toggleEditing();
  }

  toggleEditing() {
    this.error = null;
    this.editing = !this.editing;
  }
}

type TextValidator = (string) => [boolean, string];
