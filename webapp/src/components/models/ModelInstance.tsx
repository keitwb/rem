import { ObjectID } from "bson";

import useModel from "@/components/hooks/useModel";
import { CollectionName, ModelState as DBModelState, State as DBState } from "@/store/db/state";

export default function ModelInstance<M extends DBState[CollectionName] extends DBModelState<infer S> ? S : never>({
  id,
  collection,
  children,
}: {
  id: ObjectID;
  collection: CollectionName;
  children: (instance: M) => JSX.Element;
}) {
  const inst = useModel<M>(collection, id);
  if (inst) {
    return children(inst);
  }
  return null;
}
