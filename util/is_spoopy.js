const Constants = require('../Constants');
const fs = require('fs');
const redirects = require('./redirects');
const hsts = require('./hsts');
const phishtank = require('./phishtank');
const URL = require('./url');
const log = require('./logger');

phishtank.cache();

const blacklist = fs.readFileSync('./blacklist.txt')
  .toString().split('\n')
  .filter((x) => x);

module.exports = async function isSpoopy(url) {
  url = url
    // Fuck discord
    .replace(/(https?):\/([^/])/, (_, protocol, x) => `${protocol}://${x}`)
    // Fuck people who don't understand that `<url>` means just put the url
    .replace(/(^<|>$)/g, '');

  if (!/https?:\/\//.test(url)) {
    const preloaded = await hsts(url.split(/[/?]/)[0]);
    url = `http${preloaded ? 's' : ''}://${url}`;
  }

  return redirects(url)
    .then(async (chain) => {
      for (const i in chain) {
        const scan = {
          url: chain[i],
          safe: true,
          reasons: [],
        };
        if (blacklist.includes(URL(scan.url).hostname)) {
          scan.reasons.push(Constants.REASONS.UNSAFE_LINK);
        }
        if (await phishtank(scan.url)) {
          scan.reasons.push(Constants.REASONS.PHISHTANK);
        }
        scan.safe = scan.reasons.length === 0;
        chain[i] = scan;
      }
      const safe = !chain.some((t) => !t.safe);
      log('SCANNED', `${chain[0].url}: safe=${safe}`);
      return { chain, safe };
    });
};
