const path = require('path');
const { STATIC_RE } = require('../Constants');

module.exports = (router) => {
  router.get(STATIC_RE, (req, res) => {
    res.header('Content-Type', {
      js: 'application/javascript',
      json: 'application/json',
      webapp: 'application/json',
      css: 'text/css',
      xml: 'application/xml',
      txt: 'text/plain',
    }[path.extname(req.url).slice(1)] + '; charset=utf-8');
    router.cache.get(req.url).then((t) => res.end(t));
  });
};
