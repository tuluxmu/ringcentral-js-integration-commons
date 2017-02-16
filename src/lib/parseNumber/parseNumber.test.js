import { expect } from 'chai';
import parseNumber from '.';

describe('parseNumber', () => {
  it(`should return hasPlus:false, number:'',extension:'',isServiceNumber:false when
  number is ''`, () => {
    expect(parseNumber(' ')).to.deep.equal(
      {
        hasPlus: false,
        number: '',
        extension: '',
        isServiceNumber: false
      }
    );
  });
  it(`should return hasPlus:false, number:'6508370092',extension:'101',isServiceNumber:false
  when number is '6508370092*101'`, () => {
    expect(parseNumber('6508370092*101')).to.deep.equal(
      {
        hasPlus: false,
        number: '6508370092',
        extension: '101',
        isServiceNumber: false
      }
    );
  });
  it(`should return hasPlus:true, number:'6508370092',extension:'101',isServiceNumber:false
  when number is '+16508370092*101'`, () => {
    expect(parseNumber('+16508370092*101')).to.deep.equal(
      {
        hasPlus: true,
        number: '16508370092',
        extension: '101',
        isServiceNumber: false
      }
    );
  });
  it(`should return hasPlus:false, number:'',extension:'',isServiceNumber:false
    when number is 'iamn%@onedi!@$%^&()_=\\][';/.,~nu><.,,?/mber'`, () => {
    expect(parseNumber("iamn%@onedi!@$%^&()_=\\][';/.,~nu><.,,?/mber")).to.deep.equal(
      {
        hasPlus: false,
        number: '',
        extension: '',
        isServiceNumber: false
      }
    );
  });
  it(`should return hasPlus:false, number:'6508370092',extension:'',isServiceNumber:false
    when number is '6508370092'`, () => {
    expect(parseNumber('6508370092')).to.deep.equal(
      {
        hasPlus: false,
        number: '6508370092',
        extension: '',
        isServiceNumber: false
      }
    );
  });
  it(`should return hasPlus:true, number:'16508370092',extension:'',isServiceNumber:false
    when number is '+16508370092'`, () => {
    expect(parseNumber('+16508370092')).to.deep.equal(
      {
        hasPlus: true,
        number: '16508370092',
        extension: '',
        isServiceNumber: false
      }
    );
  });
  it(`should return hasPlus:false, number:'101',extension:'',isServiceNumber:true
    when number is '*101'`, () => {
    expect(parseNumber('*101')).to.deep.equal(
      {
        hasPlus: false,
        number: '101',
        extension: '',
        isServiceNumber: true
      }
    );
  });
});
