import { MongoDoc, MongoDate, GridFSDoc, MongoID } from '@/services/mongo';

export type ID = { $oid: string };
export type LeaseType = 'gross' | 'N' | 'NN' | 'NNN' | 'option';
export type TimeUnit = 'months' | 'years' | 'quarters';
export type PropertyType = 'land' | 'commercial' | 'residential';
export type PartyType = 'person' | 'business';
export type State = 'NC' | 'SC';

export interface Model {}

export enum CollectionName { User = 'user' }

export interface User extends MongoDoc {
  username:      string;
  email:         string;
  firstName:     string;
  lastName:      string;
  createdDate:   MongoDate;
}

export enum CollectionName { Note = 'notes' }

export interface Note extends MongoDoc {
  note:          string;
  media:         Media[];
  createdDate:   MongoDate;
  createdBy:     ID;
}

export enum CollectionName { Lease = 'leases' }

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

export enum CollectionName { Property = 'properties' }

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

export enum CollectionName { Party = 'parties' }

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

export enum CollectionName { Media = 'media.files' }

export interface Media extends MongoDoc, GridFSDoc {
  description:   string;
  tags:          string[];
}
