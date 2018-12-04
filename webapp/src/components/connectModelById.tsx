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
interface Props<T> {
  instance: T;
  onUpdate?: UpdateFunc<T>;
}

interface IDProp {
  id: string;
}

type AllProps<T> = Props<T> & IDProp & DispatchProp;

export default function connectModelById<M extends DBState[CollectionName] extends DBModelState<infer S> ? S : never>(
  collection: CollectionName,
  component: React.ComponentType<{ instance: M }>
) {
  const mapStateToProps = (state: AppState, ownProps: { id: string }): { instance: M } => {
    return {
      instance: (state.db[collection] as DBModelState<M>).docs[ownProps.id],
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
  )(createWrapped<M>(component, collection));
}

function createWrapped<T extends Model>(WrappedComponent: React.ComponentType<Props<T>>, collection: string) {
  return class ConnectModelById extends React.Component<AllProps<T>> {
    constructor(props: AllProps<T>) {
      super(props);
      this.ensureModel();
    }

    public componentDidUpdate(prevProps: AllProps<T>) {
      if (prevProps.id === this.props.id) {
        return;
      }

      this.ensureModel();
    }

    public render() {
      return <WrappedComponent {...this.props} />;
    }

    private ensureModel() {
      if (!this.props.instance) {
        ensureModelPresent(this.props.dispatch)(collection, new ObjectID(this.props.id));
      }
    }
  };
}
