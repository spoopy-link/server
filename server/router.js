require('./Response');

class Router {
  constructor(server) {
    server.on('request', this.handleRequest.bind(this));
    this.usables = [];
    this.routes = [];
  }

  handleRequest(req, res) {
    for (const usable of this.usables) usable(req, res);
    for (const route of this.routes) {
      const match = route.route.test(req.url);
      if (!match) continue;
      route.handler(req, res);
      break;
    }
  }

  use(handler) {
    this.usables.push(handler);
  }

  get(regex, handler) {
    this.routes.push({
      route: regex,
      handler,
    });
  }
}

module.exports = Router;
