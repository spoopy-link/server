'use strict';

require('dotenv').config();
const path = require('path');
const fs = require('fs');
const http = require('http');
const WebSocket = require('ws');
const webCache = require('./web_cache');
const follow = require('./follow');
const { UA_BOT_REGEX, CACHE_KEY, STATIC_RE, API_RE } = require('./constants');

const headers = {
  'X-XSS-Protection': '1; mode=block',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
};

const server = http.createServer(async (req, res) => {
  console.log(req.method, req.url);
  try {
    if (req.url === '/') {
      res.writeHead(200, { ...headers, 'Content-Type': 'text/html; charset=utf-8' });
      res.end(await webCache.get('index'));
      return;
    }

    if (STATIC_RE.test(req.url)) {
      const item = await webCache.get(req.url);
      res.writeHead(200, {
        'Content-Type': `${{
          js: 'application/javascript',
          json: 'application/json',
          webapp: 'application/json',
          css: 'text/css',
          xml: 'application/xml',
          txt: 'text/plain',
        }[path.extname(req.url).slice(1)]}; charset=utf-8`,
      });
      res.end(item);
      return;
    }

    if (API_RE.test(req.url)) {
      const [,, noscan, domain] = API_RE.exec(req.url);
      const obj = await follow(domain, undefined, !!noscan);
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(obj));
      return;
    }

    if (CACHE_KEY && req.url === CACHE_KEY) {
      await webCache.clear();
      res.writeHead(200, headers);
      res.end('cache cleared');
      return;
    }

    const openGraph = UA_BOT_REGEX.test(req.headers['user-agent']);
    if (openGraph) {
      res.writeHead(500);
      res.end('500');
    } else {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      const t = await webCache.get('spoopy');
      res.end(t);
    }
  } catch (e) {
    res.writeHead(500);
    res.end(e.message);
    console.error(e);
  }
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws, req) => {
  follow(req.url.slice(1), (link) => {
    ws.send(JSON.stringify(link));
  }).then((o) => {
    ws.send(JSON.stringify(o));
    ws.close();
  }).catch(() => ws.close());
});

const f = '/tmp/spoopy.link.sock';
try {
  fs.unlinkSync(f);
} catch {} // eslint-disable-line no-empty

server.listen(f);

try {
  fs.chmodSync(f, '777');
} catch {} // eslint-disable-line no-empty

const exitHandler = () => {
  server.close();
  process.exit();
};

process.on('exit', exitHandler);
process.on('SIGINT', exitHandler);
