import 'core-js/fn/array/find';
import RcModule from '../../lib/RcModule';
import isBlank from '../../lib/isBlank';
import moduleStatus from '../../enums/moduleStatus';

import messageSenderActionTypes from './messageSenderActionTypes';
import getMessageSenderReducer from './getMessageSenderReducer';

import messageSenderStatus from './messageSenderStatus';
import messageSenderMessages from './messageSenderMessages';

export default class MessageSender extends RcModule {
  constructor({
    alert,
    client,
    extensionInfo,
    extensionPhoneNumber,
    numberValidate,
    ...options
  }) {
    super({
      ...options,
      actionTypes: messageSenderActionTypes,
    });

    this._alert = alert;
    this._client = client;
    this._extensionPhoneNumber = extensionPhoneNumber;
    this._extensionInfo = extensionInfo;
    this._reducer = getMessageSenderReducer(this.actionTypes);
    this._numberValidate = numberValidate;
    this.send = this.send.bind(this);
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
      this._extensionPhoneNumber.ready &&
      this._extensionInfo.ready &&
      !this.ready
    );
  }

  _initModuleStatus() {
    this.store.dispatch({
      type: this.actionTypes.initSuccess,
    });
  }

  _shouldReset() {
    return (
      (
        !this._extensionPhoneNumber.ready ||
        !this._extensionInfo.ready
      ) &&
      this.ready
    );
  }

  _resetModuleStatus() {
    this.store.dispatch({
      type: this.actionTypes.resetSuccess,
    });
  }

  _alertWarning(message) {
    if (message) {
      this._alert.warning({
        message,
      });
      return true;
    }
    return false;
  }

  _validateText(text) {
    if (isBlank(text)) {
      this._alertWarning(messageSenderMessages.textEmpty);
      return false;
    }

    if (text.length > 1000) {
      this._alertWarning(messageSenderMessages.textTooLong);
      return false;
    }

    return true;
  }

  _validateToNumbersIsEmpty(toNumbers) {
    if (toNumbers.length === 0) {
      this._alertWarning(messageSenderMessages.recipientsEmpty);
      return true;
    }
    return false;
  }

  _validateSenderNumber(senderNumber) {
    let validateResult = true;
    if (isBlank(senderNumber)) {
      validateResult = false;
    }
    if (validateResult) {
      const isMySenderNumber = this.senderNumbersList.find(number => (
        number === senderNumber
      ));
      if (!isMySenderNumber) {
        validateResult = false;
      }
    }
    if (!validateResult) {
      this._alertWarning(messageSenderMessages.senderNumberInvalids);
    }
    return validateResult;
  }

  _alertInvalidRecipientErrors(errors) {
    errors.forEach((error) => {
      const message = messageSenderMessages[error.type];
      if (!this._alertWarning(message)) {
        this._alertWarning(messageSenderMessages.recipientNumberInvalids);
      }
    });
  }

  async _validateToNumbers(toNumbers) {
    const result = {
      result: false,
    };
    if (this._validateToNumbersIsEmpty(toNumbers)) {
      return result;
    }
    let recipientNumbers = toNumbers.filter((item, index, arr) => arr.indexOf(item) === index);
    this.store.dispatch({ type: this.actionTypes.validate });
    const numberValidateResult = await this._numberValidate.validateNumbers(recipientNumbers);
    if (!numberValidateResult.result) {
      this._alertInvalidRecipientErrors(numberValidateResult.errors);
      this.store.dispatch({ type: this.actionTypes.validateError });
      return result;
    }

    recipientNumbers = numberValidateResult.numbers.map((number) => {
      if (!number.subAddress) {
        return number.e164;
      }
      return `${number.e164}*${number.subAddress}`;
    });
    result.result = true;
    result.numbers = recipientNumbers;
    return result;
  }

  async send({ fromNumber, toNumbers, text, replyOnMessageId }) {
    if (!this._validateText(text)) {
      return null;
    }

    try {
      const validateToNumberResult = await this._validateToNumbers(toNumbers);
      if (!validateToNumberResult.result) {
        return null;
      }
      const recipientNumbers = validateToNumberResult.numbers;

      const extensionNumbers = recipientNumbers.filter(number => (number.length <= 5));
      const phoneNumbers = recipientNumbers.filter(number => (number.length > 5));

      if (phoneNumbers.length > 0) {
        if (!this._validateSenderNumber(fromNumber)) {
          return null;
        }
      }

      this.store.dispatch({
        type: this.actionTypes.send,
      });

      let pagerResponse = null;
      let smsResponse = null;
      if (extensionNumbers.length > 0) {
        pagerResponse = await this._sendPager({
          toNumbers: extensionNumbers,
          text,
          replyOnMessageId,
        });
      }

      if (phoneNumbers.length > 0) {
        for (const phoneNumber of phoneNumbers) {
          smsResponse = await this._sendSms({ fromNumber, toNumber: phoneNumber, text });
        }
      }
      this.store.dispatch({
        type: this.actionTypes.sendOver,
      });
      return (pagerResponse || smsResponse);
    } catch (error) {
      this.store.dispatch({
        type: this.actionTypes.sendError,
        error: 'error'
      });
      this._onSendError(error);
      console.debug('sendComposeText e ', error);
      throw error;
    }
  }

  async _sendSms({ fromNumber, toNumber, text }) {
    const toUsers = [{ phoneNumber: toNumber }];
    const response = await this._client.account().extension().sms().post({
      from: { phoneNumber: fromNumber },
      to: toUsers,
      text,
    });
    return response;
  }

  async _sendPager({ toNumbers, text, replyOnMessageId }) {
    const from = { extensionNumber: this._extensionInfo.extensionNumber };
    const toUsers = toNumbers.map(number => ({ extensionNumber: number }));
    const params = { from, to: toUsers, text };
    if (replyOnMessageId) {
      params.replyOn = replyOnMessageId;
    }
    const response = await this._client.account().extension().companyPager().post(params);
    return response;
  }

  _onSendError(error) {
    const errResp = error.apiResponse;
    if (
      errResp && errResp.response &&
      !errResp.response.ok
      && errResp._json.errorCode === 'InvalidParameter'
    ) {
      errResp._json.errors.map((err) => {
        if (
          (err.errorCode === 'CMN-101' || err.errorCode === 'CMN-102') &&
          err.parameterName.startsWith('to')
        ) {
          // 101 : "Parameter [to.extensionNumber] value is invalid"
          // 101 : "Parameter [to.phoneNumber] value is invalid"
          // 102 : "Resource for parameter [to] is not found"
          this._alertWarning(messageSenderMessages.recipientNumberInvalids);
          return null;
        }
        if (err.errorCode === 'MSG-246') {
          // MSG-246 : "Sending SMS from/to extension numbers is not available"
          this._alertWarning(messageSenderMessages.notSmsToExtension);
        }
        return null;
      });
      return;
    }
    this._alertWarning(messageSenderMessages.sendError);
  }

  get status() {
    return this.state.status;
  }

  get sendStatus() {
    return this.state.sendStatus;
  }

  get ready() {
    return this.status === moduleStatus.ready;
  }

  get idle() {
    return this.sendStatus === messageSenderStatus.idle;
  }

  get senderNumbersList() {
    return this._extensionPhoneNumber.smsSenderNumbers.map(
      number => number.phoneNumber
    );
  }
}
