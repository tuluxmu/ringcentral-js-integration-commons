import KeyValueMap from 'data-types/key-value-map';

export default new KeyValueMap({
  presence: '/account/~/extension/~/presence',
  detailedPresence: '/account/~/extension/~/presence?detailedTelephonyState=true',
});
