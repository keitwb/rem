import { ObjectID } from "bson";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { AppState } from "@/store";
import { CollectionName, ModelState as DBModelState, State as DBState } from "@/store/db/state";
import { ensureModelPresent } from "@/store/sync/fetch";

export default function useModel<M extends DBState[CollectionName] extends DBModelState<infer S> ? S : never>(
  collection: CollectionName,
  id: ObjectID
): M {
  const dispatch = useDispatch();
  useEffect(() => {
    ensureModelPresent(dispatch)(collection, [id]);
  }, [id]);
  const model = useSelector<AppState, M>(state => (state.db[collection] as DBModelState<M>).docs[id.toString()]);

  return model;
}
