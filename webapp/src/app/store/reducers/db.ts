import { MongoDoc }   from "app/services/mongo";
import * as models    from "app/models";
import * as dbActions from "app/store/actions/db";

interface FilteredDocs {
  docIds: string[];
  returned: number;
  size: number;
  totalPages: number;
}

interface ModelState<T> {
  fetchInProgress: boolean;
  fetchError: string,
  docs: {[id:string]: MongoDoc<T>};
  queries: {[queryId:string]: FilteredDocs};
}

export interface State {
  users:            ModelState<models.User>;
  properties:       ModelState<models.Property>;
  leases:           ModelState<models.Lease>;
  notes:            ModelState<models.Note>;
  parties:          ModelState<models.Party>;
  media:            ModelState<models.Media>;
  selectedProperty: string | null;
}

const defaultModelState = {fetchInProgress: false, fetchError: null, docs: {}, queries: {}};

export const initialState: State = {
  users:            defaultModelState,
  properties:       defaultModelState,
  leases:           defaultModelState,
  notes:            defaultModelState,
  parties:          defaultModelState,
  media:            defaultModelState,
  selectedProperty: null,
};


export function reducer(state = initialState, action: dbActions.Actions): State {
  const {collection} = action.payload;
  switch (action.type) {
    case dbActions.REQUEST_MANY:
    case dbActions.REQUEST_ONE:
      return {...state, [collection]: {...state[collection], fetchInProgress: true}};

    case dbActions.REQUEST_ONE_SUCCESS:
      const doc = action.payload.doc;
      return {...state, ...{
        [collection]: {
          ...state[collection],
          docs: {...state[collection].docs, [doc._id.$oid]: doc},
        },
      }};

    case dbActions.REQUEST_MANY_SUCCESS:
      const newDocMap = action.payload.docs.reduce((acc, o) => {
        return {...acc, [o._id.$oid]: o};
      }, {});
      return {...state, ...{
        [collection]: {
          ...state[collection],
          docs: {...state[collection].docs, ...newDocMap},
          queries: {...state[collection].queries,
              [action.payload.queryId]: {
                docIds: action.payload.docs.map(d => d._id.$oid),
                size: action.payload.size,
                totalPages: action.payload.totalPages,
              }
          },
        },
      }};

    case dbActions.REQUEST_FAILURE:
      return {...state, ...{
        [collection]: {...state[collection], fetchError: action.payload.error},
      }};
  }
}

