
const assert = require('assert');
const { Given, When, Then } = require('cucumber');
const { Before, After } = require('../support/hook')
const { driver } = require('../../capabilities/android.capabilities')

Given('que estou na tela principal da Api demo', async () =>  {
  await driver.elementById("android:id/list").isDisplayed();
  });
       
When('tocar em uma opção desejada', async () =>  {
  let element = await driver.elementById("android:id/text1");
  await element.click();
});
       
Then('vejo o resultado da busca', async () => {
  await driver.elementById("android:id/text1")
});


