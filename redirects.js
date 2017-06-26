const http = require('http');
const https = require('https');
const URL = require('url').URL;
const { createPromise, promiseResolve } = process.binding('util');

function redirects(url, last) {
  try {
    // eslint-disable-next-line no-new
    new URL(url);
  } catch (err) {
    return Promise.reject(err);
  }
  if (!last) {
    last = {};
    last.promise = createPromise();
    last.urls = [];
  }

  last.urls.push(url);

  (url.startsWith('https') ? https : http).get(url, (res) => {
    if ([300, 301, 302, 303].includes(res.statusCode)) {
      redirects(res.headers.location, last);
    } else {
      promiseResolve(last.promise, last.urls);
    }
  });

  return last.promise;
}

module.exports = redirects;
