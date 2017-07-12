import { Observable } from "rxjs/Observable";

export type MongoDate = { $date: number }
export type LeaseType = "gross" | "N" | "NN" | "NNN" | "option";
export type TimeUnit = "months" | "years" | "quarters";
export type PropertyType = "land" | "commercial" | "residential";
export type PartyType = "person" | "business";

export module User {
  export const collection = "users";
}

export interface User {
  //static collection = "users";
  id:            string;
  username:      string;
  email:         string;
  firstName:     string;
  lastName:      string;
  createdDate?:  MongoDate;
  modifiedDate?: MongoDate;
  modifiedBy?:   User;
}

export module Note {
  export const collection = "notes";
}

export interface Note {
  //static collection = "notes";
  id:            string;
  note:          string;
  media:         Media[];
  createdDate?:  MongoDate;
  modifiedDate?: MongoDate;
  modifiedBy?:   User;
}

export module Lease {
  export const collection = "leases";
}

export interface Lease {
  id:            string;
  leaseType:     LeaseType;
  description:   string;
  properties:    Property[];
  startDate:     MongoDate;
  termLength:    number;
  termUnit:      TimeUnit;
  rate:          number;
  lessees:       Party[];
  options:       Lease[];
  media:         Media[];
  notes:         Note[];
  createdDate?:  MongoDate;
  modifiedDate?: MongoDate;
  modifiedBy?:   User;
}

export module Property {
  export const collection = "properties";
}

export interface Property {
  //static collection = "properties";
  id:                 string;
  name:               string;
  description?:       string;
  leases?:            Observable<Lease[]>;
  county?:            string;
  state?:             string;
  acreage?:           number;
  propType?:          PropertyType;
  owners?:            Observable<Party[]>;
  pinNumbers?:        string[];
  latitude?:          string;
  longitude?:         string;
  boundaryPoints?:    number[];
  desiredRent?:       number;
  desiredSalesPrice?: number;
  tryingToSell?:      boolean;
  contacts?:          Observable<Party[]>;
  notes?:             Observable<Note[]>;
  media?:             Observable<Media[]>;
  createdDate?:       MongoDate;
  modifiedDate?:      MongoDate;
  modifiedBy?:        User;

}

export module Party {
  export const collection = "parties";
}

export interface Party {
  //static collection = "parties";
  id:            string;
  name:          string;
  type:          PartyType;
  subParties:    Party[];
  phone?:        string;
  address?:      string;
  city?:         string;
  state?:        string;
  zipcode?:      string;
  notes?:        Note[];
  createdDate?:  MongoDate;
  modifiedDate?: MongoDate;
  modifiedBy?:   User;
}

export module Media {
  export const collection = "media.files";
}

export interface Media {
  //static collection = "media.files";
  id:            string;
  name:          string;
  url:           string;
  description:   string;
  createdDate?:  MongoDate;
  modifiedDate?: MongoDate;
  modifiedBy?:   User;
}

