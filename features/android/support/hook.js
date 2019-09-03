const { Before, After } = require('cucumber');
const {config, driver} = require('../../../capabilities/android.caps')

Before({timeout: 80000}, async () => {
    await driver.init(config);
  });
  
  After({timeout : 50000},async() => {
      await driver.quit();
  });

module.exports = {
     Before, After
  };