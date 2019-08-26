"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isErrorType = isErrorType;
exports.isUnknownError = isUnknownError;
exports.errorFromMJSONWPStatusCode = errorFromMJSONWPStatusCode;
exports.errorFromW3CJsonCode = errorFromW3CJsonCode;
exports.getResponseForW3CError = getResponseForW3CError;
exports.getResponseForJsonwpError = getResponseForJsonwpError;
exports.errors = exports.ProtocolError = void 0;

require("source-map-support/register");

var _es6Error = _interopRequireDefault(require("es6-error"));

var _lodash = _interopRequireDefault(require("lodash"));

var _appiumSupport = require("appium-support");

var _httpStatusCodes = _interopRequireDefault(require("http-status-codes"));

const mjsonwpLog = _appiumSupport.logger.getLogger('MJSONWP');

const w3cLog = _appiumSupport.logger.getLogger('W3C');

const W3C_UNKNOWN_ERROR = 'unknown error';

class ProtocolError extends _es6Error.default {
  constructor(msg, jsonwpCode, w3cStatus, error) {
    super(msg);
    this.jsonwpCode = jsonwpCode;
    this.error = error || W3C_UNKNOWN_ERROR;

    if (this.jsonwpCode === null) {
      this.jsonwpCode = 13;
    }

    this.w3cStatus = w3cStatus || _httpStatusCodes.default.BAD_REQUEST;
    this._stacktrace = null;
  }

  get stacktrace() {
    return this._stacktrace || this.stack;
  }

  set stacktrace(value) {
    this._stacktrace = value;
  }

}

exports.ProtocolError = ProtocolError;

class NoSuchDriverError extends ProtocolError {
  static code() {
    return 6;
  }

  static w3cStatus() {
    return _httpStatusCodes.default.NOT_FOUND;
  }

  static error() {
    return 'invalid session id';
  }

  constructor(err) {
    super(err || 'A session is either terminated or not started', NoSuchDriverError.code(), NoSuchDriverError.w3cStatus(), NoSuchDriverError.error());
  }

}

class NoSuchElementError extends ProtocolError {
  static code() {
    return 7;
  }

  static w3cStatus() {
    return _httpStatusCodes.default.NOT_FOUND;
  }

  static error() {
    return 'no such element';
  }

  constructor(err) {
    super(err || 'An element could not be located on the page using the given ' + 'search parameters.', NoSuchElementError.code(), NoSuchElementError.w3cStatus(), NoSuchElementError.error());
  }

}

class NoSuchFrameError extends ProtocolError {
  static code() {
    return 8;
  }

  static error() {
    return 'no such frame';
  }

  static w3cStatus() {
    return _httpStatusCodes.default.NOT_FOUND;
  }

  constructor(err) {
    super(err || 'A request to switch to a frame could not be satisfied because ' + 'the frame could not be found.', NoSuchFrameError.code(), NoSuchFrameError.w3cStatus(), NoSuchFrameError.error());
  }

}

class UnknownCommandError extends ProtocolError {
  static code() {
    return 9;
  }

  static w3cStatus() {
    return _httpStatusCodes.default.NOT_FOUND;
  }

  static error() {
    return 'unknown command';
  }

  constructor(err) {
    super(err || 'The requested resource could not be found, or a request was ' + 'received using an HTTP method that is not supported by the mapped ' + 'resource.', UnknownCommandError.code(), UnknownCommandError.w3cStatus(), UnknownCommandError.error());
  }

}

class StaleElementReferenceError extends ProtocolError {
  static code() {
    return 10;
  }

  static w3cStatus() {
    return _httpStatusCodes.default.NOT_FOUND;
  }

  static error() {
    return 'stale element reference';
  }

  constructor(err) {
    super(err || 'An element command failed because the referenced element is no ' + 'longer attached to the DOM.', StaleElementReferenceError.code(), StaleElementReferenceError.w3cStatus(), StaleElementReferenceError.error());
  }

}

class ElementNotVisibleError extends ProtocolError {
  static code() {
    return 11;
  }

  static w3cStatus() {
    return _httpStatusCodes.default.BAD_REQUEST;
  }

  static error() {
    return 'element not visible';
  }

  constructor(err) {
    super(err || 'An element command could not be completed because the element is ' + 'not visible on the page.', ElementNotVisibleError.code(), ElementNotVisibleError.w3cStatus(), ElementNotVisibleError.error());
  }

}

class InvalidElementStateError extends ProtocolError {
  static code() {
    return 12;
  }

  static w3cStatus() {
    return _httpStatusCodes.default.BAD_REQUEST;
  }

  static error() {
    return 'invalid element state';
  }

  constructor(err) {
    super(err || 'An element command could not be completed because the element is ' + 'in an invalid state (e.g. attempting to click a disabled element).', InvalidElementStateError.code(), InvalidElementStateError.w3cStatus(), InvalidElementStateError.error());
  }

}

class UnknownError extends ProtocolError {
  static code() {
    return 13;
  }

  static w3cStatus() {
    return _httpStatusCodes.default.INTERNAL_SERVER_ERROR;
  }

  static error() {
    return W3C_UNKNOWN_ERROR;
  }

  constructor(originalError) {
    let origMessage = originalError;

    if (originalError instanceof Error) {
      origMessage = originalError.message;
    }

    let message = 'An unknown server-side error occurred while processing ' + 'the command.';

    if (originalError) {
      message = `${message} Original error: ${origMessage}`;
    }

    super(message, UnknownError.code(), UnknownError.w3cStatus(), UnknownError.error());
  }

}

class UnknownMethodError extends ProtocolError {
  static code() {
    return 405;
  }

  static w3cStatus() {
    return _httpStatusCodes.default.METHOD_NOT_ALLOWED;
  }

  static error() {
    return 'unknown method';
  }

  constructor(err) {
    super(err || 'The requested command matched a known URL but did not match an method for that URL', UnknownMethodError.code(), UnknownMethodError.w3cStatus(), UnknownMethodError.error());
  }

}

class UnsupportedOperationError extends ProtocolError {
  static code() {
    return 405;
  }

  static w3cStatus() {
    return _httpStatusCodes.default.INTERNAL_SERVER_ERROR;
  }

  static error() {
    return 'unsupported operation';
  }

  constructor(err) {
    super(err || 'A server-side error occurred. Command cannot be supported.', UnsupportedOperationError.code(), UnsupportedOperationError.w3cStatus(), UnsupportedOperationError.error());
  }

}

class ElementIsNotSelectableError extends ProtocolError {
  static code() {
    return 15;
  }

  static error() {
    return 'element not selectable';
  }

  static w3cStatus() {
    return _httpStatusCodes.default.BAD_REQUEST;
  }

  constructor(err) {
    super(err || 'An attempt was made to select an element that cannot be selected.', ElementIsNotSelectableError.code(), ElementIsNotSelectableError.w3cStatus(), ElementIsNotSelectableError.error());
  }

}

class ElementClickInterceptedError extends ProtocolError {
  static code() {
    return 64;
  }

  static error() {
    return 'element click intercepted';
  }

  static w3cStatus() {
    return _httpStatusCodes.default.BAD_REQUEST;
  }

  constructor(err) {
    super(err || 'The Element Click command could not be completed because the element receiving ' + 'the events is obscuring the element that was requested clicked', ElementClickInterceptedError.code(), ElementClickInterceptedError.w3cStatus(), ElementClickInterceptedError.error());
  }

}

class ElementNotInteractableError extends ProtocolError {
  static code() {
    return 60;
  }

  static error() {
    return 'element not interactable';
  }

  static w3cStatus() {
    return _httpStatusCodes.default.BAD_REQUEST;
  }

  constructor(err) {
    super(err || 'A command could not be completed because the element is not pointer- or keyboard interactable', ElementNotInteractableError.code(), ElementNotInteractableError.w3cStatus(), ElementNotInteractableError.error());
  }

}

class InsecureCertificateError extends ProtocolError {
  static error() {
    return 'insecure certificate';
  }

  constructor(err) {
    super(err || 'Navigation caused the user agent to hit a certificate warning, which is usually the result of an expired or invalid TLS certificate', ElementIsNotSelectableError.code(), null, InsecureCertificateError.error());
  }

}

class JavaScriptError extends ProtocolError {
  static code() {
    return 17;
  }

  static w3cStatus() {
    return _httpStatusCodes.default.INTERNAL_SERVER_ERROR;
  }

  static error() {
    return 'javascript error';
  }

  constructor(err) {
    super(err || 'An error occurred while executing user supplied JavaScript.', JavaScriptError.code(), JavaScriptError.w3cStatus(), JavaScriptError.error());
  }

}

class XPathLookupError extends ProtocolError {
  static code() {
    return 19;
  }

  static w3cStatus() {
    return _httpStatusCodes.default.BAD_REQUEST;
  }

  static error() {
    return 'invalid selector';
  }

  constructor(err) {
    super(err || 'An error occurred while searching for an element by XPath.', XPathLookupError.code(), XPathLookupError.w3cStatus(), XPathLookupError.error());
  }

}

class TimeoutError extends ProtocolError {
  static code() {
    return 21;
  }

  static w3cStatus() {
    return _httpStatusCodes.default.REQUEST_TIMEOUT;
  }

  static error() {
    return 'timeout';
  }

  constructor(err) {
    super(err || 'An operation did not complete before its timeout expired.', TimeoutError.code(), TimeoutError.w3cStatus(), TimeoutError.error());
  }

}

class NoSuchWindowError extends ProtocolError {
  static code() {
    return 23;
  }

  static error() {
    return 'no such window';
  }

  static w3cStatus() {
    return _httpStatusCodes.default.NOT_FOUND;
  }

  constructor(err) {
    super(err || 'A request to switch to a different window could not be satisfied ' + 'because the window could not be found.', NoSuchWindowError.code(), NoSuchWindowError.w3cStatus(), NoSuchWindowError.error());
  }

}

class InvalidArgumentError extends ProtocolError {
  static code() {
    return 61;
  }

  static error() {
    return 'invalid argument';
  }

  static w3cStatus() {
    return _httpStatusCodes.default.BAD_REQUEST;
  }

  constructor(err) {
    super(err || 'The arguments passed to the command are either invalid or malformed', InvalidArgumentError.code(), InvalidArgumentError.w3cStatus(), InvalidArgumentError.error());
  }

}

class InvalidCookieDomainError extends ProtocolError {
  static code() {
    return 24;
  }

  static error() {
    return 'invalid cookie domain';
  }

  static w3cStatus() {
    return _httpStatusCodes.default.BAD_REQUEST;
  }

  constructor(err) {
    super(err || 'An illegal attempt was made to set a cookie under a different ' + 'domain than the current page.', InvalidCookieDomainError.code(), InvalidCookieDomainError.w3cStatus(), InvalidCookieDomainError.error());
  }

}

class NoSuchCookieError extends ProtocolError {
  static code() {
    return 62;
  }

  static w3cStatus() {
    return _httpStatusCodes.default.NOT_FOUND;
  }

  static error() {
    return 'no such cookie';
  }

  constructor(err) {
    super(err || 'No cookie matching the given path name was found amongst the associated cookies of the current browsing context’s active document', NoSuchCookieError.code(), NoSuchCookieError.w3cStatus(), NoSuchCookieError.error());
  }

}

class UnableToSetCookieError extends ProtocolError {
  static code() {
    return 25;
  }

  static w3cStatus() {
    return _httpStatusCodes.default.INTERNAL_SERVER_ERROR;
  }

  static error() {
    return 'unable to set cookie';
  }

  constructor(err) {
    super(err || 'A request to set a cookie\'s value could not be satisfied.', UnableToSetCookieError.code(), UnableToSetCookieError.w3cStatus(), UnableToSetCookieError.error());
  }

}

class UnexpectedAlertOpenError extends ProtocolError {
  static code() {
    return 26;
  }

  static w3cStatus() {
    return _httpStatusCodes.default.INTERNAL_SERVER_ERROR;
  }

  static error() {
    return 'unexpected alert open';
  }

  constructor(err) {
    super(err || 'A modal dialog was open, blocking this operation', UnexpectedAlertOpenError.code(), UnexpectedAlertOpenError.w3cStatus(), UnexpectedAlertOpenError.error());
  }

}

class NoAlertOpenError extends ProtocolError {
  static code() {
    return 27;
  }

  static w3cStatus() {
    return _httpStatusCodes.default.NOT_FOUND;
  }

  static error() {
    return 'no such alert';
  }

  constructor(err) {
    super(err || 'An attempt was made to operate on a modal dialog when one ' + 'was not open.', NoAlertOpenError.code(), NoAlertOpenError.w3cStatus(), NoAlertOpenError.error());
  }

}

class NoSuchAlertError extends NoAlertOpenError {}

class ScriptTimeoutError extends ProtocolError {
  static code() {
    return 28;
  }

  static w3cStatus() {
    return _httpStatusCodes.default.REQUEST_TIMEOUT;
  }

  static error() {
    return 'script timeout';
  }

  constructor(err) {
    super(err || 'A script did not complete before its timeout expired.', ScriptTimeoutError.code(), ScriptTimeoutError.w3cStatus(), ScriptTimeoutError.error());
  }

}

class InvalidElementCoordinatesError extends ProtocolError {
  static code() {
    return 29;
  }

  static w3cStatus() {
    return _httpStatusCodes.default.BAD_REQUEST;
  }

  static error() {
    return 'invalid coordinates';
  }

  constructor(err) {
    super(err || 'The coordinates provided to an interactions operation are invalid.', InvalidElementCoordinatesError.code(), InvalidElementCoordinatesError.w3cStatus(), InvalidElementCoordinatesError.error());
  }

}

class InvalidCoordinatesError extends InvalidElementCoordinatesError {}

class IMENotAvailableError extends ProtocolError {
  static code() {
    return 30;
  }

  static w3cStatus() {
    return _httpStatusCodes.default.INTERNAL_SERVER_ERROR;
  }

  static error() {
    return 'unsupported operation';
  }

  constructor(err) {
    super(err || 'IME was not available.', IMENotAvailableError.code(), IMENotAvailableError.w3cStatus(), IMENotAvailableError.error());
  }

}

class IMEEngineActivationFailedError extends ProtocolError {
  static code() {
    return 31;
  }

  static w3cStatus() {
    return _httpStatusCodes.default.INTERNAL_SERVER_ERROR;
  }

  static error() {
    return 'unsupported operation';
  }

  constructor(err) {
    super(err || 'An IME engine could not be started.', IMEEngineActivationFailedError.code(), IMEEngineActivationFailedError.w3cStatus(), IMEEngineActivationFailedError.error());
  }

}

class InvalidSelectorError extends ProtocolError {
  static code() {
    return 32;
  }

  static w3cStatus() {
    return _httpStatusCodes.default.BAD_REQUEST;
  }

  static error() {
    return 'invalid selector';
  }

  constructor(err) {
    super(err || 'Argument was an invalid selector (e.g. XPath/CSS).', InvalidSelectorError.code(), InvalidSelectorError.w3cStatus(), InvalidSelectorError.error());
  }

}

class SessionNotCreatedError extends ProtocolError {
  static code() {
    return 33;
  }

  static w3cStatus() {
    return _httpStatusCodes.default.INTERNAL_SERVER_ERROR;
  }

  static error() {
    return 'session not created';
  }

  constructor(details) {
    let message = 'A new session could not be created.';

    if (details) {
      message += ` Details: ${details}`;
    }

    super(message, SessionNotCreatedError.code(), SessionNotCreatedError.w3cStatus(), SessionNotCreatedError.error());
  }

}

class MoveTargetOutOfBoundsError extends ProtocolError {
  static code() {
    return 34;
  }

  static w3cStatus() {
    return _httpStatusCodes.default.INTERNAL_SERVER_ERROR;
  }

  static error() {
    return 'move target out of bounds';
  }

  constructor(err) {
    super(err || 'Target provided for a move action is out of bounds.', MoveTargetOutOfBoundsError.code(), MoveTargetOutOfBoundsError.w3cStatus(), MoveTargetOutOfBoundsError.error());
  }

}

class NoSuchContextError extends ProtocolError {
  static code() {
    return 35;
  }

  constructor(err) {
    super(err || 'No such context found.', NoSuchContextError.code());
  }

}

class InvalidContextError extends ProtocolError {
  static code() {
    return 36;
  }

  constructor(err) {
    super(err || 'That command could not be executed in the current context.', InvalidContextError.code());
  }

}

class NotYetImplementedError extends ProtocolError {
  static code() {
    return 13;
  }

  static w3cStatus() {
    return _httpStatusCodes.default.NOT_FOUND;
  }

  static error() {
    return 'unknown method';
  }

  constructor(err) {
    super(err || 'Method has not yet been implemented', NotYetImplementedError.code(), NotYetImplementedError.w3cStatus(), NotYetImplementedError.error());
  }

}

class NotImplementedError extends ProtocolError {
  static code() {
    return 13;
  }

  static w3cStatus() {
    return _httpStatusCodes.default.METHOD_NOT_ALLOWED;
  }

  constructor(err) {
    super(err || 'Method is not implemented', NotImplementedError.code(), NotImplementedError.w3cStatus());
  }

}

class UnableToCaptureScreen extends ProtocolError {
  static code() {
    return 63;
  }

  static w3cStatus() {
    return _httpStatusCodes.default.INTERNAL_SERVER_ERROR;
  }

  static error() {
    return 'unable to capture screen';
  }

  constructor(err) {
    super(err || 'A screen capture was made impossible', UnableToCaptureScreen.code(), UnableToCaptureScreen.w3cStatus(), UnableToCaptureScreen.error());
  }

}

class BadParametersError extends _es6Error.default {
  static error() {
    return 'invalid argument';
  }

  constructor(requiredParams, actualParams, errMessage) {
    let message;

    if (!errMessage) {
      message = `Parameters were incorrect. We wanted ` + `${JSON.stringify(requiredParams)} and you ` + `sent ${JSON.stringify(actualParams)}`;
    } else {
      message = `Parameters were incorrect. You sent ${JSON.stringify(actualParams)}, ${errMessage}`;
    }

    super(message);
    this.w3cStatus = _httpStatusCodes.default.BAD_REQUEST;
  }

}

class ProxyRequestError extends _es6Error.default {
  constructor(err, responseError, httpStatus) {
    let responseErrorObj = _appiumSupport.util.safeJsonParse(responseError);

    if (!_lodash.default.isPlainObject(responseErrorObj)) {
      responseErrorObj = {};
    }

    let origMessage = _lodash.default.isString(responseError) ? responseError : '';

    if (!_lodash.default.isEmpty(responseErrorObj)) {
      if (_lodash.default.isString(responseErrorObj.value)) {
        origMessage = responseErrorObj.value;
      } else if (_lodash.default.isPlainObject(responseErrorObj.value) && _lodash.default.isString(responseErrorObj.value.message)) {
        origMessage = responseErrorObj.value.message;
      }
    }

    super(_lodash.default.isEmpty(err) ? `Proxy request unsuccessful. ${origMessage}` : err);
    this.w3cStatus = _httpStatusCodes.default.BAD_REQUEST;

    if (_lodash.default.isPlainObject(responseErrorObj.value) && _lodash.default.has(responseErrorObj.value, 'error')) {
      this.w3c = responseErrorObj.value;
      this.w3cStatus = httpStatus || _httpStatusCodes.default.BAD_REQUEST;
    } else {
      this.jsonwp = responseErrorObj;
    }
  }

  getActualError() {
    if (_appiumSupport.util.hasValue(this.jsonwp) && _appiumSupport.util.hasValue(this.jsonwp.status) && _appiumSupport.util.hasValue(this.jsonwp.value)) {
      return errorFromMJSONWPStatusCode(this.jsonwp.status, this.jsonwp.value);
    } else if (_appiumSupport.util.hasValue(this.w3c) && _lodash.default.isNumber(this.w3cStatus) && this.w3cStatus >= 300) {
      return errorFromW3CJsonCode(this.w3c.error, this.w3c.message || this.message, this.w3c.stacktrace);
    }

    return new UnknownError(this.message);
  }

}

const errors = {
  NotYetImplementedError,
  NotImplementedError,
  BadParametersError,
  InvalidArgumentError,
  NoSuchDriverError,
  NoSuchElementError,
  UnknownCommandError,
  StaleElementReferenceError,
  ElementNotVisibleError,
  InvalidElementStateError,
  UnknownError,
  ElementIsNotSelectableError,
  ElementClickInterceptedError,
  ElementNotInteractableError,
  InsecureCertificateError,
  JavaScriptError,
  XPathLookupError,
  TimeoutError,
  NoSuchWindowError,
  NoSuchCookieError,
  InvalidCookieDomainError,
  InvalidCoordinatesError,
  UnableToSetCookieError,
  UnexpectedAlertOpenError,
  NoAlertOpenError,
  ScriptTimeoutError,
  InvalidElementCoordinatesError,
  IMENotAvailableError,
  IMEEngineActivationFailedError,
  InvalidSelectorError,
  SessionNotCreatedError,
  MoveTargetOutOfBoundsError,
  NoSuchAlertError,
  NoSuchContextError,
  InvalidContextError,
  NoSuchFrameError,
  UnableToCaptureScreen,
  UnknownMethodError,
  UnsupportedOperationError,
  ProxyRequestError
};
exports.errors = errors;
const jsonwpErrorCodeMap = {};

for (let ErrorClass of _lodash.default.values(errors)) {
  if (ErrorClass.code) {
    jsonwpErrorCodeMap[ErrorClass.code()] = ErrorClass;
  }
}

const w3cErrorCodeMap = {};

for (let ErrorClass of _lodash.default.values(errors)) {
  if (ErrorClass.error) {
    w3cErrorCodeMap[ErrorClass.error()] = ErrorClass;
  }
}

function isUnknownError(err) {
  return !err.constructor.name || !_lodash.default.values(errors).find(function equalNames(error) {
    return error.name === err.constructor.name;
  });
}

function isErrorType(err, type) {
  if (type.name === ProtocolError.name) {
    return !!err.jsonwpCode;
  } else if (type.name === ProxyRequestError.name) {
    if (err.jsonwp) {
      return !!err.jsonwp.status;
    }

    if (_lodash.default.isPlainObject(err.w3c)) {
      return _lodash.default.isNumber(err.w3cStatus) && err.w3cStatus >= 300;
    }

    return false;
  }

  return err.constructor.name === type.name;
}

function errorFromMJSONWPStatusCode(code, value = '') {
  const message = (value || {}).message || value || '';

  if (code !== UnknownError.code() && jsonwpErrorCodeMap[code]) {
    mjsonwpLog.debug(`Matched JSONWP error code ${code} to ${jsonwpErrorCodeMap[code].name}`);
    return new jsonwpErrorCodeMap[code](message);
  }

  mjsonwpLog.debug(`Matched JSONWP error code ${code} to UnknownError`);
  return new UnknownError(message);
}

function errorFromW3CJsonCode(code, message, stacktrace = null) {
  if (code && w3cErrorCodeMap[code.toLowerCase()]) {
    w3cLog.debug(`Matched W3C error code '${code}' to ${w3cErrorCodeMap[code.toLowerCase()].name}`);
    const resultError = new w3cErrorCodeMap[code.toLowerCase()](message);
    resultError.stacktrace = stacktrace;
    return resultError;
  }

  w3cLog.debug(`Matched W3C error code '${code}' to UnknownError`);
  const resultError = new UnknownError(message);
  resultError.stacktrace = stacktrace;
  return resultError;
}

function getResponseForW3CError(err) {
  let httpStatus;
  let w3cErrorString;

  if (!err.w3cStatus) {
    err = _appiumSupport.util.hasValue(err.status) ? errorFromMJSONWPStatusCode(err.status, err.value) : new errors.UnknownError(err.message);
  }

  if (isErrorType(err, errors.BadParametersError)) {
    w3cLog.debug(`Bad parameters: ${err}`);
    w3cErrorString = BadParametersError.error();
  } else {
    w3cErrorString = err.error;
  }

  httpStatus = err.w3cStatus;

  if (!w3cErrorString) {
    w3cErrorString = UnknownError.error();
  }

  let httpResBody = {
    value: {
      error: w3cErrorString,
      message: err.message,
      stacktrace: err.stacktrace || err.stack
    }
  };
  return [httpStatus, httpResBody];
}

function getResponseForJsonwpError(err) {
  if (isUnknownError(err)) {
    err = new errors.UnknownError(err);
  }

  let httpStatus = _httpStatusCodes.default.INTERNAL_SERVER_ERROR;
  let httpResBody = {
    status: err.jsonwpCode,
    value: {
      message: err.message
    }
  };

  if (isErrorType(err, errors.BadParametersError)) {
    mjsonwpLog.debug(`Bad parameters: ${err}`);
    httpStatus = _httpStatusCodes.default.BAD_REQUEST;
    httpResBody = err.message;
  } else if (isErrorType(err, errors.NotYetImplementedError) || isErrorType(err, errors.NotImplementedError)) {
    httpStatus = _httpStatusCodes.default.NOT_IMPLEMENTED;
  } else if (isErrorType(err, errors.NoSuchDriverError)) {
    httpStatus = _httpStatusCodes.default.NOT_FOUND;
  }

  return [httpStatus, httpResBody];
}require('source-map-support').install();


//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9wcm90b2NvbC9lcnJvcnMuanMiXSwibmFtZXMiOlsibWpzb253cExvZyIsImxvZ2dlciIsImdldExvZ2dlciIsInczY0xvZyIsIlczQ19VTktOT1dOX0VSUk9SIiwiUHJvdG9jb2xFcnJvciIsIkVTNkVycm9yIiwiY29uc3RydWN0b3IiLCJtc2ciLCJqc29ud3BDb2RlIiwidzNjU3RhdHVzIiwiZXJyb3IiLCJIVFRQU3RhdHVzQ29kZXMiLCJCQURfUkVRVUVTVCIsIl9zdGFja3RyYWNlIiwic3RhY2t0cmFjZSIsInN0YWNrIiwidmFsdWUiLCJOb1N1Y2hEcml2ZXJFcnJvciIsImNvZGUiLCJOT1RfRk9VTkQiLCJlcnIiLCJOb1N1Y2hFbGVtZW50RXJyb3IiLCJOb1N1Y2hGcmFtZUVycm9yIiwiVW5rbm93bkNvbW1hbmRFcnJvciIsIlN0YWxlRWxlbWVudFJlZmVyZW5jZUVycm9yIiwiRWxlbWVudE5vdFZpc2libGVFcnJvciIsIkludmFsaWRFbGVtZW50U3RhdGVFcnJvciIsIlVua25vd25FcnJvciIsIklOVEVSTkFMX1NFUlZFUl9FUlJPUiIsIm9yaWdpbmFsRXJyb3IiLCJvcmlnTWVzc2FnZSIsIkVycm9yIiwibWVzc2FnZSIsIlVua25vd25NZXRob2RFcnJvciIsIk1FVEhPRF9OT1RfQUxMT1dFRCIsIlVuc3VwcG9ydGVkT3BlcmF0aW9uRXJyb3IiLCJFbGVtZW50SXNOb3RTZWxlY3RhYmxlRXJyb3IiLCJFbGVtZW50Q2xpY2tJbnRlcmNlcHRlZEVycm9yIiwiRWxlbWVudE5vdEludGVyYWN0YWJsZUVycm9yIiwiSW5zZWN1cmVDZXJ0aWZpY2F0ZUVycm9yIiwiSmF2YVNjcmlwdEVycm9yIiwiWFBhdGhMb29rdXBFcnJvciIsIlRpbWVvdXRFcnJvciIsIlJFUVVFU1RfVElNRU9VVCIsIk5vU3VjaFdpbmRvd0Vycm9yIiwiSW52YWxpZEFyZ3VtZW50RXJyb3IiLCJJbnZhbGlkQ29va2llRG9tYWluRXJyb3IiLCJOb1N1Y2hDb29raWVFcnJvciIsIlVuYWJsZVRvU2V0Q29va2llRXJyb3IiLCJVbmV4cGVjdGVkQWxlcnRPcGVuRXJyb3IiLCJOb0FsZXJ0T3BlbkVycm9yIiwiTm9TdWNoQWxlcnRFcnJvciIsIlNjcmlwdFRpbWVvdXRFcnJvciIsIkludmFsaWRFbGVtZW50Q29vcmRpbmF0ZXNFcnJvciIsIkludmFsaWRDb29yZGluYXRlc0Vycm9yIiwiSU1FTm90QXZhaWxhYmxlRXJyb3IiLCJJTUVFbmdpbmVBY3RpdmF0aW9uRmFpbGVkRXJyb3IiLCJJbnZhbGlkU2VsZWN0b3JFcnJvciIsIlNlc3Npb25Ob3RDcmVhdGVkRXJyb3IiLCJkZXRhaWxzIiwiTW92ZVRhcmdldE91dE9mQm91bmRzRXJyb3IiLCJOb1N1Y2hDb250ZXh0RXJyb3IiLCJJbnZhbGlkQ29udGV4dEVycm9yIiwiTm90WWV0SW1wbGVtZW50ZWRFcnJvciIsIk5vdEltcGxlbWVudGVkRXJyb3IiLCJVbmFibGVUb0NhcHR1cmVTY3JlZW4iLCJCYWRQYXJhbWV0ZXJzRXJyb3IiLCJyZXF1aXJlZFBhcmFtcyIsImFjdHVhbFBhcmFtcyIsImVyck1lc3NhZ2UiLCJKU09OIiwic3RyaW5naWZ5IiwiUHJveHlSZXF1ZXN0RXJyb3IiLCJyZXNwb25zZUVycm9yIiwiaHR0cFN0YXR1cyIsInJlc3BvbnNlRXJyb3JPYmoiLCJ1dGlsIiwic2FmZUpzb25QYXJzZSIsIl8iLCJpc1BsYWluT2JqZWN0IiwiaXNTdHJpbmciLCJpc0VtcHR5IiwiaGFzIiwidzNjIiwianNvbndwIiwiZ2V0QWN0dWFsRXJyb3IiLCJoYXNWYWx1ZSIsInN0YXR1cyIsImVycm9yRnJvbU1KU09OV1BTdGF0dXNDb2RlIiwiaXNOdW1iZXIiLCJlcnJvckZyb21XM0NKc29uQ29kZSIsImVycm9ycyIsImpzb253cEVycm9yQ29kZU1hcCIsIkVycm9yQ2xhc3MiLCJ2YWx1ZXMiLCJ3M2NFcnJvckNvZGVNYXAiLCJpc1Vua25vd25FcnJvciIsIm5hbWUiLCJmaW5kIiwiZXF1YWxOYW1lcyIsImlzRXJyb3JUeXBlIiwidHlwZSIsImRlYnVnIiwidG9Mb3dlckNhc2UiLCJyZXN1bHRFcnJvciIsImdldFJlc3BvbnNlRm9yVzNDRXJyb3IiLCJ3M2NFcnJvclN0cmluZyIsImh0dHBSZXNCb2R5IiwiZ2V0UmVzcG9uc2VGb3JKc29ud3BFcnJvciIsIk5PVF9JTVBMRU1FTlRFRCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQSxNQUFNQSxVQUFVLEdBQUdDLHNCQUFPQyxTQUFQLENBQWlCLFNBQWpCLENBQW5COztBQUNBLE1BQU1DLE1BQU0sR0FBR0Ysc0JBQU9DLFNBQVAsQ0FBaUIsS0FBakIsQ0FBZjs7QUFFQSxNQUFNRSxpQkFBaUIsR0FBRyxlQUExQjs7QUFHQSxNQUFNQyxhQUFOLFNBQTRCQyxpQkFBNUIsQ0FBcUM7QUFDbkNDLEVBQUFBLFdBQVcsQ0FBRUMsR0FBRixFQUFPQyxVQUFQLEVBQW1CQyxTQUFuQixFQUE4QkMsS0FBOUIsRUFBcUM7QUFDOUMsVUFBTUgsR0FBTjtBQUNBLFNBQUtDLFVBQUwsR0FBa0JBLFVBQWxCO0FBQ0EsU0FBS0UsS0FBTCxHQUFhQSxLQUFLLElBQUlQLGlCQUF0Qjs7QUFDQSxRQUFJLEtBQUtLLFVBQUwsS0FBb0IsSUFBeEIsRUFBOEI7QUFDNUIsV0FBS0EsVUFBTCxHQUFrQixFQUFsQjtBQUNEOztBQUNELFNBQUtDLFNBQUwsR0FBaUJBLFNBQVMsSUFBSUUseUJBQWdCQyxXQUE5QztBQUNBLFNBQUtDLFdBQUwsR0FBbUIsSUFBbkI7QUFDRDs7QUFFRCxNQUFJQyxVQUFKLEdBQWtCO0FBQ2hCLFdBQU8sS0FBS0QsV0FBTCxJQUFvQixLQUFLRSxLQUFoQztBQUNEOztBQUVELE1BQUlELFVBQUosQ0FBZ0JFLEtBQWhCLEVBQXVCO0FBQ3JCLFNBQUtILFdBQUwsR0FBbUJHLEtBQW5CO0FBQ0Q7O0FBbEJrQzs7OztBQXlCckMsTUFBTUMsaUJBQU4sU0FBZ0NiLGFBQWhDLENBQThDO0FBQzVDLFNBQU9jLElBQVAsR0FBZTtBQUNiLFdBQU8sQ0FB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LHlCQUFnQmlCLHFCQUFqQztBQUNBLE1BQUkrRSxXQUFXLEdBQUc7QUFDaEJwQixJQUFBQSxNQUFNLEVBQUVuRSxHQUFHLENBQUNaLFVBREk7QUFFaEJRLElBQUFBLEtBQUssRUFBRTtBQUNMZ0IsTUFBQUEsT0FBTyxFQUFFWixHQUFHLENBQUNZO0FBRFI7QUFGUyxHQUFsQjs7QUFPQSxNQUFJb0UsV0FBVyxDQUFDaEYsR0FBRCxFQUFNdUUsTUFBTSxDQUFDekIsa0JBQWIsQ0FBZixFQUFpRDtBQUUvQ25FLElBQUFBLFVBQVUsQ0FBQ3VHLEtBQVgsQ0FBa0IsbUJBQWtCbEYsR0FBSSxFQUF4QztBQUNBc0QsSUFBQUEsVUFBVSxHQUFHL0QseUJBQWdCQyxXQUE3QjtBQUNBK0YsSUFBQUEsV0FBVyxHQUFHdkYsR0FBRyxDQUFDWSxPQUFsQjtBQUNELEdBTEQsTUFLTyxJQUFJb0UsV0FBVyxDQUFDaEYsR0FBRCxFQUFNdUUsTUFBTSxDQUFDNUIsc0JBQWIsQ0FBWCxJQUNBcUMsV0FBVyxDQUFDaEYsR0FBRCxFQUFNdUUsTUFBTSxDQUFDM0IsbUJBQWIsQ0FEZixFQUNrRDtBQUV2RFUsSUFBQUEsVUFBVSxHQUFHL0QseUJBQWdCa0csZUFBN0I7QUFDRCxHQUpNLE1BSUEsSUFBSVQsV0FBVyxDQUFDaEYsR0FBRCxFQUFNdUUsTUFBTSxDQUFDMUUsaUJBQWIsQ0FBZixFQUFnRDtBQUVyRHlELElBQUFBLFVBQVUsR0FBRy9ELHlCQUFnQlEsU0FBN0I7QUFDRDs7QUFHRCxTQUFPLENBQUN1RCxVQUFELEVBQWFpQyxXQUFiLENBQVA7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBFUzZFcnJvciBmcm9tICdlczYtZXJyb3InO1xuaW1wb3J0IF8gZnJvbSAnbG9kYXNoJztcbmltcG9ydCB7IHV0aWwsIGxvZ2dlciB9IGZyb20gJ2FwcGl1bS1zdXBwb3J0JztcbmltcG9ydCBIVFRQU3RhdHVzQ29kZXMgZnJvbSAnaHR0cC1zdGF0dXMtY29kZXMnO1xuXG5jb25zdCBtanNvbndwTG9nID0gbG9nZ2VyLmdldExvZ2dlcignTUpTT05XUCcpO1xuY29uc3QgdzNjTG9nID0gbG9nZ2VyLmdldExvZ2dlcignVzNDJyk7XG5cbmNvbnN0IFczQ19VTktOT1dOX0VSUk9SID0gJ3Vua25vd24gZXJyb3InO1xuXG4vLyBiYXNlIGVycm9yIGNsYXNzIGZvciBhbGwgb2Ygb3VyIGVycm9yc1xuY2xhc3MgUHJvdG9jb2xFcnJvciBleHRlbmRzIEVTNkVycm9yIHtcbiAgY29uc3RydWN0b3IgKG1zZywganNvbndwQ29kZSwgdzNjU3RhdHVzLCBlcnJvcikge1xuICAgIHN1cGVyKG1zZyk7XG4gICAgdGhpcy5qc29ud3BDb2RlID0ganNvbndwQ29kZTtcbiAgICB0aGlzLmVycm9yID0gZXJyb3IgfHwgVzNDX1VOS05PV05fRVJST1I7XG4gICAgaWYgKHRoaXMuanNvbndwQ29kZSA9PT0gbnVsbCkge1xuICAgICAgdGhpcy5qc29ud3BDb2RlID0gMTM7XG4gICAgfVxuICAgIHRoaXMudzNjU3RhdHVzID0gdzNjU3RhdHVzIHx8IEhUVFBTdGF0dXNDb2Rlcy5CQURfUkVRVUVTVDtcbiAgICB0aGlzLl9zdGFja3RyYWNlID0gbnVsbDtcbiAgfVxuXG4gIGdldCBzdGFja3RyYWNlICgpIHtcbiAgICByZXR1cm4gdGhpcy5fc3RhY2t0cmFjZSB8fCB0aGlzLnN0YWNrO1xuICB9XG5cbiAgc2V0IHN0YWNrdHJhY2UgKHZhbHVlKSB7XG4gICAgdGhpcy5fc3RhY2t0cmFjZSA9IHZhbHVlO1xuICB9XG59XG5cbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9TZWxlbml1bUhRL3NlbGVuaXVtL2Jsb2IvMTc2YjRhOWUzMDgyYWMxOTI2ZjJhNDM2ZWIzNDY3NjBjMzdhNTk5OC9qYXZhL2NsaWVudC9zcmMvb3JnL29wZW5xYS9zZWxlbml1bS9yZW1vdGUvRXJyb3JDb2Rlcy5qYXZhI0wyMTVcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9TZWxlbml1bUhRL3NlbGVuaXVtL2lzc3Vlcy81NTYyI2lzc3VlY29tbWVudC0zNzAzNzk0NzBcbi8vIGh0dHBzOi8vdzNjLmdpdGh1Yi5pby93ZWJkcml2ZXIvd2ViZHJpdmVyLXNwZWMuaHRtbCNkZm4tZXJyb3ItY29kZVxuXG5jbGFzcyBOb1N1Y2hEcml2ZXJFcnJvciBleHRlbmRzIFByb3RvY29sRXJyb3Ige1xuICBzdGF0aWMgY29kZSAoKSB7XG4gICAgcmV0dXJuIDY7XG4gIH1cbiAgLy8gVzNDIEVycm9yIGlzIGNhbGxlZCBJbnZhbGlkU2Vzc2lvbklEXG4gIHN0YXRpYyB3M2NTdGF0dXMgKCkge1xuICAgIHJldHVybiBIVFRQU3RhdHVzQ29kZXMuTk9UX0ZPVU5EO1xuICB9XG4gIHN0YXRpYyBlcnJvciAoKSB7XG4gICAgcmV0dXJuICdpbnZhbGlkIHNlc3Npb24gaWQnO1xuICB9XG4gIGNvbnN0cnVjdG9yIChlcnIpIHtcbiAgICBzdXBlcihlcnIgfHwgJ0Egc2Vzc2lvbiBpcyBlaXRoZXIgdGVybWluYXRlZCBvciBub3Qgc3RhcnRlZCcsIE5vU3VjaERyaXZlckVycm9yLmNvZGUoKSxcbiAgICAgICAgICBOb1N1Y2hEcml2ZXJFcnJvci53M2NTdGF0dXMoKSwgTm9TdWNoRHJpdmVyRXJyb3IuZXJyb3IoKSk7XG4gIH1cbn1cblxuY2xhc3MgTm9TdWNoRWxlbWVudEVycm9yIGV4dGVuZHMgUHJvdG9jb2xFcnJvciB7XG4gIHN0YXRpYyBjb2RlICgpIHtcbiAgICByZXR1cm4gNztcbiAgfVxuICBzdGF0aWMgdzNjU3RhdHVzICgpIHtcbiAgICByZXR1cm4gSFRUUFN0YXR1c0NvZGVzLk5PVF9GT1VORDtcbiAgfVxuICBzdGF0aWMgZXJyb3IgKCkge1xuICAgIHJldHVybiAnbm8gc3VjaCBlbGVtZW50JztcbiAgfVxuICBjb25zdHJ1Y3RvciAoZXJyKSB7XG4gICAgc3VwZXIoZXJyIHx8ICdBbiBlbGVtZW50IGNvdWxkIG5vdCBiZSBsb2NhdGVkIG9uIHRoZSBwYWdlIHVzaW5nIHRoZSBnaXZlbiAnICtcbiAgICAgICAgICAnc2VhcmNoIHBhcmFtZXRlcnMuJywgTm9TdWNoRWxlbWVudEVycm9yLmNvZGUoKSwgTm9TdWNoRWxlbWVudEVycm9yLnczY1N0YXR1cygpLFxuICAgICAgICAgIE5vU3VjaEVsZW1lbnRFcnJvci5lcnJvcigpKTtcbiAgfVxufVxuXG5jbGFzcyBOb1N1Y2hGcmFtZUVycm9yIGV4dGVuZHMgUHJvdG9jb2xFcnJvciB7XG4gIHN0YXRpYyBjb2RlICgpIHtcbiAgICByZXR1cm4gODtcbiAgfVxuICBzdGF0aWMgZXJyb3IgKCkge1xuICAgIHJldHVybiAnbm8gc3VjaCBmcmFtZSc7XG4gIH1cbiAgc3RhdGljIHczY1N0YXR1cyAoKSB7XG4gICAgcmV0dXJuIEhUVFBTdGF0dXNDb2Rlcy5OT1RfRk9VTkQ7XG4gIH1cbiAgY29uc3RydWN0b3IgKGVycikge1xuICAgIHN1cGVyKGVyciB8fCAnQSByZXF1ZXN0IHRvIHN3aXRjaCB0byBhIGZyYW1lIGNvdWxkIG5vdCBiZSBzYXRpc2ZpZWQgYmVjYXVzZSAnICtcbiAgICAgICAgICAndGhlIGZyYW1lIGNvdWxkIG5vdCBiZSBmb3VuZC4nLCBOb1N1Y2hGcmFtZUVycm9yLmNvZGUoKSxcbiAgICAgICAgICBOb1N1Y2hGcmFtZUVycm9yLnczY1N0YXR1cygpLCBOb1N1Y2hGcmFtZUVycm9yLmVycm9yKCkpO1xuICB9XG59XG5cbmNsYXNzIFVua25vd25Db21tYW5kRXJyb3IgZXh0ZW5kcyBQcm90b2NvbEVycm9yIHtcbiAgc3RhdGljIGNvZGUgKCkge1xuICAgIHJldHVybiA5O1xuICB9XG4gIHN0YXRpYyB3M2NTdGF0dXMgKCkge1xuICAgIHJldHVybiBIVFRQU3RhdHVzQ29kZXMuTk9UX0ZPVU5EO1xuICB9XG4gIHN0YXRpYyBlcnJvciAoKSB7XG4gICAgcmV0dXJuICd1bmtub3duIGNvbW1hbmQnO1xuICB9XG4gIGNvbnN0cnVjdG9yIChlcnIpIHtcbiAgICBzdXBlcihlcnIgfHwgJ1RoZSByZXF1ZXN0ZWQgcmVzb3VyY2UgY291bGQgbm90IGJlIGZvdW5kLCBvciBhIHJlcXVlc3Qgd2FzICcgK1xuICAgICAgICAgICdyZWNlaXZlZCB1c2luZyBhbiBIVFRQIG1ldGhvZCB0aGF0IGlzIG5vdCBzdXBwb3J0ZWQgYnkgdGhlIG1hcHBlZCAnICtcbiAgICAgICAgICAncmVzb3VyY2UuJywgVW5rbm93bkNvbW1hbmRFcnJvci5jb2RlKCksIFVua25vd25Db21tYW5kRXJyb3IudzNjU3RhdHVzKCksIFVua25vd25Db21tYW5kRXJyb3IuZXJyb3IoKSk7XG4gIH1cbn1cblxuY2xhc3MgU3RhbGVFbGVtZW50UmVmZXJlbmNlRXJyb3IgZXh0ZW5kcyBQcm90b2NvbEVycm9yIHtcbiAgc3RhdGljIGNvZGUgKCkge1xuICAgIHJldHVybiAxMDtcbiAgfVxuICBzdGF0aWMgdzNjU3RhdHVzICgpIHtcbiAgICByZXR1cm4gSFRUUFN0YXR1c0NvZGVzLk5PVF9GT1VORDtcbiAgfVxuICBzdGF0aWMgZXJyb3IgKCkge1xuICAgIHJldHVybiAnc3RhbGUgZWxlbWVudCByZWZlcmVuY2UnO1xuICB9XG4gIGNvbnN0cnVjdG9yIChlcnIpIHtcbiAgICBzdXBlcihlcnIgfHwgJ0FuIGVsZW1lbnQgY29tbWFuZCBmYWlsZWQgYmVjYXVzZSB0aGUgcmVmZXJlbmNlZCBlbGVtZW50IGlzIG5vICcgK1xuICAgICAgICAgICdsb25nZXIgYXR0YWNoZWQgdG8gdGhlIERPTS4nLCBTdGFsZUVsZW1lbnRSZWZlcmVuY2VFcnJvci5jb2RlKCksXG4gICAgICAgICAgU3RhbGVFbGVtZW50UmVmZXJlbmNlRXJyb3IudzNjU3RhdHVzKCksIFN0YWxlRWxlbWVudFJlZmVyZW5jZUVycm9yLmVycm9yKCkpO1xuICB9XG59XG5cbmNsYXNzIEVsZW1lbnROb3RWaXNpYmxlRXJyb3IgZXh0ZW5kcyBQcm90b2NvbEVycm9yIHtcbiAgc3RhdGljIGNvZGUgKCkge1xuICAgIHJldHVybiAxMTtcbiAgfVxuICBzdGF0aWMgdzNjU3RhdHVzICgpIHtcbiAgICByZXR1cm4gSFRUUFN0YXR1c0NvZGVzLkJBRF9SRVFVRVNUO1xuICB9XG4gIHN0YXRpYyBlcnJvciAoKSB7XG4gICAgcmV0dXJuICdlbGVtZW50IG5vdCB2aXNpYmxlJztcbiAgfVxuICBjb25zdHJ1Y3RvciAoZXJyKSB7XG4gICAgc3VwZXIoZXJyIHx8ICdBbiBlbGVtZW50IGNvbW1hbmQgY291bGQgbm90IGJlIGNvbXBsZXRlZCBiZWNhdXNlIHRoZSBlbGVtZW50IGlzICcgK1xuICAgICAgICAgICdub3QgdmlzaWJsZSBvbiB0aGUgcGFnZS4nLCBFbGVtZW50Tm90VmlzaWJsZUVycm9yLmNvZGUoKSxcbiAgICAgICAgICBFbGVtZW50Tm90VmlzaWJsZUVycm9yLnczY1N0YXR1cygpLCBFbGVtZW50Tm90VmlzaWJsZUVycm9yLmVycm9yKCkpO1xuICB9XG59XG5cbmNsYXNzIEludmFsaWRFbGVtZW50U3RhdGVFcnJvciBleHRlbmRzIFByb3RvY29sRXJyb3Ige1xuICBzdGF0aWMgY29kZSAoKSB7XG4gICAgcmV0dXJuIDEyO1xuICB9XG4gIHN0YXRpYyB3M2NTdGF0dXMgKCkge1xuICAgIHJldHVybiBIVFRQU3RhdHVzQ29kZXMuQkFEX1JFUVVFU1Q7XG4gIH1cbiAgc3RhdGljIGVycm9yICgpIHtcbiAgICByZXR1cm4gJ2ludmFsaWQgZWxlbWVudCBzdGF0ZSc7XG4gIH1cbiAgY29uc3RydWN0b3IgKGVycikge1xuICAgIHN1cGVyKGVyciB8fCAnQW4gZWxlbWVudCBjb21tYW5kIGNvdWxkIG5vdCBiZSBjb21wbGV0ZWQgYmVjYXVzZSB0aGUgZWxlbWVudCBpcyAnICtcbiAgICAgICAgICAnaW4gYW4gaW52YWxpZCBzdGF0ZSAoZS5nLiBhdHRlbXB0aW5nIHRvIGNsaWNrIGEgZGlzYWJsZWQgZWxlbWVudCkuJyxcbiAgICAgICAgICBJbnZhbGlkRWxlbWVudFN0YXRlRXJyb3IuY29kZSgpLCBJbnZhbGlkRWxlbWVudFN0YXRlRXJyb3IudzNjU3RhdHVzKCksXG4gICAgICAgICAgSW52YWxpZEVsZW1lbnRTdGF0ZUVycm9yLmVycm9yKCkpO1xuICB9XG59XG5cbmNsYXNzIFVua25vd25FcnJvciBleHRlbmRzIFByb3RvY29sRXJyb3Ige1xuICBzdGF0aWMgY29kZSAoKSB7XG4gICAgcmV0dXJuIDEzO1xuICB9XG4gIHN0YXRpYyB3M2NTdGF0dXMgKCkge1xuICAgIHJldHVybiBIVFRQU3RhdHVzQ29kZXMuSU5URVJOQUxfU0VSVkVSX0VSUk9SO1xuICB9XG4gIHN0YXRpYyBlcnJvciAoKSB7XG4gICAgcmV0dXJuIFczQ19VTktOT1dOX0VSUk9SO1xuICB9XG4gIGNvbnN0cnVjdG9yIChvcmlnaW5hbEVycm9yKSB7XG4gICAgbGV0IG9yaWdNZXNzYWdlID0gb3JpZ2luYWxFcnJvcjtcbiAgICBpZiAob3JpZ2luYWxFcnJvciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICBvcmlnTWVzc2FnZSA9IG9yaWdpbmFsRXJyb3IubWVzc2FnZTtcbiAgICB9XG4gICAgbGV0IG1lc3NhZ2UgPSAnQW4gdW5rbm93biBzZXJ2ZXItc2lkZSBlcnJvciBvY2N1cnJlZCB3aGlsZSBwcm9jZXNzaW5nICcgK1xuICAgICAgICAgICAgICAgICAgJ3RoZSBjb21tYW5kLic7XG4gICAgaWYgKG9yaWdpbmFsRXJyb3IpIHtcbiAgICAgIG1lc3NhZ2UgPSBgJHttZXNzYWdlfSBPcmlnaW5hbCBlcnJvcjogJHtvcmlnTWVzc2FnZX1gO1xuICAgIH1cblxuICAgIHN1cGVyKG1lc3NhZ2UsIFVua25vd25FcnJvci5jb2RlKCksIFVua25vd25FcnJvci53M2NTdGF0dXMoKSwgVW5rbm93bkVycm9yLmVycm9yKCkpO1xuICB9XG59XG5cbmNsYXNzIFVua25vd25NZXRob2RFcnJvciBleHRlbmRzIFByb3RvY29sRXJyb3Ige1xuICBzdGF0aWMgY29kZSAoKSB7XG4gICAgcmV0dXJuIDQwNTtcbiAgfVxuICBzdGF0aWMgdzNjU3RhdHVzICgpIHtcbiAgICByZXR1cm4gSFRUUFN0YXR1c0NvZGVzLk1FVEhPRF9OT1RfQUxMT1dFRDtcbiAgfVxuICBzdGF0aWMgZXJyb3IgKCkge1xuICAgIHJldHVybiAndW5rbm93biBtZXRob2QnO1xuICB9XG4gIGNvbnN0cnVjdG9yIChlcnIpIHtcbiAgICBzdXBlcihlcnIgfHwgJ1RoZSByZXF1ZXN0ZWQgY29tbWFuZCBtYXRjaGVkIGEga25vd24gVVJMIGJ1dCBkaWQgbm90IG1hdGNoIGFuIG1ldGhvZCBmb3IgdGhhdCBVUkwnLFxuICAgICAgICAgIFVua25vd25NZXRob2RFcnJvci5jb2RlKCksIFVua25vd25NZXRob2RFcnJvci53M2NTdGF0dXMoKSwgVW5rbm93bk1ldGhvZEVycm9yLmVycm9yKCkpO1xuICB9XG59XG5cbmNsYXNzIFVuc3VwcG9ydGVkT3BlcmF0aW9uRXJyb3IgZXh0ZW5kcyBQcm90b2NvbEVycm9yIHtcbiAgc3RhdGljIGNvZGUgKCkge1xuICAgIHJldHVybiA0MDU7XG4gIH1cbiAgc3RhdGljIHczY1N0YXR1cyAoKSB7XG4gICAgcmV0dXJuIEhUVFBTdGF0dXNDb2Rlcy5JTlRFUk5BTF9TRVJWRVJfRVJST1I7XG4gIH1cbiAgc3RhdGljIGVycm9yICgpIHtcbiAgICByZXR1cm4gJ3Vuc3VwcG9ydGVkIG9wZXJhdGlvbic7XG4gIH1cbiAgY29uc3RydWN0b3IgKGVycikge1xuICAgIHN1cGVyKGVyciB8fCAnQSBzZXJ2ZXItc2lkZSBlcnJvciBvY2N1cnJlZC4gQ29tbWFuZCBjYW5ub3QgYmUgc3VwcG9ydGVkLicsXG4gICAgICAgICAgVW5zdXBwb3J0ZWRPcGVyYXRpb25FcnJvci5jb2RlKCksIFVuc3VwcG9ydGVkT3BlcmF0aW9uRXJyb3IudzNjU3RhdHVzKCksXG4gICAgICAgICAgVW5zdXBwb3J0ZWRPcGVyYXRpb25FcnJvci5lcnJvcigpKTtcbiAgfVxufVxuXG5jbGFzcyBFbGVtZW50SXNOb3RTZWxlY3RhYmxlRXJyb3IgZXh0ZW5kcyBQcm90b2NvbEVycm9yIHtcbiAgc3RhdGljIGNvZGUgKCkge1xuICAgIHJldHVybiAxNTtcbiAgfVxuICBzdGF0aWMgZXJyb3IgKCkge1xuICAgIHJldHVybiAnZWxlbWVudCBub3Qgc2VsZWN0YWJsZSc7XG4gIH1cbiAgc3RhdGljIHczY1N0YXR1cyAoKSB7XG4gICAgcmV0dXJuIEhUVFBTdGF0dXNDb2Rlcy5CQURfUkVRVUVTVDtcbiAgfVxuICBjb25zdHJ1Y3RvciAoZXJyKSB7XG4gICAgc3VwZXIoZXJyIHx8ICdBbiBhdHRlbXB0IHdhcyBtYWRlIHRvIHNlbGVjdCBhbiBlbGVtZW50IHRoYXQgY2Fubm90IGJlIHNlbGVjdGVkLicsXG4gICAgICAgICAgRWxlbWVudElzTm90U2VsZWN0YWJsZUVycm9yLmNvZGUoKSwgRWxlbWVudElzTm90U2VsZWN0YWJsZUVycm9yLnczY1N0YXR1cygpLFxuICAgICAgICAgIEVsZW1lbnRJc05vdFNlbGVjdGFibGVFcnJvci5lcnJvcigpKTtcbiAgfVxufVxuXG5jbGFzcyBFbGVtZW50Q2xpY2tJbnRlcmNlcHRlZEVycm9yIGV4dGVuZHMgUHJvdG9jb2xFcnJvciB7XG4gIHN0YXRpYyBjb2RlICgpIHtcbiAgICByZXR1cm4gNjQ7XG4gIH1cbiAgc3RhdGljIGVycm9yICgpIHtcbiAgICByZXR1cm4gJ2VsZW1lbnQgY2xpY2sgaW50ZXJjZXB0ZWQnO1xuICB9XG4gIHN0YXRpYyB3M2NTdGF0dXMgKCkge1xuICAgIHJldHVybiBIVFRQU3RhdHVzQ29kZXMuQkFEX1JFUVVFU1Q7XG4gIH1cbiAgY29uc3RydWN0b3IgKGVycikge1xuICAgIHN1cGVyKGVyciB8fCAnVGhlIEVsZW1lbnQgQ2xpY2sgY29tbWFuZCBjb3VsZCBub3QgYmUgY29tcGxldGVkIGJlY2F1c2UgdGhlIGVsZW1lbnQgcmVjZWl2aW5nICcgK1xuICAgICAgICAgICd0aGUgZXZlbnRzIGlzIG9ic2N1cmluZyB0aGUgZWxlbWVudCB0aGF0IHdhcyByZXF1ZXN0ZWQgY2xpY2tlZCcsXG4gICAgICAgICAgRWxlbWVudENsaWNrSW50ZXJjZXB0ZWRFcnJvci5jb2RlKCksIEVsZW1lbnRDbGlja0ludGVyY2VwdGVkRXJyb3IudzNjU3RhdHVzKCksXG4gICAgICAgICAgRWxlbWVudENsaWNrSW50ZXJjZXB0ZWRFcnJvci5lcnJvcigpKTtcbiAgfVxufVxuXG5jbGFzcyBFbGVtZW50Tm90SW50ZXJhY3RhYmxlRXJyb3IgZXh0ZW5kcyBQcm90b2NvbEVycm9yIHtcbiAgc3RhdGljIGNvZGUgKCkge1xuICAgIHJldHVybiA2MDtcbiAgfVxuICBzdGF0aWMgZXJyb3IgKCkge1xuICAgIHJldHVybiAnZWxlbWVudCBub3QgaW50ZXJhY3RhYmxlJztcbiAgfVxuICBzdGF0aWMgdzNjU3RhdHVzICgpIHtcbiAgICByZXR1cm4gSFRUUFN0YXR1c0NvZGVzLkJBRF9SRVFVRVNUO1xuICB9XG4gIGNvbnN0cnVjdG9yIChlcnIpIHtcbiAgICBzdXBlcihlcnIgfHwgJ0EgY29tbWFuZCBjb3VsZCBub3QgYmUgY29tcGxldGVkIGJlY2F1c2UgdGhlIGVsZW1lbnQgaXMgbm90IHBvaW50ZXItIG9yIGtleWJvYXJkIGludGVyYWN0YWJsZScsXG4gICAgICAgICAgRWxlbWVudE5vdEludGVyYWN0YWJsZUVycm9yLmNvZGUoKSwgRWxlbWVudE5vdEludGVyYWN0YWJsZUVycm9yLnczY1N0YXR1cygpLFxuICAgICAgICAgIEVsZW1lbnROb3RJbnRlcmFjdGFibGVFcnJvci5lcnJvcigpKTtcbiAgfVxufVxuXG5jbGFzcyBJbnNlY3VyZUNlcnRpZmljYXRlRXJyb3IgZXh0ZW5kcyBQcm90b2NvbEVycm9yIHtcbiAgc3RhdGljIGVycm9yICgpIHtcbiAgICByZXR1cm4gJ2luc2VjdXJlIGNlcnRpZmljYXRlJztcbiAgfVxuICBjb25zdHJ1Y3RvciAoZXJyKSB7XG4gICAgc3VwZXIoZXJyIHx8ICdOYXZpZ2F0aW9uIGNhdXNlZCB0aGUgdXNlciBhZ2VudCB0byBoaXQgYSBjZXJ0aWZpY2F0ZSB3YXJuaW5nLCB3aGljaCBpcyB1c3VhbGx5IHRoZSByZXN1bHQgb2YgYW4gZXhwaXJlZCBvciBpbnZhbGlkIFRMUyBjZXJ0aWZpY2F0ZScsXG4gICAgICBFbGVtZW50SXNOb3RTZWxlY3RhYmxlRXJyb3IuY29kZSgpLCBudWxsLCBJbnNlY3VyZUNlcnRpZmljYXRlRXJyb3IuZXJyb3IoKSk7XG4gIH1cbn1cblxuY2xhc3MgSmF2YVNjcmlwdEVycm9yIGV4dGVuZHMgUHJvdG9jb2xFcnJvciB7XG4gIHN0YXRpYyBjb2RlICgpIHtcbiAgICByZXR1cm4gMTc7XG4gIH1cbiAgc3RhdGljIHczY1N0YXR1cyAoKSB7XG4gICAgcmV0dXJuIEhUVFBTdGF0dXNDb2Rlcy5JTlRFUk5BTF9TRVJWRVJfRVJST1I7XG4gIH1cbiAgc3RhdGljIGVycm9yICgpIHtcbiAgICByZXR1cm4gJ2phdmFzY3JpcHQgZXJyb3InO1xuICB9XG4gIGNvbnN0cnVjdG9yIChlcnIpIHtcbiAgICBzdXBlcihlcnIgfHwgJ0FuIGVycm9yIG9jY3VycmVkIHdoaWxlIGV4ZWN1dGluZyB1c2VyIHN1cHBsaWVkIEphdmFTY3JpcHQuJyxcbiAgICAgICAgICBKYXZhU2NyaXB0RXJyb3IuY29kZSgpLCBKYXZhU2NyaXB0RXJyb3IudzNjU3RhdHVzKCksIEphdmFTY3JpcHRFcnJvci5lcnJvcigpKTtcbiAgfVxufVxuXG5jbGFzcyBYUGF0aExvb2t1cEVycm9yIGV4dGVuZHMgUHJvdG9jb2xFcnJvciB7XG4gIHN0YXRpYyBjb2RlICgpIHtcbiAgICByZXR1cm4gMTk7XG4gIH1cbiAgc3RhdGljIHczY1N0YXR1cyAoKSB7XG4gICAgcmV0dXJuIEhUVFBTdGF0dXNDb2Rlcy5CQURfUkVRVUVTVDtcbiAgfVxuICBzdGF0aWMgZXJyb3IgKCkge1xuICAgIHJldHVybiAnaW52YWxpZCBzZWxlY3Rvcic7XG4gIH1cbiAgY29uc3RydWN0b3IgKGVycikge1xuICAgIHN1cGVyKGVyciB8fCAnQW4gZXJyb3Igb2NjdXJyZWQgd2hpbGUgc2VhcmNoaW5nIGZvciBhbiBlbGVtZW50IGJ5IFhQYXRoLicsXG4gICAgICAgICAgWFBhdGhMb29rdXBFcnJvci5jb2RlKCksIFhQYXRoTG9va3VwRXJyb3IudzNjU3RhdHVzKCksIFhQYXRoTG9va3VwRXJyb3IuZXJyb3IoKSk7XG4gIH1cbn1cblxuY2xhc3MgVGltZW91dEVycm9yIGV4dGVuZHMgUHJvdG9jb2xFcnJvciB7XG4gIHN0YXRpYyBjb2RlICgpIHtcbiAgICByZXR1cm4gMjE7XG4gIH1cbiAgc3RhdGljIHczY1N0YXR1cyAoKSB7XG4gICAgcmV0dXJuIEhUVFBTdGF0dXNDb2Rlcy5SRVFVRVNUX1RJTUVPVVQ7XG4gIH1cbiAgc3RhdGljIGVycm9yICgpIHtcbiAgICByZXR1cm4gJ3RpbWVvdXQnO1xuICB9XG4gIGNvbnN0cnVjdG9yIChlcnIpIHtcbiAgICBzdXBlcihlcnIgfHwgJ0FuIG9wZXJhdGlvbiBkaWQgbm90IGNvbXBsZXRlIGJlZm9yZSBpdHMgdGltZW91dCBleHBpcmVkLicsXG4gICAgICAgICAgVGltZW91dEVycm9yLmNvZGUoKSwgVGltZW91dEVycm9yLnczY1N0YXR1cygpLCBUaW1lb3V0RXJyb3IuZXJyb3IoKSk7XG4gIH1cbn1cblxuY2xhc3MgTm9TdWNoV2luZG93RXJyb3IgZXh0ZW5kcyBQcm90b2NvbEVycm9yIHtcbiAgc3RhdGljIGNvZGUgKCkge1xuICAgIHJldHVybiAyMztcbiAgfVxuICBzdGF0aWMgZXJyb3IgKCkge1xuICAgIHJldHVybiAnbm8gc3VjaCB3aW5kb3cnO1xuICB9XG4gIHN0YXRpYyB3M2NTdGF0dXMgKCkge1xuICAgIHJldHVybiBIVFRQU3RhdHVzQ29kZXMuTk9UX0ZPVU5EO1xuICB9XG4gIGNvbnN0cnVjdG9yIChlcnIpIHtcbiAgICBzdXBlcihlcnIgfHwgJ0EgcmVxdWVzdCB0byBzd2l0Y2ggdG8gYSBkaWZmZXJlbnQgd2luZG93IGNvdWxkIG5vdCBiZSBzYXRpc2ZpZWQgJyArXG4gICAgICAgICAgJ2JlY2F1c2UgdGhlIHdpbmRvdyBjb3VsZCBub3QgYmUgZm91bmQuJywgTm9TdWNoV2luZG93RXJyb3IuY29kZSgpLFxuICAgICAgICAgIE5vU3VjaFdpbmRvd0Vycm9yLnczY1N0YXR1cygpLCBOb1N1Y2hXaW5kb3dFcnJvci5lcnJvcigpKTtcbiAgfVxufVxuXG5jbGFzcyBJbnZhbGlkQXJndW1lbnRFcnJvciBleHRlbmRzIFByb3RvY29sRXJyb3Ige1xuICBzdGF0aWMgY29kZSAoKSB7XG4gICAgcmV0dXJuIDYxO1xuICB9XG4gIHN0YXRpYyBlcnJvciAoKSB7XG4gICAgcmV0dXJuICdpbnZhbGlkIGFyZ3VtZW50JztcbiAgfVxuICBzdGF0aWMgdzNjU3RhdHVzICgpIHtcbiAgICByZXR1cm4gSFRUUFN0YXR1c0NvZGVzLkJBRF9SRVFVRVNUO1xuICB9XG4gIGNvbnN0cnVjdG9yIChlcnIpIHtcbiAgICBzdXBlcihlcnIgfHwgJ1RoZSBhcmd1bWVudHMgcGFzc2VkIHRvIHRoZSBjb21tYW5kIGFyZSBlaXRoZXIgaW52YWxpZCBvciBtYWxmb3JtZWQnLFxuICAgICAgICAgIEludmFsaWRBcmd1bWVudEVycm9yLmNvZGUoKSwgSW52YWxpZEFyZ3VtZW50RXJyb3IudzNjU3RhdHVzKCksXG4gICAgICAgICAgSW52YWxpZEFyZ3VtZW50RXJyb3IuZXJyb3IoKSk7XG4gIH1cbn1cblxuY2xhc3MgSW52YWxpZENvb2tpZURvbWFpbkVycm9yIGV4dGVuZHMgUHJvdG9jb2xFcnJvciB7XG4gIHN0YXRpYyBjb2RlICgpIHtcbiAgICByZXR1cm4gMjQ7XG4gIH1cbiAgc3RhdGljIGVycm9yICgpIHtcbiAgICByZXR1cm4gJ2ludmFsaWQgY29va2llIGRvbWFpbic7XG4gIH1cbiAgc3RhdGljIHczY1N0YXR1cyAoKSB7XG4gICAgcmV0dXJuIEhUVFBTdGF0dXNDb2Rlcy5CQURfUkVRVUVTVDtcbiAgfVxuICBjb25zdHJ1Y3RvciAoZXJyKSB7XG4gICAgc3VwZXIoZXJyIHx8ICdBbiBpbGxlZ2FsIGF0dGVtcHQgd2FzIG1hZGUgdG8gc2V0IGEgY29va2llIHVuZGVyIGEgZGlmZmVyZW50ICcgK1xuICAgICAgICAgICdkb21haW4gdGhhbiB0aGUgY3VycmVudCBwYWdlLicsIEludmFsaWRDb29raWVEb21haW5FcnJvci5jb2RlKCksXG4gICAgICAgICAgSW52YWxpZENvb2tpZURvbWFpbkVycm9yLnczY1N0YXR1cygpLCBJbnZhbGlkQ29va2llRG9tYWluRXJyb3IuZXJyb3IoKSk7XG4gIH1cbn1cblxuY2xhc3MgTm9TdWNoQ29va2llRXJyb3IgZXh0ZW5kcyBQcm90b2NvbEVycm9yIHtcbiAgc3RhdGljIGNvZGUgKCkge1xuICAgIHJldHVybiA2MjtcbiAgfVxuICBzdGF0aWMgdzNjU3RhdHVzICgpIHtcbiAgICByZXR1cm4gSFRUUFN0YXR1c0NvZGVzLk5PVF9GT1VORDtcbiAgfVxuICBzdGF0aWMgZXJyb3IgKCkge1xuICAgIHJldHVybiAnbm8gc3VjaCBjb29raWUnO1xuICB9XG4gIGNvbnN0cnVjdG9yIChlcnIpIHtcbiAgICBzdXBlcihlcnIgfHwgJ05vIGNvb2tpZSBtYXRjaGluZyB0aGUgZ2l2ZW4gcGF0aCBuYW1lIHdhcyBmb3VuZCBhbW9uZ3N0IHRoZSBhc3NvY2lhdGVkIGNvb2tpZXMgb2YgdGhlIGN1cnJlbnQgYnJvd3NpbmcgY29udGV4dOKAmXMgYWN0aXZlIGRvY3VtZW50JyxcbiAgICAgICAgICBOb1N1Y2hDb29raWVFcnJvci5jb2RlKCksIE5vU3VjaENvb2tpZUVycm9yLnczY1N0YXR1cygpLCBOb1N1Y2hDb29raWVFcnJvci5lcnJvcigpKTtcbiAgfVxufVxuXG5jbGFzcyBVbmFibGVUb1NldENvb2tpZUVycm9yIGV4dGVuZHMgUHJvdG9jb2xFcnJvciB7XG4gIHN0YXRpYyBjb2RlICgpIHtcbiAgICByZXR1cm4gMjU7XG4gIH1cbiAgc3RhdGljIHczY1N0YXR1cyAoKSB7XG4gICAgcmV0dXJuIEhUVFBTdGF0dXNDb2Rlcy5JTlRFUk5BTF9TRVJWRVJfRVJST1I7XG4gIH1cbiAgc3RhdGljIGVycm9yICgpIHtcbiAgICByZXR1cm4gJ3VuYWJsZSB0byBzZXQgY29va2llJztcbiAgfVxuICBjb25zdHJ1Y3RvciAoZXJyKSB7XG4gICAgc3VwZXIoZXJyIHx8ICdBIHJlcXVlc3QgdG8gc2V0IGEgY29va2llXFwncyB2YWx1ZSBjb3VsZCBub3QgYmUgc2F0aXNmaWVkLicsXG4gICAgICAgICAgVW5hYmxlVG9TZXRDb29raWVFcnJvci5jb2RlKCksIFVuYWJsZVRvU2V0Q29va2llRXJyb3IudzNjU3RhdHVzKCksIFVuYWJsZVRvU2V0Q29va2llRXJyb3IuZXJyb3IoKSk7XG4gIH1cbn1cblxuY2xhc3MgVW5leHBlY3RlZEFsZXJ0T3BlbkVycm9yIGV4dGVuZHMgUHJvdG9jb2xFcnJvciB7XG4gIHN0YXRpYyBjb2RlICgpIHtcbiAgICByZXR1cm4gMjY7XG4gIH1cbiAgc3RhdGljIHczY1N0YXR1cyAoKSB7XG4gICAgcmV0dXJuIEhUVFBTdGF0dXNDb2Rlcy5JTlRFUk5BTF9TRVJWRVJfRVJST1I7XG4gIH1cbiAgc3RhdGljIGVycm9yICgpIHtcbiAgICByZXR1cm4gJ3VuZXhwZWN0ZWQgYWxlcnQgb3Blbic7XG4gIH1cbiAgY29uc3RydWN0b3IgKGVycikge1xuICAgIHN1cGVyKGVyciB8fCAnQSBtb2RhbCBkaWFsb2cgd2FzIG9wZW4sIGJsb2NraW5nIHRoaXMgb3BlcmF0aW9uJyxcbiAgICAgICAgICBVbmV4cGVjdGVkQWxlcnRPcGVuRXJyb3IuY29kZSgpLCBVbmV4cGVjdGVkQWxlcnRPcGVuRXJyb3IudzNjU3RhdHVzKCksIFVuZXhwZWN0ZWRBbGVydE9wZW5FcnJvci5lcnJvcigpKTtcbiAgfVxufVxuXG5jbGFzcyBOb0FsZXJ0T3BlbkVycm9yIGV4dGVuZHMgUHJvdG9jb2xFcnJvciB7XG4gIHN0YXRpYyBjb2RlICgpIHtcbiAgICByZXR1cm4gMjc7XG4gIH1cbiAgc3RhdGljIHczY1N0YXR1cyAoKSB7XG4gICAgcmV0dXJuIEhUVFBTdGF0dXNDb2Rlcy5OT1RfRk9VTkQ7XG4gIH1cbiAgc3RhdGljIGVycm9yICgpIHtcbiAgICByZXR1cm4gJ25vIHN1Y2ggYWxlcnQnO1xuICB9XG4gIGNvbnN0cnVjdG9yIChlcnIpIHtcbiAgICBzdXBlcihlcnIgfHwgJ0FuIGF0dGVtcHQgd2FzIG1hZGUgdG8gb3BlcmF0ZSBvbiBhIG1vZGFsIGRpYWxvZyB3aGVuIG9uZSAnICtcbiAgICAgICAgICAnd2FzIG5vdCBvcGVuLicsIE5vQWxlcnRPcGVuRXJyb3IuY29kZSgpLCBOb0FsZXJ0T3BlbkVycm9yLnczY1N0YXR1cygpLCBOb0FsZXJ0T3BlbkVycm9yLmVycm9yKCkpO1xuICB9XG59XG5cbmNsYXNzIE5vU3VjaEFsZXJ0RXJyb3IgZXh0ZW5kcyBOb0FsZXJ0T3BlbkVycm9yIHt9XG5cbmNsYXNzIFNjcmlwdFRpbWVvdXRFcnJvciBleHRlbmRzIFByb3RvY29sRXJyb3Ige1xuICBzdGF0aWMgY29kZSAoKSB7XG4gICAgcmV0dXJuIDI4O1xuICB9XG4gIHN0YXRpYyB3M2NTdGF0dXMgKCkge1xuICAgIHJldHVybiBIVFRQU3RhdHVzQ29kZXMuUkVRVUVTVF9USU1FT1VUO1xuICB9XG4gIHN0YXRpYyBlcnJvciAoKSB7XG4gICAgcmV0dXJuICdzY3JpcHQgdGltZW91dCc7XG4gIH1cbiAgY29uc3RydWN0b3IgKGVycikge1xuICAgIHN1cGVyKGVyciB8fCAnQSBzY3JpcHQgZGlkIG5vdCBjb21wbGV0ZSBiZWZvcmUgaXRzIHRpbWVvdXQgZXhwaXJlZC4nLFxuICAgICAgICAgIFNjcmlwdFRpbWVvdXRFcnJvci5jb2RlKCksIFNjcmlwdFRpbWVvdXRFcnJvci53M2NTdGF0dXMoKSwgU2NyaXB0VGltZW91dEVycm9yLmVycm9yKCkpO1xuICB9XG59XG5cbmNsYXNzIEludmFsaWRFbGVtZW50Q29vcmRpbmF0ZXNFcnJvciBleHRlbmRzIFByb3RvY29sRXJyb3Ige1xuICBzdGF0aWMgY29kZSAoKSB7XG4gICAgcmV0dXJuIDI5O1xuICB9XG4gIHN0YXRpYyB3M2NTdGF0dXMgKCkge1xuICAgIHJldHVybiBIVFRQU3RhdHVzQ29kZXMuQkFEX1JFUVVFU1Q7XG4gIH1cbiAgc3RhdGljIGVycm9yICgpIHtcbiAgICByZXR1cm4gJ2ludmFsaWQgY29vcmRpbmF0ZXMnO1xuICB9XG4gIGNvbnN0cnVjdG9yIChlcnIpIHtcbiAgICBzdXBlcihlcnIgfHwgJ1RoZSBjb29yZGluYXRlcyBwcm92aWRlZCB0byBhbiBpbnRlcmFjdGlvbnMgb3BlcmF0aW9uIGFyZSBpbnZhbGlkLicsXG4gICAgICAgICAgSW52YWxpZEVsZW1lbnRDb29yZGluYXRlc0Vycm9yLmNvZGUoKSwgSW52YWxpZEVsZW1lbnRDb29yZGluYXRlc0Vycm9yLnczY1N0YXR1cygpLFxuICAgICAgICAgIEludmFsaWRFbGVtZW50Q29vcmRpbmF0ZXNFcnJvci5lcnJvcigpKTtcbiAgfVxufVxuXG5jbGFzcyBJbnZhbGlkQ29vcmRpbmF0ZXNFcnJvciBleHRlbmRzIEludmFsaWRFbGVtZW50Q29vcmRpbmF0ZXNFcnJvciB7fVxuXG5jbGFzcyBJTUVOb3RBdmFpbGFibGVFcnJvciBleHRlbmRzIFByb3RvY29sRXJyb3Ige1xuICBzdGF0aWMgY29kZSAoKSB7XG4gICAgcmV0dXJuIDMwO1xuICB9XG4gIHN0YXRpYyB3M2NTdGF0dXMgKCkge1xuICAgIHJldHVybiBIVFRQU3RhdHVzQ29kZXMuSU5URVJOQUxfU0VSVkVSX0VSUk9SO1xuICB9XG4gIHN0YXRpYyBlcnJvciAoKSB7XG4gICAgcmV0dXJuICd1bnN1cHBvcnRlZCBvcGVyYXRpb24nO1xuICB9XG4gIGNvbnN0cnVjdG9yIChlcnIpIHtcbiAgICBzdXBlcihlcnIgfHwgJ0lNRSB3YXMgbm90IGF2YWlsYWJsZS4nLCBJTUVOb3RBdmFpbGFibGVFcnJvci5jb2RlKCksXG4gICAgICAgICAgSU1FTm90QXZhaWxhYmxlRXJyb3IudzNjU3RhdHVzKCksIElNRU5vdEF2YWlsYWJsZUVycm9yLmVycm9yKCkpO1xuICB9XG59XG5cbmNsYXNzIElNRUVuZ2luZUFjdGl2YXRpb25GYWlsZWRFcnJvciBleHRlbmRzIFByb3RvY29sRXJyb3Ige1xuICBzdGF0aWMgY29kZSAoKSB7XG4gICAgcmV0dXJuIDMxO1xuICB9XG4gIHN0YXRpYyB3M2NTdGF0dXMgKCkge1xuICAgIHJldHVybiBIVFRQU3RhdHVzQ29kZXMuSU5URVJOQUxfU0VSVkVSX0VSUk9SO1xuICB9XG4gIHN0YXRpYyBlcnJvciAoKSB7XG4gICAgcmV0dXJuICd1bnN1cHBvcnRlZCBvcGVyYXRpb24nO1xuICB9XG4gIGNvbnN0cnVjdG9yIChlcnIpIHtcbiAgICBzdXBlcihlcnIgfHwgJ0FuIElNRSBlbmdpbmUgY291bGQgbm90IGJlIHN0YXJ0ZWQuJyxcbiAgICAgICAgICBJTUVFbmdpbmVBY3RpdmF0aW9uRmFpbGVkRXJyb3IuY29kZSgpLCBJTUVFbmdpbmVBY3RpdmF0aW9uRmFpbGVkRXJyb3IudzNjU3RhdHVzKCksXG4gICAgICAgICAgSU1FRW5naW5lQWN0aXZhdGlvbkZhaWxlZEVycm9yLmVycm9yKCkpO1xuICB9XG59XG5cbmNsYXNzIEludmFsaWRTZWxlY3RvckVycm9yIGV4dGVuZHMgUHJvdG9jb2xFcnJvciB7XG4gIHN0YXRpYyBjb2RlICgpIHtcbiAgICByZXR1cm4gMzI7XG4gIH1cbiAgc3RhdGljIHczY1N0YXR1cyAoKSB7XG4gICAgcmV0dXJuIEhUVFBTdGF0dXNDb2Rlcy5CQURfUkVRVUVTVDtcbiAgfVxuICBzdGF0aWMgZXJyb3IgKCkge1xuICAgIHJldHVybiAnaW52YWxpZCBzZWxlY3Rvcic7XG4gIH1cbiAgY29uc3RydWN0b3IgKGVycikge1xuICAgIHN1cGVyKGVyciB8fCAnQXJndW1lbnQgd2FzIGFuIGludmFsaWQgc2VsZWN0b3IgKGUuZy4gWFBhdGgvQ1NTKS4nLFxuICAgICAgICAgIEludmFsaWRTZWxlY3RvckVycm9yLmNvZGUoKSwgSW52YWxpZFNlbGVjdG9yRXJyb3IudzNjU3RhdHVzKCksXG4gICAgICAgICAgSW52YWxpZFNlbGVjdG9yRXJyb3IuZXJyb3IoKSk7XG4gIH1cbn1cblxuY2xhc3MgU2Vzc2lvbk5vdENyZWF0ZWRFcnJvciBleHRlbmRzIFByb3RvY29sRXJyb3Ige1xuICBzdGF0aWMgY29kZSAoKSB7XG4gICAgcmV0dXJuIDMzO1xuICB9XG4gIHN0YXRpYyB3M2NTdGF0dXMgKCkge1xuICAgIHJldHVybiBIVFRQU3RhdHVzQ29kZXMuSU5URVJOQUxfU0VSVkVSX0VSUk9SO1xuICB9XG4gIHN0YXRpYyBlcnJvciAoKSB7XG4gICAgcmV0dXJuICdzZXNzaW9uIG5vdCBjcmVhdGVkJztcbiAgfVxuICBjb25zdHJ1Y3RvciAoZGV0YWlscykge1xuICAgIGxldCBtZXNzYWdlID0gJ0EgbmV3IHNlc3Npb24gY291bGQgbm90IGJlIGNyZWF0ZWQuJztcbiAgICBpZiAoZGV0YWlscykge1xuICAgICAgbWVzc2FnZSArPSBgIERldGFpbHM6ICR7ZGV0YWlsc31gO1xuICAgIH1cblxuICAgIHN1cGVyKG1lc3NhZ2UsIFNlc3Npb25Ob3RDcmVhdGVkRXJyb3IuY29kZSgpLCBTZXNzaW9uTm90Q3JlYXRlZEVycm9yLnczY1N0YXR1cygpLCBTZXNzaW9uTm90Q3JlYXRlZEVycm9yLmVycm9yKCkpO1xuICB9XG59XG5cbmNsYXNzIE1vdmVUYXJnZXRPdXRPZkJvdW5kc0Vycm9yIGV4dGVuZHMgUHJvdG9jb2xFcnJvciB7XG4gIHN0YXRpYyBjb2RlICgpIHtcbiAgICByZXR1cm4gMzQ7XG4gIH1cbiAgc3RhdGljIHczY1N0YXR1cyAoKSB7XG4gICAgcmV0dXJuIEhUVFBTdGF0dXNDb2Rlcy5JTlRFUk5BTF9TRVJWRVJfRVJST1I7XG4gIH1cbiAgc3RhdGljIGVycm9yICgpIHtcbiAgICByZXR1cm4gJ21vdmUgdGFyZ2V0IG91dCBvZiBib3VuZHMnO1xuICB9XG4gIGNvbnN0cnVjdG9yIChlcnIpIHtcbiAgICBzdXBlcihlcnIgfHwgJ1RhcmdldCBwcm92aWRlZCBmb3IgYSBtb3ZlIGFjdGlvbiBpcyBvdXQgb2YgYm91bmRzLicsXG4gICAgICAgICAgTW92ZVRhcmdldE91dE9mQm91bmRzRXJyb3IuY29kZSgpLCBNb3ZlVGFyZ2V0T3V0T2ZCb3VuZHNFcnJvci53M2NTdGF0dXMoKSwgTW92ZVRhcmdldE91dE9mQm91bmRzRXJyb3IuZXJyb3IoKSk7XG4gIH1cbn1cblxuY2xhc3MgTm9TdWNoQ29udGV4dEVycm9yIGV4dGVuZHMgUHJvdG9jb2xFcnJvciB7XG4gIHN0YXRpYyBjb2RlICgpIHtcbiAgICByZXR1cm4gMzU7XG4gIH1cbiAgY29uc3RydWN0b3IgKGVycikge1xuICAgIHN1cGVyKGVyciB8fCAnTm8gc3VjaCBjb250ZXh0IGZvdW5kLicsIE5vU3VjaENvbnRleHRFcnJvci5jb2RlKCkpO1xuICB9XG59XG5cbmNsYXNzIEludmFsaWRDb250ZXh0RXJyb3IgZXh0ZW5kcyBQcm90b2NvbEVycm9yIHtcbiAgc3RhdGljIGNvZGUgKCkge1xuICAgIHJldHVybiAzNjtcbiAgfVxuICBjb25zdHJ1Y3RvciAoZXJyKSB7XG4gICAgc3VwZXIoZXJyIHx8ICdUaGF0IGNvbW1hbmQgY291bGQgbm90IGJlIGV4ZWN1dGVkIGluIHRoZSBjdXJyZW50IGNvbnRleHQuJyxcbiAgICAgICAgICBJbnZhbGlkQ29udGV4dEVycm9yLmNvZGUoKSk7XG4gIH1cbn1cblxuLy8gVGhpcyBpcyBhbiBhbGlhcyBmb3IgVW5rbm93bk1ldGhvZEVycm9yXG5jbGFzcyBOb3RZZXRJbXBsZW1lbnRlZEVycm9yIGV4dGVuZHMgUHJvdG9jb2xFcnJvciB7XG4gIHN0YXRpYyBjb2RlICgpIHtcbiAgICByZXR1cm4gMTM7XG4gIH1cbiAgc3RhdGljIHczY1N0YXR1cyAoKSB7XG4gICAgcmV0dXJuIEhUVFBTdGF0dXNDb2Rlcy5OT1RfRk9VTkQ7IC8vIFczQyBlcXVpdmFsZW50IGlzIGNhbGxlZCAnVW5rbm93biBDb21tYW5kJyAoQSBjb21tYW5kIGNvdWxkIG5vdCBiZSBleGVjdXRlZCBiZWNhdXNlIHRoZSByZW1vdGUgZW5kIGlzIG5vdCBhd2FyZSBvZiBpdClcbiAgfVxuICBzdGF0aWMgZXJyb3IgKCkge1xuICAgIHJldHVybiAndW5rbm93biBtZXRob2QnO1xuICB9XG4gIGNvbnN0cnVjdG9yIChlcnIpIHtcbiAgICBzdXBlcihlcnIgfHwgJ01ldGhvZCBoYXMgbm90IHlldCBiZWVuIGltcGxlbWVudGVkJyxcbiAgICAgIE5vdFlldEltcGxlbWVudGVkRXJyb3IuY29kZSgpLCBOb3RZZXRJbXBsZW1lbnRlZEVycm9yLnczY1N0YXR1cygpLCBOb3RZZXRJbXBsZW1lbnRlZEVycm9yLmVycm9yKCkpO1xuICB9XG59XG5cbmNsYXNzIE5vdEltcGxlbWVudGVkRXJyb3IgZXh0ZW5kcyBQcm90b2NvbEVycm9yIHtcbiAgc3RhdGljIGNvZGUgKCkge1xuICAgIHJldHVybiAxMztcbiAgfVxuICBzdGF0aWMgdzNjU3RhdHVzICgpIHtcbiAgICByZXR1cm4gSFRUUFN0YXR1c0NvZGVzLk1FVEhPRF9OT1RfQUxMT1dFRDsgLy8gVzNDIGVxdWl2YWxlbnQgaXMgJ1Vua25vd24gTWV0aG9kJyAoVGhlIHJlcXVlc3RlZCBjb21tYW5kIG1hdGNoZWQgYSBrbm93biBVUkwgYnV0IGRpZCBub3QgbWF0Y2ggYW4gbWV0aG9kIGZvciB0aGF0IFVSTClcbiAgfVxuICBjb25zdHJ1Y3RvciAoZXJyKSB7XG4gICAgc3VwZXIoZXJyIHx8ICdNZXRob2QgaXMgbm90IGltcGxlbWVudGVkJywgTm90SW1wbGVtZW50ZWRFcnJvci5jb2RlKCksIE5vdEltcGxlbWVudGVkRXJyb3IudzNjU3RhdHVzKCkpO1xuICB9XG59XG5cbmNsYXNzIFVuYWJsZVRvQ2FwdHVyZVNjcmVlbiBleHRlbmRzIFByb3RvY29sRXJyb3Ige1xuICBzdGF0aWMgY29kZSAoKSB7XG4gICAgcmV0dXJuIDYzO1xuICB9XG4gIHN0YXRpYyB3M2NTdGF0dXMgKCkge1xuICAgIHJldHVybiBIVFRQU3RhdHVzQ29kZXMuSU5URVJOQUxfU0VSVkVSX0VSUk9SO1xuICB9XG4gIHN0YXRpYyBlcnJvciAoKSB7XG4gICAgcmV0dXJuICd1bmFibGUgdG8gY2FwdHVyZSBzY3JlZW4nO1xuICB9XG4gIGNvbnN0cnVjdG9yIChlcnIpIHtcbiAgICBzdXBlcihlcnIgfHwgJ0Egc2NyZWVuIGNhcHR1cmUgd2FzIG1hZGUgaW1wb3NzaWJsZScsXG4gICAgICAgICAgVW5hYmxlVG9DYXB0dXJlU2NyZWVuLmNvZGUoKSwgVW5hYmxlVG9DYXB0dXJlU2NyZWVuLnczY1N0YXR1cygpLCBVbmFibGVUb0NhcHR1cmVTY3JlZW4uZXJyb3IoKSk7XG4gIH1cbn1cblxuXG4vLyBFcXVpdmFsZW50IHRvIFczQyBJbnZhbGlkQXJndW1lbnRFcnJvclxuY2xhc3MgQmFkUGFyYW1ldGVyc0Vycm9yIGV4dGVuZHMgRVM2RXJyb3Ige1xuICBzdGF0aWMgZXJyb3IgKCkge1xuICAgIHJldHVybiAnaW52YWxpZCBhcmd1bWVudCc7XG4gIH1cbiAgY29uc3RydWN0b3IgKHJlcXVpcmVkUGFyYW1zLCBhY3R1YWxQYXJhbXMsIGVyck1lc3NhZ2UpIHtcbiAgICBsZXQgbWVzc2FnZTtcbiAgICBpZiAoIWVyck1lc3NhZ2UpIHtcbiAgICAgIG1lc3NhZ2UgPSBgUGFyYW1ldGVycyB3ZXJlIGluY29ycmVjdC4gV2Ugd2FudGVkIGAgK1xuICAgICAgICAgIGAke0pTT04uc3RyaW5naWZ5KHJlcXVpcmVkUGFyYW1zKX0gYW5kIHlvdSBgICtcbiAgICAgICAgICBgc2VudCAke0pTT04uc3RyaW5naWZ5KGFjdHVhbFBhcmFtcyl9YDtcbiAgICB9IGVsc2Uge1xuICAgICAgbWVzc2FnZSA9IGBQYXJhbWV0ZXJzIHdlcmUgaW5jb3JyZWN0LiBZb3Ugc2VudCAke0pTT04uc3RyaW5naWZ5KGFjdHVhbFBhcmFtcyl9LCAke2Vyck1lc3NhZ2V9YDtcbiAgICB9XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gICAgdGhpcy53M2NTdGF0dXMgPSBIVFRQU3RhdHVzQ29kZXMuQkFEX1JFUVVFU1Q7XG4gIH1cbn1cblxuLyoqXG4gKiBQcm94eVJlcXVlc3RFcnJvciBpcyBhIGN1c3RvbSBlcnJvciBhbmQgd2lsbCBiZSB0aHJvd24gdXAgb24gdW5zdWNjZXNzZnVsIHByb3h5IHJlcXVlc3QgYW5kXG4gKiB3aWxsIGNvbnRhaW4gaW5mb3JtYXRpb24gYWJvdXQgdGhlIHByb3h5IGZhaWx1cmUuXG4gKiBJbiBjYXNlIG9mIFByb3h5UmVxdWVzdEVycm9yIHNob3VsZCBmZXRjaCB0aGUgYWN0dWFsIGVycm9yIGJ5IGNhbGxpbmcgYGdldEFjdHVhbEVycm9yKClgXG4gKiBmb3IgcHJveHkgZmFpbHVyZSB0byBnZW5lcmF0ZSB0aGUgY2xpZW50IHJlc3BvbnNlLlxuICovXG5jbGFzcyBQcm94eVJlcXVlc3RFcnJvciBleHRlbmRzIEVTNkVycm9yIHtcbiAgY29uc3RydWN0b3IgKGVyciwgcmVzcG9uc2VFcnJvciwgaHR0cFN0YXR1cykge1xuICAgIGxldCByZXNwb25zZUVycm9yT2JqID0gdXRpbC5zYWZlSnNvblBhcnNlKHJlc3BvbnNlRXJyb3IpO1xuICAgIGlmICghXy5pc1BsYWluT2JqZWN0KHJlc3BvbnNlRXJyb3JPYmopKSB7XG4gICAgICByZXNwb25zZUVycm9yT2JqID0ge307XG4gICAgfVxuICAgIGxldCBvcmlnTWVzc2FnZSA9IF8uaXNTdHJpbmcocmVzcG9uc2VFcnJvcikgPyByZXNwb25zZUVycm9yIDogJyc7XG4gICAgaWYgKCFfLmlzRW1wdHkocmVzcG9uc2VFcnJvck9iaikpIHtcbiAgICAgIGlmIChfLmlzU3RyaW5nKHJlc3BvbnNlRXJyb3JPYmoudmFsdWUpKSB7XG4gICAgICAgIG9yaWdNZXNzYWdlID0gcmVzcG9uc2VFcnJvck9iai52YWx1ZTtcbiAgICAgIH0gZWxzZSBpZiAoXy5pc1BsYWluT2JqZWN0KHJlc3BvbnNlRXJyb3JPYmoudmFsdWUpICYmIF8uaXNTdHJpbmcocmVzcG9uc2VFcnJvck9iai52YWx1ZS5tZXNzYWdlKSkge1xuICAgICAgICBvcmlnTWVzc2FnZSA9IHJlc3BvbnNlRXJyb3JPYmoudmFsdWUubWVzc2FnZTtcbiAgICAgIH1cbiAgICB9XG4gICAgc3VwZXIoXy5pc0VtcHR5KGVycikgPyBgUHJveHkgcmVxdWVzdCB1bnN1Y2Nlc3NmdWwuICR7b3JpZ01lc3NhZ2V9YCA6IGVycik7XG5cbiAgICB0aGlzLnczY1N0YXR1cyA9IEhUVFBTdGF0dXNDb2Rlcy5CQURfUkVRVUVTVDtcblxuICAgIC8vIElmIHRoZSByZXNwb25zZSBlcnJvciBpcyBhbiBvYmplY3QgYW5kIHZhbHVlIGlzIGFuIG9iamVjdCwgaXQncyBhIFczQyBlcnJvciAoZm9yIEpTT05XUCB2YWx1ZSBpcyBhIHN0cmluZylcbiAgICBpZiAoXy5pc1BsYWluT2JqZWN0KHJlc3BvbnNlRXJyb3JPYmoudmFsdWUpICYmIF8uaGFzKHJlc3BvbnNlRXJyb3JPYmoudmFsdWUsICdlcnJvcicpKSB7XG4gICAgICB0aGlzLnczYyA9IHJlc3BvbnNlRXJyb3JPYmoudmFsdWU7XG4gICAgICB0aGlzLnczY1N0YXR1cyA9IGh0dHBTdGF0dXMgfHwgSFRUUFN0YXR1c0NvZGVzLkJBRF9SRVFVRVNUO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmpzb253cCA9IHJlc3BvbnNlRXJyb3JPYmo7XG4gICAgfVxuICB9XG5cbiAgZ2V0QWN0dWFsRXJyb3IgKCkge1xuICAgIC8vIElmIGl0J3MgTUpTT05XUCBlcnJvciwgcmV0dXJucyBhY3R1YWwgZXJyb3IgY2F1c2UgZm9yIHJlcXVlc3QgZmFpbHVyZSBiYXNlZCBvbiBganNvbndwLnN0YXR1c2BcbiAgICBpZiAodXRpbC5oYXNWYWx1ZSh0aGlzLmpzb253cCkgJiYgdXRpbC5oYXNWYWx1ZSh0aGlzLmpzb253cC5zdGF0dXMpICYmIHV0aWwuaGFzVmFsdWUodGhpcy5qc29ud3AudmFsdWUpKSB7XG4gICAgICByZXR1cm4gZXJyb3JGcm9tTUpTT05XUFN0YXR1c0NvZGUodGhpcy5qc29ud3Auc3RhdHVzLCB0aGlzLmpzb253cC52YWx1ZSk7XG4gICAgfSBlbHNlIGlmICh1dGlsLmhhc1ZhbHVlKHRoaXMudzNjKSAmJiBfLmlzTnVtYmVyKHRoaXMudzNjU3RhdHVzKSAmJiB0aGlzLnczY1N0YXR1cyA+PSAzMDApIHtcbiAgICAgIHJldHVybiBlcnJvckZyb21XM0NKc29uQ29kZSh0aGlzLnczYy5lcnJvciwgdGhpcy53M2MubWVzc2FnZSB8fCB0aGlzLm1lc3NhZ2UsIHRoaXMudzNjLnN0YWNrdHJhY2UpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFVua25vd25FcnJvcih0aGlzLm1lc3NhZ2UpO1xuICB9XG59XG4vLyBtYXAgb2YgZXJyb3IgY2xhc3MgbmFtZSB0byBlcnJvciBjbGFzc1xuY29uc3QgZXJyb3JzID0ge05vdFlldEltcGxlbWVudGVkRXJyb3IsXG4gICAgICAgICAgICAgICAgTm90SW1wbGVtZW50ZWRFcnJvcixcbiAgICAgICAgICAgICAgICBCYWRQYXJhbWV0ZXJzRXJyb3IsXG4gICAgICAgICAgICAgICAgSW52YWxpZEFyZ3VtZW50RXJyb3IsXG4gICAgICAgICAgICAgICAgTm9TdWNoRHJpdmVyRXJyb3IsXG4gICAgICAgICAgICAgICAgTm9TdWNoRWxlbWVudEVycm9yLFxuICAgICAgICAgICAgICAgIFVua25vd25Db21tYW5kRXJyb3IsXG4gICAgICAgICAgICAgICAgU3RhbGVFbGVtZW50UmVmZXJlbmNlRXJyb3IsXG4gICAgICAgICAgICAgICAgRWxlbWVudE5vdFZpc2libGVFcnJvcixcbiAgICAgICAgICAgICAgICBJbnZhbGlkRWxlbWVudFN0YXRlRXJyb3IsXG4gICAgICAgICAgICAgICAgVW5rbm93bkVycm9yLFxuICAgICAgICAgICAgICAgIEVsZW1lbnRJc05vdFNlbGVjdGFibGVFcnJvcixcbiAgICAgICAgICAgICAgICBFbGVtZW50Q2xpY2tJbnRlcmNlcHRlZEVycm9yLFxuICAgICAgICAgICAgICAgIEVsZW1lbnROb3RJbnRlcmFjdGFibGVFcnJvcixcbiAgICAgICAgICAgICAgICBJbnNlY3VyZUNlcnRpZmljYXRlRXJyb3IsXG4gICAgICAgICAgICAgICAgSmF2YVNjcmlwdEVycm9yLFxuICAgICAgICAgICAgICAgIFhQYXRoTG9va3VwRXJyb3IsXG4gICAgICAgICAgICAgICAgVGltZW91dEVycm9yLFxuICAgICAgICAgICAgICAgIE5vU3VjaFdpbmRvd0Vycm9yLFxuICAgICAgICAgICAgICAgIE5vU3VjaENvb2tpZUVycm9yLFxuICAgICAgICAgICAgICAgIEludmFsaWRDb29raWVEb21haW5FcnJvcixcbiAgICAgICAgICAgICAgICBJbnZhbGlkQ29vcmRpbmF0ZXNFcnJvcixcbiAgICAgICAgICAgICAgICBVbmFibGVUb1NldENvb2tpZUVycm9yLFxuICAgICAgICAgICAgICAgIFVuZXhwZWN0ZWRBbGVydE9wZW5FcnJvcixcbiAgICAgICAgICAgICAgICBOb0FsZXJ0T3BlbkVycm9yLFxuICAgICAgICAgICAgICAgIFNjcmlwdFRpbWVvdXRFcnJvcixcbiAgICAgICAgICAgICAgICBJbnZhbGlkRWxlbWVudENvb3JkaW5hdGVzRXJyb3IsXG4gICAgICAgICAgICAgICAgSU1FTm90QXZhaWxhYmxlRXJyb3IsXG4gICAgICAgICAgICAgICAgSU1FRW5naW5lQWN0aXZhdGlvbkZhaWxlZEVycm9yLFxuICAgICAgICAgICAgICAgIEludmFsaWRTZWxlY3RvckVycm9yLFxuICAgICAgICAgICAgICAgIFNlc3Npb25Ob3RDcmVhdGVkRXJyb3IsXG4gICAgICAgICAgICAgICAgTW92ZVRhcmdldE91dE9mQm91bmRzRXJyb3IsXG4gICAgICAgICAgICAgICAgTm9TdWNoQWxlcnRFcnJvcixcbiAgICAgICAgICAgICAgICBOb1N1Y2hDb250ZXh0RXJyb3IsXG4gICAgICAgICAgICAgICAgSW52YWxpZENvbnRleHRFcnJvcixcbiAgICAgICAgICAgICAgICBOb1N1Y2hGcmFtZUVycm9yLFxuICAgICAgICAgICAgICAgIFVuYWJsZVRvQ2FwdHVyZVNjcmVlbixcbiAgICAgICAgICAgICAgICBVbmtub3duTWV0aG9kRXJyb3IsXG4gICAgICAgICAgICAgICAgVW5zdXBwb3J0ZWRPcGVyYXRpb25FcnJvcixcbiAgICAgICAgICAgICAgICBQcm94eVJlcXVlc3RFcnJvcn07XG5cbi8vIG1hcCBvZiBlcnJvciBjb2RlIHRvIGVycm9yIGNsYXNzXG5jb25zdCBqc29ud3BFcnJvckNvZGVNYXAgPSB7fTtcbmZvciAobGV0IEVycm9yQ2xhc3Mgb2YgXy52YWx1ZXMoZXJyb3JzKSkge1xuICBpZiAoRXJyb3JDbGFzcy5jb2RlKSB7XG4gICAganNvbndwRXJyb3JDb2RlTWFwW0Vycm9yQ2xhc3MuY29kZSgpXSA9IEVycm9yQ2xhc3M7XG4gIH1cbn1cblxuY29uc3QgdzNjRXJyb3JDb2RlTWFwID0ge307XG5mb3IgKGxldCBFcnJvckNsYXNzIG9mIF8udmFsdWVzKGVycm9ycykpIHtcbiAgaWYgKEVycm9yQ2xhc3MuZXJyb3IpIHtcbiAgICB3M2NFcnJvckNvZGVNYXBbRXJyb3JDbGFzcy5lcnJvcigpXSA9IEVycm9yQ2xhc3M7XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNVbmtub3duRXJyb3IgKGVycikge1xuICByZXR1cm4gIWVyci5jb25zdHJ1Y3Rvci5uYW1lIHx8XG4gICAgICAgICAhXy52YWx1ZXMoZXJyb3JzKS5maW5kKGZ1bmN0aW9uIGVxdWFsTmFtZXMgKGVycm9yKSB7XG4gICAgICAgICAgIHJldHVybiBlcnJvci5uYW1lID09PSBlcnIuY29uc3RydWN0b3IubmFtZTtcbiAgICAgICAgIH0pO1xufVxuXG5mdW5jdGlvbiBpc0Vycm9yVHlwZSAoZXJyLCB0eXBlKSB7XG4gIC8vIGBuYW1lYCBwcm9wZXJ0eSBpcyB0aGUgY29uc3RydWN0b3IgbmFtZVxuICBpZiAodHlwZS5uYW1lID09PSBQcm90b2NvbEVycm9yLm5hbWUpIHtcbiAgICAvLyBganNvbndwQ29kZWAgaXMgYDBgIG9uIHN1Y2Nlc3NcbiAgICByZXR1cm4gISFlcnIuanNvbndwQ29kZTtcbiAgfSBlbHNlIGlmICh0eXBlLm5hbWUgPT09IFByb3h5UmVxdWVzdEVycm9yLm5hbWUpIHtcbiAgICAvLyBgc3RhdHVzYCBpcyBgMGAgb24gc3VjY2Vzc1xuICAgIGlmIChlcnIuanNvbndwKSB7XG4gICAgICByZXR1cm4gISFlcnIuanNvbndwLnN0YXR1cztcbiAgICB9XG5cbiAgICBpZiAoXy5pc1BsYWluT2JqZWN0KGVyci53M2MpKSB7XG4gICAgICByZXR1cm4gXy5pc051bWJlcihlcnIudzNjU3RhdHVzKSAmJiBlcnIudzNjU3RhdHVzID49IDMwMDtcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIGVyci5jb25zdHJ1Y3Rvci5uYW1lID09PSB0eXBlLm5hbWU7XG59XG5cbi8qKlxuICogUmV0cmlldmUgYW4gZXJyb3IgZGVyaXZlZCBmcm9tIE1KU09OV1Agc3RhdHVzXG4gKiBAcGFyYW0ge251bWJlcn0gY29kZSBKU09OV1Agc3RhdHVzIGNvZGVcbiAqIEBwYXJhbSB7c3RyaW5nfE9iamVjdH0gdmFsdWUgVGhlIGVycm9yIG1lc3NhZ2UsIG9yIGFuIG9iamVjdCB3aXRoIGEgYG1lc3NhZ2VgIHByb3BlcnR5XG4gKiBAcmV0dXJuIHtQcm90b2NvbEVycm9yfSBUaGUgZXJyb3IgdGhhdCBpcyBhc3NvY2lhdGVkIHdpdGggcHJvdmlkZWQgSlNPTldQIHN0YXR1cyBjb2RlXG4gKi9cbmZ1bmN0aW9uIGVycm9yRnJvbU1KU09OV1BTdGF0dXNDb2RlIChjb2RlLCB2YWx1ZSA9ICcnKSB7XG4gIC8vIGlmIGB2YWx1ZWAgaXMgYW4gb2JqZWN0LCBwdWxsIG1lc3NhZ2UgZnJvbSBpdCwgb3RoZXJ3aXNlIHVzZSB0aGUgcGxhaW5cbiAgLy8gdmFsdWUsIG9yIGRlZmF1bHQgdG8gYW4gZW1wdHkgc3RyaW5nLCBpZiBudWxsXG4gIGNvbnN0IG1lc3NhZ2UgPSAodmFsdWUgfHwge30pLm1lc3NhZ2UgfHwgdmFsdWUgfHwgJyc7XG4gIGlmIChjb2RlICE9PSBVbmtub3duRXJyb3IuY29kZSgpICYmIGpzb253cEVycm9yQ29kZU1hcFtjb2RlXSkge1xuICAgIG1qc29ud3BMb2cuZGVidWcoYE1hdGNoZWQgSlNPTldQIGVycm9yIGNvZGUgJHtjb2RlfSB0byAke2pzb253cEVycm9yQ29kZU1hcFtjb2RlXS5uYW1lfWApO1xuICAgIHJldHVybiBuZXcganNvbndwRXJyb3JDb2RlTWFwW2NvZGVdKG1lc3NhZ2UpO1xuICB9XG4gIG1qc29ud3BMb2cuZGVidWcoYE1hdGNoZWQgSlNPTldQIGVycm9yIGNvZGUgJHtjb2RlfSB0byBVbmtub3duRXJyb3JgKTtcbiAgcmV0dXJuIG5ldyBVbmtub3duRXJyb3IobWVzc2FnZSk7XG59XG5cbi8qKlxuICogUmV0cmlldmUgYW4gZXJyb3IgZGVyaXZlZCBmcm9tIFczQyBKU09OIENvZGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBjb2RlIFczQyBlcnJvciBzdHJpbmcgKHNlZSBodHRwczovL3d3dy53My5vcmcvVFIvd2ViZHJpdmVyLyNoYW5kbGluZy1lcnJvcnMgYEpTT04gRXJyb3IgQ29kZWAgY29sdW1uKVxuICogQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2UgdGhlIGVycm9yIG1lc3NhZ2VcbiAqIEBwYXJhbSB7P3N0cmluZ30gc3RhY2t0cmFjZSBhbiBvcHRpb25hbCBlcnJvciBzdGFja3RyYWNlXG4gKiBAcmV0dXJuIHtQcm90b2NvbEVycm9yfSAgVGhlIGVycm9yIHRoYXQgaXMgYXNzb2NpYXRlZCB3aXRoIHRoZSBXM0MgZXJyb3Igc3RyaW5nXG4gKi9cbmZ1bmN0aW9uIGVycm9yRnJvbVczQ0pzb25Db2RlIChjb2RlLCBtZXNzYWdlLCBzdGFja3RyYWNlID0gbnVsbCkge1xuICBpZiAoY29kZSAmJiB3M2NFcnJvckNvZGVNYXBbY29kZS50b0xvd2VyQ2FzZSgpXSkge1xuICAgIHczY0xvZy5kZWJ1ZyhgTWF0Y2hlZCBXM0MgZXJyb3IgY29kZSAnJHtjb2RlfScgdG8gJHt3M2NFcnJvckNvZGVNYXBbY29kZS50b0xvd2VyQ2FzZSgpXS5uYW1lfWApO1xuICAgIGNvbnN0IHJlc3VsdEVycm9yID0gbmV3IHczY0Vycm9yQ29kZU1hcFtjb2RlLnRvTG93ZXJDYXNlKCldKG1lc3NhZ2UpO1xuICAgIHJlc3VsdEVycm9yLnN0YWNrdHJhY2UgPSBzdGFja3RyYWNlO1xuICAgIHJldHVybiByZXN1bHRFcnJvcjtcbiAgfVxuICB3M2NMb2cuZGVidWcoYE1hdGNoZWQgVzNDIGVycm9yIGNvZGUgJyR7Y29kZX0nIHRvIFVua25vd25FcnJvcmApO1xuICBjb25zdCByZXN1bHRFcnJvciA9IG5ldyBVbmtub3duRXJyb3IobWVzc2FnZSk7XG4gIHJlc3VsdEVycm9yLnN0YWNrdHJhY2UgPSBzdGFja3RyYWNlO1xuICByZXR1cm4gcmVzdWx0RXJyb3I7XG59XG5cbi8qKlxuICogQ29udmVydCBhbiBBcHBpdW0gZXJyb3IgdG8gcHJvcGVyIFczQyBIVFRQIHJlc3BvbnNlXG4gKiBAcGFyYW0ge1Byb3RvY29sRXJyb3J9IGVyciBUaGUgZXJyb3IgdGhhdCBuZWVkcyB0byBiZSB0cmFuc2xhdGVkXG4gKi9cbmZ1bmN0aW9uIGdldFJlc3BvbnNlRm9yVzNDRXJyb3IgKGVycikge1xuICBsZXQgaHR0cFN0YXR1cztcblxuICAvLyBXM0MgZGVmaW5lZCBlcnJvciBtZXNzYWdlIChodHRwczovL3d3dy53My5vcmcvVFIvd2ViZHJpdmVyLyNkZm4tZXJyb3ItY29kZSlcbiAgbGV0IHczY0Vycm9yU3RyaW5nO1xuXG4gIGlmICghZXJyLnczY1N0YXR1cykge1xuICAgIGVyciA9IHV0aWwuaGFzVmFsdWUoZXJyLnN0YXR1cylcbiAgICAgIC8vIElmIGl0J3MgYSBKU09OV1AgZXJyb3IsIGZpbmQgY29ycmVzcG9uZGluZyBlcnJvclxuICAgICAgPyBlcnJvckZyb21NSlNPTldQU3RhdHVzQ29kZShlcnIuc3RhdHVzLCBlcnIudmFsdWUpXG4gICAgICA6IG5ldyBlcnJvcnMuVW5rbm93bkVycm9yKGVyci5tZXNzYWdlKTtcbiAgfVxuXG4gIGlmIChpc0Vycm9yVHlwZShlcnIsIGVycm9ycy5CYWRQYXJhbWV0ZXJzRXJyb3IpKSB7XG4gICAgLy8gcmVzcG9uZCB3aXRoIGEgNDAwIGlmIHdlIGhhdmUgYmFkIHBhcmFtZXRlcnNcbiAgICB3M2NMb2cuZGVidWcoYEJhZCBwYXJhbWV0ZXJzOiAke2Vycn1gKTtcbiAgICB3M2NFcnJvclN0cmluZyA9IEJhZFBhcmFtZXRlcnNFcnJvci5lcnJvcigpO1xuICB9IGVsc2Uge1xuICAgIHczY0Vycm9yU3RyaW5nID0gZXJyLmVycm9yO1xuICB9XG5cbiAgaHR0cFN0YXR1cyA9IGVyci53M2NTdGF0dXM7XG5cbiAgaWYgKCF3M2NFcnJvclN0cmluZykge1xuICAgIHczY0Vycm9yU3RyaW5nID0gVW5rbm93bkVycm9yLmVycm9yKCk7XG4gIH1cblxuICBsZXQgaHR0cFJlc0JvZHkgPSB7XG4gICAgdmFsdWU6IHtcbiAgICAgIGVycm9yOiB3M2NFcnJvclN0cmluZyxcbiAgICAgIG1lc3NhZ2U6IGVyci5tZXNzYWdlLFxuICAgICAgc3RhY2t0cmFjZTogZXJyLnN0YWNrdHJhY2UgfHwgZXJyLnN0YWNrLFxuICAgIH1cbiAgfTtcbiAgcmV0dXJuIFtodHRwU3RhdHVzLCBodHRwUmVzQm9keV07XG59XG5cbi8qKlxuICogQ29udmVydCBhbiBBcHBpdW0gZXJyb3IgdG8gYSBwcm9wZXIgSlNPTldQIHJlc3BvbnNlXG4gKiBAcGFyYW0ge1Byb3RvY29sRXJyb3J9IGVyciBUaGUgZXJyb3IgdG8gYmUgY29udmVydGVkXG4gKi9cbmZ1bmN0aW9uIGdldFJlc3BvbnNlRm9ySnNvbndwRXJyb3IgKGVycikge1xuICBpZiAoaXNVbmtub3duRXJyb3IoZXJyKSkge1xuICAgIGVyciA9IG5ldyBlcnJvcnMuVW5rbm93bkVycm9yKGVycik7XG4gIH1cbiAgLy8gTUpTT05XUCBlcnJvcnMgYXJlIHVzdWFsbHkgNTAwIHN0YXR1cyBjb2RlIHNvIHNldCBpdCB0byB0aGF0IGJ5IGRlZmF1bHRcbiAgbGV0IGh0dHBTdGF0dXMgPSBIVFRQU3RhdHVzQ29kZXMuSU5URVJOQUxfU0VSVkVSX0VSUk9SO1xuICBsZXQgaHR0cFJlc0JvZHkgPSB7XG4gICAgc3RhdHVzOiBlcnIuanNvbndwQ29kZSxcbiAgICB2YWx1ZToge1xuICAgICAgbWVzc2FnZTogZXJyLm1lc3NhZ2VcbiAgICB9XG4gIH07XG5cbiAgaWYgKGlzRXJyb3JUeXBlKGVyciwgZXJyb3JzLkJhZFBhcmFtZXRlcnNFcnJvcikpIHtcbiAgICAvLyByZXNwb25kIHdpdGggYSA0MDAgaWYgd2UgaGF2ZSBiYWQgcGFyYW1ldGVyc1xuICAgIG1qc29ud3BMb2cuZGVidWcoYEJhZCBwYXJhbWV0ZXJzOiAke2Vycn1gKTtcbiAgICBodHRwU3RhdHVzID0gSFRUUFN0YXR1c0NvZGVzLkJBRF9SRVFVRVNUO1xuICAgIGh0dHBSZXNCb2R5ID0gZXJyLm1lc3NhZ2U7XG4gIH0gZWxzZSBpZiAoaXNFcnJvclR5cGUoZXJyLCBlcnJvcnMuTm90WWV0SW1wbGVtZW50ZWRFcnJvcikgfHxcbiAgICAgICAgICAgICBpc0Vycm9yVHlwZShlcnIsIGVycm9ycy5Ob3RJbXBsZW1lbnRlZEVycm9yKSkge1xuICAgIC8vIHJlc3BvbmQgd2l0aCBhIDUwMSBpZiB0aGUgbWV0aG9kIGlzIG5vdCBpbXBsZW1lbnRlZFxuICAgIGh0dHBTdGF0dXMgPSBIVFRQU3RhdHVzQ29kZXMuTk9UX0lNUExFTUVOVEVEO1xuICB9IGVsc2UgaWYgKGlzRXJyb3JUeXBlKGVyciwgZXJyb3JzLk5vU3VjaERyaXZlckVycm9yKSkge1xuICAgIC8vIHJlc3BvbmQgd2l0aCBhIDQwNCBpZiB0aGVyZSBpcyBubyBkcml2ZXIgZm9yIHRoZSBzZXNzaW9uXG4gICAgaHR0cFN0YXR1cyA9IEhUVFBTdGF0dXNDb2Rlcy5OT1RfRk9VTkQ7XG4gIH1cblxuXG4gIHJldHVybiBbaHR0cFN0YXR1cywgaHR0cFJlc0JvZHldO1xufVxuXG5leHBvcnQge1xuICBQcm90b2NvbEVycm9yLCBlcnJvcnMsIGlzRXJyb3JUeXBlLCBpc1Vua25vd25FcnJvcixcbiAgZXJyb3JGcm9tTUpTT05XUFN0YXR1c0NvZGUsIGVycm9yRnJvbVczQ0pzb25Db2RlLFxuICBnZXRSZXNwb25zZUZvclczQ0Vycm9yLCBnZXRSZXNwb25zZUZvckpzb253cEVycm9yLFxufTtcbiJdLCJmaWxlIjoibGliL3Byb3RvY29sL2Vycm9ycy5qcyIsInNvdXJjZVJvb3QiOiIuLi8uLi8uLiJ9
