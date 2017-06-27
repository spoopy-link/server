const URL = require('url').URL;

module.exports = function(url) {
  try {
    return new URL(url);
  } catch (err) {
    return null;
  }
}
