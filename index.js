const fs = require('fs');
const http = require('http');
const https = require('https');
const URL = require('./url');
const redirects = require('./redirects');
const { createPromise, promiseResolve } = process.binding('util');

(async function() {

const blacklist = fs.readFileSync('./blacklist')
  .toString().split('\n').filter(x => x);

const indexPromise = createPromise();
https.get('https://raw.githubusercontent.com/devsnek/spoopy.link/gh-pages/404.html', (res) => {
  const chunks = [];
  res.on('data', chunk => chunks.push(chunk));
  res.on('end', () => promiseResolve(indexPromise, Buffer.concat(chunks).toString()));
});
const index = await indexPromise;

const ticks = {
  green: 'https://cdn.discordapp.com/emojis/318902154054205460.png',
  red: 'https://cdn.discordapp.com/emojis/312314733816709120.png',
};

http.ServerResponse.prototype._end = http.ServerResponse.prototype.end;
http.ServerResponse.prototype.end = function(...args) {
  if (args.length === 1 && typeof args[0] === 'number') {
    this.writeHead(args[0]);
    this._end();
  } else if (args.length === 2 && typeof args[0] === 'number' && args[1].constructor === Object) {
    this.writeHead(args[0], { 'Content-Type': 'application/json' });
    this._end(JSON.stringify(args[1]));
  } else if (args[0].constructor === Object) {
    this.writeHead(200, { 'Content-Type': 'application/json' });
    this._end(JSON.stringify(args[0]));
  } else {
    this._end(...args);
  }
};

function getFinal(url) {
  return redirects(url)
    .then((trail) => {
      let safe = trail.length < 5;
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
      return { trail, safe, fail };
    });
}

http.createServer((req, res) => {
  const discord = req.headers['user-agent'].toLowerCase().includes('discordbot');

  if (!req.url.startsWith('/json') && !discord) return res.end(index);

  let suspect = new URL(req.url.replace(/\/(json\/)?/, ''));
  if (!suspect || !suspect.href) return res.end(400, { message: 'invalid url' });
  getFinal(suspect.href)
    .then((output) => {
      if (discord) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`<!DOCTYPE html>
<html>
<head>
<meta property=og:title content="Spoopy.link (${suspect.href})">
<meta property=og:description content="${output.safe ? 'Safe' : 'Unsafe'} link! Trail: ${output.trail.join(' -> ')}">
<meta property=og:image content="${output.safe ? ticks.green : ticks.red}">
<meta property=og:url content="https://spoopy.link/${suspect.href}">
</head>
</html>`);
      } else {
        res.writeHead(200, {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
          'Content-Type': 'application/json',
        });
        res.end(JSON.stringify(output));
      }
      console.log(`Scanned ${suspect.href} ... safe=${output.safe}, fail=${output.fail}`);
    })
    .catch((e) => {
      console.error(e);
      res.end(500);
    });
}).listen(5000);

}());
