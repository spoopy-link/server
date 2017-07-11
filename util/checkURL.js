const fs = require('fs');
const Constants = require('../Constants');
const URL = require('./url');
const phishtank = require('./phishtank');
phishtank.cache();

const blacklist = fs.readFileSync('./blacklist.txt')
  .toString().split('\n')
  .filter((x) => x);

function check(url, error) {
  const reasons = [];
  if (error) {
    if (
      Constants.SSL_ERRORS.includes(error.code) ||
      /OCSP/.test(error.code) ||
      /(certificate|ocsp)/i.test(error.message)
    ) reasons.push('SSL');
    else reasons.push('INVALID');
  }
  if (blacklist.includes(URL(url).hostname)) {
    reasons.push(Constants.REASONS.UNSAFE_LINK);
  }
  if (phishtank(url)) reasons.push(Constants.REASONS.PHISHTANK);
  return reasons;
}

module.exports = check;
