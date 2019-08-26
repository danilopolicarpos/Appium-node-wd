"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.XcodeBuild = void 0;

require("source-map-support/register");

var _asyncbox = require("asyncbox");

var _teen_process = require("teen_process");

var _appiumSupport = require("appium-support");

var _logger = _interopRequireDefault(require("../logger"));

var _bluebird = _interopRequireDefault(require("bluebird"));

var _utils = require("./utils");

var _lodash = _interopRequireDefault(require("lodash"));

var _path = _interopRequireDefault(require("path"));

var _os = require("os");

var _utils2 = require("../utils");

const DEFAULT_SIGNING_ID = 'iPhone Developer';
const BUILD_TEST_DELAY = 1000;
const RUNNER_SCHEME_IOS = 'WebDriverAgentRunner';
const LIB_SCHEME_IOS = 'WebDriverAgentLib';
const ERROR_WRITING_ATTACHMENT = 'Error writing attachment data to file';
const RUNNER_SCHEME_TV = 'WebDriverAgentRunner_tvOS';
const LIB_SCHEME_TV = 'WebDriverAgentLib_tvOS';

const xcodeLog = _appiumSupport.logger.getLogger('Xcode');

class XcodeBuild {
  constructor(xcodeVersion, device, args = {}) {
    this.xcodeVersion = xcodeVersion;
    this.device = device;
    this.realDevice = args.realDevice;
    this.agentPath = args.agentPath;
    this.bootstrapPath = args.bootstrapPath;
    this.platformVersion = args.platformVersion;
    this.platformName = args.platformName;
    this.iosSdkVersion = args.iosSdkVersion;
    this.showXcodeLog = args.showXcodeLog;
    this.xcodeConfigFile = args.xcodeConfigFile;
    this.xcodeOrgId = args.xcodeOrgId;
    this.xcodeSigningId = args.xcodeSigningId || DEFAULT_SIGNING_ID;
    this.keychainPath = args.keychainPath;
    this.keychainPassword = args.keychainPassword;
    this.prebuildWDA = args.prebuildWDA;
    this.usePrebuiltWDA = args.usePrebuiltWDA;
    this.useSimpleBuildTest = args.useSimpleBuildTest;
    this.useXctestrunFile = args.useXctestrunFile;
    this.launchTimeout = args.launchTimeout;
    this.wdaRemotePort = args.wdaRemotePort;
    this.updatedWDABundleId = args.updatedWDABundleId;
    this.derivedDataPath = args.derivedDataPath;
    this.mjpegServerPort = args.mjpegServerPort;
  }

  async init(noSessionProxy) {
    this.noSessionProxy = noSessionProxy;

    if (this.useXctestrunFile) {
      if (this.xcodeVersion.major <= 7) {
        _logger.default.errorAndThrow('useXctestrunFile can only be used with xcode version 8 onwards');
      }

      const deviveInfo = {
        isRealDevice: this.realDevice,
        udid: this.device.udid,
        platformVersion: this.platformVersion,
        platformName: this.platformName
      };
      this.xctestrunFilePath = await (0, _utils.setXctestrunFile)(deviveInfo, this.iosSdkVersion, this.bootstrapPath, this.wdaRemotePort);
      return;
    }

    if (this.xcodeVersion.major === 7 || this.xcodeVersion.major === 8 && this.xcodeVersion.minor === 0) {
      _logger.default.debug(`Using Xcode ${this.xcodeVersion.versionString}, so fixing WDA codebase`);

      await (0, _utils.fixForXcode7)(this.bootstrapPath, true);
    }

    if (this.xcodeVersion.major === 9) {
      _logger.default.debug(`Using Xcode ${this.xcodeVersion.versionString}, so fixing WDA codebase`);

      await (0, _utils.fixForXcode9)(this.bootstrapPath, true);
    }

    if (this.realDevice) {
      await (0, _utils.resetProjectFile)(this.agentPath);

      if (this.updatedWDABundleId) {
        await (0, _utils.updateProjectFile)(this.agentPath, this.updatedWDABundleId);
      }
    }
  }

  async retrieveDerivedDataPath() {
    if (this.derivedDataPath) {
      return this.derivedDataPath;
    }

    let stdout;

    try {
      ({
        stdout
      } = await (0, _teen_process.exec)('xcodebuild', ['-project', this.agentPath, '-showBuildSettings']));
    } catch (err) {
      _logger.default.warn(`Cannot retrieve WDA build settings. Original error: ${err.message}`);

      return;
    }

    const pattern = /^\s*BUILD_DIR\s+=\s+(\/.*)/m;
    const match = pattern.exec(stdout);

    if (!match) {
      _logger.default.warn(`Cannot parse WDA build dir from ${_lodash.default.truncate(stdout, {
        length: 300
      })}`);

      return;
    }

    _logger.default.debug(`Parsed BUILD_DIR configuration value: '${match[1]}'`);

    this.derivedDataPath = _path.default.dirname(_path.default.dirname(_path.default.normalize(match[1])));

    _logger.default.debug(`Got derived data root: '${this.derivedDataPath}'`);

    return this.derivedDataPath;
  }

  async reset() {
    if (this.realDevice && this.updatedWDABundleId) {
      await (0, _utils.resetProjectFile)(this.agentPath);
    }
  }

  async prebuild() {
    if (this.xcodeVersion.major === 7) {
      _logger.default.debug(`Capability 'prebuildWDA' set, but on xcode version ${this.xcodeVersion.versionString} so skipping`);

      return;
    }

    _logger.default.debug('Pre-building WDA before launching test');

    this.usePrebuiltWDA = true;
    this.xcodebuild = await this.createSubProcess(true);
    await this.start(true);
    this.xcodebuild = null;
    await _bluebird.default.delay(BUILD_TEST_DELAY);
  }

  async cleanProject() {
    const tmpIsTvOS = (0, _utils2.isTvOS)(this.platformName);
    const libScheme = tmpIsTvOS ? LIB_SCHEME_TV : LIB_SCHEME_IOS;
    const runnerScheme = tmpIsTvOS ? RUNNER_SCHEME_TV : RUNNER_SCHEME_IOS;

    for (const scheme of [libScheme, runnerScheme]) {
      _logger.default.debug(`Cleaning the project scheme '${scheme}' to make sure there are no leftovers from previous installs`);

      await (0, _teen_process.exec)('xcodebuild', ['clean', '-project', this.agentPath, '-scheme', scheme]);
    }
  }

  getCommand(buildOnly = false) {
    let cmd = 'xcodebuild';
    let args;

    if (this.xcodeVersion.major < 8) {
      args = ['build', 'test'];
    } else {
      let [buildCmd, testCmd] = this.useSimpleBuildTest ? ['build', 'test'] : ['build-for-testing', 'test-without-building'];

      if (buildOnly) {
        args = [buildCmd];
      } else if (this.usePrebuiltWDA || this.useXctestrunFile) {
        args = [testCmd];
      } else {
        args = [buildCmd, testCmd];
      }
    }

    if (this.useXctestrunFile) {
      args.push('-xctestrun', this.xctestrunFilePath);
    } else {
      const runnerScheme = (0, _utils2.isTvOS)(this.platformName) ? RUNNER_SCHEME_TV : RUNNER_SCHEME_IOS;
      args.push('-project', this.agentPath, '-scheme', runnerScheme);

      if (this.derivedDataPath) {
        args.push('-derivedDataPath', this.derivedDataPath);
      }
    }

    args.push('-destination', `id=${this.device.udid}`);
    const versionMatch = new RegExp(/^(\d+)\.(\d+)/).exec(this.platformVersion);

    if (versionMatch) {
      args.push(`IPHONEOS_DEPLOYMENT_TARGET=${versionMatch[1]}.${versionMatch[2]}`);
    } else {
      _logger.default.warn(`Cannot parse major and minor version numbers from platformVersion "${this.platformVersion}". ` + 'Will build for the default platform instead');
    }

    if (this.realDevice && this.xcodeConfigFile) {
      _logger.default.debug(`Using Xcode configuration file: '${this.xcodeConfigFile}'`);

      args.push('-xcconfig', this.xcodeConfigFile);
    }

    if (!process.env.APPIUM_XCUITEST_TREAT_WARNINGS_AS_ERRORS) {
      args.push('GCC_TREAT_WARNINGS_AS_ERRORS=0');
    }

    args.push('COMPILER_INDEX_STORE_ENABLE=NO');
    return {
      cmd,
      args
    };
  }

  async createSubProcess(buildOnly = false) {
    if (!this.useXctestrunFile) {
      if (this.realDevice) {
        if (this.keychainPath && this.keychainPassword) {
          await (0, _utils.setRealDeviceSecurity)(this.keychainPath, this.keychainPassword);
        }

        if (this.xcodeOrgId && this.xcodeSigningId && !this.xcodeConfigFile) {
          this.xcodeConfigFile = await (0, _utils.generateXcodeConfigFile)(this.xcodeOrgId, this.xcodeSigningId);
        }
      }
    }

    const {
      cmd,
      args
    } = this.getCommand(buildOnly);

    _logger.default.debug(`Beginning ${buildOnly ? 'build' : 'test'} with command '${cmd} ${args.join(' ')}' ` + `in directory '${this.bootstrapPath}'`);

    const env = Object.assign({}, process.env, {
      USE_PORT: this.wdaRemotePort,
      WDA_PRODUCT_BUNDLE_IDENTIFIER: this.updatedWDABundleId || _utils.WDA_RUNNER_BUNDLE_ID
    });

    if (this.mjpegServerPort) {
      env.MJPEG_SERVER_PORT = this.mjpegServerPort;
    }

    const upgradeTimestamp = await (0, _utils.getWDAUpgradeTimestamp)(this.bootstrapPath);

    if (upgradeTimestamp) {
      env.UPGRADE_TIMESTAMP = upgradeTimestamp;
    }

    const xcodebuild = new _teen_process.SubProcess(cmd, args, {
      cwd: this.bootstrapPath,
      env,
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe']
    });
    let logXcodeOutput = !!this.showXcodeLog;
    const logMsg = _lodash.default.isBoolean(this.showXcodeLog) ? `Output from xcodebuild ${this.showXcodeLog ? 'will' : 'will not'} be logged` : 'Output from xcodebuild will only be logged if any errors are present there';

    _logger.default.debug(`${logMsg}. To change this, use 'showXcodeLog' desired capability`);

    xcodebuild.on('output', (stdout, stderr) => {
      let out = stdout || stderr;

      if (out.includes('Writing diagnostic log for test session to')) {
        xcodebuild.logLocation = _lodash.default.first(_lodash.default.remove(out.trim().split('\n'), v => v.startsWith(_path.default.sep)));

        _logger.default.debug(`Log file for xcodebuild test: ${xcodebuild.logLocation}`);
      }

      const ignoredErrors = [ERROR_WRITING_ATTACHMENT, 'Failed to remove screenshot at path'];

      if (this.showXcodeLog !== false && out.includes('Error Domain=') && !ignoredErrors.some(x => out.includes(x))) {
        logXcodeOutput = true;
        xcodebuild._wda_error_occurred = true;
      }

      if (logXcodeOutput && !out.includes(ERROR_WRITING_ATTACHMENT)) {
        for (const line of out.split(_os.EOL)) {
          xcodeLog.error(line);

          if (line) {
            xcodebuild._wda_error_message += `${_os.EOL}${line}`;
          }
        }
      }
    });
    return xcodebuild;
  }

  async start(buildOnly = false) {
    this.xcodebuild = await this.createSubProcess(buildOnly);
    this.xcodebuild._wda_error_message = '';
    return await new _bluebird.default((resolve, reject) => {
      this.xcodebuild.on('exit', async (code, signal) => {
        _logger.default.error(`xcodebuild exited with code '${code}' and signal '${signal}'`);

        if (this.showXcodeLog && this.xcodebuild.logLocation) {
          xcodeLog.error(`Contents of xcodebuild log file '${this.xcodebuild.logLocation}':`);

          try {
            let data = await _appiumSupport.fs.readFile(this.xcodebuild.logLocation, 'utf8');

            for (let line of data.split('\n')) {
              xcodeLog.error(line);
            }
          } catch (err) {
            _logger.default.error(`Unable to access xcodebuild log file: '${err.message}'`);
          }
        }

        this.xcodebuild.processExited = true;

        if (this.xcodebuild._wda_error_occurred || !signal && code !== 0) {
          return reject(new Error(`xcodebuild failed with code ${code}${_os.EOL}` + `xcodebuild error message:${_os.EOL}${this.xcodebuild._wda_error_message}`));
        }

        if (buildOnly) {
          return resolve();
        }
      });
      return (async () => {
        try {
          let startTime = process.hrtime();
          await this.xcodebuild.start(true);

          if (!buildOnly) {
            let status = await this.waitForStart(startTime);
            resolve(status);
          }
        } catch (err) {
          let msg = `Unable to start WebDriverAgent: ${err}`;

          _logger.default.error(msg);

          reject(new Error(msg));
        }
      })();
    });
  }

  async waitForStart(startTime) {
    _logger.default.debug(`Waiting up to ${this.launchTimeout}ms for WebDriverAgent to start`);

    let currentStatus = null;

    try {
      let retries = parseInt(this.launchTimeout / 500, 10);
      await (0, _asyncbox.retryInterval)(retries, 1000, async () => {
        if (this.xcodebuild.processExited) {
          return;
        }

        const proxyTimeout = this.noSessionProxy.timeout;
        this.noSessionProxy.timeout = 1000;

        try {
          currentStatus = await this.noSessionProxy.command('/status', 'GET');

          if (currentStatus && currentStatus.ios && currentStatus.ios.ip) {
            this.agentUrl = currentStatus.ios.ip;
          }

          _logger.default.debug(`WebDriverAgent information:`);

          _logger.default.debug(JSON.stringify(currentStatus, null, 2));
        } catch (err) {
          throw new Error(`Unable to connect to running WebDriverAgent: ${err.message}`);
        } finally {
          this.noSessionProxy.timeout = proxyTimeout;
        }
      });

      if (this.xcodebuild.processExited) {
        return currentStatus;
      }

      let endTime = process.hrtime(startTime);
      let startupTime = parseInt((endTime[0] * 1e9 + endTime[1]) / 1e6, 10);

      _logger.default.debug(`WebDriverAgent successfully started after ${startupTime}ms`);
    } catch (err) {
      _logger.default.debug(err.message);

      _logger.default.warn(`Getting status of WebDriverAgent on device timed out. Continuing`);
    }

    return currentStatus;
  }

  async quit() {
    await (0, _utils.killProcess)('xcodebuild', this.xcodebuild);
  }

}

exports.XcodeBuild = XcodeBuild;
var _default = XcodeBuild;
exports.default = _default;require('source-map-support').install();


//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi93ZGEveGNvZGVidWlsZC5qcyJdLCJuYW1lcyI6WyJERUZBVUxUX1NJR05JTkdfSUQiLCJCVUlMRF9URVNUX0RFTEFZIiwiUlVOTkVSX1NDSEVNRV9JT1MiLCJMSUJfU0NIRU1FX0lPUyIsIkVSUk9SX1dSSVRJTkdfQVRUQUNITUVOVCIsIlJVTk5FUl9TQ0hFTUVfVFYiLCJMSUJfU0NIRU1FX1RWIiwieGNvZGVMb2ciLCJsb2dnZXIiLCJnZXRMb2dnZXIiLCJYY29kZUJ1aWxkIiwiY29uc3RydWN0b3IiLCJ4Y29kZVZlcnNpb24iLCJkZXZpY2UiLCJhcmdzIiwicmVhbERldmljZSIsImFnZW50UGF0aCIsImJvb3RzdHJhcFBhdGgiLCJwbGF0Zm9ybVZlcnNpb24iLCJwbGF0Zm9ybU5hbWUiLCJpb3NTZGtWZXJzaW9uIiwic2hvd1hjb2RlTG9nIiwieGNvZGVDb25maWdGaWxlIiwieGNvZGVPcmdJZCIsInhjb2RlU2lnbmluZ0lkIiwia2V5Y2hhaW5QYXRoIiwia2V5Y2hhaW5QYXNzd29yZCIsInByZWJ1aWxkV0RBIiwidXNlUHJlYnVpbHRXREEiLCJ1c2VTaW1wbGVCdWlsZFRlc3QiLCJ1c2VYY3Rlc3RydW5GaWxlIiwibGF1bmNoVGltZW91dCIsIndkYVJlbW90ZVBvcnQiLCJ1cGRhdGVkV0RBQnVuZGxlSWQiLCJkZXJpdmVkRGF0YVBhdGgiLCJtanBlZ1NlcnZlclBvcnQiLCJpbml0Iiwibm9TZXNzaW9uUHJveHkiLCJtYWpvciIsImxvZyIsImVycm9yQW5kVGhyb3ciLCJkZXZpdmVJbmZvIiwiaXNSZWFsRGV2aWNlIiwidWRpZCIsInhjdGVzdHJ1bkZpbGVQYXRoIiwibWlub3IiLCJkZWJ1ZyIsInZlcnNpb25TdHJpbmciLCJyZXRyaWV2ZURlcml2ZWREYXRhUGF0aCIsInN0ZG91dCIsImVyciIsIndhcm4iLCJtZXNzYWdlIiwicGF0dGVybiIsIm1hdGNoIiwiZXhlYyIsIl8iLCJ0cnVuY2F0ZSIsImxlbmd0aCIsInBhdGgiLCJkaXJuYW1lIiwibm9ybWFsaXplIiwicmVzZXQiLCJwcmVidWlsZCIsInhjb2RlYnVpbGQiLCJjcmVhdGVTdWJQcm9jZXNzIiwic3RhcnQiLCJCIiwiZGVsYXkiLCJjbGVhblByb2plY3QiLCJ0bXBJc1R2T1MiLCJsaWJTY2hlbWUiLCJydW5uZXJTY2hlbWUiLCJzY2hlbWUiLCJnZXRDb21tYW5kIiwiYnVpbGRPbmx5IiwiY21kIiwiYnVpbGRDbWQiLCJ0ZXN0Q21kIiwicHVzaCIsInZlcnNpb25NYXRjaCIsIlJlZ0V4cCIsInByb2Nlc3MiLCJlbnYiLCJBUFBJVU1fWENVSVRFU1RfVFJFQVRfV0FSTklOR1NfQVNfRVJST1JTIiwiam9pbiIsIk9iamVjdCIsImFzc2lnbiIsIlVTRV9QT1JUIiwiV0RBX1BST0RVQ1RfQlVORExFX0lERU5USUZJRVIiLCJXREFfUlVOTkVSX0JVTkRMRV9JRCIsIk1KUEVHX1NFUlZFUl9QT1JUIiwidXBncmFkZVRpbWVzdGFtcCIsIlVQR1JBREVfVElNRVNUQU1QIiwiU3ViUHJvY2VzcyIsImN3ZCIsImRldGFjaGVkIiwic3RkaW8iLCJsb2dYY29kZU91dHB1dCIsImxvZ01zZyIsImlzQm9vbGVhbiIsIm9uIiwic3RkZXJyIiwib3V0IiwiaW5jbHVkZXMiLCJsb2dMb2NhdGlvbiIsImZpcnN0IiwicmVtb3ZlIiwidHJpbSIsInNwbGl0IiwidiIsInN0YXJ0c1dpdGgiLCJzZXAiLCJpZ25vcmVkRXJyb3JzIiwic29tZSIsIngiLCJfd2RhX2Vycm9yX29jY3VycmVkIiwibGluZSIsIkVPTCIsImVycm9yIiwiX3dkYV9lcnJvcl9tZXNzYWdlIiwicmVzb2x2ZSIsInJlamVjdCIsImNvZGUiLCJzaWduYWwiLCJkYXRhIiwiZnMiLCJyZWFkRmlsZSIsInByb2Nlc3NFeGl0ZWQiLCJFcnJvciIsInN0YXJ0VGltZSIsImhydGltZSIsInN0YXR1cyIsIndhaXRGb3JTdGFydCIsIm1zZyIsImN1cnJlbnRTdGF0dXMiLCJyZXRyaWVzIiwicGFyc2VJbnQiLCJwcm94eVRpbWVvdXQiLCJ0aW1lb3V0IiwiY29tbWFuZCIsImlvcyIsImlwIiwiYWdlbnRVcmwiLCJKU09OIiwic3RyaW5naWZ5IiwiZW5kVGltZSIsInN0YXJ0dXBUaW1lIiwicXVpdCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFHQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFFQSxNQUFNQSxrQkFBa0IsR0FBRyxrQkFBM0I7QUFDQSxNQUFNQyxnQkFBZ0IsR0FBRyxJQUF6QjtBQUNBLE1BQU1DLGlCQUFpQixHQUFHLHNCQUExQjtBQUNBLE1BQU1DLGNBQWMsR0FBRyxtQkFBdkI7QUFFQSxNQUFNQyx3QkFBd0IsR0FBRyx1Q0FBakM7QUFFQSxNQUFNQyxnQkFBZ0IsR0FBRywyQkFBekI7QUFDQSxNQUFNQyxhQUFhLEdBQUcsd0JBQXRCOztBQUVBLE1BQU1DLFFBQVEsR0FBR0Msc0JBQU9DLFNBQVAsQ0FBaUIsT0FBakIsQ0FBakI7O0FBR0EsTUFBTUMsVUFBTixDQUFpQjtBQUNmQyxFQUFBQSxXQUFXLENBQUVDLFlBQUYsRUFBZ0JDLE1BQWhCLEVBQXdCQyxJQUFJLEdBQUcsRUFBL0IsRUFBbUM7QUFDNUMsU0FBS0YsWUFBTCxHQUFvQkEsWUFBcEI7QUFFQSxTQUFLQyxNQUFMLEdBQWNBLE1BQWQ7QUFFQSxTQUFLRSxVQUFMLEdBQWtCRCxJQUFJLENBQUNDLFVBQXZCO0FBRUEsU0FBS0MsU0FBTCxHQUFpQkYsSUFBSSxDQUFDRSxTQUF0QjtBQUNBLFNBQUtDLGFBQUwsR0FBcUJILElBQUksQ0FBQ0csYUFBMUI7QUFFQSxTQUFLQyxlQUFMLEdBQXVCSixJQUFJLENBQUNJLGVBQTVCO0FBQ0EsU0FBS0MsWUFBTCxHQUFvQkwsSUFBSSxDQUFDSyxZQUF6QjtBQUNBLFNBQUtDLGFBQUwsR0FBcUJOLElBQUksQ0FBQ00sYUFBMUI7QUFFQSxTQUFLQyxZQUFMLEdBQW9CUCxJQUFJLENBQUNPLFlBQXpCO0FBRUEsU0FBS0MsZUFBTCxHQUF1QlIsSUFBSSxDQUFDUSxlQUE1QjtBQUNBLFNB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QkssQ0FBTjs7QUFxQkEsVUFBSSxLQUFLMUUsVUFBTCxDQUFnQmdFLGFBQXBCLEVBQW1DO0FBRWpDLGVBQU9PLGFBQVA7QUFDRDs7QUFFRCxVQUFJVyxPQUFPLEdBQUdoRSxPQUFPLENBQUNpRCxNQUFSLENBQWVELFNBQWYsQ0FBZDtBQUVBLFVBQUlpQixXQUFXLEdBQUdWLFFBQVEsQ0FBQyxDQUFDUyxPQUFPLENBQUMsQ0FBRCxDQUFQLEdBQWEsR0FBYixHQUFtQkEsT0FBTyxDQUFDLENBQUQsQ0FBM0IsSUFBa0MsR0FBbkMsRUFBd0MsRUFBeEMsQ0FBMUI7O0FBQ0EzRyxzQkFBSU8sS0FBSixDQUFXLDZDQUE0Q3FHLFdBQVksSUFBbkU7QUFDRCxLQWhDRCxDQWdDRSxPQUFPakcsR0FBUCxFQUFZO0FBR1pYLHNCQUFJTyxLQUFKLENBQVVJLEdBQUcsQ0FBQ0UsT0FBZDs7QUFDQWIsc0JBQUlZLElBQUosQ0FBVSxrRUFBVjtBQUNEOztBQUNELFdBQU9vRixhQUFQO0FBQ0Q7O0FBRUQsUUFBTWEsSUFBTixHQUFjO0FBQ1osVUFBTSx3QkFBWSxZQUFaLEVBQTBCLEtBQUtwRixVQUEvQixDQUFOO0FBQ0Q7O0FBeFhjOzs7ZUE0WEZ0RCxVIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgcmV0cnlJbnRlcnZhbCB9IGZyb20gJ2FzeW5jYm94JztcbmltcG9ydCB7IFN1YlByb2Nlc3MsIGV4ZWMgfSBmcm9tICd0ZWVuX3Byb2Nlc3MnO1xuaW1wb3J0IHsgZnMsIGxvZ2dlciB9IGZyb20gJ2FwcGl1bS1zdXBwb3J0JztcbmltcG9ydCBsb2cgZnJvbSAnLi4vbG9nZ2VyJztcbmltcG9ydCBCIGZyb20gJ2JsdWViaXJkJztcbmltcG9ydCB7IGZpeEZvclhjb2RlNywgZml4Rm9yWGNvZGU5LCBzZXRSZWFsRGV2aWNlU2VjdXJpdHksIGdlbmVyYXRlWGNvZGVDb25maWdGaWxlLFxuICAgICAgICAgc2V0WGN0ZXN0cnVuRmlsZSwgdXBkYXRlUHJvamVjdEZpbGUsIHJlc2V0UHJvamVjdEZpbGUsIGtpbGxQcm9jZXNzLFxuICAgICAgICAgV0RBX1JVTk5FUl9CVU5ETEVfSUQsIGdldFdEQVVwZ3JhZGVUaW1lc3RhbXAgfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCBfIGZyb20gJ2xvZGFzaCc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7IEVPTCB9IGZyb20gJ29zJztcbmltcG9ydCB7IGlzVHZPUyB9IGZyb20gJy4uL3V0aWxzJztcblxuY29uc3QgREVGQVVMVF9TSUdOSU5HX0lEID0gJ2lQaG9uZSBEZXZlbG9wZXInO1xuY29uc3QgQlVJTERfVEVTVF9ERUxBWSA9IDEwMDA7XG5jb25zdCBSVU5ORVJfU0NIRU1FX0lPUyA9ICdXZWJEcml2ZXJBZ2VudFJ1bm5lcic7XG5jb25zdCBMSUJfU0NIRU1FX0lPUyA9ICdXZWJEcml2ZXJBZ2VudExpYic7XG5cbmNvbnN0IEVSUk9SX1dSSVRJTkdfQVRUQUNITUVOVCA9ICdFcnJvciB3cml0aW5nIGF0dGFjaG1lbnQgZGF0YSB0byBmaWxlJztcblxuY29uc3QgUlVOTkVSX1NDSEVNRV9UViA9ICdXZWJEcml2ZXJBZ2VudFJ1bm5lcl90dk9TJztcbmNvbnN0IExJQl9TQ0hFTUVfVFYgPSAnV2ViRHJpdmVyQWdlbnRMaWJfdHZPUyc7XG5cbmNvbnN0IHhjb2RlTG9nID0gbG9nZ2VyLmdldExvZ2dlcignWGNvZGUnKTtcblxuXG5jbGFzcyBYY29kZUJ1aWxkIHtcbiAgY29uc3RydWN0b3IgKHhjb2RlVmVyc2lvbiwgZGV2aWNlLCBhcmdzID0ge30pIHtcbiAgICB0aGlzLnhjb2RlVmVyc2lvbiA9IHhjb2RlVmVyc2lvbjtcblxuICAgIHRoaXMuZGV2aWNlID0gZGV2aWNlO1xuXG4gICAgdGhpcy5yZWFsRGV2aWNlID0gYXJncy5yZWFsRGV2aWNlO1xuXG4gICAgdGhpcy5hZ2VudFBhdGggPSBhcmdzLmFnZW50UGF0aDtcbiAgICB0aGlzLmJvb3RzdHJhcFBhdGggPSBhcmdzLmJvb3RzdHJhcFBhdGg7XG5cbiAgICB0aGlzLnBsYXRmb3JtVmVyc2lvbiA9IGFyZ3MucGxhdGZvcm1WZXJzaW9uO1xuICAgIHRoaXMucGxhdGZvcm1OYW1lID0gYXJncy5wbGF0Zm9ybU5hbWU7XG4gICAgdGhpcy5pb3NTZGtWZXJzaW9uID0gYXJncy5pb3NTZGtWZXJzaW9uO1xuXG4gICAgdGhpcy5zaG93WGNvZGVMb2cgPSBhcmdzLnNob3dYY29kZUxvZztcblxuICAgIHRoaXMueGNvZGVDb25maWdGaWxlID0gYXJncy54Y29kZUNvbmZpZ0ZpbGU7XG4gICAgdGhpcy54Y29kZU9yZ0lkID0gYXJncy54Y29kZU9yZ0lkO1xuICAgIHRoaXMueGNvZGVTaWduaW5nSWQgPSBhcmdzLnhjb2RlU2lnbmluZ0lkIHx8IERFRkFVTFRfU0lHTklOR19JRDtcbiAgICB0aGlzLmtleWNoYWluUGF0aCA9IGFyZ3Mua2V5Y2hhaW5QYXRoO1xuICAgIHRoaXMua2V5Y2hhaW5QYXNzd29yZCA9IGFyZ3Mua2V5Y2hhaW5QYXNzd29yZDtcblxuICAgIHRoaXMucHJlYnVpbGRXREEgPSBhcmdzLnByZWJ1aWxkV0RBO1xuICAgIHRoaXMudXNlUHJlYnVpbHRXREEgPSBhcmdzLnVzZVByZWJ1aWx0V0RBO1xuICAgIHRoaXMudXNlU2ltcGxlQnVpbGRUZXN0ID0gYXJncy51c2VTaW1wbGVCdWlsZFRlc3Q7XG5cbiAgICB0aGlzLnVzZVhjdGVzdHJ1bkZpbGUgPSBhcmdzLnVzZVhjdGVzdHJ1bkZpbGU7XG5cbiAgICB0aGlzLmxhdW5jaFRpbWVvdXQgPSBhcmdzLmxhdW5jaFRpbWVvdXQ7XG5cbiAgICB0aGlzLndkYVJlbW90ZVBvcnQgPSBhcmdzLndkYVJlbW90ZVBvcnQ7XG5cbiAgICB0aGlzLnVwZGF0ZWRXREFCdW5kbGVJZCA9IGFyZ3MudXBkYXRlZFdEQUJ1bmRsZUlkO1xuICAgIHRoaXMuZGVyaXZlZERhdGFQYXRoID0gYXJncy5kZXJpdmVkRGF0YVBhdGg7XG5cbiAgICB0aGlzLm1qcGVnU2VydmVyUG9ydCA9IGFyZ3MubWpwZWdTZXJ2ZXJQb3J0O1xuICB9XG5cbiAgYXN5bmMgaW5pdCAobm9TZXNzaW9uUHJveHkpIHtcbiAgICB0aGlzLm5vU2Vzc2lvblByb3h5ID0gbm9TZXNzaW9uUHJveHk7XG5cbiAgICBpZiAodGhpcy51c2VYY3Rlc3RydW5GaWxlKSB7XG4gICAgICBpZiAodGhpcy54Y29kZVZlcnNpb24ubWFqb3IgPD0gNykge1xuICAgICAgICBsb2cuZXJyb3JBbmRUaHJvdygndXNlWGN0ZXN0cnVuRmlsZSBjYW4gb25seSBiZSB1c2VkIHdpdGggeGNvZGUgdmVyc2lvbiA4IG9ud2FyZHMnKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGRldml2ZUluZm8gPSB7XG4gICAgICAgIGlzUmVhbERldmljZTogdGhpcy5yZWFsRGV2aWNlLFxuICAgICAgICB1ZGlkOiB0aGlzLmRldmljZS51ZGlkLFxuICAgICAgICBwbGF0Zm9ybVZlcnNpb246IHRoaXMucGxhdGZvcm1WZXJzaW9uLFxuICAgICAgICBwbGF0Zm9ybU5hbWU6IHRoaXMucGxhdGZvcm1OYW1lXG4gICAgICB9O1xuICAgICAgdGhpcy54Y3Rlc3RydW5GaWxlUGF0aCA9IGF3YWl0IHNldFhjdGVzdHJ1bkZpbGUoZGV2aXZlSW5mbywgdGhpcy5pb3NTZGtWZXJzaW9uLCB0aGlzLmJvb3RzdHJhcFBhdGgsIHRoaXMud2RhUmVtb3RlUG9ydCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHRoaXMueGNvZGVWZXJzaW9uLm1ham9yID09PSA3IHx8ICh0aGlzLnhjb2RlVmVyc2lvbi5tYWpvciA9PT0gOCAmJiB0aGlzLnhjb2RlVmVyc2lvbi5taW5vciA9PT0gMCkpIHtcbiAgICAgIGxvZy5kZWJ1ZyhgVXNpbmcgWGNvZGUgJHt0aGlzLnhjb2RlVmVyc2lvbi52ZXJzaW9uU3RyaW5nfSwgc28gZml4aW5nIFdEQSBjb2RlYmFzZWApO1xuICAgICAgYXdhaXQgZml4Rm9yWGNvZGU3KHRoaXMuYm9vdHN0cmFwUGF0aCwgdHJ1ZSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMueGNvZGVWZXJzaW9uLm1ham9yID09PSA5KSB7XG4gICAgICBsb2cuZGVidWcoYFVzaW5nIFhjb2RlICR7dGhpcy54Y29kZVZlcnNpb24udmVyc2lvblN0cmluZ30sIHNvIGZpeGluZyBXREEgY29kZWJhc2VgKTtcbiAgICAgIGF3YWl0IGZpeEZvclhjb2RlOSh0aGlzLmJvb3RzdHJhcFBhdGgsIHRydWUpO1xuICAgIH1cblxuICAgIC8vIGlmIG5lY2Vzc2FyeSwgdXBkYXRlIHRoZSBidW5kbGVJZCB0byB1c2VyJ3Mgc3BlY2lmaWNhdGlvblxuICAgIGlmICh0aGlzLnJlYWxEZXZpY2UpIHtcbiAgICAgIC8vIEluIGNhc2UgdGhlIHByb2plY3Qgc3RpbGwgaGFzIHRoZSB1c2VyIHNwZWNpZmljIGJ1bmRsZSBJRCwgcmVzZXQgdGhlIHByb2plY3QgZmlsZSBmaXJzdC5cbiAgICAgIC8vIC0gV2UgZG8gdGhpcyByZXNldCBldmVuIGlmIHVwZGF0ZWRXREFCdW5kbGVJZCBpcyBub3Qgc3BlY2lmaWVkLFxuICAgICAgLy8gICBzaW5jZSB0aGUgcHJldmlvdXMgdXBkYXRlZFdEQUJ1bmRsZUlkIHRlc3QgaGFzIGdlbmVyYXRlZCB0aGUgdXNlciBzcGVjaWZpYyBidW5kbGUgSUQgcHJvamVjdCBmaWxlLlxuICAgICAgLy8gLSBXZSBkb24ndCBjYWxsIHJlc2V0UHJvamVjdEZpbGUgZm9yIHNpbXVsYXRvcixcbiAgICAgIC8vICAgc2luY2Ugc2ltdWxhdG9yIHRlc3QgcnVuIHdpbGwgd29yayB3aXRoIGFueSB1c2VyIHNwZWNpZmljIGJ1bmRsZSBJRC5cbiAgICAgIGF3YWl0IHJlc2V0UHJvamVjdEZpbGUodGhpcy5hZ2VudFBhdGgpO1xuICAgICAgaWYgKHRoaXMudXBkYXRlZFdEQUJ1bmRsZUlkKSB7XG4gICAgICAgIGF3YWl0IHVwZGF0ZVByb2plY3RGaWxlKHRoaXMuYWdlbnRQYXRoLCB0aGlzLnVwZGF0ZWRXREFCdW5kbGVJZCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgcmV0cmlldmVEZXJpdmVkRGF0YVBhdGggKCkge1xuICAgIGlmICh0aGlzLmRlcml2ZWREYXRhUGF0aCkge1xuICAgICAgcmV0dXJuIHRoaXMuZGVyaXZlZERhdGFQYXRoO1xuICAgIH1cblxuICAgIGxldCBzdGRvdXQ7XG4gICAgdHJ5IHtcbiAgICAgICh7c3Rkb3V0fSA9IGF3YWl0IGV4ZWMoJ3hjb2RlYnVpbGQnLCBbJy1wcm9qZWN0JywgdGhpcy5hZ2VudFBhdGgsICctc2hvd0J1aWxkU2V0dGluZ3MnXSkpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgbG9nLndhcm4oYENhbm5vdCByZXRyaWV2ZSBXREEgYnVpbGQgc2V0dGluZ3MuIE9yaWdpbmFsIGVycm9yOiAke2Vyci5tZXNzYWdlfWApO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHBhdHRlcm4gPSAvXlxccypCVUlMRF9ESVJcXHMrPVxccysoXFwvLiopL207XG4gICAgY29uc3QgbWF0Y2ggPSBwYXR0ZXJuLmV4ZWMoc3Rkb3V0KTtcbiAgICBpZiAoIW1hdGNoKSB7XG4gICAgICBsb2cud2FybihgQ2Fubm90IHBhcnNlIFdEQSBidWlsZCBkaXIgZnJvbSAke18udHJ1bmNhdGUoc3Rkb3V0LCB7bGVuZ3RoOiAzMDB9KX1gKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbG9nLmRlYnVnKGBQYXJzZWQgQlVJTERfRElSIGNvbmZpZ3VyYXRpb24gdmFsdWU6ICcke21hdGNoWzFdfSdgKTtcbiAgICAvLyBEZXJpdmVkIGRhdGEgcm9vdCBpcyB0d28gbGV2ZWxzIGhpZ2hlciBvdmVyIHRoZSBidWlsZCBkaXJcbiAgICB0aGlzLmRlcml2ZWREYXRhUGF0aCA9IHBhdGguZGlybmFtZShwYXRoLmRpcm5hbWUocGF0aC5ub3JtYWxpemUobWF0Y2hbMV0pKSk7XG4gICAgbG9nLmRlYnVnKGBHb3QgZGVyaXZlZCBkYXRhIHJvb3Q6ICcke3RoaXMuZGVyaXZlZERhdGFQYXRofSdgKTtcbiAgICByZXR1cm4gdGhpcy5kZXJpdmVkRGF0YVBhdGg7XG4gIH1cblxuICBhc3luYyByZXNldCAoKSB7XG4gICAgLy8gaWYgbmVjZXNzYXJ5LCByZXNldCB0aGUgYnVuZGxlSWQgdG8gb3JpZ2luYWwgdmFsdWVcbiAgICBpZiAodGhpcy5yZWFsRGV2aWNlICYmIHRoaXMudXBkYXRlZFdEQUJ1bmRsZUlkKSB7XG4gICAgICBhd2FpdCByZXNldFByb2plY3RGaWxlKHRoaXMuYWdlbnRQYXRoKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBwcmVidWlsZCAoKSB7XG4gICAgaWYgKHRoaXMueGNvZGVWZXJzaW9uLm1ham9yID09PSA3KSB7XG4gICAgICBsb2cuZGVidWcoYENhcGFiaWxpdHkgJ3ByZWJ1aWxkV0RBJyBzZXQsIGJ1dCBvbiB4Y29kZSB2ZXJzaW9uICR7dGhpcy54Y29kZVZlcnNpb24udmVyc2lvblN0cmluZ30gc28gc2tpcHBpbmdgKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBmaXJzdCBkbyBhIGJ1aWxkIHBoYXNlXG4gICAgbG9nLmRlYnVnKCdQcmUtYnVpbGRpbmcgV0RBIGJlZm9yZSBsYXVuY2hpbmcgdGVzdCcpO1xuICAgIHRoaXMudXNlUHJlYnVpbHRXREEgPSB0cnVlO1xuICAgIHRoaXMueGNvZGVidWlsZCA9IGF3YWl0IHRoaXMuY3JlYXRlU3ViUHJvY2Vzcyh0cnVlKTtcbiAgICBhd2FpdCB0aGlzLnN0YXJ0KHRydWUpO1xuXG4gICAgdGhpcy54Y29kZWJ1aWxkID0gbnVsbDtcblxuICAgIC8vIHBhdXNlIGEgbW9tZW50XG4gICAgYXdhaXQgQi5kZWxheShCVUlMRF9URVNUX0RFTEFZKTtcbiAgfVxuXG4gIGFzeW5jIGNsZWFuUHJvamVjdCAoKSB7XG4gICAgY29uc3QgdG1wSXNUdk9TID0gaXNUdk9TKHRoaXMucGxhdGZvcm1OYW1lKTtcbiAgICBjb25zdCBsaWJTY2hlbWUgPSB0bXBJc1R2T1MgPyBMSUJfU0NIRU1FX1RWIDogTElCX1NDSEVNRV9JT1M7XG4gICAgY29uc3QgcnVubmVyU2NoZW1lID0gdG1wSXNUdk9TID8gUlVOTkVSX1NDSEVNRV9UViA6IFJVTk5FUl9TQ0hFTUVfSU9TO1xuXG4gICAgZm9yIChjb25zdCBzY2hlbWUgb2YgW2xpYlNjaGVtZSwgcnVubmVyU2NoZW1lXSkge1xuICAgICAgbG9nLmRlYnVnKGBDbGVhbmluZyB0aGUgcHJvamVjdCBzY2hlbWUgJyR7c2NoZW1lfScgdG8gbWFrZSBzdXJlIHRoZXJlIGFyZSBubyBsZWZ0b3ZlcnMgZnJvbSBwcmV2aW91cyBpbnN0YWxsc2ApO1xuICAgICAgYXdhaXQgZXhlYygneGNvZGVidWlsZCcsIFtcbiAgICAgICAgJ2NsZWFuJyxcbiAgICAgICAgJy1wcm9qZWN0JywgdGhpcy5hZ2VudFBhdGgsXG4gICAgICAgICctc2NoZW1lJywgc2NoZW1lLFxuICAgICAgXSk7XG4gICAgfVxuICB9XG5cbiAgZ2V0Q29tbWFuZCAoYnVpbGRPbmx5ID0gZmFsc2UpIHtcbiAgICBsZXQgY21kID0gJ3hjb2RlYnVpbGQnO1xuICAgIGxldCBhcmdzO1xuXG4gICAgLy8gZmlndXJlIG91dCB0aGUgdGFyZ2V0cyBmb3IgeGNvZGVidWlsZFxuICAgIGlmICh0aGlzLnhjb2RlVmVyc2lvbi5tYWpvciA8IDgpIHtcbiAgICAgIGFyZ3MgPSBbXG4gICAgICAgICdidWlsZCcsXG4gICAgICAgICd0ZXN0JyxcbiAgICAgIF07XG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCBbYnVpbGRDbWQsIHRlc3RDbWRdID0gdGhpcy51c2VTaW1wbGVCdWlsZFRlc3QgPyBbJ2J1aWxkJywgJ3Rlc3QnXSA6IFsnYnVpbGQtZm9yLXRlc3RpbmcnLCAndGVzdC13aXRob3V0LWJ1aWxkaW5nJ107XG4gICAgICBpZiAoYnVpbGRPbmx5KSB7XG4gICAgICAgIGFyZ3MgPSBbYnVpbGRDbWRdO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLnVzZVByZWJ1aWx0V0RBIHx8IHRoaXMudXNlWGN0ZXN0cnVuRmlsZSkge1xuICAgICAgICBhcmdzID0gW3Rlc3RDbWRdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYXJncyA9IFtidWlsZENtZCwgdGVzdENtZF07XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMudXNlWGN0ZXN0cnVuRmlsZSkge1xuICAgICAgYXJncy5wdXNoKCcteGN0ZXN0cnVuJywgdGhpcy54Y3Rlc3RydW5GaWxlUGF0aCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHJ1bm5lclNjaGVtZSA9IGlzVHZPUyh0aGlzLnBsYXRmb3JtTmFtZSkgPyBSVU5ORVJfU0NIRU1FX1RWIDogUlVOTkVSX1NDSEVNRV9JT1M7XG4gICAgICBhcmdzLnB1c2goJy1wcm9qZWN0JywgdGhpcy5hZ2VudFBhdGgsICctc2NoZW1lJywgcnVubmVyU2NoZW1lKTtcbiAgICAgIGlmICh0aGlzLmRlcml2ZWREYXRhUGF0aCkge1xuICAgICAgICBhcmdzLnB1c2goJy1kZXJpdmVkRGF0YVBhdGgnLCB0aGlzLmRlcml2ZWREYXRhUGF0aCk7XG4gICAgICB9XG4gICAgfVxuICAgIGFyZ3MucHVzaCgnLWRlc3RpbmF0aW9uJywgYGlkPSR7dGhpcy5kZXZpY2UudWRpZH1gKTtcblxuICAgIGNvbnN0IHZlcnNpb25NYXRjaCA9IG5ldyBSZWdFeHAoL14oXFxkKylcXC4oXFxkKykvKS5leGVjKHRoaXMucGxhdGZvcm1WZXJzaW9uKTtcbiAgICBpZiAodmVyc2lvbk1hdGNoKSB7XG4gICAgICBhcmdzLnB1c2goYElQSE9ORU9TX0RFUExPWU1FTlRfVEFSR0VUPSR7dmVyc2lvbk1hdGNoWzFdfS4ke3ZlcnNpb25NYXRjaFsyXX1gKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbG9nLndhcm4oYENhbm5vdCBwYXJzZSBtYWpvciBhbmQgbWlub3IgdmVyc2lvbiBudW1iZXJzIGZyb20gcGxhdGZvcm1WZXJzaW9uIFwiJHt0aGlzLnBsYXRmb3JtVmVyc2lvbn1cIi4gYCArXG4gICAgICAgICAgICAgICAnV2lsbCBidWlsZCBmb3IgdGhlIGRlZmF1bHQgcGxhdGZvcm0gaW5zdGVhZCcpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnJlYWxEZXZpY2UgJiYgdGhpcy54Y29kZUNvbmZpZ0ZpbGUpIHtcbiAgICAgIGxvZy5kZWJ1ZyhgVXNpbmcgWGNvZGUgY29uZmlndXJhdGlvbiBmaWxlOiAnJHt0aGlzLnhjb2RlQ29uZmlnRmlsZX0nYCk7XG4gICAgICBhcmdzLnB1c2goJy14Y2NvbmZpZycsIHRoaXMueGNvZGVDb25maWdGaWxlKTtcbiAgICB9XG5cbiAgICBpZiAoIXByb2Nlc3MuZW52LkFQUElVTV9YQ1VJVEVTVF9UUkVBVF9XQVJOSU5HU19BU19FUlJPUlMpIHtcbiAgICAgIC8vIFRoaXMgc29tZXRpbWVzIGhlbHBzIHRvIHN1cnZpdmUgWGNvZGUgdXBkYXRlc1xuICAgICAgYXJncy5wdXNoKCdHQ0NfVFJFQVRfV0FSTklOR1NfQVNfRVJST1JTPTAnKTtcbiAgICB9XG5cbiAgICAvLyBCZWxvdyBvcHRpb24gc2xpZ2h0bHkgcmVkdWNlcyBidWlsZCB0aW1lIGluIGRlYnVnIGJ1aWxkXG4gICAgLy8gd2l0aCBwcmV2ZW50aW5nIHRvIGdlbmVyYXRlIGAvSW5kZXgvRGF0YVN0b3JlYCB3aGljaCBpcyB1c2VkIGJ5IGRldmVsb3BtZW50XG4gICAgYXJncy5wdXNoKCdDT01QSUxFUl9JTkRFWF9TVE9SRV9FTkFCTEU9Tk8nKTtcblxuICAgIHJldHVybiB7Y21kLCBhcmdzfTtcbiAgfVxuXG4gIGFzeW5jIGNyZWF0ZVN1YlByb2Nlc3MgKGJ1aWxkT25seSA9IGZhbHNlKSB7XG4gICAgaWYgKCF0aGlzLnVzZVhjdGVzdHJ1bkZpbGUpIHtcbiAgICAgIGlmICh0aGlzLnJlYWxEZXZpY2UpIHtcbiAgICAgICAgaWYgKHRoaXMua2V5Y2hhaW5QYXRoICYmIHRoaXMua2V5Y2hhaW5QYXNzd29yZCkge1xuICAgICAgICAgIGF3YWl0IHNldFJlYWxEZXZpY2VTZWN1cml0eSh0aGlzLmtleWNoYWluUGF0aCwgdGhpcy5rZXljaGFpblBhc3N3b3JkKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy54Y29kZU9yZ0lkICYmIHRoaXMueGNvZGVTaWduaW5nSWQgJiYgIXRoaXMueGNvZGVDb25maWdGaWxlKSB7XG4gICAgICAgICAgdGhpcy54Y29kZUNvbmZpZ0ZpbGUgPSBhd2FpdCBnZW5lcmF0ZVhjb2RlQ29uZmlnRmlsZSh0aGlzLnhjb2RlT3JnSWQsIHRoaXMueGNvZGVTaWduaW5nSWQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3Qge2NtZCwgYXJnc30gPSB0aGlzLmdldENvbW1hbmQoYnVpbGRPbmx5KTtcbiAgICBsb2cuZGVidWcoYEJlZ2lubmluZyAke2J1aWxkT25seSA/ICdidWlsZCcgOiAndGVzdCd9IHdpdGggY29tbWFuZCAnJHtjbWR9ICR7YXJncy5qb2luKCcgJyl9JyBgICtcbiAgICAgICAgICAgICAgYGluIGRpcmVjdG9yeSAnJHt0aGlzLmJvb3RzdHJhcFBhdGh9J2ApO1xuICAgIGNvbnN0IGVudiA9IE9iamVjdC5hc3NpZ24oe30sIHByb2Nlc3MuZW52LCB7XG4gICAgICBVU0VfUE9SVDogdGhpcy53ZGFSZW1vdGVQb3J0LFxuICAgICAgV0RBX1BST0RVQ1RfQlVORExFX0lERU5USUZJRVI6IHRoaXMudXBkYXRlZFdEQUJ1bmRsZUlkIHx8IFdEQV9SVU5ORVJfQlVORExFX0lELFxuICAgIH0pO1xuICAgIGlmICh0aGlzLm1qcGVnU2VydmVyUG9ydCkge1xuICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2FwcGl1bS9XZWJEcml2ZXJBZ2VudC9wdWxsLzEwNVxuICAgICAgZW52Lk1KUEVHX1NFUlZFUl9QT1JUID0gdGhpcy5tanBlZ1NlcnZlclBvcnQ7XG4gICAgfVxuICAgIGNvbnN0IHVwZ3JhZGVUaW1lc3RhbXAgPSBhd2FpdCBnZXRXREFVcGdyYWRlVGltZXN0YW1wKHRoaXMuYm9vdHN0cmFwUGF0aCk7XG4gICAgaWYgKHVwZ3JhZGVUaW1lc3RhbXApIHtcbiAgICAgIGVudi5VUEdSQURFX1RJTUVTVEFNUCA9IHVwZ3JhZGVUaW1lc3RhbXA7XG4gICAgfVxuICAgIGNvbnN0IHhjb2RlYnVpbGQgPSBuZXcgU3ViUHJvY2VzcyhjbWQsIGFyZ3MsIHtcbiAgICAgIGN3ZDogdGhpcy5ib290c3RyYXBQYXRoLFxuICAgICAgZW52LFxuICAgICAgZGV0YWNoZWQ6IHRydWUsXG4gICAgICBzdGRpbzogWydpZ25vcmUnLCAncGlwZScsICdwaXBlJ10sXG4gICAgfSk7XG5cbiAgICBsZXQgbG9nWGNvZGVPdXRwdXQgPSAhIXRoaXMuc2hvd1hjb2RlTG9nO1xuICAgIGNvbnN0IGxvZ01zZyA9IF8uaXNCb29sZWFuKHRoaXMuc2hvd1hjb2RlTG9nKVxuICAgICAgPyBgT3V0cHV0IGZyb20geGNvZGVidWlsZCAke3RoaXMuc2hvd1hjb2RlTG9nID8gJ3dpbGwnIDogJ3dpbGwgbm90J30gYmUgbG9nZ2VkYFxuICAgICAgOiAnT3V0cHV0IGZyb20geGNvZGVidWlsZCB3aWxsIG9ubHkgYmUgbG9nZ2VkIGlmIGFueSBlcnJvcnMgYXJlIHByZXNlbnQgdGhlcmUnO1xuICAgIGxvZy5kZWJ1ZyhgJHtsb2dNc2d9LiBUbyBjaGFuZ2UgdGhpcywgdXNlICdzaG93WGNvZGVMb2cnIGRlc2lyZWQgY2FwYWJpbGl0eWApO1xuICAgIHhjb2RlYnVpbGQub24oJ291dHB1dCcsIChzdGRvdXQsIHN0ZGVycikgPT4ge1xuICAgICAgbGV0IG91dCA9IHN0ZG91dCB8fCBzdGRlcnI7XG4gICAgICAvLyB3ZSB3YW50IHRvIHB1bGwgb3V0IHRoZSBsb2cgZmlsZSB0aGF0IGlzIGNyZWF0ZWQsIGFuZCBoaWdobGlnaHQgaXRcbiAgICAgIC8vIGZvciBkaWFnbm9zdGljIHB1cnBvc2VzXG4gICAgICBpZiAob3V0LmluY2x1ZGVzKCdXcml0aW5nIGRpYWdub3N0aWMgbG9nIGZvciB0ZXN0IHNlc3Npb24gdG8nKSkge1xuICAgICAgICAvLyBwdWxsIG91dCB0aGUgZmlyc3QgbGluZSB0aGF0IGJlZ2lucyB3aXRoIHRoZSBwYXRoIHNlcGFyYXRvclxuICAgICAgICAvLyB3aGljaCAqc2hvdWxkKiBiZSB0aGUgbGluZSBpbmRpY2F0aW5nIHRoZSBsb2cgZmlsZSBnZW5lcmF0ZWRcbiAgICAgICAgeGNvZGVidWlsZC5sb2dMb2NhdGlvbiA9IF8uZmlyc3QoXy5yZW1vdmUob3V0LnRyaW0oKS5zcGxpdCgnXFxuJyksICh2KSA9PiB2LnN0YXJ0c1dpdGgocGF0aC5zZXApKSk7XG4gICAgICAgIGxvZy5kZWJ1ZyhgTG9nIGZpbGUgZm9yIHhjb2RlYnVpbGQgdGVzdDogJHt4Y29kZWJ1aWxkLmxvZ0xvY2F0aW9ufWApO1xuICAgICAgfVxuXG4gICAgICAvLyBpZiB3ZSBoYXZlIGFuIGVycm9yIHdlIHdhbnQgdG8gb3V0cHV0IHRoZSBsb2dzXG4gICAgICAvLyBvdGhlcndpc2UgdGhlIGZhaWx1cmUgaXMgaW5zY3J1dGlibGVcbiAgICAgIC8vIGJ1dCBkbyBub3QgbG9nIHBlcm1pc3Npb24gZXJyb3JzIGZyb20gdHJ5aW5nIHRvIHdyaXRlIHRvIGF0dGFjaG1lbnRzIGZvbGRlclxuICAgICAgY29uc3QgaWdub3JlZEVycm9ycyA9IFtFUlJPUl9XUklUSU5HX0FUVEFDSE1FTlQsICdGYWlsZWQgdG8gcmVtb3ZlIHNjcmVlbnNob3QgYXQgcGF0aCddO1xuICAgICAgaWYgKHRoaXMuc2hvd1hjb2RlTG9nICE9PSBmYWxzZSAmJiBvdXQuaW5jbHVkZXMoJ0Vycm9yIERvbWFpbj0nKSAmJlxuICAgICAgICAgICFpZ25vcmVkRXJyb3JzLnNvbWUoKHgpID0+IG91dC5pbmNsdWRlcyh4KSkpIHtcbiAgICAgICAgbG9nWGNvZGVPdXRwdXQgPSB0cnVlO1xuXG4gICAgICAgIC8vIHRlcnJpYmxlIGhhY2sgdG8gaGFuZGxlIGNhc2Ugd2hlcmUgeGNvZGUgcmV0dXJuIDAgYnV0IGlzIGZhaWxpbmdcbiAgICAgICAgeGNvZGVidWlsZC5fd2RhX2Vycm9yX29jY3VycmVkID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgLy8gZG8gbm90IGxvZyBwZXJtaXNzaW9uIGVycm9ycyBmcm9tIHRyeWluZyB0byB3cml0ZSB0byBhdHRhY2htZW50cyBmb2xkZXJcbiAgICAgIGlmIChsb2dYY29kZU91dHB1dCAmJiAhb3V0LmluY2x1ZGVzKEVSUk9SX1dSSVRJTkdfQVRUQUNITUVOVCkpIHtcbiAgICAgICAgZm9yIChjb25zdCBsaW5lIG9mIG91dC5zcGxpdChFT0wpKSB7XG4gICAgICAgICAgeGNvZGVMb2cuZXJyb3IobGluZSk7XG4gICAgICAgICAgaWYgKGxpbmUpIHtcbiAgICAgICAgICAgIHhjb2RlYnVpbGQuX3dkYV9lcnJvcl9tZXNzYWdlICs9IGAke0VPTH0ke2xpbmV9YDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiB4Y29kZWJ1aWxkO1xuICB9XG5cbiAgYXN5bmMgc3RhcnQgKGJ1aWxkT25seSA9IGZhbHNlKSB7XG4gICAgdGhpcy54Y29kZWJ1aWxkID0gYXdhaXQgdGhpcy5jcmVhdGVTdWJQcm9jZXNzKGJ1aWxkT25seSk7XG4gICAgLy8gU3RvcmUgeGNvZGVidWlsZCBtZXNzYWdlXG4gICAgdGhpcy54Y29kZWJ1aWxkLl93ZGFfZXJyb3JfbWVzc2FnZSA9ICcnO1xuXG4gICAgLy8gd3JhcCB0aGUgc3RhcnQgcHJvY2VkdXJlIGluIGEgcHJvbWlzZSBzbyB0aGF0IHdlIGNhbiBjYXRjaCwgYW5kIHJlcG9ydCxcbiAgICAvLyBhbnkgc3RhcnR1cCBlcnJvcnMgdGhhdCBhcmUgdGhyb3duIGFzIGV2ZW50c1xuICAgIHJldHVybiBhd2FpdCBuZXcgQigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB0aGlzLnhjb2RlYnVpbGQub24oJ2V4aXQnLCBhc3luYyAoY29kZSwgc2lnbmFsKSA9PiB7XG4gICAgICAgIGxvZy5lcnJvcihgeGNvZGVidWlsZCBleGl0ZWQgd2l0aCBjb2RlICcke2NvZGV9JyBhbmQgc2lnbmFsICcke3NpZ25hbH0nYCk7XG4gICAgICAgIC8vIHByaW50IG91dCB0aGUgeGNvZGVidWlsZCBmaWxlIGlmIHVzZXJzIGhhdmUgYXNrZWQgZm9yIGl0XG4gICAgICAgIGlmICh0aGlzLnNob3dYY29kZUxvZyAmJiB0aGlzLnhjb2RlYnVpbGQubG9nTG9jYXRpb24pIHtcbiAgICAgICAgICB4Y29kZUxvZy5lcnJvcihgQ29udGVudHMgb2YgeGNvZGVidWlsZCBsb2cgZmlsZSAnJHt0aGlzLnhjb2RlYnVpbGQubG9nTG9jYXRpb259JzpgKTtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgbGV0IGRhdGEgPSBhd2FpdCBmcy5yZWFkRmlsZSh0aGlzLnhjb2RlYnVpbGQubG9nTG9jYXRpb24sICd1dGY4Jyk7XG4gICAgICAgICAgICBmb3IgKGxldCBsaW5lIG9mIGRhdGEuc3BsaXQoJ1xcbicpKSB7XG4gICAgICAgICAgICAgIHhjb2RlTG9nLmVycm9yKGxpbmUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgbG9nLmVycm9yKGBVbmFibGUgdG8gYWNjZXNzIHhjb2RlYnVpbGQgbG9nIGZpbGU6ICcke2Vyci5tZXNzYWdlfSdgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy54Y29kZWJ1aWxkLnByb2Nlc3NFeGl0ZWQgPSB0cnVlO1xuICAgICAgICBpZiAodGhpcy54Y29kZWJ1aWxkLl93ZGFfZXJyb3Jfb2NjdXJyZWQgfHwgKCFzaWduYWwgJiYgY29kZSAhPT0gMCkpIHtcbiAgICAgICAgICByZXR1cm4gcmVqZWN0KG5ldyBFcnJvcihgeGNvZGVidWlsZCBmYWlsZWQgd2l0aCBjb2RlICR7Y29kZX0ke0VPTH1gICtcbiAgICAgICAgICAgIGB4Y29kZWJ1aWxkIGVycm9yIG1lc3NhZ2U6JHtFT0x9JHt0aGlzLnhjb2RlYnVpbGQuX3dkYV9lcnJvcl9tZXNzYWdlfWApKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBpbiB0aGUgY2FzZSBvZiBqdXN0IGJ1aWxkaW5nLCB0aGUgcHJvY2VzcyB3aWxsIGV4aXQgYW5kIHRoYXQgaXMgb3VyIGZpbmlzaFxuICAgICAgICBpZiAoYnVpbGRPbmx5KSB7XG4gICAgICAgICAgcmV0dXJuIHJlc29sdmUoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiAoYXN5bmMgKCkgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGxldCBzdGFydFRpbWUgPSBwcm9jZXNzLmhydGltZSgpO1xuICAgICAgICAgIGF3YWl0IHRoaXMueGNvZGVidWlsZC5zdGFydCh0cnVlKTtcbiAgICAgICAgICBpZiAoIWJ1aWxkT25seSkge1xuICAgICAgICAgICAgbGV0IHN0YXR1cyA9IGF3YWl0IHRoaXMud2FpdEZvclN0YXJ0KHN0YXJ0VGltZSk7XG4gICAgICAgICAgICByZXNvbHZlKHN0YXR1cyk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICBsZXQgbXNnID0gYFVuYWJsZSB0byBzdGFydCBXZWJEcml2ZXJBZ2VudDogJHtlcnJ9YDtcbiAgICAgICAgICBsb2cuZXJyb3IobXNnKTtcbiAgICAgICAgICByZWplY3QobmV3IEVycm9yKG1zZykpO1xuICAgICAgICB9XG4gICAgICB9KSgpO1xuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgd2FpdEZvclN0YXJ0IChzdGFydFRpbWUpIHtcbiAgICAvLyB0cnkgdG8gY29ubmVjdCBvbmNlIGV2ZXJ5IDAuNSBzZWNvbmRzLCB1bnRpbCBgbGF1bmNoVGltZW91dGAgaXMgdXBcbiAgICBsb2cuZGVidWcoYFdhaXRpbmcgdXAgdG8gJHt0aGlzLmxhdW5jaFRpbWVvdXR9bXMgZm9yIFdlYkRyaXZlckFnZW50IHRvIHN0YXJ0YCk7XG4gICAgbGV0IGN1cnJlbnRTdGF0dXMgPSBudWxsO1xuICAgIHRyeSB7XG4gICAgICBsZXQgcmV0cmllcyA9IHBhcnNlSW50KHRoaXMubGF1bmNoVGltZW91dCAvIDUwMCwgMTApO1xuICAgICAgYXdhaXQgcmV0cnlJbnRlcnZhbChyZXRyaWVzLCAxMDAwLCBhc3luYyAoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLnhjb2RlYnVpbGQucHJvY2Vzc0V4aXRlZCkge1xuICAgICAgICAgIC8vIHRoZXJlIGhhcyBiZWVuIGFuIGVycm9yIGVsc2V3aGVyZSBhbmQgd2UgbmVlZCB0byBzaG9ydC1jaXJjdWl0XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHByb3h5VGltZW91dCA9IHRoaXMubm9TZXNzaW9uUHJveHkudGltZW91dDtcbiAgICAgICAgdGhpcy5ub1Nlc3Npb25Qcm94eS50aW1lb3V0ID0gMTAwMDtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjdXJyZW50U3RhdHVzID0gYXdhaXQgdGhpcy5ub1Nlc3Npb25Qcm94eS5jb21tYW5kKCcvc3RhdHVzJywgJ0dFVCcpO1xuICAgICAgICAgIGlmIChjdXJyZW50U3RhdHVzICYmIGN1cnJlbnRTdGF0dXMuaW9zICYmIGN1cnJlbnRTdGF0dXMuaW9zLmlwKSB7XG4gICAgICAgICAgICB0aGlzLmFnZW50VXJsID0gY3VycmVudFN0YXR1cy5pb3MuaXA7XG4gICAgICAgICAgfVxuICAgICAgICAgIGxvZy5kZWJ1ZyhgV2ViRHJpdmVyQWdlbnQgaW5mb3JtYXRpb246YCk7XG4gICAgICAgICAgbG9nLmRlYnVnKEpTT04uc3RyaW5naWZ5KGN1cnJlbnRTdGF0dXMsIG51bGwsIDIpKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmFibGUgdG8gY29ubmVjdCB0byBydW5uaW5nIFdlYkRyaXZlckFnZW50OiAke2Vyci5tZXNzYWdlfWApO1xuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgIHRoaXMubm9TZXNzaW9uUHJveHkudGltZW91dCA9IHByb3h5VGltZW91dDtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGlmICh0aGlzLnhjb2RlYnVpbGQucHJvY2Vzc0V4aXRlZCkge1xuICAgICAgICAvLyB0aGVyZSBoYXMgYmVlbiBhbiBlcnJvciBlbHNld2hlcmUgYW5kIHdlIG5lZWQgdG8gc2hvcnQtY2lyY3VpdFxuICAgICAgICByZXR1cm4gY3VycmVudFN0YXR1cztcbiAgICAgIH1cblxuICAgICAgbGV0IGVuZFRpbWUgPSBwcm9jZXNzLmhydGltZShzdGFydFRpbWUpO1xuICAgICAgLy8gbXVzdCBnZXQgW3MsIG5zXSBhcnJheSBpbnRvIG1zXG4gICAgICBsZXQgc3RhcnR1cFRpbWUgPSBwYXJzZUludCgoZW5kVGltZVswXSAqIDFlOSArIGVuZFRpbWVbMV0pIC8gMWU2LCAxMCk7XG4gICAgICBsb2cuZGVidWcoYFdlYkRyaXZlckFnZW50IHN1Y2Nlc3NmdWxseSBzdGFydGVkIGFmdGVyICR7c3RhcnR1cFRpbWV9bXNgKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIC8vIGF0IHRoaXMgcG9pbnQsIGlmIHdlIGhhdmUgbm90IGhhZCBhbnkgZXJyb3JzIGZyb20geGNvZGUgaXRzZWxmIChyZXBvcnRlZFxuICAgICAgLy8gZWxzZXdoZXJlKSwgd2UgY2FuIGxldCB0aGlzIGdvIHRocm91Z2ggYW5kIHRyeSB0byBjcmVhdGUgdGhlIHNlc3Npb25cbiAgICAgIGxvZy5kZWJ1ZyhlcnIubWVzc2FnZSk7XG4gICAgICBsb2cud2FybihgR2V0dGluZyBzdGF0dXMgb2YgV2ViRHJpdmVyQWdlbnQgb24gZGV2aWNlIHRpbWVkIG91dC4gQ29udGludWluZ2ApO1xuICAgIH1cbiAgICByZXR1cm4gY3VycmVudFN0YXR1cztcbiAgfVxuXG4gIGFzeW5jIHF1aXQgKCkge1xuICAgIGF3YWl0IGtpbGxQcm9jZXNzKCd4Y29kZWJ1aWxkJywgdGhpcy54Y29kZWJ1aWxkKTtcbiAgfVxufVxuXG5leHBvcnQgeyBYY29kZUJ1aWxkIH07XG5leHBvcnQgZGVmYXVsdCBYY29kZUJ1aWxkO1xuIl0sImZpbGUiOiJsaWIvd2RhL3hjb2RlYnVpbGQuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vLi4ifQ==
