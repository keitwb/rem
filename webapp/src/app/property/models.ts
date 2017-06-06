export interface County {
  name:  String;
  state: String;
}

export interface Lease {
  description: String;
  properties:  Property[];
  startDate:   Date;
  endDate:     Date;
  rate:        String;
  ratePeriod:  String;
  lessees:     Contact[];
  documents:   Document[];
  notes:       Note[];
}

export interface Property {
  id:           Number;
  name:         String;
  description?: String;
  leases?:      Lease[];
  county?:      County;
  acreage?:     Number;
  propType?:    String;
}

export interface Document {
  title:   String;
  url:     String;
  description: String;
  createdDate: Date;
  modifiedDate: Date;
}

export interface Note {
  note:         String;
  createdDate:  Date;
  modifiedDate: Date;
}

export interface Contact {
  name:      String;
  phone?:    String;
  address?:  String;
  city?:     String;
  state?:    String;
  zipcode?:  String;
  notes?:    Note[];
}
