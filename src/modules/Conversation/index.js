import RcModule from '../../lib/RcModule';
import moduleStatus from '../../enums/moduleStatus';

import {
  getMyNumberFromMessage,
  getRecipientNumbersFromMessage,
} from '../../lib/messageHelper';

import conversationActionTypes from './conversationActionTypes';
import getConversationReducer from './getConversationReducer';

import conversationStatus from './conversationStatus';

export default class Conversation extends RcModule {
  constructor({
    messageSender,
    extensionInfo,
    messageStore,
    ...options
  }) {
    super({
      ...options,
      actionTypes: conversationActionTypes,
    });
    this._reducer = getConversationReducer(this.actionTypes);
    this._messageSender = messageSender;
    this._extensionInfo = extensionInfo;
    this._messageStore = messageStore;
    this._promise = null;
    this.replyToReceivers = this.replyToReceivers.bind(this);
    this.changeDefaultRecipient = this.changeDefaultRecipient.bind(this);
  }

  initialize() {
    this.store.subscribe(() => this._onStateChange());
  }

  _onStateChange() {
    if (this._shouldInit()) {
      this._initModuleStatus();
    } else if (this._shouldReset()) {
      this._resetModuleStatus();
    } else if (this._shouldReloadConversation()) {
      const newConversation = this._messageStore
                                  .findConversationById(this.conversation.id);
      if (newConversation) {
        this._loadConversation(newConversation);
        this._messageStore.readMessages(newConversation);
      }
    }
  }

  _shouldInit() {
    return (
      this._extensionInfo.ready &&
      this._messageSender.ready &&
      this._messageStore.ready &&
      !this.ready
    );
  }

  _shouldReset() {
    return (
      (
        !this._extensionInfo.ready ||
        !this._messageSender.ready ||
        !this._messageStore.ready
      ) &&
      this.ready
    );
  }

  _shouldReloadConversation() {
    return (
      this.ready &&
      (!!this.conversation) &&
      this.messageStoreUpdatedAt !== this._messageStore.conversationsTimestamp
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

  loadConversationById(id) {
    const conversation = this._messageStore.findConversationById(id);
    if (!conversation) {
      return;
    }
    this._loadConversation(conversation);
    this._messageStore.readMessages(conversation);
  }

  unloadConversation() {
    this.store.dispatch({
      type: this.actionTypes.cleanUp,
    });
  }

  changeDefaultRecipient(phoneNumber) {
    if (this.recipients.length < 2) {
      return;
    }
    const recipients = this.recipients.slice();
    const defaultNumberIndex = recipients.findIndex(number =>
      (number.extensionNumber === phoneNumber || number.phoneNumber === phoneNumber)
    );
    if (defaultNumberIndex < 0) {
      return;
    }
    if (this.conversation) {
      const defaultNumber = recipients[defaultNumberIndex];
      recipients.splice(defaultNumberIndex, 1);
      const newRecipients = [defaultNumber].concat(recipients);
      this._updateConversationRecipients(newRecipients);
    }
  }

  _updateConversationRecipients(newRecipients) {
    const currentConversationId = this.conversation && this.conversation.id;
    if (!currentConversationId) {
      return;
    }
    this._messageStore.updateConversationRecipientList(currentConversationId, newRecipients);
    this._updateRecipients(newRecipients);
  }

  _updateRecipients(recipients) {
    this.store.dispatch({
      type: this.actionTypes.updateRecipients,
      recipients,
    });
  }

  _updateSenderNumber(senderNumber) {
    this.store.dispatch({
      type: this.actionTypes.updateSenderNumber,
      senderNumber,
    });
  }

  _loadConversation(conversation) {
    this.store.dispatch({
      type: this.actionTypes.updateMessageStoreUpdatedAt,
      updatedAt: this._messageStore.conversationsTimestamp,
    });
    this.store.dispatch({
      type: this.actionTypes.load,
      conversation: { ...conversation },
    });
    const senderNumber = this._getCurrentSenderNumber(conversation);
    this._updateSenderNumber(senderNumber);
    let recipients = conversation.recipients;
    if (!recipients || recipients.length === 0) {
      recipients = this._getRecipients(conversation, senderNumber);
    }
    this._updateRecipients(recipients);
  }

  _getCurrentSenderNumber(conversation) {
    if (!conversation || !conversation.messages) {
      return null;
    }
    const messageLength = conversation.messages.length;
    if (messageLength < 1) {
      return null;
    }
    const lastMessage = conversation.messages[messageLength - 1];
    return getMyNumberFromMessage({
      message: lastMessage,
      myExtensionNumber: this._extensionInfo.extensionNumber,
    });
  }

  _getRecipients(conversation, senderNumber) {
    if (!conversation || !senderNumber || !conversation.messages) {
      return [];
    }
    const messageLength = conversation.messages.length;
    if (messageLength < 1) {
      return [];
    }
    const lastMessage = conversation.messages[messageLength - 1];
    return getRecipientNumbersFromMessage({
      message: lastMessage,
      myNumber: senderNumber,
    });
  }

  _getReplyOnMessageId() {
    const lastMessage =
        this.conversation &&
        this.conversation.messages &&
        (this.conversation.messages.length > 0) &&
        this.conversation.messages[this.conversation.messages.length - 1];
    if (lastMessage && lastMessage.id) {
      return lastMessage.id;
    }
    return null;
  }

  _getFromNumber() {
    if (!this.senderNumber) {
      return null;
    }
    return (this.senderNumber.extensionNumber || this.senderNumber.phoneNumber);
  }

  _getToNumbers() {
    return this.recipients.map(
      recipient => (recipient.extensionNumber || recipient.phoneNumber)
    );
  }

  async replyToReceivers(text) {
    this.store.dispatch({
      type: this.actionTypes.reply,
    });
    try {
      const response = await this._messageSender
                                 .send({
                                   fromNumber: this._getFromNumber(),
                                   toNumbers: this._getToNumbers(),
                                   text,
                                   replyOnMessageId: this._getReplyOnMessageId(),
                                 });
      if (response) {
        this._messageStore.pushMessage(response.conversation.id, response);
        this.store.dispatch({
          type: this.actionTypes.replySuccess,
        });
        return response;
      }
      this._onReplyError();
      return null;
    } catch (error) {
      this._onReplyError();
      throw error;
    }
  }

  _onReplyError() {
    this.store.dispatch({
      type: this.actionTypes.replyError,
    });
  }

  get status() {
    return this.state.status;
  }

  get conversationStatus() {
    return this.state.conversationStatus;
  }

  get ready() {
    return this.status === moduleStatus.ready;
  }

  get pushing() {
    return this.conversationStatus === conversationStatus.pushing;
  }

  get conversation() {
    return this.state.conversation;
  }

  get senderNumber() {
    return this.state.senderNumber;
  }

  get recipients() {
    return this.state.recipients;
  }

  get messageStoreUpdatedAt() {
    return this.state.messageStoreUpdatedAt;
  }
}
