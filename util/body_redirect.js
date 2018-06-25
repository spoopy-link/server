'use strict';

const { JSDOM } = require('jsdom');
const parseMetaRefresh = require('./meta_refresh');
const Constants = require('../Constants');

module.exports = function bodyRedirect(html, time) {
  let done = false;
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      done = true;
      reject(new Error('timed out'));
    }, time);

    const finish = (url) => {
      if (done) {
        return;
      }

      clearTimeout(timeout);
      resolve(url);
    };

    const dom = new JSDOM(html, {
      runScripts: Constants.RUN_JS ? 'dangerously' : undefined,
      onLocationChange: (location) => {
        finish(location.href);
      },
    });

    const tag = (function repeat(obj) {
      if (!obj.childNodes) {
        return;
      }

      for (const node of obj.childNodes) {
        if (
          node.nodeName === 'META' &&
          node.attributes && Array.prototype.find.call(node.attributes, (a) =>
            a.name === 'http-equiv' && a.value === 'refresh')
        ) {
          // eslint-disable-next-line consistent-return
          return Array.prototype.find.call(node.attributes, (a) => a.name === 'content').value;
        } if (node.childNodes) {
          repeat(node.childNodes);
        }
      }
    }(dom.window.document.head));

    if (tag) {
      finish(parseMetaRefresh(tag).url);
    }
  });
};
