"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "webdriverMonad", {
  enumerable: true,
  get: function () {
    return _monad.default;
  }
});
Object.defineProperty(exports, "getPrototype", {
  enumerable: true,
  get: function () {
    return _utils.getPrototype;
  }
});
exports.default = void 0;

var _logger = _interopRequireDefault(require("@wdio/logger"));

var _config = require("@wdio/config");

var _monad = _interopRequireDefault(require("./monad"));

var _request = _interopRequireDefault(require("./request"));

var _constants = require("./constants");

var _utils = require("./utils");

var _webdriver = _interopRequireDefault(require("../protocol/webdriver.json"));

var _jsonwp = _interopRequireDefault(require("../protocol/jsonwp.json"));

var _mjsonwp = _interopRequireDefault(require("../protocol/mjsonwp.json"));

var _appium = _interopRequireDefault(require("../protocol/appium.json"));

var _chromium = _interopRequireDefault(require("../protocol/chromium.json"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class WebDriver {
  static async newSession(options = {}, modifier, userPrototype = {}, commandWrapper) {
    const params = (0, _config.validateConfig)(_constants.DEFAULTS, options);

    if (!options.logLevels || !options.logLevels['webdriver']) {
      _logger.default.setLevel('webdriver', params.logLevel);
    }

    const [w3cCaps, jsonwpCaps] = params.capabilities && params.capabilities.alwaysMatch ? [params.capabilities, params.capabilities.alwaysMatch] : [{
      alwaysMatch: params.capabilities,
      firstMatch: [{}]
    }, params.capabilities];
    const sessionRequest = new _request.default('POST', '/session', {
      capabilities: w3cCaps,
      desiredCapabilities: jsonwpCaps
    });
    const response = await sessionRequest.makeRequest(params);
    params.requestedCapabilities = {
      w3cCaps,
      jsonwpCaps
    };
    params.capabilities = response.value.capabilities || response.value;
    const environment = (0, _utils.environmentDetector)(params);
    const environmentPrototype = (0, _utils.getEnvironmentVars)(environment);
    const protocolCommands = (0, _utils.getPrototype)(environment);

    const prototype = _objectSpread({}, protocolCommands, {}, environmentPrototype, {}, userPrototype);

    const monad = (0, _monad.default)(params, modifier, prototype);
    return monad(response.value.sessionId || response.sessionId, commandWrapper);
  }

  static attachToSession(options = {}, modifier, userPrototype = {}, commandWrapper) {
    if (typeof options.sessionId !== 'string') {
      throw new Error('sessionId is required to attach to existing session');
    }

    if (options.logLevel !== undefined) {
      _logger.default.setLevel('webdriver', options.logLevel);
    }

    options.capabilities = options.capabilities || {};
    options.isW3C = options.isW3C === false ? false : true;
    const environmentPrototype = (0, _utils.getEnvironmentVars)(options);
    const protocolCommands = (0, _utils.getPrototype)(options);

    const prototype = _objectSpread({}, protocolCommands, {}, environmentPrototype, {}, userPrototype);

    const monad = (0, _monad.default)(options, modifier, prototype);
    return monad(options.sessionId, commandWrapper);
  }

  static get WebDriver() {
    return WebDriver;
  }

  static get DEFAULTS() {
    return _constants.DEFAULTS;
  }

  static get WebDriverProtocol() {
    return _webdriver.default;
  }

  static get JsonWProtocol() {
    return _jsonwp.default;
  }

  static get MJsonWProtocol() {
    return _mjsonwp.default;
  }

  static get AppiumProtocol() {
    return _appium.default;
  }

  static get ChromiumProtocol() {
    return _chromium.default;
  }

}

exports.default = WebDriver;