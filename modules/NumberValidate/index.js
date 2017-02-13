'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _objectWithoutProperties2 = require('babel-runtime/helpers/objectWithoutProperties');

var _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _RcModule2 = require('../../lib/RcModule');

var _RcModule3 = _interopRequireDefault(_RcModule2);

var _isBlank = require('../../lib/isBlank');

var _isBlank2 = _interopRequireDefault(_isBlank);

var _moduleStatus = require('../../enums/moduleStatus');

var _moduleStatus2 = _interopRequireDefault(_moduleStatus);

var _normalizeNumber = require('../../lib/normalizeNumber');

var _normalizeNumber2 = _interopRequireDefault(_normalizeNumber);

var _cleanNumber = require('../../lib/cleanNumber');

var _cleanNumber2 = _interopRequireDefault(_cleanNumber);

var _parseNumber2 = require('../../lib/parseNumber');

var _parseNumber3 = _interopRequireDefault(_parseNumber2);

var _numberValidateActionTypes = require('./numberValidateActionTypes');

var _numberValidateActionTypes2 = _interopRequireDefault(_numberValidateActionTypes);

var _getNumberValidateReducer = require('./getNumberValidateReducer');

var _getNumberValidateReducer2 = _interopRequireDefault(_getNumberValidateReducer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var NumberValidate = function (_RcModule) {
  (0, _inherits3.default)(NumberValidate, _RcModule);

  function NumberValidate(_ref) {
    var client = _ref.client,
        accountExtension = _ref.accountExtension,
        regionSettings = _ref.regionSettings,
        options = (0, _objectWithoutProperties3.default)(_ref, ['client', 'accountExtension', 'regionSettings']);
    (0, _classCallCheck3.default)(this, NumberValidate);

    var _this = (0, _possibleConstructorReturn3.default)(this, (NumberValidate.__proto__ || (0, _getPrototypeOf2.default)(NumberValidate)).call(this, (0, _extends3.default)({}, options, {
      actionTypes: _numberValidateActionTypes2.default
    })));

    _this._client = client;
    _this._accountExtension = accountExtension;
    _this._regionSettings = regionSettings;
    _this._reducer = (0, _getNumberValidateReducer2.default)(_this.actionTypes);
    return _this;
  }

  (0, _createClass3.default)(NumberValidate, [{
    key: 'initialize',
    value: function initialize() {
      var _this2 = this;

      this.store.subscribe(function () {
        if (_this2._regionSettings.ready && _this2._accountExtension.ready && _this2.status === _moduleStatus2.default.pending) {
          _this2.store.dispatch({
            type: _this2.actionTypes.initSuccess
          });
        } else if ((!_this2._regionSettings.ready || !_this2._accountExtension.ready) && _this2.status === _moduleStatus2.default.ready) {
          _this2.store.dispatch({
            type: _this2.actionTypes.resetSuccess
          });
        }
      });
    }
  }, {
    key: 'isNoToNumber',
    value: function isNoToNumber(phoneNumber) {
      if ((0, _isBlank2.default)(phoneNumber)) {
        return true;
      }
      var cleaned = (0, _cleanNumber2.default)(phoneNumber);
      if (cleaned.length === 0) {
        return true;
      }
      return false;
    }
  }, {
    key: 'isNoAreaCode',
    value: function isNoAreaCode(phoneNumber) {
      var _parseNumber = (0, _parseNumber3.default)(phoneNumber),
          hasPlus = _parseNumber.hasPlus,
          number = _parseNumber.number,
          isServiceNumber = _parseNumber.isServiceNumber;

      if (!isServiceNumber && !hasPlus && number.length === 7 && (this._regionSettings.countryCode === 'CA' || this._regionSettings.countryCode === 'US') && this._regionSettings.areaCode === '') {
        return true;
      }
      return false;
    }
  }, {
    key: '_isSpecial',
    value: function _isSpecial(phoneNumber) {
      return phoneNumber && phoneNumber.special;
    }
  }, {
    key: '_isNotAnExtension',
    value: function _isNotAnExtension(extensionNumber) {
      return extensionNumber && extensionNumber.length <= 5 && !this._accountExtension.isAvailableExtension(extensionNumber);
    }
  }, {
    key: 'validateNumbers',
    value: function () {
      var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(phoneNumbers) {
        var validateResult, validatedNumbers;
        return _regenerator2.default.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                validateResult = null;

                validateResult = this.validateFormat(phoneNumbers);

                if (validateResult.result) {
                  _context.next = 4;
                  break;
                }

                return _context.abrupt('return', validateResult);

              case 4:
                _context.next = 6;
                return this.validateWithNumberParser(phoneNumbers);

              case 6:
                validatedNumbers = _context.sent;
                return _context.abrupt('return', validatedNumbers);

              case 8:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function validateNumbers(_x) {
        return _ref2.apply(this, arguments);
      }

      return validateNumbers;
    }()
  }, {
    key: 'validateFormat',
    value: function validateFormat(phoneNumbers) {
      var _this3 = this;

      var errors = [];
      phoneNumbers.map(function (phoneNumber) {
        if (_this3.isNoToNumber(phoneNumber)) {
          errors.push({ phoneNumber: phoneNumber, type: 'noToNumber' });
          return null;
        }
        if (_this3.isNoAreaCode(phoneNumber)) {
          errors.push({ phoneNumber: phoneNumber, type: 'noAreaCode' });
        }
        return null;
      });
      return {
        result: errors.length === 0,
        errors: errors
      };
    }
  }, {
    key: 'validateWithNumberParser',
    value: function () {
      var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(phoneNumbers) {
        var _this4 = this;

        var pasedNumers, errors, validatedPhoneNumbers;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _context2.next = 2;
                return this._numberParser(phoneNumbers);

              case 2:
                pasedNumers = _context2.sent;
                errors = [];
                validatedPhoneNumbers = [];

                pasedNumers.map(function (phoneNumber) {
                  if (_this4._isSpecial(phoneNumber)) {
                    errors.push({ phoneNumber: phoneNumber.originalString, type: 'specialNumber' });
                    return null;
                  }
                  if (_this4._isNotAnExtension(phoneNumber.originalString)) {
                    errors.push({ phoneNumber: phoneNumber.originalString, type: 'notAnExtension' });
                    return null;
                  }
                  validatedPhoneNumbers.push(phoneNumber);
                  return null;
                });
                return _context2.abrupt('return', {
                  result: errors.length === 0,
                  numbers: validatedPhoneNumbers,
                  errors: errors
                });

              case 7:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function validateWithNumberParser(_x2) {
        return _ref3.apply(this, arguments);
      }

      return validateWithNumberParser;
    }()
  }, {
    key: '_numberParser',
    value: function () {
      var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(phoneNumbers) {
        var countryCode, areaCode, homeCountry, normalizedNumbers, response;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                countryCode = this._regionSettings.countryCode;
                areaCode = this._regionSettings.areaCode;
                homeCountry = countryCode ? { homeCountry: countryCode } : {};
                normalizedNumbers = phoneNumbers.map(function (phoneNumber) {
                  return (0, _normalizeNumber2.default)({ phoneNumber: phoneNumber, countryCode: countryCode, areaCode: areaCode });
                });
                _context3.next = 6;
                return this._client.numberParser().parse().post({
                  originalStrings: normalizedNumbers
                }, homeCountry);

              case 6:
                response = _context3.sent;
                return _context3.abrupt('return', response.phoneNumbers);

              case 8:
              case 'end':
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function _numberParser(_x3) {
        return _ref4.apply(this, arguments);
      }

      return _numberParser;
    }()
  }, {
    key: 'status',
    get: function get() {
      return this.state.status;
    }
  }, {
    key: 'ready',
    get: function get() {
      return this.status === _moduleStatus2.default.ready;
    }
  }]);
  return NumberValidate;
}(_RcModule3.default);

exports.default = NumberValidate;
//# sourceMappingURL=index.js.map