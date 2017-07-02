module.exports = function Response(res) {
  const headers = {};
  let code = 200;

  return Object.create({
    header(name, value) {
      headers[name] = value;
      return this;
    },
    headers(obj) {
      for (const [name, value] of Object.entries(obj)) this.header(name, value);
      return this;
    },
    status(c) {
      code = c;
      return this;
    },
    end(body) {
      res.writeHead(code, headers);
      if (typeof body === 'object') body = JSON.stringify(body);
      res.end(body);
    },
  });
};
