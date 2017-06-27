const fs = require('fs');
const http = require('http');
const URL = require('./util/url');
const redirects = require('./util/redirects');
const request = require('snekfetch');
const Router = require('./server/Router');
const Constants = require('./Constants');
const serializers = require('./serializers');
const querystring = require('querystring');

const blacklist = fs.readFileSync('./blacklist.txt')
  .toString().split('\n')
  .filter(x => x);

(async function() {
  const pages = {
    index: await request.get('https://raw.githubusercontent.com/devsnek/spoopy.link/gh-pages/index.html').then(r => r.text),
    spoopy: await request.get('https://raw.githubusercontent.com/devsnek/spoopy.link/gh-pages/404.html').then(r => r.text),
  };

  const server = http.createServer();
  const router = new Router(server);

  router.use((req, res, next) => {
    req.needsOG = Constants.UA_REGEX.test(req.headers['user-agent']);
    if (Constants.CORS_ORIGINS.includes(req.headers['origin'])) {
      res.setHeaders({
        'Access-Control-Allow-Origin': req.headers['origin'],
        'Access-Control-Allow-Methods': '*',
        'Access-Control-Allow-Headers': '*',
      });
    }
    const chunks = [];
    req.on('data', c=> chunks.push(c));
    req.on('end', () => {
      req.body = Buffer.concat(chunks).toString();
      next();
    });
  });

  router.get(/\/$/, (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.end(pages.index);
  });

  router.get(/\/json\/.+/, (req, res) => {
    getFinal(req.url.replace('/json/', ''))
    .then((output) => {
      res.setHeader('Content-Type', 'application/json');
      res.end(serializers.raw(output));
    })
    .catch((err) => {
      res.status(500).end();
      console.error(err);
    });
  });

  router.get(/\/slack/, (req, res) => {
    const body = querystring.parse(req.body);

    getFinal(body.text.replace(/<|>/g, ''))
    .then((output) => {
      res.end(200);
      request.post(body.response_url)
        .send(serializers.slack(output))
        .end();
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
        res.setHeader('Content-Type', 'text/html');
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
  // fuck discord
  url = url.replace(/(https?):\/([^\/])/, (_, protocol, x) => `${protocol}://${x}`);
  return redirects(url)
    .then((trail) => {
      let reasons = [];
      let safe = true;
      let fail = 0;
      if (trail.length > Constants.MAX_REDIRECTS) {
        reasons.push(Constants.REASONS.TOO_MANY);
        safe = false;
      }
      for (let i = 0; i < trail.length; i++) {
        if (blacklist.includes(new URL(trail[i]).hostname)) {
          safe = false;
          fail = i;
          reasons.push(Constants.REASONS.SPOOPY_LINK);
          break;
        }
      }
      console.log(`Scanned ${trail[0]} ... safe=${safe}, fail=${fail}`);
      return { trail, safe, fail, reasons };
    })
    .catch(console.error);
}

process.on('unhandledRejection', console.error);
