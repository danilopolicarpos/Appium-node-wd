"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.startServer = startServer;

require("source-map-support/register");

var _logger = _interopRequireDefault(require("./logger"));

var _appiumBaseDriver = require("appium-base-driver");

var _driver = _interopRequireDefault(require("./driver"));

async function startServer(port, host) {
  let d = new _driver.default({
    port,
    host
  });
  let router = (0, _appiumBaseDriver.routeConfiguringFunction)(d);
  let server = (0, _appiumBaseDriver.server)(router, port, host);

  _logger.default.info(`SelendroidDriver server listening on http://${host}:${port}`);

  return await server;
}require('source-map-support').install();


//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9zZXJ2ZXIuanMiXSwibmFtZXMiOlsic3RhcnRTZXJ2ZXIiLCJwb3J0IiwiaG9zdCIsImQiLCJTZWxlbmRyb2lkRHJpdmVyIiwicm91dGVyIiwic2VydmVyIiwibG9nIiwiaW5mbyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQTs7QUFDQTs7QUFDQTs7QUFHQSxlQUFlQSxXQUFmLENBQTRCQyxJQUE1QixFQUFrQ0MsSUFBbEMsRUFBd0M7QUFDdEMsTUFBSUMsQ0FBQyxHQUFHLElBQUlDLGVBQUosQ0FBcUI7QUFBQ0gsSUFBQUEsSUFBRDtBQUFPQyxJQUFBQTtBQUFQLEdBQXJCLENBQVI7QUFDQSxNQUFJRyxNQUFNLEdBQUcsZ0RBQXlCRixDQUF6QixDQUFiO0FBQ0EsTUFBSUcsTUFBTSxHQUFHLDhCQUFXRCxNQUFYLEVBQW1CSixJQUFuQixFQUF5QkMsSUFBekIsQ0FBYjs7QUFDQUssa0JBQUlDLElBQUosQ0FBVSwrQ0FBOENOLElBQUssSUFBR0QsSUFBSyxFQUFyRTs7QUFDQSxTQUFPLE1BQU1LLE1BQWI7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBsb2cgZnJvbSAnLi9sb2dnZXInO1xuaW1wb3J0IHsgc2VydmVyIGFzIGJhc2VTZXJ2ZXIsIHJvdXRlQ29uZmlndXJpbmdGdW5jdGlvbiB9IGZyb20gJ2FwcGl1bS1iYXNlLWRyaXZlcic7XG5pbXBvcnQgU2VsZW5kcm9pZERyaXZlciBmcm9tICcuL2RyaXZlcic7XG5cblxuYXN5bmMgZnVuY3Rpb24gc3RhcnRTZXJ2ZXIgKHBvcnQsIGhvc3QpIHtcbiAgbGV0IGQgPSBuZXcgU2VsZW5kcm9pZERyaXZlcih7cG9ydCwgaG9zdH0pO1xuICBsZXQgcm91dGVyID0gcm91dGVDb25maWd1cmluZ0Z1bmN0aW9uKGQpO1xuICBsZXQgc2VydmVyID0gYmFzZVNlcnZlcihyb3V0ZXIsIHBvcnQsIGhvc3QpO1xuICBsb2cuaW5mbyhgU2VsZW5kcm9pZERyaXZlciBzZXJ2ZXIgbGlzdGVuaW5nIG9uIGh0dHA6Ly8ke2hvc3R9OiR7cG9ydH1gKTtcbiAgcmV0dXJuIGF3YWl0IHNlcnZlcjtcbn1cblxuZXhwb3J0IHsgc3RhcnRTZXJ2ZXIgfTtcbiJdLCJmaWxlIjoibGliL3NlcnZlci5qcyIsInNvdXJjZVJvb3QiOiIuLi8uLiJ9
