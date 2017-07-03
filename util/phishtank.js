require('promise_util');
const request = require('snekfetch');
const log = require('./logger');

let phish = [];
let caching;

function phishtank(url) {
  if (phish.length) return Promise.resolve(!!phish.find((p) => p.url === url));
  return cache().then(() => !!phish.find((p) => p.url === url));
}

function cache() {
  if (caching) return caching;

  log('PHISHTANK', 'Caching starting');

  caching = Promise.create();
  request.get('https://data.phishtank.com/data/online-valid.json')
    .then((res) => {
      log('PHISHTANK', 'Caching finished');
      phish = res.body;
      caching.resolve(true);
      caching = null;
    });
  return caching;
}

phishtank.cache = cache;
module.exports = phishtank;
