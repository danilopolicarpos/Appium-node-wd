"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.IOSLog = void 0;

require("source-map-support/register");

var _appiumIosDriver = require("appium-ios-driver");

var _path = _interopRequireDefault(require("path"));

var _appiumSupport = require("appium-support");

var _lodash = _interopRequireDefault(require("lodash"));

var _logger = _interopRequireDefault(require("../logger"));

var _teen_process = require("teen_process");

class IOSLog extends _appiumIosDriver.IOSLog {
  async startCaptureSimulator() {
    if (_lodash.default.isUndefined(this.sim.udid)) {
      throw new Error(`Log capture requires a sim udid`);
    }

    let tool, args;

    if (this.xcodeVersion.major < 9) {
      const systemLogPath = _path.default.resolve(this.sim.getLogDir(), 'system.log');

      if (!(await _appiumSupport.fs.exists(systemLogPath))) {
        throw new Error(`No logs could be found at ${systemLogPath}`);
      }

      _logger.default.debug(`System log path: ${systemLogPath}`);

      tool = 'tail';
      args = ['-f', '-n', '1', systemLogPath];
    } else {
      if (!(await this.sim.isRunning())) {
        throw new Error(`iOS Simulator with udid ${this.sim.udid} is not running`);
      }

      tool = 'xcrun';
      args = ['simctl', 'spawn', this.sim.udid, 'log', 'stream', '--style', 'compact'];
    }

    _logger.default.debug(`Starting log capture for iOS Simulator with udid '${this.sim.udid}', ` + `using '${tool} ${args.join(' ')}'`);

    try {
      await (0, _teen_process.exec)('pkill', ['-xf', [tool, ...args].join(' ')]);
    } catch (ign) {}

    try {
      this.proc = new _teen_process.SubProcess(tool, args);
      await this.finishStartingLogCapture();
    } catch (e) {
      throw new Error(`Simulator log capture failed. Original error: ${e.message}`);
    }
  }

  get isCapturing() {
    return !!(this.proc && this.proc.isRunning);
  }

}

exports.IOSLog = IOSLog;
var _default = IOSLog;
exports.default = _default;require('source-map-support').install();


//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9kZXZpY2UtbG9nL2lvcy1sb2cuanMiXSwibmFtZXMiOlsiSU9TTG9nIiwiSU9TRHJpdmVySU9TTG9nIiwic3RhcnRDYXB0dXJlU2ltdWxhdG9yIiwiXyIsImlzVW5kZWZpbmVkIiwic2ltIiwidWRpZCIsIkVycm9yIiwidG9vbCIsImFyZ3MiLCJ4Y29kZVZlcnNpb24iLCJtYWpvciIsInN5c3RlbUxvZ1BhdGgiLCJwYXRoIiwicmVzb2x2ZSIsImdldExvZ0RpciIsImZzIiwiZXhpc3RzIiwibG9nIiwiZGVidWciLCJpc1J1bm5pbmciLCJqb2luIiwiaWduIiwicHJvYyIsIlN1YlByb2Nlc3MiLCJmaW5pc2hTdGFydGluZ0xvZ0NhcHR1cmUiLCJlIiwibWVzc2FnZSIsImlzQ2FwdHVyaW5nIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUdBLE1BQU1BLE1BQU4sU0FBcUJDLHVCQUFyQixDQUFxQztBQUNuQyxRQUFNQyxxQkFBTixHQUErQjtBQUM3QixRQUFJQyxnQkFBRUMsV0FBRixDQUFjLEtBQUtDLEdBQUwsQ0FBU0MsSUFBdkIsQ0FBSixFQUFrQztBQUNoQyxZQUFNLElBQUlDLEtBQUosQ0FBVyxpQ0FBWCxDQUFOO0FBQ0Q7O0FBRUQsUUFBSUMsSUFBSixFQUFVQyxJQUFWOztBQUNBLFFBQUksS0FBS0MsWUFBTCxDQUFrQkMsS0FBbEIsR0FBMEIsQ0FBOUIsRUFBaUM7QUFDL0IsWUFBTUMsYUFBYSxHQUFHQyxjQUFLQyxPQUFMLENBQWEsS0FBS1QsR0FBTCxDQUFTVSxTQUFULEVBQWIsRUFBbUMsWUFBbkMsQ0FBdEI7O0FBQ0EsVUFBSSxFQUFDLE1BQU1DLGtCQUFHQyxNQUFILENBQVVMLGFBQVYsQ0FBUCxDQUFKLEVBQXFDO0FBQ25DLGNBQU0sSUFBSUwsS0FBSixDQUFXLDZCQUE0QkssYUFBYyxFQUFyRCxDQUFOO0FBQ0Q7O0FBQ0RNLHNCQUFJQyxLQUFKLENBQVcsb0JBQW1CUCxhQUFjLEVBQTVDOztBQUNBSixNQUFBQSxJQUFJLEdBQUcsTUFBUDtBQUNBQyxNQUFBQSxJQUFJLEdBQUcsQ0FBQyxJQUFELEVBQU8sSUFBUCxFQUFhLEdBQWIsRUFBa0JHLGFBQWxCLENBQVA7QUFDRCxLQVJELE1BUU87QUFDTCxVQUFJLEVBQUMsTUFBTSxLQUFLUCxHQUFMLENBQVNlLFNBQVQsRUFBUCxDQUFKLEVBQWlDO0FBQy9CLGNBQU0sSUFBSWIsS0FBSixDQUFXLDJCQUEwQixLQUFLRixHQUFMLENBQVNDLElBQUssaUJBQW5ELENBQU47QUFDRDs7QUFDREUsTUFBQUEsSUFBSSxHQUFHLE9BQVA7QUFDQUMsTUFBQUEsSUFBSSxHQUFHLENBQUMsUUFBRCxFQUFXLE9BQVgsRUFBb0IsS0FBS0osR0FBTCxDQUFTQyxJQUE3QixFQUFtQyxLQUFuQyxFQUEwQyxRQUExQyxFQUFvRCxTQUFwRCxFQUErRCxTQUEvRCxDQUFQO0FBQ0Q7O0FBQ0RZLG9CQUFJQyxLQUFKLENBQVcscURBQW9ELEtBQUtkLEdBQUwsQ0FBU0MsSUFBSyxLQUFuRSxHQUNDLFVBQVNFLElBQUssSUFBR0MsSUFBSSxDQUFDWSxJQUFMLENBQVUsR0FBVixDQUFlLEdBRDNDOztBQUVBLFFBQUk7QUFFRixZQUFNLHdCQUFLLE9BQUwsRUFBYyxDQUFDLEtBQUQsRUFBUSxDQUFDYixJQUFELEVBQU8sR0FBR0MsSUFBVixFQUFnQlksSUFBaEIsQ0FBcUIsR0FBckIsQ0FBUixDQUFkLENBQU47QUFDRCxLQUhELENBR0UsT0FBT0MsR0FBUCxFQUFZLENBQUU7O0FBQ2hCLFFBQUk7QUFDRixXQUFLQyxJQUFMLEdBQVksSUFBSUMsd0JBQUosQ0FBZWhCLElBQWYsRUFBcUJDLElBQXJCLENBQVo7QUFDQSxZQUFNLEtBQUtnQix3QkFBTCxFQUFOO0FBQ0QsS0FIRCxDQUdFLE9BQU9DLENBQVAsRUFBVTtBQUNWLFlBQU0sSUFBSW5CLEtBQUosQ0FBVyxpREFBZ0RtQixDQUFDLENBQUNDLE9BQVEsRUFBckUsQ0FBTjtBQUNEO0FBQ0Y7O0FBRUQsTUFBSUMsV0FBSixHQUFtQjtBQUNqQixXQUFPLENBQUMsRUFBRSxLQUFLTCxJQUFMLElBQWEsS0FBS0EsSUFBTCxDQUFVSCxTQUF6QixDQUFSO0FBQ0Q7O0FBdENrQzs7O2VBMEN0QnBCLE0iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJT1NMb2cgYXMgSU9TRHJpdmVySU9TTG9nIH0gZnJvbSAnYXBwaXVtLWlvcy1kcml2ZXInO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBmcyB9IGZyb20gJ2FwcGl1bS1zdXBwb3J0JztcbmltcG9ydCBfIGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgbG9nIGZyb20gJy4uL2xvZ2dlcic7XG5pbXBvcnQgeyBTdWJQcm9jZXNzLCBleGVjIH0gZnJvbSAndGVlbl9wcm9jZXNzJztcblxuXG5jbGFzcyBJT1NMb2cgZXh0ZW5kcyBJT1NEcml2ZXJJT1NMb2cge1xuICBhc3luYyBzdGFydENhcHR1cmVTaW11bGF0b3IgKCkge1xuICAgIGlmIChfLmlzVW5kZWZpbmVkKHRoaXMuc2ltLnVkaWQpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYExvZyBjYXB0dXJlIHJlcXVpcmVzIGEgc2ltIHVkaWRgKTtcbiAgICB9XG5cbiAgICBsZXQgdG9vbCwgYXJncztcbiAgICBpZiAodGhpcy54Y29kZVZlcnNpb24ubWFqb3IgPCA5KSB7XG4gICAgICBjb25zdCBzeXN0ZW1Mb2dQYXRoID0gcGF0aC5yZXNvbHZlKHRoaXMuc2ltLmdldExvZ0RpcigpLCAnc3lzdGVtLmxvZycpO1xuICAgICAgaWYgKCFhd2FpdCBmcy5leGlzdHMoc3lzdGVtTG9nUGF0aCkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBObyBsb2dzIGNvdWxkIGJlIGZvdW5kIGF0ICR7c3lzdGVtTG9nUGF0aH1gKTtcbiAgICAgIH1cbiAgICAgIGxvZy5kZWJ1ZyhgU3lzdGVtIGxvZyBwYXRoOiAke3N5c3RlbUxvZ1BhdGh9YCk7XG4gICAgICB0b29sID0gJ3RhaWwnO1xuICAgICAgYXJncyA9IFsnLWYnLCAnLW4nLCAnMScsIHN5c3RlbUxvZ1BhdGhdO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoIWF3YWl0IHRoaXMuc2ltLmlzUnVubmluZygpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgaU9TIFNpbXVsYXRvciB3aXRoIHVkaWQgJHt0aGlzLnNpbS51ZGlkfSBpcyBub3QgcnVubmluZ2ApO1xuICAgICAgfVxuICAgICAgdG9vbCA9ICd4Y3J1bic7XG4gICAgICBhcmdzID0gWydzaW1jdGwnLCAnc3Bhd24nLCB0aGlzLnNpbS51ZGlkLCAnbG9nJywgJ3N0cmVhbScsICctLXN0eWxlJywgJ2NvbXBhY3QnXTtcbiAgICB9XG4gICAgbG9nLmRlYnVnKGBTdGFydGluZyBsb2cgY2FwdHVyZSBmb3IgaU9TIFNpbXVsYXRvciB3aXRoIHVkaWQgJyR7dGhpcy5zaW0udWRpZH0nLCBgICtcbiAgICAgICAgICAgICAgYHVzaW5nICcke3Rvb2x9ICR7YXJncy5qb2luKCcgJyl9J2ApO1xuICAgIHRyeSB7XG4gICAgICAvLyBjbGVhbnVwIGV4aXN0aW5nIGxpc3RlbmVycyBpZiB0aGUgcHJldmlvdXMgc2Vzc2lvbiBoYXMgbm90IGJlZW4gdGVybWluYXRlZCBwcm9wZXJseVxuICAgICAgYXdhaXQgZXhlYygncGtpbGwnLCBbJy14ZicsIFt0b29sLCAuLi5hcmdzXS5qb2luKCcgJyldKTtcbiAgICB9IGNhdGNoIChpZ24pIHt9XG4gICAgdHJ5IHtcbiAgICAgIHRoaXMucHJvYyA9IG5ldyBTdWJQcm9jZXNzKHRvb2wsIGFyZ3MpO1xuICAgICAgYXdhaXQgdGhpcy5maW5pc2hTdGFydGluZ0xvZ0NhcHR1cmUoKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFNpbXVsYXRvciBsb2cgY2FwdHVyZSBmYWlsZWQuIE9yaWdpbmFsIGVycm9yOiAke2UubWVzc2FnZX1gKTtcbiAgICB9XG4gIH1cblxuICBnZXQgaXNDYXB0dXJpbmcgKCkge1xuICAgIHJldHVybiAhISh0aGlzLnByb2MgJiYgdGhpcy5wcm9jLmlzUnVubmluZyk7XG4gIH1cbn1cblxuZXhwb3J0IHsgSU9TTG9nIH07XG5leHBvcnQgZGVmYXVsdCBJT1NMb2c7XG4iXSwiZmlsZSI6ImxpYi9kZXZpY2UtbG9nL2lvcy1sb2cuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vLi4ifQ==
