import 'core-js/fn/array/find';
import DataFetcher from '../../lib/DataFetcher';
import fetchList from '../../lib/fetchList';

import actionTypes from './actionTypes';
import {
  getDataReducer,
  getTimestampReducer,
} from './getAccountExtensionReducer';

const extensionRegExp = /.*\/extension$/;
const DEFAULT_TTL = 24 * 60 * 60 * 1000;

/**
 * @function
 * @description Determines whether an extension data is worth caching
 * @param {Object} ext - extension data
 * @return {Boolean}
 */
function isEssential(ext) {
  return ext.extensionNumber &&
    ext.extensionNumber !== '' &&
    ext.status === 'Enabled' &&
    (ext.type === 'DigitalUser' || ext.type === 'User');
}
/**
 * @function
 * @description Returns a simplified extension data for caching to reducer storage use
 * @param {Object} ext - extension data
 * @return {Object}
 */
function simplifyExtensionData(ext) {
  return {
    ext: ext.extensionNumber,
    name: ext.name,
    id: ext.id,
  };
}

export default class AccountExtension extends DataFetcher {
  constructor({
    client,
    ttl = DEFAULT_TTL,
    ...options
  }) {
    super({
      ...options,
      name: 'accountExtension',
      client,
      ttl,
      actionTypes,
      getDataReducer,
      getTimestampReducer,
      subscriptionFilters: ['/account/~/extension'],
      subscriptionHandler: async (message) => {
        if (
          message &&
          extensionRegExp.test(message.event) &&
          message.body &&
          message.body.extensions
        ) {
          for (const item of message.body.extensions) {
            const { id, eventType } = item;
            if (eventType === 'Delete') {
              this.store.dispatch({
                type: this.actionTypes.delete,
                id,
                timestamp: Date.now(),
              });
            } else if (eventType === 'Create' || eventType === 'Update') {
              try {
                const extensionData = await this._client.account().extension(id).get();
                if (isEssential(extensionData)) {
                  if (this.isAvailableExtension(extensionData.extensionNumber)) {
                    this.store.dispatch({
                      type: this.actionTypes.add,
                      data: simplifyExtensionData(extensionData),
                      timestamp: Date.now(),
                    });
                  }
                } else {
                  // if an extension was updated to be not essential anymore
                  // eg. not assigned an extension number
                  this.store.dispatch({
                    type: this.actionTypes.delete,
                    id,
                    timestamp: Date.now(),
                  });
                }
              } catch (error) {
                /* falls through */
              }
            } else {
              // console.warn('unexpect notification eventType:', eventType);
            }
          }
        }
      },
      fetchFunction: async () => (await fetchList(params => (
        this._client.account().extension().list(params)
      ))).filter(isEssential).map(simplifyExtensionData),
    });

    this.addSelector(
      'availableExtensions',
      () => this.data,
      data => data || [],
    );
  }

  get availableExtensions() {
    return this._selectors.availableExtensions();
  }

  isAvailableExtension(extensionNumber) {
    return !!this.availableExtensions.find(item => item.ext === extensionNumber);
  }
}
