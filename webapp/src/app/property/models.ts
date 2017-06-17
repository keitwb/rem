
export interface Note {
  kind: "note";
  id:           string;
  note:         string;
  createdDate:  Date;
  modifiedDate: Date;
}

export interface Lease {
  kind: "lease";
  id:           string;
  description:  string;
  properties:   Property[];
  startDate:    Date;
  endDate:      Date;
  rate:         string;
  ratePeriod:   string;
  lessees:      Contact[];
  documents:    Document[];
  notes:        Note[];
  createdDate:  Date;
  modifiedDate: Date;
}

export interface Property {
  kind: "property";
  id:                 string;
  name:               string;
  description?:       string;
  leases?:            Lease[];
  county?:            string;
  state?:             string;
  acreage?:           number;
  propType?:          string;
  percentOwned?:      number;
  pinNumbers?:        string[];
  latitude?:          string;
  longitude?:         string;
  boundaryPoints?:    number[];
  desiredRent?:       number;
  desiredSalesPrice?: number;
  tryingToSell?:      boolean;
  notes:              Note[];
  createdDate:        Date;
  modifiedDate:       Date;
}

export interface Document {
  kind: "document";
  id:           string;
  title:        string;
  url:          string;
  description:  string;
  createdDate:  Date;
  modifiedDate: Date;
}

export interface Contact {
  kind: "contact";
  id:        string;
  name:      string;
  phones?:   string[];
  address?:  string;
  city?:     string;
  state?:    string;
  zipcode?:  string;
  notes?:    Note[];
}
