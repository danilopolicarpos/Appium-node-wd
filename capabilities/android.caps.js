const wd = require('wd');

const PORT = 4723;

const config = {
  platformName: 'Android',
  deviceName: 'Android Emulator',
  app: '/Users/danilopolicarpo/dev/Appium-NodeWD/apps/ApiDemos-debug.apk',
  automationName: 'uiautomator2' 
};
const driver = wd.promiseChainRemote('localhost', PORT);

module.exports = {
    driver, config
  };