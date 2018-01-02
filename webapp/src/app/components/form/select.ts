import { Component, ElementRef, Input, Output, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import * as _ from 'lodash';

type ChoiceDisplay = string;

@Component({
  selector: 'rem-select',
  template: `
  <div class="top" tabindex="0" (blur)="ensureHidden()" (focus)="ensureShowing($event)">
    <div class="toggle" (click)="ensureShowing($event)">{{displayText}}</div>
    <rem-select-list (chosen)="select($event)" [value]="value" [choices]="choices" [(show)]="showChoices"></rem-select-list>
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
  @Input() choices: [ChoiceDisplay, T][];
  @Input() placeholder: string;

  @Input() value: T;
  _onChange: (any) => void;
  _onTouched: () => void;
  isDisabled: boolean;

  showChoices: boolean;

  select(val: T) {
    this.writeValue(val);
    if (this._onChange) this._onChange(val);
    this.ensureHidden();
  }

  get displayText() {
    if (!this.value) {
      return this.placeholder || '';
    }

    const choice = _.find(this.choices, c => c[1] === this.value);
    if (!choice) {
      console.error(`Value ${this.value} not found in choices ${this.choices}`);
    }
    return choice[0];
  }

  toggleChoices() {
    if (this._onTouched) this._onTouched();
    this.showChoices = !this.showChoices;
  }

  ensureShowing($event) {
    console.log("focus");
    if (!this.showChoices) {
      this.toggleChoices();
    }
    if ($event) $event.stopPropagation();
  }

  ensureHidden() {
    console.log("blur");
    if (this.showChoices) {
      this.toggleChoices();
    }
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
