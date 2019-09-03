
const assert = require('assert');
const { Given, When, Then } = require('cucumber');
const { driver } = require('../../capabilities/android.caps')
const Api_Page = require('../android/page_objects/api-demo_screen');
const Api = new Api_Page();

Given('que estou na tela principal da Api demo', async () =>  {
  await driver.elementById(Api.home).isDisplayed();
  });
       
When('tocar em uma opção desejada', async () =>  {
  let element = await driver.elementById(Api.home);
  await element.click();
});
       
Then('vejo o resultado da busca', async () => {
  await driver.elementById(Api.home)
});


