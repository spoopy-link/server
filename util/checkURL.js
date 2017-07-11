const fs = require('fs');
const Constants = require('../Constants');
const URL = require('./url');
const phishtank = require('./phishtank');
const wot = require('./wot');

phishtank.cache();

const blacklist = fs.readFileSync('./blacklist.txt')
  .toString().split('\n')
  .filter((x) => x);

async function check(url, error) {
  const reasons = [];
  if (error) {
    if (
      Constants.SSL_ERRORS.includes(error.code) ||
      /OCSP/.test(error.code) ||
      /(certificate|ocsp)/i.test(error.message)
    ) reasons.push('SSL');
    else reasons.push('INVALID');
  }
  const hostname = URL(url).hostname;
  if (blacklist.includes(hostname)) {
    reasons.push(Constants.REASONS.UNSAFE_LINK);
  }
  if (phishtank(url)) reasons.push(Constants.REASONS.PHISHTANK);
  const wotScore = await wot(hostname);
  if (!wotScore.safe) {
    const wotReasons = Object.keys(wotScore.categories).filter(x => !['GOOD_SITE', 'SITE_FOR_KIDS'].includes(x));
    if (wotReasons.length) reasons.push(...wotReasons);
    else reasons.push('WOT');
  }
  return reasons;
}

module.exports = check;
