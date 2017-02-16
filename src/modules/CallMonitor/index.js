import 'core-js/fn/array/find';
import RcModule from '../../lib/RcModule';
import moduleStatus from '../../enums/moduleStatus';
import actionTypes from './actionTypes';
import getCallMonitorReducer from './getCallMonitorReducer';
import normalizeNumber from '../../lib/normalizeNumber';

export default class CallMonitor extends RcModule {
  constructor({
    detailedPresence,
    activeCalls,
    activityMatcher,
    contactMatcher,
    regionSettings,
    ...options
  }) {
    super({
      ...options,
      actionTypes,
    });
    this._detailedPresence = detailedPresence;
    this._activeCalls = activeCalls;
    this._contactMatcher = contactMatcher;
    this._activityMatcher = activityMatcher;
    this._regionSettings = regionSettings;
    this._reducer = getCallMonitorReducer(this.actionTypes);
    this.addSelector('calls',
      () => this._detailedPresence.calls,
      () => this._activeCalls.calls,
      () => (this._contactMatcher && this._contactMatcher.ready ?
        this._contactMatcher.cache :
        null),
      () => (this._activityMatcher && this._activityMatcher.ready ?
        this._activityMatcher.cache :
        null),
      (callsFromPresence, callsFromActiveCalls, contactCache, activityCache) => (
        callsFromPresence.map((call) => {
          const activeCall = callsFromActiveCalls.find(item => item.sessionId === call.sessionId);
          const fromNumber = normalizeNumber({
            phoneNumber: call.from,
            countryCode: this._regionSettings.countryCode,
            areaCode: this._regionSettings.areaCode,
          });
          const toNumber = normalizeNumber({
            phoneNumber: call.to,
            countryCode: this._regionSettings.countryCode,
            areaCode: this._regionSettings.areaCode,
          });
          return {
            ...call,
            from: {
              phoneNumber: fromNumber,
            },
            to: {
              phoneNumber: toNumber,
            },
            startTime: (activeCall && activeCall.startTime) || call.startTime,
            fromMatches: (contactCache && contactCache.dataMap[fromNumber]) || [],
            toMatches: (contactCache && contactCache.dataMap[toNumber]) || [],
            activityMatches: (activityCache && activityCache.dataMap[call.sessionId]) || [],
          };
        })
      )
    );

    this.addSelector('uniqueNumbers',
      () => this._detailedPresence.calls,
      () => this._activeCalls.calls,
      (callsFromPresence, callsFromActiveCalls) => {
        const output = [];
        const numberMap = {};
        callsFromPresence.forEach((call) => {
          if (call.from) {
            const number = normalizeNumber({
              phoneNumber: call.from,
              countryCode: this._regionSettings.countryCode,
              areaCode: this._regionSettings.areCode,
            });
            if (!numberMap[number]) {
              output.push(number);
              numberMap[number] = true;
            }
          }
          if (call.to) {
            const number = normalizeNumber({
              phoneNumber: call.to,
              countryCode: this._regionSettings.countryCode,
              areaCode: this._regionSettings.areCode,
            });
            if (!numberMap[number]) {
              output.push(number);
              numberMap[number] = true;
            }
          }
        });
        callsFromActiveCalls.forEach((call) => {
          if (call.from) {
            const number = normalizeNumber({
              phoneNumber: call.from.phoneNumber || call.from.extensionNumber,
              countryCode: this._regionSettings.countryCode,
              areaCode: this._regionSettings.areaCode,
            });
            if (number && !numberMap[number]) {
              output.push(number);
              numberMap[number] = true;
            }
          }
          if (call.to) {
            const number = normalizeNumber({
              phoneNumber: call.to.phoneNumber || call.to.extensionNumber,
              countryCode: this._regionSettings.countryCode,
              areaCode: this._regionSettings.areaCode,
            });
            if (number && !numberMap[number]) {
              output.push(number);
              numberMap[number] = true;
            }
          }
        });
        return output;
      }
    );

    if (this._contactMatcher) {
      this._contactMatcher.addQuerySource({
        getQueriesFn: this._selectors.uniqueNumbers,
        readyCheckFn: () => (
          this._activeCalls.ready &&
          this._detailedPresence.ready &&
          this._regionSettings.ready
        ),
      });
    }
    this.addSelector('sessionIdList',
      () => this._detailedPresence.calls,
      calls => calls.map(call => call.sessionId)
    );
    if (this._activityMatcher) {
      this._activityMatcher.addQuerySource({
        getQueriesFn: this._selectors.sessionIdList,
        readyCheckFn: () => this._detailedPresence.ready,
      });
    }

    this._lastProcessedNumbers = null;
  }

  _onStateChange = async () => {
    if (
      this._detailedPresence.ready &&
      this._activeCalls.ready &&
      this._regionSettings.ready &&
      (!this._contactMatcher || this._contactMatcher.ready) &&
      (!this._activityMatcher || this._activityMatcher.ready) &&
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
        !this._detailedPresence.ready ||
        !this._activeCalls.ready ||
        !this._regionSettings.ready ||
        (this._contactMatcher && !this._contactMatcher.ready) ||
        (this._activityMatcher && !this._activityMatcher.ready)
      ) &&
      this.ready
    ) {
      this.store.dispatch({
        type: this.actionTypes.reset,
      });
      this.store.dispatch({
        type: this.actionTypes.resetSuccess,
      });
    } else if (
      this.ready
    ) {
      const uniqueNumbers = this._selectors.uniqueNumbers();
      if (this._lastProcessedNumbers !== uniqueNumbers) {
        this._lastProcessedNumbers = uniqueNumbers;
        if (this._contactMatcher && this._contactMatcher.ready) {
          this._contactMatcher.triggerMatch();
        }
        if (this._activityMatcher && this._activityMatcher.ready) {
          this._activityMatcher.triggerMatch();
        }
      }
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
