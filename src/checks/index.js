'use strict';

const { REASONS: { NO_HSTS } } = require('../constants');
const hsts = require('./hsts');
const phishtank = require('./phishtank');
const blacklist = require('./blacklist');
const wot = require('./wot');

module.exports = (url) => {
  const domain = url.includes(':') ? new URL(url).hostname : url;
  const O = { url, domain };
  return Promise.all([
    hsts(O),
    phishtank(O),
    blacklist(O),
    wot(O),
  ]).then((items) => items.flat().filter((c) => c !== NO_HSTS));
};
