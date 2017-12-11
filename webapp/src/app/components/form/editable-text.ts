import { Component, ElementRef, Input, Output, EventEmitter, ContentChild, ViewChild, Renderer2 } from '@angular/core';
import { NgControl } from '@angular/forms';
import * as _ from 'lodash';

import {TextDirective} from 'app/directives';

@Component({
  selector: 'rem-editable-text',
  template: `
    <div class="d-flex d-flex-row position-relative" (mouseenter)="showEditButton=true" (mouseleave)="showEditButton=false">
      <div *ngIf="editing" class="d-flex flex-row position-absolute" style="z-index:9999;" [delayClickOutsideInit]="true" (clickOutside)="toggleEditing()">
        <input type="text"
          *ngIf="!textarea"
          class="form-control border"
          alwaysfocus
          [class.border-danger]="!!error"
          [(ngModel)]="inputVal"
          placeholder="{{placeholder}}"
          (keyup.escape)="toggleEditing()"
          (keyup.enter)="doSave()"
          [style.width]="inputWidth+'px'" />
        <textarea
          *ngIf="textarea"
          class="form-control border"
          alwaysfocus
          [class.border-danger]="!!error"
          [(ngModel)]="inputVal"
          placeholder="{{placeholder}}"
          (keyup.escape)="toggleEditing()"
          (keyup.enter)="doSave()"
          [style.width]="inputWidth+'px'"></textarea>
        <div class="text-danger bg-light p-1" *ngIf="!!error">{{error}}</div>
        <button type="button" class="btn btn-link btn-sm px-0 mx-0" (click)="doSave()">Save</button>
      </div>
      <div class="d-flex flex-row position-relative" *ngIf="!editing">
        <div *ngIf="value">
          <ng-content></ng-content>
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
  // Whether to use a textarea or input
  @Input() textarea: boolean = false;
  @Output() edit = new EventEmitter<any>();

  @ContentChild(TextDirective)
  textView: TextDirective


  editing: boolean;
  showEditButton: boolean;
  error: string;
  inputWidth: number = 300;
  inputVal: string;

  constructor(private renderer: Renderer2) {}

  ngOnChanges() {
    this.updateView();
    this.inputVal = String(this.value);
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
    if (this.validator) {
      const [valid, error] = this.validator(this.inputVal);
      if (!valid) {
        this.error = error;
        return;
      }
    }

    var val: any;
    if (!this.inputVal) {
      val = null;
    } else if (this.valType === "float" || this.valType === "integer") {
      const num = _.toNumber(this.inputVal);
      if (this.valType === "integer" && !_.isInteger(num)) {
        this.error = "Input must be a round number";
        return;
      } else if (this.valType === "float" && !_.isFinite(num)) {
        this.error = "Input must be a number";
        return;
      }
      val = num;
    } else {
      val = this.inputVal;
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
