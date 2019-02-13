'use strict';

const crypto = require('crypto');
const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');
const { WEB_ROOT, PAGES } = require('./constants');
const TimedCache = require('./timed_cache');

const cache = new TimedCache(9e5, async (item) => {
  const url = `${WEB_ROOT}${item.startsWith('/') ? item : PAGES[item]}`;
  const text = await fetch(url).then((r) => r.text());

  if (!text.startsWith('<!DOCTYPE html>')) {
    return text;
  }

  const dom = new JSDOM(text);
  const { document } = dom.window;

  const scripts = document.querySelectorAll('script');
  const styles = document.querySelectorAll('link[rel=stylesheet]');

  await Promise.all([...scripts, ...styles].map(async (node) => {
    if (!node.src && !node.href) {
      return;
    }

    node.setAttribute('crossorigin', 'anonymous');
    let src = (node.src || node.href).replace(/^\//, '');
    if (!/^https?:\/\//.test(src)) {
      src = `${WEB_ROOT}${src.startsWith('/') ? '' : '/'}${src}`;
    }
    const t = await fetch(src).then((r) => r.text());
    const hash = crypto.createHash('sha384').update(t).digest('base64');
    node.setAttribute('integrity', `sha384-${hash}`);
  }));

  const search = document.createElement('LINK');
  search.setAttribute('type', 'application/opensearchdescription+xml');
  search.setAttribute('rel', 'search');
  search.setAttribute('href', '/search.xml');
  document.head.appendChild(search);

  return dom.serialize();
});

module.exports = cache;
