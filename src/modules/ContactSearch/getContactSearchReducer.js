import { combineReducers } from 'redux';
import getModuleStatusReducer from '../../lib/getModuleStatusReducer';
import contactSearchStatus from './contactSearchStatus';

export function getContactSearchStatusReducer(types) {
  return (state = contactSearchStatus.idle, { type }) => {
    switch (type) {
      case types.search:
        return contactSearchStatus.searching;

      case types.prepareSearch:
      case types.searchSuccess:
      case types.searchError:
        return contactSearchStatus.idle;

      default:
        return state;
    }
  };
}

export function getSearchingReducer(types) {
  const initialState = { searchString: '', result: [] };
  return (state = initialState, { type, searchString, entities }) => {
    switch (type) {
      case types.searchSuccess:
        if (state.searchString === searchString) {
          return {
            ...state,
            result: state.result.concat(entities)
          };
        }
        return {
          searchString,
          result: entities
        };
      case types.prepareSearch:
      case types.reset:
      case types.searchError:
        return initialState;
      case types.search:
      default:
        return state;
    }
  };
}

export default function getContactSearchReducer(types) {
  return combineReducers({
    status: getModuleStatusReducer(types),
    searchStatus: getContactSearchStatusReducer(types),
    searching: getSearchingReducer(types),
  });
}
