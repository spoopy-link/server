const fs = require('fs');
const http = require('http');
const URL = require('./url');
const redirects = require('./redirects');

const blacklist = fs.readFileSync('./blacklist')
  .toString().split('\n').filter(x => x);

const index = fs.readFileSync('./index.html');

const ticks = {
  green: 'https://cdn.discordapp.com/emojis/318902154054205460.png',
  red: 'https://cdn.discordapp.com/emojis/318902154054205460.png',
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
  const discord = req.headers['user-agent'].includes('discordbot');

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
        res.end(output);
      }
      console.log(`Scanned ${suspect.href} ... safe=${output.safe}, fail=${output.fail}`);
    })
    .catch((e) => {
      console.error(e);
      res.end(500);
    });
}).listen(5000);
