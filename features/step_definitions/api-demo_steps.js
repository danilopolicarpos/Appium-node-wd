'use strict'

var profile = process.env.NODE_ENV
switch (profile) {
  case 'PLATFORM=ios':
    var { driver } = require('../../capabilities/ios.caps')
    var Api_Page = require('../ios/page_objects/api-demo_screen')
    break;
    case 'PLATFORM=android':
      var { driver } = require('../../capabilities/android.caps') 
      var Api_Page = require('../android/page_objects/api-demo_screen')
      break;
   
  default:
    console.log('Sorry, we are out of ' + profile + '.');
}

const assert = require('assert');
const { Given, When, Then } = require('cucumber');
const Api = new Api_Page();

Given('que estou na tela principal da Api demo', async () => {
  await driver.elementById(Api.home).isDisplayed();
});

When('tocar em uma opção desejada', async () => {
  let element = await driver.elementById(Api.home);
  await element.click();
});

Then('vejo o resultado da busca', async () => {
  await driver.elementById(Api.home)
});


