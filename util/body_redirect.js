const { JSDOM } = require('jsdom');
const URL = require('url');
const parseMetaRefresh = require('./meta_refresh');
const Constants = require('../Constants');

module.exports = function(html, time) {
  const promise = Promise.create();
  let done = false;

  const timeout = setTimeout(() => {
    done = true;
    promise.reject(new Error('timed out'));
  }, time);

  let dom;

  const finish = (url) => {
    if (done) return;
    clearTimeout(timeout);
    promise.resolve(url);
  };

  dom = new JSDOM(html, {
    runScripts: Constants.RUN_JS ? 'dangerously' : undefined,
    onLocationChange: (location) => {
      finish(location.href);
    },
  });

  const tag = (function repeat(obj) {
    if (!obj.childNodes) return;
    for (const node of obj.childNodes) {
      if (
        node.nodeName === 'META' &&
        node.attributes && Array.prototype.find.call(node.attributes, a => a.name === 'http-equiv' && a.value === 'refresh')
      ) {
        return Array.prototype.find.call(node.attributes, a => a.name === 'content').value;
      } else if (node.childNodes) {
        repeat(node.childNodes);
      }
    }
  }(dom.window.document.head));
  if (tag) finish(parseMetaRefresh(tag).url);

  return promise;
}
