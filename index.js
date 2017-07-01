require('dotenv').config();
require('promise_util');
const fs = require('fs');
const http = require('http');
const URL = require('./util/url');
const redirects = require('./util/redirects');
const request = require('snekfetch');
const Router = require('./server/Router');
const Constants = require('./Constants');
const serializers = require('./serializers');
const querystring = require('querystring');
const webCache = require('./web_cache');
const log = require('./util/logger');

const server = http.createServer();
const router = new Router(server);

router.use((req, res, next) => {
  req.needsOG = Constants.UA_REGEX.test(req.headers['user-agent']);
  res.setHeader('Content-Security-Policy', [
    'default-src \'self\' s.gus.host',
    'script-src \'self\' \'nonce-inline\' www.google-analytics.com cdn.rawgit.com',
    'img-src \'self\' www.google-analytics.com',
  ].join(';'));
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer-when-downgrade');
  if (Constants.CORS_ORIGINS.includes(req.headers.origin)) {
    res.setHeaders({
      'Access-Control-Allow-Origin': req.headers.origin,
      'Access-Control-Allow-Methods': '*',
      'Access-Control-Allow-Headers': '*',
    });
  }

  const [path, query] = req.url.split('?');
  req.url = decodeURIComponent(path) || '/';
  req.query = query ? querystring.parse(query) : {};

  const chunks = [];
  req.on('data', c => chunks.push(c));
  req.on('end', () => {
    req.body = Buffer.concat(chunks).toString();
    next();
  });
});

router.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  webCache.get('index').then(t => res.end(t));
});

router.get(/\/json\/.+/, (req, res) => {
  getFinal(req.url.replace('/json/', ''))
  .then((output) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(serializers.raw(output));
  })
  .catch((err) => {
    res.setHeader('Content-Type', 'application/json');
    res.end({ error: Constants.SERVER_ERR_MESSAGE });
    log('JSON', err);
  });
});

router.get('/slack', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  webCache.get('slack_index').then(t => res.end(t));
});

router.get('/slack/add', (req, res) => {
  const redirect = `https://slack.com/oauth/authorize?${querystring.stringify(Constants.SLACK_OAUTH)}`;
  res.writeHead(302, { Location: redirect });
  res.end();
});

router.get('/slack/callback', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  request.post('https://slack.com/api/oauth.access')
    .query({
      client_id: process.env.SLACK_CLIENT_ID,
      client_secret: process.env.SLACK_CLIENT_SECRET,
      code: req.query.code,
      redirect_uri: Constants.SLACK_OAUTH.redirect_uri,
    })
    .then((r) => {
      const team = r.body.team_name;
      webCache.get('slack_callback').then(t => res.end(team ? t.replace('your team', team) : t));
    })
    .catch((err) => {
      log('SLACK/CALLBACK', err);
      res.end('error lol');
    });
});

router.get('/slack/support', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  webCache.get('slack_support').then(t => res.end(t));
});

router.get('/slack/privacy', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  webCache.get('slack_privacy').then(t => res.end(t));
});

router.post('/slack', (req, res) => {
  const body = querystring.parse(req.body);

  if (body.token !== process.env.SLACK_VERIFICATION) {
    res.status(403).end();
    return;
  }

  getFinal(body.text.replace(/<|>/g, ''))
    .then((output) => {
      res.end(200);
      request.post(body.response_url)
        .send(serializers.slack(output))
        .end();
    })
    .catch((err) => {
      res.status(500).end(Constants.SERVER_ERR_MESSAGE);
      log('SLACK/POST', err);
    });
});

router.get(/\/<?https?.+/, (req, res) => {
  if (req.needsOG) {
    getFinal(req.url.slice(1))
      .then((output) => {
        res.setHeader('Content-Type', 'text/html');
        res.end(serializers.og(output));
      })
      .catch((err) => {
        res.status(500).end(Constants.SERVER_ERR_MESSAGE);
        log('OG', err);
      });
  } else {
    res.setHeader('Content-Type', 'text/html');
    webCache.get('spoopy').then(t => res.end(t));
  }
});

router.get('/main.css', (req, res) => {
  res.setHeader('Content-Type', 'text/css');
  webCache.get('css').then(t => res.end(t));
});

router.get('/main.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  webCache.get('js').then(t => res.end(t));
});

router.get('/keybase.txt', (req, res) => {
  webCache.get('keybase').then(t => res.end(t));
});

if (process.env.CACHE_KEY) {
  router.get(`/${process.env.CACHE_KEY}`, (req, res) => {
    webCache.clear();
    res.end('cache cleared :)');
  });
}

router.get(/.+/, (req, res) => {
  res.status(404).end(Constants.SERVER_404_MESSAGE);
});

server.listen(Constants.SERVER_PORT);

const blacklist = fs.readFileSync('./blacklist.txt')
  .toString().split('\n')
  .filter(x => x);


function getFinal(url) {
  url = url
    // fuck discord
    .replace(/(https?):\/([^/])/, (_, protocol, x) => `${protocol}://${x}`)
    // fuck people who don't understand that `<url>` means just put the url
    .replace(/(^<|>$)/g, '');

  return redirects(url)
    .then((trail) => {
      let reasons = [];
      let safe = true;
      let fail = -1;
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
      log('SCANNED', `${trail[0]}: safe=${safe}, fail=${fail}`);
      return { trail, safe, fail, reasons };
    });
}

process.on('unhandledRejection', console.error);
