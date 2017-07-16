import { AppState } from './reducers';

export const getList = (model: string) => (queryId: string) => (state: AppState) => state['db'][model][queryId]
