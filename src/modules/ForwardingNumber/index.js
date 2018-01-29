import { Module } from '../../lib/di';
import DataFetcher from '../../lib/DataFetcher';
import fetchList from '../../lib/fetchList';
import ensureExist from '../../lib/ensureExist';
import throttle from '../../lib/throttle';
/**
 * @class
 * @description Extension forwarding number list module
 */
@Module({
  deps: ['Client', 'RolesAndPermissions', { dep: 'ForwardingNumberOptions', optional: true }]
})
export default class ForwardingNumber extends DataFetcher {
  /**
   * @constructor
   * @param {Object} params - params object
   * @param {Client} params.client - client module instance
   */
  constructor({
    client,
    rolesAndPermissions,
    ...options
  }) {
    super({
      name: 'forwardingNumber',
      client,
      fetchFunction: async () => {
        if (!this._rolesAndPermissions.permissions.ReadUserForwardingFlipNumbers) {
          return [];
        }
        return fetchList(params => (
          this._client.account().extension().forwardingNumber().list(params)
        )).catch((error) => {
          if (
            error &&
            error.apiResponse &&
            error.apiResponse._response &&
            error.apiResponse._response.status === 403
          ) {
            return [];
          }
          throw error;
        });
      },
      readyCheckFn: () => this._rolesAndPermissions.ready,
      ...options,
    });
    this._rolesAndPermissions = this::ensureExist(rolesAndPermissions, 'rolesAndPermissions');

    this.addSelector(
      'flipNumbers',
      () => this.numbers,
      phoneNumbers =>
        phoneNumbers.filter(p => p.features.indexOf('CallFlip') !== -1 && p.phoneNumber)
    );
    this.addSelector(
      'numbers',
      () => this.data,
      data => data || [],
    );
    this.addSelector(
      'forwardingNumbers',
      () => this.numbers,
      phoneNumbers =>
        phoneNumbers.filter(p => p.features.indexOf('CallForwarding') !== -1 && p.phoneNumber)
    );
  }

  get numbers() {
    return this._selectors.numbers();
  }

  get flipNumbers() {
    return this._selectors.flipNumbers();
  }

  get forwardingNumbers() {
    return this._selectors.forwardingNumbers();
  }
}
