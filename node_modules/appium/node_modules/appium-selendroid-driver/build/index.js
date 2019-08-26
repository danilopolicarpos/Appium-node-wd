"use strict";

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.startServer = exports.SelendroidDriver = void 0;

require("source-map-support/register");

var _yargs = _interopRequireDefault(require("yargs"));

var _asyncbox = require("asyncbox");

var driver = _interopRequireWildcard(require("./lib/driver"));

var server = _interopRequireWildcard(require("./lib/server"));

const {
  SelendroidDriver
} = driver;
exports.SelendroidDriver = SelendroidDriver;
const {
  startServer
} = server;
exports.startServer = startServer;
const DEFAULT_HOST = 'localhost';
const DEFAULT_PORT = 4884;

async function main() {
  let port = _yargs.default.argv.port || DEFAULT_PORT;
  let host = _yargs.default.argv.host || DEFAULT_HOST;
  return await startServer(port, host);
}

if (require.main === module) {
  (0, _asyncbox.asyncify)(main);
}

var _default = SelendroidDriver;
exports.default = _default;require('source-map-support').install();


//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIl0sIm5hbWVzIjpbIlNlbGVuZHJvaWREcml2ZXIiLCJkcml2ZXIiLCJzdGFydFNlcnZlciIsInNlcnZlciIsIkRFRkFVTFRfSE9TVCIsIkRFRkFVTFRfUE9SVCIsIm1haW4iLCJwb3J0IiwieWFyZ3MiLCJhcmd2IiwiaG9zdCIsInJlcXVpcmUiLCJtb2R1bGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFFQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFHQSxNQUFNO0FBQUVBLEVBQUFBO0FBQUYsSUFBdUJDLE1BQTdCOztBQUNBLE1BQU07QUFBRUMsRUFBQUE7QUFBRixJQUFrQkMsTUFBeEI7O0FBRUEsTUFBTUMsWUFBWSxHQUFHLFdBQXJCO0FBQ0EsTUFBTUMsWUFBWSxHQUFHLElBQXJCOztBQUVBLGVBQWVDLElBQWYsR0FBdUI7QUFDckIsTUFBSUMsSUFBSSxHQUFHQyxlQUFNQyxJQUFOLENBQVdGLElBQVgsSUFBbUJGLFlBQTlCO0FBQ0EsTUFBSUssSUFBSSxHQUFHRixlQUFNQyxJQUFOLENBQVdDLElBQVgsSUFBbUJOLFlBQTlCO0FBQ0EsU0FBTyxNQUFNRixXQUFXLENBQUNLLElBQUQsRUFBT0csSUFBUCxDQUF4QjtBQUNEOztBQUVELElBQUlDLE9BQU8sQ0FBQ0wsSUFBUixLQUFpQk0sTUFBckIsRUFBNkI7QUFDM0IsMEJBQVNOLElBQVQ7QUFDRDs7ZUFHY04sZ0IiLCJzb3VyY2VzQ29udGVudCI6WyIvLyB0cmFuc3BpbGU6bWFpblxuXG5pbXBvcnQgeWFyZ3MgZnJvbSAneWFyZ3MnO1xuaW1wb3J0IHsgYXN5bmNpZnkgfSBmcm9tICdhc3luY2JveCc7XG5pbXBvcnQgKiBhcyBkcml2ZXIgZnJvbSAnLi9saWIvZHJpdmVyJztcbmltcG9ydCAqIGFzIHNlcnZlciBmcm9tICcuL2xpYi9zZXJ2ZXInO1xuXG5cbmNvbnN0IHsgU2VsZW5kcm9pZERyaXZlciB9ID0gZHJpdmVyO1xuY29uc3QgeyBzdGFydFNlcnZlciB9ID0gc2VydmVyO1xuXG5jb25zdCBERUZBVUxUX0hPU1QgPSAnbG9jYWxob3N0JztcbmNvbnN0IERFRkFVTFRfUE9SVCA9IDQ4ODQ7XG5cbmFzeW5jIGZ1bmN0aW9uIG1haW4gKCkge1xuICBsZXQgcG9ydCA9IHlhcmdzLmFyZ3YucG9ydCB8fCBERUZBVUxUX1BPUlQ7XG4gIGxldCBob3N0ID0geWFyZ3MuYXJndi5ob3N0IHx8IERFRkFVTFRfSE9TVDtcbiAgcmV0dXJuIGF3YWl0IHN0YXJ0U2VydmVyKHBvcnQsIGhvc3QpO1xufVxuXG5pZiAocmVxdWlyZS5tYWluID09PSBtb2R1bGUpIHtcbiAgYXN5bmNpZnkobWFpbik7XG59XG5cbmV4cG9ydCB7IFNlbGVuZHJvaWREcml2ZXIsIHN0YXJ0U2VydmVyIH07XG5leHBvcnQgZGVmYXVsdCBTZWxlbmRyb2lkRHJpdmVyO1xuIl0sImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZVJvb3QiOiIuLiJ9
