require('./Response');

class Router {
  constructor(server) {
    server.on('request', this.handleRequest.bind(this));
    this.usables = [];
    this.routes = [];
  }

  async handleRequest(req, res) {
    await Promise.all(this.usables.map(u => new Promise(r => u(req, res, r))));
    for (const route of this.routes.filter(r => r.method === req.method)) {
      const match = typeof route.route === 'string' ?
        route.route === req.url :
        route.route.test(req.url);
      if (!match) continue;
      route.handler(req, res);
      break;
    }
  }

  use(handler) {
    this.usables.push(handler);
  }
}

for (const method of ['GET', 'POST']) {
  Router.prototype[method.toLowerCase()] = function(regex, handler) {
    this.routes.push({
      route: regex,
      handler,
      method,
    });
  };
}

module.exports = Router;
