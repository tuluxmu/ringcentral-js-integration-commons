import { combineReducers } from 'redux';
import getModuleStatusReducer from '../../lib/getModuleStatusReducer';
import getDateFrom from '../../lib/getDateFrom';
import { sortCallsByStartTime } from '../../lib/callLogHelpers';

export function getDataReducer(types) {
  return (state = [], { type, records = [], supplementRecords = [], daySpan }) => {
    switch (type) {
      case types.init: {
        const cutOffTime = getDateFrom(daySpan).getTime();
        return state.filter(call => call.startTime > cutOffTime);
      }
      case types.fSyncSuccess:
      case types.iSyncSuccess: {
        const indexMap = new Map();
        const newState = [];
        const cutOffTime = getDateFrom(daySpan).getTime();
        // filter old calls
        state.forEach((call) => {
          if (call.startTime > cutOffTime) {
            indexMap.set(call.id, newState.length);
            newState.push(call);
          }
        });
        // push new records
        records.forEach((call) => {
          if (call.startTime > cutOffTime) {
            if (indexMap.has(call.id)) {
              // replace the current data with new data
              newState[indexMap.get(call.id)] = call;
            } else {
              indexMap.set(call.id, newState.length);
              newState.push(call);
            }
          }
        });
        // push supplement records
        supplementRecords.forEach((call) => {
          if (call.startTime > cutOffTime) {
            if (indexMap.has(call.id)) {
              // replace the current data with new data
              newState[indexMap.get(call.id)] = call;
            } else {
              indexMap.set(call.id, newState.length);
              newState.push(call);
            }
          }
        });
        newState.sort(sortCallsByStartTime);
        return newState;
      }
      case types.resetSuccess:
        return [];
      default:
        return state;
    }
  };
}

export function getTokenReducer(types) {
  return (state = null, { type, syncToken }) => {
    switch (type) {
      case types.iSyncSuccess:
      case types.fSyncSuccess:
        return syncToken;
      case types.resetSuccess:
      case types.clearToken:
        return null;
      default:
        return state;
    }
  };
}

export function getTimestampReducer(types) {
  return (state = null, { type, timestamp }) => {
    switch (type) {
      case types.fSyncSuccess:
      case types.iSyncSuccess:
        return timestamp;
      case types.resetSuccess:
      case types.clearToken:
        return null;
      default:
        return state;
    }
  };
}

/* istanbul ignore next: unnecessary to test getModuleStatusReducer */
export default function getCallLogReducer(types) {
  return combineReducers({
    status: getModuleStatusReducer(types),
  });
}
