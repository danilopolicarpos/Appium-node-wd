"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("source-map-support/register");

var _lodash = _interopRequireDefault(require("lodash"));

var _fs2 = _interopRequireDefault(require("fs"));

var _teen_process = require("teen_process");

var _path = _interopRequireDefault(require("path"));

var _logger = _interopRequireDefault(require("../logger.js"));

var _appiumSupport = require("appium-support");

var _helpers = require("../helpers.js");

const DEFAULT_PRIVATE_KEY = _path.default.resolve(_helpers.rootDir, 'keys', 'testkey.pk8');

const DEFAULT_CERTIFICATE = _path.default.resolve(_helpers.rootDir, 'keys', 'testkey.x509.pem');

const DEFAULT_CERT_DIGEST = 'a40da80a59d170caa950cf15c18c454d47a39b26989d8b640ecd745ba71bf5dc';
const BUNDLETOOL_TUTORIAL = 'https://developer.android.com/studio/command-line/bundletool';
const APKSIGNER_VERIFY_FAIL = 'DOES NOT VERIFY';
let apkSigningMethods = {};

async function patchApksigner(originalPath) {
  const originalContent = await _appiumSupport.fs.readFile(originalPath, 'ascii');
  const patchedContent = originalContent.replace('-Djava.ext.dirs="%frameworkdir%"', '-cp "%frameworkdir%\\*"');

  if (patchedContent === originalContent) {
    return originalPath;
  }

  _logger.default.debug(`Patching '${originalPath}...`);

  const patchedPath = await _appiumSupport.tempDir.path({
    prefix: 'apksigner',
    suffix: '.bat'
  });
  await (0, _appiumSupport.mkdirp)(_path.default.dirname(patchedPath));
  await _appiumSupport.fs.writeFile(patchedPath, patchedContent, 'ascii');
  return patchedPath;
}

apkSigningMethods.executeApksigner = async function executeApksigner(args = []) {
  const apkSigner = await (0, _helpers.getApksignerForOs)(this);

  const originalFolder = _path.default.dirname(apkSigner);

  const getApksignerOutput = async apksignerPath => {
    let binaryPath = apksignerPath;

    if (_appiumSupport.system.isWindows() && _appiumSupport.util.isSubPath(binaryPath, originalFolder)) {
      binaryPath = _path.default.basename(binaryPath);
    }

    const {
      stdout,
      stderr
    } = await (0, _teen_process.exec)(binaryPath, args, {
      cwd: originalFolder
    });

    for (let [name, stream] of [['stdout', stdout], ['stderr', stderr]]) {
      if (!stream) {
        continue;
      }

      if (name === 'stdout') {
        stream = stream.split('\n').filter(line => !line.includes('WARNING:')).join('\n');
      }

      _logger.default.debug(`apksigner ${name}: ${stream}`);
    }

    return stdout;
  };

  _logger.default.debug(`Starting '${apkSigner}' with args '${JSON.stringify(args)}'`);

  try {
    return await getApksignerOutput(apkSigner);
  } catch (err) {
    _logger.default.warn(`Got an error during apksigner execution: ${err.message}`);

    for (const [name, stream] of [['stdout', err.stdout], ['stderr', err.stderr]]) {
      if (stream) {
        _logger.default.warn(`apksigner ${name}: ${stream}`);
      }
    }

    if (_appiumSupport.system.isWindows()) {
      const patchedApksigner = await patchApksigner(apkSigner);

      if (patchedApksigner !== apkSigner) {
        try {
          return await getApksignerOutput(patchedApksigner);
        } finally {
          await _appiumSupport.fs.unlink(patchedApksigner);
        }
      }
    }

    throw err;
  }
};

apkSigningMethods.signWithDefaultCert = async function signWithDefaultCert(apk) {
  _logger.default.debug(`Signing '${apk}' with default cert`);

  if (!(await _appiumSupport.fs.exists(apk))) {
    throw new Error(`${apk} file doesn't exist.`);
  }

  try {
    const args = ['sign', '--key', DEFAULT_PRIVATE_KEY, '--cert', DEFAULT_CERTIFICATE, apk];
    await this.executeApksigner(args);
  } catch (err) {
    _logger.default.warn(`Cannot use apksigner tool for signing. Defaulting to sign.jar. ` + `Original error: ${err.message}` + (err.stderr ? `; StdErr: ${err.stderr}` : ''));

    const java = (0, _helpers.getJavaForOs)();

    const signPath = _path.default.resolve(this.helperJarPath, 'sign.jar');

    _logger.default.debug('Resigning apk.');

    try {
      await (0, _teen_process.exec)(java, ['-jar', signPath, apk, '--override']);
    } catch (e) {
      throw new Error(`Could not sign with default certificate. Original error ${e.message}`);
    }
  }
};

apkSigningMethods.signWithCustomCert = async function signWithCustomCert(apk) {
  _logger.default.debug(`Signing '${apk}' with custom cert`);

  if (!(await _appiumSupport.fs.exists(this.keystorePath))) {
    throw new Error(`Keystore: ${this.keystorePath} doesn't exist.`);
  }

  if (!(await _appiumSupport.fs.exists(apk))) {
    throw new Error(`'${apk}' doesn't exist.`);
  }

  try {
    const args = ['sign', '--ks', this.keystorePath, '--ks-key-alias', this.keyAlias, '--ks-pass', `pass:${this.keystorePassword}`, '--key-pass', `pass:${this.keyPassword}`, apk];
    await this.executeApksigner(args);
  } catch (err) {
    _logger.default.warn(`Cannot use apksigner tool for signing. Defaulting to jarsigner. ` + `Original error: ${err.message}`);

    try {
      _logger.default.debug('Unsigning apk.');

      await (0, _teen_process.exec)((0, _helpers.getJavaForOs)(), ['-jar', _path.default.resolve(this.helperJarPath, 'unsign.jar'), apk]);

      _logger.default.debug('Signing apk.');

      const jarsigner = _path.default.resolve((0, _helpers.getJavaHome)(), 'bin', `jarsigner${_appiumSupport.system.isWindows() ? '.exe' : ''}`);

      await (0, _teen_process.exec)(jarsigner, ['-sigalg', 'MD5withRSA', '-digestalg', 'SHA1', '-keystore', this.keystorePath, '-storepass', this.keystorePassword, '-keypass', this.keyPassword, apk, this.keyAlias]);
    } catch (e) {
      throw new Error(`Could not sign with custom certificate. Original error ${e.message}`);
    }
  }
};

apkSigningMethods.sign = async function sign(appPath) {
  if (appPath.endsWith(_helpers.APKS_EXTENSION)) {
    let message = 'Signing of .apks-files is not supported. ';

    if (this.useKeystore) {
      message += 'Consider manual application bundle signing with the custom keystore ' + `like it is described at ${BUNDLETOOL_TUTORIAL}`;
    } else {
      message += `Consider manual application bundle signing with the key at '${DEFAULT_PRIVATE_KEY}' ` + `and the certificate at '${DEFAULT_CERTIFICATE}'. Read ${BUNDLETOOL_TUTORIAL} for more details.`;
    }

    _logger.default.warn(message);

    return;
  }

  let apksignerFound = true;

  try {
    await (0, _helpers.getApksignerForOs)(this);
  } catch (err) {
    apksignerFound = false;
  }

  if (apksignerFound) {
    await this.zipAlignApk(appPath);
  }

  if (this.useKeystore) {
    await this.signWithCustomCert(appPath);
  } else {
    await this.signWithDefaultCert(appPath);
  }

  if (!apksignerFound) {
    await this.zipAlignApk(appPath);
  }
};

apkSigningMethods.zipAlignApk = async function zipAlignApk(apk) {
  await this.initZipAlign();

  try {
    await (0, _teen_process.exec)(this.binaries.zipalign, ['-c', '4', apk]);

    _logger.default.debug(`${apk}' is already zip-aligned. Doing nothing`);

    return false;
  } catch (e) {
    _logger.default.debug(`'${apk}' is not zip-aligned. Aligning`);
  }

  try {
    await _appiumSupport.fs.access(apk, _fs2.default.W_OK);
  } catch (e) {
    throw new Error(`The file at '${apk}' is not writeable. ` + `Please grant write permissions to this file or to its parent folder '${_path.default.dirname(apk)}' ` + `for the Appium process, so it can zip-align the file`);
  }

  const alignedApk = await _appiumSupport.tempDir.path({
    prefix: 'appium',
    suffix: '.tmp'
  });
  await (0, _appiumSupport.mkdirp)(_path.default.dirname(alignedApk));

  try {
    await (0, _teen_process.exec)(this.binaries.zipalign, ['-f', '4', apk, alignedApk]);
    await _appiumSupport.fs.mv(alignedApk, apk, {
      mkdirp: true
    });
    return true;
  } catch (e) {
    if (await _appiumSupport.fs.exists(alignedApk)) {
      await _appiumSupport.fs.unlink(alignedApk);
    }

    throw new Error(`zipAlignApk failed. Original error: ${e.message}. Stdout: '${e.stdout}'; Stderr: '${e.stderr}'`);
  }
};

apkSigningMethods.checkApkCert = async function checkApkCert(appPath, pkg) {
  _logger.default.debug(`Checking app cert for ${appPath}`);

  if (!(await _appiumSupport.fs.exists(appPath))) {
    _logger.default.debug(`'${appPath}' does not exist`);

    return false;
  }

  if (this.useKeystore) {
    return await this.checkCustomApkCert(appPath, pkg);
  }

  if (_path.default.extname(appPath) === _helpers.APKS_EXTENSION) {
    appPath = await this.extractBaseApk(appPath);
  }

  try {
    await (0, _helpers.getApksignerForOs)(this);
    const output = await this.executeApksigner(['verify', '--print-certs', appPath]);

    if (!_lodash.default.includes(output, DEFAULT_CERT_DIGEST)) {
      _logger.default.debug(`'${appPath}' is signed with non-default certificate`);

      return false;
    }

    _logger.default.debug(`'${appPath}' is already signed.`);

    return true;
  } catch (err) {
    if (err.stderr && err.stderr.includes(APKSIGNER_VERIFY_FAIL)) {
      _logger.default.debug(`'${appPath}' is not signed with debug cert`);

      return false;
    }

    _logger.default.warn(`Cannot use apksigner tool for signature verification. ` + `Original error: ${err.message}`);
  }

  try {
    _logger.default.debug(`Defaulting to verify.jar`);

    await (0, _teen_process.exec)((0, _helpers.getJavaForOs)(), ['-jar', _path.default.resolve(this.helperJarPath, 'verify.jar'), appPath]);

    _logger.default.debug(`'${appPath}' is already signed.`);

    return true;
  } catch (err) {
    _logger.default.debug(`'${appPath}' is not signed with debug cert${err.stderr ? `: ${err.stderr}` : ''}`);

    return false;
  }
};

apkSigningMethods.checkCustomApkCert = async function checkCustomApkCert(appPath, pkg) {
  _logger.default.debug(`Checking custom app cert for ${appPath}`);

  if (_path.default.extname(appPath) === _helpers.APKS_EXTENSION) {
    appPath = await this.extractBaseApk(appPath);
  }

  let h = 'a-fA-F0-9';
  let md5Str = [`.*MD5.*((?:[${h}]{2}:){15}[${h}]{2})`];
  let md5 = new RegExp(md5Str, 'mi');

  let keytool = _path.default.resolve((0, _helpers.getJavaHome)(), 'bin', `keytool${_appiumSupport.system.isWindows() ? '.exe' : ''}`);

  let keystoreHash = await this.getKeystoreMd5(keytool, md5);
  return await this.checkApkKeystoreMatch(keytool, md5, keystoreHash, pkg, appPath);
};

apkSigningMethods.getKeystoreMd5 = async function getKeystoreMd5(keytool, md5re) {
  _logger.default.debug('Printing keystore md5.');

  try {
    let {
      stdout
    } = await (0, _teen_process.exec)(keytool, ['-v', '-list', '-alias', this.keyAlias, '-keystore', this.keystorePath, '-storepass', this.keystorePassword]);
    let keystoreHash = md5re.exec(stdout);
    keystoreHash = keystoreHash ? keystoreHash[1] : null;

    _logger.default.debug(`Keystore MD5: ${keystoreHash}`);

    return keystoreHash;
  } catch (e) {
    throw new Error(`getKeystoreMd5 failed. Original error: ${e.message}`);
  }
};

apkSigningMethods.checkApkKeystoreMatch = async function checkApkKeystoreMatch(keytool, md5re, keystoreHash, pkg, apk) {
  let entryHash = null;
  let rsa = /^META-INF\/.*\.[rR][sS][aA]$/;
  let foundKeystoreMatch = false;
  await _appiumSupport.zip.readEntries(apk, async ({
    entry,
    extractEntryTo
  }) => {
    entry = entry.fileName;

    if (!rsa.test(entry)) {
      return;
    }

    _logger.default.debug(`Entry: ${entry}`);

    let entryPath = _path.default.join(this.tmpDir, pkg, 'cert');

    _logger.default.debug(`entryPath: ${entryPath}`);

    let entryFile = _path.default.join(entryPath, entry);

    _logger.default.debug(`entryFile: ${entryFile}`);

    await _appiumSupport.fs.rimraf(entryPath);
    await extractEntryTo(entryPath);

    _logger.default.debug('extracted!');

    _logger.default.debug('Printing apk md5.');

    let {
      stdout
    } = await (0, _teen_process.exec)(keytool, ['-v', '-printcert', '-file', entryFile]);
    entryHash = md5re.exec(stdout);
    entryHash = entryHash ? entryHash[1] : null;

    _logger.default.debug(`entryHash MD5: ${entryHash}`);

    _logger.default.debug(`keystore MD5: ${keystoreHash}`);

    let matchesKeystore = entryHash && entryHash === keystoreHash;

    _logger.default.debug(`Matches keystore? ${matchesKeystore}`);

    if (matchesKeystore) {
      foundKeystoreMatch = true;
      return false;
    }
  });
  return foundKeystoreMatch;
};

var _default = apkSigningMethods;
exports.default = _default;require('source-map-support').install();


//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi90b29scy9hcGstc2lnbmluZy5qcyJdLCJuYW1lcyI6WyJERUZBVUxUX1BSSVZBVEVfS0VZIiwicGF0aCIsInJlc29sdmUiLCJyb290RGlyIiwiREVGQVVMVF9DRVJUSUZJQ0FURSIsIkRFRkFVTFRfQ0VSVF9ESUdFU1QiLCJCVU5ETEVUT09MX1RVVE9SSUFMIiwiQVBLU0lHTkVSX1ZFUklGWV9GQUlMIiwiYXBrU2lnbmluZ01ldGhvZHMiLCJwYXRjaEFwa3NpZ25lciIsIm9yaWdpbmFsUGF0aCIsIm9yaWdpbmFsQ29udGVudCIsImZzIiwicmVhZEZpbGUiLCJwYXRjaGVkQ29udGVudCIsInJlcGxhY2UiLCJsb2ciLCJkZWJ1ZyIsInBhdGNoZWRQYXRoIiwidGVtcERpciIsInByZWZpeCIsInN1ZmZpeCIsImRpcm5hbWUiLCJ3cml0ZUZpbGUiLCJleGVjdXRlQXBrc2lnbmVyIiwiYXJncyIsImFwa1NpZ25lciIsIm9yaWdpbmFsRm9sZGVyIiwiZ2V0QXBrc2lnbmVyT3V0cHV0IiwiYXBrc2lnbmVyUGF0aCIsImJpbmFyeVBhdGgiLCJzeXN0ZW0iLCJpc1dpbmRvd3MiLCJ1dGlsIiwiaXNTdWJQYXRoIiwiYmFzZW5hbWUiLCJzdGRvdXQiLCJzdGRlcnIiLCJjd2QiLCJuYW1lIiwic3RyZWFtIiwic3BsaXQiLCJmaWx0ZXIiLCJsaW5lIiwiaW5jbHVkZXMiLCJqb2luIiwiSlNPTiIsInN0cmluZ2lmeSIsImVyciIsIndhcm4iLCJtZXNzYWdlIiwicGF0Y2hlZEFwa3NpZ25lciIsInVubGluayIsInNpZ25XaXRoRGVmYXVsdENlcnQiLCJhcGsiLCJleGlzdHMiLCJFcnJvciIsImphdmEiLCJzaWduUGF0aCIsImhlbHBlckphclBhdGgiLCJlIiwic2lnbldpdGhDdXN0b21DZXJ0Iiwia2V5c3RvcmVQYXRoIiwia2V5QWxpYXMiLCJrZXlzdG9yZVBhc3N3b3JkIiwia2V5UGFzc3dvcmQiLCJqYXJzaWduZXIiLCJzaWduIiwiYXBwUGF0aCIsImVuZHNXaXRoIiwiQVBLU19FWFRFTlNJT04iLCJ1c2VLZXlzdG9yZSIsImFwa3NpZ25lckZvdW5kIiwiemlwQWxpZ25BcGsiLCJpbml0WmlwQWxpZ24iLCJiaW5hcmllcyIsInppcGFsaWduIiwiYWNjZXNzIiwiX2ZzIiwiV19PSyIsImFsaWduZWRBcGsiLCJtdiIsIm1rZGlycCIsImNoZWNrQXBrQ2VydCIsInBrZyIsImNoZWNrQ3VzdG9tQXBrQ2VydCIsImV4dG5hbWUiLCJleHRyYWN0QmFzZUFwayIsIm91dHB1dCIsIl8iLCJoIiwibWQ1U3RyIiwibWQ1IiwiUmVnRXhwIiwia2V5dG9vbCIsImtleXN0b3JlSGFzaCIsImdldEtleXN0b3JlTWQ1IiwiY2hlY2tBcGtLZXlzdG9yZU1hdGNoIiwibWQ1cmUiLCJleGVjIiwiZW50cnlIYXNoIiwicnNhIiwiZm91bmRLZXlzdG9yZU1hdGNoIiwiemlwIiwicmVhZEVudHJpZXMiLCJlbnRyeSIsImV4dHJhY3RFbnRyeVRvIiwiZmlsZU5hbWUiLCJ0ZXN0IiwiZW50cnlQYXRoIiwidG1wRGlyIiwiZW50cnlGaWxlIiwicmltcmFmIiwibWF0Y2hlc0tleXN0b3JlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUVBLE1BQU1BLG1CQUFtQixHQUFHQyxjQUFLQyxPQUFMLENBQWFDLGdCQUFiLEVBQXNCLE1BQXRCLEVBQThCLGFBQTlCLENBQTVCOztBQUNBLE1BQU1DLG1CQUFtQixHQUFHSCxjQUFLQyxPQUFMLENBQWFDLGdCQUFiLEVBQXNCLE1BQXRCLEVBQThCLGtCQUE5QixDQUE1Qjs7QUFDQSxNQUFNRSxtQkFBbUIsR0FBRyxrRUFBNUI7QUFDQSxNQUFNQyxtQkFBbUIsR0FBRyw4REFBNUI7QUFDQSxNQUFNQyxxQkFBcUIsR0FBRyxpQkFBOUI7QUFFQSxJQUFJQyxpQkFBaUIsR0FBRyxFQUF4Qjs7QUFVQSxlQUFlQyxjQUFmLENBQStCQyxZQUEvQixFQUE2QztBQUMzQyxRQUFNQyxlQUFlLEdB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LFFBQVcsTUFBTSx3QkFBSzBELE9BQUwsRUFBYyxDQUFDLElBQUQsRUFBTyxZQUFQLEVBQXFCLE9BQXJCLEVBQThCaUIsU0FBOUIsQ0FBZCxDQUFyQjtBQUNBWCxJQUFBQSxTQUFTLEdBQUdGLEtBQUssQ0FBQ0MsSUFBTixDQUFXL0QsTUFBWCxDQUFaO0FBQ0FnRSxJQUFBQSxTQUFTLEdBQUdBLFNBQVMsR0FBR0EsU0FBUyxDQUFDLENBQUQsQ0FBWixHQUFrQixJQUF2Qzs7QUFDQXBGLG9CQUFJQyxLQUFKLENBQVcsa0JBQWlCbUYsU0FBVSxFQUF0Qzs7QUFDQXBGLG9CQUFJQyxLQUFKLENBQVcsaUJBQWdCOEUsWUFBYSxFQUF4Qzs7QUFDQSxRQUFJa0IsZUFBZSxHQUFHYixTQUFTLElBQUlBLFNBQVMsS0FBS0wsWUFBakQ7O0FBQ0EvRSxvQkFBSUMsS0FBSixDQUFXLHFCQUFvQmdHLGVBQWdCLEVBQS9DOztBQUdBLFFBQUlBLGVBQUosRUFBcUI7QUFDbkJYLE1BQUFBLGtCQUFrQixHQUFHLElBQXJCO0FBQ0EsYUFBTyxLQUFQO0FBQ0Q7QUFDRixHQTlCSyxDQUFOO0FBK0JBLFNBQU9BLGtCQUFQO0FBQ0QsQ0F0Q0Q7O2VBd0NlOUYsaUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgXyBmcm9tICdsb2Rhc2gnO1xuaW1wb3J0IF9mcyBmcm9tICdmcyc7XG5pbXBvcnQgeyBleGVjIH0gZnJvbSAndGVlbl9wcm9jZXNzJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IGxvZyBmcm9tICcuLi9sb2dnZXIuanMnO1xuaW1wb3J0IHsgdGVtcERpciwgc3lzdGVtLCBta2RpcnAsIGZzLCB6aXAsIHV0aWwgfSBmcm9tICdhcHBpdW0tc3VwcG9ydCc7XG5pbXBvcnQgeyBnZXRKYXZhRm9yT3MsIGdldEFwa3NpZ25lckZvck9zLCBnZXRKYXZhSG9tZSwgcm9vdERpciwgQVBLU19FWFRFTlNJT04gfSBmcm9tICcuLi9oZWxwZXJzLmpzJztcblxuY29uc3QgREVGQVVMVF9QUklWQVRFX0tFWSA9IHBhdGgucmVzb2x2ZShyb290RGlyLCAna2V5cycsICd0ZXN0a2V5LnBrOCcpO1xuY29uc3QgREVGQVVMVF9DRVJUSUZJQ0FURSA9IHBhdGgucmVzb2x2ZShyb290RGlyLCAna2V5cycsICd0ZXN0a2V5Lng1MDkucGVtJyk7XG5jb25zdCBERUZBVUxUX0NFUlRfRElHRVNUID0gJ2E0MGRhODBhNTlkMTcwY2FhOTUwY2YxNWMxOGM0NTRkNDdhMzliMjY5ODlkOGI2NDBlY2Q3NDViYTcxYmY1ZGMnO1xuY29uc3QgQlVORExFVE9PTF9UVVRPUklBTCA9ICdodHRwczovL2RldmVsb3Blci5hbmRyb2lkLmNvbS9zdHVkaW8vY29tbWFuZC1saW5lL2J1bmRsZXRvb2wnO1xuY29uc3QgQVBLU0lHTkVSX1ZFUklGWV9GQUlMID0gJ0RPRVMgTk9UIFZFUklGWSc7XG5cbmxldCBhcGtTaWduaW5nTWV0aG9kcyA9IHt9O1xuXG4vKipcbiAqIEFwcGxpZXMgdGhlIHBhdGNoLCB3aGljaCB3b3JrYXJvdW5kcyctRGphdmEuZXh0LmRpcnMgaXMgbm90IHN1cHBvcnRlZC4gVXNlIC1jbGFzc3BhdGggaW5zdGVhZC4nXG4gKiBlcnJvciBvbiBXaW5kb3dzIGJ5IGNyZWF0aW5nIGEgdGVtcG9yYXJ5IHBhdGNoZWQgY29weSBvZiB0aGUgb3JpZ2luYWwgYXBrc2lnbmVyIHNjcmlwdC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gb3JpZ2luYWxQYXRoIC0gVGhlIG9yaWdpbmFsIHBhdGggdG8gYXBrc2lnbmVyIHRvb2xcbiAqIEByZXR1cm5zIHtzdHJpbmd9IFRoZSBmdWxsIHBhdGggdG8gdGhlIHBhdGNoZWQgc2NyaXB0IG9yIHRoZSBzYW1lIHBhdGggaWYgdGhlcmUgaXNcbiAqICAgICAgICAgICAgICAgICAgIG5vIG5lZWQgdG8gcGF0Y2ggdGhlIG9yaWdpbmFsIGZpbGUuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIHBhdGNoQXBrc2lnbmVyIChvcmlnaW5hbFBhdGgpIHtcbiAgY29uc3Qgb3JpZ2luYWxDb250ZW50ID0gYXdhaXQgZnMucmVhZEZpbGUob3JpZ2luYWxQYXRoLCAnYXNjaWknKTtcbiAgY29uc3QgcGF0Y2hlZENvbnRlbnQgPSBvcmlnaW5hbENvbnRlbnQucmVwbGFjZSgnLURqYXZhLmV4dC5kaXJzPVwiJWZyYW1ld29ya2RpciVcIicsXG4gICAgJy1jcCBcIiVmcmFtZXdvcmtkaXIlXFxcXCpcIicpO1xuICBpZiAocGF0Y2hlZENvbnRlbnQgPT09IG9yaWdpbmFsQ29udGVudCkge1xuICAgIHJldHVybiBvcmlnaW5hbFBhdGg7XG4gIH1cbiAgbG9nLmRlYnVnKGBQYXRjaGluZyAnJHtvcmlnaW5hbFBhdGh9Li4uYCk7XG4gIGNvbnN0IHBhdGNoZWRQYXRoID0gYXdhaXQgdGVtcERpci5wYXRoKHtwcmVmaXg6ICdhcGtzaWduZXInLCBzdWZmaXg6ICcuYmF0J30pO1xuICBhd2FpdCBta2RpcnAocGF0aC5kaXJuYW1lKHBhdGNoZWRQYXRoKSk7XG4gIGF3YWl0IGZzLndyaXRlRmlsZShwYXRjaGVkUGF0aCwgcGF0Y2hlZENvbnRlbnQsICdhc2NpaScpO1xuICByZXR1cm4gcGF0Y2hlZFBhdGg7XG59XG5cbi8qKlxuICogRXhlY3V0ZSBhcGtzaWduZXIgdXRpbGl0eSB3aXRoIGdpdmVuIGFyZ3VtZW50cy5cbiAqXG4gKiBAcGFyYW0gez9BcnJheTxTdHJpbmc+fSBhcmdzIC0gVGhlIGxpc3Qgb2YgdG9vbCBhcmd1bWVudHMuXG4gKiBAcmV0dXJuIHtzdHJpbmd9IC0gQ29tbWFuZCBzdGRvdXRcbiAqIEB0aHJvd3Mge0Vycm9yfSBJZiBhcGtzaWduZXIgYmluYXJ5IGlzIG5vdCBwcmVzZW50IG9uIHRoZSBsb2NhbCBmaWxlIHN5c3RlbVxuICogICAgICAgICAgICAgICAgIG9yIHRoZSByZXR1cm4gY29kZSBpcyBub3QgZXF1YWwgdG8gemVyby5cbiAqL1xuYXBrU2lnbmluZ01ldGhvZHMuZXhlY3V0ZUFwa3NpZ25lciA9IGFzeW5jIGZ1bmN0aW9uIGV4ZWN1dGVBcGtzaWduZXIgKGFyZ3MgPSBbXSkge1xuICBjb25zdCBhcGtTaWduZXIgPSBhd2FpdCBnZXRBcGtzaWduZXJGb3JPcyh0aGlzKTtcbiAgY29uc3Qgb3JpZ2luYWxGb2xkZXIgPSBwYXRoLmRpcm5hbWUoYXBrU2lnbmVyKTtcbiAgY29uc3QgZ2V0QXBrc2lnbmVyT3V0cHV0ID0gYXN5bmMgKGFwa3NpZ25lclBhdGgpID0+IHtcbiAgICBsZXQgYmluYXJ5UGF0aCA9IGFwa3NpZ25lclBhdGg7XG4gICAgaWYgKHN5c3RlbS5pc1dpbmRvd3MoKSAmJiB1dGlsLmlzU3ViUGF0aChiaW5hcnlQYXRoLCBvcmlnaW5hbEZvbGRlcikpIHtcbiAgICAgIC8vIFdvcmthcm91bmQgZm9yIGh0dHBzOi8vZ2l0aHViLmNvbS9ub2RlanMvbm9kZS12MC54LWFyY2hpdmUvaXNzdWVzLzI1ODk1XG4gICAgICBiaW5hcnlQYXRoID0gcGF0aC5iYXNlbmFtZShiaW5hcnlQYXRoKTtcbiAgICB9XG4gICAgY29uc3Qge3N0ZG91dCwgc3RkZXJyfSA9IGF3YWl0IGV4ZWMoYmluYXJ5UGF0aCwgYXJncywge1xuICAgICAgY3dkOiBvcmlnaW5hbEZvbGRlclxuICAgIH0pO1xuICAgIGZvciAobGV0IFtuYW1lLCBzdHJlYW1dIG9mIFtbJ3N0ZG91dCcsIHN0ZG91dF0sIFsnc3RkZXJyJywgc3RkZXJyXV0pIHtcbiAgICAgIGlmICghc3RyZWFtKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAobmFtZSA9PT0gJ3N0ZG91dCcpIHtcbiAgICAgICAgLy8gTWFrZSB0aGUgb3V0cHV0IGxlc3MgdGFsa2F0aXZlXG4gICAgICAgIHN0cmVhbSA9IHN0cmVhbS5zcGxpdCgnXFxuJylcbiAgICAgICAgICAuZmlsdGVyKChsaW5lKSA9PiAhbGluZS5pbmNsdWRlcygnV0FSTklORzonKSlcbiAgICAgICAgICAuam9pbignXFxuJyk7XG4gICAgICB9XG4gICAgICBsb2cuZGVidWcoYGFwa3NpZ25lciAke25hbWV9OiAke3N0cmVhbX1gKTtcbiAgICB9XG4gICAgcmV0dXJuIHN0ZG91dDtcbiAgfTtcbiAgbG9nLmRlYnVnKGBTdGFydGluZyAnJHthcGtTaWduZXJ9JyB3aXRoIGFyZ3MgJyR7SlNPTi5zdHJpbmdpZnkoYXJncyl9J2ApO1xuICB0cnkge1xuICAgIHJldHVybiBhd2FpdCBnZXRBcGtzaWduZXJPdXRwdXQoYXBrU2lnbmVyKTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgbG9nLndhcm4oYEdvdCBhbiBlcnJvciBkdXJpbmcgYXBrc2lnbmVyIGV4ZWN1dGlvbjogJHtlcnIubWVzc2FnZX1gKTtcbiAgICBmb3IgKGNvbnN0IFtuYW1lLCBzdHJlYW1dIG9mIFtbJ3N0ZG91dCcsIGVyci5zdGRvdXRdLCBbJ3N0ZGVycicsIGVyci5zdGRlcnJdXSkge1xuICAgICAgaWYgKHN0cmVhbSkge1xuICAgICAgICBsb2cud2FybihgYXBrc2lnbmVyICR7bmFtZX06ICR7c3RyZWFtfWApO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoc3lzdGVtLmlzV2luZG93cygpKSB7XG4gICAgICBjb25zdCBwYXRjaGVkQXBrc2lnbmVyID0gYXdhaXQgcGF0Y2hBcGtzaWduZXIoYXBrU2lnbmVyKTtcbiAgICAgIGlmIChwYXRjaGVkQXBrc2lnbmVyICE9PSBhcGtTaWduZXIpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICByZXR1cm4gYXdhaXQgZ2V0QXBrc2lnbmVyT3V0cHV0KHBhdGNoZWRBcGtzaWduZXIpO1xuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgIGF3YWl0IGZzLnVubGluayhwYXRjaGVkQXBrc2lnbmVyKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICB0aHJvdyBlcnI7XG4gIH1cbn07XG5cbi8qKlxuICogKFJlKXNpZ24gdGhlIGdpdmVuIGFwayBmaWxlIG9uIHRoZSBsb2NhbCBmaWxlIHN5c3RlbSB3aXRoIHRoZSBkZWZhdWx0IGNlcnRpZmljYXRlLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBhcGsgLSBUaGUgZnVsbCBwYXRoIHRvIHRoZSBsb2NhbCBhcGsgZmlsZS5cbiAqIEB0aHJvd3Mge0Vycm9yfSBJZiBzaWduaW5nIGZhaWxzLlxuICovXG5hcGtTaWduaW5nTWV0aG9kcy5zaWduV2l0aERlZmF1bHRDZXJ0ID0gYXN5bmMgZnVuY3Rpb24gc2lnbldpdGhEZWZhdWx0Q2VydCAoYXBrKSB7XG4gIGxvZy5kZWJ1ZyhgU2lnbmluZyAnJHthcGt9JyB3aXRoIGRlZmF1bHQgY2VydGApO1xuICBpZiAoIShhd2FpdCBmcy5leGlzdHMoYXBrKSkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYCR7YXBrfSBmaWxlIGRvZXNuJ3QgZXhpc3QuYCk7XG4gIH1cblxuICB0cnkge1xuICAgIGNvbnN0IGFyZ3MgPSBbJ3NpZ24nLFxuICAgICAgJy0ta2V5JywgREVGQVVMVF9QUklWQVRFX0tFWSxcbiAgICAgICctLWNlcnQnLCBERUZBVUxUX0NFUlRJRklDQVRFLFxuICAgICAgYXBrXTtcbiAgICBhd2FpdCB0aGlzLmV4ZWN1dGVBcGtzaWduZXIoYXJncyk7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGxvZy53YXJuKGBDYW5ub3QgdXNlIGFwa3NpZ25lciB0b29sIGZvciBzaWduaW5nLiBEZWZhdWx0aW5nIHRvIHNpZ24uamFyLiBgICtcbiAgICAgIGBPcmlnaW5hbCBlcnJvcjogJHtlcnIubWVzc2FnZX1gICsgKGVyci5zdGRlcnIgPyBgOyBTdGRFcnI6ICR7ZXJyLnN0ZGVycn1gIDogJycpKTtcbiAgICBjb25zdCBqYXZhID0gZ2V0SmF2YUZvck9zKCk7XG4gICAgY29uc3Qgc2lnblBhdGggPSBwYXRoLnJlc29sdmUodGhpcy5oZWxwZXJKYXJQYXRoLCAnc2lnbi5qYXInKTtcbiAgICBsb2cuZGVidWcoJ1Jlc2lnbmluZyBhcGsuJyk7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IGV4ZWMoamF2YSwgWyctamFyJywgc2lnblBhdGgsIGFwaywgJy0tb3ZlcnJpZGUnXSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDb3VsZCBub3Qgc2lnbiB3aXRoIGRlZmF1bHQgY2VydGlmaWNhdGUuIE9yaWdpbmFsIGVycm9yICR7ZS5tZXNzYWdlfWApO1xuICAgIH1cbiAgfVxufTtcblxuLyoqXG4gKiAoUmUpc2lnbiB0aGUgZ2l2ZW4gYXBrIGZpbGUgb24gdGhlIGxvY2FsIGZpbGUgc3lzdGVtIHdpdGggYSBjdXN0b20gY2VydGlmaWNhdGUuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGFwayAtIFRoZSBmdWxsIHBhdGggdG8gdGhlIGxvY2FsIGFwayBmaWxlLlxuICogQHRocm93cyB7RXJyb3J9IElmIHNpZ25pbmcgZmFpbHMuXG4gKi9cbmFwa1NpZ25pbmdNZXRob2RzLnNpZ25XaXRoQ3VzdG9tQ2VydCA9IGFzeW5jIGZ1bmN0aW9uIHNpZ25XaXRoQ3VzdG9tQ2VydCAoYXBrKSB7XG4gIGxvZy5kZWJ1ZyhgU2lnbmluZyAnJHthcGt9JyB3aXRoIGN1c3RvbSBjZXJ0YCk7XG4gIGlmICghKGF3YWl0IGZzLmV4aXN0cyh0aGlzLmtleXN0b3JlUGF0aCkpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBLZXlzdG9yZTogJHt0aGlzLmtleXN0b3JlUGF0aH0gZG9lc24ndCBleGlzdC5gKTtcbiAgfVxuICBpZiAoIShhd2FpdCBmcy5leGlzdHMoYXBrKSkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYCcke2Fwa30nIGRvZXNuJ3QgZXhpc3QuYCk7XG4gIH1cblxuICB0cnkge1xuICAgIGNvbnN0IGFyZ3MgPSBbJ3NpZ24nLFxuICAgICAgJy0ta3MnLCB0aGlzLmtleXN0b3JlUGF0aCxcbiAgICAgICctLWtzLWtleS1hbGlhcycsIHRoaXMua2V5QWxpYXMsXG4gICAgICAnLS1rcy1wYXNzJywgYHBhc3M6JHt0aGlzLmtleXN0b3JlUGFzc3dvcmR9YCxcbiAgICAgICctLWtleS1wYXNzJywgYHBhc3M6JHt0aGlzLmtleVBhc3N3b3JkfWAsXG4gICAgICBhcGtdO1xuICAgIGF3YWl0IHRoaXMuZXhlY3V0ZUFwa3NpZ25lcihhcmdzKTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgbG9nLndhcm4oYENhbm5vdCB1c2UgYXBrc2lnbmVyIHRvb2wgZm9yIHNpZ25pbmcuIERlZmF1bHRpbmcgdG8gamFyc2lnbmVyLiBgICtcbiAgICAgIGBPcmlnaW5hbCBlcnJvcjogJHtlcnIubWVzc2FnZX1gKTtcbiAgICB0cnkge1xuICAgICAgbG9nLmRlYnVnKCdVbnNpZ25pbmcgYXBrLicpO1xuICAgICAgYXdhaXQgZXhlYyhnZXRKYXZhRm9yT3MoKSwgWyctamFyJywgcGF0aC5yZXNvbHZlKHRoaXMuaGVscGVySmFyUGF0aCwgJ3Vuc2lnbi5qYXInKSwgYXBrXSk7XG4gICAgICBsb2cuZGVidWcoJ1NpZ25pbmcgYXBrLicpO1xuICAgICAgY29uc3QgamFyc2lnbmVyID0gcGF0aC5yZXNvbHZlKGdldEphdmFIb21lKCksICdiaW4nLCBgamFyc2lnbmVyJHtzeXN0ZW0uaXNXaW5kb3dzKCkgPyAnLmV4ZScgOiAnJ31gKTtcbiAgICAgIGF3YWl0IGV4ZWMoamFyc2lnbmVyLCBbJy1zaWdhbGcnLCAnTUQ1d2l0aFJTQScsICctZGlnZXN0YWxnJywgJ1NIQTEnLFxuICAgICAgICAnLWtleXN0b3JlJywgdGhpcy5rZXlzdG9yZVBhdGgsICctc3RvcmVwYXNzJywgdGhpcy5rZXlzdG9yZVBhc3N3b3JkLFxuICAgICAgICAnLWtleXBhc3MnLCB0aGlzLmtleVBhc3N3b3JkLCBhcGssIHRoaXMua2V5QWxpYXNdKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYENvdWxkIG5vdCBzaWduIHdpdGggY3VzdG9tIGNlcnRpZmljYXRlLiBPcmlnaW5hbCBlcnJvciAke2UubWVzc2FnZX1gKTtcbiAgICB9XG4gIH1cbn07XG5cbi8qKlxuICogKFJlKXNpZ24gdGhlIGdpdmVuIGFwayBmaWxlIG9uIHRoZSBsb2NhbCBmaWxlIHN5c3RlbSB3aXRoIGVpdGhlclxuICogY3VzdG9tIG9yIGRlZmF1bHQgY2VydGlmaWNhdGUgYmFzZWQgb24gX3RoaXMudXNlS2V5c3RvcmVfIHByb3BlcnR5IHZhbHVlXG4gKiBhbmQgWmlwLWFsaWducyBpdCBhZnRlciBzaWduaW5nLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBhcHBQYXRoIC0gVGhlIGZ1bGwgcGF0aCB0byB0aGUgbG9jYWwgLmFwayhzKSBmaWxlLlxuICogQHRocm93cyB7RXJyb3J9IElmIHNpZ25pbmcgZmFpbHMuXG4gKi9cbmFwa1NpZ25pbmdNZXRob2RzLnNpZ24gPSBhc3luYyBmdW5jdGlvbiBzaWduIChhcHBQYXRoKSB7XG4gIGlmIChhcHBQYXRoLmVuZHNXaXRoKEFQS1NfRVhURU5TSU9OKSkge1xuICAgIGxldCBtZXNzYWdlID0gJ1NpZ25pbmcgb2YgLmFwa3MtZmlsZXMgaXMgbm90IHN1cHBvcnRlZC4gJztcbiAgICBpZiAodGhpcy51c2VLZXlzdG9yZSkge1xuICAgICAgbWVzc2FnZSArPSAnQ29uc2lkZXIgbWFudWFsIGFwcGxpY2F0aW9uIGJ1bmRsZSBzaWduaW5nIHdpdGggdGhlIGN1c3RvbSBrZXlzdG9yZSAnICtcbiAgICAgICAgYGxpa2UgaXQgaXMgZGVzY3JpYmVkIGF0ICR7QlVORExFVE9PTF9UVVRPUklBTH1gO1xuICAgIH0gZWxzZSB7XG4gICAgICBtZXNzYWdlICs9IGBDb25zaWRlciBtYW51YWwgYXBwbGljYXRpb24gYnVuZGxlIHNpZ25pbmcgd2l0aCB0aGUga2V5IGF0ICcke0RFRkFVTFRfUFJJVkFURV9LRVl9JyBgICtcbiAgICAgICAgYGFuZCB0aGUgY2VydGlmaWNhdGUgYXQgJyR7REVGQVVMVF9DRVJUSUZJQ0FURX0nLiBSZWFkICR7QlVORExFVE9PTF9UVVRPUklBTH0gZm9yIG1vcmUgZGV0YWlscy5gO1xuICAgIH1cbiAgICBsb2cud2FybihtZXNzYWdlKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBsZXQgYXBrc2lnbmVyRm91bmQgPSB0cnVlO1xuICB0cnkge1xuICAgIGF3YWl0IGdldEFwa3NpZ25lckZvck9zKHRoaXMpO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBhcGtzaWduZXJGb3VuZCA9IGZhbHNlO1xuICB9XG5cbiAgaWYgKGFwa3NpZ25lckZvdW5kKSB7XG4gICAgLy8gaXQgaXMgbmVjZXNzYXJ5IHRvIGFwcGx5IHppcGFsaWduIG9ubHkgYmVmb3JlIHNpZ25pbmdcbiAgICAvLyBpZiBhcGtzaWduZXIgaXMgdXNlZCBvciBvbmx5IGFmdGVyIHNpZ25pbmcgaWYgd2Ugb25seSBoYXZlXG4gICAgLy8gc2lnbi5qYXIgdXRpbGl0eVxuICAgIGF3YWl0IHRoaXMuemlwQWxpZ25BcGsoYXBwUGF0aCk7XG4gIH1cblxuICBpZiAodGhpcy51c2VLZXlzdG9yZSkge1xuICAgIGF3YWl0IHRoaXMuc2lnbldpdGhDdXN0b21DZXJ0KGFwcFBhdGgpO1xuICB9IGVsc2Uge1xuICAgIGF3YWl0IHRoaXMuc2lnbldpdGhEZWZhdWx0Q2VydChhcHBQYXRoKTtcbiAgfVxuXG4gIGlmICghYXBrc2lnbmVyRm91bmQpIHtcbiAgICBhd2FpdCB0aGlzLnppcEFsaWduQXBrKGFwcFBhdGgpO1xuICB9XG59O1xuXG4vKipcbiAqIFBlcmZvcm0gemlwLWFsaWduaW5nIHRvIHRoZSBnaXZlbiBsb2NhbCBhcGsgZmlsZS5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gYXBrIC0gVGhlIGZ1bGwgcGF0aCB0byB0aGUgbG9jYWwgYXBrIGZpbGUuXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgYXBrIGhhcyBiZWVuIHN1Y2Nlc3NmdWxseSBhbGlnbmVkXG4gKiBvciBmYWxzZSBpZiB0aGUgYXBrIGhhcyBiZWVuIGFscmVhZHkgYWxpZ25lZC5cbiAqIEB0aHJvd3Mge0Vycm9yfSBJZiB6aXAtYWxpZ24gZmFpbHMuXG4gKi9cbmFwa1NpZ25pbmdNZXRob2RzLnppcEFsaWduQXBrID0gYXN5bmMgZnVuY3Rpb24gemlwQWxpZ25BcGsgKGFwaykge1xuICBhd2FpdCB0aGlzLmluaXRaaXBBbGlnbigpO1xuICB0cnkge1xuICAgIGF3YWl0IGV4ZWModGhpcy5iaW5hcmllcy56aXBhbGlnbiwgWyctYycsICc0JywgYXBrXSk7XG4gICAgbG9nLmRlYnVnKGAke2Fwa30nIGlzIGFscmVhZHkgemlwLWFsaWduZWQuIERvaW5nIG5vdGhpbmdgKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBsb2cuZGVidWcoYCcke2Fwa30nIGlzIG5vdCB6aXAtYWxpZ25lZC4gQWxpZ25pbmdgKTtcbiAgfVxuICB0cnkge1xuICAgIGF3YWl0IGZzLmFjY2VzcyhhcGssIF9mcy5XX09LKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHRocm93IG5ldyBFcnJvcihgVGhlIGZpbGUgYXQgJyR7YXBrfScgaXMgbm90IHdyaXRlYWJsZS4gYCArXG4gICAgICBgUGxlYXNlIGdyYW50IHdyaXRlIHBlcm1pc3Npb25zIHRvIHRoaXMgZmlsZSBvciB0byBpdHMgcGFyZW50IGZvbGRlciAnJHtwYXRoLmRpcm5hbWUoYXBrKX0nIGAgK1xuICAgICAgYGZvciB0aGUgQXBwaXVtIHByb2Nlc3MsIHNvIGl0IGNhbiB6aXAtYWxpZ24gdGhlIGZpbGVgKTtcbiAgfVxuICBjb25zdCBhbGlnbmVkQXBrID0gYXdhaXQgdGVtcERpci5wYXRoKHtwcmVmaXg6ICdhcHBpdW0nLCBzdWZmaXg6ICcudG1wJ30pO1xuICBhd2FpdCBta2RpcnAocGF0aC5kaXJuYW1lKGFsaWduZWRBcGspKTtcbiAgdHJ5IHtcbiAgICBhd2FpdCBleGVjKHRoaXMuYmluYXJpZXMuemlwYWxpZ24sIFsnLWYnLCAnNCcsIGFwaywgYWxpZ25lZEFwa10pO1xuICAgIGF3YWl0IGZzLm12KGFsaWduZWRBcGssIGFwaywgeyBta2RpcnA6IHRydWUgfSk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBpZiAoYXdhaXQgZnMuZXhpc3RzKGFsaWduZWRBcGspKSB7XG4gICAgICBhd2FpdCBmcy51bmxpbmsoYWxpZ25lZEFwayk7XG4gICAgfVxuICAgIHRocm93IG5ldyBFcnJvcihgemlwQWxpZ25BcGsgZmFpbGVkLiBPcmlnaW5hbCBlcnJvcjogJHtlLm1lc3NhZ2V9LiBTdGRvdXQ6ICcke2Uuc3Rkb3V0fSc7IFN0ZGVycjogJyR7ZS5zdGRlcnJ9J2ApO1xuICB9XG59O1xuXG4vKipcbiAqIENoZWNrIGlmIHRoZSBhcHAgaXMgYWxyZWFkeSBzaWduZWQgd2l0aCB0aGUgZGVmYXVsdCBBcHBpdW0gY2VydGlmaWNhdGUuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGFwcFBhdGggLSBUaGUgZnVsbCBwYXRoIHRvIHRoZSBsb2NhbCAuYXBrKHMpIGZpbGUuXG4gKiBAcGFyYW0ge3N0cmluZ30gcGdrIC0gVGhlIG5hbWUgb2YgYXBwbGljYXRpb24gcGFja2FnZS5cbiAqIEByZXR1cm4ge2Jvb2xlYW59IFRydWUgaWYgZ2l2ZW4gYXBwbGljYXRpb24gaXMgYWxyZWFkeSBzaWduZWQuXG4gKi9cbmFwa1NpZ25pbmdNZXRob2RzLmNoZWNrQXBrQ2VydCA9IGFzeW5jIGZ1bmN0aW9uIGNoZWNrQXBrQ2VydCAoYXBwUGF0aCwgcGtnKSB7XG4gIGxvZy5kZWJ1ZyhgQ2hlY2tpbmcgYXBwIGNlcnQgZm9yICR7YXBwUGF0aH1gKTtcbiAgaWYgKCFhd2FpdCBmcy5leGlzdHMoYXBwUGF0aCkpIHtcbiAgICBsb2cuZGVidWcoYCcke2FwcFBhdGh9JyBkb2VzIG5vdCBleGlzdGApO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmICh0aGlzLnVzZUtleXN0b3JlKSB7XG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuY2hlY2tDdXN0b21BcGtDZXJ0KGFwcFBhdGgsIHBrZyk7XG4gIH1cblxuICBpZiAocGF0aC5leHRuYW1lKGFwcFBhdGgpID09PSBBUEtTX0VYVEVOU0lPTikge1xuICAgIGFwcFBhdGggPSBhd2FpdCB0aGlzLmV4dHJhY3RCYXNlQXBrKGFwcFBhdGgpO1xuICB9XG5cbiAgdHJ5IHtcbiAgICBhd2FpdCBnZXRBcGtzaWduZXJGb3JPcyh0aGlzKTtcbiAgICBjb25zdCBvdXRwdXQgPSBhd2FpdCB0aGlzLmV4ZWN1dGVBcGtzaWduZXIoWyd2ZXJpZnknLCAnLS1wcmludC1jZXJ0cycsIGFwcFBhdGhdKTtcbiAgICBpZiAoIV8uaW5jbHVkZXMob3V0cHV0LCBERUZBVUxUX0NFUlRfRElHRVNUKSkge1xuICAgICAgbG9nLmRlYnVnKGAnJHthcHBQYXRofScgaXMgc2lnbmVkIHdpdGggbm9uLWRlZmF1bHQgY2VydGlmaWNhdGVgKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgbG9nLmRlYnVnKGAnJHthcHBQYXRofScgaXMgYWxyZWFkeSBzaWduZWQuYCk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIC8vIGNoZWNrIGlmIHRoZXJlIGlzIG5vIHNpZ25hdHVyZVxuICAgIGlmIChlcnIuc3RkZXJyICYmIGVyci5zdGRlcnIuaW5jbHVkZXMoQVBLU0lHTkVSX1ZFUklGWV9GQUlMKSkge1xuICAgICAgbG9nLmRlYnVnKGAnJHthcHBQYXRofScgaXMgbm90IHNpZ25lZCB3aXRoIGRlYnVnIGNlcnRgKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgbG9nLndhcm4oYENhbm5vdCB1c2UgYXBrc2lnbmVyIHRvb2wgZm9yIHNpZ25hdHVyZSB2ZXJpZmljYXRpb24uIGAgK1xuICAgICAgYE9yaWdpbmFsIGVycm9yOiAke2Vyci5tZXNzYWdlfWApO1xuICB9XG5cbiAgLy8gZGVmYXVsdCB0byB2ZXJpZnkuamFyXG4gIHRyeSB7XG4gICAgbG9nLmRlYnVnKGBEZWZhdWx0aW5nIHRvIHZlcmlmeS5qYXJgKTtcbiAgICBhd2FpdCBleGVjKGdldEphdmFGb3JPcygpLCBbJy1qYXInLCBwYXRoLnJlc29sdmUodGhpcy5oZWxwZXJKYXJQYXRoLCAndmVyaWZ5LmphcicpLCBhcHBQYXRoXSk7XG4gICAgbG9nLmRlYnVnKGAnJHthcHBQYXRofScgaXMgYWxyZWFkeSBzaWduZWQuYCk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGxvZy5kZWJ1ZyhgJyR7YXBwUGF0aH0nIGlzIG5vdCBzaWduZWQgd2l0aCBkZWJ1ZyBjZXJ0JHtlcnIuc3RkZXJyID8gYDogJHtlcnIuc3RkZXJyfWAgOiAnJ31gKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn07XG5cbi8qKlxuICogQ2hlY2sgaWYgdGhlIGFwcCBpcyBhbHJlYWR5IHNpZ25lZCB3aXRoIGEgY3VzdG9tIGNlcnRpZmljYXRlLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBhcHBQYXRoIC0gVGhlIGZ1bGwgcGF0aCB0byB0aGUgbG9jYWwgYXBrKHMpIGZpbGUuXG4gKiBAcGFyYW0ge3N0cmluZ30gcGdrIC0gVGhlIG5hbWUgb2YgYXBwbGljYXRpb24gcGFja2FnZS5cbiAqIEByZXR1cm4ge2Jvb2xlYW59IFRydWUgaWYgZ2l2ZW4gYXBwbGljYXRpb24gaXMgYWxyZWFkeSBzaWduZWQgd2l0aCBhIGN1c3RvbSBjZXJ0aWZpY2F0ZS5cbiAqL1xuYXBrU2lnbmluZ01ldGhvZHMuY2hlY2tDdXN0b21BcGtDZXJ0ID0gYXN5bmMgZnVuY3Rpb24gY2hlY2tDdXN0b21BcGtDZXJ0IChhcHBQYXRoLCBwa2cpIHtcbiAgbG9nLmRlYnVnKGBDaGVja2luZyBjdXN0b20gYXBwIGNlcnQgZm9yICR7YXBwUGF0aH1gKTtcblxuICBpZiAocGF0aC5leHRuYW1lKGFwcFBhdGgpID09PSBBUEtTX0VYVEVOU0lPTikge1xuICAgIGFwcFBhdGggPSBhd2FpdCB0aGlzLmV4dHJhY3RCYXNlQXBrKGFwcFBhdGgpO1xuICB9XG5cbiAgbGV0IGggPSAnYS1mQS1GMC05JztcbiAgbGV0IG1kNVN0ciA9IFtgLipNRDUuKigoPzpbJHtofV17Mn06KXsxNX1bJHtofV17Mn0pYF07XG4gIGxldCBtZDUgPSBuZXcgUmVnRXhwKG1kNVN0ciwgJ21pJyk7XG4gIGxldCBrZXl0b29sID0gcGF0aC5yZXNvbHZlKGdldEphdmFIb21lKCksICdiaW4nLCBga2V5dG9vbCR7c3lzdGVtLmlzV2luZG93cygpID8gJy5leGUnIDogJyd9YCk7XG4gIGxldCBrZXlzdG9yZUhhc2ggPSBhd2FpdCB0aGlzLmdldEtleXN0b3JlTWQ1KGtleXRvb2wsIG1kNSk7XG4gIHJldHVybiBhd2FpdCB0aGlzLmNoZWNrQXBrS2V5c3RvcmVNYXRjaChrZXl0b29sLCBtZDUsIGtleXN0b3JlSGFzaCwgcGtnLCBhcHBQYXRoKTtcbn07XG5cbi8qKlxuICogR2V0IHRoZSBNRDUgaGFzaCBvZiB0aGUga2V5c3RvcmUuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGtleXRvb2wgLSBUaGUgbmFtZSBvZiB0aGUga2V5dG9vbCB1dGlsaXR5LlxuICogQHBhcmFtIHtSZWdFeHB9IG1kNXJlIC0gVGhlIHBhdHRlcm4gdXNlZCB0byBtYXRjaCB0aGUgcmVzdWx0IGluIF9rZXl0b29sXyBvdXRwdXQuXG4gKiBAcmV0dXJuIHs/c3RyaW5nfSBLZXlzdG9yZSBNRDUgaGFzaCBvciBfbnVsbF8gaWYgdGhlIGhhc2ggY2Fubm90IGJlIHBhcnNlZC5cbiAqIEB0aHJvd3Mge0Vycm9yfSBJZiBnZXR0aW5nIGtleXN0b3JlIE1ENSBoYXNoIGZhaWxzLlxuICovXG5hcGtTaWduaW5nTWV0aG9kcy5nZXRLZXlzdG9yZU1kNSA9IGFzeW5jIGZ1bmN0aW9uIGdldEtleXN0b3JlTWQ1IChrZXl0b29sLCBtZDVyZSkge1xuICBsb2cuZGVidWcoJ1ByaW50aW5nIGtleXN0b3JlIG1kNS4nKTtcbiAgdHJ5IHtcbiAgICBsZXQge3N0ZG91dH0gPSBhd2FpdCBleGVjKGtleXRvb2wsIFsnLXYnLCAnLWxpc3QnLFxuICAgICAgJy1hbGlhcycsIHRoaXMua2V5QWxpYXMsXG4gICAgICAnLWtleXN0b3JlJywgdGhpcy5rZXlzdG9yZVBhdGgsXG4gICAgICAnLXN0b3JlcGFzcycsIHRoaXMua2V5c3RvcmVQYXNzd29yZF0pO1xuICAgIGxldCBrZXlzdG9yZUhhc2ggPSBtZDVyZS5leGVjKHN0ZG91dCk7XG4gICAga2V5c3RvcmVIYXNoID0ga2V5c3RvcmVIYXNoID8ga2V5c3RvcmVIYXNoWzFdIDogbnVsbDtcbiAgICBsb2cuZGVidWcoYEtleXN0b3JlIE1ENTogJHtrZXlzdG9yZUhhc2h9YCk7XG4gICAgcmV0dXJuIGtleXN0b3JlSGFzaDtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHRocm93IG5ldyBFcnJvcihgZ2V0S2V5c3RvcmVNZDUgZmFpbGVkLiBPcmlnaW5hbCBlcnJvcjogJHtlLm1lc3NhZ2V9YCk7XG4gIH1cbn07XG5cbi8qKlxuICogQ2hlY2sgaWYgdGhlIE1ENSBoYXNoIG9mIHRoZSBwYXJ0aWN1bGFyIGFwcGxpY2F0aW9uIG1hdGNoZXMgdG8gdGhlIGdpdmVuIGhhc2guXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGtleXRvb2wgLSBUaGUgbmFtZSBvZiB0aGUga2V5dG9vbCB1dGlsaXR5LlxuICogQHBhcmFtIHtSZWdFeHB9IG1kNXJlIC0gVGhlIHBhdHRlcm4gdXNlZCB0byBtYXRjaCB0aGUgcmVzdWx0IGluIF9rZXl0b29sXyBvdXRwdXQuXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5c3RvcmVIYXNoIC0gVGhlIGV4cGVjdGVkIGhhc2ggdmFsdWUuXG4gKiBAcGFyYW0ge3N0cmluZ30gcGtnIC0gVGhlIG5hbWUgb2YgdGhlIGluc3RhbGxlZCBwYWNrYWdlLlxuICogQHBhcmFtIHtzdHJpbmd9IGFwayAtIFRoZSBmdWxsIHBhdGggdG8gdGhlIGV4aXN0aW5nIGFwayBmaWxlLlxuICogQHJldHVybiB7Ym9vbGVhbn0gVHJ1ZSBpZiBib3RoIGhhc2hlcyBhcmUgZXF1YWwuXG4gKiBAdGhyb3dzIHtFcnJvcn0gSWYgZ2V0dGluZyBrZXlzdG9yZSBNRDUgaGFzaCBmYWlscy5cbiAqL1xuYXBrU2lnbmluZ01ldGhvZHMuY2hlY2tBcGtLZXlzdG9yZU1hdGNoID0gYXN5bmMgZnVuY3Rpb24gY2hlY2tBcGtLZXlzdG9yZU1hdGNoIChrZXl0b29sLCBtZDVyZSwga2V5c3RvcmVIYXNoLCBwa2csIGFwaykge1xuICBsZXQgZW50cnlIYXNoID0gbnVsbDtcbiAgbGV0IHJzYSA9IC9eTUVUQS1JTkZcXC8uKlxcLltyUl1bc1NdW2FBXSQvO1xuICBsZXQgZm91bmRLZXlzdG9yZU1hdGNoID0gZmFsc2U7XG5cbiAgLy9mb3IgKGxldCBlbnRyeSBvZiBlbnRyaWVzKSB7XG4gIGF3YWl0IHppcC5yZWFkRW50cmllcyhhcGssIGFzeW5jICh7ZW50cnksIGV4dHJhY3RFbnRyeVRvfSkgPT4ge1xuICAgIGVudHJ5ID0gZW50cnkuZmlsZU5hbWU7XG4gICAgaWYgKCFyc2EudGVzdChlbnRyeSkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbG9nLmRlYnVnKGBFbnRyeTogJHtlbnRyeX1gKTtcbiAgICBsZXQgZW50cnlQYXRoID0gcGF0aC5qb2luKHRoaXMudG1wRGlyLCBwa2csICdjZXJ0Jyk7XG4gICAgbG9nLmRlYnVnKGBlbnRyeVBhdGg6ICR7ZW50cnlQYXRofWApO1xuICAgIGxldCBlbnRyeUZpbGUgPSBwYXRoLmpvaW4oZW50cnlQYXRoLCBlbnRyeSk7XG4gICAgbG9nLmRlYnVnKGBlbnRyeUZpbGU6ICR7ZW50cnlGaWxlfWApO1xuICAgIC8vIGVuc3VyZSAvdG1wL3BrZy9jZXJ0LyBkb2Vzbid0IGV4aXN0IG9yIGV4dHJhY3Qgd2lsbCBmYWlsLlxuICAgIGF3YWl0IGZzLnJpbXJhZihlbnRyeVBhdGgpO1xuICAgIC8vIE1FVEEtSU5GL0NFUlQuUlNBXG4gICAgYXdhaXQgZXh0cmFjdEVudHJ5VG8oZW50cnlQYXRoKTtcbiAgICBsb2cuZGVidWcoJ2V4dHJhY3RlZCEnKTtcbiAgICAvLyBjaGVjayBmb3IgbWF0Y2hcbiAgICBsb2cuZGVidWcoJ1ByaW50aW5nIGFwayBtZDUuJyk7XG4gICAgbGV0IHtzdGRvdXR9ID0gYXdhaXQgZXhlYyhrZXl0b29sLCBbJy12JywgJy1wcmludGNlcnQnLCAnLWZpbGUnLCBlbnRyeUZpbGVdKTtcbiAgICBlbnRyeUhhc2ggPSBtZDVyZS5leGVjKHN0ZG91dCk7XG4gICAgZW50cnlIYXNoID0gZW50cnlIYXNoID8gZW50cnlIYXNoWzFdIDogbnVsbDtcbiAgICBsb2cuZGVidWcoYGVudHJ5SGFzaCBNRDU6ICR7ZW50cnlIYXNofWApO1xuICAgIGxvZy5kZWJ1Zyhga2V5c3RvcmUgTUQ1OiAke2tleXN0b3JlSGFzaH1gKTtcbiAgICBsZXQgbWF0Y2hlc0tleXN0b3JlID0gZW50cnlIYXNoICYmIGVudHJ5SGFzaCA9PT0ga2V5c3RvcmVIYXNoO1xuICAgIGxvZy5kZWJ1ZyhgTWF0Y2hlcyBrZXlzdG9yZT8gJHttYXRjaGVzS2V5c3RvcmV9YCk7XG5cbiAgICAvLyBJZiB3ZSBoYXZlIGEga2V5c3RvcmUgbWF0Y2gsIHN0b3AgaXRlcmF0aW5nXG4gICAgaWYgKG1hdGNoZXNLZXlzdG9yZSkge1xuICAgICAgZm91bmRLZXlzdG9yZU1hdGNoID0gdHJ1ZTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gZm91bmRLZXlzdG9yZU1hdGNoO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgYXBrU2lnbmluZ01ldGhvZHM7XG4iXSwiZmlsZSI6ImxpYi90b29scy9hcGstc2lnbmluZy5qcyIsInNvdXJjZVJvb3QiOiIuLi8uLi8uLiJ9
