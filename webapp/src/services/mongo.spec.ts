import {ReflectiveInjector} from '@angular/core';
import {async, fakeAsync, tick} from '@angular/core/testing';
import {ConnectionBackend, Http, RequestOptions} from '@angular/http';
import {Response, ResponseOptions} from '@angular/http';
import {MockBackend, MockConnection} from '@angular/http/testing';

import {PropertyService} from './property-service';


describe("PropertyService", () => {
  let service: PropertyService;

  beforeEach(() => {
    this.injector = ReflectiveInjector.resolveAndCreate([
      {provide: ConnectionBackend, useClass: MockBackend},
      Http,
      PropertyService,
    ]);
    this.backend = this.injector.get(ConnectionBackend) as MockBackend;
    this.backend.connections.subscribe((connection: any) => this.lastConnection = connection);

    this.service = this.injector.get(PropertyService);
  });

  it("should get property lists", fakeAsync(() => {
    this.service.getProperties();
    this.lastConnection.mockRespond(new Response(new ResponseOptions({
      body: JSON.stringify({
        "_id": "swamp-tract",
        "_links": {
            "leases": {
                "href": "/rem/leases?filter={'_id':{'$in':[['1','2']]}}"
            },
            "notes": {
                "href": "/rem/notes?filter={'_id':{'$in':[['1','2']]}}"
            }
        },
        "createdDate": {
            "$date": 1485907200000
        },
        "current": {
            "acreage": 120.5,
            "county": "Pender",
            "description": "Tract in the swamp land behind the old highway",
            "leases": [
                "1",
                "2"
            ],
            "modifiedBy": "2",
            "modifiedDate": {
                "$date": 1491004800000
            },
            "name": "Swamp Tract",
            "notes": [
                "1",
                "2"
            ],
            "percentOwned": 100.0,
            "pinNumbers": [
                "123-45-678"
            ],
            "propType": "land",
            "state": "NC"
        },
      }),
    }));
  }));
});
