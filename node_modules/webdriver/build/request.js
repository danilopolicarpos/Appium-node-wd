"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _url = _interopRequireDefault(require("url"));

var _http = _interopRequireDefault(require("http"));

var _path = _interopRequireDefault(require("path"));

var _https = _interopRequireDefault(require("https"));

var _request = _interopRequireDefault(require("request"));

var _events = _interopRequireDefault(require("events"));

var _logger = _interopRequireDefault(require("@wdio/logger"));

var _utils = require("./utils");

var _package = _interopRequireDefault(require("../package.json"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const log = (0, _logger.default)('webdriver');
const agents = {
  http: new _http.default.Agent({
    keepAlive: true
  }),
  https: new _https.default.Agent({
    keepAlive: true
  })
};

class WebDriverRequest extends _events.default {
  constructor(method, endpoint, body, isHubCommand) {
    super();
    this.body = body;
    this.method = method;
    this.endpoint = endpoint;
    this.isHubCommand = isHubCommand;
    this.requiresSessionId = this.endpoint.match(/:sessionId/);
    this.defaultOptions = {
      method,
      followAllRedirects: true,
      json: true,
      headers: {
        'Connection': 'keep-alive',
        'Accept': 'application/json',
        'User-Agent': 'webdriver/' + _package.default.version
      }
    };
  }

  makeRequest(options, sessionId) {
    const fullRequestOptions = Object.assign({}, this.defaultOptions, this._createOptions(options, sessionId));
    this.emit('request', fullRequestOptions);
    return this._request(fullRequestOptions, options.connectionRetryCount);
  }

  _createOptions(options, sessionId) {
    const requestOptions = {
      agent: options.agent || agents[options.protocol],
      headers: typeof options.headers === 'object' ? options.headers : {},
      qs: typeof options.queryParams === 'object' ? options.queryParams : {}
    };

    if (this.body && (Object.keys(this.body).length || this.method === 'POST')) {
      requestOptions.body = this.body;
      requestOptions.headers = Object.assign({}, requestOptions.headers, {
        'Content-Length': Buffer.byteLength(JSON.stringify(requestOptions.body), 'UTF-8')
      });
    }

    if (this.requiresSessionId && !sessionId) {
      throw new Error('A sessionId is required for this command');
    }

    requestOptions.uri = _url.default.parse(`${options.protocol}://` + `${options.hostname}:${options.port}` + (this.isHubCommand ? this.endpoint : _path.default.join(options.path, this.endpoint.replace(':sessionId', sessionId))));

    if (this.endpoint === '/session' && options.user && options.key) {
      requestOptions.auth = {
        user: options.user,
        pass: options.key
      };
    }

    requestOptions.strictSSL = !(process.env.STRICT_SSL === 'false' || process.env.strict_ssl === 'false');
    return requestOptions;
  }

  _request(fullRequestOptions, totalRetryCount = 0, retryCount = 0) {
    log.info(`[${fullRequestOptions.method}] ${fullRequestOptions.uri.href}`);

    if (fullRequestOptions.body && Object.keys(fullRequestOptions.body).length) {
      log.info('DATA', fullRequestOptions.body);
    }

    return new Promise((resolve, reject) => (0, _request.default)(fullRequestOptions, (err, response, body) => {
      const error = err || (0, _utils.getErrorFromResponseBody)(body);

      if (this.isHubCommand) {
        if (typeof body === 'string' && body.startsWith('<!DOCTYPE html>')) {
          return reject(new Error('Command can only be called to a Selenium Hub'));
        }

        body = {
          value: body || null
        };
      }

      if (!err && (0, _utils.isSuccessfulResponse)(response.statusCode, body)) {
        this.emit('response', {
          result: body
        });
        return resolve(body);
      }

      if (error.name === 'stale element reference') {
        log.warn('Request encountered a stale element - terminating request');
        this.emit('response', {
          error
        });
        return reject(error);
      }

      if (retryCount >= totalRetryCount || error.message.includes('invalid session id')) {
        log.error('Request failed due to', error);
        this.emit('response', {
          error
        });
        return reject(error);
      }

      ++retryCount;
      this.emit('retry', {
        error,
        retryCount
      });
      log.warn('Request failed due to', error.message);
      log.info(`Retrying ${retryCount}/${totalRetryCount}`);

      this._request(fullRequestOptions, totalRetryCount, retryCount).then(resolve, reject);
    }));
  }

}

exports.default = WebDriverRequest;