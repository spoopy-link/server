const http = require('http');

const end = http.ServerResponse.prototype.end;
http.ServerResponse.prototype.end = function(...args) {
  if (args.length === 1 && typeof args[0] === 'number') {
    this.writeHead(args[0]);
    end.call(this);
  } else if (args.length === 2 && typeof args[0] === 'number' && args[1].constructor === Object) {
    this.writeHead(args[0], { 'Content-Type': 'application/json' });
    end.call(this, JSON.stringify(args[1]));
  } else if (args[0] && args[0].constructor === Object) {
    this.setHeader('Content-Type': 'application/json');
    end.call(this, JSON.stringify(args[0]));
  } else {
    end.call(this, ...args);
  }
};

http.ServerResponse.prototype.status = function(code) {
  this.writeHead(code);
  return this;
};

http.ServerResponse.prototype.setHeaders = function headers(obj) {
  for (const [name, value] of Object.entries(obj)) this.setHeader(name, value);
};
