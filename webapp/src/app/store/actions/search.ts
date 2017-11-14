import { Action }    from '@ngrx/store';

export const SEARCH = 'Search';
export const SEARCH_COMPLETE = 'Search Complete';
export const SEARCH_FAILURE = 'Search Failed';

export class SearchAction implements Action {
  readonly type = SEARCH;

  constructor(public payload: {query: string}) { }
}

export class SearchCompleteAction implements Action {
  readonly type = SEARCH_COMPLETE;

  constructor(public payload: {results: string[]}) { }
}

export class SearchFailureAction implements Action {
  readonly type = SEARCH_FAILURE;

  constructor(public payload: {error: string}) { }
}


export type Actions = SearchAction | SearchCompleteAction | SearchFailureAction;
