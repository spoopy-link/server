'use strict';

const request = require('snekfetch');
const log = require('./logger');

let phish = [];
let caching;

function phishtank(url) {
  if (phish.length) {
    return !!phish.find((p) => p.url === url);
  }

  return false;
  // return cache().then(() => !!phish.find((p) => p.url === url));
}

function cache() {
  if (caching) {
    return caching;
  }


  log('PHISHTANK', 'Caching starting');

  caching =
    request.get('https://data.phishtank.com/data/online-valid.json')
      .then((res) => {
        log('PHISHTANK', 'Caching finished');
        if (Array.isArray(res.body)) {
          phish = res.body;
        }

        caching = null;
        return true;
      })
      .catch(() => log('PHISHTANK', 'Failed'));

  return caching;
}

phishtank.cache = cache;
module.exports = phishtank;
