require('dotenv').config();
require('promise_util');
const http = require('http');
const Router = require('./server/Router');
const Constants = require('./Constants');
const serializers = require('./serializers');
const querystring = require('querystring');
const webCache = require('./web_cache');
const log = require('./util/logger');
const isSpoopy = require('./util/is_spoopy');

const server = http.createServer();
const router = new Router(server);
router.cache = webCache;

const routes = require('./routes');

router.use((req, res, next) => {
  req.needsOG = Constants.UA_REGEX.test(req.headers['user-agent']);
  res.header('Content-Security-Policy', [
    'default-src \'self\' s.gus.host www.google-analytics.com cdn.rawgit.com',
    'script-src \'self\' \'nonce-inline\' s.gus.host www.google-analytics.com cdn.rawgit.com',
    'img-src \'self\' www.google-analytics.com',
  ].join(';'));
  res.headers({
    'X-XSS-Protection': '1; mode=block',
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
  });
  if (Constants.CORS_ORIGINS.includes(req.headers.origin)) {
    res.headers({
      'Access-Control-Allow-Origin': req.headers.origin,
      'Access-Control-Allow-Methods': '*',
      'Access-Control-Allow-Headers': '*',
    });
  }

  const [path, query] = req.url.split('?');
  req.url = decodeURIComponent(path) || '/';
  req.query = query ? querystring.parse(query) : {};

  const chunks = [];
  req.on('data', (c) => chunks.push(c));
  req.on('end', () => {
    req.body = Buffer.concat(chunks).toString();
    next();
  });
});

router.get('/', (req, res) => {
  res.header('Content-Type', 'text/html; charset=utf-8');
  webCache.get('index').then((t) => res.end(t));
});

routes.static(router);

if (process.env.CACHE_KEY) {
  router.get(`/${process.env.CACHE_KEY}`, (req, res) => {
    webCache.clear();
    res.end('cache cleared :)');
  });
}

routes.slack(router);

router.get(/\/api\/v(.+?)\/.+/, (req, res) => {
  const version = req.match[1];
  const serializer = serializers.api[`v${version}`];
  if (!serializer) {
    res.status(404).header('Content-Type', 'application/json; charset=utf-8');
    res.end({ message: Constants.SERVER_404_MESSAGE });
    return;
  }

  isSpoopy(req.url.replace(`/api/v${version}/`, ''))
    .then((output) => {
      res.header('Content-Type', 'application/json; charset=utf-8');
      res.end(serializer(output));
    })
    .catch((err) => {
      res.header('Content-Type', 'application/json; charset=utf-8');
      res.status(500).end({ error: Constants.SERVER_ERR_MESSAGE });
      log('JSON', err);
    });
});

router.get(/\/api\/.+/, (req, res) => {
  isSpoopy(req.url.replace('/api/', ''))
    .then((output) => {
      res.header('Content-Type', 'application/json; charset=utf-8');
      res.end(serializers.api.current(output));
    })
    .catch((err) => {
      res.header('Content-Type', 'application/json; charset=utf-8');
      res.end({ error: Constants.SERVER_ERR_MESSAGE });
      log('JSON', err);
    });
});

router.get(/\/.+/, (req, res) => {
  if (req.needsOG) {
    isSpoopy(req.url.slice(1))
      .then((output) => {
        res.header('Content-Type', 'text/html; charset=utf-8');
        res.end(serializers.og(output));
      })
      .catch((err) => {
        res.status(500).end(Constants.SERVER_ERR_MESSAGE);
        log('OG', err);
      });
  } else {
    res.header('Content-Type', 'text/html; charset=utf-8');
    webCache.get('spoopy').then((t) => res.end(t));
  }
});

router.get(/.+/, (req, res) => {
  res.status(404).header('Content-Type', 'application/json; charset=utf-8');
  res.end({ message: Constants.SERVER_404_MESSAGE });
});

server.listen(Constants.SERVER_PORT);

process.on('unhandledRejection', log);
