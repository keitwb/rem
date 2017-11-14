import { Injectable } from '@angular/core';
import {AppConfig} from 'app/config';
import { Http } from '@angular/http';
import { Observable }                 from 'rxjs/Observable';


@Injectable()
export class SearchClient {
  private baseUrl: URL;

  constructor(private http: Http, private config: AppConfig) {
    this.baseUrl = new URL(config.searchPath, window.location.href);
  }

  query(q: string): Observable<string[]> {
    return Observable.of();
  }
}
