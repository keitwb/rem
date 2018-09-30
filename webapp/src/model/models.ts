import { ObjectID } from "bson";

export interface MongoDate {
  $date: number;
}

export interface MongoDoc {
  _id: ObjectID;
  _createdDate?: { $date: number };
  _updates?: MongoUpdate[];
}

export type Model = MongoDoc;

export interface GridFSDoc {
  md5: string;
  length: number;
  chunkSize: number;
  filename: string;
  contentType: string;
  uploadDate: MongoDate;
}

interface MongoUpdate {
  type: string;
  update: object;
}

export type LeaseType = "gross" | "N" | "NN" | "NNN" | "option";
export type TimeUnit = "months" | "years" | "quarters";
export type PropertyType = "land" | "commercial" | "residential";
export type PartyType = "person" | "business";
export type State = "NC" | "SC";

export enum CollectionName {
  User = "users",
}

export interface User extends MongoDoc {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  createdDate: MongoDate;
}

export enum CollectionName {
  Note = "notes",
}

export interface Note extends MongoDoc {
  note: string;
  media: Media[];
  createdDate: MongoDate;
  createdBy: ObjectID;
}

export enum CollectionName {
  Lease = "leases",
}

export interface Lease extends MongoDoc {
  leaseType: LeaseType;
  description: string;
  properties: Property[];
  startDate: MongoDate;
  termLength: number;
  termUnit: TimeUnit;
  rate: number;
  lessees: Party[];
  options: Lease[];
  media: Media[];
  notes: Note[];
  createdDate: MongoDate;
  createdBy: ObjectID;
}

export enum CollectionName {
  Property = "properties",
}

export interface Property extends MongoDoc {
  name: string;
  description?: string;
  leases?: ObjectID[];
  county?: string;
  state?: string;
  acreage?: number;
  propType?: PropertyType;
  owners?: ObjectID[];
  pinNumbers?: string[];
  latitude?: string;
  longitude?: string;
  boundaryPoints?: number[];
  desiredRent?: number;
  desiredSalesPrice?: number;
  tryingToSell?: boolean;
  contacts?: ObjectID[];
  notes?: ObjectID[];
  media?: ObjectID[];
  createdDate?: MongoDate;
  modifiedDate?: MongoDate;
  modifiedBy?: User;
}

export enum CollectionName {
  Party = "parties",
}

export interface Party extends MongoDoc {
  name: string;
  type: PartyType;
  subParties: Party[];
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  notes?: Note[];
  createdDate?: MongoDate;
  modifiedDate?: MongoDate;
  modifiedBy?: User;
}

export enum CollectionName {
  Media = "media.files",
}

export interface Media extends MongoDoc, GridFSDoc {
  description: string;
  tags: string[];
}
