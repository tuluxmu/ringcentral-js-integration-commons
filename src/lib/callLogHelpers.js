import 'core-js/fn/array/find';
import callDirections from '../enums/callDirections';
import telephonyStatus from '../enums/telephonyStatus';
import terminationTypes from '../enums/terminationTypes';
import isSameLocalNumber from './isSameLocalNumber';

/* call direction helpers */
export function isInbound(call = {}) {
  return call.direction === callDirections.inbound;
}

export function isOutbound(call = {}) {
  return call.direction === callDirections.outbound;
}


/* ringout leg helpers */
export function areTwoLegs(inbound, outbound) {
  return isInbound(inbound)
    && isOutbound(outbound)
    && [1000, 2000, 3000, 4000].indexOf(Math.abs(inbound.sessionId - outbound.sessionId)) > -1
    && ((inbound.from === outbound.to && outbound.from === inbound.to) ||
      (inbound.from === outbound.to && isSameLocalNumber(inbound.to, outbound.from)) ||
      (inbound.to === outbound.from && isSameLocalNumber(inbound.from, outbound.to)) ||
      (inbound.to.name && inbound.to.name === outbound.from.name));
}


/* status helpers */
export function isRinging(call = {}) {
  return call.telephonyStatus === telephonyStatus.ringing;
}

export function hasRingingCalls(calls = []) {
  return !!calls.find(isRinging);
}

export function isEnded(call = {}) {
  return call.telephonyStatus === telephonyStatus.noCall &&
    call.terminationType === terminationTypes.final;
}

export function hasEndedCalls(calls) {
  return !!calls.find(isEnded);
}


export function isOnHold(call = {}) {
  return call.telephonyStatus === telephonyStatus.onHold;
}

/* sort functions */

export function sortBySessionId(a, b) {
  if (a.sessionId === b.sessionId) return 0;
  return a.sessionId > b.sessionId ?
    1 :
    -1;
}
export function sortCallsByStartTime(a, b) {
  if (a.startTime === b.startTime) return 0;
  return a.startTime > b.startTime ?
    -1 :
    1;
}
