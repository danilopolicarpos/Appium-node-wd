"use strict";

require("source-map-support/register");

module.exports = {
  find: function (driver, logger, selector, multiple) {
    if (!driver || !driver.opts) {
      throw new Error('Expected driver object');
    }

    if (!logger || !logger.info) {
      throw new Error('Expected logger object');
    }

    if (selector === 'foo') {
      return ['bar'];
    }

    if (selector === 'foos') {
      if (multiple) {
        return ['baz1', 'baz2'];
      }

      return ['bar1', 'bar2'];
    }

    if (selector === 'error') {
      throw new Error('This is a plugin error');
    }

    return [];
  }
};require('source-map-support').install();


//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRlc3QvYmFzZWRyaXZlci9maXh0dXJlcy9jdXN0b20tZWxlbWVudC1maW5kZXIuanMiXSwibmFtZXMiOlsibW9kdWxlIiwiZXhwb3J0cyIsImZpbmQiLCJkcml2ZXIiLCJsb2dnZXIiLCJzZWxlY3RvciIsIm11bHRpcGxlIiwib3B0cyIsIkVycm9yIiwiaW5mbyJdLCJtYXBwaW5ncyI6Ijs7OztBQUFBQSxNQUFNLENBQUNDLE9BQVAsR0FBaUI7QUFDZkMsRUFBQUEsSUFBSSxFQUFFLFVBQVVDLE1BQVYsRUFBa0JDLE1BQWxCLEVBQTBCQyxRQUExQixFQUFvQ0MsUUFBcEMsRUFBOEM7QUFDbEQsUUFBSSxDQUFDSCxNQUFELElBQVcsQ0FBQ0EsTUFBTSxDQUFDSSxJQUF2QixFQUE2QjtBQUMzQixZQUFNLElBQUlDLEtBQUosQ0FBVSx3QkFBVixDQUFOO0FBQ0Q7O0FBRUQsUUFBSSxDQUFDSixNQUFELElBQVcsQ0FBQ0EsTUFBTSxDQUFDSyxJQUF2QixFQUE2QjtBQUMzQixZQUFNLElBQUlELEtBQUosQ0FBVSx3QkFBVixDQUFOO0FBQ0Q7O0FBRUQsUUFBSUgsUUFBUSxLQUFLLEtBQWpCLEVBQXdCO0FBQ3RCLGFBQU8sQ0FBQyxLQUFELENBQVA7QUFDRDs7QUFFRCxRQUFJQSxRQUFRLEtBQUssTUFBakIsRUFBeUI7QUFDdkIsVUFBSUMsUUFBSixFQUFjO0FBQ1osZUFBTyxDQUFDLE1BQUQsRUFBUyxNQUFULENBQVA7QUFDRDs7QUFFRCxhQUFPLENBQUMsTUFBRCxFQUFTLE1BQVQsQ0FBUDtBQUNEOztBQUVELFFBQUlELFFBQVEsS0FBSyxPQUFqQixFQUEwQjtBQUN4QixZQUFNLElBQUlHLEtBQUosQ0FBVSx3QkFBVixDQUFOO0FBQ0Q7O0FBRUQsV0FBTyxFQUFQO0FBQ0Q7QUEzQmMsQ0FBakIiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgZmluZDogZnVuY3Rpb24gKGRyaXZlciwgbG9nZ2VyLCBzZWxlY3RvciwgbXVsdGlwbGUpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBvYmplY3Qtc2hvcnRoYW5kXG4gICAgaWYgKCFkcml2ZXIgfHwgIWRyaXZlci5vcHRzKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0V4cGVjdGVkIGRyaXZlciBvYmplY3QnKTtcbiAgICB9XG5cbiAgICBpZiAoIWxvZ2dlciB8fCAhbG9nZ2VyLmluZm8pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignRXhwZWN0ZWQgbG9nZ2VyIG9iamVjdCcpO1xuICAgIH1cblxuICAgIGlmIChzZWxlY3RvciA9PT0gJ2ZvbycpIHtcbiAgICAgIHJldHVybiBbJ2JhciddO1xuICAgIH1cblxuICAgIGlmIChzZWxlY3RvciA9PT0gJ2Zvb3MnKSB7XG4gICAgICBpZiAobXVsdGlwbGUpIHtcbiAgICAgICAgcmV0dXJuIFsnYmF6MScsICdiYXoyJ107XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBbJ2JhcjEnLCAnYmFyMiddO1xuICAgIH1cblxuICAgIGlmIChzZWxlY3RvciA9PT0gJ2Vycm9yJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdUaGlzIGlzIGEgcGx1Z2luIGVycm9yJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIFtdO1xuICB9XG59O1xuIl0sImZpbGUiOiJ0ZXN0L2Jhc2Vkcml2ZXIvZml4dHVyZXMvY3VzdG9tLWVsZW1lbnQtZmluZGVyLmpzIiwic291cmNlUm9vdCI6Ii4uLy4uLy4uLy4uIn0=
