import { combineReducers } from 'redux';
import getModuleStatusReducer from '../../lib/getModuleStatusReducer';

export function getDndStatusReducer(types) {
  return (state = null, { type, dndStatus = state }) => {
    switch (type) {
      case types.notification:
        return dndStatus;
      case types.fetchSuccess:
        return dndStatus;
      case types.resetSuccess:
        return null;
      default:
        return state;
    }
  };
}

export default function getPresenceReducer(types) {
  return combineReducers({
    status: getModuleStatusReducer(types),
    dndStatus: getDndStatusReducer(types),
  });
}
