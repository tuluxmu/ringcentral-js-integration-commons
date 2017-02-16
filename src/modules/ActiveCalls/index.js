import DataFetcher from '../../lib/DataFetcher';
import sleep from '../../lib/sleep';
import fetchList from '../../lib/fetchList';
import subscriptionFilters from '../Subscription/filters';
import processCall from '../../lib/processCall';

const presenceRegExp = /\/presence\?detailedTelephonyState=true$/;
const FETCH_DELAY = 1000;
const DEFAULT_TTL = 5 * 60 * 1000;

export default class ActiveCalls extends DataFetcher {
  constructor({
    client,
    tabManager, // do not pass tabManager to DataFetcher as data is not shared in localStorage
    ttl = DEFAULT_TTL,
    ...options
  }) {
    super({
      ...options,
      name: 'activeCalls',
      client,
      ttl,
      subscriptionFilters: [subscriptionFilters.detailedPresence],
      subscriptionHandler: async (message) => {
        if (presenceRegExp.test(message.event)) {
          const ownerId = this._auth.ownerId;
          await sleep(FETCH_DELAY);
          if (ownerId === this._auth.ownerId) {
            await this.fetchData();
          }
        }
      },
      fetchFunction: async () => (await fetchList(params => (
        this._client.account().extension().activeCalls().list(params)
      ))).map(processCall),
    });
    this.addSelector(
      'calls',
      () => this.data,
      data => data || [],
    );
  }

  get calls() {
    return this._selectors.calls();
  }
}
