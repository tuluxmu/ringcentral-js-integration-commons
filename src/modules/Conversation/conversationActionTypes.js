import Enum from '../../lib/Enum';

export default new Enum([
  'init',
  'initSuccess',
  'reset',
  'resetSuccess',
  'reply',
  'replySuccess',
  'replyError',
  'load',
  'update',
  'updateRecipients',
  'updateSenderNumber',
  'cleanUp',
  'updateMessageStoreUpdatedAt',
], 'conversation');
