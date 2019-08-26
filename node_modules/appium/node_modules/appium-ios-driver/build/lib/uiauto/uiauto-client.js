"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.DEFAULT_INSTRUMENTS_SOCKET = exports.UIAutoClient = void 0;

require("source-map-support/register");

var _uiautoResponse = _interopRequireDefault(require("./uiauto-response"));

var _logger = _interopRequireDefault(require("./logger"));

var _through = _interopRequireDefault(require("through"));

var _net = _interopRequireDefault(require("net"));

var _appiumSupport = require("appium-support");

var _path = _interopRequireDefault(require("path"));

var _bluebird = _interopRequireDefault(require("bluebird"));

var _lodash = _interopRequireDefault(require("lodash"));

var _appiumBaseDriver = require("appium-base-driver");

const MORE_COMMAND = '#more';
const DEFAULT_INSTRUMENTS_SOCKET = '/tmp/instruments_sock';
exports.DEFAULT_INSTRUMENTS_SOCKET = DEFAULT_INSTRUMENTS_SOCKET;

class UIAutoClient {
  constructor(sock = '/tmp/instruments_sock') {
    this.curCommand = null;
    this.onReceiveCommand = null;
    this.commandQueue = [];
    this.sock = sock;
    this.socketServer = null;
    this.hasConnected = false;
    this.currentSocket = null;
  }

  async sendCommand(cmd) {
    let cmdPromise = new _bluebird.default((resolve, reject) => {
      let cb = result => {
        if (result.status === 0) {
          resolve(result.value);
        } else if (result.status) {
          let jsonwpError = (0, _appiumBaseDriver.errorFromCode)(result.status, result.value);
          reject(jsonwpError);
        } else {
          reject(new Error(result.value));
        }
      };

      this.commandQueue.push({
        cmd,
        cb
      });

      if (_lodash.default.isFunction(this.onReceiveCommand)) {
        this.onReceiveCommand();
      }
    });
    return await cmdPromise;
  }

  async start() {
    let connectedPromise = new _bluebird.default(resolve => {
      let response = new _uiautoResponse.default();
      this.socketServer = _net.default.createServer({
        allowHalfOpen: true
      }, conn => {
        if (!this.hasConnected) {
          this.hasConnected = true;

          _logger.default.info('Instruments is ready to receive commands');

          resolve(true);
        }

        conn.setEncoding('utf8');
        this.currentSocket = conn;
        conn.on('close', () => {
          this.currentSocket = null;
        });
        conn.pipe((0, _through.default)(data => {
          _logger.default.debug(`Socket data received (${data.length} bytes)`);

          response.addData(data);
        }));
        conn.on('end', () => {
          if (this.curCommand) {
            let result = response.getResult();

            if (result && !result.needsMoreData) {
              this.curCommand.cb(result);
              this.curCommand = null;
            } else {
              if (result) {
                _logger.default.debug('Not the last chunk, trying to get more');
              } else {
                _logger.default.debug('No result received. Continuing to try to get more');
              }

              this.commandQueue.unshift({
                cmd: MORE_COMMAND,
                cb: this.curCommand.cb
              });
            }
          } else {
            _logger.default.debug('Got a result when we were not expecting one! Ignoring it');

            response.resetBuffer();
          }

          let onReceiveCommand = () => {
            this.onReceiveCommand = null;
            this.curCommand = this.commandQueue.shift();

            _logger.default.debug(`Sending command to instruments: ${this.curCommand.cmd}`);

            conn.write(JSON.stringify({
              cmd: this.curCommand.cmd
            }));
            conn.end();
          };

          if (this.commandQueue.length) {
            onReceiveCommand();
          } else {
            this.onReceiveCommand = onReceiveCommand;
          }
        });
      });
      this.socketServer.on('close', function () {
        _logger.default.debug('Instruments socket server was closed');
      });
    });
    await _appiumSupport.fs.rimraf(this.sock);
    await (0, _appiumSupport.mkdirp)(_path.default.dirname(this.sock));
    this.socketServer.listen(this.sock);

    _logger.default.debug(`Instruments socket server started at ${this.sock}`);

    return await connectedPromise;
  }

  async shutdown() {
    this.curCommand = null;
    this.onReceiveCommand = null;

    if (this.currentSocket) {
      _logger.default.debug('Destroying instruments client socket.');

      this.currentSocket.end();
      this.currentSocket.destroy();
      this.currentSocket = null;
    }

    if (this.socketServer) {
      _logger.default.debug('Closing socket server.');

      await _bluebird.default.promisify(this.socketServer.close, {
        context: this.socketServer
      })();
      this.socketServer = null;
    }
  }

  async safeShutdown() {
    _logger.default.debug('Shutting down command proxy and ignoring any errors');

    try {
      await this.shutdown();
    } catch (err) {
      _logger.default.debug(`Ignoring error: ${err}`);
    }
  }

}

exports.UIAutoClient = UIAutoClient;
var _default = UIAutoClient;
exports.default = _default;require('source-map-support').install();


//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi91aWF1dG8vdWlhdXRvLWNsaWVudC5qcyJdLCJuYW1lcyI6WyJNT1JFX0NPTU1BTkQiLCJERUZBVUxUX0lOU1RSVU1FTlRTX1NPQ0tFVCIsIlVJQXV0b0NsaWVudCIsImNvbnN0cnVjdG9yIiwic29jayIsImN1ckNvbW1hbmQiLCJvblJlY2VpdmVDb21tYW5kIiwiY29tbWFuZFF1ZXVlIiwic29ja2V0U2VydmVyIiwiaGFzQ29ubmVjdGVkIiwiY3VycmVudFNvY2tldCIsInNlbmRDb21tYW5kIiwiY21kIiwiY21kUHJvbWlzZSIsIkIiLCJyZXNvbHZlIiwicmVqZWN0IiwiY2IiLCJyZXN1bHQiLCJzdGF0dXMiLCJ2YWx1ZSIsImpzb253cEVycm9yIiwiRXJyb3IiLCJwdXNoIiwiXyIsImlzRnVuY3Rpb24iLCJzdGFydCIsImNvbm5lY3RlZFByb21pc2UiLCJyZXNwb25zZSIsIlVJQXV0b1Jlc3BvbnNlIiwibmV0IiwiY3JlYXRlU2VydmVyIiwiYWxsb3dIYWxmT3BlbiIsImNvbm4iLCJsb2dnZXIiLCJpbmZvIiwic2V0RW5jb2RpbmciLCJvbiIsInBpcGUiLCJkYXRhIiwiZGVidWciLCJsZW5ndGgiLCJhZGREYXRhIiwiZ2V0UmVzdWx0IiwibmVlZHNNb3JlRGF0YSIsInVuc2hpZnQiLCJyZXNldEJ1ZmZlciIsInNoaWZ0Iiwid3JpdGUiLCJKU09OIiwic3RyaW5naWZ5IiwiZW5kIiwiZnMiLCJyaW1yYWYiLCJwYXRoIiwiZGlybmFtZSIsImxpc3RlbiIsInNodXRkb3duIiwiZGVzdHJveSIsInByb21pc2lmeSIsImNsb3NlIiwiY29udGV4dCIsInNhZmVTaHV0ZG93biIsImVyciJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFlQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFHQSxNQUFNQSxZQUFZLEdBQUcsT0FBckI7QUFDQSxNQUFNQywwQkFBMEIsR0FBRyx1QkFBbkM7OztBQUVBLE1BQU1DLFlB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QUFwQztBQUNEO0FBQ0Y7O0FBbkpnQjs7O2VBdUpKN0QsWSIsInNvdXJjZXNDb250ZW50IjpbIi8vIFRoZSBDb21tYW5kIFByb3h5IHJlbGF5cyBVSUF1dG8gbWVzc2FnZSB0byBhbmQgZnJvbSBBcHBpdW0uIEl0IGlzIGFsc28gdGhlXG4vLyBVSUF1dG8gZmFjYWRlIGZvciBBcHBpdW0uXG4vL1xuLy8gVGhlIG1lc3NhZ2Ugcm91dGUgaXMgdGhlIGZvbGxvd2luZzpcbi8vIEFwcGl1bSA8LS0+IENvbW1hbmQgUHJveHkgPC0tPiBJbnN0cnVtZW50c1xuLy8gVGhlIG1lZGl1bSBiZXR3ZWVuIEluc3RydW1lbnRzIGFuZCBDb21tYW5kIFByb3h5IGlzIHRoZSBjb21tYW5kLXByb3h5LWNsaWVudFxuLy8gc2NyaXB0LlxuLy9cbi8vIENvbW1hbmQgUHJveHkgLS0+IEluc3RydW1lbnRzIG1lc3NhZ2UgZm9ybWF0OiB7Y21kOlwiPENNRD5cIn1cbi8vXG4vLyBJbnN0cnVtZW50cyAtLT4gQ29tbWFuZCBQcm94eSBtZXNzYWdlIGZvcm1hdDpcbi8vIDxvbmUgY2hhciBtZXNzYWdlIHR5cGU+LDxzdHJpbmdpZmllZCBqc29uIGRhdGE+XG4vLyA8c3RyaW5naWZpZWQganNvbiBkYXRhPiBmb3JtYXQ6XG4vLyB7c3RhdHVzOjxzdGF0dXM+LCB2YWx1ZTo8cmVzdWx0Pn1cblxuaW1wb3J0IFVJQXV0b1Jlc3BvbnNlIGZyb20gJy4vdWlhdXRvLXJlc3BvbnNlJztcbmltcG9ydCBsb2dnZXIgZnJvbSAnLi9sb2dnZXInO1xuaW1wb3J0IHRocm91Z2ggZnJvbSAndGhyb3VnaCc7XG5pbXBvcnQgbmV0IGZyb20gJ25ldCc7XG5pbXBvcnQgeyBta2RpcnAsIGZzIH0gZnJvbSAnYXBwaXVtLXN1cHBvcnQnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgQiBmcm9tICdibHVlYmlyZCc7XG5pbXBvcnQgXyBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IHsgZXJyb3JGcm9tQ29kZSB9IGZyb20gJ2FwcGl1bS1iYXNlLWRyaXZlcic7XG5cblxuY29uc3QgTU9SRV9DT01NQU5EID0gJyNtb3JlJztcbmNvbnN0IERFRkFVTFRfSU5TVFJVTUVOVFNfU09DS0VUID0gJy90bXAvaW5zdHJ1bWVudHNfc29jayc7XG5cbmNsYXNzIFVJQXV0b0NsaWVudCB7XG4gIGNvbnN0cnVjdG9yIChzb2NrID0gJy90bXAvaW5zdHJ1bWVudHNfc29jaycpIHtcbiAgICB0aGlzLmN1ckNvbW1hbmQgPSBudWxsO1xuICAgIHRoaXMub25SZWNlaXZlQ29tbWFuZCA9IG51bGw7XG4gICAgdGhpcy5jb21tYW5kUXVldWUgPSBbXTtcbiAgICB0aGlzLnNvY2sgPSBzb2NrO1xuICAgIHRoaXMuc29ja2V0U2VydmVyID0gbnVsbDtcbiAgICB0aGlzLmhhc0Nvbm5lY3RlZCA9IGZhbHNlO1xuICAgIHRoaXMuY3VycmVudFNvY2tldCA9IG51bGw7XG4gIH1cblxuICBhc3luYyBzZW5kQ29tbWFuZCAoY21kKSB7XG4gICAgbGV0IGNtZFByb21pc2UgPSBuZXcgQigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBsZXQgY2IgPSAocmVzdWx0KSA9PiB7XG4gICAgICAgIC8vIGdldCBiYWNrIGEgSlNPTldQIG9iamVjdCwgc28gZGVjb2RlIGFuZFxuICAgICAgICAvLyBqdXN0IHJldHVybiB0aGUgdmFsdWVcbiAgICAgICAgaWYgKHJlc3VsdC5zdGF0dXMgPT09IDApIHtcbiAgICAgICAgICByZXNvbHZlKHJlc3VsdC52YWx1ZSk7XG4gICAgICAgIH0gZWxzZSBpZiAocmVzdWx0LnN0YXR1cykge1xuICAgICAgICAgIGxldCBqc29ud3BFcnJvciA9IGVycm9yRnJvbUNvZGUocmVzdWx0LnN0YXR1cywgcmVzdWx0LnZhbHVlKTtcbiAgICAgICAgICByZWplY3QoanNvbndwRXJyb3IpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IocmVzdWx0LnZhbHVlKSk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICB0aGlzLmNvbW1hbmRRdWV1ZS5wdXNoKHtjbWQsIGNifSk7XG4gICAgICBpZiAoXy5pc0Z1bmN0aW9uKHRoaXMub25SZWNlaXZlQ29tbWFuZCkpIHtcbiAgICAgICAgdGhpcy5vblJlY2VpdmVDb21tYW5kKCk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGF3YWl0IGNtZFByb21pc2U7XG4gIH1cblxuICAvKlxuICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIHJlc3VsdGluZyBjb25uZWN0aW5nIGlzIHRoZSBmaXJzdFxuICAgKiBzb2NrZXQgY29ubmVjdGlvbiBmb3IgdGhpcyBwcm94eSBzZXNzaW9uXG4gICAqL1xuICBhc3luYyBzdGFydCAoKSB7XG4gICAgLy8gb25seSByZXNvbHZlIHRoZSBwcm9taXNlIHdoZW4gdGhlIHNlcnZlciB0aGF0IGlzIGNyZWF0ZWQgYWN0dWFsbHkgY29ubmVjdHNcbiAgICBsZXQgY29ubmVjdGVkUHJvbWlzZSA9IG5ldyBCKChyZXNvbHZlKSA9PiB7XG4gICAgICBsZXQgcmVzcG9uc2UgPSBuZXcgVUlBdXRvUmVzcG9uc2UoKTtcbiAgICAgIHRoaXMuc29ja2V0U2VydmVyID0gbmV0LmNyZWF0ZVNlcnZlcih7YWxsb3dIYWxmT3BlbjogdHJ1ZX0sIChjb25uKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy5oYXNDb25uZWN0ZWQpIHtcbiAgICAgICAgICB0aGlzLmhhc0Nvbm5lY3RlZCA9IHRydWU7XG4gICAgICAgICAgbG9nZ2VyLmluZm8oJ0luc3RydW1lbnRzIGlzIHJlYWR5IHRvIHJlY2VpdmUgY29tbWFuZHMnKTtcbiAgICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgICB9XG4gICAgICAgIC8vIHVwIHdpdGggc3RyaW5ncyEgZG93biB3aXRoIGJ1ZmZlcnMhXG4gICAgICAgIGNvbm4uc2V0RW5jb2RpbmcoJ3V0ZjgnKTtcblxuICAgICAgICAvLyBrZWVwIHRyYWNrIG9mIHRoaXMgc28gdGhhdCB3ZSBjYW4gZGVzdHJveSB0aGUgc29ja2V0XG4gICAgICAgIC8vIHdoZW4gc2h1dHRpbmcgZG93blxuICAgICAgICB0aGlzLmN1cnJlbnRTb2NrZXQgPSBjb25uO1xuXG4gICAgICAgIGNvbm4ub24oJ2Nsb3NlJywgKCkgPT4ge1xuICAgICAgICAgIHRoaXMuY3VycmVudFNvY2tldCA9IG51bGw7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIGFsbCBkYXRhIGdvZXMgaW50byBidWZmZXJcbiAgICAgICAgY29ubi5waXBlKHRocm91Z2goKGRhdGEpID0+IHtcbiAgICAgICAgICBsb2dnZXIuZGVidWcoYFNvY2tldCBkYXRhIHJlY2VpdmVkICgke2RhdGEubGVuZ3RofSBieXRlcylgKTtcbiAgICAgICAgICByZXNwb25zZS5hZGREYXRhKGRhdGEpO1xuICAgICAgICB9KSk7XG5cbiAgICAgICAgLy8gd2hlbiBhbGwgZGF0YSBpcyBpbiwgZGVhbCB3aXRoIGl0XG4gICAgICAgIGNvbm4ub24oJ2VuZCcsICgpID0+IHtcbiAgICAgICAgICAvLyBpZiB3ZSBhcmUgbWlkd2F5IHRocm91Z2ggaGFuZGxpbmcgYSBjb21tYW5kXG4gICAgICAgICAgLy8gd2Ugd2FudCB0byB0cnkgb3V0IHRoZSBkYXRhLCBnZXR0aW5nIG1vcmUgaWYgbmVjZXNzYXJ5XG4gICAgICAgICAgaWYgKHRoaXMuY3VyQ29tbWFuZCkge1xuICAgICAgICAgICAgbGV0IHJlc3VsdCA9IHJlc3BvbnNlLmdldFJlc3VsdCgpO1xuICAgICAgICAgICAgaWYgKHJlc3VsdCAmJiAhcmVzdWx0Lm5lZWRzTW9yZURhdGEpIHtcbiAgICAgICAgICAgICAgLy8gaWYgd2UncmUgZG9uZSBhbHRvZ2V0aGVyLCBjYWxsIHRoZSBjYWxsYmFjayBhc3NvY2lhdGVkIHdpdGggdGhlIGNvbW1hbmRcbiAgICAgICAgICAgICAgdGhpcy5jdXJDb21tYW5kLmNiKHJlc3VsdCk7XG4gICAgICAgICAgICAgIHRoaXMuY3VyQ29tbWFuZCA9IG51bGw7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgbG9nZ2VyLmRlYnVnKCdOb3QgdGhlIGxhc3QgY2h1bmssIHRyeWluZyB0byBnZXQgbW9yZScpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxvZ2dlci5kZWJ1ZygnTm8gcmVzdWx0IHJlY2VpdmVkLiBDb250aW51aW5nIHRvIHRyeSB0byBnZXQgbW9yZScpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIC8vIGFkZCBhIGNvbW1hbmQgdG8gdGhlIHF1ZXVlLCB0byByZXF1ZXN0IG1vcmUgZGF0YVxuICAgICAgICAgICAgICB0aGlzLmNvbW1hbmRRdWV1ZS51bnNoaWZ0KHtjbWQ6IE1PUkVfQ09NTUFORCwgY2I6IHRoaXMuY3VyQ29tbWFuZC5jYn0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsb2dnZXIuZGVidWcoJ0dvdCBhIHJlc3VsdCB3aGVuIHdlIHdlcmUgbm90IGV4cGVjdGluZyBvbmUhIElnbm9yaW5nIGl0Jyk7XG4gICAgICAgICAgICByZXNwb25zZS5yZXNldEJ1ZmZlcigpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIHNldCB1cCBhIGNhbGxiYWNrIHRvIGhhbmRsZSB0aGUgbmV4dCBjb21tYW5kXG4gICAgICAgICAgbGV0IG9uUmVjZWl2ZUNvbW1hbmQgPSAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLm9uUmVjZWl2ZUNvbW1hbmQgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5jdXJDb21tYW5kID0gdGhpcy5jb21tYW5kUXVldWUuc2hpZnQoKTtcbiAgICAgICAgICAgIGxvZ2dlci5kZWJ1ZyhgU2VuZGluZyBjb21tYW5kIHRvIGluc3RydW1lbnRzOiAke3RoaXMuY3VyQ29tbWFuZC5jbWR9YCk7XG4gICAgICAgICAgICBjb25uLndyaXRlKEpTT04uc3RyaW5naWZ5KHtjbWQ6IHRoaXMuY3VyQ29tbWFuZC5jbWR9KSk7XG4gICAgICAgICAgICBjb25uLmVuZCgpO1xuICAgICAgICAgIH07XG4gICAgICAgICAgaWYgKHRoaXMuY29tbWFuZFF1ZXVlLmxlbmd0aCkge1xuICAgICAgICAgICAgb25SZWNlaXZlQ29tbWFuZCgpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLm9uUmVjZWl2ZUNvbW1hbmQgPSBvblJlY2VpdmVDb21tYW5kO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9KTtcblxuICAgICAgdGhpcy5zb2NrZXRTZXJ2ZXIub24oJ2Nsb3NlJywgZnVuY3Rpb24gKCkge1xuICAgICAgICBsb2dnZXIuZGVidWcoJ0luc3RydW1lbnRzIHNvY2tldCBzZXJ2ZXIgd2FzIGNsb3NlZCcpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICAvLyByZW1vdmUgc29ja2V0IGZpbGUgaWYgaXQgY3VycmVudGx5IGV4aXN0c1xuICAgIGF3YWl0IGZzLnJpbXJhZih0aGlzLnNvY2spO1xuXG4gICAgLy8gY3JlYXRlIHRoZSBuZXcgc29ja2V0IGZpbGVcbiAgICBhd2FpdCBta2RpcnAocGF0aC5kaXJuYW1lKHRoaXMuc29jaykpO1xuXG4gICAgdGhpcy5zb2NrZXRTZXJ2ZXIubGlzdGVuKHRoaXMuc29jayk7XG4gICAgbG9nZ2VyLmRlYnVnKGBJbnN0cnVtZW50cyBzb2NrZXQgc2VydmVyIHN0YXJ0ZWQgYXQgJHt0aGlzLnNvY2t9YCk7XG5cbiAgICByZXR1cm4gYXdhaXQgY29ubmVjdGVkUHJvbWlzZTtcbiAgfVxuXG4gIGFzeW5jIHNodXRkb3duICgpIHtcbiAgICAvLyBtYWtlIHN1cmUgY2xlYXIgb3V0IGNvbW1hbmQgY2JzIHNvIHdlIGNhbid0IGhhdmUgYW55IGxpbmdlcmluZyBjYnNcbiAgICAvLyBpZiBhIHNvY2tldCByZXF1ZXN0IG1ha2VzIGl0IHRocm91Z2ggYWZ0ZXIgZXhpdCBzb21laG93XG4gICAgdGhpcy5jdXJDb21tYW5kID0gbnVsbDtcbiAgICB0aGlzLm9uUmVjZWl2ZUNvbW1hbmQgPSBudWxsO1xuXG4gICAgaWYgKHRoaXMuY3VycmVudFNvY2tldCkge1xuICAgICAgbG9nZ2VyLmRlYnVnKCdEZXN0cm95aW5nIGluc3RydW1lbnRzIGNsaWVudCBzb2NrZXQuJyk7XG4gICAgICB0aGlzLmN1cnJlbnRTb2NrZXQuZW5kKCk7XG4gICAgICB0aGlzLmN1cnJlbnRTb2NrZXQuZGVzdHJveSgpO1xuICAgICAgdGhpcy5jdXJyZW50U29ja2V0ID0gbnVsbDtcbiAgICB9XG4gICAgaWYgKHRoaXMuc29ja2V0U2VydmVyKSB7XG4gICAgICBsb2dnZXIuZGVidWcoJ0Nsb3Npbmcgc29ja2V0IHNlcnZlci4nKTtcbiAgICAgIGF3YWl0IChCLnByb21pc2lmeSh0aGlzLnNvY2tldFNlcnZlci5jbG9zZSwge2NvbnRleHQ6IHRoaXMuc29ja2V0U2VydmVyfSkpKCk7XG4gICAgICB0aGlzLnNvY2tldFNlcnZlciA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgc2FmZVNodXRkb3duICgpIHtcbiAgICBsb2dnZXIuZGVidWcoJ1NodXR0aW5nIGRvd24gY29tbWFuZCBwcm94eSBhbmQgaWdub3JpbmcgYW55IGVycm9ycycpO1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCB0aGlzLnNodXRkb3duKCk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBsb2dnZXIuZGVidWcoYElnbm9yaW5nIGVycm9yOiAke2Vycn1gKTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IHsgVUlBdXRvQ2xpZW50LCBERUZBVUxUX0lOU1RSVU1FTlRTX1NPQ0tFVCB9O1xuZXhwb3J0IGRlZmF1bHQgVUlBdXRvQ2xpZW50O1xuIl0sImZpbGUiOiJsaWIvdWlhdXRvL3VpYXV0by1jbGllbnQuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vLi4ifQ==
