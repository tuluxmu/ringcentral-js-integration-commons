import { expect } from 'chai';
import getCacheReducer, {
  getContactSearchReducer,
} from './getCacheReducer';

import contactSearchActionTypes from './contactSearchActionTypes';

describe('ContactSearch :: Cache :: getContactSearchReducer', () => {
  it('should be a function', () => {
    expect(getContactSearchReducer).to.be.a('function');
  });
  it('should return a reducer', () => {
    expect(getContactSearchReducer()).to.be.a('function');
  });
  describe('contactSearchReducer', () => {
    const reducer = getContactSearchReducer(contactSearchActionTypes);
    it('should have empty object for initial state ', () => {
      expect(reducer(undefined, {})).to.deep.equal({});
    });
    it('should return original state of actionTypes is not recognized', () => {
      const originalState = {};
      expect(reducer(originalState, { type: 'foo' }))
        .to.equal(originalState);
    });

    it('should return data with searchString and searceSource as key on save', () => {
      const originalState = { '["dynamics","111"]': {} };
      expect(reducer(originalState, {
        type: contactSearchActionTypes.save,
        entities: [],
        sourceName: 'dynamics',
        searchString: 'searchString',
      })).to.include.keys('["dynamics","111"]', '["dynamics","searchString"]');
    });
    it('should return data with entities on save', () => {
      const originalState = { '["dynamics","111"]': { entities: ['1'] } };
      const expectData = {
        '["dynamics","111"]': { entities: ['1'] },
        '["dynamics","searchString"]': { entities: ['2'] }
      };
      expect(reducer(originalState, {
        type: contactSearchActionTypes.save,
        entities: ['2'],
        sourceName: 'dynamics',
        searchString: 'searchString',
      })['["dynamics","searchString"]'].entities)
        .to.deep.equal(expectData['["dynamics","searchString"]'].entities);
    });
    it('should return data with entities and timestamp as key on save', () => {
      const originalState = { '["dynamics","111"]': { entities: [] } };
      expect(reducer(originalState, {
        type: contactSearchActionTypes.save,
        entities: [],
        sourceName: 'dynamics',
        searchString: 'searchString',
      })['["dynamics","searchString"]']).to.include.keys('entities', 'timestamp');
    });

    it('should return empty object on cleanUp and initSuccess', () => {
      [
        contactSearchActionTypes.initSuccess,
        contactSearchActionTypes.cleanUp,
      ].forEach(type => {
        const originalState = {
          data: { test: 1 }
        };
        expect(reducer(originalState, {
          type,
        })).to.deep.equal({});
      });
    });
  });
});

describe('ContactSearch :: Cache:: getCacheReducer', () => {
  it('should be a function', () => {
    expect(getCacheReducer).to.be.a('function');
  });
  it('should return a reducer', () => {
    expect(getCacheReducer(contactSearchActionTypes)).to.be.a('function');
  });
  describe('contactSearchReducer', () => {
    const reducer = getCacheReducer(contactSearchActionTypes);
    const contactSearchReducer = getContactSearchReducer(contactSearchActionTypes);
    it('should return combined state', () => {
      expect(reducer(undefined, {}))
        .to.deep.equal({
          contactSearch: contactSearchReducer(undefined, {})
        });
    });
  });
});
