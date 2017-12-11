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

export type MongoDocs<T extends MongoDoc> = {[id:string]: T};

export interface ModelState<T extends MongoDoc> {
  docs: MongoDocs<T>;
  queryResults: {[queryId:string]: QueryResult};
  updateResults: {[id:string]: PersistResult};
  createResults: {[createId:string]: CreateResult};
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

export interface CreateResult extends PersistResult {
  docId: string;
}

const defaultModelState = {docs: {}, queryResults: {}, updateResults: {}, createResults: {}};

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



    case dbActions.CREATE:
      return {...state, ...{
        [collection]: {
          ...state[collection],
          createResults: {...state[collection].createResults,
            inProgress: true,
            error: undefined,
          },
        },
      }};

    case dbActions.CREATE_SUCCESS:
      return {...state, ...{
        [collection]: {
          ...state[collection],
          docs: {...state[collection].docs, [action.payload.doc._id.$oid]: doc},
          createResults: {...state[collection].createResults,
            [action.payload.createId]: {
              inProgress: false,
              error: null,
              docId: action.payload.doc._id.$oid,
            },
          }
        },
      }};

    case dbActions.CREATE_FAILURE:
      return {...state, ...{
        [collection]: {
          ...state[collection],
          createResults: {...state[collection].createResults,
            [action.payload.createId]: {
              inProgress: false,
              error: action.payload.error,
              docId: undefined,
            },
          }
        },
      }};





    case dbActions.UPDATE:
      return {...state, ...{
        [collection]: {
          ...state[collection],
          updateResults: {...state[collection].updateResults,
            [action.payload.id.$oid]: {
              inProgress: true,
              error: undefined,
            },
          }
        },
      }};

    case dbActions.UPDATE_SUCCESS:
      doc = action.payload.doc;
      return {...state, ...{
        [collection]: {
          ...state[collection],
          docs: {...state[collection].docs, [doc._id.$oid]: doc},
          updateResults: {...state[collection].updateResults,
            [doc._id.$oid]: {
              inProgress: false,
              error: null,
            },
          }
        },
      }};

    case dbActions.UPDATE_FAILURE:
      return {...state, ...{
        [collection]: {
          ...state[collection],
          updateResults: {...state[collection].updateResults,
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

