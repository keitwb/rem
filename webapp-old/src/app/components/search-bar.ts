import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'rem-search-bar',
  template: `
    <input type="text" class="form-control" #input placeholder="Search" (keyup.enter)="doQuery(input.value)" />
  `
})
export class SearchBarComponent {
  @Output() query = new EventEmitter<string>();

  doQuery(q) {
    this.query.emit(q);
  }
}
