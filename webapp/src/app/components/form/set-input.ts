import { Component, ElementRef, Input, Output, forwardRef, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

import * as _ from 'lodash';


// Input that allows input of unique values in a set.
@Component({
  selector: 'rem-set-input',
  template: `
  <div class="d-flex">
    <ul class="d-flex flex-row flex-wrap align-items-center list-unstyled">
      <li *ngFor="let item of value" class="d-flex align-items-center set-item">
        <span>{{ item }}</span>
        <button type="button" class="close" (click)="deleteItem(item)">
          <span aria-hidden="true">&times;</span>
        </button>
      </li>
    </ul>
    <rem-suggestor [provider]="suggestionProvider" (select)="enterValue()">
      <div class="d-flex align-items-center">
        <input #in autofocus ngModel
          type="text"
          class="form-control"
          (keyup.enter)="enterValue(); $event.stopPropagation()" />
        <button type="button" class="add" (click)="enterValue()"><strong>&#x2b;</strong></button>
      </div>
    </rem-suggestor>
  </div>
  `,
  styleUrls: ['./set-input.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SetInputComponent),
      multi: true
    }
  ]
})
export class SetInputComponent<T> implements ControlValueAccessor {
  @Input() placeholder: string;
  // Default to no suggestions
  @Input() suggestionProvider: (string) => Observable<string[]> = (s) => Observable.of();

  @Input() value: Set<T>;
  _onChange: (any) => void;
  _onTouched: () => void;
  isDisabled: boolean;

  @ViewChild(NgControl)
  inputEl: NgControl;

  enterValue() {
    const val = this.inputEl.value;
    this.inputEl.reset();
    if (!val) return;
    if (!this.value) this.value = new Set<T>();

    if (!this.value.has(val)) {
      const newSet = new Set([...Array.from(this.value), val]);
      this.writeValue(newSet);
      this._onChange(newSet);
    }
  }

  writeValue(obj: any): void {
    this.value = obj;
  }

  deleteItem(obj: any): void {
    const setArr = Array.from(this.value);
    const newSet = new Set(_.filter(setArr, i => i !== obj));
    this.writeValue(newSet);
    this._onChange(newSet);
  }

  registerOnChange(fn: any): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }
}
