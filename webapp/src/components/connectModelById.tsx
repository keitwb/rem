import { ObjectID } from "bson";
import * as React from "react";
import { connect, DispatchProp } from "react-redux";
import { Dispatch } from "redux";

import { Model } from "@/model/models";
import { ModelUpdate } from "@/model/updates";
import { AppState } from "@/store";
import * as dbActions from "@/store/db/actions";
import { CollectionName, ModelState as DBModelState, State as DBState } from "@/store/db/state";
import { ensureModelPresent } from "@/store/sync/fetch";

type UpdateFunc<T> = (updates: Array<ModelUpdate<T>> | ModelUpdate<T>) => void;
interface ComponentProps<T> {
  instance: T;
  onUpdate?: UpdateFunc<T>;
}

export default function connectModelById<M extends DBState[CollectionName] extends DBModelState<infer S> ? S : never>(
  collection: CollectionName,
  id: string,
  component: React.ComponentType<{ instance: M }>
) {
  const mapStateToProps = (state: AppState): { instance: M } => {
    return {
      instance: (state.db[collection] as DBModelState<M>).docs[id],
    };
  };

  return connect(
    mapStateToProps,
    (dispatch: Dispatch) => ({
      dispatch,
      onUpdate: (instance: M, updates: Array<ModelUpdate<M>> | ModelUpdate<M>) => {
        if (!(updates instanceof Array)) {
          updates = [updates];
        }

        return dispatch(dbActions.modifyOne(collection, instance._id, updates));
      },
    }),
    (stateProps, dispatchProps, ownProps) => ({
      ...ownProps,
      ...dispatchProps,
      ...stateProps,
      onUpdate(updates: Array<ModelUpdate<M>> | ModelUpdate<M>) {
        return dispatchProps.onUpdate(stateProps.instance, updates);
      },
    })
  )(createWrapped<M>(component, collection, id));
}

function createWrapped<T extends Model>(
  WrappedComponent: React.ComponentType<ComponentProps<T>>,
  collection: string,
  id: string
) {
  return class ConnectModelById extends React.Component<ComponentProps<T>> {
    constructor(props: DispatchProp & ComponentProps<T>) {
      super(props);
      if (!props.instance) {
        ensureModelPresent(props.dispatch)(collection, new ObjectID(id));
      }
    }

    public render() {
      return <WrappedComponent {...this.props} />;
    }
  };
}
