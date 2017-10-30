import { MongoDoc }   from "app/services/mongo";
import * as models    from "app/models";
import * as dbActions from "app/store/actions/db";

export interface QueryResult {
  docIds: string[];
  returned: number;
  size: number;
  totalPages: number;
  inProgress: boolean;
  fetchError: string,
}

export type MongoDocs<T> = {[id:string]: MongoDoc<T>};

export interface ModelState<T> {
  docs: MongoDocs<T>;
  queryResults: {[queryId:string]: QueryResult};
  persistResults: {[id:string]: PersistResult};
}

export interface State {
  users:            ModelState<models.User>;
  properties:       ModelState<models.Property>;
  leases:           ModelState<models.Lease>;
  notes:            ModelState<models.Note>;
  parties:          ModelState<models.Party>;
  media:            ModelState<models.Media>;
}

export interface PersistResult {
  inProgress: boolean;
  error: string;
}

const defaultModelState = {docs: {}, queryResults: {}, persistResults: {}};

export const initialState: State = {
  users:            defaultModelState,
  properties:       defaultModelState,
  leases:           defaultModelState,
  notes:            defaultModelState,
  parties:          defaultModelState,
  media:            defaultModelState,
};


export function reducer(state, action: dbActions.Actions): State {
  const {collection = null} = action.payload || {};
  switch (action.type) {
    case dbActions.REQUEST_MANY:
    case dbActions.REQUEST_ONE:
      return {...state, [collection]: {
        ...state[collection],
        queryResults: {...state[collection].queryResults,
          [action.queryId]: {
            inProgress: true,
            fetchError: null,
          }
        },
      }};

    case dbActions.REQUEST_ONE_SUCCESS:
      let doc = action.payload.doc;
      return {...state, ...{
        [collection]: {
          ...state[collection],
          docs: {...state[collection].docs, [doc._id.$oid]: doc},
          queryResults: {...state[collection].queryResults,
            [action.queryId]: {
              docIds: [doc._id.$oid],
              size: 1,
              totalPages: 1,
              inProgress: false,
              fetchError: null,
            },
          },
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
          queryResults: {...state[collection].queryResults,
              [action.queryId]: {
                docIds: action.payload.docs.map(d => d._id),
                size: action.payload.size,
                totalPages: action.payload.totalPages,
                inProgress: false,
                fetchError: null,
              },
          },
        },
      }};

    case dbActions.REQUEST_FAILURE:
      return {...state, ...{
        [collection]: {
          ...state[collection],
          queryResults: {...state[collection].queryResults,
            [action.queryId]: {
              inProgress: false,
              fetchError: action.payload.error,
            },
          }
        },
      }};

    case dbActions.UPDATE:
      return {...state, ...{
        [collection]: {
          ...state[collection],
          persistResults: {...state[collection].persistResults,
            [action.payload.id.$oid]: {
              inProgress: true,
              error: undefined,
            },
          }
        },
      }};

    case dbActions.PERSIST_SUCCESS:
      doc = action.payload.doc;
      return {...state, ...{
        [collection]: {
          ...state[collection],
          docs: {...state[collection].docs, [doc._id.$oid]: doc},
          persistResults: {...state[collection].persistResults,
            [doc._id.$oid]: {
              inProgress: false,
              error: null,
            },
          }
        },
      }};

    case dbActions.PERSIST_FAILURE:
      return {...state, ...{
        [collection]: {
          ...state[collection],
          persistResults: {...state[collection].persistResults,
            [action.payload.id.$oid]: {
              inProgress: false,
              error: action.payload.error,
            },
          }
        },
      }};
    default:
      return state;
  }
}

