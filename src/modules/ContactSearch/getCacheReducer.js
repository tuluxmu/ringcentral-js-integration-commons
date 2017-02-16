import { combineReducers } from 'redux';

export function getContactSearchReducer(types) {
  return (state = {}, { type, entities, sourceName, searchString }) => {
    const data = {};
    let key = null;
    switch (type) {
      case types.save:
        key = JSON.stringify([sourceName, searchString]);
        data[key] = {
          entities,
          timestamp: Date.now(),
        };
        return {
          ...state,
          ...data,
        };
      case types.initSuccess:
      case types.cleanUp:
        return {};
      default:
        return state;
    }
  };
}

export default function getCacheReducer(types) {
  return combineReducers({
    contactSearch: getContactSearchReducer(types),
  });
}
