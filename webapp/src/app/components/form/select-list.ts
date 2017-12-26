import { Component, HostListener, EventEmitter, Input, Output } from '@angular/core';

import * as _ from 'lodash';
type ChoiceDisplay = string;

@Component({
  selector: 'rem-select-list',
  template: `
    <div class="position-absolute" *ngIf="choices && show" (clickOutside)="ensureHidden()" [delayClickOutsideInit]="true">
      <ul>
        <li *ngFor="let choice of choices; let last = last; let index = index"
            [class.not-last]="!last"
            [class.active]="index === activeIndex"
            (click)="select(choice[1])"
            (mouseenter)="makeActive(index)">
          {{choice[0]}}
        </li>
      </ul>
    </div>
  `,
  styleUrls: ['./select-list.scss'],
})
export class SelectListComponent<T> {
  @Input() choices: [ChoiceDisplay, T][];
  @Input() value: T;
  @Output() chosen = new EventEmitter<T>();

  activeIndex: number;
  @Input() show: boolean;
  @Output() showChange = new EventEmitter<boolean>();

  ngOnChanges() {
    const idx = _.map(this.choices, c => c[1]).indexOf(this.value);
    this.activeIndex = idx === -1 ? 0 : idx;
  }

  select(val: T) {
    this.value = val;
    this.chosen.emit(val);
  }

  @HostListener('window:keyup.enter', ["$event"])
  selectActive(event) {
    event.stopPropagation();
    if (!this.show) return;
    this.select(this.choices[this.activeIndex][1]);
  }

  @HostListener('window:keyup.arrowdown', ["$event"])
  moveDown(event) {
    event.stopPropagation();
    if (!this.show) return;
    this.activeIndex = Math.min(this.choices.length - 1, this.activeIndex + 1);
  }

  @HostListener('window:keyup.arrowup', ["$event"])
  moveUp(event) {
    event.stopPropagation();
    if (this.activeIndex < 0 || !this.show) {
      return;
    }

    this.activeIndex -= 1;
  }

  @HostListener('window:keyup.esc', ["$event"])
  handleEscape(event) {
    event.stopPropagation();
    if (!this.show) return;
    this.showChange.emit(false);
  }

  makeActive(index: number) {
    this.activeIndex = index;
  }

  ensureHidden() {
    this.showChange.emit(false);
  }
}
