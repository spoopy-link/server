const Response = require('./Response');

class Router {
  constructor(server) {
    server.on('request', this.handleRequest.bind(this));
    this.usables = [];
    this.routes = [];
  }

  async handleRequest(req, res) {
    const response = new Response(res);
    await Promise.all(this.usables.map((u) => new Promise((r) => u(req, response, r))));
    for (const route of this.routes.filter((r) => r.method === req.method)) {
      const match = typeof route.route === 'string' ?
        route.route === req.url :
        req.url.match(route.route);
      if (!match) {
        continue;
      }

      if (match !== true) {
        req.match = match;
      }

      route.handler(req, response);
      break;
    }
  }

  use(handler) {
    this.usables.push(handler);
  }
}

for (const method of ['GET', 'POST']) {
  Router.prototype[method.toLowerCase()] = function handle(regex, handler) {
    this.routes.push({
      route: regex,
      handler,
      method,
    });
  };
}

module.exports = Router;
