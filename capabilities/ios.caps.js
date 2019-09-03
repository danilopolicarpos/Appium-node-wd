const wd = require('wd');

const PORT = 4723;

const config = {
  platformName: 'iOS',
  automationName: 'XCUITest',
  deviceName: 'iPhone 7',
  app: '/Users/danilopolicarpo/dev/Appium-NodeWD/apps/TestApp.app.zip',
 
};
const driver = wd.promiseChainRemote('localhost', PORT);

module.exports = {
    driver, config
  };