import { Injectable, Inject } from '@angular/core';
import {AppConfig, APP_CONFIG} from 'app/config';
import { Http } from '@angular/http';
import { Observable }                 from 'rxjs/Observable';


@Injectable()
export class SearchClient {
  private baseUrl: URL;

  constructor(private http: Http, @Inject(APP_CONFIG) private config: AppConfig) {
    this.baseUrl = new URL(config.searchURL);
  }

  query(q: string): Observable<string[]> {
    return Observable.of();
  }
}
