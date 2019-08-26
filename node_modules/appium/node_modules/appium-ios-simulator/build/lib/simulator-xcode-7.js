"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("source-map-support/register");

var _simulatorXcode = _interopRequireDefault(require("./simulator-xcode-6"));

class SimulatorXcode7 extends _simulatorXcode.default {
  constructor(udid, xcodeVersion) {
    super(udid, xcodeVersion);
    this.simulatorApp = 'Simulator.app';
  }

  static async _getDeviceStringVersionString(platformVersion) {
    let reqVersion = await this._getDeviceStringPlatformVersion(platformVersion);
    return `(${reqVersion})`;
  }

  static _getDeviceStringConfigFix() {
    return {
      'iPad Simulator (8.1)': 'iPad 2 (8.1)',
      'iPad Simulator (8.2)': 'iPad 2 (8.2)',
      'iPad Simulator (8.3)': 'iPad 2 (8.3)',
      'iPad Simulator (8.4)': 'iPad 2 (8.4)',
      'iPad Simulator (9.0)': 'iPad 2 (9.0)',
      'iPad Simulator (9.1)': 'iPad 2 (9.1)',
      'iPad Simulator (9.2)': 'iPad 2 (9.2)',
      'iPad Simulator (9.3)': 'iPad 2 (9.3)',
      'iPad Simulator (10.0)': 'iPad Retina',
      'iPad Simulator (10.1)': 'iPad Retina',
      'iPhone Simulator (8.1)': 'iPhone 6 (8.1)',
      'iPhone Simulator (8.2)': 'iPhone 6 (8.2)',
      'iPhone Simulator (8.3)': 'iPhone 6 (8.3)',
      'iPhone Simulator (8.4)': 'iPhone 6 (8.4)',
      'iPhone Simulator (9.0)': 'iPhone 6 (9.0) [',
      'iPhone Simulator (9.1)': 'iPhone 6 (9.1) [',
      'iPhone Simulator (9.2)': 'iPhone 6 (9.2) [',
      'iPhone Simulator (9.3)': 'iPhone 6 (9.3) [',
      'iPhone 6 (9.0)': 'iPhone 6 (9.0) [',
      'iPhone 6 (9.1)': 'iPhone 6 (9.1) [',
      'iPhone 6 (9.2)': 'iPhone 6 (9.2) [',
      'iPhone 6 (9.3)': 'iPhone 6 (9.3) [',
      'iPhone 6 Plus (9.0)': 'iPhone 6 Plus (9.0) [',
      'iPhone 6 Plus (9.1)': 'iPhone 6 Plus (9.1) [',
      'iPhone 6 Plus (9.2)': 'iPhone 6 Plus (9.2) [',
      'iPhone 6 Plus (9.3)': 'iPhone 6 Plus (9.3) [',
      'iPhone 6s (9.0)': 'iPhone 6s (9.0) [',
      'iPhone 6s (9.1)': 'iPhone 6s (9.1) [',
      'iPhone 6s (9.2)': 'iPhone 6s (9.2) [',
      'iPhone 6s (9.3)': 'iPhone 6s (9.3) [',
      'iPhone 6s Plus (9.0)': 'iPhone 6s Plus (9.0) [',
      'iPhone 6s Plus (9.1)': 'iPhone 6s Plus (9.1) [',
      'iPhone 6s Plus (9.2)': 'iPhone 6s Plus (9.2) [',
      'iPhone 6s Plus (9.3)': 'iPhone 6s Plus (9.3) ['
    };
  }

}

var _default = SimulatorXcode7;
exports.default = _default;require('source-map-support').install();


//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImxpYi9zaW11bGF0b3IteGNvZGUtNy5qcyJdLCJuYW1lcyI6WyJTaW11bGF0b3JYY29kZTciLCJTaW11bGF0b3JYY29kZTYiLCJjb25zdHJ1Y3RvciIsInVkaWQiLCJ4Y29kZVZlcnNpb24iLCJzaW11bGF0b3JBcHAiLCJfZ2V0RGV2aWNlU3RyaW5nVmVyc2lvblN0cmluZyIsInBsYXRmb3JtVmVyc2lvbiIsInJlcVZlcnNpb24iLCJfZ2V0RGV2aWNlU3RyaW5nUGxhdGZvcm1WZXJzaW9uIiwiX2dldERldmljZVN0cmluZ0NvbmZpZ0ZpeCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQTs7QUFFQSxNQUFNQSxlQUFOLFNBQThCQyx1QkFBOUIsQ0FBOEM7QUFFNUNDLEVBQUFBLFdBQVcsQ0FBRUMsSUFBRixFQUFRQyxZQUFSLEVBQXNCO0FBQy9CLFVBQU1ELElBQU4sRUFBWUMsWUFBWjtBQUVBLFNBQUtDLFlBQUwsR0FBb0IsZUFBcEI7QUFDRDs7QUFFRCxlQUFhQyw2QkFBYixDQUE0Q0MsZUFBNUMsRUFBNkQ7QUFDM0QsUUFBSUMsVUFBVSxHQUFHLE1BQU0sS0FBS0MsK0JBQUwsQ0FBcUNGLGVBQXJDLENBQXZCO0FBQ0EsV0FBUSxJQUFHQyxVQUFXLEdBQXRCO0FBQ0Q7O0FBRUQsU0FBT0UseUJBQVAsR0FBb0M7QUFDbEMsV0FBTztBQUNMLDhCQUF3QixjQURuQjtBQUVMLDhCQUF3QixjQUZuQjtBQUdMLDhCQUF3QixjQUhuQjtBQUlMLDhCQUF3QixjQUpuQjtBQUtMLDhCQUF3QixjQUxuQjtBQU1MLDhCQUF3QixjQU5uQjtBQU9MLDhCQUF3QixjQVBuQjtBQVFMLDhCQUF3QixjQVJuQjtBQVNMLCtCQUF5QixhQVRwQjtBQVVMLCtCQUF5QixhQVZwQjtBQVdMLGdDQUEwQixnQkFYckI7QUFZTCxnQ0FBMEIsZ0JBWnJCO0FBYUwsZ0NBQTBCLGdCQWJyQjtBQWNMLGdDQUEwQixnQkFkckI7QUFrQkwsZ0NBQTBCLGtCQWxCckI7QUFtQkwsZ0NBQTBCLGtCQW5CckI7QUFvQkwsZ0NBQTBCLGtCQXBCckI7QUFxQkwsZ0NBQTBCLGtCQXJCckI7QUFzQkwsd0JBQWtCLGtCQXRCYjtBQXVCTCx3QkFBa0Isa0JBdkJiO0FBd0JMLHdCQUFrQixrQkF4QmI7QUF5Qkwsd0JBQWtCLGtCQXpCYjtBQTBCTCw2QkFBdUIsdUJBMUJsQjtBQTJCTCw2QkFBdUIsdUJBM0JsQjtBQTRCTCw2QkFBdUIsdUJBNUJsQjtBQTZCTCw2QkFBdUIsdUJBN0JsQjtBQThCTCx5QkFBbUIsbUJBOUJkO0FBK0JMLHlCQUFtQixtQkEvQmQ7QUFnQ0wseUJBQW1CLG1CQWhDZDtBQWlDTCx5QkFBbUIsbUJBakNkO0FBa0NMLDhCQUF3Qix3QkFsQ25CO0FBbUNMLDhCQUF3Qix3QkFuQ25CO0FBb0NMLDhCQUF3Qix3QkFwQ25CO0FBcUNMLDhCQUF3QjtBQXJDbkIsS0FBUDtBQXVDRDs7QUFyRDJDOztlQXdEL0JWLGUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgU2ltdWxhdG9yWGNvZGU2IGZyb20gJy4vc2ltdWxhdG9yLXhjb2RlLTYnO1xuXG5jbGFzcyBTaW11bGF0b3JYY29kZTcgZXh0ZW5kcyBTaW11bGF0b3JYY29kZTYge1xuXG4gIGNvbnN0cnVjdG9yICh1ZGlkLCB4Y29kZVZlcnNpb24pIHtcbiAgICBzdXBlcih1ZGlkLCB4Y29kZVZlcnNpb24pO1xuXG4gICAgdGhpcy5zaW11bGF0b3JBcHAgPSAnU2ltdWxhdG9yLmFwcCc7XG4gIH1cblxuICBzdGF0aWMgYXN5bmMgX2dldERldmljZVN0cmluZ1ZlcnNpb25TdHJpbmcgKHBsYXRmb3JtVmVyc2lvbikge1xuICAgIGxldCByZXFWZXJzaW9uID0gYXdhaXQgdGhpcy5fZ2V0RGV2aWNlU3RyaW5nUGxhdGZvcm1WZXJzaW9uKHBsYXRmb3JtVmVyc2lvbik7XG4gICAgcmV0dXJuIGAoJHtyZXFWZXJzaW9ufSlgO1xuICB9XG5cbiAgc3RhdGljIF9nZXREZXZpY2VTdHJpbmdDb25maWdGaXggKCkge1xuICAgIHJldHVybiB7XG4gICAgICAnaVBhZCBTaW11bGF0b3IgKDguMSknOiAnaVBhZCAyICg4LjEpJyxcbiAgICAgICdpUGFkIFNpbXVsYXRvciAoOC4yKSc6ICdpUGFkIDIgKDguMiknLFxuICAgICAgJ2lQYWQgU2ltdWxhdG9yICg4LjMpJzogJ2lQYWQgMiAoOC4zKScsXG4gICAgICAnaVBhZCBTaW11bGF0b3IgKDguNCknOiAnaVBhZCAyICg4LjQpJyxcbiAgICAgICdpUGFkIFNpbXVsYXRvciAoOS4wKSc6ICdpUGFkIDIgKDkuMCknLFxuICAgICAgJ2lQYWQgU2ltdWxhdG9yICg5LjEpJzogJ2lQYWQgMiAoOS4xKScsXG4gICAgICAnaVBhZCBTaW11bGF0b3IgKDkuMiknOiAnaVBhZCAyICg5LjIpJyxcbiAgICAgICdpUGFkIFNpbXVsYXRvciAoOS4zKSc6ICdpUGFkIDIgKDkuMyknLFxuICAgICAgJ2lQYWQgU2ltdWxhdG9yICgxMC4wKSc6ICdpUGFkIFJldGluYScsXG4gICAgICAnaVBhZCBTaW11bGF0b3IgKDEwLjEpJzogJ2lQYWQgUmV0aW5hJyxcbiAgICAgICdpUGhvbmUgU2ltdWxhdG9yICg4LjEpJzogJ2lQaG9uZSA2ICg4LjEpJyxcbiAgICAgICdpUGhvbmUgU2ltdWxhdG9yICg4LjIpJzogJ2lQaG9uZSA2ICg4LjIpJyxcbiAgICAgICdpUGhvbmUgU2ltdWxhdG9yICg4LjMpJzogJ2lQaG9uZSA2ICg4LjMpJyxcbiAgICAgICdpUGhvbmUgU2ltdWxhdG9yICg4LjQpJzogJ2lQaG9uZSA2ICg4LjQpJyxcbiAgICAgIC8vIEZpeGluZyBhbWJpZ3VvdXMgZGV2aWNlIG5hbWUgYnkgYWRkaW5nICdbJyBhdCB0aGUgZW5kIHNvIGludHJ1bWVudHNcbiAgICAgIC8vIGNvcnJlY3RseSBzdGFydHMgaVBob25lIDYgW3VkaWRdIGFuZCBub3QgdGhlIGlQaG9uZSA2ICg5LjApICsgQXBwbGUgV2F0Y2hcbiAgICAgIC8vIGZvciBpb3M5LjAgYW5kIGFib3ZlOyBzZWUgIzU2MTlcbiAgICAgICdpUGhvbmUgU2ltdWxhdG9yICg5LjApJzogJ2lQaG9uZSA2ICg5LjApIFsnLFxuICAgICAgJ2lQaG9uZSBTaW11bGF0b3IgKDkuMSknOiAnaVBob25lIDYgKDkuMSkgWycsXG4gICAgICAnaVBob25lIFNpbXVsYXRvciAoOS4yKSc6ICdpUGhvbmUgNiAoOS4yKSBbJyxcbiAgICAgICdpUGhvbmUgU2ltdWxhdG9yICg5LjMpJzogJ2lQaG9uZSA2ICg5LjMpIFsnLFxuICAgICAgJ2lQaG9uZSA2ICg5LjApJzogJ2lQaG9uZSA2ICg5LjApIFsnLFxuICAgICAgJ2lQaG9uZSA2ICg5LjEpJzogJ2lQaG9uZSA2ICg5LjEpIFsnLFxuICAgICAgJ2lQaG9uZSA2ICg5LjIpJzogJ2lQaG9uZSA2ICg5LjIpIFsnLFxuICAgICAgJ2lQaG9uZSA2ICg5LjMpJzogJ2lQaG9uZSA2ICg5LjMpIFsnLFxuICAgICAgJ2lQaG9uZSA2IFBsdXMgKDkuMCknOiAnaVBob25lIDYgUGx1cyAoOS4wKSBbJyxcbiAgICAgICdpUGhvbmUgNiBQbHVzICg5LjEpJzogJ2lQaG9uZSA2IFBsdXMgKDkuMSkgWycsXG4gICAgICAnaVBob25lIDYgUGx1cyAoOS4yKSc6ICdpUGhvbmUgNiBQbHVzICg5LjIpIFsnLFxuICAgICAgJ2lQaG9uZSA2IFBsdXMgKDkuMyknOiAnaVBob25lIDYgUGx1cyAoOS4zKSBbJyxcbiAgICAgICdpUGhvbmUgNnMgKDkuMCknOiAnaVBob25lIDZzICg5LjApIFsnLFxuICAgICAgJ2lQaG9uZSA2cyAoOS4xKSc6ICdpUGhvbmUgNnMgKDkuMSkgWycsXG4gICAgICAnaVBob25lIDZzICg5LjIpJzogJ2lQaG9uZSA2cyAoOS4yKSBbJyxcbiAgICAgICdpUGhvbmUgNnMgKDkuMyknOiAnaVBob25lIDZzICg5LjMpIFsnLFxuICAgICAgJ2lQaG9uZSA2cyBQbHVzICg5LjApJzogJ2lQaG9uZSA2cyBQbHVzICg5LjApIFsnLFxuICAgICAgJ2lQaG9uZSA2cyBQbHVzICg5LjEpJzogJ2lQaG9uZSA2cyBQbHVzICg5LjEpIFsnLFxuICAgICAgJ2lQaG9uZSA2cyBQbHVzICg5LjIpJzogJ2lQaG9uZSA2cyBQbHVzICg5LjIpIFsnLFxuICAgICAgJ2lQaG9uZSA2cyBQbHVzICg5LjMpJzogJ2lQaG9uZSA2cyBQbHVzICg5LjMpIFsnLFxuICAgIH07XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgU2ltdWxhdG9yWGNvZGU3O1xuIl0sImZpbGUiOiJsaWIvc2ltdWxhdG9yLXhjb2RlLTcuanMiLCJzb3VyY2VSb290IjoiLi4vLi4ifQ==
