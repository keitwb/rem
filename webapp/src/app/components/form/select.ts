import { Component, ElementRef, Input, Output, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import * as _ from 'lodash';

type ChoiceDisplay = string;

@Component({
  selector: 'rem-select',
  template: `
  <div>
    <div (click)="toggleChoices()" class="toggle">{{displayTextFor(value)}}</div>
    <div class="position-absolute" id="choices" *ngIf="showChoices" [delayClickOutsideInit]="true" (clickOutside)="toggleChoices()">
      <ul>
        <li *ngFor="let choice of choices; let last = last" class="border" [class.border-bottom-0]="!last" (click)="select(choice[1])">{{choice[0]}}</li>
      </ul>
    </div>
  </div>
  `,
  styleUrls: ['./select.scss'],
  providers: [
    { 
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true
    }
  ]
})
export class SelectComponent<T> implements ControlValueAccessor {
  @Input() choices: [[ChoiceDisplay, T]];
  @Input() placeholder: string;

  value: T;
  _onChange: (any) => void;
  _onTouched: () => void;
  isDisabled: boolean;

  showChoices: boolean;

  select(val: T) {
    this.writeValue(val);
    this._onChange(val);
    this.toggleChoices();
  }

  displayTextFor(val: T) {
    if (!val) {
      return this.placeholder || '';
    }

    const choice = _.find(this.choices, c => c[1] === val);
    if (!choice) {
      console.error(`Value ${val} not found in choices ${this.choices}`);
    }
    return choice[0];
  }

  toggleChoices() {
    this.showChoices = !this.showChoices;
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
