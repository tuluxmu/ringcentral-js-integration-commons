export function getDataReducer(types) {
  // use [] instead of null as initial state to avoid add or delete to error out
  // in case initial load failed but an update was made through subscription
  return (state = [], { type, data, id, }) => {
    switch (type) {
      case types.fetchSuccess:
        return data;
      case types.add:
        return [...state, data];
      case types.delete:
        return state.filter(item => item.id !== id);
      case types.resetSuccess:
        return [];
      default:
        return state;
    }
  };
}

export function getTimestampReducer(types) {
  return (state = null, { type, timestamp }) => {
    switch (type) {
      case types.fetchSuccess:
      case types.add:
      case types.delete:
        return timestamp;
      case types.resetSuccess:
        return null;
      default:
        return state;
    }
  };
}
