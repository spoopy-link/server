'use strict';

const URL = require('url');
const http = require('http');
const https = require('https');
const ocsp = require('ocsp');
const hsts = require('./checks/hsts');
const checks = require('./checks');
const bodyRedirect = require('./body_redirect');
const { UA } = require('./constants');

async function follow(link, handler, noscan = false) {
  if (!/https?:\/\//.test(link)) {
    const preloaded = await hsts({ domain: link });
    link = `http${preloaded ? 's' : ''}://${link}`;
  }

  const ret = {
    chain: [],
    get safe() {
      return !ret.chain.some((t) => !t.safe);
    },
  };

  const handle = (o) => {
    if (handler) {
      handler(o);
    }

    ret.chain.push(o);
  };

  const promise = new Promise((resolve) => {
    (function redirects(url) {
      const options = URL.parse(url);
      options.headers = { 'User-Agent': UA };
      if (url.startsWith('https')) {
        options.agent = new ocsp.Agent();
      }

      const request = (url.startsWith('https') ? https : http).get(options);
      const x = async (res) => {
        const error = res instanceof Error ? res : null;
        const reasons = noscan === true ? [] : await checks(url);
        handle({
          url,
          reasons,
          safe: reasons.length === 0,
        });
        if (error) {
          resolve(ret);
          return;
        }
        if ([300, 301, 302, 303, 307].includes(res.statusCode)) {
          const newURL = /^https?:\/\//i.test(res.headers.location) ?
            res.headers.location :
            URL.resolve(url, res.headers.location);
          redirects(newURL);
        } else {
          let done = false;
          const chunks = [];
          res.on('data', (chunk) => chunks.push(chunk));
          const finish = () => {
            done = true;
            resolve(ret);
          };
          const timeout = setTimeout(finish, 750);
          res.on('end', () => {
            if (done) {
              return;
            }

            done = true;
            clearTimeout(timeout);
            bodyRedirect(Buffer.concat(chunks).toString(), 750)
              .then(redirects)
              .catch(finish);
          });
        }
      };
      request.once('error', x);
      request.once('response', x);
    }(link));
  });

  promise.then(() => {
    console.log('SCAN', link, `safe=${ret.safe}`);
  });

  return promise;
}

module.exports = follow;
