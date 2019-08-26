"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("source-map-support/register");

var _path = _interopRequireDefault(require("path"));

var _appiumSupport = require("appium-support");

var _utils = require("./utils");

class TCCDB {
  constructor(xcodeVersion, sharedResourcesDir) {
    this.xcodeVersion = xcodeVersion;
    this.sharedResourcesDir = sharedResourcesDir;
  }

  async getDB() {
    if (this.db) {
      return this.db;
    }

    const tccPath = _path.default.resolve(this.sharedResourcesDir, 'Library', 'TCC');

    if (!(await _appiumSupport.fs.exists(tccPath))) {
      await (0, _appiumSupport.mkdirp)(tccPath);
    }

    this.db = _path.default.resolve(tccPath, 'TCC.db');
    await (0, _utils.execSQLiteQuery)(this.db, `CREATE TABLE IF NOT EXISTS access (
      service TEXT NOT NULL DEFAULT '',
      client TEXT NOT NULL DEFAULT '',
      client_type INTEGER,
      allowed INTEGER,
      prompt_count INTEGER,
      csreq BLOB NOT NULL DEFAULT '',
      policy_ID INTEGER,
      PRIMARY KEY(service, client, client_type)
    );`);
    return this.db;
  }

  async execQuery(query, ...params) {
    return await (0, _utils.execSQLiteQuery)((await this.getDB()), query, ...params);
  }

}

var _default = TCCDB;
exports.default = _default;require('source-map-support').install();


//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi90Y2MtZGIuanMiXSwibmFtZXMiOlsiVENDREIiLCJjb25zdHJ1Y3RvciIsInhjb2RlVmVyc2lvbiIsInNoYXJlZFJlc291cmNlc0RpciIsImdldERCIiwiZGIiLCJ0Y2NQYXRoIiwicGF0aCIsInJlc29sdmUiLCJmcyIsImV4aXN0cyIsImV4ZWNRdWVyeSIsInF1ZXJ5IiwicGFyYW1zIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBOztBQUNBOztBQUNBOztBQUVBLE1BQU1BLEtBQU4sQ0FBWTtBQUNWQyxFQUFBQSxXQUFXLENBQUVDLFlBQUYsRUFBZ0JDLGtCQUFoQixFQUFvQztBQUM3QyxTQUFLRCxZQUFMLEdBQW9CQSxZQUFwQjtBQUNBLFNBQUtDLGtCQUFMLEdBQTBCQSxrQkFBMUI7QUFDRDs7QUFFRCxRQUFNQyxLQUFOLEdBQWU7QUFDYixRQUFJLEtBQUtDLEVBQVQsRUFBYTtBQUNYLGFBQU8sS0FBS0EsRUFBWjtBQUNEOztBQUVELFVBQU1DLE9BQU8sR0FBR0MsY0FBS0MsT0FBTCxDQUFhLEtBQUtMLGtCQUFsQixFQUFzQyxTQUF0QyxFQUFpRCxLQUFqRCxDQUFoQjs7QUFDQSxRQUFJLEVBQUUsTUFBTU0sa0JBQUdDLE1BQUgsQ0FBVUosT0FBVixDQUFSLENBQUosRUFBaUM7QUFDL0IsWUFBTSwyQkFBT0EsT0FBUCxDQUFOO0FBQ0Q7O0FBRUQsU0FBS0QsRUFBTCxHQUFVRSxjQUFLQyxPQUFMLENBQWFGLE9BQWIsRUFBc0IsUUFBdEIsQ0FBVjtBQUNBLFVBQU0sNEJBQWdCLEtBQUtELEVBQXJCLEVBQTBCOzs7Ozs7Ozs7T0FBMUIsQ0FBTjtBQVdBLFdBQU8sS0FBS0EsRUFBWjtBQUNEOztBQUVELFFBQU1NLFNBQU4sQ0FBaUJDLEtBQWpCLEVBQXdCLEdBQUdDLE1BQTNCLEVBQW1DO0FBQ2pDLFdBQU8sTUFBTSw2QkFBZ0IsTUFBTSxLQUFLVCxLQUFMLEVBQXRCLEdBQW9DUSxLQUFwQyxFQUEyQyxHQUFHQyxNQUE5QyxDQUFiO0FBQ0Q7O0FBakNTOztlQW9DR2IsSyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgZnMsIG1rZGlycCB9IGZyb20gJ2FwcGl1bS1zdXBwb3J0JztcbmltcG9ydCB7IGV4ZWNTUUxpdGVRdWVyeSB9IGZyb20gJy4vdXRpbHMnO1xuXG5jbGFzcyBUQ0NEQiB7XG4gIGNvbnN0cnVjdG9yICh4Y29kZVZlcnNpb24sIHNoYXJlZFJlc291cmNlc0Rpcikge1xuICAgIHRoaXMueGNvZGVWZXJzaW9uID0geGNvZGVWZXJzaW9uO1xuICAgIHRoaXMuc2hhcmVkUmVzb3VyY2VzRGlyID0gc2hhcmVkUmVzb3VyY2VzRGlyO1xuICB9XG5cbiAgYXN5bmMgZ2V0REIgKCkge1xuICAgIGlmICh0aGlzLmRiKSB7XG4gICAgICByZXR1cm4gdGhpcy5kYjtcbiAgICB9XG5cbiAgICBjb25zdCB0Y2NQYXRoID0gcGF0aC5yZXNvbHZlKHRoaXMuc2hhcmVkUmVzb3VyY2VzRGlyLCAnTGlicmFyeScsICdUQ0MnKTtcbiAgICBpZiAoIShhd2FpdCBmcy5leGlzdHModGNjUGF0aCkpKSB7XG4gICAgICBhd2FpdCBta2RpcnAodGNjUGF0aCk7XG4gICAgfVxuXG4gICAgdGhpcy5kYiA9IHBhdGgucmVzb2x2ZSh0Y2NQYXRoLCAnVENDLmRiJyk7XG4gICAgYXdhaXQgZXhlY1NRTGl0ZVF1ZXJ5KHRoaXMuZGIsIGBDUkVBVEUgVEFCTEUgSUYgTk9UIEVYSVNUUyBhY2Nlc3MgKFxuICAgICAgc2VydmljZSBURVhUIE5PVCBOVUxMIERFRkFVTFQgJycsXG4gICAgICBjbGllbnQgVEVYVCBOT1QgTlVMTCBERUZBVUxUICcnLFxuICAgICAgY2xpZW50X3R5cGUgSU5URUdFUixcbiAgICAgIGFsbG93ZWQgSU5URUdFUixcbiAgICAgIHByb21wdF9jb3VudCBJTlRFR0VSLFxuICAgICAgY3NyZXEgQkxPQiBOT1QgTlVMTCBERUZBVUxUICcnLFxuICAgICAgcG9saWN5X0lEIElOVEVHRVIsXG4gICAgICBQUklNQVJZIEtFWShzZXJ2aWNlLCBjbGllbnQsIGNsaWVudF90eXBlKVxuICAgICk7YCk7XG5cbiAgICByZXR1cm4gdGhpcy5kYjtcbiAgfVxuXG4gIGFzeW5jIGV4ZWNRdWVyeSAocXVlcnksIC4uLnBhcmFtcykge1xuICAgIHJldHVybiBhd2FpdCBleGVjU1FMaXRlUXVlcnkoYXdhaXQgdGhpcy5nZXREQigpLCBxdWVyeSwgLi4ucGFyYW1zKTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBUQ0NEQjtcbiJdLCJmaWxlIjoibGliL3RjYy1kYi5qcyIsInNvdXJjZVJvb3QiOiIuLi8uLiJ9
