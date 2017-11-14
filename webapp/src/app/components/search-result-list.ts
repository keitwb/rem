import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'rem-search-result-list',
  template: `
    <ul *ngFor="let res of results">
      <li>
        <div>{{res.
  `
})
export class PropertyComponent {
  @Output() query = new EventEmitter<string>();

  doQuery(q) {
    this.query.emit(q);
  }
}
