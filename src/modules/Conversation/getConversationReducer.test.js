import { expect } from 'chai';
import getConversationReducer, {
  getConversationStatusReducer,
  getCurrentConversationReducer,
  getCurrentSenderNumberReducer,
  getCurrentRecipientsReducer,
} from './getConversationReducer';

import conversationActionTypes from './conversationActionTypes';
import conversationStatus from './conversationStatus';

describe('Conversation :: getConversationStatusReducer', () => {
  it('getConversationStatusReducer should be a function', () => {
    expect(getConversationStatusReducer).to.be.a('function');
  });
  it('getConversationStatusReducer should return a reducer', () => {
    expect(getConversationStatusReducer()).to.be.a('function');
  });
  describe('statusReducer', () => {
    const reducer = getConversationStatusReducer(conversationActionTypes);
    it('should have initial state of pending', () => {
      expect(reducer(undefined, {})).to.equal(conversationStatus.idle);
    });
    it('should return original state of actionTypes is not recognized', () => {
      const originalState = {};
      expect(reducer(originalState, { type: 'foo' }))
      .to.equal(originalState);
    });
    it('should return pushing status on reply', () => {
      [
        conversationActionTypes.reply
      ].forEach(type => {
        expect(reducer('foo', {
          type,
        })).to.equal(conversationStatus.pushing);
      });
    });
    it('should return idle status on reply error and reply success', () => {
      [
        conversationActionTypes.replySuccess,
        conversationActionTypes.replyError,
      ].forEach(type => {
        expect(reducer('foo', {
          type,
        })).to.equal(conversationStatus.idle);
      });
    });
  });
});

describe('Conversation :: getCurrentConversationReducer', () => {
  it('getCurrentConversationReducer should be a function', () => {
    expect(getCurrentConversationReducer).to.be.a('function');
  });
  it('getCurrentConversationReducer should return a reducer', () => {
    expect(getCurrentConversationReducer()).to.be.a('function');
  });
  describe('currentReducer', () => {
    const reducer = getCurrentConversationReducer(conversationActionTypes);
    it('should have initial state of null', () => {
      expect(reducer(undefined, {})).to.equal(null);
    });
    it('should return original state of actionTypes is not recognized', () => {
      const originalState = {};
      expect(reducer(originalState, { type: 'foo' }))
      .to.equal(originalState);
    });
    it('should return conversation on load and update', () => {
      [
        conversationActionTypes.load,
        conversationActionTypes.update,
      ].forEach(type => {
        const conversation = {
          id: '1234567890',
          records: [{ id: '123' }],
        };
        expect(reducer('foo', {
          type,
          conversation
        })).to.deep.equal(conversation);
      });
    });
    it('should return null on cleanUp', () => {
      [
        conversationActionTypes.cleanUp,
      ].forEach(type => {
        expect(reducer('foo', {
          type,
        })).to.equal(null);
      });
    });
  });
});

describe('Conversation :: getCurrentSenderNumberReducer', () => {
  it('getCurrentSenderNumberReducer should be a function', () => {
    expect(getCurrentSenderNumberReducer).to.be.a('function');
  });
  it('getCurrentSenderNumberReducer should return a reducer', () => {
    expect(getCurrentSenderNumberReducer()).to.be.a('function');
  });
  describe('senderNumberReducer', () => {
    const reducer = getCurrentSenderNumberReducer(conversationActionTypes);
    it('should have initial state of null', () => {
      expect(reducer(undefined, {})).to.equal(null);
    });
    it('should return original state of actionTypes is not recognized', () => {
      const originalState = {};
      expect(reducer(originalState, { type: 'foo' }))
      .to.equal(originalState);
    });
    it('should return sender number object on updateSenderNumber', () => {
      [
        conversationActionTypes.updateSenderNumber,
      ].forEach(type => {
        const senderNumber = {
          phone: '1234567890',
        };
        expect(reducer('foo', {
          type,
          senderNumber
        })).to.deep.equal(senderNumber);
      });
    });
    it('should return null on cleanUp', () => {
      [
        conversationActionTypes.cleanUp,
      ].forEach(type => {
        expect(reducer('foo', {
          type,
        })).to.equal(null);
      });
    });
  });
});

describe('Conversation :: getCurrentRecipientsReducer', () => {
  it('getCurrentRecipientsReducer should be a function', () => {
    expect(getCurrentRecipientsReducer).to.be.a('function');
  });
  it('getCurrentRecipientsReducer should return a reducer', () => {
    expect(getCurrentRecipientsReducer()).to.be.a('function');
  });
  describe('recipientsReducer', () => {
    const reducer = getCurrentRecipientsReducer(conversationActionTypes);
    it('should have initial state of empty array', () => {
      expect(reducer(undefined, {})).to.deep.equal([]);
    });
    it('should return original state of actionTypes is not recognized', () => {
      const originalState = {};
      expect(reducer(originalState, { type: 'foo' }))
      .to.equal(originalState);
    });
    it('should return toNumber array on updateRecipients', () => {
      [
        conversationActionTypes.updateRecipients,
      ].forEach(type => {
        const recipients = [{
          name: '1234567890',
        }];
        expect(reducer('foo', {
          type,
          recipients
        })).to.deep.equal(recipients);
      });
    });
    it('should return null on cleanUp', () => {
      [
        conversationActionTypes.cleanUp,
      ].forEach(type => {
        expect(reducer('foo', {
          type,
        })).to.deep.equal([]);
      });
    });
  });
});
