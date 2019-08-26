"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.rotateImage = rotateImage;

require("source-map-support/register");

var _path = _interopRequireDefault(require("path"));

var _teen_process = require("teen_process");

var _logger = _interopRequireDefault(require("./logger"));

const ROTATE_SCRIPT_PATH = _path.default.resolve(__dirname, '..', '..', '..', 'osa', 'Rotate.applescript');

async function rotateImage(imgPath, deg) {
  _logger.default.debug(`Rotating image '${imgPath}' ${deg} degrees`);

  await (0, _teen_process.exec)('osascript', [ROTATE_SCRIPT_PATH, imgPath, deg]);
}require('source-map-support').install();


//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi91aWF1dG8vdXRpbHMuanMiXSwibmFtZXMiOlsiUk9UQVRFX1NDUklQVF9QQVRIIiwicGF0aCIsInJlc29sdmUiLCJfX2Rpcm5hbWUiLCJyb3RhdGVJbWFnZSIsImltZ1BhdGgiLCJkZWciLCJsb2dnZXIiLCJkZWJ1ZyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFDQTs7QUFHQSxNQUFNQSxrQkFBa0IsR0FBR0MsY0FBS0MsT0FBTCxDQUFhQyxTQUFiLEVBQXdCLElBQXhCLEVBQThCLElBQTlCLEVBQW9DLElBQXBDLEVBQTBDLEtBQTFDLEVBQWlELG9CQUFqRCxDQUEzQjs7QUFFQSxlQUFlQyxXQUFmLENBQTRCQyxPQUE1QixFQUFxQ0MsR0FBckMsRUFBMEM7QUFDeENDLGtCQUFPQyxLQUFQLENBQWMsbUJBQWtCSCxPQUFRLEtBQUlDLEdBQUksVUFBaEQ7O0FBQ0EsUUFBTSx3QkFBSyxXQUFMLEVBQWtCLENBQUNOLGtCQUFELEVBQXFCSyxPQUFyQixFQUE4QkMsR0FBOUIsQ0FBbEIsQ0FBTjtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBleGVjIH0gZnJvbSAndGVlbl9wcm9jZXNzJztcbmltcG9ydCBsb2dnZXIgZnJvbSAnLi9sb2dnZXInO1xuXG5cbmNvbnN0IFJPVEFURV9TQ1JJUFRfUEFUSCA9IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLicsICcuLicsICcuLicsICdvc2EnLCAnUm90YXRlLmFwcGxlc2NyaXB0Jyk7XG5cbmFzeW5jIGZ1bmN0aW9uIHJvdGF0ZUltYWdlIChpbWdQYXRoLCBkZWcpIHtcbiAgbG9nZ2VyLmRlYnVnKGBSb3RhdGluZyBpbWFnZSAnJHtpbWdQYXRofScgJHtkZWd9IGRlZ3JlZXNgKTtcbiAgYXdhaXQgZXhlYygnb3Nhc2NyaXB0JywgW1JPVEFURV9TQ1JJUFRfUEFUSCwgaW1nUGF0aCwgZGVnXSk7XG59XG5cbmV4cG9ydCB7IHJvdGF0ZUltYWdlIH07XG4iXSwiZmlsZSI6ImxpYi91aWF1dG8vdXRpbHMuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vLi4ifQ==
