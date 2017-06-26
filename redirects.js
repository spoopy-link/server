const http = require('http');
const https = require('https');
const URL = require('./url');
const { createPromise, promiseResolve } = process.binding('util');

function redirects(url, last) {
  if (!new URL(url)) Promise.reject(new Error('invalid url'));

  if (!last) {
    last = {};
    last.promise = createPromise();
    last.urls = [];
  }

  last.urls.push(url);
  if (last.urls.length > 4) {
    promiseResolve(last.promise, last);
  } else {
    (url.startsWith('https') ? https : http).get(url, (res) => {
      if ([300, 301, 302, 303].includes(res.statusCode)) {
        redirects(res.headers.location, last);
      } else {
        promiseResolve(last.promise, last.urls);
      }
    });
  }

  return last.promise;
}

module.exports = redirects;
