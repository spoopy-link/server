const request = require('snekfetch');
const { PAGES, GH_ROOT, SERVER_404_MESSAGE } = require('./Constants');
const TimedCache = require('./util/TimedCache');

const cache = new TimedCache(9e5, (item) => request.get(`${GH_ROOT}${PAGES[item]}`)
  .then(r => r.text)
  .catch(() => SERVER_404_MESSAGE)
);

cache.on('get', console.log);

module.exports = cache;
