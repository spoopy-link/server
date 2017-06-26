const http = require('http');
const URL = require('url').URL;
const redirects = require('./redirects');
const blacklist = require('./blacklist');

http.ServerResponse.prototype.e = function(...args) {
  if (args.length === 1 && typeof args[0] === 'number') {
    this.writeHead(args[0]);
    this.end();
  } else if (args.length === 2 && typeof args[0] === 'number' && args[1].constructor === Object) {
    this.writeHead(args[0], { 'Content-Type': 'application/json' });
    this.end(JSON.stringify(args[1]));
  } else if (args[0].constructor === Object) {
    this.writeHead(200, { 'Content-Type': 'application/json' });
    this.end(JSON.stringify(args[0]));
  }
};

http.createServer((req, res) => {
  let suspect = {};
  try {
    suspect = new URL(req.url.slice(1));
  } catch (err) {
    res.e(400, { message: 'invalid url' });
  }
  if (!suspect.href) return res.e(400, { message: 'invalid url' });
  redirects(suspect.href)
    .then((trail) => {
      let rating = 'safe';
      for (const hmm of trail) {
        if (blacklist.includes(new URL(hmm).hostname)) rating = 'unsafe';
      }
      res.e({ trail, rating });
      console.log(`Scanned ${suspect.href} ... ${rating}`);
    })
    .catch((e) => {
      console.error(e);
      res.e(500);
    });
}).listen(5000);
