import Enum from '../../lib/Enum';

export default new Enum([
  'init',
  'initSuccess',
  'fetch',
  'fetchSuccess',
  'fetchError',
  'fSync',
  'fSyncSuccess',
  'fSyncError',
  'iSync',
  'iSyncSuccess',
  'iSyncError',
  'reset',
  'resetSuccess',
  'clearToken',
], 'callLogActionTypes');
