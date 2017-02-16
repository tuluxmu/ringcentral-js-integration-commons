import SDK from 'ringcentral';
import RingCentralClient from 'ringcentral-client';
import { combineReducers, createStore } from 'redux';
import React from 'react';
import ReactDOM from 'react-dom';
import { connect, Provider } from 'react-redux';
import JSONTree from 'react-json-tree';

import RcModule from '../src/lib/RcModule';

import AccountExtension from '../src/modules/AccountExtension';
import AccountInfo from '../src/modules/AccountInfo';
import ActiveCalls from '../src/modules/ActiveCalls';
import Alert from '../src/modules/Alert';
import Auth from '../src/modules/Auth';
import BlockedNumber from '../src/modules/BlockedNumber';
import Brand from '../src/modules/Brand';
import Call from '../src/modules/Call';
import CallHistory from '../src/modules/CallHistory';
import CallingSettings from '../src/modules/CallingSettings';
import CallMonitor from '../src/modules/CallMonitor';
import CallLog from '../src/modules/CallLog';
import ConnectivityMonitor from '../src/modules/ConnectivityMonitor';
import DetailedPresence from '../src/modules/DetailedPresence';
import DialingPlan from '../src/modules/DialingPlan';
import Environment from '../src/modules/Environment';
import ExtensionInfo from '../src/modules/ExtensionInfo';
import ExtensionPhoneNumber from '../src/modules/ExtensionPhoneNumber';
import ForwardingNumber from '../src/modules/ForwardingNumber';
import GlobalStorage from '../src/modules/GlobalStorage';
import Locale from '../src/modules/Locale';
import Presence from '../src/modules/Presence';
import RateLimiter from '../src/modules/RateLimiter';
import RegionSettings from '../src/modules/RegionSettings';
import Ringout from '../src/modules/Ringout';
import RolesAndPermissions from '../src/modules/RolesAndPermissions';
import Softphone from '../src/modules/Softphone';
import Storage from '../src/modules/Storage';
import Subscription from '../src/modules/Subscription';
import TabManager from '../src/modules/TabManager';
import NumberValidate from '../src/modules/NumberValidate';
import MessageSender from '../src/modules/MessageSender';
import ComposeText from '../src/modules/ComposeText';
import ContactSearch from '../src/modules/ContactSearch';
import MessageStore from '../src/modules/MessageStore';
import Conversation from '../src/modules/Conversation';
import Messages from '../src/modules/Messages';

import config from './config';

const DemoView = connect(state => ({
  data: state,
  invertTheme: false,
}), () => ({
  shouldExpandNode: (keyName, data, level) => level < 2,
}))(JSONTree);

class DemoPhone extends RcModule {
  constructor() {
    super();
    this.addModule('client', new RingCentralClient(new SDK({
      ...config.api,
      clearCacheOnRefreshError: false,
    })));
    this.addModule('alert', new Alert({
      getState: () => this.state.alert,
    }));
    this.addModule('brand', new Brand({
      id: '1210',
      name: 'RingCentral',
      fullName: 'RingCentral',
      getState: () => this.state.brand,
    }));
    this.addModule('locale', new Locale({
      getState: () => this.state.locale,
    }));
    this.addModule('tabManager', new TabManager({
      getState: () => this.state.tabManager,
    }));
    this.addModule('globalStorage', new GlobalStorage({
      getState: () => this.state.globalStorage,
    }));
    this.addModule('environment', new Environment({
      client: this.client,
      globalStorage: this.globalStorage,
      sdkConfig: {
        ...config.api,
      },
      getState: () => this.state.environment,
    }));
    this.addModule('connectivityMonitor', new ConnectivityMonitor({
      alert: this.alert,
      client: this.client,
      environment: this.environment,
      getState: () => this.state.connectivityMonitor,
    }));
    this.addModule('auth', new Auth({
      alert: this.alert,
      brand: this.brand,
      client: this.client,
      environment: this.environment,
      locale: this.locale,
      tabManager: this.tabManager,
      getState: () => this.state.auth,
    }));
    this.addModule('storage', new Storage({
      auth: this.auth,
      getState: () => this.state.storage,
    }));
    this.addModule('rateLimiter', new RateLimiter({
      alert: this.alert,
      client: this.client,
      environment: this.environment,
      globalStorage: this.globalStorage,
      getState: () => this.state.rateLimiter,
    }));
    this.addModule('softphone', new Softphone({
      brand: this.brand,
    }));
    this.addModule('ringout', new Ringout({
      auth: this.auth,
      client: this.client,
      getState: () => this.state.ringout,
    }));
    this.addModule('accountInfo', new AccountInfo({
      auth: this.auth,
      client: this.client,
      storage: this.storage,
      tabManager: this.tabManager,
      getState: () => this.state.accountInfo,
    }));
    this.addModule('extensionInfo', new ExtensionInfo({
      auth: this.auth,
      client: this.client,
      storage: this.storage,
      tabManager: this.tabManager,
      getState: () => this.state.extensionInfo,
    }));
    this.addModule('rolesAndPermissions', new RolesAndPermissions({
      auth: this.auth,
      client: this.client,
      storage: this.storage,
      extensionInfo: this.extensionInfo,
      tabManager: this.tabManager,
      getState: () => this.state.rolesAndPermissions,
    }));
    this.addModule('dialingPlan', new DialingPlan({
      auth: this.auth,
      client: this.client,
      storage: this.storage,
      tabManager: this.tabManager,
      getState: () => this.state.dialingPlan,
    }));
    this.addModule('extensionPhoneNumber', new ExtensionPhoneNumber({
      auth: this.auth,
      client: this.client,
      storage: this.storage,
      tabManager: this.tabManager,
      getState: () => this.state.extensionPhoneNumber,
    }));
    this.addModule('forwardingNumber', new ForwardingNumber({
      auth: this.auth,
      client: this.client,
      storage: this.storage,
      tabManager: this.tabManager,
      getState: () => this.state.forwardingNumber,
    }));
    this.addModule('blockedNumber', new BlockedNumber({
      auth: this.auth,
      client: this.client,
      storage: this.storage,
      tabManager: this.tabManager,
      getState: () => this.state.blockedNumber,
    }));
    this.addModule('regionSettings', new RegionSettings({
      storage: this.storage,
      extensionInfo: this.extensionInfo,
      dialingPlan: this.dialingPlan,
      alert: this.alert,
      tabManager: this.tabManager,
      getState: () => this.state.regionSettings,
    }));
    this.addModule('callingSettings', new CallingSettings({
      alert: this.alert,
      brand: this.brand,
      extensionInfo: this.extensionInfo,
      extensionPhoneNumber: this.extensionPhoneNumber,
      forwardingNumber: this.forwardingNumber,
      storage: this.storage,
      rolesAndPermissions: this.rolesAndPermissions,
      tabManager: this._tabManager,
      getState: () => this.state.callingSettings,
    }));
    this.addModule('subscription', new Subscription({
      auth: this.auth,
      client: this.client,
      storage: this.storage,
      tabManager: this.tabManager,
      getState: () => this.state.subscription,
    }));
    this.addModule('detailedPresence', new DetailedPresence({
      auth: this.auth,
      client: this.client,
      subscription: this.subscription,
      getState: () => this.state.detailedPresence,
    }));
    this.addModule('activeCalls', new ActiveCalls({
      auth: this.auth,
      client: this.client,
      subscription: this.subscription,
      getState: () => this.state.activeCalls,
    }));
    this.addModule('callLog', new CallLog({
      auth: this.auth,
      client: this.client,
      storage: this.storage,
      subscription: this.subscription,
      getState: () => this.state.callLog,
    }));
    this.addModule('accountExtension', new AccountExtension({
      auth: this.auth,
      client: this.client,
      storage: this.storage,
      subscription: this.subscription,
      getState: () => this.state.accountExtension,
    }));
    this.addModule('call', new Call({
      alert: this.alert,
      client: this.client,
      storage: this.storage,
      regionSettings: this.regionSettings,
      callingSettings: this.callingSettings,
      softphone: this.softphone,
      ringout: this.ringout,
      accountExtension: this.accountExtension,
      getState: () => this.state.call,
    }));
    this.addModule('presence', new Presence({
      auth: this.auth,
      client: this.client,
      subscription: this.subscription,
      getState: () => this.state.presence,
    }));
    this.addModule('numberValidate', new NumberValidate({
      client: this.client,
      accountExtension: this.accountExtension,
      regionSettings: this.regionSettings,
      getState: () => this.state.numberValidate,
    }));
    this.addModule('messageSender', new MessageSender({
      alert: this.alert,
      client: this.client,
      getState: () => this.state.messageSender,
      extensionPhoneNumber: this.extensionPhoneNumber,
      extensionInfo: this.extensionInfo,
      numberValidate: this.numberValidate,
    }));
    this.addModule('composeText', new ComposeText({
      alert: this.alert,
      storage: this.storage,
      getState: () => this.state.composeText,
      messageSender: this.messageSender,
      numberValidate: this.numberValidate,
    }));
    this.addModule('callMonitor', new CallMonitor({
      detailedPresence: this.detailedPresence,
      activeCalls: this.activeCalls,
      regionSettings: this.regionSettings,
      getState: () => this.state.callMonitor,
    }));
    this.addModule('callHistory', new CallHistory({
      activeCalls: this.activeCalls,
      callLog: this.callLog,
      detailedPresence: this.detailedPresence,
      getState: () => this.state.callHistory,
    }));
    this.addModule('contactSearch', new ContactSearch({
      auth: this.auth,
      storage: this.storage,
      getState: () => this.state.contactSearch,
    }));
    this.contactSearch.addSearchSource({
      sourceName: 'test',
      searchFn: str => [{
        entityType: 'account',
        name: str,
        phoneNumber: '+1234567890',
        phoneType: 'phone',
      }],
      formatFn: entities => entities,
      readyCheckFn: () => true,
    });
    this.addModule('messageStore', new MessageStore({
      alert: this.alert,
      auth: this.auth,
      client: this.client,
      storage: this.storage,
      subscription: this.subscription,
      getState: () => this.state.messageStore,
    }));
    this.addModule('conversation', new Conversation({
      auth: this.auth,
      messageSender: this.messageSender,
      extensionInfo: this.extensionInfo,
      messageStore: this.messageStore,
      getState: () => this.state.conversation,
    }));
    this.addModule('messages', new Messages({
      messageStore: this.messageStore,
      getState: () => this.state.messages,
    }));
    this._reducer = combineReducers({
      accountInfo: this.accountInfo.reducer,
      accountExtension: this.accountExtension.reducer,
      activeCalls: this.activeCalls.reducer,
      alert: this.alert.reducer,
      auth: this.auth.reducer,
      blockedNumber: this.blockedNumber.reducer,
      call: this.call.reducer,
      callHistory: this.callHistory.reducer,
      callingSettings: this.callingSettings.reducer,
      callMonitor: this.callMonitor.reducer,
      callLog: this.callLog.reducer,
      connectivityMonitor: this.connectivityMonitor.reducer,
      environment: this.environment.reducer,
      extensionInfo: this.extensionInfo.reducer,
      extensionPhoneNumber: this.extensionPhoneNumber.reducer,
      forwardingNumber: this.forwardingNumber.reducer,
      brand: this.brand.reducer,
      detailedPresence: this.detailedPresence.reducer,
      dialingPlan: this.dialingPlan.reducer,
      locale: this.locale.reducer,
      storage: this.storage.reducer,
      globalStorage: this.globalStorage.reducer,
      presence: this.presence.reducer,
      rateLimiter: this.rateLimiter.reducer,
      ringout: this.ringout.reducer,
      rolesAndPermissions: this.rolesAndPermissions.reducer,
      regionSettings: this.regionSettings.reducer,
      subscription: this.subscription.reducer,
      tabManager: this.tabManager.reducer,
      numberValidate: this.numberValidate.reducer,
      messageSender: this.messageSender.reducer,
      contactSearch: this.contactSearch.reducer,
      composeText: this.composeText.reducer,
      messageStore: this.messageStore.reducer,
      conversation: this.conversation.reducer,
      messages: this.messages.reducer,
      lastAction: (state = null, action) => {
        console.log(action);
        return action;
      },
    });
  }
  initialize() {
    ReactDOM.render((
      <Provider store={this.store}>
        <DemoView />
      </Provider>
    ), document.querySelector('#viewport'));
    // let subscribed = false;
    // this.store.subscribe(() => {
    //   if (!subscribed && this.subscription.ready) {
    //     subscribed = true;
    //     this.subscription.subscribe('/account/~/extension/~/presence');
    //   }
    // });
  }
}

const phone = new DemoPhone();
const store = createStore(phone.reducer);
phone.setStore(store);

if (typeof window !== 'undefined') {
  window.phone = phone;
}
