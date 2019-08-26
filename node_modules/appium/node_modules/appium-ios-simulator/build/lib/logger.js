"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setLoggingPlatform = setLoggingPlatform;
exports.default = exports.log = void 0;

require("source-map-support/register");

var _appiumSupport = require("appium-support");

var _lodash = _interopRequireDefault(require("lodash"));

let prefix = 'iOSSim';

function setLoggingPlatform(platform) {
  if (!_lodash.default.isEmpty(platform)) {
    prefix = `${platform}Sim`;
  }
}

const log = _appiumSupport.logger.getLogger(function getPrefix() {
  return prefix;
});

exports.log = log;
var _default = log;
exports.default = _default;require('source-map-support').install();


//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9sb2dnZXIuanMiXSwibmFtZXMiOlsicHJlZml4Iiwic2V0TG9nZ2luZ1BsYXRmb3JtIiwicGxhdGZvcm0iLCJfIiwiaXNFbXB0eSIsImxvZyIsImxvZ2dlciIsImdldExvZ2dlciIsImdldFByZWZpeCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUE7O0FBQ0E7O0FBR0EsSUFBSUEsTUFBTSxHQUFHLFFBQWI7O0FBQ0EsU0FBU0Msa0JBQVQsQ0FBNkJDLFFBQTdCLEVBQXVDO0FBQ3JDLE1BQUksQ0FBQ0MsZ0JBQUVDLE9BQUYsQ0FBVUYsUUFBVixDQUFMLEVBQTBCO0FBQ3hCRixJQUFBQSxNQUFNLEdBQUksR0FBRUUsUUFBUyxLQUFyQjtBQUNEO0FBQ0Y7O0FBRUQsTUFBTUcsR0FBRyxHQUFHQyxzQkFBT0MsU0FBUCxDQUFpQixTQUFTQyxTQUFULEdBQXNCO0FBQ2pELFNBQU9SLE1BQVA7QUFDRCxDQUZXLENBQVo7OztlQU1lSyxHIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSAnYXBwaXVtLXN1cHBvcnQnO1xuaW1wb3J0IF8gZnJvbSAnbG9kYXNoJztcblxuXG5sZXQgcHJlZml4ID0gJ2lPU1NpbSc7XG5mdW5jdGlvbiBzZXRMb2dnaW5nUGxhdGZvcm0gKHBsYXRmb3JtKSB7XG4gIGlmICghXy5pc0VtcHR5KHBsYXRmb3JtKSkge1xuICAgIHByZWZpeCA9IGAke3BsYXRmb3JtfVNpbWA7XG4gIH1cbn1cblxuY29uc3QgbG9nID0gbG9nZ2VyLmdldExvZ2dlcihmdW5jdGlvbiBnZXRQcmVmaXggKCkge1xuICByZXR1cm4gcHJlZml4O1xufSk7XG5cblxuZXhwb3J0IHsgbG9nLCBzZXRMb2dnaW5nUGxhdGZvcm0gfTtcbmV4cG9ydCBkZWZhdWx0IGxvZztcbiJdLCJmaWxlIjoibGliL2xvZ2dlci5qcyIsInNvdXJjZVJvb3QiOiIuLi8uLiJ9
