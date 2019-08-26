"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.iProxy = void 0;

require("source-map-support/register");

var _logger = _interopRequireDefault(require("../logger"));

var _utils = require("./utils");

var _bluebird = _interopRequireDefault(require("bluebird"));

var _appiumSupport = require("appium-support");

var _teen_process = require("teen_process");

var _portscanner = require("portscanner");

var _asyncbox = require("asyncbox");

const IPROXY_STARTUP_TIMEOUT = 5000;

const iproxyLog = _appiumSupport.logger.getLogger('iProxy');

class iProxy {
  constructor(udid, localport, deviceport, detached = true) {
    this.expectIProxyErrors = true;
    this.localport = parseInt(localport, 10);
    this.deviceport = parseInt(deviceport, 10);
    this.udid = udid;
    this.iproxy = new _teen_process.SubProcess('iproxy', [localport, deviceport, udid], {
      detached,
      stdio: ['ignore', 'pipe', 'pipe']
    });
  }

  async start() {
    _logger.default.debug(`Starting iproxy to forward traffic from local port ${this.localport} ` + `to device port ${this.deviceport} over USB for the device ${this.udid}`);

    this.expectIProxyErrors = true;
    return await new _bluebird.default((resolve, reject) => {
      this.iproxy.on('exit', code => {
        _logger.default.debug(`iproxy exited with code '${code}'`);

        if (code) {
          return reject(new Error(`iproxy exited with code '${code}'`));
        }
      });
      this.iproxy.on('output', (stdout, stderr) => {
        if (this.expectIProxyErrors) {
          return;
        }

        let out = stdout || stderr;

        for (let line of out.split('\n')) {
          if (!line.length) {
            continue;
          }

          if (line.includes('Resource temporarily unavailable')) {
            _logger.default.debug('Connection to WDA timed out');
          } else {
            iproxyLog.debug(line);
          }
        }
      });
      return (async () => {
        try {
          if ((await (0, _portscanner.checkPortStatus)(this.localport, '127.0.0.1')) === 'open') {
            throw new Error(`The port #${this.localport} is occupied by an other app. ` + `You can customize its value by setting the 'wdaLocalPort' capability.`);
          }

          await this.iproxy.start(0);

          try {
            await (0, _asyncbox.waitForCondition)(async () => {
              try {
                return (await (0, _portscanner.checkPortStatus)(this.localport, '127.0.0.1')) === 'open';
              } catch (ign) {
                return false;
              }
            }, {
              waitMs: IPROXY_STARTUP_TIMEOUT,
              intervalMs: 300
            });

            _logger.default.debug(`iProxy is running and is listening on port #${this.localport}`);
          } catch (e) {
            _logger.default.warn(`The local port ${this.localport} is still closed after ${IPROXY_STARTUP_TIMEOUT}ms. ` + `Continuing anyway`);
          }

          resolve();
        } catch (err) {
          _logger.default.error(`Error starting iproxy: '${err.message}'`);

          reject(new Error('Unable to start iproxy. Make sure libusbmuxd is installed and ' + 'PATH contains the folder, where the binary is located.'));
        }
      })();
    });
  }

  async quit() {
    await (0, _utils.killProcess)('iproxy', this.iproxy);
    this.expectIProxyErrors = true;
  }

}

exports.iProxy = iProxy;
var _default = iProxy;
exports.default = _default;require('source-map-support').install();


//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi93ZGEvaXByb3h5LmpzIl0sIm5hbWVzIjpbIklQUk9YWV9TVEFSVFVQX1RJTUVPVVQiLCJpcHJveHlMb2ciLCJsb2dnZXIiLCJnZXRMb2dnZXIiLCJpUHJveHkiLCJjb25zdHJ1Y3RvciIsInVkaWQiLCJsb2NhbHBvcnQiLCJkZXZpY2Vwb3J0IiwiZGV0YWNoZWQiLCJleHBlY3RJUHJveHlFcnJvcnMiLCJwYXJzZUludCIsImlwcm94eSIsIlN1YlByb2Nlc3MiLCJzdGRpbyIsInN0YXJ0IiwibG9nIiwiZGVidWciLCJCIiwicmVzb2x2ZSIsInJlamVjdCIsIm9uIiwiY29kZSIsIkVycm9yIiwic3Rkb3V0Iiwic3RkZXJyIiwib3V0IiwibGluZSIsInNwbGl0IiwibGVuZ3RoIiwiaW5jbHVkZXMiLCJpZ24iLCJ3YWl0TXMiLCJpbnRlcnZhbE1zIiwiZSIsIndhcm4iLCJlcnIiLCJlcnJvciIsIm1lc3NhZ2UiLCJxdWl0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUdBLE1BQU1BLHNCQUFzQixHQUFHLElBQS9COztBQUVBLE1BQU1DLFNBQVMsR0FBR0Msc0JBQU9DLFNBQVAsQ0FBaUIsUUFBakIsQ0FBbEI7O0FBRUEsTUFBTUMsTUFBTixDQUFhO0FBQ1hDLEVBQUFBLFdBQVcsQ0FBRUMsSUFBRixFQUFRQyxTQUFSLEVBQW1CQyxVQUFuQixFQUErQkMsUUFBUSxHQUFHLElBQTFDLEVBQWdEO0FBQ3pELFNBQUtDLGtCQUFMLEdBQTBCLElBQTFCO0FBQ0EsU0FBS0gsU0FBTCxHQUFpQkksUUFBUSxDQUFDSixTQUFELEVBQVksRUFBWixDQUF6QjtBQUNBLFNBQUtDLFVBQUwsR0FBa0JHLFFBQVEsQ0FBQ0gsVUFBRCxFQUFhLEVBQWIsQ0FBMUI7QUFDQSxTQUFLRixJQUFMLEdBQVlBLElBQVo7QUFDQSxTQUFLTSxNQUFMLEdBQWMsSUFBSUMsd0JBQUosQ0FBZSxRQUFmLEVBQXlC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QUFDRixPQTdCTSxHQUFQO0FBOEJELEtBM0RZLENBQWI7QUE0REQ7O0FBRUQsUUFBTWdCLElBQU4sR0FBYztBQUNaLFVBQU0sd0JBQVksUUFBWixFQUFzQixLQUFLM0IsTUFBM0IsQ0FBTjtBQUNBLFNBQUtGLGtCQUFMLEdBQTBCLElBQTFCO0FBQ0Q7O0FBbEZVOzs7ZUFzRkVOLE0iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgbG9nIGZyb20gJy4uL2xvZ2dlcic7XG5pbXBvcnQgeyBraWxsUHJvY2VzcyB9IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IEIgZnJvbSAnYmx1ZWJpcmQnO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSAnYXBwaXVtLXN1cHBvcnQnO1xuaW1wb3J0IHsgU3ViUHJvY2VzcyB9IGZyb20gJ3RlZW5fcHJvY2Vzcyc7XG5pbXBvcnQgeyBjaGVja1BvcnRTdGF0dXMgfSBmcm9tICdwb3J0c2Nhbm5lcic7XG5pbXBvcnQgeyB3YWl0Rm9yQ29uZGl0aW9uIH0gZnJvbSAnYXN5bmNib3gnO1xuXG5cbmNvbnN0IElQUk9YWV9TVEFSVFVQX1RJTUVPVVQgPSA1MDAwO1xuXG5jb25zdCBpcHJveHlMb2cgPSBsb2dnZXIuZ2V0TG9nZ2VyKCdpUHJveHknKTtcblxuY2xhc3MgaVByb3h5IHtcbiAgY29uc3RydWN0b3IgKHVkaWQsIGxvY2FscG9ydCwgZGV2aWNlcG9ydCwgZGV0YWNoZWQgPSB0cnVlKSB7XG4gICAgdGhpcy5leHBlY3RJUHJveHlFcnJvcnMgPSB0cnVlO1xuICAgIHRoaXMubG9jYWxwb3J0ID0gcGFyc2VJbnQobG9jYWxwb3J0LCAxMCk7XG4gICAgdGhpcy5kZXZpY2Vwb3J0ID0gcGFyc2VJbnQoZGV2aWNlcG9ydCwgMTApO1xuICAgIHRoaXMudWRpZCA9IHVkaWQ7XG4gICAgdGhpcy5pcHJveHkgPSBuZXcgU3ViUHJvY2VzcygnaXByb3h5JywgW2xvY2FscG9ydCwgZGV2aWNlcG9ydCwgdWRpZF0sIHtcbiAgICAgIGRldGFjaGVkLFxuICAgICAgc3RkaW86IFsnaWdub3JlJywgJ3BpcGUnLCAncGlwZSddLFxuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgc3RhcnQgKCkge1xuICAgIGxvZy5kZWJ1ZyhgU3RhcnRpbmcgaXByb3h5IHRvIGZvcndhcmQgdHJhZmZpYyBmcm9tIGxvY2FsIHBvcnQgJHt0aGlzLmxvY2FscG9ydH0gYCArXG4gICAgICBgdG8gZGV2aWNlIHBvcnQgJHt0aGlzLmRldmljZXBvcnR9IG92ZXIgVVNCIGZvciB0aGUgZGV2aWNlICR7dGhpcy51ZGlkfWApO1xuICAgIHRoaXMuZXhwZWN0SVByb3h5RXJyb3JzID0gdHJ1ZTtcblxuICAgIHJldHVybiBhd2FpdCBuZXcgQigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB0aGlzLmlwcm94eS5vbignZXhpdCcsIChjb2RlKSA9PiB7XG4gICAgICAgIGxvZy5kZWJ1ZyhgaXByb3h5IGV4aXRlZCB3aXRoIGNvZGUgJyR7Y29kZX0nYCk7XG4gICAgICAgIGlmIChjb2RlKSB7XG4gICAgICAgICAgcmV0dXJuIHJlamVjdChuZXcgRXJyb3IoYGlwcm94eSBleGl0ZWQgd2l0aCBjb2RlICcke2NvZGV9J2ApKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICB0aGlzLmlwcm94eS5vbignb3V0cHV0JywgKHN0ZG91dCwgc3RkZXJyKSA9PiB7XG4gICAgICAgIC8vIGRvIG5vdGhpbmcgaWYgd2UgZXhwZWN0IGVycm9yc1xuICAgICAgICBpZiAodGhpcy5leHBlY3RJUHJveHlFcnJvcnMpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgb3V0ID0gc3Rkb3V0IHx8IHN0ZGVycjtcbiAgICAgICAgZm9yIChsZXQgbGluZSBvZiBvdXQuc3BsaXQoJ1xcbicpKSB7XG4gICAgICAgICAgaWYgKCFsaW5lLmxlbmd0aCkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGxpbmUuaW5jbHVkZXMoJ1Jlc291cmNlIHRlbXBvcmFyaWx5IHVuYXZhaWxhYmxlJykpIHtcbiAgICAgICAgICAgIC8vIHRoaXMgZ2VuZXJhbGx5IGhhcHBlbnMgd2hlbiBXREEgZG9lcyBub3QgcmVzcG9uZCxcbiAgICAgICAgICAgIC8vIHNvIHByaW50IGEgbW9yZSB1c2VmdWwgbWVzc2FnZVxuICAgICAgICAgICAgbG9nLmRlYnVnKCdDb25uZWN0aW9uIHRvIFdEQSB0aW1lZCBvdXQnKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaXByb3h5TG9nLmRlYnVnKGxpbmUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiAoYXN5bmMgKCkgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGlmICgoYXdhaXQgY2hlY2tQb3J0U3RhdHVzKHRoaXMubG9jYWxwb3J0LCAnMTI3LjAuMC4xJykpID09PSAnb3BlbicpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVGhlIHBvcnQgIyR7dGhpcy5sb2NhbHBvcnR9IGlzIG9jY3VwaWVkIGJ5IGFuIG90aGVyIGFwcC4gYCArXG4gICAgICAgICAgICAgIGBZb3UgY2FuIGN1c3RvbWl6ZSBpdHMgdmFsdWUgYnkgc2V0dGluZyB0aGUgJ3dkYUxvY2FsUG9ydCcgY2FwYWJpbGl0eS5gKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYXdhaXQgdGhpcy5pcHJveHkuc3RhcnQoMCk7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IHdhaXRGb3JDb25kaXRpb24oYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHJldHVybiAoYXdhaXQgY2hlY2tQb3J0U3RhdHVzKHRoaXMubG9jYWxwb3J0LCAnMTI3LjAuMC4xJykpID09PSAnb3Blbic7XG4gICAgICAgICAgICAgIH0gY2F0Y2ggKGlnbikge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICB3YWl0TXM6IElQUk9YWV9TVEFSVFVQX1RJTUVPVVQsXG4gICAgICAgICAgICAgIGludGVydmFsTXM6IDMwMCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgbG9nLmRlYnVnKGBpUHJveHkgaXMgcnVubmluZyBhbmQgaXMgbGlzdGVuaW5nIG9uIHBvcnQgIyR7dGhpcy5sb2NhbHBvcnR9YCk7XG4gICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgbG9nLndhcm4oYFRoZSBsb2NhbCBwb3J0ICR7dGhpcy5sb2NhbHBvcnR9IGlzIHN0aWxsIGNsb3NlZCBhZnRlciAke0lQUk9YWV9TVEFSVFVQX1RJTUVPVVR9bXMuIGAgK1xuICAgICAgICAgICAgICBgQ29udGludWluZyBhbnl3YXlgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICBsb2cuZXJyb3IoYEVycm9yIHN0YXJ0aW5nIGlwcm94eTogJyR7ZXJyLm1lc3NhZ2V9J2ApO1xuICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ1VuYWJsZSB0byBzdGFydCBpcHJveHkuIE1ha2Ugc3VyZSBsaWJ1c2JtdXhkIGlzIGluc3RhbGxlZCBhbmQgJyArXG4gICAgICAgICAgICAnUEFUSCBjb250YWlucyB0aGUgZm9sZGVyLCB3aGVyZSB0aGUgYmluYXJ5IGlzIGxvY2F0ZWQuJykpO1xuICAgICAgICB9XG4gICAgICB9KSgpO1xuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgcXVpdCAoKSB7XG4gICAgYXdhaXQga2lsbFByb2Nlc3MoJ2lwcm94eScsIHRoaXMuaXByb3h5KTtcbiAgICB0aGlzLmV4cGVjdElQcm94eUVycm9ycyA9IHRydWU7XG4gIH1cbn1cblxuZXhwb3J0IHsgaVByb3h5IH07XG5leHBvcnQgZGVmYXVsdCBpUHJveHk7XG4iXSwiZmlsZSI6ImxpYi93ZGEvaXByb3h5LmpzIiwic291cmNlUm9vdCI6Ii4uLy4uLy4uIn0=
