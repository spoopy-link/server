const URL = require('url');

module.exports = function(url) {
  try {
    return new URL.URL(url);
  } catch (err) {
    return null;
  }
};

module.exports.resolve = URL.resolve;
module.exports.parse = URL.parse;
