import {ReflectiveInjector} from '@angular/core';
import {async, fakeAsync, tick} from '@angular/core/testing';
import {BaseRequestOptions, ConnectionBackend, Http, RequestOptions} from '@angular/http';
import {Response, ResponseOptions} from '@angular/http';
import {MockBackend, MockConnection} from '@angular/http/testing';

import {PropertyService} from './property-service';


describe("PropertyService", () => {
  let service: PropertyService;

  beforeEach(() => {
    this.injector = ReflectiveInjector.resolveAndCreate([
      {provide: ConnectionBackend, useClass: MockBackend},
      {provide: RequestOptions, useClass: BaseRequestOptions},
      Http,
      PropertyService,
    ]);
    this.backend = this.injector.get(ConnectionBackend) as MockBackend;
    this.backend.connections.subscribe((connection: any) => this.lastConnection = connection);

    this.service = this.injector.get(PropertyService);
  });

  it("should get property lists", () => {
    this.service.getProperties();
  });
});
