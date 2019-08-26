"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("source-map-support/register");

var _logger = _interopRequireDefault(require("./logger"));

var _basedevice = _interopRequireDefault(require("./basedevice"));

class YiMac extends _basedevice.default {
  constructor() {
    super();
    this.caps;
    this.shell;
  }

  async closeApp() {
    _logger.default.info(`YiMac: Close App`);

    let process_name = this.caps.app.substring(this.caps.app.lastIndexOf('/') + 1);
    await this.shell.exec(`killall ${process_name}`);
  }

  async endSession() {
    _logger.default.info(`YiMac: End Session`);

    await this.closeApp();
  }

  async launchApp() {
    _logger.default.info(`YiMac: Launch app`);

    let spawn = require('child_process').spawn,
        ls = await spawn(this.caps.app);

    let showXcodeLog = this.caps.showXcodeLog;
    ls.stdout.on('data', function (data) {
      if (showXcodeLog === true && data != null) {
        _logger.default.debug(`Xcode Log Output: ${data.toString()}`);
      }
    });
    ls.stderr.on('data', function (data) {
      if (showXcodeLog === true && data != null) {
        _logger.default.debug(`Xcode Log Error: ${data.toString()}`);
      }
    });
    ls.on('exit', function (code) {
      if (showXcodeLog === true && code != null) {
        _logger.default.debug(`Application exited with code ${code.toString()}`);
      }
    });
  }

  async startSession(caps) {
    _logger.default.info(`YiMac: Start Session`);

    this.caps = caps;
    this.shell = require('shelljs');
    await this.closeApp();
    await this.launchApp();
  }

}

var _default = YiMac;
exports.default = _default;require('source-map-support').install();


//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi95aW1hYy5qcyJdLCJuYW1lcyI6WyJZaU1hYyIsIkJhc2VEZXZpY2UiLCJjb25zdHJ1Y3RvciIsImNhcHMiLCJzaGVsbCIsImNsb3NlQXBwIiwibG9nZ2VyIiwiaW5mbyIsInByb2Nlc3NfbmFtZSIsImFwcCIsInN1YnN0cmluZyIsImxhc3RJbmRleE9mIiwiZXhlYyIsImVuZFNlc3Npb24iLCJsYXVuY2hBcHAiLCJzcGF3biIsInJlcXVpcmUiLCJscyIsInNob3dYY29kZUxvZyIsInN0ZG91dCIsIm9uIiwiZGF0YSIsImRlYnVnIiwidG9TdHJpbmciLCJzdGRlcnIiLCJjb2RlIiwic3RhcnRTZXNzaW9uIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBOztBQUNBOztBQUVBLE1BQU1BLEtBQU4sU0FBb0JDLG1CQUFwQixDQUErQjtBQUU3QkMsRUFBQUEsV0FBVyxHQUFJO0FBQ2I7QUFDQSxTQUFLQyxJQUFMO0FBQ0EsU0FBS0MsS0FBTDtBQUNEOztBQUVELFFBQU1DLFFBQU4sR0FBa0I7QUFDaEJDLG9CQUFPQyxJQUFQLENBQWEsa0JBQWI7O0FBQ0EsUUFBSUMsWUFBWSxHQUFHLEtBQUtMLElBQUwsQ0FBVU0sR0FBVixDQUFjQyxTQUFkLENBQXdCLEtBQUtQLElBQUwsQ0FBVU0sR0FBVixDQUFjRSxXQUFkLENBQTBCLEdBQTFCLElBQWlDLENBQXpELENBQW5CO0FBQ0EsVUFBTSxLQUFLUCxLQUFMLENBQVdRLElBQVgsQ0FBaUIsV0FBVUosWUFBYSxFQUF4QyxDQUFOO0FBQ0Q7O0FBRUQsUUFBTUssVUFBTixHQUFvQjtBQUNsQlAsb0JBQU9DLElBQVAsQ0FBYSxvQkFBYjs7QUFDQSxVQUFNLEtBQUtGLFFBQUwsRUFBTjtBQUNEOztBQUVELFFBQU1TLFNBQU4sR0FBbUI7QUFDakJSLG9CQUFPQyxJQUFQLENBQWEsbUJBQWI7O0FBQ0EsUUFBSVEsS0FBSyxHQUFHQyxPQUFPLENBQUMsZUFBRCxDQUFQLENBQXlCRCxLQUFyQztBQUFBLFFBQ0lFLEVBQUUsR0FBRyxNQUFNRixLQUFLLENBQUMsS0FBS1osSUFBTCxDQUFVTSxHQUFYLENBRHBCOztBQUdBLFFBQUlTLFlBQVksR0FBRyxLQUFLZixJQUFMLENBQVVlLFlBQTdCO0FBR0FELElBQUFBLEVBQUUsQ0FBQ0UsTUFBSCxDQUFVQyxFQUFWLENBQWEsTUFBYixFQUFxQixVQUFVQyxJQUFWLEVBQWdCO0FBQ25DLFVBQUlILFlBQVksS0FBSyxJQUFqQixJQUF5QkcsSUFBSSxJQUFJLElBQXJDLEVBQTJDO0FBQ3pDZix3QkFBT2dCLEtBQVAsQ0FBYyxxQkFBb0JELElBQUksQ0FBQ0UsUUFBTCxFQUFnQixFQUFsRDtBQUNEO0FBQ0YsS0FKRDtBQU9BTixJQUFBQSxFQUFFLENBQUNPLE1BQUgsQ0FBVUosRUFBVixDQUFhLE1BQWIsRUFBcUIsVUFBVUMsSUFBVixFQUFnQjtBQUNuQyxVQUFJSCxZQUFZLEtBQUssSUFBakIsSUFBeUJHLElBQUksSUFBSSxJQUFyQyxFQUEyQztBQUN6Q2Ysd0JBQU9nQixLQUFQLENBQWMsb0JBQW1CRCxJQUFJLENBQUNFLFFBQUwsRUFBZ0IsRUFBakQ7QUFDRDtBQUNGLEtBSkQ7QUFNQU4sSUFBQUEsRUFBRSxDQUFDRyxFQUFILENBQU0sTUFBTixFQUFjLFVBQVVLLElBQVYsRUFBZ0I7QUFDNUIsVUFBSVAsWUFBWSxLQUFLLElBQWpCLElBQXlCTyxJQUFJLElBQUksSUFBckMsRUFBMkM7QUFDekNuQix3QkFBT2dCLEtBQVAsQ0FBYyxnQ0FBK0JHLElBQUksQ0FBQ0YsUUFBTCxFQUFnQixFQUE3RDtBQUNEO0FBQ0YsS0FKRDtBQUtEOztBQUVELFFBQU1HLFlBQU4sQ0FBb0J2QixJQUFwQixFQUEwQjtBQUN4Qkcsb0JBQU9DLElBQVAsQ0FBYSxzQkFBYjs7QUFDQSxTQUFLSixJQUFMLEdBQVlBLElBQVo7QUFDQSxTQUFLQyxLQUFMLEdBQWFZLE9BQU8sQ0FBQyxTQUFELENBQXBCO0FBQ0EsVUFBTSxLQUFLWCxRQUFMLEVBQU47QUFDQSxVQUFNLEtBQUtTLFNBQUwsRUFBTjtBQUNEOztBQXJENEI7O2VBd0RoQmQsSyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBsb2dnZXIgZnJvbSAnLi9sb2dnZXInO1xuaW1wb3J0IEJhc2VEZXZpY2UgZnJvbSAnLi9iYXNlZGV2aWNlJztcblxuY2xhc3MgWWlNYWMgZXh0ZW5kcyBCYXNlRGV2aWNlIHtcblxuICBjb25zdHJ1Y3RvciAoKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLmNhcHM7XG4gICAgdGhpcy5zaGVsbDtcbiAgfVxuXG4gIGFzeW5jIGNsb3NlQXBwICgpIHtcbiAgICBsb2dnZXIuaW5mbyhgWWlNYWM6IENsb3NlIEFwcGApO1xuICAgIGxldCBwcm9jZXNzX25hbWUgPSB0aGlzLmNhcHMuYXBwLnN1YnN0cmluZyh0aGlzLmNhcHMuYXBwLmxhc3RJbmRleE9mKCcvJykgKyAxKTtcbiAgICBhd2FpdCB0aGlzLnNoZWxsLmV4ZWMoYGtpbGxhbGwgJHtwcm9jZXNzX25hbWV9YCk7XG4gIH1cblxuICBhc3luYyBlbmRTZXNzaW9uICgpIHtcbiAgICBsb2dnZXIuaW5mbyhgWWlNYWM6IEVuZCBTZXNzaW9uYCk7XG4gICAgYXdhaXQgdGhpcy5jbG9zZUFwcCgpO1xuICB9XG5cbiAgYXN5bmMgbGF1bmNoQXBwICgpIHtcbiAgICBsb2dnZXIuaW5mbyhgWWlNYWM6IExhdW5jaCBhcHBgKTtcbiAgICBsZXQgc3Bhd24gPSByZXF1aXJlKCdjaGlsZF9wcm9jZXNzJykuc3Bhd24sXG4gICAgICAgIGxzID0gYXdhaXQgc3Bhd24odGhpcy5jYXBzLmFwcCk7XG5cbiAgICBsZXQgc2hvd1hjb2RlTG9nID0gdGhpcy5jYXBzLnNob3dYY29kZUxvZzsgLy9Gb3Igc29tZSByZWFzb24gc3RkZXJyIHN0YXRlbWVudCBzZWVzIHRoaXMuY2FwcyBhcyB1bmRlZmluZWQ/IVxuXG4gICAgLy9QcmludCBYY29kZSBsb2dzIChTVERPVVQpXG4gICAgbHMuc3Rkb3V0Lm9uKCdkYXRhJywgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgIGlmIChzaG93WGNvZGVMb2cgPT09IHRydWUgJiYgZGF0YSAhPSBudWxsKSB7XG4gICAgICAgIGxvZ2dlci5kZWJ1ZyhgWGNvZGUgTG9nIE91dHB1dDogJHtkYXRhLnRvU3RyaW5nKCl9YCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvL1ByaW50IFhjb2RlIGxvZ3MgKFNUREVSUilcbiAgICBscy5zdGRlcnIub24oJ2RhdGEnLCBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgaWYgKHNob3dYY29kZUxvZyA9PT0gdHJ1ZSAmJiBkYXRhICE9IG51bGwpIHtcbiAgICAgICAgbG9nZ2VyLmRlYnVnKGBYY29kZSBMb2cgRXJyb3I6ICR7ZGF0YS50b1N0cmluZygpfWApO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgbHMub24oJ2V4aXQnLCBmdW5jdGlvbiAoY29kZSkge1xuICAgICAgaWYgKHNob3dYY29kZUxvZyA9PT0gdHJ1ZSAmJiBjb2RlICE9IG51bGwpIHtcbiAgICAgICAgbG9nZ2VyLmRlYnVnKGBBcHBsaWNhdGlvbiBleGl0ZWQgd2l0aCBjb2RlICR7Y29kZS50b1N0cmluZygpfWApO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgc3RhcnRTZXNzaW9uIChjYXBzKSB7XG4gICAgbG9nZ2VyLmluZm8oYFlpTWFjOiBTdGFydCBTZXNzaW9uYCk7XG4gICAgdGhpcy5jYXBzID0gY2FwcztcbiAgICB0aGlzLnNoZWxsID0gcmVxdWlyZSgnc2hlbGxqcycpO1xuICAgIGF3YWl0IHRoaXMuY2xvc2VBcHAoKTtcbiAgICBhd2FpdCB0aGlzLmxhdW5jaEFwcCgpO1xuICB9XG5cbn1cbmV4cG9ydCBkZWZhdWx0IFlpTWFjO1xuIl0sImZpbGUiOiJsaWIveWltYWMuanMiLCJzb3VyY2VSb290IjoiLi4vLi4ifQ==
