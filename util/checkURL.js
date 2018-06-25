'use strict';

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
    ) {
      reasons.push('SSL');
    } else {
      reasons.push('INVALID');
    }
  }
  const { hostname } = URL(url);
  if (blacklist.includes(hostname)) {
    reasons.push(Constants.REASONS.UNSAFE_LINK);
  }


  if (phishtank(url)) {
    reasons.push(Constants.REASONS.PHISHTANK);
  }

  const wotScore = await wot(hostname);
  if (!wotScore.safe) {
    reasons.push(...wotScore.reasons);
  }

  return reasons;
}

module.exports = check;
