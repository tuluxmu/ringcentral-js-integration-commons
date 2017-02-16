import 'core-js/fn/array/find';
import 'core-js/fn/array/find-index';
import { combineReducers } from 'redux';
import {
  isValidNumber,
} from 'phoneformat.js';
import { getDndStatusReducer } from '../Presence/getPresenceReducer';

import getModuleStatusReducer from '../../lib/getModuleStatusReducer';
import telephonyStatus from '../../enums/telephonyStatus';
import terminationTypes from '../../enums/terminationTypes';
import {
  isEnded,
  isOnHold,
  isInbound,
  isOutbound,
  areTwoLegs,
  sortCallsByStartTime,
} from '../../lib/callLogHelpers';
import isSameLocalNumber from '../../lib/isSameLocalNumber';

export function isIntermediateCall(call = {}) {
  return call.telephonyStatus === telephonyStatus.noCall
    && call.terminationType === terminationTypes.intermediate;
}
export function samePresenceCallAs(targetCall) {
  return call => (
    (call.id === targetCall.id) ||
    (call.from === targetCall.from
      && call.to === targetCall.to
      && call.sessionId === targetCall.sessionId)
  );
}
export function removeDuplicateIntermediateCalls(calls) {
  const resultCalls = [];
  const indexMap = new Map();
  calls.forEach((call) => {
    const isIntermediate = isIntermediateCall(call);
    if (!indexMap.has(call.sessionId)) {
      indexMap.set(call.sessionId, { index: resultCalls.length, isIntermediate });
      resultCalls.push(call);
    } else if (!isIntermediate) {
      const record = indexMap.get(call.sessionId);
      record.isIntermediate = false;
      resultCalls[record.index] = call;
    }
  });
  return resultCalls;
}

export function removeEndedCalls(activeCalls = []) {
  return activeCalls.filter(call => !isEnded(call));
}


export function removeInboundRingOutLegs(calls) {
  const output = [];
  const outbounds = calls.filter(isOutbound);
  calls.filter(isInbound).forEach((inbound) => {
    const outboundIndex = outbounds.findIndex(call => areTwoLegs(inbound, call));
    if (outboundIndex > -1) {
      const outbound = { ...outbounds.splice(outboundIndex, 1).pop() };
      // Handle inboundLeg.from is '+19072028624', but outboundLeg.to is '9072028624'
      // https://jira.ringcentral.com/browse/RCINT-3127
      if (isSameLocalNumber(inbound.from, outbound.to) && isValidNumber(inbound.from)) {
        outbound.to = inbound.from;
      }
      if (isOnHold(inbound)) {
        outbound.telephonyStatus = telephonyStatus.onHold;
      }
      output.push(outbound);
    } else {
      output.push(inbound);
    }
  });
  return output.concat(outbounds);
}

export function processActiveCalls(activeCalls) {
  return removeEndedCalls(
    removeInboundRingOutLegs(
      removeDuplicateIntermediateCalls(activeCalls)));
}

export function getCallsReducer(types) {
  return (state = [], { type, activeCalls, timestamp }) => {
    switch (type) {
      case types.fetchSuccess:
      case types.notification: {
        if (activeCalls) {
          return processActiveCalls(activeCalls).map((activeCall) => {
            const currentCall = state.find(samePresenceCallAs(activeCall));
            if (!currentCall) return { ...activeCall, startTime: timestamp };
            if (isIntermediateCall(activeCall)) return currentCall;
            return { ...currentCall, ...activeCall };
          }).sort(sortCallsByStartTime);
        }
        return state;
      }
      default:
        return state;
    }
  };
}

/* istanbul ignore next: unnecessary to test combineReducers */
export default function getDetailedPresenceReducer(types) {
  return combineReducers({
    status: getModuleStatusReducer(types),
    calls: getCallsReducer(types),
    dndStatus: getDndStatusReducer(types),
  });
}
