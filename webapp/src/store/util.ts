import {Payload} from 'vuex';

export type PayloadFactory<T> = (t: T) => T & Payload

// https://github.com/Microsoft/TypeScript/pull/13288 would make this less
// hacky.
export function payloadFactory<T extends {[index: string]: any}>(type_: string): PayloadFactory<T> {
  return (p) => { p["type"] = type_; return <Payload & T>p; }
}

