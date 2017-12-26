import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'rem-search-result-list',
  template: `
    <ul *ngFor="let res of results">
      <li>
        <div>{{res}}</div>
      </li>
    </ul>
  `
})
export class SearchResultListComponent {
  @Input() results: string[];
  @Output() query = new EventEmitter<string>();

  doQuery(q) {
    this.query.emit(q);
  }
}
