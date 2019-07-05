import { ObjectID } from "bson";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { AppState } from "@/store";
import { CollectionName, ModelState as DBModelState, State as DBState } from "@/store/db/state";
import { ensureModelPresent } from "@/store/sync/fetch";

function isStringArray(list: ObjectID[] | string[]): list is string[] {
  return list && list.length && typeof list[0] === "string";
}

export default function useModelList<M extends DBState[CollectionName] extends DBModelState<infer S> ? S : never>(
  collection: CollectionName,
  ids: ObjectID[] | string[]
): M[] {
  if (!ids) {
    ids = [];
  }
  if (isStringArray(ids)) {
    ids = ids.map<ObjectID>(id => new ObjectID(id));
  }

  const dispatch = useDispatch();

  useEffect(() => {
    ensureModelPresent(dispatch)(collection, (ids as ObjectID[]).map(id => new ObjectID(id)));
  }, ids);
  const model = useSelector<AppState, M[]>(state => {
    const docs = (state.db[collection] as DBModelState<M>).docs;
    return (ids as ObjectID[]).map(id => docs[id.toString()]).filter(d => !!d);
  });

  return model;
}
