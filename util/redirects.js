const http = require('http');
const https = require('https');
const URL = require('./url');
const Constants = require('../Constants');
const bodyRedirect = require('./body_redirect');
const log = require('./logger');

function redirects(url, last) {
  if (!URL(url)) return Promise.reject(new Error('invalid url'));
  if (!last) {
    last = {};
    last.promise = Promise.create();
    last.urls = [];
  }
  last.urls.push(url);

  if (last.urls.length > Constants.MAX_REDIRECTS) {
    last.promise.resolve(last.urls);
  } else {
    try {
      const options = URL.parse(url);
      options.headers = { 'User-Agent': Constants.UA };
      const request = (url.startsWith('https') ? https : http).get(options, (res) => {
        if ([300, 301, 302, 303].includes(res.statusCode)) {
          const newURL = /^https?:\/\//i.test(res.headers.location) ?
            res.headers.location :
            URL.resolve(url, res.headers.location);
          redirects(newURL, last);
        } else {
          let done = false;

          const chunks = [];
          res.on('data', (chunk) => chunks.push(chunk));

          const finish = () => {
            last.promise.resolve(last.urls);
            done = true;
          };
          const timeout = setTimeout(finish, 750);

          res.on('end', () => {
            if (done) return;
            clearTimeout(timeout);
            bodyRedirect(Buffer.concat(chunks).toString(), 750)
              .then((u) => redirects(u, last))
              .catch(() => finish());
          });
        }
      });
      request.on('error', (err) => {
        last.urls.push({ err, url: last.urls.pop() });
        last.promise.resolve(last.urls);
      });
    } catch (err) {
      log('INVALID URL', url);
      last.promise.reject(err);
    }
  }

  return last.promise;
}

module.exports = redirects;
