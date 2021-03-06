export function filterNumbers(numbers, filterNumber) {
  return numbers.filter((number) => {
    if (filterNumber.phoneNumber) {
      return filterNumber.phoneNumber !== number.phoneNumber;
    }
    return filterNumber.extensionNumber !== number.extensionNumber;
  });
}

export function messageIsDeleted(message) {
  return message.availability === 'Deleted';
}

export function messaageIsTextMessage(message) {
  return (message.type !== 'Fax' && message.type !== 'VoiceMail');
}

export function messageIsAcceptable(message) {
  return messaageIsTextMessage(message) && (!messageIsDeleted(message));
}

export function getMyNumberFromMessage({ message, myExtensionNumber }) {
  if (!message) {
    return null;
  }
  if (message.direction === 'Outbound') {
    return message.from;
  }
  if (message.type === 'Pager') {
    const myNumber = message.to.find(number => (
      number.extensionNumber === myExtensionNumber
    ));
    if (myNumber) {
      return myNumber;
    }
    return { extensionNumber: myExtensionNumber };
  }
  return message.to[0];
}

export function getRecipientNumbersFromMessage({ message, myNumber }) {
  if (!message) {
    return [];
  }
  if (message.type === 'SMS') {
    if (message.direction === 'Outbound') {
      return message.to;
    }
    return [message.from];
  }
  const allRecipients = [message.from].concat(message.to);
  const recipients = filterNumbers(allRecipients, myNumber);
  if (recipients.length === 0) {
    recipients.push(myNumber);
  }
  return recipients;
}

export function getRecipients({ message, myExtensionNumber }) {
  const myNumber = getMyNumberFromMessage({
    message,
    myExtensionNumber,
  });
  return getRecipientNumbersFromMessage({
    message,
    myNumber,
  });
}
