const http = require('http');
const URL = require('./url');
const redirects = require('./redirects');
const blacklist = require('./blacklist');

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
  let suspect = new URL(req.url.slice(1));
  if (!suspect || !suspect.href) return res.end(400, { message: 'invalid url' });
  redirects(suspect.href)
    .then((trail) => {
      let rating = trail.length < 5 ? 'safe' : 'unsafe';
      if (rating === 'safe') {
        for (const hmm of trail) {
          if (blacklist.includes(new URL(hmm).hostname)) {
            rating = 'unsafe';
            break;
          }
        }
      }
      res.end({ trail, rating });
      console.log(`Scanned ${suspect.href} ... ${rating}`);
    })
    .catch((e) => {
      console.error(e);
      res.end(500);
    });
}).listen(5000);
