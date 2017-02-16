import RcModule from '../../lib/RcModule';
import moduleStatus from '../../enums/moduleStatus';
import { sortCallsByStartTime } from '../../lib/callLogHelpers';
import actionTypes from './actionTypes';
import getCallHistoryReducer from './getCallHistoryReducer';

export default class CallHistory extends RcModule {
  constructor({
    detailedPresence,
    callLog,
    activeCalls,
    ...options
  }) {
    super({
      ...options,
      actionTypes,
    });
    this._activeCalls = activeCalls;
    this._callLog = callLog;
    this._detailedPresence = detailedPresence;
    this._reducer = getCallHistoryReducer(this.actionTypes);

    this.addSelector('calls',
      () => this._callLog.calls,
      () => this._activeCalls.calls,
      () => this._detailedPresence.calls,
      (callsFromCallLog, callsFromActiveCalls, callsFromPresence) => {
        const indexMap = {};
        callsFromCallLog.forEach((call) => {
          indexMap[call.sessionId] = true;
        });
        const presentInPresenceCalls = {};
        callsFromPresence.forEach((call) => {
          presentInPresenceCalls[call.sessionId] = true;
        });
        return callsFromActiveCalls
          .filter(call => !indexMap[call.sessionId] && !presentInPresenceCalls[call.sessionId])
          .concat(callsFromCallLog)
          .sort(sortCallsByStartTime);
      }
    );
  }
  _onStateChange = async () => {
    if (
      this._callLog.ready &&
      this._activeCalls.ready &&
      this._detailedPresence.ready &&
      this.pending
    ) {
      this.store.dispatch({
        type: this.actionTypes.init,
      });
      this.store.dispatch({
        type: this.actionTypes.initSuccess,
      });
    } else if (
      (
        !this._callLog.ready ||
        !this._activeCalls.ready ||
        !this._detailedPresence.ready
      ) &&
      this.ready
    ) {
      this.store.dispatch({
        type: this.actionTypes.reset,
      });
      this.store.dispatch({
        type: this.actionTypes.resetSuccess,
      });
    }
  }
  initialize() {
    this.store.subscribe(this._onStateChange);
  }

  get status() {
    return this.state.status;
  }

  get ready() {
    return this.state.status === moduleStatus.ready;
  }

  get pending() {
    return this.state.status === moduleStatus.pending;
  }

  get calls() {
    return this._selectors.calls();
  }
}
