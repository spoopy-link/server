const request = require('snekfetch');
const { PAGES, GH_ROOT } = require('./Constants');
const TimedCache = require('./util/TimedCache');

const cache = new TimedCache(9e5, (item) => request.get(`${GH_ROOT}${PAGES[item]}`).then(r => r.text))

cache.on('get', console.log);

module.exports = cache;
