const Constants = require('../Constants');
const fs = require('fs');
const redirects = require('./redirects');
const hsts = require('./hsts');
const phishtank = require('./phishtank');
const URL = require('./url');
const log = require('./logger');

phishtank.cache().then(() => log('PHISHTANK', 'Cached'));

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
    .then(async (trail) => {
      let reasons = [];
      let safe = true;
      let fail = -1;
      if (trail.length > Constants.MAX_REDIRECTS) {
        reasons.push(Constants.REASONS.REDIRECT_COUNT);
        safe = false;
      }
      for (let i = 0; i < trail.length; i++) {
        if (await phishtank(trail[i])) {
          safe = false;
          fail = i;
          reasons.push(Constants.REASONS.PHISHTANK);
          break;
        } else if (blacklist.includes(URL(trail[i]).hostname)) {
          safe = false;
          fail = i;
          reasons.push(Constants.REASONS.UNSAFE_LINK);
          break;
        }
      }
      log('SCANNED', `${trail[0]}: safe=${safe}, fail=${fail}`);
      return { trail, safe, fail, reasons };
    });
};
