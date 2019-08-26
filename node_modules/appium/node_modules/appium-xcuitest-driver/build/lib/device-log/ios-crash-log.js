"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.IOSCrashLog = void 0;

require("source-map-support/register");

var _appiumIosDriver = require("appium-ios-driver");

var _appiumSupport = require("appium-support");

var _bluebird = _interopRequireDefault(require("bluebird"));

var _logger = _interopRequireDefault(require("../logger"));

var _teen_process = require("teen_process");

var _path = _interopRequireDefault(require("path"));

class IOSCrashLog extends _appiumIosDriver.IOSCrashLog {
  constructor(opts = {}) {
    super(opts.udid ? _path.default.resolve(process.env.HOME, 'Library', 'Logs', 'CrashReporter', 'MobileDevice') : _path.default.resolve(process.env.HOME, 'Library', 'Logs', 'DiagnosticReports'));
    this.udid = opts.udid;
    this.phoneName = null;
    this.sim = opts.sim;
  }

  async getCrashes() {
    let crashLogsRoot = this.logDir;

    if (this.udid) {
      if (!this.phoneName) {
        try {
          const {
            stdout
          } = await (0, _teen_process.exec)('idevicename', ['-u', this.udid]);
          this.phoneName = stdout.trim();
        } catch (e) {
          _logger.default.warn(`Cannot get the name of the crashes folder for the device with udid '${this.udid}'. ` + `Original error: ${e.message}`);

          return [];
        }
      }

      if (this.phoneName) {
        crashLogsRoot = _path.default.resolve(crashLogsRoot, this.phoneName);
      }
    }

    if (!(await _appiumSupport.fs.exists(crashLogsRoot))) {
      _logger.default.debug(`Crash reports root '${crashLogsRoot}' does not exist. Got nothing to gather.`);

      return [];
    }

    const foundFiles = await _appiumSupport.fs.glob(`${crashLogsRoot}/**/*.crash`);

    if (this.udid) {
      return foundFiles;
    }

    return await _bluebird.default.filter(foundFiles, async x => {
      try {
        const content = await _appiumSupport.fs.readFile(x, 'utf8');
        return content.toUpperCase().includes(this.sim.udid.toUpperCase());
      } catch (err) {
        return false;
      }
    });
  }

  async filesToJSON(paths) {
    return await _bluebird.default.map(paths, async fullPath => {
      const stat = await _appiumSupport.fs.stat(fullPath);
      return {
        timestamp: stat.ctime.getTime(),
        level: 'ALL',
        message: await _appiumSupport.fs.readFile(fullPath, 'utf8')
      };
    });
  }

}

exports.IOSCrashLog = IOSCrashLog;
var _default = IOSCrashLog;
exports.default = _default;require('source-map-support').install();


//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9kZXZpY2UtbG9nL2lvcy1jcmFzaC1sb2cuanMiXSwibmFtZXMiOlsiSU9TQ3Jhc2hMb2ciLCJJT1NEcml2ZXJJT1NDcmFzaExvZyIsImNvbnN0cnVjdG9yIiwib3B0cyIsInVkaWQiLCJwYXRoIiwicmVzb2x2ZSIsInByb2Nlc3MiLCJlbnYiLCJIT01FIiwicGhvbmVOYW1lIiwic2ltIiwiZ2V0Q3Jhc2hlcyIsImNyYXNoTG9nc1Jvb3QiLCJsb2dEaXIiLCJzdGRvdXQiLCJ0cmltIiwiZSIsImxvZyIsIndhcm4iLCJtZXNzYWdlIiwiZnMiLCJleGlzdHMiLCJkZWJ1ZyIsImZvdW5kRmlsZXMiLCJnbG9iIiwiQiIsImZpbHRlciIsIngiLCJjb250ZW50IiwicmVhZEZpbGUiLCJ0b1VwcGVyQ2FzZSIsImluY2x1ZGVzIiwiZXJyIiwiZmlsZXNUb0pTT04iLCJwYXRocyIsIm1hcCIsImZ1bGxQYXRoIiwic3RhdCIsInRpbWVzdGFtcCIsImN0aW1lIiwiZ2V0VGltZSIsImxldmVsIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUVBLE1BQU1BLFdBQU4sU0FBMEJDLDRCQUExQixDQUErQztBQUM3Q0MsRUFBQUEsV0FBVyxDQUFFQyxJQUFJLEdBQUcsRUFBVCxFQUFhO0FBQ3RCLFVBQU1BLElBQUksQ0FBQ0MsSUFBTCxHQUNKQyxjQUFLQyxPQUFMLENBQWFDLE9BQU8sQ0FBQ0MsR0FBUixDQUFZQyxJQUF6QixFQUErQixTQUEvQixFQUEwQyxNQUExQyxFQUFrRCxlQUFsRCxFQUFtRSxjQUFuRSxDQURJLEdBRUpKLGNBQUtDLE9BQUwsQ0FBYUMsT0FBTyxDQUFDQyxHQUFSLENBQVlDLElBQXpCLEVBQStCLFNBQS9CLEVBQTBDLE1BQTFDLEVBQWtELG1CQUFsRCxDQUZGO0FBR0EsU0FBS0wsSUFBTCxHQUFZRCxJQUFJLENBQUNDLElBQWpCO0FBQ0EsU0FBS00sU0FBTCxHQUFpQixJQUFqQjtBQUNBLFNBQUtDLEdBQUwsR0FBV1IsSUFBSSxDQUFDUSxHQUFoQjtBQUNEOztBQUVELFFBQU1DLFVBQU4sR0FBb0I7QUFDbEIsUUFBSUMsYUFBYSxHQUFHLEtBQUtDLE1BQXpCOztBQUNBLFFBQUksS0FBS1YsSUFBVCxFQUFlO0FBQ2IsVUFBSSxDQUFDLEtBQUtNLFNBQVYsRUFBcUI7QUFDbkIsWUFBSTtBQUNGLGdCQUFNO0FBQUNLLFlBQUFBO0FBQUQsY0FBVyxNQUFNLHdCQUFLLGFBQUwsRUFBb0IsQ0FBQyxJQUFELEVBQU8sS0FBS1gsSUFBWixDQUFwQixDQUF2QjtBQUNBLGVBQUtNLFNBQUwsR0FBaUJLLE1BQU0sQ0FBQ0MsSUFBUCxFQUFqQjtBQUNELFNBSEQsQ0FHRSxPQUFPQyxDQUFQLEVBQVU7QUFDVkMsMEJBQUlDLElBQUosQ0FBVSx1RUFBc0UsS0FBS2YsSUFBSyxLQUFqRixHQUNOLG1CQUFrQmEsQ0FBQyxDQUFDRyxPQUFRLEVBRC9COztBQUVBLGlCQUFPLEVBQVA7QUFDRDtBQUNGOztBQUNELFVBQUksS0FBS1YsU0FBVCxFQUFvQjtBQUNsQkcsUUFBQUEsYUFBYSxHQUFHUixjQUFLQyxPQUFMLENBQWFPLGFBQWIsRUFBNEIsS0FBS0gsU0FBakMsQ0FBaEI7QUFDRDtBQUNGOztBQUNELFFBQUksRUFBQyxNQUFNVyxrQkFBR0MsTUFBSCxDQUFVVCxhQUFWLENBQVAsQ0FBSixFQUFxQztBQUNuQ0ssc0JBQUlLLEtBQUosQ0FBVyx1QkFBc0JWLGFBQWMsMENBQS9DOztBQUNBLGFBQU8sRUFBUDtBQUNEOztBQUNELFVBQU1XLFVBQVUsR0FBRyxNQUFNSCxrQkFBR0ksSUFBSCxDQUFTLEdBQUVaLGFBQWMsYUFBekIsQ0FBekI7O0FBQ0EsUUFBSSxLQUFLVCxJQUFULEVBQWU7QUFDYixhQUFPb0IsVUFBUDtBQUNEOztBQUVELFdBQU8sTUFBTUUsa0JBQUVDLE1BQUYsQ0FBU0gsVUFBVCxFQUFxQixNQUFPSSxDQUFQLElBQWE7QUFDN0MsVUFBSTtBQUNGLGNBQU1DLE9BQU8sR0FBRyxNQUFNUixrQkFBR1MsUUFBSCxDQUFZRixDQUFaLEVBQWUsTUFBZixDQUF0QjtBQUNBLGVBQU9DLE9BQU8sQ0FBQ0UsV0FBUixHQUFzQkMsUUFBdEIsQ0FBK0IsS0FBS3JCLEdBQUwsQ0FBU1AsSUFBVCxDQUFjMkIsV0FBZCxFQUEvQixDQUFQO0FBQ0QsT0FIRCxDQUdFLE9BQU9FLEdBQVAsRUFBWTtBQUNaLGVBQU8sS0FBUDtBQUNEO0FBQ0YsS0FQWSxDQUFiO0FBUUQ7O0FBRUQsUUFBTUMsV0FBTixDQUFtQkMsS0FBbkIsRUFBMEI7QUFDeEIsV0FBTyxNQUFNVCxrQkFBRVUsR0FBRixDQUFNRCxLQUFOLEVBQWEsTUFBT0UsUUFBUCxJQUFvQjtBQUM1QyxZQUFNQyxJQUFJLEdBQUcsTUFBTWpCLGtCQUFHaUIsSUFBSCxDQUFRRCxRQUFSLENBQW5CO0FBQ0EsYUFBTztBQUNMRSxRQUFBQSxTQUFTLEVBQUVELElBQUksQ0FBQ0UsS0FBTCxDQUFXQyxPQUFYLEVBRE47QUFFTEMsUUFBQUEsS0FBSyxFQUFFLEtBRkY7QUFHTHRCLFFBQUFBLE9BQU8sRUFBRSxNQUFNQyxrQkFBR1MsUUFBSCxDQUFZTyxRQUFaLEVBQXNCLE1BQXRCO0FBSFYsT0FBUDtBQUtELEtBUFksQ0FBYjtBQVFEOztBQXZENEM7OztlQTJEaENyQyxXIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSU9TQ3Jhc2hMb2cgYXMgSU9TRHJpdmVySU9TQ3Jhc2hMb2cgfSBmcm9tICdhcHBpdW0taW9zLWRyaXZlcic7XG5pbXBvcnQgeyBmcyB9IGZyb20gJ2FwcGl1bS1zdXBwb3J0JztcbmltcG9ydCBCIGZyb20gJ2JsdWViaXJkJztcbmltcG9ydCBsb2cgZnJvbSAnLi4vbG9nZ2VyJztcbmltcG9ydCB7IGV4ZWMgfSBmcm9tICd0ZWVuX3Byb2Nlc3MnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5cbmNsYXNzIElPU0NyYXNoTG9nIGV4dGVuZHMgSU9TRHJpdmVySU9TQ3Jhc2hMb2cge1xuICBjb25zdHJ1Y3RvciAob3B0cyA9IHt9KSB7XG4gICAgc3VwZXIob3B0cy51ZGlkID9cbiAgICAgIHBhdGgucmVzb2x2ZShwcm9jZXNzLmVudi5IT01FLCAnTGlicmFyeScsICdMb2dzJywgJ0NyYXNoUmVwb3J0ZXInLCAnTW9iaWxlRGV2aWNlJykgOlxuICAgICAgcGF0aC5yZXNvbHZlKHByb2Nlc3MuZW52LkhPTUUsICdMaWJyYXJ5JywgJ0xvZ3MnLCAnRGlhZ25vc3RpY1JlcG9ydHMnKSk7XG4gICAgdGhpcy51ZGlkID0gb3B0cy51ZGlkO1xuICAgIHRoaXMucGhvbmVOYW1lID0gbnVsbDtcbiAgICB0aGlzLnNpbSA9IG9wdHMuc2ltO1xuICB9XG5cbiAgYXN5bmMgZ2V0Q3Jhc2hlcyAoKSB7XG4gICAgbGV0IGNyYXNoTG9nc1Jvb3QgPSB0aGlzLmxvZ0RpcjtcbiAgICBpZiAodGhpcy51ZGlkKSB7XG4gICAgICBpZiAoIXRoaXMucGhvbmVOYW1lKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3Qge3N0ZG91dH0gPSBhd2FpdCBleGVjKCdpZGV2aWNlbmFtZScsIFsnLXUnLCB0aGlzLnVkaWRdKTtcbiAgICAgICAgICB0aGlzLnBob25lTmFtZSA9IHN0ZG91dC50cmltKCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICBsb2cud2FybihgQ2Fubm90IGdldCB0aGUgbmFtZSBvZiB0aGUgY3Jhc2hlcyBmb2xkZXIgZm9yIHRoZSBkZXZpY2Ugd2l0aCB1ZGlkICcke3RoaXMudWRpZH0nLiBgICtcbiAgICAgICAgICAgIGBPcmlnaW5hbCBlcnJvcjogJHtlLm1lc3NhZ2V9YCk7XG4gICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5waG9uZU5hbWUpIHtcbiAgICAgICAgY3Jhc2hMb2dzUm9vdCA9IHBhdGgucmVzb2x2ZShjcmFzaExvZ3NSb290LCB0aGlzLnBob25lTmFtZSk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICghYXdhaXQgZnMuZXhpc3RzKGNyYXNoTG9nc1Jvb3QpKSB7XG4gICAgICBsb2cuZGVidWcoYENyYXNoIHJlcG9ydHMgcm9vdCAnJHtjcmFzaExvZ3NSb290fScgZG9lcyBub3QgZXhpc3QuIEdvdCBub3RoaW5nIHRvIGdhdGhlci5gKTtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgY29uc3QgZm91bmRGaWxlcyA9IGF3YWl0IGZzLmdsb2IoYCR7Y3Jhc2hMb2dzUm9vdH0vKiovKi5jcmFzaGApO1xuICAgIGlmICh0aGlzLnVkaWQpIHtcbiAgICAgIHJldHVybiBmb3VuZEZpbGVzO1xuICAgIH1cbiAgICAvLyBGb3IgU2ltdWxhdG9yIG9ubHkgaW5jbHVkZSBmaWxlcywgdGhhdCBjb250YWluIGN1cnJlbnQgVURJRFxuICAgIHJldHVybiBhd2FpdCBCLmZpbHRlcihmb3VuZEZpbGVzLCBhc3luYyAoeCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgY29udGVudCA9IGF3YWl0IGZzLnJlYWRGaWxlKHgsICd1dGY4Jyk7XG4gICAgICAgIHJldHVybiBjb250ZW50LnRvVXBwZXJDYXNlKCkuaW5jbHVkZXModGhpcy5zaW0udWRpZC50b1VwcGVyQ2FzZSgpKTtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBhc3luYyBmaWxlc1RvSlNPTiAocGF0aHMpIHtcbiAgICByZXR1cm4gYXdhaXQgQi5tYXAocGF0aHMsIGFzeW5jIChmdWxsUGF0aCkgPT4ge1xuICAgICAgY29uc3Qgc3RhdCA9IGF3YWl0IGZzLnN0YXQoZnVsbFBhdGgpO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdGltZXN0YW1wOiBzdGF0LmN0aW1lLmdldFRpbWUoKSxcbiAgICAgICAgbGV2ZWw6ICdBTEwnLFxuICAgICAgICBtZXNzYWdlOiBhd2FpdCBmcy5yZWFkRmlsZShmdWxsUGF0aCwgJ3V0ZjgnKVxuICAgICAgfTtcbiAgICB9KTtcbiAgfVxufVxuXG5leHBvcnQgeyBJT1NDcmFzaExvZyB9O1xuZXhwb3J0IGRlZmF1bHQgSU9TQ3Jhc2hMb2c7XG4iXSwiZmlsZSI6ImxpYi9kZXZpY2UtbG9nL2lvcy1jcmFzaC1sb2cuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vLi4ifQ==
