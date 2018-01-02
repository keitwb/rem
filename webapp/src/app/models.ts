import { Observable } from "rxjs/Observable";
import { MongoDoc, MongoDate, GridFSDoc, MongoID } from 'app/services/mongo';

export type ID = { $oid: string };
export type LeaseType = "gross" | "N" | "NN" | "NNN" | "option";
export type TimeUnit = "months" | "years" | "quarters";
export type PropertyType = "land" | "commercial" | "residential";
export type PartyType = "person" | "business";
export type State = "NC" | "SC";

export interface Model {}

export module User {
  export const collection = "users";
}

export interface User extends MongoDoc {
  username:      string;
  email:         string;
  firstName:     string;
  lastName:      string;
  createdDate:   MongoDate;
}

export module Note {
  export const collection = "notes";
}

export interface Note extends MongoDoc {
  note:          string;
  media:         Media[];
  createdDate:   MongoDate;
  createdBy:     ID;
}

export module Lease {
  export const collection = "leases";
}

export interface Lease extends MongoDoc {
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
  createdDate:   MongoDate;
  createdBy:     ID;
}

export module Property {
  export const collection = "properties";
}

export interface Property extends MongoDoc {
  //static collection = "properties";
  name:               string;
  description?:       string;
  leases?:            MongoID[];
  county?:            string;
  state?:             string;
  acreage?:           number;
  propType?:          PropertyType;
  owners?:            MongoID[];
  pinNumbers?:        string[];
  latitude?:          string;
  longitude?:         string;
  boundaryPoints?:    number[];
  desiredRent?:       number;
  desiredSalesPrice?: number;
  tryingToSell?:      boolean;
  contacts?:          MongoID[];
  notes?:             MongoID[];
  media?:             MongoID[];
  createdDate?:       MongoDate;
  modifiedDate?:      MongoDate;
  modifiedBy?:        User;

}

export module Party {
  export const collection = "parties";
}

export interface Party extends MongoDoc {
  //static collection = "parties";
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

export interface Media extends MongoDoc, GridFSDoc {
  description:   string;
  tags:          string[];
}

export type CollectionName = string;
