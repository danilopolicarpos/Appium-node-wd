"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

require("source-map-support/register");

var _chai = _interopRequireDefault(require("chai"));

var _path = _interopRequireDefault(require("path"));

var _chaiAsPromised = _interopRequireDefault(require("chai-as-promised"));

var _sinon = _interopRequireDefault(require("sinon"));

var _ = require("../../..");

var _find = require("../../../lib/basedriver/commands/find");

var _appiumSupport = require("appium-support");

const should = _chai.default.should();

_chai.default.use(_chaiAsPromised.default);

class TestDriver extends _.BaseDriver {
  async getWindowSize() {}

  async getScreenshot() {}

}

const CUSTOM_FIND_MODULE = _path.default.resolve(__dirname, '..', '..', '..', '..', 'test', 'basedriver', 'fixtures', 'custom-element-finder');

const BAD_CUSTOM_FIND_MODULE = _path.default.resolve(__dirname, '..', '..', '..', '..', 'test', 'basedriver', 'fixtures', 'custom-element-finder-bad');

const TINY_PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyhpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTQwIDc5LjE2MDQ1MSwgMjAxNy8wNS8wNi0wMTowODoyMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTggKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6N0NDMDM4MDM4N0U2MTFFOEEzMzhGMTRFNUUwNzIwNUIiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6N0NDMDM4MDQ4N0U2MTFFOEEzMzhGMTRFNUUwNzIwNUIiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo3Q0MwMzgwMTg3RTYxMUU4QTMzOEYxNEU1RTA3MjA1QiIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo3Q0MwMzgwMjg3RTYxMUU4QTMzOEYxNEU1RTA3MjA1QiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PpdvJjQAAAAlSURBVHjaJInBEQAACIKw/Xe2Ul5wYBtwmJqkk4+zfvUQVoABAEg0EfrZwc0hAAAAAElFTkSuQmCC';
const TINY_PNG_DIMS = [4, 4];
describe('finding elements by image', function () {
  describe('findElement', function () {
    it('should use a different special method to find element by image', async function () {
      const d = new TestDriver();

      _sinon.default.stub(d, 'findByImage').returns(true);

      _sinon.default.stub(d, 'findElOrElsWithProcessing').returns(false);

      await d.findElement(_find.IMAGE_STRATEGY, 'foo').should.eventually.be.true;
      await d.findElements(_find.IMAGE_STRATEGY, 'foo').should.eventually.be.true;
    });
    it('should not be able to find image element from any other element', async function () {
      const d = new TestDriver();
      await d.findElementFromElement(_find.IMAGE_STRATEGY, 'foo', 'elId').should.eventually.be.rejectedWith(/Locator Strategy.+is not supported/);
      await d.findElementsFromElement(_find.IMAGE_STRATEGY, 'foo', 'elId').should.eventually.be.rejectedWith(/Locator Strategy.+is not supported/);
    });
  });
  describe('findByImage', function () {
    const rect = {
      x: 10,
      y: 20,
      width: 30,
      height: 40
    };
    const size = {
      width: 100,
      height: 200
    };
    const screenshot = 'iVBORfoo';
    const template = 'iVBORbar';

    function basicStub(driver) {
      const sizeStub = _sinon.default.stub(driver, 'getWindowSize').returns(size);

      const screenStub = _sinon.default.stub(driver, 'getScreenshotForImageFind').returns(screenshot);

      const compareStub = _sinon.default.stub(driver, 'compareImages').returns({
        rect
      });

      return {
        sizeStub,
        screenStub,
        compareStub
      };
    }

    function basicImgElVerify(imgElProto, driver) {
      const imgElId = imgElProto.ELEMENT;
      driver._imgElCache.has(imgElId).should.be.true;

      const imgEl = driver._imgElCache.get(imgElId);

      (imgEl instanceof _.ImageElement).should.be.true;
      imgEl.rect.should.eql(rect);
      return imgEl;
    }

    it('should find an image element happypath', async function () {
      const d = new TestDriver();
      basicStub(d);
      const imgElProto = await d.findByImage(template, {
        multiple: false
      });
      basicImgElVerify(imgElProto, d);
    });
    it('should find image elements happypath', async function () {
      const d = new TestDriver();
      basicStub(d);
      const els = await d.findByImage(template, {
        multiple: true
      });
      els.should.have.length(1);
      basicImgElVerify(els[0], d);
    });
    it('should fail if driver does not support getWindowSize', async function () {
      const d = new _.BaseDriver();
      await d.findByImage(template, {
        multiple: false
      }).should.eventually.be.rejectedWith(/driver does not support/);
    });
    it('should fix template size if requested', async function () {
      const d = new TestDriver();
      const newTemplate = 'iVBORbaz';
      const {
        compareStub
      } = basicStub(d);
      await d.settings.update({
        fixImageTemplateSize: true
      });

      _sinon.default.stub(d, 'ensureTemplateSize').returns(newTemplate);

      const imgElProto = await d.findByImage(template, {
        multiple: false
      });
      const imgEl = basicImgElVerify(imgElProto, d);
      imgEl.template.should.eql(newTemplate);
      compareStub.args[0][2].should.eql(newTemplate);
    });
    it('should fix template size scale if requested', async function () {
      const d = new TestDriver();
      const newTemplate = 'iVBORbaz';
      const {
        compareStub
      } = basicStub(d);
      await d.settings.update({
        fixImageTemplateScale: true
      });

      _sinon.default.stub(d, 'fixImageTemplateScale').returns(newTemplate);

      const imgElProto = await d.findByImage(template, {
        multiple: false
      });
      const imgEl = basicImgElVerify(imgElProto, d);
      imgEl.template.should.eql(newTemplate);
      compareStub.args[0][2].should.eql(newTemplate);
    });
    it('should not fix template size scale if it is not requested', async function () {
      const d = new TestDriver();
      const newTemplate = 'iVBORbaz';
      basicStub(d);
      await d.settings.update({});

      _sinon.default.stub(d, 'fixImageTemplateScale').returns(newTemplate);

      d.fixImageTemplateScale.callCount.should.eql(0);
    });
    it('should throw an error if template match fails', async function () {
      const d = new TestDriver();
      const {
        compareStub
      } = basicStub(d);
      compareStub.throws(new Error('Cannot find any occurrences'));
      await d.findByImage(template, {
        multiple: false
      }).should.eventually.be.rejectedWith(/element could not be located/);
    });
    it('should return empty array for multiple elements if template match fails', async function () {
      const d = new TestDriver();
      const {
        compareStub
      } = basicStub(d);
      compareStub.throws(new Error('Cannot find any occurrences'));
      await d.findByImage(template, {
        multiple: true
      }).should.eventually.eql([]);
    });
    it('should respect implicit wait', async function () {
      const d = new TestDriver();
      d.setImplicitWait(10);
      const {
        compareStub
      } = basicStub(d);
      compareStub.onCall(0).throws(new Error('Cannot find any occurrences'));
      const imgElProto = await d.findByImage(template, {
        multiple: false
      });
      basicImgElVerify(imgElProto, d);
      compareStub.callCount.should.eql(2);
    });
    it('should not add element to cache and return it directly when checking staleness', async function () {
      const d = new TestDriver();
      basicStub(d);
      const imgEl = await d.findByImage(template, {
        multiple: false,
        shouldCheckStaleness: true
      });
      (imgEl instanceof _.ImageElement).should.be.true;
      d._imgElCache.has(imgEl.id).should.be.false;
      imgEl.rect.should.eql(rect);
    });
  });
  describe('fixImageTemplateScale', function () {
    it('should not fix template size scale if no scale value', async function () {
      const newTemplate = 'iVBORbaz';
      await _find.helpers.fixImageTemplateScale(newTemplate, {
        fixImageTemplateScale: true
      }).should.eventually.eql(newTemplate);
    });
    it('should not fix template size scale if it is null', async function () {
      const newTemplate = 'iVBORbaz';
      await _find.helpers.fixImageTemplateScale(newTemplate, null).should.eventually.eql(newTemplate);
    });
    it('should not fix template size scale if it is not number', async function () {
      const newTemplate = 'iVBORbaz';
      await _find.helpers.fixImageTemplateScale(newTemplate, 'wrong-scale').should.eventually.eql(newTemplate);
    });
    it('should fix template size scale', async function () {
      const actual = 'iVBORw0KGgoAAAANSUhEUgAAAAYAAAAGCAYAAADgzO9IAAAAWElEQVR4AU3BQRWAQAhAwa/PGBsEgrC16AFBKEIPXW7OXO+Rmey9iQjMjHFzrLUwM7qbqmLcHKpKRFBVuDvj4agq3B1VRUQYT2bS3QwRQVUZF/CaGRHB3wc1vSZbHO5+BgAAAABJRU5ErkJggg==';
      await _find.helpers.fixImageTemplateScale(TINY_PNG, {
        fixImageTemplateScale: true,
        xScale: 1.5,
        yScale: 1.5
      }).should.eventually.eql(actual);
    });
    it('should not fix template size scale because of fixImageTemplateScale is false', async function () {
      await _find.helpers.fixImageTemplateScale(TINY_PNG, {
        fixImageTemplateScale: false,
        xScale: 1.5,
        yScale: 1.5
      }).should.eventually.eql(TINY_PNG);
    });
    it('should fix template size scale with default scale', async function () {
      const actual = 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABwUlEQVR4AaXBPUsrQQCG0SeX+cBdkTjwTpG1NPgLpjY/fW1stt4UYmm2cJqwMCsaw70uJJ3CBc9Z/P3Cl+12S9u2tG1L27bEGLm/v2ez2bDZbJDEd/7wS4YT7z3X19fc3Nxwd3dHXdd47xnHkefnZ8ZxpKoq6rqmqiqMMcwMJ1VV0TQN0zThnOPj44O6rsk503UdkmiahqZpWK1WGGOYGU7quqZpGqy1SCLnTM6Z19dXcs5IYpomrLVI4uLigpnhpKoqVqsVkjgcDjw9PdF1HTlnuq5DEs45JHE4HDgznByPR97e3pimiVIK4zhyPB7x3hNCIITA5eUl3nsWiwVnhpNSCsMwsNvtGIaB/X5PKQVJpJSQxHq9RhLOOc4MJ9M0sdvt2G639H3PTBIxRiQhCUnEGLHWcmY4KaUwDAN93/P4+MhyuSSlhCRSSkjCOYe1FmstZ6bve2YvLy/s93tmy+USSUhCEpIIIfAd8/DwwOz9/Z1SCpJIKSGJ9XqNJJxz/MS0bcvs6uoKScQYkYQkJBFjxFrLT0zbtsxub29JKSGJlBKScM5hrcVay09MzplZjJHPz0+894QQCCHwP/7wS/8A4e6nAg+R8LwAAAAASUVORK5CYII=';
      await _find.helpers.fixImageTemplateScale(TINY_PNG, {
        defaultImageTemplateScale: 4.0
      }).should.eventually.eql(actual);
    });
    it('should fix template size scale with default scale and image scale', async function () {
      const actual = 'iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAACaUlEQVR4AbXBMWvrWBSF0c9BsFPtW91UR1U6+///FKlKKt8qqnyqnMozggkI8xgMj6x1uv+L/6zryrIsrOvKsiys68qyLFwuF87nM5fLhfP5zOVy4Xw+84wXftkLv2ziQBK26b0TEVQVu4jANrvM5Hq9spOEJCQhCUlI4mjiQBK26b1TVewkYRvb7DKTMQaZiW1s01rDNraRxNHEgSRaa1QVO0m01jjKTDKTXe+d3jtVxU4SjyYOJGGbnSRs03snM8lMMpPb7UZmkplEBFXFThK2eTRxIAnbSMI2VcX39zdjDMYYZCaZyRiDMQZVxU4StqkqHk0cSEISf5KZ7DKTMQbLsrCTRGuN3jtVxaOJg6qiqqgqqoqqoqoYY5CZ7GwTEdzvd97f34kIeu/YRhKPJg6qiswkM7ndbmQmmUlmkpnsbBMR2CYimOeZ3ju2kcSjiYOqIjP5+vpi2za2bWPbNo5aa7TW2PXe6b3Te6e1hiQeTRxUFbfbjW3bGGNwvV4ZY2Ab27TWsI1tbGMb27TWsI0kHk0cVBWZybZtXK9XPj8/+fj4YJ5nIoLWGraJCOZ5RhKSkIQkJPFo4qCqyEy2bWOMwefnJ+u6cjqdsM3ONvM8cz6feca0ris/rtcrmcnONhHB/X7n/f2diKD3jm0k8axpWRZ+ZCaZyc42EYFtIoJ5num9YxtJPGta15U/sY1tdm9vb/Te6b1jG0k8a1qWhR+2sU1rjdYatrGNbWxjm9YaknjWtK4rPyKCiKC1hm0igojg9fUVSUhCEpJ41rQsC0e22dkmIrhcLvyNF/7H6XTib73wy174Zf8AJEsePtlPj10AAAAASUVORK5CYII=';
      await _find.helpers.fixImageTemplateScale(TINY_PNG, {
        defaultImageTemplateScale: 4.0,
        fixImageTemplateScale: true,
        xScale: 1.5,
        yScale: 1.5
      }).should.eventually.eql(actual);
    });
    it('should not fix template size scale with default scale and image scale', async function () {
      const actual = 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABwUlEQVR4AaXBPUsrQQCG0SeX+cBdkTjwTpG1NPgLpjY/fW1stt4UYmm2cJqwMCsaw70uJJ3CBc9Z/P3Cl+12S9u2tG1L27bEGLm/v2ez2bDZbJDEd/7wS4YT7z3X19fc3Nxwd3dHXdd47xnHkefnZ8ZxpKoq6rqmqiqMMcwMJ1VV0TQN0zThnOPj44O6rsk503UdkmiahqZpWK1WGGOYGU7quqZpGqy1SCLnTM6Z19dXcs5IYpomrLVI4uLigpnhpKoqVqsVkjgcDjw9PdF1HTlnuq5DEs45JHE4HDgznByPR97e3pimiVIK4zhyPB7x3hNCIITA5eUl3nsWiwVnhpNSCsMwsNvtGIaB/X5PKQVJpJSQxHq9RhLOOc4MJ9M0sdvt2G639H3PTBIxRiQhCUnEGLHWcmY4KaUwDAN93/P4+MhyuSSlhCRSSkjCOYe1FmstZ6bve2YvLy/s93tmy+USSUhCEpIIIfAd8/DwwOz9/Z1SCpJIKSGJ9XqNJJxz/MS0bcvs6uoKScQYkYQkJBFjxFrLT0zbtsxub29JKSGJlBKScM5hrcVay09MzplZjJHPz0+894QQCCHwP/7wS/8A4e6nAg+R8LwAAAAASUVORK5CYII=';
      await _find.helpers.fixImageTemplateScale(TINY_PNG, {
        defaultImageTemplateScale: 4.0,
        fixImageTemplateScale: false,
        xScale: 1.5,
        yScale: 1.5
      }).should.eventually.eql(actual);
    });
    it('should not fix template size scale because of ignoreDefaultImageTemplateScale', async function () {
      await _find.helpers.fixImageTemplateScale(TINY_PNG, {
        defaultImageTemplateScale: 4.0,
        ignoreDefaultImageTemplateScale: true
      }).should.eventually.eql(TINY_PNG);
    });
    it('should ignore defaultImageTemplateScale to fix template size scale because of ignoreDefaultImageTemplateScale', async function () {
      const actual = 'iVBORw0KGgoAAAANSUhEUgAAAAYAAAAGCAYAAADgzO9IAAAAWElEQVR4AU3BQRWAQAhAwa/PGBsEgrC16AFBKEIPXW7OXO+Rmey9iQjMjHFzrLUwM7qbqmLcHKpKRFBVuDvj4agq3B1VRUQYT2bS3QwRQVUZF/CaGRHB3wc1vSZbHO5+BgAAAABJRU5ErkJggg==';
      await _find.helpers.fixImageTemplateScale(TINY_PNG, {
        defaultImageTemplateScale: 4.0,
        ignoreDefaultImageTemplateScale: true,
        fixImageTemplateScale: true,
        xScale: 1.5,
        yScale: 1.5
      }).should.eventually.eql(actual);
    });
  });
  describe('ensureTemplateSize', function () {
    it('should not resize the template if it is smaller than the screen', async function () {
      const screen = TINY_PNG_DIMS.map(n => n * 2);
      const d = new TestDriver();
      await d.ensureTemplateSize(TINY_PNG, ...screen).should.eventually.eql(TINY_PNG);
    });
    it('should not resize the template if it is the same size as the screen', async function () {
      const d = new TestDriver();
      await d.ensureTemplateSize(TINY_PNG, ...TINY_PNG_DIMS).should.eventually.eql(TINY_PNG);
    });
    it('should resize the template if it is bigger than the screen', async function () {
      const d = new TestDriver();
      const screen = TINY_PNG_DIMS.map(n => n / 2);
      const newTemplate = await d.ensureTemplateSize(TINY_PNG, ...screen);
      newTemplate.should.not.eql(TINY_PNG);
      newTemplate.length.should.be.below(TINY_PNG.length);
    });
  });
  describe('getScreenshotForImageFind', function () {
    it('should fail if driver does not support getScreenshot', async function () {
      const d = new _.BaseDriver();
      await d.getScreenshotForImageFind().should.eventually.be.rejectedWith(/driver does not support/);
    });
    it('should not adjust or verify screenshot if asked not to by settings', async function () {
      const d = new TestDriver();

      _sinon.default.stub(d, 'getScreenshot').returns(TINY_PNG);

      d.settings.update({
        fixImageFindScreenshotDims: false
      });
      const screen = TINY_PNG_DIMS.map(n => n + 1);
      const {
        b64Screenshot,
        scale
      } = await d.getScreenshotForImageFind(...screen);
      b64Screenshot.should.eql(TINY_PNG);
      should.equal(scale, undefined);
    });
    it('should return screenshot without adjustment if it matches screen size', async function () {
      const d = new TestDriver();

      _sinon.default.stub(d, 'getScreenshot').returns(TINY_PNG);

      const {
        b64Screenshot,
        scale
      } = await d.getScreenshotForImageFind(...TINY_PNG_DIMS);
      b64Screenshot.should.eql(TINY_PNG);
      should.equal(scale, undefined);
    });
    it('should return scaled screenshot with same aspect ratio if matching screen aspect ratio', async function () {
      const d = new TestDriver();

      _sinon.default.stub(d, 'getScreenshot').returns(TINY_PNG);

      const screen = TINY_PNG_DIMS.map(n => n * 1.5);
      const {
        b64Screenshot,
        scale
      } = await d.getScreenshotForImageFind(...screen);
      b64Screenshot.should.not.eql(TINY_PNG);
      const screenshotObj = await _appiumSupport.imageUtil.getJimpImage(b64Screenshot);
      screenshotObj.bitmap.width.should.eql(screen[0]);
      screenshotObj.bitmap.height.should.eql(screen[1]);
      scale.should.eql({
        xScale: 1.5,
        yScale: 1.5
      });
    });
    it('should return scaled screenshot with different aspect ratio if not matching screen aspect ratio', async function () {
      const d = new TestDriver();

      _sinon.default.stub(d, 'getScreenshot').returns(TINY_PNG);

      let screen = [TINY_PNG_DIMS[0] * 2, TINY_PNG_DIMS[1] * 3];
      let expectedScale = {
        xScale: 2.67,
        yScale: 4
      };
      const {
        b64Screenshot,
        scale
      } = await d.getScreenshotForImageFind(...screen);
      b64Screenshot.should.not.eql(TINY_PNG);
      let screenshotObj = await _appiumSupport.imageUtil.getJimpImage(b64Screenshot);
      screenshotObj.bitmap.width.should.eql(screen[0]);
      screenshotObj.bitmap.height.should.eql(screen[1]);
      scale.xScale.toFixed(2).should.eql(expectedScale.xScale.toString());
      scale.yScale.should.eql(expectedScale.yScale);
      screen = [TINY_PNG_DIMS[0] * 3, TINY_PNG_DIMS[1] * 2];
      expectedScale = {
        xScale: 4,
        yScale: 2.67
      };
      const {
        b64Screenshot: newScreen,
        scale: newScale
      } = await d.getScreenshotForImageFind(...screen);
      newScreen.should.not.eql(TINY_PNG);
      screenshotObj = await _appiumSupport.imageUtil.getJimpImage(newScreen);
      screenshotObj.bitmap.width.should.eql(screen[0]);
      screenshotObj.bitmap.height.should.eql(screen[1]);
      newScale.xScale.should.eql(expectedScale.xScale);
      newScale.yScale.toFixed(2).should.eql(expectedScale.yScale.toString());
    });
    it('should return scaled screenshot with different aspect ratio if not matching screen aspect ratio with fixImageTemplateScale', async function () {
      const d = new TestDriver();

      _sinon.default.stub(d, 'getScreenshot').returns(TINY_PNG);

      let screen = [TINY_PNG_DIMS[0] * 2, TINY_PNG_DIMS[1] * 3];
      let expectedScale = {
        xScale: 2.67,
        yScale: 4
      };
      const {
        b64Screenshot,
        scale
      } = await d.getScreenshotForImageFind(...screen);
      b64Screenshot.should.not.eql(TINY_PNG);
      let screenshotObj = await _appiumSupport.imageUtil.getJimpImage(b64Screenshot);
      screenshotObj.bitmap.width.should.eql(screen[0]);
      screenshotObj.bitmap.height.should.eql(screen[1]);
      scale.xScale.toFixed(2).should.eql(expectedScale.xScale.toString());
      scale.yScale.should.eql(expectedScale.yScale);
      await _find.helpers.fixImageTemplateScale(b64Screenshot, {
        fixImageTemplateScale: true,
        scale
      }).should.eventually.eql('iVBORw0KGgoAAAANSUhEUgAAAAgAAAAMCAYAAABfnvydAAAAJ0lEQVR4AYXBAQEAIACDMKR/p0fTBrKdbZcPCRIkSJAgQYIECRIkPAzBA1TpeNwZAAAAAElFTkSuQmCC');
      screen = [TINY_PNG_DIMS[0] * 3, TINY_PNG_DIMS[1] * 2];
      expectedScale = {
        xScale: 4,
        yScale: 2.67
      };
      const {
        b64Screenshot: newScreen,
        scale: newScale
      } = await d.getScreenshotForImageFind(...screen);
      newScreen.should.not.eql(TINY_PNG);
      screenshotObj = await _appiumSupport.imageUtil.getJimpImage(newScreen);
      screenshotObj.bitmap.width.should.eql(screen[0]);
      screenshotObj.bitmap.height.should.eql(screen[1]);
      newScale.xScale.should.eql(expectedScale.xScale);
      newScale.yScale.toFixed(2).should.eql(expectedScale.yScale.toString());
      await _find.helpers.fixImageTemplateScale(newScreen, {
        fixImageTemplateScale: true,
        scale
      }).should.eventually.eql('iVBORw0KGgoAAAANSUhEUgAAAAwAAAAICAYAAADN5B7xAAAAI0lEQVR4AZXBAQEAMAyDMI5/T5W2ayB5245AIokkkkgiiST6+W4DTLyo5PUAAAAASUVORK5CYII=');
    });
  });
});
describe('custom element finding plugins', function () {
  it('should find a single element using a custom finder', async function () {
    const d = new _.BaseDriver();
    d.opts.customFindModules = {
      f: CUSTOM_FIND_MODULE
    };
    await d.findElement(_find.CUSTOM_STRATEGY, 'f:foo').should.eventually.eql('bar');
  });
  it('should not require selector prefix if only one find plugin is registered', async function () {
    const d = new _.BaseDriver();
    d.opts.customFindModules = {
      f: CUSTOM_FIND_MODULE
    };
    await d.findElement(_find.CUSTOM_STRATEGY, 'foo').should.eventually.eql('bar');
  });
  it('should find multiple elements using a custom finder', async function () {
    const d = new _.BaseDriver();
    d.opts.customFindModules = {
      f: CUSTOM_FIND_MODULE
    };
    await d.findElements(_find.CUSTOM_STRATEGY, 'f:foos').should.eventually.eql(['baz1', 'baz2']);
  });
  it('should give a hint to the plugin about whether multiple are requested', async function () {
    const d = new _.BaseDriver();
    d.opts.customFindModules = {
      f: CUSTOM_FIND_MODULE
    };
    await d.findElement(_find.CUSTOM_STRATEGY, 'f:foos').should.eventually.eql('bar1');
  });
  it('should be able to use multiple find modules', async function () {
    const d = new _.BaseDriver();
    d.opts.customFindModules = {
      f: CUSTOM_FIND_MODULE,
      g: CUSTOM_FIND_MODULE
    };
    await d.findElement(_find.CUSTOM_STRATEGY, 'f:foo').should.eventually.eql('bar');
    await d.findElement(_find.CUSTOM_STRATEGY, 'g:foo').should.eventually.eql('bar');
  });
  it('should throw an error if customFindModules is not set', async function () {
    const d = new _.BaseDriver();
    await d.findElement(_find.CUSTOM_STRATEGY, 'f:foo').should.eventually.be.rejectedWith(/customFindModules/);
  });
  it('should throw an error if customFindModules is the wrong shape', async function () {
    const d = new _.BaseDriver();
    d.opts.customFindModules = CUSTOM_FIND_MODULE;
    await d.findElement(_find.CUSTOM_STRATEGY, 'f:foo').should.eventually.be.rejectedWith(/customFindModules/);
  });
  it('should throw an error if customFindModules is size > 1 and no selector prefix is used', async function () {
    const d = new _.BaseDriver();
    d.opts.customFindModules = {
      f: CUSTOM_FIND_MODULE,
      g: CUSTOM_FIND_MODULE
    };
    await d.findElement(_find.CUSTOM_STRATEGY, 'foo').should.eventually.be.rejectedWith(/multiple element finding/i);
  });
  it('should throw an error in attempt to use unregistered plugin', async function () {
    const d = new _.BaseDriver();
    d.opts.customFindModules = {
      f: CUSTOM_FIND_MODULE,
      g: CUSTOM_FIND_MODULE
    };
    await d.findElement(_find.CUSTOM_STRATEGY, 'z:foo').should.eventually.be.rejectedWith(/was not registered/);
  });
  it('should throw an error if plugin cannot be loaded', async function () {
    const d = new _.BaseDriver();
    d.opts.customFindModules = {
      f: './foo.js'
    };
    await d.findElement(_find.CUSTOM_STRATEGY, 'f:foo').should.eventually.be.rejectedWith(/could not load/i);
  });
  it('should throw an error if plugin is not the right shape', async function () {
    const d = new _.BaseDriver();
    d.opts.customFindModules = {
      f: BAD_CUSTOM_FIND_MODULE
    };
    await d.findElement(_find.CUSTOM_STRATEGY, 'f:foo').should.eventually.be.rejectedWith(/constructed correctly/i);
  });
  it('should pass on an error thrown by the finder itself', async function () {
    const d = new _.BaseDriver();
    d.opts.customFindModules = {
      f: CUSTOM_FIND_MODULE
    };
    await d.findElement(_find.CUSTOM_STRATEGY, 'f:error').should.eventually.be.rejectedWith(/plugin error/i);
  });
  it('should throw no such element error if element not found', async function () {
    const d = new _.BaseDriver();
    d.opts.customFindModules = {
      f: CUSTOM_FIND_MODULE
    };
    await d.findElement(_find.CUSTOM_STRATEGY, 'f:nope').should.eventually.be.rejectedWith(/could not be located/);
  });
});require('source-map-support').install();


//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRlc3QvYmFzZWRyaXZlci9jb21tYW5kcy9maW5kLXNwZWNzLmpzIl0sIm5hbWVzIjpbInNob3VsZCIsImNoYWkiLCJ1c2UiLCJjaGFpQXNQcm9taXNlZCIsIlRlc3REcml2ZXIiLCJCYXNlRHJpdmVyIiwiZ2V0V2luZG93U2l6ZSIsImdldFNjcmVlbnNob3QiLCJDVVNUT01fRklORF9NT0RVTEUiLCJwYXRoIiwicmVzb2x2ZSIsIl9fZGlybmFtZSIsIkJBRF9DVVNUT01fRklORF9NT0RVTEUiLCJUSU5ZX1BORyIsIlRJTllfUE5HX0RJTVMiLCJkZXNjcmliZSIsIml0IiwiZCIsInNpbm9uIiwic3R1YiIsInJldHVybnMiLCJmaW5kRWxlbWVudCIsIklNQUdFX1NUUkFURUdZIiwiZXZlbnR1YWxseSIsImJlIiwidHJ1ZSIsImZpbmRFbGVtZW50cyIsImZpbmRFbGVtZW50RnJvbUVsZW1lbnQiLCJyZWplY3RlZFdpdGgiLCJmaW5kRWxlbWVudHNGcm9tRWxlbWVudCIsInJlY3QiLCJ4IiwieSIsIndpZHRoIiwiaGVpZ2h0Iiwic2l6ZSIsInNjcmVlbnNob3QiLCJ0ZW1wbGF0ZSIsImJhc2ljU3R1YiIsImRyaXZlciIsInNpemVTdHViIiwic2NyZWVuU3R1YiIsImNvbXBhcmVTdHViIiwiYmFzaWNJbWdFbFZlcmlmeSIsImltZ0VsUHJvdG8iLCJpbWdFbElkIiwiRUxFTUVOVCIsIl9pbWdFbENhY2hlIiwiaGFzIiwiaW1nRWwiLCJnZXQiLCJJbWFnZUVsZW1lbnQiLCJlcWwiLCJmaW5kQnlJbWFnZSIsIm11bHRpcGxlIiwiZWxzIiwiaGF2ZSIsImxlbmd0aCIsIm5ld1RlbXBsYXRlIiwic2V0dGluZ3MiLCJ1cGRhdGUiLCJmaXhJbWFnZVRlbXBsYXRlU2l6ZSIsImFyZ3MiLCJmaXhJbWFnZVRlbXBsYXRlU2NhbGUiLCJjYWxsQ291bnQiLCJ0aHJvd3MiLCJFcnJvciIsInNldEltcGxpY2l0V2FpdCIsIm9uQ2FsbCIsInNob3VsZENoZWNrU3RhbGVuZXNzIiwiaWQiLCJmYWxzZSIsImhlbHBlcnMiLCJhY3R1YWwiLCJ4U2NhbGUiLCJ5U2NhbGUiLCJkZWZhdWx0SW1hZ2VUZW1wbGF0ZVNjYWxlIiwiaWdub3JlRGVmYXVsdEltYWdlVGVtcGxhdGVTY2FsZSIsInNjcmVlbiIsIm1hcCIsIm4iLCJlbnN1cmVUZW1wbGF0ZVNpemUiLCJub3QiLCJiZWxvdyIsImdldFNjcmVlbnNob3RGb3JJbWFnZUZpbmQiLCJmaXhJbWFnZUZpbmRTY3JlZW5zaG90RGltcyIsImI2NFNjcmVlbnNob3QiLCJzY2FsZSIsImVxdWFsIiwidW5kZWZpbmVkIiwic2NyZWVuc2hvdE9iaiIsImltYWdlVXRpbCIsImdldEppbXBJbWFnZSIsImJpdG1hcCIsImV4cGVjdGVkU2NhbGUiLCJ0b0ZpeGVkIiwidG9TdHJpbmciLCJuZXdTY3JlZW4iLCJuZXdTY2FsZSIsIm9wdHMiLCJjdXN0b21GaW5kTW9kdWxlcyIsImYiLCJDVVNUT01fU1RSQVRFR1kiLCJnIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFHQSxNQUFNQSxNQUFNLEdBQUdDLGNBQUtELE1BQUwsRUFBZjs7QUFDQUMsY0FBS0MsR0FBTCxDQUFTQyx1QkFBVDs7QUFHQSxNQUFNQyxVQUFOLFNBQXlCQyxZQUF6QixDQUFvQztBQUNsQyxRQUFNQyxhQUFOLEdBQXVCLENBQUU7O0FBQ3pCLFFBQU1DLGFBQU4sR0FBdUIsQ0FBRTs7QUFGUzs7QUFLcEMsTUFBTUMsa0JBQWtCLEdBQUdDLGNBQUtDLE9BQUwsQ0FBYUMsU0FBYixFQUF3QixJQUF4QixFQUE4QixJQUE5QixFQUFvQyxJQUFwQyxFQUEwQyxJQUExQyxFQUN6QixNQUR5QixFQUNqQixZQURpQixFQUNILFVBREcsRUFDUyx1QkFEVCxDQUEzQjs7QUFFQSxNQUFNQyxzQkFBc0IsR0FBR0gsY0FBS0MsT0FBTCxDQUFhQyxTQUFiLEVBQXdCLElBQXhCLEVBQThCLElBQTlCLEVBQW9DLElBQXBDLEVBQTBDLElBQTFD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SUFBRixDQUFPQyxpQkFBUCxHQUEyQjtBQUFDQyxNQUFBQSxDQUFDLEVBQUU3RjtBQUFKLEtBQTNCO0FBQ0EsVUFBTVMsQ0FBQyxDQUFDSSxXQUFGLENBQWNpRixxQkFBZCxFQUErQixRQUEvQixFQUF5Q3RHLE1BQXpDLENBQWdEdUIsVUFBaEQsQ0FBMkRDLEVBQTNELENBQThESSxZQUE5RCxDQUEyRSxzQkFBM0UsQ0FBTjtBQUNELEdBSkMsQ0FBRjtBQUtELENBckVPLENBQVIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgY2hhaSBmcm9tICdjaGFpJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IGNoYWlBc1Byb21pc2VkIGZyb20gJ2NoYWktYXMtcHJvbWlzZWQnO1xuaW1wb3J0IHNpbm9uIGZyb20gJ3Npbm9uJztcbmltcG9ydCB7IEJhc2VEcml2ZXIsIEltYWdlRWxlbWVudCB9IGZyb20gJy4uLy4uLy4uJztcbmltcG9ydCB7IElNQUdFX1NUUkFURUdZLCBDVVNUT01fU1RSQVRFR1ksIGhlbHBlcnMgfSBmcm9tICcuLi8uLi8uLi9saWIvYmFzZWRyaXZlci9jb21tYW5kcy9maW5kJztcbmltcG9ydCB7IGltYWdlVXRpbCB9IGZyb20gJ2FwcGl1bS1zdXBwb3J0JztcblxuXG5jb25zdCBzaG91bGQgPSBjaGFpLnNob3VsZCgpO1xuY2hhaS51c2UoY2hhaUFzUHJvbWlzZWQpO1xuXG5cbmNsYXNzIFRlc3REcml2ZXIgZXh0ZW5kcyBCYXNlRHJpdmVyIHtcbiAgYXN5bmMgZ2V0V2luZG93U2l6ZSAoKSB7fVxuICBhc3luYyBnZXRTY3JlZW5zaG90ICgpIHt9XG59XG5cbmNvbnN0IENVU1RPTV9GSU5EX01PRFVMRSA9IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLicsICcuLicsICcuLicsICcuLicsXG4gICd0ZXN0JywgJ2Jhc2Vkcml2ZXInLCAnZml4dHVyZXMnLCAnY3VzdG9tLWVsZW1lbnQtZmluZGVyJyk7XG5jb25zdCBCQURfQ1VTVE9NX0ZJTkRfTU9EVUxFID0gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uJywgJy4uJywgJy4uJywgJy4uJyxcbiAgJ3Rlc3QnLCAnYmFzZWRyaXZlcicsICdmaXh0dXJlcycsICdjdXN0b20tZWxlbWVudC1maW5kZXItYmFkJyk7XG5cbmNvbnN0IFRJTllfUE5HID0gJ2lWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFBUUFBQUFFQ0FJQUFBQW1rd2twQUFBQUdYUkZXSFJUYjJaMGQyRnlaUUJCWkc5aVpTQkpiV0ZuWlZKbFlXUjVjY2xsUEFBQUF5aHBWRmgwV0UxTU9tTnZiUzVoWkc5aVpTNTRiWEFBQUFBQUFEdy9lSEJoWTJ0bGRDQmlaV2RwYmowaTc3dS9JaUJwWkQwaVZ6Vk5NRTF3UTJWb2FVaDZjbVZUZWs1VVkzcHJZemxrSWo4K0lEeDRPbmh0Y0cxbGRHRWdlRzFzYm5NNmVEMGlZV1J2WW1VNmJuTTZiV1YwWVM4aUlIZzZlRzF3ZEdzOUlrRmtiMkpsSUZoTlVDQkRiM0psSURVdU5pMWpNVFF3SURjNUxqRTJNRFExTVN3Z01qQXhOeTh3TlM4d05pMHdNVG93T0RveU1TQWdJQ0FnSUNBZ0lqNGdQSEprWmpwU1JFWWdlRzFzYm5NNmNtUm1QU0pvZEhSd09pOHZkM2QzTG5jekxtOXlaeTh4T1RrNUx6QXlMekl5TFhKa1ppMXplVzUwWVhndGJuTWpJajRnUEhKa1pqcEVaWE5qY21sd2RHbHZiaUJ5WkdZNllXSnZkWFE5SWlJZ2VHMXNibk02ZUcxd1BTSm9kSFJ3T2k4dmJuTXVZV1J2WW1VdVkyOXRMM2hoY0M4eExqQXZJaUI0Yld4dWN6cDRiWEJOVFQwaWFIUjBjRG92TDI1ekxtRmtiMkpsTG1OdmJTOTRZWEF2TVM0d0wyMXRMeUlnZUcxc2JuTTZjM1JTWldZOUltaDBkSEE2THk5dWN5NWhaRzlpWlM1amIyMHZlR0Z3THpFdU1DOXpWSGx3WlM5U1pYTnZkWEpqWlZKbFppTWlJSGh0Y0RwRGNtVmhkRzl5Vkc5dmJEMGlRV1J2WW1VZ1VHaHZkRzl6YUc5d0lFTkRJREl3TVRnZ0tFMWhZMmx1ZEc5emFDa2lJSGh0Y0UxTk9rbHVjM1JoYm1ObFNVUTlJbmh0Y0M1cGFXUTZOME5ETURNNE1ETTROMFUyTVRGRk9FRXpNemhHTVRSRk5VVXdOekl3TlVJaUlIaHRjRTFOT2tSdlkzVnRaVzUwU1VROUluaHRjQzVrYVdRNk4wTkRNRE00TURRNE4wVTJNVEZGT0VFek16aEdNVFJGTlVVd056SXdOVUlpUGlBOGVHMXdUVTA2UkdWeWFYWmxaRVp5YjIwZ2MzUlNaV1k2YVc1emRHRnVZMlZKUkQwaWVHMXdMbWxwWkRvM1EwTXdNemd3TVRnM1JUWXhNVVU0UVRNek9FWXhORVUxUlRBM01qQTFRaUlnYzNSU1pXWTZaRzlqZFcxbGJuUkpSRDBpZUcxd0xtUnBaRG8zUTBNd016Z3dNamczUlRZeE1VVTRRVE16T0VZeE5FVTFSVEEzTWpBMVFpSXZQaUE4TDNKa1pqcEVaWE5qY21sd2RHbHZiajRnUEM5eVpHWTZVa1JHUGlBOEwzZzZlRzF3YldWMFlUNGdQRDk0Y0dGamEyVjBJR1Z1WkQwaWNpSS9QcGR2SmpRQUFBQWxTVVJCVkhqYUpJbkJFUUFBQ0lLdy9YZTJVbDV3WUJ0d21KcWtrNCt6ZnZVUVZvQUJBRWcwRWZyWndjMGhBQUFBQUVsRlRrU3VRbUNDJztcbmNvbnN0IFRJTllfUE5HX0RJTVMgPSBbNCwgNF07XG5cbmRlc2NyaWJlKCdmaW5kaW5nIGVsZW1lbnRzIGJ5IGltYWdlJywgZnVuY3Rpb24gKCkge1xuICBkZXNjcmliZSgnZmluZEVsZW1lbnQnLCBmdW5jdGlvbiAoKSB7XG4gICAgaXQoJ3Nob3VsZCB1c2UgYSBkaWZmZXJlbnQgc3BlY2lhbCBtZXRob2QgdG8gZmluZCBlbGVtZW50IGJ5IGltYWdlJywgYXN5bmMgZnVuY3Rpb24gKCkge1xuICAgICAgY29uc3QgZCA9IG5ldyBUZXN0RHJpdmVyKCk7XG4gICAgICBzaW5vbi5zdHViKGQsICdmaW5kQnlJbWFnZScpLnJldHVybnModHJ1ZSk7XG4gICAgICBzaW5vbi5zdHViKGQsICdmaW5kRWxPckVsc1dpdGhQcm9jZXNzaW5nJykucmV0dXJucyhmYWxzZSk7XG4gICAgICBhd2FpdCBkLmZpbmRFbGVtZW50KElNQUdFX1NUUkFURUdZLCAnZm9vJykuc2hvdWxkLmV2ZW50dWFsbHkuYmUudHJ1ZTtcbiAgICAgIGF3YWl0IGQuZmluZEVsZW1lbnRzKElNQUdFX1NUUkFURUdZLCAnZm9vJykuc2hvdWxkLmV2ZW50dWFsbHkuYmUudHJ1ZTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIG5vdCBiZSBhYmxlIHRvIGZpbmQgaW1hZ2UgZWxlbWVudCBmcm9tIGFueSBvdGhlciBlbGVtZW50JywgYXN5bmMgZnVuY3Rpb24gKCkge1xuICAgICAgY29uc3QgZCA9IG5ldyBUZXN0RHJpdmVyKCk7XG4gICAgICBhd2FpdCBkLmZpbmRFbGVtZW50RnJvbUVsZW1lbnQoSU1BR0VfU1RSQVRFR1ksICdmb28nLCAnZWxJZCcpXG4gICAgICAgIC5zaG91bGQuZXZlbnR1YWxseS5iZS5yZWplY3RlZFdpdGgoL0xvY2F0b3IgU3RyYXRlZ3kuK2lzIG5vdCBzdXBwb3J0ZWQvKTtcbiAgICAgIGF3YWl0IGQuZmluZEVsZW1lbnRzRnJvbUVsZW1lbnQoSU1BR0VfU1RSQVRFR1ksICdmb28nLCAnZWxJZCcpXG4gICAgICAgIC5zaG91bGQuZXZlbnR1YWxseS5iZS5yZWplY3RlZFdpdGgoL0xvY2F0b3IgU3RyYXRlZ3kuK2lzIG5vdCBzdXBwb3J0ZWQvKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ2ZpbmRCeUltYWdlJywgZnVuY3Rpb24gKCkge1xuICAgIGNvbnN0IHJlY3QgPSB7eDogMTAsIHk6IDIwLCB3aWR0aDogMzAsIGhlaWdodDogNDB9O1xuICAgIGNvbnN0IHNpemUgPSB7d2lkdGg6IDEwMCwgaGVpZ2h0OiAyMDB9O1xuICAgIGNvbnN0IHNjcmVlbnNob3QgPSAnaVZCT1Jmb28nO1xuICAgIGNvbnN0IHRlbXBsYXRlID0gJ2lWQk9SYmFyJztcblxuICAgIGZ1bmN0aW9uIGJhc2ljU3R1YiAoZHJpdmVyKSB7XG4gICAgICBjb25zdCBzaXplU3R1YiA9IHNpbm9uLnN0dWIoZHJpdmVyLCAnZ2V0V2luZG93U2l6ZScpLnJldHVybnMoc2l6ZSk7XG4gICAgICBjb25zdCBzY3JlZW5TdHViID0gc2lub24uc3R1Yihkcml2ZXIsICdnZXRTY3JlZW5zaG90Rm9ySW1hZ2VGaW5kJykucmV0dXJucyhzY3JlZW5zaG90KTtcbiAgICAgIGNvbnN0IGNvbXBhcmVTdHViID0gc2lub24uc3R1Yihkcml2ZXIsICdjb21wYXJlSW1hZ2VzJykucmV0dXJucyh7cmVjdH0pO1xuICAgICAgcmV0dXJuIHtzaXplU3R1Yiwgc2NyZWVuU3R1YiwgY29tcGFyZVN0dWJ9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGJhc2ljSW1nRWxWZXJpZnkgKGltZ0VsUHJvdG8sIGRyaXZlcikge1xuICAgICAgY29uc3QgaW1nRWxJZCA9IGltZ0VsUHJvdG8uRUxFTUVOVDtcbiAgICAgIGRyaXZlci5faW1nRWxDYWNoZS5oYXMoaW1nRWxJZCkuc2hvdWxkLmJlLnRydWU7XG4gICAgICBjb25zdCBpbWdFbCA9IGRyaXZlci5faW1nRWxDYWNoZS5nZXQoaW1nRWxJZCk7XG4gICAgICAoaW1nRWwgaW5zdGFuY2VvZiBJbWFnZUVsZW1lbnQpLnNob3VsZC5iZS50cnVlO1xuICAgICAgaW1nRWwucmVjdC5zaG91bGQuZXFsKHJlY3QpO1xuICAgICAgcmV0dXJuIGltZ0VsO1xuICAgIH1cblxuICAgIGl0KCdzaG91bGQgZmluZCBhbiBpbWFnZSBlbGVtZW50IGhhcHB5cGF0aCcsIGFzeW5jIGZ1bmN0aW9uICgpIHtcbiAgICAgIGNvbnN0IGQgPSBuZXcgVGVzdERyaXZlcigpO1xuICAgICAgYmFzaWNTdHViKGQpO1xuICAgICAgY29uc3QgaW1nRWxQcm90byA9IGF3YWl0IGQuZmluZEJ5SW1hZ2UodGVtcGxhdGUsIHttdWx0aXBsZTogZmFsc2V9KTtcbiAgICAgIGJhc2ljSW1nRWxWZXJpZnkoaW1nRWxQcm90bywgZCk7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCBmaW5kIGltYWdlIGVsZW1lbnRzIGhhcHB5cGF0aCcsIGFzeW5jIGZ1bmN0aW9uICgpIHtcbiAgICAgIGNvbnN0IGQgPSBuZXcgVGVzdERyaXZlcigpO1xuICAgICAgYmFzaWNTdHViKGQpO1xuICAgICAgY29uc3QgZWxzID0gYXdhaXQgZC5maW5kQnlJbWFnZSh0ZW1wbGF0ZSwge211bHRpcGxlOiB0cnVlfSk7XG4gICAgICBlbHMuc2hvdWxkLmhhdmUubGVuZ3RoKDEpO1xuICAgICAgYmFzaWNJbWdFbFZlcmlmeShlbHNbMF0sIGQpO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgZmFpbCBpZiBkcml2ZXIgZG9lcyBub3Qgc3VwcG9ydCBnZXRXaW5kb3dTaXplJywgYXN5bmMgZnVuY3Rpb24gKCkge1xuICAgICAgY29uc3QgZCA9IG5ldyBCYXNlRHJpdmVyKCk7XG4gICAgICBhd2FpdCBkLmZpbmRCeUltYWdlKHRlbXBsYXRlLCB7bXVsdGlwbGU6IGZhbHNlfSlcbiAgICAgICAgLnNob3VsZC5ldmVudHVhbGx5LmJlLnJlamVjdGVkV2l0aCgvZHJpdmVyIGRvZXMgbm90IHN1cHBvcnQvKTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIGZpeCB0ZW1wbGF0ZSBzaXplIGlmIHJlcXVlc3RlZCcsIGFzeW5jIGZ1bmN0aW9uICgpIHtcbiAgICAgIGNvbnN0IGQgPSBuZXcgVGVzdERyaXZlcigpO1xuICAgICAgY29uc3QgbmV3VGVtcGxhdGUgPSAnaVZCT1JiYXonO1xuICAgICAgY29uc3Qge2NvbXBhcmVTdHVifSA9IGJhc2ljU3R1YihkKTtcbiAgICAgIGF3YWl0IGQuc2V0dGluZ3MudXBkYXRlKHtmaXhJbWFnZVRlbXBsYXRlU2l6ZTogdHJ1ZX0pO1xuICAgICAgc2lub24uc3R1YihkLCAnZW5zdXJlVGVtcGxhdGVTaXplJykucmV0dXJucyhuZXdUZW1wbGF0ZSk7XG4gICAgICBjb25zdCBpbWdFbFByb3RvID0gYXdhaXQgZC5maW5kQnlJbWFnZSh0ZW1wbGF0ZSwge211bHRpcGxlOiBmYWxzZX0pO1xuICAgICAgY29uc3QgaW1nRWwgPSBiYXNpY0ltZ0VsVmVyaWZ5KGltZ0VsUHJvdG8sIGQpO1xuICAgICAgaW1nRWwudGVtcGxhdGUuc2hvdWxkLmVxbChuZXdUZW1wbGF0ZSk7XG4gICAgICBjb21wYXJlU3R1Yi5hcmdzWzBdWzJdLnNob3VsZC5lcWwobmV3VGVtcGxhdGUpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBmaXggdGVtcGxhdGUgc2l6ZSBzY2FsZSBpZiByZXF1ZXN0ZWQnLCBhc3luYyBmdW5jdGlvbiAoKSB7XG4gICAgICBjb25zdCBkID0gbmV3IFRlc3REcml2ZXIoKTtcbiAgICAgIGNvbnN0IG5ld1RlbXBsYXRlID0gJ2lWQk9SYmF6JztcbiAgICAgIGNvbnN0IHtjb21wYXJlU3R1Yn0gPSBiYXNpY1N0dWIoZCk7XG4gICAgICBhd2FpdCBkLnNldHRpbmdzLnVwZGF0ZSh7Zml4SW1hZ2VUZW1wbGF0ZVNjYWxlOiB0cnVlfSk7XG4gICAgICBzaW5vbi5zdHViKGQsICdmaXhJbWFnZVRlbXBsYXRlU2NhbGUnKS5yZXR1cm5zKG5ld1RlbXBsYXRlKTtcbiAgICAgIGNvbnN0IGltZ0VsUHJvdG8gPSBhd2FpdCBkLmZpbmRCeUltYWdlKHRlbXBsYXRlLCB7bXVsdGlwbGU6IGZhbHNlfSk7XG4gICAgICBjb25zdCBpbWdFbCA9IGJhc2ljSW1nRWxWZXJpZnkoaW1nRWxQcm90bywgZCk7XG4gICAgICBpbWdFbC50ZW1wbGF0ZS5zaG91bGQuZXFsKG5ld1RlbXBsYXRlKTtcbiAgICAgIGNvbXBhcmVTdHViLmFyZ3NbMF1bMl0uc2hvdWxkLmVxbChuZXdUZW1wbGF0ZSk7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCBub3QgZml4IHRlbXBsYXRlIHNpemUgc2NhbGUgaWYgaXQgaXMgbm90IHJlcXVlc3RlZCcsIGFzeW5jIGZ1bmN0aW9uICgpIHtcbiAgICAgIGNvbnN0IGQgPSBuZXcgVGVzdERyaXZlcigpO1xuICAgICAgY29uc3QgbmV3VGVtcGxhdGUgPSAnaVZCT1JiYXonO1xuICAgICAgYmFzaWNTdHViKGQpO1xuICAgICAgYXdhaXQgZC5zZXR0aW5ncy51cGRhdGUoe30pO1xuICAgICAgc2lub24uc3R1YihkLCAnZml4SW1hZ2VUZW1wbGF0ZVNjYWxlJykucmV0dXJucyhuZXdUZW1wbGF0ZSk7XG4gICAgICBkLmZpeEltYWdlVGVtcGxhdGVTY2FsZS5jYWxsQ291bnQuc2hvdWxkLmVxbCgwKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgdGhyb3cgYW4gZXJyb3IgaWYgdGVtcGxhdGUgbWF0Y2ggZmFpbHMnLCBhc3luYyBmdW5jdGlvbiAoKSB7XG4gICAgICBjb25zdCBkID0gbmV3IFRlc3REcml2ZXIoKTtcbiAgICAgIGNvbnN0IHtjb21wYXJlU3R1Yn0gPSBiYXNpY1N0dWIoZCk7XG4gICAgICBjb21wYXJlU3R1Yi50aHJvd3MobmV3IEVycm9yKCdDYW5ub3QgZmluZCBhbnkgb2NjdXJyZW5jZXMnKSk7XG4gICAgICBhd2FpdCBkLmZpbmRCeUltYWdlKHRlbXBsYXRlLCB7bXVsdGlwbGU6IGZhbHNlfSlcbiAgICAgICAgLnNob3VsZC5ldmVudHVhbGx5LmJlLnJlamVjdGVkV2l0aCgvZWxlbWVudCBjb3VsZCBub3QgYmUgbG9jYXRlZC8pO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmV0dXJuIGVtcHR5IGFycmF5IGZvciBtdWx0aXBsZSBlbGVtZW50cyBpZiB0ZW1wbGF0ZSBtYXRjaCBmYWlscycsIGFzeW5jIGZ1bmN0aW9uICgpIHtcbiAgICAgIGNvbnN0IGQgPSBuZXcgVGVzdERyaXZlcigpO1xuICAgICAgY29uc3Qge2NvbXBhcmVTdHVifSA9IGJhc2ljU3R1YihkKTtcbiAgICAgIGNvbXBhcmVTdHViLnRocm93cyhuZXcgRXJyb3IoJ0Nhbm5vdCBmaW5kIGFueSBvY2N1cnJlbmNlcycpKTtcbiAgICAgIGF3YWl0IGQuZmluZEJ5SW1hZ2UodGVtcGxhdGUsIHttdWx0aXBsZTogdHJ1ZX0pLnNob3VsZC5ldmVudHVhbGx5LmVxbChbXSk7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXNwZWN0IGltcGxpY2l0IHdhaXQnLCBhc3luYyBmdW5jdGlvbiAoKSB7XG4gICAgICBjb25zdCBkID0gbmV3IFRlc3REcml2ZXIoKTtcbiAgICAgIGQuc2V0SW1wbGljaXRXYWl0KDEwKTtcbiAgICAgIGNvbnN0IHtjb21wYXJlU3R1Yn0gPSBiYXNpY1N0dWIoZCk7XG4gICAgICBjb21wYXJlU3R1Yi5vbkNhbGwoMCkudGhyb3dzKG5ldyBFcnJvcignQ2Fubm90IGZpbmQgYW55IG9jY3VycmVuY2VzJykpO1xuICAgICAgY29uc3QgaW1nRWxQcm90byA9IGF3YWl0IGQuZmluZEJ5SW1hZ2UodGVtcGxhdGUsIHttdWx0aXBsZTogZmFsc2V9KTtcbiAgICAgIGJhc2ljSW1nRWxWZXJpZnkoaW1nRWxQcm90bywgZCk7XG4gICAgICBjb21wYXJlU3R1Yi5jYWxsQ291bnQuc2hvdWxkLmVxbCgyKTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIG5vdCBhZGQgZWxlbWVudCB0byBjYWNoZSBhbmQgcmV0dXJuIGl0IGRpcmVjdGx5IHdoZW4gY2hlY2tpbmcgc3RhbGVuZXNzJywgYXN5bmMgZnVuY3Rpb24gKCkge1xuICAgICAgY29uc3QgZCA9IG5ldyBUZXN0RHJpdmVyKCk7XG4gICAgICBiYXNpY1N0dWIoZCk7XG4gICAgICBjb25zdCBpbWdFbCA9IGF3YWl0IGQuZmluZEJ5SW1hZ2UodGVtcGxhdGUsIHttdWx0aXBsZTogZmFsc2UsIHNob3VsZENoZWNrU3RhbGVuZXNzOiB0cnVlfSk7XG4gICAgICAoaW1nRWwgaW5zdGFuY2VvZiBJbWFnZUVsZW1lbnQpLnNob3VsZC5iZS50cnVlO1xuICAgICAgZC5faW1nRWxDYWNoZS5oYXMoaW1nRWwuaWQpLnNob3VsZC5iZS5mYWxzZTtcbiAgICAgIGltZ0VsLnJlY3Quc2hvdWxkLmVxbChyZWN0KTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgZGVzY3JpYmUoJ2ZpeEltYWdlVGVtcGxhdGVTY2FsZScsIGZ1bmN0aW9uICgpIHtcbiAgICBpdCgnc2hvdWxkIG5vdCBmaXggdGVtcGxhdGUgc2l6ZSBzY2FsZSBpZiBubyBzY2FsZSB2YWx1ZScsIGFzeW5jIGZ1bmN0aW9uICgpIHtcbiAgICAgIGNvbnN0IG5ld1RlbXBsYXRlID0gJ2lWQk9SYmF6JztcbiAgICAgIGF3YWl0IGhlbHBlcnMuZml4SW1hZ2VUZW1wbGF0ZVNjYWxlKG5ld1RlbXBsYXRlLCB7Zml4SW1hZ2VUZW1wbGF0ZVNjYWxlOiB0cnVlfSlcbiAgICAgICAgLnNob3VsZC5ldmVudHVhbGx5LmVxbChuZXdUZW1wbGF0ZSk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIG5vdCBmaXggdGVtcGxhdGUgc2l6ZSBzY2FsZSBpZiBpdCBpcyBudWxsJywgYXN5bmMgZnVuY3Rpb24gKCkge1xuICAgICAgY29uc3QgbmV3VGVtcGxhdGUgPSAnaVZCT1JiYXonO1xuICAgICAgYXdhaXQgaGVscGVycy5maXhJbWFnZVRlbXBsYXRlU2NhbGUobmV3VGVtcGxhdGUsIG51bGwpXG4gICAgICAgIC5zaG91bGQuZXZlbnR1YWxseS5lcWwobmV3VGVtcGxhdGUpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBub3QgZml4IHRlbXBsYXRlIHNpemUgc2NhbGUgaWYgaXQgaXMgbm90IG51bWJlcicsIGFzeW5jIGZ1bmN0aW9uICgpIHtcbiAgICAgIGNvbnN0IG5ld1RlbXBsYXRlID0gJ2lWQk9SYmF6JztcbiAgICAgIGF3YWl0IGhlbHBlcnMuZml4SW1hZ2VUZW1wbGF0ZVNjYWxlKG5ld1RlbXBsYXRlLCAnd3Jvbmctc2NhbGUnKVxuICAgICAgICAuc2hvdWxkLmV2ZW50dWFsbHkuZXFsKG5ld1RlbXBsYXRlKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgZml4IHRlbXBsYXRlIHNpemUgc2NhbGUnLCBhc3luYyBmdW5jdGlvbiAoKSB7XG4gICAgICBjb25zdCBhY3R1YWwgPSAnaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQUFZQUFBQUdDQVlBQUFEZ3pPOUlBQUFBV0VsRVFWUjRBVTNCUVJXQVFBaEF3YS9QR0JzRWdyQzE2QUZCS0VJUFhXN09YTytSbWV5OWlRak1qSEZ6ckxVd003cWJxbUxjSEtwS1JGQlZ1RHZqNGFncTNCMVZSVVFZVDJiUzNRd1JRVlVaRi9DYUdSSEIzd2MxdlNaYkhPNStCZ0FBQUFCSlJVNUVya0pnZ2c9PSc7XG4gICAgICBhd2FpdCBoZWxwZXJzLmZpeEltYWdlVGVtcGxhdGVTY2FsZShUSU5ZX1BORywge1xuICAgICAgICBmaXhJbWFnZVRlbXBsYXRlU2NhbGU6IHRydWUsIHhTY2FsZTogMS41LCB5U2NhbGU6IDEuNVxuICAgICAgfSkuc2hvdWxkLmV2ZW50dWFsbHkuZXFsKGFjdHVhbCk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIG5vdCBmaXggdGVtcGxhdGUgc2l6ZSBzY2FsZSBiZWNhdXNlIG9mIGZpeEltYWdlVGVtcGxhdGVTY2FsZSBpcyBmYWxzZScsIGFzeW5jIGZ1bmN0aW9uICgpIHtcbiAgICAgIGF3YWl0IGhlbHBlcnMuZml4SW1hZ2VUZW1wbGF0ZVNjYWxlKFRJTllfUE5HLCB7XG4gICAgICAgIGZpeEltYWdlVGVtcGxhdGVTY2FsZTogZmFsc2UsIHhTY2FsZTogMS41LCB5U2NhbGU6IDEuNVxuICAgICAgfSkuc2hvdWxkLmV2ZW50dWFsbHkuZXFsKFRJTllfUE5HKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgZml4IHRlbXBsYXRlIHNpemUgc2NhbGUgd2l0aCBkZWZhdWx0IHNjYWxlJywgYXN5bmMgZnVuY3Rpb24gKCkge1xuICAgICAgY29uc3QgYWN0dWFsID0gJ2lWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFCQUFBQUFRQ0FZQUFBQWY4LzloQUFBQndVbEVRVlI0QWFYQlBVc3JRUUNHMFNlWCtjQmRrVGp3VHBHMU5QZ0xwalkvZlcxc3R0NFVZbW0yY0pxd01Dc2F3NzB1SkozQ0JjOVovUDNDbCsxMlM5dTJ0RzFMMjdiRUdMbS92MmV6MmJEWmJKREVkLzd3UzRZVDd6M1gxOWZjM054d2QzZEhYZGQ0N3huSGtlZm5aOFp4cEtvcTZycW1xaXFNTWN3TUoxVlYwVFFOMHpUaG5PUGo0NE82cnNrNTAzVWRrbWlhaHFacFdLMVdHR09ZR1U3cXVxWnBHcXkxU0NMblRNNloxOWRYY3M1SVlwb21yTFZJNHVMaWdwbmhwS29xVnFzVmtqZ2NEanc5UGRGMUhUbG51cTVERXM0NUpIRTRIRGd6bkJ5UFI5N2UzcGltaVZJSzR6aHlQQjd4M2hOQ0lJVEE1ZVVsM25zV2l3Vm5ocE5TQ3NNd3NOdnRHSWFCL1g1UEtRVkpwSlNReEhxOVJoTE9PYzRNSjlNMHNkdnQyRzYzOUgzUFRCSXhSaVFoQ1VuRUdMSFdjbVk0S2FVd0RBTjkzL1A0K01oeXVTU2xoQ1JTU2tqQ09ZZTFGbXN0WjZidmUyWXZMeS9zOTN0bXkrVVNTVWhDRXBJSUlmQWQ4L0R3d096OS9aMVNDcEpJS1NHSjlYcU5KSnh6L01TMGJjdnM2dW9LU2NRWWtZUWtKQkZqeEZyTFQwemJ0c3h1YjI5SktTR0psQktTY001aHJjVmF5MDlNenBsWmpKSFB6MCs4OTRRUUNDSHdQLzd3Uy84QTRlNm5BZytSOEx3QUFBQUFTVVZPUks1Q1lJST0nO1xuICAgICAgYXdhaXQgaGVscGVycy5maXhJbWFnZVRlbXBsYXRlU2NhbGUoVElOWV9QTkcsIHtcbiAgICAgICAgZGVmYXVsdEltYWdlVGVtcGxhdGVTY2FsZTogNC4wXG4gICAgICB9KS5zaG91bGQuZXZlbnR1YWxseS5lcWwoYWN0dWFsKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgZml4IHRlbXBsYXRlIHNpemUgc2NhbGUgd2l0aCBkZWZhdWx0IHNjYWxlIGFuZCBpbWFnZSBzY2FsZScsIGFzeW5jIGZ1bmN0aW9uICgpIHtcbiAgICAgIGNvbnN0IGFjdHVhbCA9ICdpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBQmdBQUFBWUNBWUFBQURnZHozNEFBQUNhVWxFUVZSNEFiWEJNV3ZyV0JTRjBjOUJzRlB0VzkxVVIxVTYrLy8vRktsS0t0OHFxbnlxbk1vemdna0k4eGdNajZ4MXV2K0wvNnpyeXJJc3JPdktzaXlzNjhxeUxGd3VGODduTTVmTGhmUDV6T1Z5NFh3Kzg0d1hmdGtMdjJ6aVFCSzI2YjBURVZRVnU0akFOcnZNNUhxOXNwT0VKQ1FoQ1VsSTRtamlRQksyNmIxVFZld2tZUnZiN0RLVE1RYVppVzFzMDFyRE5yYVJ4TkhFZ1NSYWExUVZPMG0wMWpqS1RES1RYZStkM2p0VnhVNFNqeVlPSkdHYm5TUnMwM3NuTThsTU1wUGI3VVpta3BsRUJGWEZUaEsyZVRSeElBbmJTTUkyVmNYMzl6ZGpETVlZWkNhWnlSaURNUVpWeFU0U3Rxa3FIazBjU0VJU2Y1S1o3REtUTVFiTHNyQ1RSR3VOM2p0VnhhT0pnNnFpcXFncXFvcXFvcW9ZWTVDWjdHd1RFZHp2ZDk3ZjM0a0lldS9ZUmhLUEpnNnFpc3drTTduZGJtUW1tVWxta3Buc2JCTVIyQ1lpbU9lWjNqdTJrY1NqaVlPcUlqUDUrdnBpMnphMmJXUGJObzVhYTdUVzJQWGU2YjNUZTZlMWhpUWVUUnhVRmJmYmpXM2JHR053dlY0WlkyQWIyN1RXc0kxdGJHTWIyN1RXc0kwa0hrMGNWQldaeWJadFhLOVhQajgvK2ZqNFlKNW5Jb0xXR3JhSkNPWjVSaEtTa0lRa0pQRm80cUNxeUV5MmJXT013ZWZuSit1NmNqcWRzTTNPTnZNOGN6NmZlY2EwcmlzL3J0Y3JtY25PTmhIQi9YN24vZjJkaUtEM2ptMGs4YXhwV1JaK1pDYVp5YzQyRVlGdElvSjVudW05WXh0SlBHdGExNVUvc1kxdGRtOXZiL1RlNmIxakcwazhhMXFXaFIrMnNVMXJqZFlhdHJHTmJXeGptOVlha25qV3RLNHJQeUtDaUtDMWhtMGlnb2pnOWZVVlNVaENFcEo0MXJRc0MwZTIyZGttSXJoY0x2eU5GLzdINlhUaWI3M3d5MTc0WmY4QUpFc2VQdGxQajEwQUFBQUFTVVZPUks1Q1lJST0nO1xuICAgICAgYXdhaXQgaGVscGVycy5maXhJbWFnZVRlbXBsYXRlU2NhbGUoVElOWV9QTkcsIHtcbiAgICAgICAgZGVmYXVsdEltYWdlVGVtcGxhdGVTY2FsZTogNC4wLFxuICAgICAgICBmaXhJbWFnZVRlbXBsYXRlU2NhbGU6IHRydWUsXG4gICAgICAgIHhTY2FsZTogMS41LCB5U2NhbGU6IDEuNVxuICAgICAgfSkuc2hvdWxkLmV2ZW50dWFsbHkuZXFsKGFjdHVhbCk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIG5vdCBmaXggdGVtcGxhdGUgc2l6ZSBzY2FsZSB3aXRoIGRlZmF1bHQgc2NhbGUgYW5kIGltYWdlIHNjYWxlJywgYXN5bmMgZnVuY3Rpb24gKCkge1xuICAgICAgY29uc3QgYWN0dWFsID0gJ2lWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFCQUFBQUFRQ0FZQUFBQWY4LzloQUFBQndVbEVRVlI0QWFYQlBVc3JRUUNHMFNlWCtjQmRrVGp3VHBHMU5QZ0xwalkvZlcxc3R0NFVZbW0yY0pxd01Dc2F3NzB1SkozQ0JjOVovUDNDbCsxMlM5dTJ0RzFMMjdiRUdMbS92MmV6MmJEWmJKREVkLzd3UzRZVDd6M1gxOWZjM054d2QzZEhYZGQ0N3huSGtlZm5aOFp4cEtvcTZycW1xaXFNTWN3TUoxVlYwVFFOMHpUaG5PUGo0NE82cnNrNTAzVWRrbWlhaHFacFdLMVdHR09ZR1U3cXVxWnBHcXkxU0NMblRNNloxOWRYY3M1SVlwb21yTFZJNHVMaWdwbmhwS29xVnFzVmtqZ2NEanc5UGRGMUhUbG51cTVERXM0NUpIRTRIRGd6bkJ5UFI5N2UzcGltaVZJSzR6aHlQQjd4M2hOQ0lJVEE1ZVVsM25zV2l3Vm5ocE5TQ3NNd3NOdnRHSWFCL1g1UEtRVkpwSlNReEhxOVJoTE9PYzRNSjlNMHNkdnQyRzYzOUgzUFRCSXhSaVFoQ1VuRUdMSFdjbVk0S2FVd0RBTjkzL1A0K01oeXVTU2xoQ1JTU2tqQ09ZZTFGbXN0WjZidmUyWXZMeS9zOTN0bXkrVVNTVWhDRXBJSUlmQWQ4L0R3d096OS9aMVNDcEpJS1NHSjlYcU5KSnh6L01TMGJjdnM2dW9LU2NRWWtZUWtKQkZqeEZyTFQwemJ0c3h1YjI5SktTR0psQktTY001aHJjVmF5MDlNenBsWmpKSFB6MCs4OTRRUUNDSHdQLzd3Uy84QTRlNm5BZytSOEx3QUFBQUFTVVZPUks1Q1lJST0nO1xuICAgICAgYXdhaXQgaGVscGVycy5maXhJbWFnZVRlbXBsYXRlU2NhbGUoVElOWV9QTkcsIHtcbiAgICAgICAgZGVmYXVsdEltYWdlVGVtcGxhdGVTY2FsZTogNC4wLFxuICAgICAgICBmaXhJbWFnZVRlbXBsYXRlU2NhbGU6IGZhbHNlLFxuICAgICAgICB4U2NhbGU6IDEuNSwgeVNjYWxlOiAxLjVcbiAgICAgIH0pLnNob3VsZC5ldmVudHVhbGx5LmVxbChhY3R1YWwpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBub3QgZml4IHRlbXBsYXRlIHNpemUgc2NhbGUgYmVjYXVzZSBvZiBpZ25vcmVEZWZhdWx0SW1hZ2VUZW1wbGF0ZVNjYWxlJywgYXN5bmMgZnVuY3Rpb24gKCkge1xuICAgICAgYXdhaXQgaGVscGVycy5maXhJbWFnZVRlbXBsYXRlU2NhbGUoVElOWV9QTkcsIHtcbiAgICAgICAgZGVmYXVsdEltYWdlVGVtcGxhdGVTY2FsZTogNC4wLFxuICAgICAgICBpZ25vcmVEZWZhdWx0SW1hZ2VUZW1wbGF0ZVNjYWxlOiB0cnVlLFxuICAgICAgfSkuc2hvdWxkLmV2ZW50dWFsbHkuZXFsKFRJTllfUE5HKTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgaWdub3JlIGRlZmF1bHRJbWFnZVRlbXBsYXRlU2NhbGUgdG8gZml4IHRlbXBsYXRlIHNpemUgc2NhbGUgYmVjYXVzZSBvZiBpZ25vcmVEZWZhdWx0SW1hZ2VUZW1wbGF0ZVNjYWxlJywgYXN5bmMgZnVuY3Rpb24gKCkge1xuICAgICAgY29uc3QgYWN0dWFsID0gJ2lWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFBWUFBQUFHQ0FZQUFBRGd6TzlJQUFBQVdFbEVRVlI0QVUzQlFSV0FRQWhBd2EvUEdCc0VnckMxNkFGQktFSVBYVzdPWE8rUm1leTlpUWpNakhGenJMVXdNN3FicW1MY0hLcEtSRkJWdUR2ajRhZ3EzQjFWUlVRWVQyYlMzUXdSUVZVWkYvQ2FHUkhCM3djMXZTWmJITzUrQmdBQUFBQkpSVTVFcmtKZ2dnPT0nO1xuICAgICAgYXdhaXQgaGVscGVycy5maXhJbWFnZVRlbXBsYXRlU2NhbGUoVElOWV9QTkcsIHtcbiAgICAgICAgZGVmYXVsdEltYWdlVGVtcGxhdGVTY2FsZTogNC4wLFxuICAgICAgICBpZ25vcmVEZWZhdWx0SW1hZ2VUZW1wbGF0ZVNjYWxlOiB0cnVlLFxuICAgICAgICBmaXhJbWFnZVRlbXBsYXRlU2NhbGU6IHRydWUsXG4gICAgICAgIHhTY2FsZTogMS41LCB5U2NhbGU6IDEuNVxuICAgICAgfSkuc2hvdWxkLmV2ZW50dWFsbHkuZXFsKGFjdHVhbCk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdlbnN1cmVUZW1wbGF0ZVNpemUnLCBmdW5jdGlvbiAoKSB7XG4gICAgaXQoJ3Nob3VsZCBub3QgcmVzaXplIHRoZSB0ZW1wbGF0ZSBpZiBpdCBpcyBzbWFsbGVyIHRoYW4gdGhlIHNjcmVlbicsIGFzeW5jIGZ1bmN0aW9uICgpIHtcbiAgICAgIGNvbnN0IHNjcmVlbiA9IFRJTllfUE5HX0RJTVMubWFwKG4gPT4gbiAqIDIpO1xuICAgICAgY29uc3QgZCA9IG5ldyBUZXN0RHJpdmVyKCk7XG4gICAgICBhd2FpdCBkLmVuc3VyZVRlbXBsYXRlU2l6ZShUSU5ZX1BORywgLi4uc2NyZWVuKVxuICAgICAgICAuc2hvdWxkLmV2ZW50dWFsbHkuZXFsKFRJTllfUE5HKTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIG5vdCByZXNpemUgdGhlIHRlbXBsYXRlIGlmIGl0IGlzIHRoZSBzYW1lIHNpemUgYXMgdGhlIHNjcmVlbicsIGFzeW5jIGZ1bmN0aW9uICgpIHtcbiAgICAgIGNvbnN0IGQgPSBuZXcgVGVzdERyaXZlcigpO1xuICAgICAgYXdhaXQgZC5lbnN1cmVUZW1wbGF0ZVNpemUoVElOWV9QTkcsIC4uLlRJTllfUE5HX0RJTVMpXG4gICAgICAgIC5zaG91bGQuZXZlbnR1YWxseS5lcWwoVElOWV9QTkcpO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgcmVzaXplIHRoZSB0ZW1wbGF0ZSBpZiBpdCBpcyBiaWdnZXIgdGhhbiB0aGUgc2NyZWVuJywgYXN5bmMgZnVuY3Rpb24gKCkge1xuICAgICAgY29uc3QgZCA9IG5ldyBUZXN0RHJpdmVyKCk7XG4gICAgICBjb25zdCBzY3JlZW4gPSBUSU5ZX1BOR19ESU1TLm1hcChuID0+IG4gLyAyKTtcbiAgICAgIGNvbnN0IG5ld1RlbXBsYXRlID0gYXdhaXQgZC5lbnN1cmVUZW1wbGF0ZVNpemUoVElOWV9QTkcsIC4uLnNjcmVlbik7XG4gICAgICBuZXdUZW1wbGF0ZS5zaG91bGQubm90LmVxbChUSU5ZX1BORyk7XG4gICAgICBuZXdUZW1wbGF0ZS5sZW5ndGguc2hvdWxkLmJlLmJlbG93KFRJTllfUE5HLmxlbmd0aCk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIGRlc2NyaWJlKCdnZXRTY3JlZW5zaG90Rm9ySW1hZ2VGaW5kJywgZnVuY3Rpb24gKCkge1xuICAgIGl0KCdzaG91bGQgZmFpbCBpZiBkcml2ZXIgZG9lcyBub3Qgc3VwcG9ydCBnZXRTY3JlZW5zaG90JywgYXN5bmMgZnVuY3Rpb24gKCkge1xuICAgICAgY29uc3QgZCA9IG5ldyBCYXNlRHJpdmVyKCk7XG4gICAgICBhd2FpdCBkLmdldFNjcmVlbnNob3RGb3JJbWFnZUZpbmQoKVxuICAgICAgICAuc2hvdWxkLmV2ZW50dWFsbHkuYmUucmVqZWN0ZWRXaXRoKC9kcml2ZXIgZG9lcyBub3Qgc3VwcG9ydC8pO1xuICAgIH0pO1xuICAgIGl0KCdzaG91bGQgbm90IGFkanVzdCBvciB2ZXJpZnkgc2NyZWVuc2hvdCBpZiBhc2tlZCBub3QgdG8gYnkgc2V0dGluZ3MnLCBhc3luYyBmdW5jdGlvbiAoKSB7XG4gICAgICBjb25zdCBkID0gbmV3IFRlc3REcml2ZXIoKTtcbiAgICAgIHNpbm9uLnN0dWIoZCwgJ2dldFNjcmVlbnNob3QnKS5yZXR1cm5zKFRJTllfUE5HKTtcbiAgICAgIGQuc2V0dGluZ3MudXBkYXRlKHtmaXhJbWFnZUZpbmRTY3JlZW5zaG90RGltczogZmFsc2V9KTtcbiAgICAgIGNvbnN0IHNjcmVlbiA9IFRJTllfUE5HX0RJTVMubWFwKG4gPT4gbiArIDEpO1xuICAgICAgY29uc3Qge2I2NFNjcmVlbnNob3QsIHNjYWxlfSA9IGF3YWl0IGQuZ2V0U2NyZWVuc2hvdEZvckltYWdlRmluZCguLi5zY3JlZW4pO1xuICAgICAgYjY0U2NyZWVuc2hvdC5zaG91bGQuZXFsKFRJTllfUE5HKTtcbiAgICAgIHNob3VsZC5lcXVhbChzY2FsZSwgdW5kZWZpbmVkKTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBzY3JlZW5zaG90IHdpdGhvdXQgYWRqdXN0bWVudCBpZiBpdCBtYXRjaGVzIHNjcmVlbiBzaXplJywgYXN5bmMgZnVuY3Rpb24gKCkge1xuICAgICAgY29uc3QgZCA9IG5ldyBUZXN0RHJpdmVyKCk7XG4gICAgICBzaW5vbi5zdHViKGQsICdnZXRTY3JlZW5zaG90JykucmV0dXJucyhUSU5ZX1BORyk7XG4gICAgICBjb25zdCB7YjY0U2NyZWVuc2hvdCwgc2NhbGV9ID0gYXdhaXQgZC5nZXRTY3JlZW5zaG90Rm9ySW1hZ2VGaW5kKC4uLlRJTllfUE5HX0RJTVMpO1xuICAgICAgYjY0U2NyZWVuc2hvdC5zaG91bGQuZXFsKFRJTllfUE5HKTtcbiAgICAgIHNob3VsZC5lcXVhbChzY2FsZSwgdW5kZWZpbmVkKTtcbiAgICB9KTtcbiAgICBpdCgnc2hvdWxkIHJldHVybiBzY2FsZWQgc2NyZWVuc2hvdCB3aXRoIHNhbWUgYXNwZWN0IHJhdGlvIGlmIG1hdGNoaW5nIHNjcmVlbiBhc3BlY3QgcmF0aW8nLCBhc3luYyBmdW5jdGlvbiAoKSB7XG4gICAgICBjb25zdCBkID0gbmV3IFRlc3REcml2ZXIoKTtcbiAgICAgIHNpbm9uLnN0dWIoZCwgJ2dldFNjcmVlbnNob3QnKS5yZXR1cm5zKFRJTllfUE5HKTtcbiAgICAgIGNvbnN0IHNjcmVlbiA9IFRJTllfUE5HX0RJTVMubWFwKG4gPT4gbiAqIDEuNSk7XG4gICAgICBjb25zdCB7YjY0U2NyZWVuc2hvdCwgc2NhbGV9ID0gYXdhaXQgZC5nZXRTY3JlZW5zaG90Rm9ySW1hZ2VGaW5kKC4uLnNjcmVlbik7XG4gICAgICBiNjRTY3JlZW5zaG90LnNob3VsZC5ub3QuZXFsKFRJTllfUE5HKTtcbiAgICAgIGNvbnN0IHNjcmVlbnNob3RPYmogPSBhd2FpdCBpbWFnZVV0aWwuZ2V0SmltcEltYWdlKGI2NFNjcmVlbnNob3QpO1xuICAgICAgc2NyZWVuc2hvdE9iai5iaXRtYXAud2lkdGguc2hvdWxkLmVxbChzY3JlZW5bMF0pO1xuICAgICAgc2NyZWVuc2hvdE9iai5iaXRtYXAuaGVpZ2h0LnNob3VsZC5lcWwoc2NyZWVuWzFdKTtcbiAgICAgIHNjYWxlLnNob3VsZC5lcWwoeyB4U2NhbGU6IDEuNSwgeVNjYWxlOiAxLjUgfSk7XG4gICAgfSk7XG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gc2NhbGVkIHNjcmVlbnNob3Qgd2l0aCBkaWZmZXJlbnQgYXNwZWN0IHJhdGlvIGlmIG5vdCBtYXRjaGluZyBzY3JlZW4gYXNwZWN0IHJhdGlvJywgYXN5bmMgZnVuY3Rpb24gKCkge1xuICAgICAgY29uc3QgZCA9IG5ldyBUZXN0RHJpdmVyKCk7XG4gICAgICBzaW5vbi5zdHViKGQsICdnZXRTY3JlZW5zaG90JykucmV0dXJucyhUSU5ZX1BORyk7XG5cbiAgICAgIC8vIHRyeSBmaXJzdCB3aXRoIHBvcnRyYWl0IHNjcmVlbiwgc2NyZWVuID0gOCB4IDEyXG4gICAgICBsZXQgc2NyZWVuID0gW1RJTllfUE5HX0RJTVNbMF0gKiAyLCBUSU5ZX1BOR19ESU1TWzFdICogM107XG4gICAgICBsZXQgZXhwZWN0ZWRTY2FsZSA9IHsgeFNjYWxlOiAyLjY3LCB5U2NhbGU6IDQgfTtcblxuICAgICAgY29uc3Qge2I2NFNjcmVlbnNob3QsIHNjYWxlfSA9IGF3YWl0IGQuZ2V0U2NyZWVuc2hvdEZvckltYWdlRmluZCguLi5zY3JlZW4pO1xuICAgICAgYjY0U2NyZWVuc2hvdC5zaG91bGQubm90LmVxbChUSU5ZX1BORyk7XG4gICAgICBsZXQgc2NyZWVuc2hvdE9iaiA9IGF3YWl0IGltYWdlVXRpbC5nZXRKaW1wSW1hZ2UoYjY0U2NyZWVuc2hvdCk7XG4gICAgICBzY3JlZW5zaG90T2JqLmJpdG1hcC53aWR0aC5zaG91bGQuZXFsKHNjcmVlblswXSk7XG4gICAgICBzY3JlZW5zaG90T2JqLmJpdG1hcC5oZWlnaHQuc2hvdWxkLmVxbChzY3JlZW5bMV0pO1xuICAgICAgc2NhbGUueFNjYWxlLnRvRml4ZWQoMikuc2hvdWxkLmVxbChleHBlY3RlZFNjYWxlLnhTY2FsZS50b1N0cmluZygpKTtcbiAgICAgIHNjYWxlLnlTY2FsZS5zaG91bGQuZXFsKGV4cGVjdGVkU2NhbGUueVNjYWxlKTtcblxuICAgICAgLy8gdGhlbiB3aXRoIGxhbmRzY2FwZSBzY3JlZW4sIHNjcmVlbiA9IDEyIHggOFxuICAgICAgc2NyZWVuID0gW1RJTllfUE5HX0RJTVNbMF0gKiAzLCBUSU5ZX1BOR19ESU1TWzFdICogMl07XG4gICAgICBleHBlY3RlZFNjYWxlID0geyB4U2NhbGU6IDQsIHlTY2FsZTogMi42NyB9O1xuXG4gICAgICBjb25zdCB7YjY0U2NyZWVuc2hvdDogbmV3U2NyZWVuLCBzY2FsZTogbmV3U2NhbGV9ID0gYXdhaXQgZC5nZXRTY3JlZW5zaG90Rm9ySW1hZ2VGaW5kKC4uLnNjcmVlbik7XG4gICAgICBuZXdTY3JlZW4uc2hvdWxkLm5vdC5lcWwoVElOWV9QTkcpO1xuICAgICAgc2NyZWVuc2hvdE9iaiA9IGF3YWl0IGltYWdlVXRpbC5nZXRKaW1wSW1hZ2UobmV3U2NyZWVuKTtcbiAgICAgIHNjcmVlbnNob3RPYmouYml0bWFwLndpZHRoLnNob3VsZC5lcWwoc2NyZWVuWzBdKTtcbiAgICAgIHNjcmVlbnNob3RPYmouYml0bWFwLmhlaWdodC5zaG91bGQuZXFsKHNjcmVlblsxXSk7XG4gICAgICBuZXdTY2FsZS54U2NhbGUuc2hvdWxkLmVxbChleHBlY3RlZFNjYWxlLnhTY2FsZSk7XG4gICAgICBuZXdTY2FsZS55U2NhbGUudG9GaXhlZCgyKS5zaG91bGQuZXFsKGV4cGVjdGVkU2NhbGUueVNjYWxlLnRvU3RyaW5nKCkpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCByZXR1cm4gc2NhbGVkIHNjcmVlbnNob3Qgd2l0aCBkaWZmZXJlbnQgYXNwZWN0IHJhdGlvIGlmIG5vdCBtYXRjaGluZyBzY3JlZW4gYXNwZWN0IHJhdGlvIHdpdGggZml4SW1hZ2VUZW1wbGF0ZVNjYWxlJywgYXN5bmMgZnVuY3Rpb24gKCkge1xuICAgICAgY29uc3QgZCA9IG5ldyBUZXN0RHJpdmVyKCk7XG4gICAgICBzaW5vbi5zdHViKGQsICdnZXRTY3JlZW5zaG90JykucmV0dXJucyhUSU5ZX1BORyk7XG5cbiAgICAgIC8vIHRyeSBmaXJzdCB3aXRoIHBvcnRyYWl0IHNjcmVlbiwgc2NyZWVuID0gOCB4IDEyXG4gICAgICBsZXQgc2NyZWVuID0gW1RJTllfUE5HX0RJTVNbMF0gKiAyLCBUSU5ZX1BOR19ESU1TWzFdICogM107XG4gICAgICBsZXQgZXhwZWN0ZWRTY2FsZSA9IHsgeFNjYWxlOiAyLjY3LCB5U2NhbGU6IDQgfTtcblxuICAgICAgY29uc3Qge2I2NFNjcmVlbnNob3QsIHNjYWxlfSA9IGF3YWl0IGQuZ2V0U2NyZWVuc2hvdEZvckltYWdlRmluZCguLi5zY3JlZW4pO1xuICAgICAgYjY0U2NyZWVuc2hvdC5zaG91bGQubm90LmVxbChUSU5ZX1BORyk7XG4gICAgICBsZXQgc2NyZWVuc2hvdE9iaiA9IGF3YWl0IGltYWdlVXRpbC5nZXRKaW1wSW1hZ2UoYjY0U2NyZWVuc2hvdCk7XG4gICAgICBzY3JlZW5zaG90T2JqLmJpdG1hcC53aWR0aC5zaG91bGQuZXFsKHNjcmVlblswXSk7XG4gICAgICBzY3JlZW5zaG90T2JqLmJpdG1hcC5oZWlnaHQuc2hvdWxkLmVxbChzY3JlZW5bMV0pO1xuICAgICAgc2NhbGUueFNjYWxlLnRvRml4ZWQoMikuc2hvdWxkLmVxbChleHBlY3RlZFNjYWxlLnhTY2FsZS50b1N0cmluZygpKTtcbiAgICAgIHNjYWxlLnlTY2FsZS5zaG91bGQuZXFsKGV4cGVjdGVkU2NhbGUueVNjYWxlKTtcbiAgICAgIC8vIDggeCAxMiBzdHJldGNoZWQgVElOWV9QTkdcbiAgICAgIGF3YWl0IGhlbHBlcnMuZml4SW1hZ2VUZW1wbGF0ZVNjYWxlKGI2NFNjcmVlbnNob3QsIHtmaXhJbWFnZVRlbXBsYXRlU2NhbGU6IHRydWUsIHNjYWxlfSlcbiAgICAgICAgLnNob3VsZC5ldmVudHVhbGx5LmVxbCgnaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQUFnQUFBQU1DQVlBQUFCZm52eWRBQUFBSjBsRVFWUjRBWVhCQVFFQUlBQ0RNS1IvcDBmVEJyS2RiWmNQQ1JJa1NKQWdRWUlFQ1JJa1BBekJBMVRwZU53WkFBQUFBRWxGVGtTdVFtQ0MnKTtcblxuICAgICAgLy8gdGhlbiB3aXRoIGxhbmRzY2FwZSBzY3JlZW4sIHNjcmVlbiA9IDEyIHggOFxuICAgICAgc2NyZWVuID0gW1RJTllfUE5HX0RJTVNbMF0gKiAzLCBUSU5ZX1BOR19ESU1TWzFdICogMl07XG4gICAgICBleHBlY3RlZFNjYWxlID0geyB4U2NhbGU6IDQsIHlTY2FsZTogMi42NyB9O1xuXG4gICAgICBjb25zdCB7YjY0U2NyZWVuc2hvdDogbmV3U2NyZWVuLCBzY2FsZTogbmV3U2NhbGV9ID0gYXdhaXQgZC5nZXRTY3JlZW5zaG90Rm9ySW1hZ2VGaW5kKC4uLnNjcmVlbik7XG4gICAgICBuZXdTY3JlZW4uc2hvdWxkLm5vdC5lcWwoVElOWV9QTkcpO1xuICAgICAgc2NyZWVuc2hvdE9iaiA9IGF3YWl0IGltYWdlVXRpbC5nZXRKaW1wSW1hZ2UobmV3U2NyZWVuKTtcbiAgICAgIHNjcmVlbnNob3RPYmouYml0bWFwLndpZHRoLnNob3VsZC5lcWwoc2NyZWVuWzBdKTtcbiAgICAgIHNjcmVlbnNob3RPYmouYml0bWFwLmhlaWdodC5zaG91bGQuZXFsKHNjcmVlblsxXSk7XG4gICAgICBuZXdTY2FsZS54U2NhbGUuc2hvdWxkLmVxbChleHBlY3RlZFNjYWxlLnhTY2FsZSk7XG4gICAgICBuZXdTY2FsZS55U2NhbGUudG9GaXhlZCgyKS5zaG91bGQuZXFsKGV4cGVjdGVkU2NhbGUueVNjYWxlLnRvU3RyaW5nKCkpO1xuICAgICAgLy8gMTIgeCA4IHN0cmV0Y2hlZCBUSU5ZX1BOR1xuICAgICAgYXdhaXQgaGVscGVycy5maXhJbWFnZVRlbXBsYXRlU2NhbGUobmV3U2NyZWVuLCB7Zml4SW1hZ2VUZW1wbGF0ZVNjYWxlOiB0cnVlLCBzY2FsZX0pXG4gICAgICAgIC5zaG91bGQuZXZlbnR1YWxseS5lcWwoJ2lWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFBd0FBQUFJQ0FZQUFBRE41Qjd4QUFBQUkwbEVRVlI0QVpYQkFRRUFNQXlETUk1L1Q1VzJheUI1MjQ1QUlva2tra2dpaVNUNitXNERUTHlvNVBVQUFBQUFTVVZPUks1Q1lJST0nKTtcbiAgICB9KTtcblxuICB9KTtcbn0pO1xuXG5kZXNjcmliZSgnY3VzdG9tIGVsZW1lbnQgZmluZGluZyBwbHVnaW5zJywgZnVuY3Rpb24gKCkge1xuICAvLyBoYXBweXNcbiAgaXQoJ3Nob3VsZCBmaW5kIGEgc2luZ2xlIGVsZW1lbnQgdXNpbmcgYSBjdXN0b20gZmluZGVyJywgYXN5bmMgZnVuY3Rpb24gKCkge1xuICAgIGNvbnN0IGQgPSBuZXcgQmFzZURyaXZlcigpO1xuICAgIGQub3B0cy5jdXN0b21GaW5kTW9kdWxlcyA9IHtmOiBDVVNUT01fRklORF9NT0RVTEV9O1xuICAgIGF3YWl0IGQuZmluZEVsZW1lbnQoQ1VTVE9NX1NUUkFURUdZLCAnZjpmb28nKS5zaG91bGQuZXZlbnR1YWxseS5lcWwoJ2JhcicpO1xuICB9KTtcbiAgaXQoJ3Nob3VsZCBub3QgcmVxdWlyZSBzZWxlY3RvciBwcmVmaXggaWYgb25seSBvbmUgZmluZCBwbHVnaW4gaXMgcmVnaXN0ZXJlZCcsIGFzeW5jIGZ1bmN0aW9uICgpIHtcbiAgICBjb25zdCBkID0gbmV3IEJhc2VEcml2ZXIoKTtcbiAgICBkLm9wdHMuY3VzdG9tRmluZE1vZHVsZXMgPSB7ZjogQ1VTVE9NX0ZJTkRfTU9EVUxFfTtcbiAgICBhd2FpdCBkLmZpbmRFbGVtZW50KENVU1RPTV9TVFJBVEVHWSwgJ2ZvbycpLnNob3VsZC5ldmVudHVhbGx5LmVxbCgnYmFyJyk7XG4gIH0pO1xuICBpdCgnc2hvdWxkIGZpbmQgbXVsdGlwbGUgZWxlbWVudHMgdXNpbmcgYSBjdXN0b20gZmluZGVyJywgYXN5bmMgZnVuY3Rpb24gKCkge1xuICAgIGNvbnN0IGQgPSBuZXcgQmFzZURyaXZlcigpO1xuICAgIGQub3B0cy5jdXN0b21GaW5kTW9kdWxlcyA9IHtmOiBDVVNUT01fRklORF9NT0RVTEV9O1xuICAgIGF3YWl0IGQuZmluZEVsZW1lbnRzKENVU1RPTV9TVFJBVEVHWSwgJ2Y6Zm9vcycpLnNob3VsZC5ldmVudHVhbGx5LmVxbChbJ2JhejEnLCAnYmF6MiddKTtcbiAgfSk7XG4gIGl0KCdzaG91bGQgZ2l2ZSBhIGhpbnQgdG8gdGhlIHBsdWdpbiBhYm91dCB3aGV0aGVyIG11bHRpcGxlIGFyZSByZXF1ZXN0ZWQnLCBhc3luYyBmdW5jdGlvbiAoKSB7XG4gICAgY29uc3QgZCA9IG5ldyBCYXNlRHJpdmVyKCk7XG4gICAgZC5vcHRzLmN1c3RvbUZpbmRNb2R1bGVzID0ge2Y6IENVU1RPTV9GSU5EX01PRFVMRX07XG4gICAgYXdhaXQgZC5maW5kRWxlbWVudChDVVNUT01fU1RSQVRFR1ksICdmOmZvb3MnKS5zaG91bGQuZXZlbnR1YWxseS5lcWwoJ2JhcjEnKTtcbiAgfSk7XG4gIGl0KCdzaG91bGQgYmUgYWJsZSB0byB1c2UgbXVsdGlwbGUgZmluZCBtb2R1bGVzJywgYXN5bmMgZnVuY3Rpb24gKCkge1xuICAgIGNvbnN0IGQgPSBuZXcgQmFzZURyaXZlcigpO1xuICAgIGQub3B0cy5jdXN0b21GaW5kTW9kdWxlcyA9IHtmOiBDVVNUT01fRklORF9NT0RVTEUsIGc6IENVU1RPTV9GSU5EX01PRFVMRX07XG4gICAgYXdhaXQgZC5maW5kRWxlbWVudChDVVNUT01fU1RSQVRFR1ksICdmOmZvbycpLnNob3VsZC5ldmVudHVhbGx5LmVxbCgnYmFyJyk7XG4gICAgYXdhaXQgZC5maW5kRWxlbWVudChDVVNUT01fU1RSQVRFR1ksICdnOmZvbycpLnNob3VsZC5ldmVudHVhbGx5LmVxbCgnYmFyJyk7XG4gIH0pO1xuXG4gIC8vIGVycm9yc1xuICBpdCgnc2hvdWxkIHRocm93IGFuIGVycm9yIGlmIGN1c3RvbUZpbmRNb2R1bGVzIGlzIG5vdCBzZXQnLCBhc3luYyBmdW5jdGlvbiAoKSB7XG4gICAgY29uc3QgZCA9IG5ldyBCYXNlRHJpdmVyKCk7XG4gICAgYXdhaXQgZC5maW5kRWxlbWVudChDVVNUT01fU1RSQVRFR1ksICdmOmZvbycpLnNob3VsZC5ldmVudHVhbGx5LmJlLnJlamVjdGVkV2l0aCgvY3VzdG9tRmluZE1vZHVsZXMvKTtcbiAgfSk7XG4gIGl0KCdzaG91bGQgdGhyb3cgYW4gZXJyb3IgaWYgY3VzdG9tRmluZE1vZHVsZXMgaXMgdGhlIHdyb25nIHNoYXBlJywgYXN5bmMgZnVuY3Rpb24gKCkge1xuICAgIGNvbnN0IGQgPSBuZXcgQmFzZURyaXZlcigpO1xuICAgIGQub3B0cy5jdXN0b21GaW5kTW9kdWxlcyA9IENVU1RPTV9GSU5EX01PRFVMRTtcbiAgICBhd2FpdCBkLmZpbmRFbGVtZW50KENVU1RPTV9TVFJBVEVHWSwgJ2Y6Zm9vJykuc2hvdWxkLmV2ZW50dWFsbHkuYmUucmVqZWN0ZWRXaXRoKC9jdXN0b21GaW5kTW9kdWxlcy8pO1xuICB9KTtcbiAgaXQoJ3Nob3VsZCB0aHJvdyBhbiBlcnJvciBpZiBjdXN0b21GaW5kTW9kdWxlcyBpcyBzaXplID4gMSBhbmQgbm8gc2VsZWN0b3IgcHJlZml4IGlzIHVzZWQnLCBhc3luYyBmdW5jdGlvbiAoKSB7XG4gICAgY29uc3QgZCA9IG5ldyBCYXNlRHJpdmVyKCk7XG4gICAgZC5vcHRzLmN1c3RvbUZpbmRNb2R1bGVzID0ge2Y6IENVU1RPTV9GSU5EX01PRFVMRSwgZzogQ1VTVE9NX0ZJTkRfTU9EVUxFfTtcbiAgICBhd2FpdCBkLmZpbmRFbGVtZW50KENVU1RPTV9TVFJBVEVHWSwgJ2ZvbycpLnNob3VsZC5ldmVudHVhbGx5LmJlLnJlamVjdGVkV2l0aCgvbXVsdGlwbGUgZWxlbWVudCBmaW5kaW5nL2kpO1xuICB9KTtcbiAgaXQoJ3Nob3VsZCB0aHJvdyBhbiBlcnJvciBpbiBhdHRlbXB0IHRvIHVzZSB1bnJlZ2lzdGVyZWQgcGx1Z2luJywgYXN5bmMgZnVuY3Rpb24gKCkge1xuICAgIGNvbnN0IGQgPSBuZXcgQmFzZURyaXZlcigpO1xuICAgIGQub3B0cy5jdXN0b21GaW5kTW9kdWxlcyA9IHtmOiBDVVNUT01fRklORF9NT0RVTEUsIGc6IENVU1RPTV9GSU5EX01PRFVMRX07XG4gICAgYXdhaXQgZC5maW5kRWxlbWVudChDVVNUT01fU1RSQVRFR1ksICd6OmZvbycpLnNob3VsZC5ldmVudHVhbGx5LmJlLnJlamVjdGVkV2l0aCgvd2FzIG5vdCByZWdpc3RlcmVkLyk7XG4gIH0pO1xuICBpdCgnc2hvdWxkIHRocm93IGFuIGVycm9yIGlmIHBsdWdpbiBjYW5ub3QgYmUgbG9hZGVkJywgYXN5bmMgZnVuY3Rpb24gKCkge1xuICAgIGNvbnN0IGQgPSBuZXcgQmFzZURyaXZlcigpO1xuICAgIGQub3B0cy5jdXN0b21GaW5kTW9kdWxlcyA9IHtmOiAnLi9mb28uanMnfTtcbiAgICBhd2FpdCBkLmZpbmRFbGVtZW50KENVU1RPTV9TVFJBVEVHWSwgJ2Y6Zm9vJykuc2hvdWxkLmV2ZW50dWFsbHkuYmUucmVqZWN0ZWRXaXRoKC9jb3VsZCBub3QgbG9hZC9pKTtcbiAgfSk7XG4gIGl0KCdzaG91bGQgdGhyb3cgYW4gZXJyb3IgaWYgcGx1Z2luIGlzIG5vdCB0aGUgcmlnaHQgc2hhcGUnLCBhc3luYyBmdW5jdGlvbiAoKSB7XG4gICAgY29uc3QgZCA9IG5ldyBCYXNlRHJpdmVyKCk7XG4gICAgZC5vcHRzLmN1c3RvbUZpbmRNb2R1bGVzID0ge2Y6IEJBRF9DVVNUT01fRklORF9NT0RVTEV9O1xuICAgIGF3YWl0IGQuZmluZEVsZW1lbnQoQ1VTVE9NX1NUUkFURUdZLCAnZjpmb28nKS5zaG91bGQuZXZlbnR1YWxseS5iZS5yZWplY3RlZFdpdGgoL2NvbnN0cnVjdGVkIGNvcnJlY3RseS9pKTtcbiAgfSk7XG4gIGl0KCdzaG91bGQgcGFzcyBvbiBhbiBlcnJvciB0aHJvd24gYnkgdGhlIGZpbmRlciBpdHNlbGYnLCBhc3luYyBmdW5jdGlvbiAoKSB7XG4gICAgY29uc3QgZCA9IG5ldyBCYXNlRHJpdmVyKCk7XG4gICAgZC5vcHRzLmN1c3RvbUZpbmRNb2R1bGVzID0ge2Y6IENVU1RPTV9GSU5EX01PRFVMRX07XG4gICAgYXdhaXQgZC5maW5kRWxlbWVudChDVVNUT01fU1RSQVRFR1ksICdmOmVycm9yJykuc2hvdWxkLmV2ZW50dWFsbHkuYmUucmVqZWN0ZWRXaXRoKC9wbHVnaW4gZXJyb3IvaSk7XG4gIH0pO1xuICBpdCgnc2hvdWxkIHRocm93IG5vIHN1Y2ggZWxlbWVudCBlcnJvciBpZiBlbGVtZW50IG5vdCBmb3VuZCcsIGFzeW5jIGZ1bmN0aW9uICgpIHtcbiAgICBjb25zdCBkID0gbmV3IEJhc2VEcml2ZXIoKTtcbiAgICBkLm9wdHMuY3VzdG9tRmluZE1vZHVsZXMgPSB7ZjogQ1VTVE9NX0ZJTkRfTU9EVUxFfTtcbiAgICBhd2FpdCBkLmZpbmRFbGVtZW50KENVU1RPTV9TVFJBVEVHWSwgJ2Y6bm9wZScpLnNob3VsZC5ldmVudHVhbGx5LmJlLnJlamVjdGVkV2l0aCgvY291bGQgbm90IGJlIGxvY2F0ZWQvKTtcbiAgfSk7XG59KTtcbiJdLCJmaWxlIjoidGVzdC9iYXNlZHJpdmVyL2NvbW1hbmRzL2ZpbmQtc3BlY3MuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vLi4vLi4ifQ==
