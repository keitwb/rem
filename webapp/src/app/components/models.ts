export type LeaseType = "gross" | "N" | "NN" | "NNN" | "option";
export type TimeUnit = "months" | "years" | "quarters";
export type PropertyType = "land" | "commercial" | "residential";
export type PartyType = "person" | "business";

export class User {
  static kind = "user";
  id:        string;
  username:  string;
  email:     string;
  firstName: string;
  lastName:  string;
}

export class Note {
  static kind = "note";
  id:           string;
  note:         string;
  media:        Media[];
  createdDate:  Date;
  modifiedDate: Date;
  modifiedBy:   User;
}

export class Lease {
  static kind = "lease";
  id:           string;
  leaseType:    LeaseType;
  description:  string;
  properties:   Property[];
  startDate:    Date;
  termLength:   number;
  termUnit:     TimeUnit;
  rate:         number;
  lessees:      Party[];
  options:      Lease[];
  media:        Media[];
  notes:        Note[];
  createdDate:  Date;
  modifiedDate: Date;
  modifiedBy:   User;
}

export class Property {
  static kind = "property";
  id:                 string;
  name:               string;
  description?:       string;
  leases?:            Lease[];
  county?:            string;
  state?:             string;
  acreage?:           number;
  propType?:          PropertyType;
  owners:             Contact[];
  pinNumbers?:        string[];
  latitude?:          string;
  longitude?:         string;
  boundaryPoints?:    number[];
  desiredRent?:       number;
  desiredSalesPrice?: number;
  tryingToSell?:      boolean;
  contacts?:          Party[];
  notes:              Note[];
  media:              Media[];
  createdDate:        Date;
  modifiedDate:       Date;
  modifiedBy:         User;
}

export class Party {
  static kind = "party";
  id:            string;
  name:          string;
  type:          PartyType;
  subParties     Party[];
  phone?:        string;
  address?:      string;
  city?:         string;
  state?:        string;
  zipcode?:      string;
  notes?:        Note[];
  createdDate?:  Date;
  modifiedDate?: Date;
  modifiedBy?:   User;
}

export class Media {
  static kind = "media";
  id:           string;
  name:         string;
  url:          string;
  description:  string;
  createdDate:  Date;
  modifiedDate: Date;
  modifiedBy:   User;
}

