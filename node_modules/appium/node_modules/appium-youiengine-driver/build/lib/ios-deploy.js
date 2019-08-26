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

  async launchApp(app) {
    let remove = [`--justlaunch`, `--no-wifi`, `--noinstall`, this.udid, `--bundle`, app];

    try {
      await (0, _teen_process.exec)(this.cmd, remove);
    } catch (err) {
      _logger.default.debug(`Stdout: '${err.stdout}'. Stderr: '${err.stderr}'.`);

      throw new Error(`Could not remove app: '${err.message}'`);
    }
  }

  async remove(bundleid) {
    let remove = [`--uninstall_only`, `--no-wifi`, `--id`, this.udid, `--bundle_id`, bundleid];

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
    const args = [`--justlaunch`, `--no-wifi`, `--uninstall`, `--id`, this.udid, `--bundle`, app];

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
    let isInstalled = [`--exists`, `--no-wifi`, `--id`, this.udid, `--bundle_id`, bundleid];

    try {
      let {
        stdout
      } = await (0, _teen_process.exec)(this.cmd, isInstalled);
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


//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9pb3MtZGVwbG95LmpzIl0sIm5hbWVzIjpbIklPU0RFUExPWV9QQVRIIiwiSU9TRGVwbG95IiwiY29uc3RydWN0b3IiLCJ1ZGlkIiwiY21kIiwiY2hlY2tTdGF0dXMiLCJmcyIsIndoaWNoIiwibGF1bmNoQXBwIiwiYXBwIiwicmVtb3ZlIiwiZXJyIiwibG9nZ2VyIiwiZGVidWciLCJzdGRvdXQiLCJzdGRlcnIiLCJFcnJvciIsIm1lc3NhZ2UiLCJidW5kbGVpZCIsInJlbW92ZUFwcCIsImJ1bmRsZUlkIiwiaW5zdGFsbCIsImFyZ3MiLCJleGVjIiwiaW5zdGFsbEFwcCIsImlzQXBwSW5zdGFsbGVkIiwiaXNJbnN0YWxsZWQiLCJpbmNsdWRlcyIsImNvZGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUE7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUEsTUFBTUEsY0FBYyxHQUFJLFlBQXhCOztBQUVBLE1BQU1DLFNBQU4sQ0FBZ0I7QUFFZEMsRUFBQUEsV0FBVyxDQUFFQyxJQUFGLEVBQVE7QUFDakIsU0FBS0EsSUFBTCxHQUFZQSxJQUFaO0FBQ0EsU0FBS0MsR0FBTCxHQUFXSixjQUFYO0FBQ0Q7O0FBRUQsUUFBTUssV0FBTixHQUFxQjtBQUVuQixVQUFNQyxrQkFBR0MsS0FBSCxDQUFTLEtBQUtILEdBQWQsQ0FBTjtBQUNEOztBQUVELFFBQU1JLFNBQU4sQ0FBaUJDLEdBQWpCLEVBQXNCO0FBQ3BCLFFBQUlDLE1BQU0sR0FBRyxDQUFFLGNBQUYsRUFBa0IsV0FBbEIsRUFBK0IsYUFBL0IsRUFBNkMsS0FBS1AsSUFBbEQsRUFBeUQsVUFBekQsRUFBb0VNLEdBQXBFLENBQWI7O0FBQ0EsUUFBSTtBQUNGLFlBQU0sd0JBQUssS0FBS0wsR0FBVixFQUFlTSxNQUFmLENBQU47QUFDRCxLQUZELENBRUUsT0FBT0MsR0FBUCxFQUFZO0FBQ1pDLHNCQUFPQyxLQUFQLENBQWMsWUFBV0YsR0FBRyxDQUFDRyxNQUFPLGVBQWNILEdBQUcsQ0FBQ0ksTUFBTyxJQUE3RDs7QUFDQSxZQUFNLElBQUlDLEtBQUosQ0FBVywwQkFBeUJMLEdBQUcsQ0FBQ00sT0FBUSxHQUFoRCxDQUFOO0FBQ0Q7QUFDRjs7QUFFRCxRQUFNUCxNQUFOLENBQWNRLFFBQWQsRUFBd0I7QUFDdEIsUUFBSVIsTUFBTSxHQUFHLENBQUUsa0JBQUYsRUFBc0IsV0FBdEIsRUFBbUMsTUFBbkMsRUFBMEMsS0FBS1AsSUFBL0MsRUFBc0QsYUFBdEQsRUFBb0VlLFFBQXBFLENBQWI7O0FBQ0EsUUFBSTtBQUNGLFlBQU0sd0JBQUssS0FBS2QsR0FBVixFQUFlTSxNQUFmLENBQU47QUFDRCxLQUZELENBRUUsT0FBT0MsR0FBUCxFQUFZO0FBQ1pDLHNCQUFPQyxLQUFQLENBQWMsWUFBV0YsR0FBRyxDQUFDRyxNQUFPLGVBQWNILEdBQUcsQ0FBQ0ksTUFBTyxJQUE3RDs7QUFDQSxZQUFNLElBQUlDLEtBQUosQ0FBVywwQkFBeUJMLEdBQUcsQ0FBQ00sT0FBUSxHQUFoRCxDQUFOO0FBQ0Q7QUFDRjs7QUFFRCxRQUFNRSxTQUFOLENBQWlCQyxRQUFqQixFQUEyQjtBQUN6QixVQUFNLEtBQUtWLE1BQUwsQ0FBWVUsUUFBWixDQUFOO0FBQ0Q7O0FBRUQsUUFBTUMsT0FBTixDQUFlWixHQUFmLEVBQW9CO0FBQ2xCLFVBQU1hLElBQUksR0FBRyxDQUFFLGNBQUYsRUFBa0IsV0FBbEIsRUFBK0IsYUFBL0IsRUFBOEMsTUFBOUMsRUFBcUQsS0FBS25CLElBQTFELEVBQWlFLFVBQWpFLEVBQTRFTSxHQUE1RSxDQUFiOztBQUNBLFFBQUk7QUFDRixZQUFNLDZCQUFjLENBQWQsRUFBaUIsR0FBakIsRUFBc0JjLGtCQUF0QixFQUE0QixLQUFLbkIsR0FBakMsRUFBc0NrQixJQUF0QyxDQUFOO0FBQ0QsS0FGRCxDQUVFLE9BQU9YLEdBQVAsRUFBWTtBQUNaQyxzQkFBT0MsS0FBUCxDQUFjLFlBQVdGLEdBQUcsQ0FBQ0csTUFBTyxlQUFjSCxHQUFHLENBQUNJLE1BQU8sSUFBN0Q7O0FBQ0EsWUFBTSxJQUFJQyxLQUFKLENBQVcsMkJBQTBCTCxHQUFHLENBQUNNLE9BQVEsR0FBakQsQ0FBTjtBQUNEO0FBQ0Y7O0FBRUQsUUFBTU8sVUFBTixDQUFrQmYsR0FBbEIsRUFBdUI7QUFDckIsVUFBTSxLQUFLWSxPQUFMLENBQWFaLEdBQWIsQ0FBTjtBQUNEOztBQUVELFFBQU1nQixjQUFOLENBQXNCUCxRQUF0QixFQUFnQztBQUM5QixRQUFJUSxXQUFXLEdBQUcsQ0FBRSxVQUFGLEVBQWMsV0FBZCxFQUEyQixNQUEzQixFQUFrQyxLQUFLdkIsSUFBdkMsRUFBOEMsYUFBOUMsRUFBNERlLFFBQTVELENBQWxCOztBQUNBLFFBQUk7QUFDRixVQUFJO0FBQUNKLFFBQUFBO0FBQUQsVUFBVyxNQUFNLHdCQUFLLEtBQUtWLEdBQVYsRUFBZXNCLFdBQWYsQ0FBckI7QUFDQSxhQUFRWixNQUFNLElBQUtBLE1BQU0sQ0FBQ2EsUUFBUCxDQUFnQixNQUFoQixDQUFuQjtBQUNELEtBSEQsQ0FHRSxPQUFPaEIsR0FBUCxFQUFZO0FBRVosVUFBSUEsR0FBRyxDQUFDaUIsSUFBSixLQUFhLEdBQWpCLEVBQXNCO0FBQ3BCaEIsd0JBQU9DLEtBQVAsQ0FBYyxtQ0FBa0NGLEdBQUcsQ0FBQ00sT0FBUSxHQUE1RDtBQUNEOztBQUNELGFBQU8sS0FBUDtBQUNEO0FBQ0Y7O0FBOURhOztlQWlFRGhCLFMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBleGVjIH0gZnJvbSAndGVlbl9wcm9jZXNzJztcbmltcG9ydCB7IGZzIH0gZnJvbSAnYXBwaXVtLXN1cHBvcnQnO1xuaW1wb3J0IGxvZ2dlciBmcm9tICcuL2xvZ2dlcic7XG5pbXBvcnQgeyByZXRyeUludGVydmFsIH0gZnJvbSAnYXN5bmNib3gnO1xuXG5jb25zdCBJT1NERVBMT1lfUEFUSCA9IGBpb3MtZGVwbG95YDtcblxuY2xhc3MgSU9TRGVwbG95IHtcblxuICBjb25zdHJ1Y3RvciAodWRpZCkge1xuICAgIHRoaXMudWRpZCA9IHVkaWQ7XG4gICAgdGhpcy5jbWQgPSBJT1NERVBMT1lfUEFUSDsgLy8gdGhpcy5jbWQgaXMgaW4gYWNjb3JkYW5jZSB3aXRoIGlEZXZpY2VcbiAgfVxuXG4gIGFzeW5jIGNoZWNrU3RhdHVzICgpIHtcbiAgICAvLyBtYWtlIHN1cmUgd2UgYWN0dWFsbHkgaGF2ZSB0aGUgcHJvZ3JhbVxuICAgIGF3YWl0IGZzLndoaWNoKHRoaXMuY21kKTtcbiAgfVxuXG4gIGFzeW5jIGxhdW5jaEFwcCAoYXBwKSB7XG4gICAgbGV0IHJlbW92ZSA9IFtgLS1qdXN0bGF1bmNoYCwgYC0tbm8td2lmaWAsIGAtLW5vaW5zdGFsbGAsIHRoaXMudWRpZCwgYC0tYnVuZGxlYCwgYXBwXTtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgZXhlYyh0aGlzLmNtZCwgcmVtb3ZlKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGxvZ2dlci5kZWJ1ZyhgU3Rkb3V0OiAnJHtlcnIuc3Rkb3V0fScuIFN0ZGVycjogJyR7ZXJyLnN0ZGVycn0nLmApO1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDb3VsZCBub3QgcmVtb3ZlIGFwcDogJyR7ZXJyLm1lc3NhZ2V9J2ApO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIHJlbW92ZSAoYnVuZGxlaWQpIHtcbiAgICBsZXQgcmVtb3ZlID0gW2AtLXVuaW5zdGFsbF9vbmx5YCwgYC0tbm8td2lmaWAsIGAtLWlkYCwgdGhpcy51ZGlkLCBgLS1idW5kbGVfaWRgLCBidW5kbGVpZF07XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IGV4ZWModGhpcy5jbWQsIHJlbW92ZSk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBsb2dnZXIuZGVidWcoYFN0ZG91dDogJyR7ZXJyLnN0ZG91dH0nLiBTdGRlcnI6ICcke2Vyci5zdGRlcnJ9Jy5gKTtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ291bGQgbm90IHJlbW92ZSBhcHA6ICcke2Vyci5tZXNzYWdlfSdgKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyByZW1vdmVBcHAgKGJ1bmRsZUlkKSB7XG4gICAgYXdhaXQgdGhpcy5yZW1vdmUoYnVuZGxlSWQpO1xuICB9XG5cbiAgYXN5bmMgaW5zdGFsbCAoYXBwKSB7XG4gICAgY29uc3QgYXJncyA9IFtgLS1qdXN0bGF1bmNoYCwgYC0tbm8td2lmaWAsIGAtLXVuaW5zdGFsbGAsIGAtLWlkYCwgdGhpcy51ZGlkLCBgLS1idW5kbGVgLCBhcHBdO1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCByZXRyeUludGVydmFsKDUsIDUwMCwgZXhlYywgdGhpcy5jbWQsIGFyZ3MpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgbG9nZ2VyLmRlYnVnKGBTdGRvdXQ6ICcke2Vyci5zdGRvdXR9Jy4gU3RkZXJyOiAnJHtlcnIuc3RkZXJyfScuYCk7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYENvdWxkIG5vdCBpbnN0YWxsIGFwcDogJyR7ZXJyLm1lc3NhZ2V9J2ApO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGluc3RhbGxBcHAgKGFwcCkge1xuICAgIGF3YWl0IHRoaXMuaW5zdGFsbChhcHApO1xuICB9XG5cbiAgYXN5bmMgaXNBcHBJbnN0YWxsZWQgKGJ1bmRsZWlkKSB7XG4gICAgbGV0IGlzSW5zdGFsbGVkID0gW2AtLWV4aXN0c2AsIGAtLW5vLXdpZmlgLCBgLS1pZGAsIHRoaXMudWRpZCwgYC0tYnVuZGxlX2lkYCwgYnVuZGxlaWRdO1xuICAgIHRyeSB7XG4gICAgICBsZXQge3N0ZG91dH0gPSBhd2FpdCBleGVjKHRoaXMuY21kLCBpc0luc3RhbGxlZCk7XG4gICAgICByZXR1cm4gKHN0ZG91dCAmJiAoc3Rkb3V0LmluY2x1ZGVzKCd0cnVlJykpKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIC8vIGVycm9yIDI1NSBpcyBqdXN0IGlvcy1kZXBsb3kncyB3YXkgb2Ygc2F5aW5nIGl0IGlzIG5vdCBpbnN0YWxsZWRcbiAgICAgIGlmIChlcnIuY29kZSAhPT0gMjU1KSB7XG4gICAgICAgIGxvZ2dlci5kZWJ1ZyhgRXJyb3IgY2hlY2tpbmcgaW5zdGFsbCBzdGF0dXM6ICcke2Vyci5tZXNzYWdlfSdgKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgSU9TRGVwbG95O1xuIl0sImZpbGUiOiJsaWIvaW9zLWRlcGxveS5qcyIsInNvdXJjZVJvb3QiOiIuLi8uLiJ9
