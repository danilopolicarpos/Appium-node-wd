const { Before, After } = require('cucumber');
const {config, driver} = require('../../../capabilities/android.capabilities')

Before({timeout: 80000}, async () => {
    await driver.init(config);
  });
  
  After(async() => {
      await driver.quit();
  });

module.exports = {
     Before, After
  };