// tslint:disable:max-classes-per-file
import { ObjectID } from "bson";
import * as React from "react";
import { connect, DispatchProp } from "react-redux";
import { Dispatch } from "redux";

import { ModelUpdate } from "@/model/updates";
import { AppState } from "@/store";
import * as dbActions from "@/store/db/actions";
import { CollectionName, ModelState as DBModelState, State as DBState } from "@/store/db/state";
import { ensureModelPresent } from "@/store/sync/fetch";
import { arraysEqual } from "@/util/arrays";

type UpdateFunc<T> = (updates: Array<ModelUpdate<T>> | ModelUpdate<T>) => void;
interface SingleInstanceProps<T> {
  instance: T;
  onUpdate?: UpdateFunc<T>;
  id?: ObjectID;
}

interface MultipleInstanceProps<T> {
  instances: T[];
  ids?: ObjectID[];
}

export function connectOneModelById<M extends DBState[CollectionName] extends DBModelState<infer S> ? S : never>(
  collection: CollectionName,
  WrappedComponent: React.ComponentType<{ instance: M }>
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
  )(
    class ConnectModelById extends React.Component<SingleInstanceProps<M> & DispatchProp> {
      constructor(props: SingleInstanceProps<M> & DispatchProp) {
        super(props);
        this.ensureModel();
      }

      public componentDidUpdate(prevProps: SingleInstanceProps<M> & DispatchProp) {
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
          ensureModelPresent(this.props.dispatch)(collection, [new ObjectID(this.props.id)]);
        }
      }
    }
  );
}

export function connectMultipleModelsById<M extends DBState[CollectionName] extends DBModelState<infer S> ? S : never>(
  collection: CollectionName,
  WrappedComponent: React.ComponentType<{ instances: M[] }>
) {
  const mapStateToProps = (state: AppState, ownProps: { ids: ObjectID[] }): { instances: M[] } => {
    if (!ownProps.ids || ownProps.ids.length === 0) {
      return { instances: [] };
    }

    const idsAsStrings = ownProps.ids.map(i => i.toString());
    const docs = (state.db[collection] as DBModelState<M>).docs;
    return {
      instances: Object.keys(docs)
        .filter(id => idsAsStrings.includes(id))
        .reduce((acc: M[], id: string) => [...acc, docs[id]], []),
    };
  };

  return connect(mapStateToProps)(
    class ConnectModelsByIds extends React.Component<MultipleInstanceProps<M> & DispatchProp> {
      public static defaultProps = {
        ids: [] as ObjectID[],
      };

      constructor(props: MultipleInstanceProps<M> & DispatchProp) {
        super(props);
        this.ensureModel();
      }

      public componentDidUpdate(prevProps: MultipleInstanceProps<M>) {
        if (arraysEqual(prevProps.ids, this.props.ids)) {
          return;
        }

        this.ensureModel();
      }

      public render() {
        return <WrappedComponent {...this.props} />;
      }

      private ensureModel() {
        if (this.props.ids.length > 0) {
          ensureModelPresent(this.props.dispatch)(collection, this.props.ids.map(i => new ObjectID(i)));
        }
      }
    }
  );
}
