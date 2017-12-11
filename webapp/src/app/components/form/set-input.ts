import { Component, ElementRef, Input, Output, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

import * as _ from 'lodash';


// Input that allows input of unique values in a set.
@Component({
  selector: 'rem-set-input',
  template: `
  <div>
    <ul class="list-group">
      <li *ngFor="let item of value" class="list-group-item">{{ item }}</li>
    </ul>
    <rem-suggestor *ngIf="inputActive" [provider]="suggestionProvider">
      <input #in type="text" class="form-control" ngModel (keyup.enter)="enterValue(in.value); in.value=''" />
    </rem-suggestor>
    <div (click)="showInput()">&#x2b;</div>
  </div>
  `,
  //styleUrls: ['./set-input.scss'],
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
  inputActive: boolean;

  enterValue(val: T) {
    if (!this.value) this.value = new Set<T>();

    if (!this.value.has(val)) {
      const newSet = new Set([val, ...Array.from(this.value)]);
      this.writeValue(newSet);
      this._onChange(newSet);
    }
    this.hideInput();
  }

  showInput() {
    this.inputActive = true;
  }

  hideInput() {
    this.inputActive = false;
  }

  writeValue(obj: any): void {
    this.value = obj;
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
