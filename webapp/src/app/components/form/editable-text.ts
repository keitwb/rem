import { Component, ElementRef, Input, Output, EventEmitter, ContentChild } from '@angular/core';
import { NgControl } from '@angular/forms';
import * as _ from 'lodash';

import { TextDirective, FocusDirective } from 'app/directives';

@Component({
  selector: 'rem-editable-text',
  template: `
    <div class="d-flex d-flex-row position-relative" (mouseenter)="showEditButton=true" (mouseleave)="showEditButton=false">
      <div *ngIf="editing"
           class="d-flex flex-row position-absolute" style="z-index:9999;"
           [delayClickOutsideInit]="true"
           (clickOutside)="toggleEditing()"
           (keyup.escape)="toggleEditing()"
           (keyup.enter)="doSave()"
           [class.border-danger]="!!error"
           [style.width]="inputWidth+'px'">
        <ng-content select="[ngModel]"></ng-content>
        <div class="text-danger bg-light p-1" *ngIf="!!error">{{error}}</div>
        <button type="button" class="btn btn-link btn-sm px-0 mx-0" (click)="doSave()">Save</button>
      </div>
      <div class="d-flex flex-row position-relative" *ngIf="!editing">
        <div *ngIf="value">
          <ng-content select="[remText]"></ng-content>
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
  @Input() placeholder: string;
  @Input() validator: TextValidator;
  @Input() valType: "string" | "float" | "integer";
  @Output() edit = new EventEmitter<any>();

  @ContentChild(TextDirective)
  textView: TextDirective

  @ContentChild(NgControl)
  input: NgControl

  @ContentChild(FocusDirective)
  focuser: FocusDirective

  editing: boolean;
  showEditButton: boolean;
  error: string;
  inputWidth: number = 300;
  inputVal: string;

  ngOnChanges() {
    this.updateView();
  }

  ngAfterContentInit() {
    this.updateView();
  }

  updateView() {
    if (this.textView) {
      this.textView.setText(this.value);
      this.inputWidth = Math.max(this.textView.width, 300);
    }
  }

  doSave() {
    const newVal = this.input.value;

    if (this.validator) {
      const [valid, error] = this.validator(newVal);
      if (!valid) {
        this.error = error;
        return;
      }
    }

    var val: any;
    if (!newVal) {
      val = null;
    } else if (this.valType === "float" || this.valType === "integer") {
      const num = _.toNumber(newVal);
      if (this.valType === "integer" && !_.isInteger(num)) {
        this.error = "Input must be a round number";
        return;
      } else if (this.valType === "float" && !_.isFinite(num)) {
        this.error = "Input must be a number";
        return;
      }
      val = num;
    } else {
      val = newVal;
    }

    this.edit.emit(val);
    this.toggleEditing();
  }

  toggleEditing() {
    this.error = null;
    this.editing = !this.editing;
    if (this.editing) {
      this.input.control.setValue(this.value);
      this.focuser.focus();
    }
  }
}

type TextValidator = (string) => [boolean, string];
