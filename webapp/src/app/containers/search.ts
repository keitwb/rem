import { Component } from '@angular/core';
import { Store } from '@ngrx/store';

import { SearchAction } from 'app/store/actions/search';
import { AppState }   from 'app/store/reducers';
import * as selectors from 'app/store/selectors';

@Component({
  selector: 'rem-search',
  template: `
    <rem-search-bar (query)="search($event)">
  `
})
export class SearchComponent {
  constructor(private store: Store<AppState>) { }

  search(query: string) {
    this.store.dispatch(new SearchAction({
      query
    }));
  }
}
