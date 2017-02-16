import { expect } from 'chai';
import getContactSearchReducer, {
  getContactSearchStatusReducer,
  getSearchingReducer,
} from './getContactSearchReducer';

import contactSearchActionTypes from './contactSearchActionTypes';
import contactSearchStatus from './contactSearchStatus';

describe('ContactSearch :: getContactSearchStatusReducer', () => {
  it('getContactSearchStatusReducer should be a function', () => {
    expect(getContactSearchStatusReducer).to.be.a('function');
  });
  it('getContactSearchStatusReducer should return a reducer', () => {
    expect(getContactSearchStatusReducer()).to.be.a('function');
  });
  describe('statusReducer', () => {
    const reducer = getContactSearchStatusReducer(contactSearchActionTypes);
    it('should have initial state of idle', () => {
      expect(reducer(undefined, {})).to.equal(contactSearchStatus.idle);
    });
    it('should return original state of actionTypes is not recognized', () => {
      const originalState = {};
      expect(reducer(originalState, { type: 'foo' }))
      .to.equal(originalState);
    });
    it('should return searching status on search', () => {
      [
        contactSearchActionTypes.search,
      ].forEach(type => {
        expect(reducer('foo', {
          type,
        })).to.equal(contactSearchStatus.searching);
      });
    });
    it('should return idle state on prepareSearch, searchSuccess, searchError', () => {
      [
        contactSearchActionTypes.prepareSearch,
        contactSearchActionTypes.searchSuccess,
        contactSearchActionTypes.searchError,
      ].forEach(type => {
        expect(reducer('foo', {
          type,
        })).to.equal(contactSearchStatus.idle);
      });
    });
  });
});

describe('getSearchingReducer', () => {
  it('getSearchingReducer should be a function', () => {
    expect(getSearchingReducer).to.be.a('function');
  });
  it('getSearchingReducer should return a reducer', () => {
    expect(getSearchingReducer()).to.be.a('function');
  });
  describe('searchingReducer', () => {
    const reducer = getSearchingReducer(contactSearchActionTypes);
    const initialState = { searchString: '', result: [] };
    it('should have initial state of null', () => {
      expect(reducer(undefined, {})).to.deep.equal(initialState);
    });
    it('should return original state of actionTypes is not recognized', () => {
      const originalState = {};
      expect(reducer(originalState, { type: 'foo' }))
      .to.equal(originalState);
    });
    it('should return original state on search', () => {
      const originalState = {};
      expect(reducer(originalState, { type: 'search' }))
      .to.equal(originalState);
    });
    it('should return initial state on prepareSearch, reset and searchError', () => {
      [
        contactSearchActionTypes.prepareSearch,
        contactSearchActionTypes.reset,
        contactSearchActionTypes.searchError,
      ].forEach(type => {
        expect(reducer('foo', {
          type,
        })).to.deep.equal(initialState);
      });
    });

    it('should return searchString and result as key on searchSuccess', () => {
      const originalState = {};
      expect(reducer(originalState, {
        type: contactSearchActionTypes.searchSuccess,
        searchString: '123',
        entities: [],
      })).to.include.keys('searchString', 'result');
    });
    it('should return data with searchString on searchSuccess', () => {
      const originalState = {};
      expect(reducer(originalState, {
        type: contactSearchActionTypes.searchSuccess,
        searchString: 'test',
        entities: [],
      }).searchString).to.equal('test');
    });
    it('should return data with result on searchSuccess', () => {
      const originalState = {};
      const entities = [{
        entityType: 'account',
        id: '123',
        name: 'User One',
        phoneNumber: '12345678',
        phoneType: 'mobile'
      }];
      expect(reducer(originalState, {
        type: contactSearchActionTypes.searchSuccess,
        searchString: 'test',
        entities,
      }).result).to.deep.equal(entities);
    });
    it('should return data with result concat with same searchString', () => {
      const originalState = {
        searchString: 'test',
        result: [{
          entityType: 'contact',
          id: '1',
          name: 'User Zero',
          phoneNumber: '1234567890',
          phoneType: 'mobile',
        }]
      };
      const entities = [{
        entityType: 'account',
        id: '123',
        name: 'User One',
        phoneNumber: '12345678',
        phoneType: 'mobile',
      }];
      const expectResult = [
        {
          entityType: 'contact',
          id: '1',
          name: 'User Zero',
          phoneNumber: '1234567890',
          phoneType: 'mobile'
        },
        {
          entityType: 'account',
          id: '123',
          name: 'User One',
          phoneNumber: '12345678',
          phoneType: 'mobile'
        }
      ];
      expect(reducer(originalState, {
        type: contactSearchActionTypes.searchSuccess,
        searchString: 'test',
        entities,
      }).result).to.deep.equal(expectResult);
    });
  });
});
