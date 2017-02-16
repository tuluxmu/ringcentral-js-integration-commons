import RcModule from '../../lib/RcModule';
import loginStatus from '../../modules/Auth/loginStatus';
import moduleStatus from '../../enums/moduleStatus';

import contactSearchActionTypes from './contactSearchActionTypes';
import getContactSearchReducer from './getContactSearchReducer';
import getCacheReducer from './getCacheReducer';

export default class ContactSearch extends RcModule {
  constructor({
    auth,
    storage,
    ttl = 30 * 60 * 1000,
    ...options,
  }) {
    super({
      ...options,
      actionTypes: contactSearchActionTypes,
    });
    this._auth = auth;
    this._storageKey = 'contactSearchCache';
    this._storage = storage;
    this._ttl = ttl;
    this._searchSources = new Map();
    this._searchSourcesFormat = new Map();
    this._searchSourcesCheck = new Map();
    this._reducer = getContactSearchReducer(this.actionTypes);
    this._cacheReducer = getCacheReducer(this.actionTypes);
    storage.registerReducer({ key: this._storageKey, reducer: this._cacheReducer });
  }

  initialize() {
    this.store.subscribe(() => this._onStateChange());
  }

  _onStateChange() {
    if (this._shouldInit()) {
      this._initModuleStatus();
    } else if (this._shouldReset()) {
      this._resetModuleStatus();
    }
  }

  _shouldInit() {
    return (
      this._auth.loginStatus === loginStatus.loggedIn &&
      this._storage.ready &&
      this._readyCheck() &&
      !this.ready
    );
  }

  _shouldReset() {
    return (
      (
        this._auth.loginStatus !== loginStatus.loggedIn ||
        !this._storage.ready
      ) &&
      this.ready
    );
  }

  _initModuleStatus() {
    this.store.dispatch({
      type: this.actionTypes.initSuccess,
    });
  }

  _resetModuleStatus() {
    this.store.dispatch({
      type: this.actionTypes.resetSuccess,
    });
  }

  addSearchSource({ sourceName, searchFn, readyCheckFn, formatFn }) {
    if (!sourceName) {
      throw new Error('ContactSearch: "sourceName" is required.');
    }
    if (this._searchSources.has(sourceName)) {
      throw new Error(`ContactSearch: A search source named "${sourceName}" already exists`);
    }
    if (this._searchSourcesCheck.has(sourceName)) {
      throw new Error(`ContactSearch: A search source check named "${sourceName}" already exists`);
    }
    if (this._searchSourcesFormat.has(sourceName)) {
      throw new Error(`ContactSearch: A search source format named "${sourceName}" already exists`);
    }
    if (typeof searchFn !== 'function') {
      throw new Error('ContactSearch: searchFn must be a function');
    }
    if (typeof readyCheckFn !== 'function') {
      throw new Error('ContactSearch: readyCheckFn must be a function');
    }
    if (typeof formatFn !== 'function') {
      throw new Error('ContactSearch: formatFn must be a function');
    }
    this._searchSources.set(sourceName, searchFn);
    this._searchSourcesFormat.set(sourceName, formatFn);
    this._searchSourcesCheck.set(sourceName, readyCheckFn);
  }

  async search({ searchString }) {
    if (!this.ready || (searchString.length < 3)) {
      this.store.dispatch({
        type: this.actionTypes.prepareSearch,
      });
      return null;
    }

    if (this.searching.searchString === searchString) {
      return null;
    }

    for (const sourceName of this._searchSources.keys()) {
      await this._searchSource({
        sourceName,
        searchString,
      });
    }
    return null;
  }

  async _searchSource({ sourceName, searchString }) {
    this.store.dispatch({
      type: this.actionTypes.search,
    });
    try {
      let entities = null;
      entities = this._searchFromCache({ sourceName, searchString });
      if (entities) {
        this._loadSearching({ searchString, entities });
        return null;
      }
      entities = await this._searchSources.get(sourceName)({
        searchString,
      });
      entities = this._searchSourcesFormat.get(sourceName)(entities);
      this._loadSearching({ searchString, entities });
      this._saveSearching({ sourceName, searchString, entities });
    } catch (error) {
      this._onSearchError();
    }
    return null;
  }

  _searchFromCache({ sourceName, searchString }) {
    const key = JSON.stringify([sourceName, searchString]);
    const searching = this.cache && this.cache.contactSearch && this.cache.contactSearch[key];
    const now = Date.now();
    if (searching && (now - searching.timestamp) < this._ttl) {
      return searching.entities;
    }
    return null;
  }

  _readyCheck() {
    for (const sourceName of this._searchSourcesCheck.keys()) {
      if (!this._searchSourcesCheck.get(sourceName)()) {
        return false;
      }
    }
    return true;
  }

  _onSearchError() {
    this.store.dispatch({
      type: this.actionTypes.searchError,
    });
  }

  _loadSearching({ searchString, entities }) {
    this.store.dispatch({
      type: this.actionTypes.searchSuccess,
      entities,
      searchString,
    });
  }

  _saveSearching({ sourceName, searchString, entities }) {
    this.store.dispatch({
      type: this.actionTypes.save,
      sourceName,
      searchString,
      entities,
    });
  }

  get cache() {
    return this._storage.getItem(this._storageKey);
  }

  get status() {
    return this.state.status;
  }

  get searchStatus() {
    return this.state.searchStatus;
  }

  get searching() {
    return this.state.searching;
  }

  get ready() {
    return this.status === moduleStatus.ready;
  }
}
