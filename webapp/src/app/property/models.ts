export interface County {
  kind: "county";
  id:    number;
  name:  string;
  state: string;
}

export interface Lease {
  kind: "lease";
  id:          number;
  description: string;
  properties:  Property[];
  startDate:   Date;
  endDate:     Date;
  rate:        string;
  ratePeriod:  string;
  lessees:     Contact[];
  documents:   Document[];
  notes:       Note[];
}

export interface Property {
  kind: "property";
  id:           number;
  name:         string;
  description?: string;
  leases?:      Lease[];
  county?:      County;
  acreage?:     number;
  propType?:    string;
}

export interface Document {
  kind: "document";
  id:           number;
  title:        string;
  url:          string;
  description:  string;
  createdDate:  Date;
  modifiedDate: Date;
}

export interface Note {
  kind: "note";
  id:           number;
  note:         string;
  createdDate:  Date;
  modifiedDate: Date;
}

export interface Contact {
  kind: "contact";
  id:        number;
  name:      string;
  phone?:    string;
  address?:  string;
  city?:     string;
  state?:    string;
  zipcode?:  string;
  notes?:    Note[];
}
