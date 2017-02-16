import { combineReducers } from 'redux';
import getModuleStatusReducer from '../../lib/getModuleStatusReducer';
import conversationStatus from './conversationStatus';

export function getConversationStatusReducer(types) {
  return (state = conversationStatus.idle, { type }) => {
    switch (type) {
      case types.reply:
        return conversationStatus.pushing;
      case types.replySuccess:
      case types.replyError:
        return conversationStatus.idle;
      default:
        return state;
    }
  };
}

export function getCurrentConversationReducer(types) {
  return (state = null, { type, conversation }) => {
    switch (type) {
      case types.load:
      case types.update:
        return conversation;
      case types.cleanUp:
        return null;
      default:
        return state;
    }
  };
}

export function getCurrentSenderNumberReducer(types) {
  return (state = null, { type, senderNumber }) => {
    switch (type) {
      case types.updateSenderNumber:
        return senderNumber;
      case types.cleanUp:
        return null;
      default:
        return state;
    }
  };
}

export function getCurrentRecipientsReducer(types) {
  return (state = [], { type, recipients }) => {
    switch (type) {
      case types.updateRecipients:
        return recipients;
      case types.cleanUp:
        return [];
      default:
        return state;
    }
  };
}

export function getMessageStoreUpdatedAtReducer(types) {
  return (state = null, { type, updatedAt }) => {
    switch (type) {
      case types.updateMessageStoreUpdatedAt: {
        return updatedAt;
      }
      default:
        return state;
    }
  };
}

export default function getConversationReducer(types) {
  return combineReducers({
    status: getModuleStatusReducer(types),
    conversationStatus: getConversationStatusReducer(types),
    conversation: getCurrentConversationReducer(types),
    senderNumber: getCurrentSenderNumberReducer(types),
    recipients: getCurrentRecipientsReducer(types),
    messageStoreUpdatedAt: getMessageStoreUpdatedAtReducer(types),
  });
}
