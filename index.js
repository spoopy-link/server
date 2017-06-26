const fs = require('fs');
const http = require('http');
const URL = require('./url');
const redirects = require('./redirects');

const blacklist = fs.readFileSync('./blacklist')
  .toString().split('\n').filter(x => x);

const index = fs.readFileSync('./index.html');

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

http.createServer((req, res) => {
  if (!req.url.startsWith('/json')) return res.end(index);
  let suspect = new URL(req.url.slice(6));
  if (!suspect || !suspect.href) return res.end(400, { message: 'invalid url' });
  redirects(suspect.href)
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
      res.end({ trail, safe, fail });
      console.log(`Scanned ${suspect.href} ... safe=${safe}, fail=${fail}`);
    })
    .catch((e) => {
      console.error(e);
      res.end(500);
    });
}).listen(5000);
