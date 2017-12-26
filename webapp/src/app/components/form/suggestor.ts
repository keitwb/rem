import { Component, Input, ContentChild, Output, EventEmitter } from '@angular/core';
import { NgControl } from '@angular/forms';
import * as _ from 'lodash';

import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/distinct';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/observable/of';

@Component({
  selector: 'rem-suggestor',
  template: `
  <ng-container>
    <ng-content></ng-content>
    <rem-select-list (chosen)="selectSuggestion($event)" [(show)]="show" [choices]="suggestions"></rem-select-list>
  </ng-container>
  `,
})
export class SuggestorComponent {
  @Input() provider: (string) => Observable<string[]>;
  @Output() select = new EventEmitter<string>();

  @ContentChild(NgControl)
  input: NgControl;

  show: boolean;
  suggestions: [string, string][];
  sub: Subscription;

  ngAfterContentInit() {
    if (this.input === undefined) {
      throw new Error("Suggestor content must be a form control");
    }
    this.sub = this.input.valueChanges
      .debounceTime(200)
      .switchMap(v => Observable.combineLatest(Observable.of(v), this.provider(v)))
      .subscribe(([v, ss]) => {
        this.suggestions = _.map<string, [string, string]>(ss, s => [s, s]);
        this.show = !_.some(ss, s => s === v);
      });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  selectSuggestion(val: any) {
    this.input.control.setValue(val);
    this.clearSuggestions();
    this.select.emit(val);
  }

  clearSuggestions() {
    this.show = false;
  }
}
