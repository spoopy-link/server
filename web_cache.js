const crypto = require('crypto');
const request = require('snekfetch');
const { PAGES, GH_ROOT, SERVER_404_MESSAGE } = require('./Constants');
const TimedCache = require('./util/TimedCache');
const { JSDOM } = require('jsdom');
const log = require('./util/logger');

const WEB_ROOT = process.env.GH_ROOT || GH_ROOT;

const cache = new TimedCache(9e5, (item) =>
  request.get(`${WEB_ROOT}${item.startsWith('/') ? item : PAGES[item]}`)
    .then(async(res) => {
      if (!res.text.startsWith('<!DOCTYPE html>'))
        return res.text;
      const dom = new JSDOM(res.text);
      const document = dom.window.document;

      const scripts = document.querySelectorAll('script');
      const styles = document.querySelectorAll('link[rel=stylesheet]');
      for (const node of [...scripts, ...styles]) {
        if (!node.src && !node.href)
          continue;
        node.setAttribute('crossorigin', 'anonymous');
        let src = (node.src || node.href).replace(/^\//, '');
        src = /^https?:\/\//.test(src) ? src : `${WEB_ROOT}${src.startsWith('/') ? '' : '/'}${src}`;
        await request.get(src) // eslint-disable-line no-await-in-loop
          .then((r) => {
            node.setAttribute('integrity', `sha384-${crypto.createHash('sha384').update(r.text).digest('base64')}`);
          })
          .catch(log);
      }

      const search = document.createElement('LINK');
      search.setAttribute('type', 'application/opensearchdescription+xml');
      search.setAttribute('rel', 'search');
      search.setAttribute('href', '/search.xml');
      document.head.appendChild(search);

      return dom.serialize();
    })
    .catch((err) => {
      log('FETCH', err);
      return SERVER_404_MESSAGE;
    })
);

cache.on('get', (state, item) => {
  log('CACHE ITEM', state, item);
});

module.exports = cache;
