import { combineReducers } from 'redux';
import getModuleStatusReducer from '../getModuleStatusReducer';

export function getDefaultDataReducer(types) {
  return (state = null, { type, data }) => {
    if (type === types.fetchSuccess) return data;
    return state;
  };
}

export function getDefaultTimestampReducer(types) {
  return (state = null, { type, timestamp }) => {
    if (type === types.fetchSuccess) return timestamp;
    return state;
  };
}

export default function getDataFetcherReducer(types, reducers = {}) {
  return combineReducers({
    ...reducers,
    status: getModuleStatusReducer(types),
  });
}
