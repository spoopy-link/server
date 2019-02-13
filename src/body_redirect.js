'use strict';

const { JSDOM } = require('jsdom');
const { RUN_JS } = require('./constants');

const pattern = /^\s*(\d+)(?:\s*;(?:\s*url\s*=)?\s*(.+)?)?$/i;

function parseMetaRefresh(content) {
  const result = { timeout: null, url: null };
  content = pattern.exec(content);

  if (content !== null) {
    if (content[1] !== undefined) {
      result.timeout = Number.parseInt(content[1], 10);
    }


    if (content[2] !== undefined) {
      let url = content[2].trim();

      const firstChar = url[0];
      const lastChar = url[url.length - 1];

      if ((firstChar === "'" && lastChar === "'") || (firstChar === '"' && lastChar === '"')) {
        url = url.length > 2 ? url = url.substr(1, url.length - 2).trim() : 2;
        if (url === '') {
          url = null;
        }
      }

      result.url = url;
    }
  }

  return result;
}

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
      runScripts: RUN_JS ? 'dangerously' : undefined,
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
