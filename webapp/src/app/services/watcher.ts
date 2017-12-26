import {Injectable, Inject } from '@angular/core';
import {AppConfig, APP_CONFIG}                                 from 'app/config';

// Connects to the watch stream via WebSocket and updates the store
// accordingly.
@Injectable()
export class WatcherService {
  private ws: WebSocket;

  constructor(@Inject(APP_CONFIG) private config: AppConfig) { }

  connect() {
    this.ws = new WebSocket(this.config.updateStreamURL);
  }
}
