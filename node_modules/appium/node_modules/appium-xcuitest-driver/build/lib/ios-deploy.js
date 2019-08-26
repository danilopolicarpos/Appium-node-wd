"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("source-map-support/register");

var _teen_process = require("teen_process");

var _appiumSupport = require("appium-support");

var _logger = _interopRequireDefault(require("./logger"));

var _asyncbox = require("asyncbox");

const IOSDEPLOY_PATH = `ios-deploy`;

class IOSDeploy {
  constructor(udid) {
    this.udid = udid;
    this.cmd = IOSDEPLOY_PATH;
  }

  async checkStatus() {
    await _appiumSupport.fs.which(this.cmd);
  }

  async remove(bundleid) {
    let remove = [`--uninstall_only`, `--id`, this.udid, `--bundle_id`, bundleid];

    try {
      await (0, _teen_process.exec)(this.cmd, remove);
    } catch (err) {
      _logger.default.debug(`Stdout: '${err.stdout}'. Stderr: '${err.stderr}'.`);

      throw new Error(`Could not remove app: '${err.message}'`);
    }
  }

  async removeApp(bundleId) {
    await this.remove(bundleId);
  }

  async install(app) {
    const args = [`--id`, this.udid, `--bundle`, app];

    try {
      await (0, _asyncbox.retryInterval)(5, 500, _teen_process.exec, this.cmd, args);
    } catch (err) {
      _logger.default.debug(`Stdout: '${err.stdout}'. Stderr: '${err.stderr}'.`);

      throw new Error(`Could not install app: '${err.message}'`);
    }
  }

  async installApp(app) {
    await this.install(app);
  }

  async isAppInstalled(bundleid) {
    let installStatusArgs = [`--exists`, `--id`, this.udid, `--bundle_id`, bundleid];

    try {
      _logger.default.debug(`Calling: '${this.cmd} ${installStatusArgs.join(' ')}'`);

      let {
        stdout
      } = await (0, _teen_process.exec)(this.cmd, installStatusArgs);

      _logger.default.debug(`Stdout: '${stdout}'`);

      return stdout && stdout.includes('true');
    } catch (err) {
      if (err.code !== 255) {
        _logger.default.debug(`Error checking install status: '${err.message}'`);
      }

      return false;
    }
  }

}

var _default = IOSDeploy;
exports.default = _default;require('source-map-support').install();


//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9pb3MtZGVwbG95LmpzIl0sIm5hbWVzIjpbIklPU0RFUExPWV9QQVRIIiwiSU9TRGVwbG95IiwiY29uc3RydWN0b3IiLCJ1ZGlkIiwiY21kIiwiY2hlY2tTdGF0dXMiLCJmcyIsIndoaWNoIiwicmVtb3ZlIiwiYnVuZGxlaWQiLCJlcnIiLCJsb2dnZXIiLCJkZWJ1ZyIsInN0ZG91dCIsInN0ZGVyciIsIkVycm9yIiwibWVzc2FnZSIsInJlbW92ZUFwcCIsImJ1bmRsZUlkIiwiaW5zdGFsbCIsImFwcCIsImFyZ3MiLCJleGVjIiwiaW5zdGFsbEFwcCIsImlzQXBwSW5zdGFsbGVkIiwiaW5zdGFsbFN0YXR1c0FyZ3MiLCJqb2luIiwiaW5jbHVkZXMiLCJjb2RlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBOztBQUNBOztBQUNBOztBQUNBOztBQUVBLE1BQU1BLGNBQWMsR0FBSSxZQUF4Qjs7QUFFQSxNQUFNQyxTQUFOLENBQWdCO0FBRWRDLEVBQUFBLFdBQVcsQ0FBRUMsSUFBRixFQUFRO0FBQ2pCLFNBQUtBLElBQUwsR0FBWUEsSUFBWjtBQUNBLFNBQUtDLEdBQUwsR0FBV0osY0FBWDtBQUNEOztBQUVELFFBQU1LLFdBQU4sR0FBcUI7QUFFbkIsVUFBTUMsa0JBQUdDLEtBQUgsQ0FBUyxLQUFLSCxHQUFkLENBQU47QUFDRDs7QUFFRCxRQUFNSSxNQUFOLENBQWNDLFFBQWQsRUFBd0I7QUFDdEIsUUFBSUQsTUFBTSxHQUFHLENBQUUsa0JBQUYsRUFBc0IsTUFBdEIsRUFBNkIsS0FBS0wsSUFBbEMsRUFBeUMsYUFBekMsRUFBdURNLFFBQXZELENBQWI7O0FBQ0EsUUFBSTtBQUNGLFlBQU0sd0JBQUssS0FBS0wsR0FBVixFQUFlSSxNQUFmLENBQU47QUFDRCxLQUZELENBRUUsT0FBT0UsR0FBUCxFQUFZO0FBQ1pDLHNCQUFPQyxLQUFQLENBQWMsWUFBV0YsR0FBRyxDQUFDRyxNQUFPLGVBQWNILEdBQUcsQ0FBQ0ksTUFBTyxJQUE3RDs7QUFDQSxZQUFNLElBQUlDLEtBQUosQ0FBVywwQkFBeUJMLEdBQUcsQ0FBQ00sT0FBUSxHQUFoRCxDQUFOO0FBQ0Q7QUFDRjs7QUFFRCxRQUFNQyxTQUFOLENBQWlCQyxRQUFqQixFQUEyQjtBQUN6QixVQUFNLEtBQUtWLE1BQUwsQ0FBWVUsUUFBWixDQUFOO0FBQ0Q7O0FBRUQsUUFBTUMsT0FBTixDQUFlQyxHQUFmLEVBQW9CO0FBQ2xCLFVBQU1DLElBQUksR0FBRyxDQUFFLE1BQUYsRUFBUyxLQUFLbEIsSUFBZCxFQUFxQixVQUFyQixFQUFnQ2lCLEdBQWhDLENBQWI7O0FBQ0EsUUFBSTtBQUNGLFlBQU0sNkJBQWMsQ0FBZCxFQUFpQixHQUFqQixFQUFzQkUsa0JBQXRCLEVBQTRCLEtBQUtsQixHQUFqQyxFQUFzQ2lCLElBQXRDLENBQU47QUFDRCxLQUZELENBRUUsT0FBT1gsR0FBUCxFQUFZO0FBQ1pDLHNCQUFPQyxLQUFQLENBQWMsWUFBV0YsR0FBRyxDQUFDRyxNQUFPLGVBQWNILEdBQUcsQ0FBQ0ksTUFBTyxJQUE3RDs7QUFDQSxZQUFNLElBQUlDLEtBQUosQ0FBVywyQkFBMEJMLEdBQUcsQ0FBQ00sT0FBUSxHQUFqRCxDQUFOO0FBQ0Q7QUFDRjs7QUFFRCxRQUFNTyxVQUFOLENBQWtCSCxHQUFsQixFQUF1QjtBQUNyQixVQUFNLEtBQUtELE9BQUwsQ0FBYUMsR0FBYixDQUFOO0FBQ0Q7O0FBRUQsUUFBTUksY0FBTixDQUFzQmYsUUFBdEIsRUFBZ0M7QUFDOUIsUUFBSWdCLGlCQUFpQixHQUFHLENBQUUsVUFBRixFQUFjLE1BQWQsRUFBcUIsS0FBS3RCLElBQTFCLEVBQWlDLGFBQWpDLEVBQStDTSxRQUEvQyxDQUF4Qjs7QUFDQSxRQUFJO0FBQ0ZFLHNCQUFPQyxLQUFQLENBQWMsYUFBWSxLQUFLUixHQUFJLElBQUdxQixpQkFBaUIsQ0FBQ0MsSUFBbEIsQ0FBdUIsR0FBdkIsQ0FBNEIsR0FBbEU7O0FBQ0EsVUFBSTtBQUFDYixRQUFBQTtBQUFELFVBQVcsTUFBTSx3QkFBSyxLQUFLVCxHQUFWLEVBQWVxQixpQkFBZixDQUFyQjs7QUFDQWQsc0JBQU9DLEtBQVAsQ0FBYyxZQUFXQyxNQUFPLEdBQWhDOztBQUNBLGFBQVFBLE1BQU0sSUFBS0EsTUFBTSxDQUFDYyxRQUFQLENBQWdCLE1BQWhCLENBQW5CO0FBQ0QsS0FMRCxDQUtFLE9BQU9qQixHQUFQLEVBQVk7QUFFWixVQUFJQSxHQUFHLENBQUNrQixJQUFKLEtBQWEsR0FBakIsRUFBc0I7QUFDcEJqQix3QkFBT0MsS0FBUCxDQUFjLG1DQUFrQ0YsR0FBRyxDQUFDTSxPQUFRLEdBQTVEO0FBQ0Q7O0FBQ0QsYUFBTyxLQUFQO0FBQ0Q7QUFDRjs7QUF0RGE7O2VBeUREZixTIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZXhlYyB9IGZyb20gJ3RlZW5fcHJvY2Vzcyc7XG5pbXBvcnQgeyBmcyB9IGZyb20gJ2FwcGl1bS1zdXBwb3J0JztcbmltcG9ydCBsb2dnZXIgZnJvbSAnLi9sb2dnZXInO1xuaW1wb3J0IHsgcmV0cnlJbnRlcnZhbCB9IGZyb20gJ2FzeW5jYm94JztcblxuY29uc3QgSU9TREVQTE9ZX1BBVEggPSBgaW9zLWRlcGxveWA7XG5cbmNsYXNzIElPU0RlcGxveSB7XG5cbiAgY29uc3RydWN0b3IgKHVkaWQpIHtcbiAgICB0aGlzLnVkaWQgPSB1ZGlkO1xuICAgIHRoaXMuY21kID0gSU9TREVQTE9ZX1BBVEg7IC8vIHRoaXMuY21kIGlzIGluIGFjY29yZGFuY2Ugd2l0aCBpRGV2aWNlXG4gIH1cblxuICBhc3luYyBjaGVja1N0YXR1cyAoKSB7XG4gICAgLy8gbWFrZSBzdXJlIHdlIGFjdHVhbGx5IGhhdmUgdGhlIHByb2dyYW1cbiAgICBhd2FpdCBmcy53aGljaCh0aGlzLmNtZCk7XG4gIH1cblxuICBhc3luYyByZW1vdmUgKGJ1bmRsZWlkKSB7XG4gICAgbGV0IHJlbW92ZSA9IFtgLS11bmluc3RhbGxfb25seWAsIGAtLWlkYCwgdGhpcy51ZGlkLCBgLS1idW5kbGVfaWRgLCBidW5kbGVpZF07XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IGV4ZWModGhpcy5jbWQsIHJlbW92ZSk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBsb2dnZXIuZGVidWcoYFN0ZG91dDogJyR7ZXJyLnN0ZG91dH0nLiBTdGRlcnI6ICcke2Vyci5zdGRlcnJ9Jy5gKTtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ291bGQgbm90IHJlbW92ZSBhcHA6ICcke2Vyci5tZXNzYWdlfSdgKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyByZW1vdmVBcHAgKGJ1bmRsZUlkKSB7XG4gICAgYXdhaXQgdGhpcy5yZW1vdmUoYnVuZGxlSWQpO1xuICB9XG5cbiAgYXN5bmMgaW5zdGFsbCAoYXBwKSB7XG4gICAgY29uc3QgYXJncyA9IFtgLS1pZGAsIHRoaXMudWRpZCwgYC0tYnVuZGxlYCwgYXBwXTtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgcmV0cnlJbnRlcnZhbCg1LCA1MDAsIGV4ZWMsIHRoaXMuY21kLCBhcmdzKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGxvZ2dlci5kZWJ1ZyhgU3Rkb3V0OiAnJHtlcnIuc3Rkb3V0fScuIFN0ZGVycjogJyR7ZXJyLnN0ZGVycn0nLmApO1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDb3VsZCBub3QgaW5zdGFsbCBhcHA6ICcke2Vyci5tZXNzYWdlfSdgKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBpbnN0YWxsQXBwIChhcHApIHtcbiAgICBhd2FpdCB0aGlzLmluc3RhbGwoYXBwKTtcbiAgfVxuXG4gIGFzeW5jIGlzQXBwSW5zdGFsbGVkIChidW5kbGVpZCkge1xuICAgIGxldCBpbnN0YWxsU3RhdHVzQXJncyA9IFtgLS1leGlzdHNgLCBgLS1pZGAsIHRoaXMudWRpZCwgYC0tYnVuZGxlX2lkYCwgYnVuZGxlaWRdO1xuICAgIHRyeSB7XG4gICAgICBsb2dnZXIuZGVidWcoYENhbGxpbmc6ICcke3RoaXMuY21kfSAke2luc3RhbGxTdGF0dXNBcmdzLmpvaW4oJyAnKX0nYCk7XG4gICAgICBsZXQge3N0ZG91dH0gPSBhd2FpdCBleGVjKHRoaXMuY21kLCBpbnN0YWxsU3RhdHVzQXJncyk7XG4gICAgICBsb2dnZXIuZGVidWcoYFN0ZG91dDogJyR7c3Rkb3V0fSdgKTtcbiAgICAgIHJldHVybiAoc3Rkb3V0ICYmIChzdGRvdXQuaW5jbHVkZXMoJ3RydWUnKSkpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgLy8gZXJyb3IgMjU1IGlzIGp1c3QgaW9zLWRlcGxveSdzIHdheSBvZiBzYXlpbmcgaXQgaXMgbm90IGluc3RhbGxlZFxuICAgICAgaWYgKGVyci5jb2RlICE9PSAyNTUpIHtcbiAgICAgICAgbG9nZ2VyLmRlYnVnKGBFcnJvciBjaGVja2luZyBpbnN0YWxsIHN0YXR1czogJyR7ZXJyLm1lc3NhZ2V9J2ApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBJT1NEZXBsb3k7XG4iXSwiZmlsZSI6ImxpYi9pb3MtZGVwbG95LmpzIiwic291cmNlUm9vdCI6Ii4uLy4uIn0=
