const fs = require('fs');
const http = require('http');
const URL = require('./util/url');
const redirects = require('./util/redirects');
const get = require('./util/get');
const Router = require('./server/Router');
const Constants = require('./Constants');
const serializers = require('./serializers');

const blacklist = fs.readFileSync('./blacklist.txt')
  .toString().split('\n')
  .filter(x => x);

(async function() {
  const pages = {
    index: await get('https://raw.githubusercontent.com/devsnek/spoopy.link/gh-pages/index.html').then(r => r.text),
    spoopy: await get('https://raw.githubusercontent.com/devsnek/spoopy.link/gh-pages/404.html').then(r => r.text),
  };

  const server = http.createServer();
  const router = new Router(server);

  router.use((req, res) => {
    req.needsOG = Constants.UA_REGEX.test(req.headers['user-agent']);
    res.headers({
      'Access-Control-Allow-Origin': 'spoopy.link spoopy-link.now.sh gus.host',
      'Access-Control-Allow-Methods': '*',
      'Access-Control-Allow-Headers': '*',
    });
  });

  router.get(/\/$/, (req, res) => {
    res.headers({ 'Content-Type': 'text/html' });
    res.end(pages.index);
  });

  router.get(/\/json\/.+/, (req, res) => {
    getFinal(req.url.replace('/json/', ''))
    .then((output) => {
      res.headers({ 'Content-Type': 'application/json' });
      res.end(serializers.raw(output));
    })
    .catch((err) => {
      res.status(500).end();
      console.error(err);
    });
  });

  router.get(/\/(https?).+/, (req, res) => {
    if (req.needsOG) {
      getFinal(req.url.slice(1))
      .then((output) => {
        res.headers({ 'Content-Type': 'text/html' });
        res.end(serializers.og(output));
      })
      .catch((err) => {
        res.status(500).end();
        console.error(err);
      });
    } else {
      res.end(pages.spoopy);
    }
  });

  router.get(/.+/, (req, res) => {
    res.status(404).end('404 m8');
  });

  server.listen(Constants.SERVER_PORT);
}());

function getFinal(url) {
  return redirects(url)
    .then((trail) => {
      let safe = trail.length < Constants.MAX_REDIRECTS;
      let fail = 0;
      if (safe) {
        for (let i = 0; i < trail.length; i++) {
          if (blacklist.includes(new URL(trail[i]).hostname)) {
            safe = false;
            fail = i;
            break;
          }
        }
      }
      console.log(`Scanned ${trail[0]} ... safe=${safe}, fail=${fail}`);
      return { trail, safe, fail };
    })
    .catch(console.error);
}
